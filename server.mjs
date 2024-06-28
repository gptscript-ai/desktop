import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { GPTScript, RunEventType, RunState } from '@gptscript-ai/gptscript';
import dotenv from 'dotenv';

dotenv.config({path: ['.env', '.env.local']});

const ENABLE_CACHE = process.env.ENABLE_CACHE === "true";
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.GPTSCRIPT_PORT || "3000");
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let runningScript = null; // Reference to the currently running script

app.prepare().then(() => {
	const httpServer = createServer(handler);

	const io = new Server(httpServer);
	const gptscript = new GPTScript()

	io.on("connection", (socket) => {
		io.emit("message", "connected");
		socket.on("run", async (file, tool, args, workspace) => {
			setImmediate(() => streamExecFileWithEvents(file, tool, args, workspace, socket, gptscript));
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

const streamExecFileWithEvents = async (file, tool, args, workspace, socket, gptscript) => {
	const opts = {
		input: JSON.stringify(args || {}),
		disableCache: !ENABLE_CACHE,
        workspace: workspace,
		prompt: true,
		confirm: true,
	};

	if (tool) opts.subTool = tool;

	if (runningScript) {
		if (runningScript.state === RunState.Finished || runningScript.state === RunState.Error) {
			socket.emit("error", new Error(`run is in terminal state ${runningScript.state}, cannot continue chat`));
		}
		runningScript.close();
	}

	runningScript = await gptscript.run(file, opts);
	runningScript.on(RunEventType.Event, data => socket.emit('progress', {frame: data, state: runningScript.calls}) );

	// Handle prompt events
	runningScript.on(RunEventType.Prompt, async (data) => socket.emit("promptRequest", {frame: data, state: runningScript.calls}));
	socket.on("promptResponse", async (data) => await gptscript.promptResponse(data));

	// Handle confirm events
	runningScript.on(RunEventType.CallConfirm, (data) => socket.emit("confirmRequest", {frame: data, state: runningScript.calls}));
	socket.on("confirmResponse", async (data) => await gptscript.confirm(data));

    socket.on("interrupt", async() => {
        if (runningScript) runningScript.close();
    });

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