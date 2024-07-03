import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { GPTScript, RunEventType, RunState } from '@gptscript-ai/gptscript';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({path: ['.env', '.env.local']});

const DISABLE_CACHE = process.env.DISABLE_CACHE === "true";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.GPTSCRIPT_PORT || "3000");
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let runningScript = null;

app.prepare().then(() => {
	const httpServer = createServer(handler);

	const io = new Server(httpServer);
	const gptscript = new GPTScript()

	io.on("connection", (socket) => {
		io.emit("message", "connected");
		socket.on("run", async (file, tool, args, workspace, statePath) => {
            if (runningScript) {
                await runningScript.close();
                runningScript = null;
            }
            try {
                dismount(socket);
                await mount(file, tool, args, workspace, socket, statePath, gptscript);
            } catch (e) {
                socket.emit("error", e);
            }
		});
	});

	httpServer
		.once("error", (err) => {
			console.error(err);
			process.exit(1);
		})
		.listen(port, () => {
			console.log(`> Socket server is ready at http://${hostname}:${port}`);
		});
});

const mount = async (file, tool, args, workspace, socket, statePath, gptscript) => {
	const opts = {
		input: JSON.stringify(args || {}),
		disableCache: DISABLE_CACHE,
        workspace: workspace,
		prompt: true,
		confirm: true,
	};

	if (tool) opts.subTool = tool;

    try {
        const state = fs.readFileSync(statePath, 'utf8');
    } catch (e) {}

    // Start the script
    runningScript = await gptscript.run(file, opts)
    socket.emit("running");

    // Handle initial runningScript events
	runningScript.on(RunEventType.Event, data => socket.emit('progress', {frame: data, state: runningScript.calls}));
	runningScript.on(RunEventType.Prompt, async (data) => socket.emit("promptRequest", {frame: data, state: runningScript.calls}));
	runningScript.on(RunEventType.CallConfirm, (data) => socket.emit("confirmRequest", {frame: data, state: runningScript.calls}));
	socket.on("promptResponse", async (data) => await gptscript.promptResponse(data));
	socket.on("confirmResponse", async (data) => await gptscript.confirm(data));
    socket.on("interrupt", async() => { if (runningScript) runningScript.close() });
    socket.on('disconnect', () => { if (runningScript) runningScript.close(); runningScript = null; });

    // Wait for the run to finish and emit any errors that occur. Specifically look for the "Run has been aborted" error
    // as this is a marker of an interrupt.
    runningScript.text()
        .catch((e) => e && e != "Run has been aborted" && socket.emit("error", e))
        .finally(() => {
            if (!runningScript) return;
            let state = runningScript.currentChatState();
            if (statePath) {
                fs.writeFile(statePath, JSON.stringify(state), (err) => {
                    if (err) { socket.emit("error", err)} 
                });
            }
        });

    // If the user sends a message, we continue and setup the next chat's event listeners
    socket.on('userMessage', async (message) => {
        // Remove any previous promptResponse or confirmResponse listeners
        socket.removeAllListeners("promptResponse");
        socket.removeAllListeners("confirmResponse");

        // Start the next chat
        runningScript = runningScript.nextChat(message);

        runningScript.on(RunEventType.Event, data => socket.emit('progress', {frame: data, state: runningScript.calls}));
        runningScript.on(RunEventType.Prompt, async (data) => socket.emit("promptRequest", {frame: data, state: runningScript.calls}));
        runningScript.on(RunEventType.CallConfirm, (data) => socket.emit("confirmRequest", {frame: data, state: runningScript.calls}));
        
        socket.on("promptResponse", async (data) => await gptscript.promptResponse(data));
        socket.on("confirmResponse", async (data) => await gptscript.confirm(data));

        // Wait for the run to finish and emit any errors that occur
        runningScript.text()
            .catch((e) => e && e != "Run has been aborted" && socket.emit("error", e))
            .finally(() => { 
                if (!runningScript) return;
                let state = runningScript.currentChatState();
                if (statePath) {
                    fs.writeFile(statePath, JSON.stringify(state), (err) => {
                        if (err) { socket.emit("error", err)} 
                    });
                }
            });
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