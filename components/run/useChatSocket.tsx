// useChatSocket.ts
import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { CallFrame, Tool, Block } from '@gptscript-ai/gptscript';
import { Message, MessageType } from './messages';
import { data } from 'autoprefixer';

const fetchScript = async (file: string): Promise<Tool> => {
	const response = await fetch(`/api/file/${file}`);
	const script = await response.json() as Block[];
	for (let tool of script) {
		if (tool.type === 'text') continue;
		return tool;
	}
	return {} as Tool;
};

// export interface ChatSocketProps {
// 	immediate?: boolean;
// 	file?: string;
// 	name?: string;
// 	formData?: Record<string, string>;
// }

const useChatSocket = () => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [connected, setConnected] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);
	const messagesRef = useRef(messages);
	const latestBotMessageIndex = useRef<number | null>(null);

	messagesRef.current = messages;

	const handleFullMessage = useCallback((data: string) => {
		if (latestBotMessageIndex.current !== null) {
			// setMessages((prevMessages) => {
			// 	const updatedMessages = [...prevMessages];
			// 	updatedMessages[latestBotMessageIndex.current!] = {
			// 	type: MessageType.Bot,
			// 	message: data,
			// 	};
			// 	return updatedMessages;
			// });
			latestBotMessageIndex.current = null;
		} else {
			// setMessages((prevMessages) => [
			// 	...prevMessages,
			// 	{ type: MessageType.Bot, message: data },
			// ]);
		}
	}, []);

	const handlePartialMessage = useCallback((data: CallFrame) => {
		const message = data.output && data.output.length > 0 && !data.parentID && !data.output[data.output.length - 1].subCalls ? data.output[data.output.length -1].content || "" : ""
		if (message.startsWith("<tool call>") || !message) return;
		if (latestBotMessageIndex.current === null) {
			latestBotMessageIndex.current = messagesRef.current.length;
			setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages];
				updatedMessages.push({ type: MessageType.Bot, message: message });
				return updatedMessages;
			});
		} else {
			setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages];
				updatedMessages[latestBotMessageIndex.current!] = {
					type: MessageType.Bot,
					message: message,
				};
				return updatedMessages;
			});
		}
	}, []);

	useEffect(() => {
		const socket = io();

		socket.on("connect", () => {
			setConnected(true);
		});

		socket.on("scriptMessage", (data) => { handleFullMessage(data) });

		socket.on("progress", (data: CallFrame) => handlePartialMessage(data));
		socket.on("progress", (data) => console.log(data));

		socket.on("disconnect", () => {
			setConnected(false);
		});

		setSocket(socket);

		return () => {
			setSocket(null);
			socket.disconnect();
		};
	}, [handleFullMessage, handlePartialMessage]);

	return { socket, setSocket, connected, setConnected, messages, setMessages };
};

export default useChatSocket;