import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { CallFrame, PromptFrame, PromptResponse, AuthResponse} from '@gptscript-ai/gptscript';
import { Message, MessageType } from './messages';
import PromptForm from './messages/promptForm';
import ConfirmForm from './messages/confirmForm';
import { Code } from '@nextui-org/react';

const useChatSocket = () => {
	// State
	const [socket, setSocket] = useState<Socket | null>(null);
	const [connected, setConnected] = useState(false);
	const [messages, setMessages] = useState<Message[]>([]);

	// Refs
	const socketRef = useRef<Socket | null>(null);
	const messagesRef = useRef(messages);
	const latestBotMessageIndex = useRef<number | null>(null);
	const trustedRef = useRef<Record<string, boolean>>({});

	// update the refs
	useEffect(() => { messagesRef.current = messages }, [messages]);
	useEffect(() => { socketRef.current = socket }, [socket]);
	
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
	const handleProgress = useCallback(({frame, state}: {frame: CallFrame, state: Record<string, CallFrame>}) => {
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

	const handlePromptRequest = useCallback((prompt: PromptFrame) => {
		setMessages((prevMessages) => {
			const updatedMessages = [...prevMessages];
			const form = (
				<PromptForm 
					frame={prompt} 
					onSubmit={(response: PromptResponse) => { 
						socketRef.current?.emit("promptResponse", response) 
					}}
				/>
			);

			if (latestBotMessageIndex.current !== null) {
				// Update the message content
				updatedMessages[latestBotMessageIndex.current].message = prompt.message;
				updatedMessages[latestBotMessageIndex.current].component = form
			} else {
				// If there are no previous messages, create a new message
				updatedMessages.push({ type: MessageType.Bot, message: prompt.message, component: form });
			}
			return updatedMessages;
		});
	}, []);

	const handleConfirmRequest = useCallback((frame: CallFrame) => {
		if (!frame.tool) return;

		if (alreadyAllowed(frame)) {
			socketRef.current?.emit("confirmResponse", { id: frame.id, accept: true});
			return;
		}

		setMessages((prevMessages) => {
			const updatedMessages = [...prevMessages];

			// Set the default confirm message
			let confirmMessage = `Proceed with running the following?` +
				"\`\`\`"+
				`**Description**: ${frame.tool?.description}\n\n` +
				`**Interpreter**: ${frame.tool?.name}\n\n` +
				`**Input**: ${frame.input}` +
				'\n\n---';
			
			// Build up the command to be displayed into a code component
			let command = <></>
			if (frame.displayText) {
				command = (<Code className="ml-4">
					{frame.displayText.startsWith("Running") ? 
						frame.displayText.replace("Running", "").replace(/`/g, "") : 
						frame.displayText.replace(/`/g, "")
					}
				</Code>);
				const tool = frame.tool?.name.replace('sys.', '')
				confirmMessage = `Proceed with running the following (or allow all **${tool}** calls)?`
			}

			// Build up the form to allow the user to decide
			const form = (<>
				{command}
				<ConfirmForm
					id={frame.id}
					tool={frame.tool!.name}
					addTrusted={() => { trustedRef.current[frame.tool!.name] = true}}
					onSubmit={(response: AuthResponse) => { 
						socketRef.current?.emit("confirmResponse", response) 
					}}
				/>
			</>);

		    // Handle setting the message
			if (latestBotMessageIndex.current !== null) {
				updatedMessages[latestBotMessageIndex.current].component = form;
				updatedMessages[latestBotMessageIndex.current].message = confirmMessage;
			} else {
				updatedMessages.push({ 
					type: MessageType.Bot, 
					message: confirmMessage,
					component: form 
				});
			}
			return updatedMessages;
		});
	}, []);

	const parseToolCall = (toolCall: string): {tool: string, params: string} => {
		const [tool, params] = toolCall.replace('<tool call> ', '').split(' -> ');
		return { tool, params };
	}

	const alreadyAllowed = (frame: CallFrame): boolean => {
		if (!frame.tool) return false;
		
		// Check if the tool has already been allowed
		if (trustedRef.current[frame.tool.name]) return true;

		const trustedRepoPrefixes = [
			"github.com/gptscript-ai/context",
		];
		
		// If this tool have a source repo, check if it is trusted. If it isn't already,
		// return false since we need to ask the user for permission.
		if (frame.tool.source.repo) {
			const repo = (frame.tool?.source.repo as any).Root;
			const trimmedRepo = repo.replace("https://", "").replace("http://", "");
			for (const prefix of trustedRepoPrefixes) {
				if (trimmedRepo.startsWith(prefix)) {
					return true;
				}
			}
			return false
		}

		// If the tool is a system tool and wasn't already trusted, return false.
		if (frame.tool.name.startsWith("sys.")) return false;

		// Automatically allow all other tools
		return true;
	}

	useEffect(() => {
		const socket = io();

		socket.on("connect", () => setConnected(true));
		socket.on("disconnect", () => setConnected(false));
		socket.on("progress", (data: {frame: CallFrame, state: any}) => handleProgress(data));
		socket.on("error", (data: string) => handleError(data));
		socket.on("botMessage", (data) => { handleBotMessage(data) });
		socket.on("promptRequest", (data: PromptFrame) => { handlePromptRequest(data) });
		socket.on("confirmRequest", (data: CallFrame) => { handleConfirmRequest(data) });

		setSocket(socket);

		return () => {
			socket.off("connect");
			socket.off("disconnect")
			socket.off("progress");
			socket.off("error");
			socket.off("botMessage");
			socket.off("promptRequest");
			socket.off("confirmRequest");
			socket.disconnect();
		};
	}, []);

	return { socket, setSocket, connected, setConnected, messages, setMessages };
};

export default useChatSocket;