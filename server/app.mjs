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
                socket.on("run", async (file, tool, args, workspace, threadID) => {
                    if (runningScript) {
                        await runningScript.close();
                        runningScript = null;
                    }
                    try {
                        dismount(socket);
                        await mount(file, tool, args, workspace, socket, threadID, gptscript);
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

const mount = async (file, tool, args, workspace, socket, threadID, gptscript) => {
    const opts = {
        input: JSON.stringify(args || {}),
        disableCache: DISABLE_CACHE,
        workspace: workspace,
        prompt: true,
        confirm: true,
    };

    if (tool) opts.subTool = tool;

    let state = {};
    let statePath = '';
    let THREADS_DIR = process.env.THREADS_DIR
    if (!THREADS_DIR) THREADS_DIR = path.join(workspace, "threads");
    if (threadID) statePath = path.join(THREADS_DIR, threadID, STATE_FILE);
    try {
        state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
        if (state && state.chatState) {
            opts.chatState = state.chatState;
            socket.emit("loaded", state.messages);
        }
    } catch (e) {
    }

    socket.on("interrupt", async () => {
        if (runningScript) runningScript.close();
    });
    socket.on('disconnect', () => {
        if (runningScript) runningScript.close();
        runningScript = null;
    });

    if (!threadID || !state.chatState) {
        runningScript = await gptscript.run(file, opts);
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

        runningScript.text()
            .then((output) => {
                if (!runningScript) return;

                if (!state.messages) state.messages = [];
                state.messages.push({type: AGENT, message: output});
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

    } else {
        socket.emit("running"); // temp
        socket.emit("resuming");
    }

    socket.on('userMessage', async (message, newThreadId) => {
        if (newThreadId) {
            threadID = newThreadId;
            statePath = path.join(THREADS_DIR, threadID, STATE_FILE);
        }

        socket.removeAllListeners("promptResponse");
        socket.removeAllListeners("confirmResponse");

        if (!runningScript) {
            opts.input = message;
            runningScript = await gptscript.run(file, opts);
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

        runningScript.text()
            .then((output) => {
                if (!runningScript) return;
                if (!state.messages) state.messages.push(
                    {type: USER, message: message},
                    {type: AGENT, message: output}
                );

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
};

// Function to dismount listeners
const dismount = (socket) => {
    socket.removeAllListeners("promptResponse");
    socket.removeAllListeners("confirmResponse");
    socket.removeAllListeners("userMessage");
    socket.removeAllListeners("disconnect");
};
