import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { Client, RunEventType, RunState } from '@gptscript-ai/gptscript';
import path from 'path';

const SCRIPTS_PATH = process.env.SCRIPTS_PATH || "gptscripts"
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

let runningScript = null; // Reference to the currently running script

app.prepare().then(() => {
	const httpServer = createServer(handler);

	const io = new Server(httpServer);
	const gptscript = new Client()

	io.on("connection", (socket) => {
		io.emit("message", "connected");
		socket.on("run", async (file, tool, args) => {
			setImmediate(() => streamExecFileWithEvents(file, tool, args, socket, gptscript));
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

const streamExecFileWithEvents = async (file, tool, args, socket, gptscript) => {
	const opts = {input: JSON.stringify(args || {})};
	if (tool) opts.subTool = tool;

	if (runningScript) {
		if (runningScript.state === RunState.Finished || runningScript.state === RunState.Error) {
			socket.emit("error", new Error(`run is in terminal state ${runningScript.state}, cannot continue chat`));
		}
		runningScript.close();
	}

	runningScript = gptscript.run(path.join(SCRIPTS_PATH, file), opts);
	runningScript.on(RunEventType.Event, data => {
		if (data.type === "callProgress"){
			socket.emit('progress', data);
		} else {
			socket.emit('state', {calls:runningScript.calls});
		}
	});

	try {
		socket.emit('scriptMessage', await runningScript.text());
		socket.on('disconnect', () => {
			runningScript.close();
			runningScript = null;
		});

		socket.on('userMessage', async (message) => {
			if (runningScript) {
				if (runningScript.state === RunState.Finished || runningScript.state === RunState.Error) {
					socket.emit(
						"scriptMessage", 
						`This chat session is in a terminal state ${runningScript.state}, you cannot continue chat. Please start a new chat session.`
					);
					return;
				}
			}
			runningScript = runningScript.nextChat(message);
			runningScript.on(RunEventType.Event, data => {
				socket.emit('progress', data);
			});
			try {
				socket.emit('scriptMessage', await runningScript.text());
			} catch (e) {
				socket.emit('error', e);
				console.log(JSON.stringify(e));
			}
		});
	} catch (e) {
		socket.emit('error', e);
		console.error(e);
	}
}