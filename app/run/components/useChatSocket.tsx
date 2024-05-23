// useChatSocket.ts
import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { CallProgressFrame, Tool, Block } from '@gptscript-ai/gptscript';
import { Message, MessageType } from './messages';

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
			setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages];
				updatedMessages[latestBotMessageIndex.current!] = {
				type: MessageType.Bot,
				message: data,
				};
				return updatedMessages;
			});
			latestBotMessageIndex.current = null;
		} else {
			setMessages((prevMessages) => [
				...prevMessages,
				{ type: MessageType.Bot, message: data },
			]);
		}
	}, []);

	const handlePartialMessage = useCallback((data: CallProgressFrame) => {
		if (latestBotMessageIndex.current === null) {
			latestBotMessageIndex.current = messagesRef.current.length;
			setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages];
				updatedMessages.push({ type: MessageType.Bot, message: data.content });
				return updatedMessages;
			});
		} else {
			setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages];
				updatedMessages[latestBotMessageIndex.current!] = {
				type: MessageType.Bot,
				message: data.content,
				};
				return updatedMessages;
			});
		}
	}, []);

	useEffect(() => {
		const socket = io();

		socket.on("connect", () => {
			setConnected(true);
			// if (immediate) socket?.emit("run", file, name, formData)
		});

		socket.on("scriptMessage", (data) => { handleFullMessage(data) });

		socket.on("progress", (data: CallProgressFrame) => handlePartialMessage(data));

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