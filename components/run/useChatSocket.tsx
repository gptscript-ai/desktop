// useChatSocket.ts
import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { CallFrame, RunFrame, Tool, Block } from '@gptscript-ai/gptscript';
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

	// handles the situation where the full bot message when received (i.e runningScript.text() output).
	const handleBotMessage = useCallback((_: string) => {
		if (latestBotMessageIndex.current !== null) {
			latestBotMessageIndex.current = null;
		}
	}, []);

	// handles progress being recieved from the server (callProgress style frames).
	const handleProgress = useCallback((data: CallFrame) => {
		const isMainContent = data.output && 
			data.output.length > 0 &&
			(!data.parentID || data.tool?.chat) &&
			!data.output[data.output.length - 1].subCalls
		const content = isMainContent ? data.output[data.output.length -1].content || "" : ""
		if (!content || content.startsWith('<tool call>')) return;
		
		let message: Message = { type: MessageType.Bot, message: content };
		// if (content.startsWith("<tool call>")) {
		// 	if (!message.toolCalls) message.toolCalls = {};
		// 	message.toolCalls[data.id] = { type: MessageType.Bot, message: content};
		// 	return;
		// }

		if (latestBotMessageIndex.current === null) {
			latestBotMessageIndex.current = messagesRef.current.length;
			setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages];
				updatedMessages.push(message);
				return updatedMessages;
			});
		} else {
			setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages];
				updatedMessages[latestBotMessageIndex.current!] = message;
				return updatedMessages;
			});
		}
	}, []);

	useEffect(() => {
		const socket = io();

		socket.on("connect", () => {
			setConnected(true);
		});

		socket.on("botMessage", (data) => { handleBotMessage(data) });
		socket.on("botMessage", (data) => console.log(data));
		socket.on("progress", (data: CallFrame) => handleProgress(data));
		socket.on("progress", (data) => console.log(data));

		socket.on("disconnect", () => {
			setConnected(false);
		});

		setSocket(socket);

		return () => {
			setSocket(null);
			socket.disconnect();
		};
	}, [handleBotMessage, handleProgress]);

	return { socket, setSocket, connected, setConnected, messages, setMessages };
};

export default useChatSocket;