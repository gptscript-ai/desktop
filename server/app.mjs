import {createServer} from "http";
import next from "next";
import nextConfig from "../next.config.js"
import {Server} from "socket.io";
import {GPTScript, RunEventType} from "@gptscript-ai/gptscript";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config({path: ['../.env', '../.env.local']});

const AGENT = 1;
const USER = 2;
const STATE_FILE = "state.json";
const DISABLE_CACHE = process.env.DISABLE_CACHE === "true";
let runningScript = null;
let serverRunning = false;

export const startAppServer = ({dev, hostname, port, dir}) => {
    const address = `http://${hostname}:${port ?? 3000}`

    return new Promise((resolve, reject) => {
        if (serverRunning) {
            console.log(`server already running at ${address}`)
            return resolve(address);
        }

        const app = next({
            dev: dev,
            hostname: hostname,
            port: port,
            conf: nextConfig,
            dir: dir,
            customServer: true,
        });
        const handler = app.getRequestHandler();

        app.prepare().then(() => {
            const httpServer = createServer(handler);
            const io = new Server(httpServer);
            const gptscript = new GPTScript();

            io.on("connection", (socket) => {
                io.emit("message", "connected");
                socket.on("run", async (file, tool, args, scriptWorkspace, threadID) => {
                    if (runningScript) {
                        await runningScript.close();
                        runningScript = null;
                    }
                    try {
                        dismount(socket);
                        await mount(file, tool, args, scriptWorkspace, socket, threadID, gptscript);
                    } catch (e) {
                        socket.emit("error", e);
                    }
                });
            });

            httpServer.once("error", (err) => {
                reject(err);
            });

            httpServer.listen(port, () => {
                serverRunning = true;
                console.log(`> Server is ready at ${address}`);
                resolve(address);
            });
        }).catch((err) => {
            reject(err);
        });
    });
};

const mount = async (file, tool, args, scriptWorkspace, socket, threadID, gptscript) => {
    const WORKSPACE_DIR = process.env.WORKSPACE_DIR ?? process.env.GPTSCRIPT_WORKSPACE_DIR;
    const THREADS_DIR = process.env.THREADS_DIR ?? path.join(WORKSPACE_DIR, "threads");

    const opts = {
        input: JSON.stringify(args || {}),
        disableCache: DISABLE_CACHE,
        workspace: scriptWorkspace,
        prompt: true,
        confirm: true,
    };
    
    if (tool) opts.subTool = tool;
    
    let state = {};
    let statePath = '';
    if (threadID) statePath = path.join(THREADS_DIR, threadID, STATE_FILE);
    try {
        state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        if (state && state.chatState) {
            opts.chatState = state.chatState;
            socket.emit("loaded", state.messages);
        }
    } catch (e) {
    }

    // Start the script
    let runningScript = null;
    socket.on("interrupt", async () => {
        if (runningScript) runningScript.close();
    });
    socket.on('disconnect', () => {
        if (runningScript) runningScript.close();
        runningScript = null;
    });

    if (!threadID || !state.chatState) {
        runningScript = await gptscript.evaluate(file, opts)
        socket.emit("running");

        runningScript.on(RunEventType.Event, (data) => socket.emit('progress', {
            frame: data,
            state: runningScript.calls
        }));
        runningScript.on(RunEventType.Prompt, async (data) => socket.emit("promptRequest", {
            frame: data,
            state: runningScript.calls
        }));
        runningScript.on(RunEventType.CallConfirm, (data) => socket.emit("confirmRequest", {
            frame: data,
            state: runningScript.calls
        }));
        socket.on("promptResponse", async (data) => await gptscript.promptResponse(data));
        socket.on("confirmResponse", async (data) => await gptscript.confirm(data));

        // Wait for the run to finish and emit any errors that occur. Specifically look for the "Run has been aborted" error
        // as this is a marker of an interrupt.
        runningScript.text()
            .then((output) => {
                if (!runningScript) return;

                if (!state.messages) state.messages = [];
                state.messages.push({type: AGENT, message: output});
                state.chatState = runningScript.currentChatState();

                if (threadID) {
                    fs.writeFile(statePath, JSON.stringify(state), (err) => {
                        if (err) {
                            socket.emit("error", err)
                        }
                    });
                }
            })
            .catch((e) => e && e != "Run has been aborted" && socket.emit("error", e))

    } else {
        socket.emit("running"); // temp
        socket.emit("resuming");
    }

    // If the user sends a message, we continue and setup the next chat's event listeners
    socket.on('userMessage', async (message, newThreadId) => {
        if (newThreadId) {
            threadID = newThreadId;
            statePath = path.join(THREADS_DIR, threadID, STATE_FILE);
        }

        // Remove any previous promptResponse or confirmResponse listeners
        socket.removeAllListeners("promptResponse");
        socket.removeAllListeners("confirmResponse");

        // If there is not a running script, that means we're loading a thread and have been waiting
        // for the user to send a message.
        if (!runningScript) {
            opts.input = message;
            runningScript = await gptscript.evaluate(file, opts);
        } else {
            runningScript = runningScript.nextChat(message);
        }

        runningScript.on(RunEventType.Event, (data) => socket.emit('progress', {
            frame: data,
            state: runningScript.calls
        }));
        runningScript.on(RunEventType.Prompt, async (data) => socket.emit("promptRequest", {
            frame: data,
            state: runningScript.calls
        }));
        runningScript.on(RunEventType.CallConfirm, (data) => socket.emit("confirmRequest", {
            frame: data,
            state: runningScript.calls
        }));
        socket.on("promptResponse", async (data) => await gptscript.promptResponse(data));
        socket.on("confirmResponse", async (data) => await gptscript.confirm(data));

        // Wait for the run to finish and emit any errors that occur
        runningScript.text()
            .then((output) => {
                if (!runningScript) return;
                if (!state.messages) state.messages = [];
                state.messages.push(
                    {type: USER, message: message},
                    {type: AGENT, message: output}
                )

                state.chatState = runningScript.currentChatState();

                if (threadID) {
                    fs.writeFile(statePath, JSON.stringify(state), (err) => {
                        if (err) {
                            socket.emit("error", err);
                        }
                    });
                }
            })
            .catch((e) => e && e != "Run has been aborted" && socket.emit("error", e));
    });

}

// Only one script is allowed to run at a time in this system. This function is to dismount and
// previously mounted listeners.
const dismount = (socket) => {
    socket.removeAllListeners("promptResponse");
    socket.removeAllListeners("confirmResponse");
    socket.removeAllListeners("userMessage");
    socket.removeAllListeners("disconnect");
}