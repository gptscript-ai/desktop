import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { GPTScript, RunEventType, RunState } from '@gptscript-ai/gptscript';
import dotenv from 'dotenv';

dotenv.config({path: ['.env', '.env.local']});

const DISABLE_CACHE = process.env.DISABLE_CACHE === "true";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.GPTSCRIPT_PORT || "3000");
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
	const httpServer = createServer(handler);

	const io = new Server(httpServer);
	const gptscript = new GPTScript()

	io.on("connection", (socket) => {
		io.emit("message", "connected");
		socket.on("run", async (file, tool, args, workspace) => {
            await dismount(socket);
            await mount(file, tool, args, workspace, socket, gptscript);
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

const mount = async (file, tool, args, workspace, socket, gptscript) => {
	const opts = {
		input: JSON.stringify(args || {}),
		disableCache: DISABLE_CACHE,
        workspace: workspace,
		prompt: true,
		confirm: true,
	};

	if (tool) opts.subTool = tool;

	let runningScript = await gptscript.run(file, opts);
	runningScript.on(RunEventType.Event, data => socket.emit('progress', {frame: data, state: runningScript.calls}));

	// Handle prompt events
	runningScript.on(RunEventType.Prompt, async (data) => socket.emit("promptRequest", {frame: data, state: runningScript.calls}));
	socket.on("promptResponse", async (data) => await gptscript.promptResponse(data));

	// Handle confirm events
	runningScript.on(RunEventType.CallConfirm, (data) => socket.emit("confirmRequest", {frame: data, state: runningScript.calls}));
	socket.on("confirmResponse", async (data) => await gptscript.confirm(data));

    socket.on("interrupt", async() => { if (runningScript) runningScript.close() });

	try {
		socket.on('disconnect', () => {
			if (runningScript) runningScript.close();
			runningScript = null;
		});

		socket.on('userMessage', async (message) => {
			// Remove any previous promptResponse or confirmResponse listeners
			socket.removeAllListeners("promptResponse");
			socket.removeAllListeners("confirmResponse");

			// Start the next chat
			runningScript = runningScript.nextChat(message);
			runningScript.on(RunEventType.Event, data => socket.emit('progress', {frame: data, state: runningScript.calls}));

			// Handle prompt events
			runningScript.on(RunEventType.Prompt, async (data) => socket.emit("promptRequest", {frame: data, state: runningScript.calls}));
			socket.on("promptResponse", async (data) => await gptscript.promptResponse(data));

			// Handle confirm events
			runningScript.on(RunEventType.CallConfirm, (data) => socket.emit("confirmRequest", {frame: data, state: runningScript.calls}));
			socket.on("confirmResponse", async (data) => await gptscript.confirm(data));
		});
	} catch (e) {
		socket.emit('error', e);
		console.error(e);
	}
}

// Only one script is allowed to run at a time in this system. This function is to dismount and
// previously mounted listeners.
const dismount = async (socket) => {
    socket.removeAllListeners("promptResponse");
    socket.removeAllListeners("confirmResponse");
    socket.removeAllListeners("userMessage");
    socket.removeAllListeners("disconnect");
}