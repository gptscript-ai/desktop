import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { Client, RunEventType, RunState } from '@gptscript-ai/gptscript';
import path from 'path';

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

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

	console.log('Running', file, opts, args)
    let exec = gptscript.run(path.join('gptscripts', file), opts);

    exec.on(RunEventType.Event, data => {
        socket.emit('event', data);
    });

	try {
		socket.emit('scriptMessage', await exec.text());
		socket.on('disconnect', () => exec.close());

		socket.on('userMessage', async (message) => {
			exec = exec.nextChat(message);
			exec.on(RunEventType.Event, data => {
				socket.emit('event', data);
			});
			socket.emit('scriptMessage', await exec.text());
		});

		// Async the chatLoop to prevent halting execution
		const chatLoop = async () => { 
			while (exec.state === RunState.Continue) {
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		};
		chatLoop().catch(console.error);
	} catch (e) {
		console.error(e);
	}
}
