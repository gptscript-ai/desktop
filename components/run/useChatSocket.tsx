// useChatSocket.ts
import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { CallFrame } from '@gptscript-ai/gptscript';
import { Message, MessageType } from './messages';

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

	const handleError = useCallback((error: string) => {
		setMessages((prevMessages) => {
			const updatedMessages = [...prevMessages];
			if (latestBotMessageIndex.current !== null) {
				// Append the error to the latest message
				updatedMessages[latestBotMessageIndex.current].error = `${error}`
			} else {
				// If there are no previous messages, create a new error message
				updatedMessages.push({ type: MessageType.Bot, message: "An error occured before the first message.", error: error });
			}
			return updatedMessages;
		});
	}, []);

	// handles progress being recieved from the server (callProgress style frames).
	const handleProgress = useCallback(({frame, state}: {frame: CallFrame, state: CallFrame[]}) => {
		const isMainContent = frame.output && 
			frame.output.length > 0 &&
			(!frame.parentID || frame.tool?.chat) &&
			!frame.output[frame.output.length - 1].subCalls
		
		let content = isMainContent ? frame.output[frame.output.length -1].content || "" : ""
		if (!content) return;
		if ( content === "Waiting for model response..." &&
			latestBotMessageIndex.current !== null &&
			messagesRef.current[latestBotMessageIndex.current].message
		) return;

		if (content.startsWith('<tool call>')) {
			const parsedToolCall = parseToolCall(content);
			content = `Calling tool ${parsedToolCall.tool}...`;
		}
		
		let message: Message = { type: MessageType.Bot, message: content, calls: state };
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

	const parseToolCall = (toolCall: string): {tool: string, params: string} => {
		const [tool, params] = toolCall.replace('<tool call> ', '').split(' -> ');
		return { tool, params };
	}

	useEffect(() => {
		const socket = io();

		socket.on("connect", () => {
			setConnected(true);
		});

		socket.on("progress", (data: {frame: CallFrame, state: any}) => handleProgress(data));
		socket.on("error", (data: string) => handleError(data));
		socket.on("botMessage", (data) => { handleBotMessage(data) });

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