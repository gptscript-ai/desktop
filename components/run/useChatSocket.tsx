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
	const trustedRepoPrefixesRef = useRef<string[]>(["github.com/gptscript-ai/context"]);

	// update the refs as the state changes
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
		
		let message: Message = { type: MessageType.Bot, message: content, calls: state, name: frame.tool?.name };
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
				updatedMessages[latestBotMessageIndex.current].component = form;
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

		let confirmMessage = `Proceed with calling the ${frame.tool.name} tool?`;
		let command = <></>
		if (frame.displayText) {
			command = (
				<Code className="ml-4">
					{frame.displayText.startsWith("Running") ? 
						frame.displayText.replace("Running", "").replace(/`/g, "") : 
						frame.displayText.replace(/`/g, "")
					}
				</Code>
			);

			const tool = frame.tool?.name?.replace('sys.', '')
			confirmMessage = frame.tool?.source.repo ? 
				`Proceed with running the following (or allow all calls from the **${trimRepo(frame.tool?.source.repo!.Root)}** repo)?` :
				`Proceed with running the following (or allow all **${tool}** calls)?`
		}

		const form = (
			<>
				{command}
				<ConfirmForm
					id={frame.id}
					tool={frame.tool!.name}
					addTrusted={addTrustedFor(frame)}
					onSubmit={(response: AuthResponse) => {
						socketRef.current?.emit("confirmResponse", response) 
					}}
				/>
			</>
		);

		setMessages((prevMessages) => {
			const updatedMessages = [...prevMessages];
			if (latestBotMessageIndex.current !== null) {
				updatedMessages[latestBotMessageIndex.current].component = form;
				updatedMessages[latestBotMessageIndex.current].message = confirmMessage;
				updatedMessages[latestBotMessageIndex.current].name = frame.tool?.name;
			} else {
				updatedMessages.push({ 
					type: MessageType.Bot, 
					message: confirmMessage,
					component: form,
					name: frame.tool?.name
				});
			}
			return updatedMessages;
		});
	}, []);

	const parseToolCall = (toolCall: string): {tool: string, params: string} => {
		const [tool, params] = toolCall.replace('<tool call> ', '').split(' -> ');
		return { tool, params };
	}

	const trimRepo = (repo: string): string => {
		return repo.replace("https://", "").replace("http://", "").replace(".git", "");
	}

	const alreadyAllowed = (frame: CallFrame): boolean => {
		if (!frame.tool) return false;
		
		// Check if the tool has already been allowed
		if (trustedRef.current[frame.tool.name]) return true;
		
		// If this tool have a source repo, check if it is trusted. If it isn't already,
		// return false since we need to ask the user for permission.
		if (frame.tool.source.repo) {
			const repo = frame.tool?.source.repo.Root;
			const trimmedRepo = trimRepo(repo);
			for (const prefix of trustedRepoPrefixesRef.current) {
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

	const addTrustedFor = (frame: CallFrame) => {
		if (!frame.tool) return () => {};

		return frame.tool.source.repo ? 
			() => {
				const repo = frame.tool!.source.repo!.Root;
				const trimmedRepo = trimRepo(repo);
				trustedRepoPrefixesRef.current.push(trimmedRepo);
			} :
			() => {
				trustedRef.current[frame.tool!.name] = true;
			}
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