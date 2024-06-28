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
	const [generating, setGenerating] = useState(false);

	// Refs
	const socketRef = useRef<Socket | null>(null);
	const messagesRef = useRef(messages);
	const latestBotMessageIndex = useRef<number>(-1);
	const trustedRef = useRef<Record<string, boolean>>({});
	const trustedRepoPrefixesRef = useRef<string[]>(["github.com/gptscript-ai/context"]);

	// update the refs as the state changes
	useEffect(() => { messagesRef.current = messages }, [messages]);
	useEffect(() => { socketRef.current = socket }, [socket]);

	const handleError = useCallback((error: string) => {
		setMessages((prevMessages) => {
			const updatedMessages = [...prevMessages];
			if (latestBotMessageIndex.current !== -1) {
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
		setGenerating(true);
		if ( content === "Waiting for model response..." &&
			latestBotMessageIndex.current !== -1 &&
			messagesRef.current[latestBotMessageIndex.current]?.message
		) return;

		if (content.startsWith('<tool call>')) {
			const parsedToolCall = parseToolCall(content);
			content = `Calling tool ${parsedToolCall.tool}...`;
		}

		let message: Message = { type: MessageType.Bot, message: content, calls: state, name: frame.tool?.name };
		if (latestBotMessageIndex.current === -1) {
			latestBotMessageIndex.current = messagesRef.current.length;
			setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages];
				updatedMessages.push(message);
				return updatedMessages;
			});
		} else {
			setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages];
				if (latestBotMessageIndex.current !== -1) {
					updatedMessages[latestBotMessageIndex.current] = message;
				} else {
					updatedMessages[messagesRef.current.length - 1] = message;
				}
				return updatedMessages;
			});
		}

		if (isMainContent && frame.type == "callFinish") {
			setGenerating(false);
			latestBotMessageIndex.current = -1
		}
	}, []);

	const handlePromptRequest = useCallback(({frame, state}: {frame: PromptFrame, state: Record<string, CallFrame>}) => {
		setMessages((prevMessages) => {
			const updatedMessages = [...prevMessages];
			const form = (
				<PromptForm 
					frame={frame} 
					onSubmit={(response: PromptResponse) => { 
						socketRef.current?.emit("promptResponse", response) 
					}}
				/>
			);

			if (latestBotMessageIndex.current !== -1) {
				// Update the message content
				updatedMessages[latestBotMessageIndex.current].message = frame.message;
				updatedMessages[latestBotMessageIndex.current].component = form;
                updatedMessages[latestBotMessageIndex.current].calls = state;
			} else {
				// If there are no previous messages, create a new message
				updatedMessages.push({ type: MessageType.Bot, message: frame.message, component: form, calls: state});
			}
			return updatedMessages;
		});
	}, []);

	const handleConfirmRequest = useCallback(({frame, state}: {frame: CallFrame, state: Record<string, CallFrame>}) => {
		if (!frame.tool) return;

		if (alreadyAllowed(frame)) {
			socketRef.current?.emit("confirmResponse", { id: frame.id, accept: true});
			return;
		}

		let confirmMessage = `Proceed with calling the ${frame.tool.name} tool?`;
		if (frame.displayText) {
			const tool = frame.tool?.name?.replace('sys.', '')
			confirmMessage = frame.tool?.source?.repo ? 
				`Proceed with running the following (or allow all calls from the **${trimRepo(frame.tool?.source.repo!.Root)}** repo)?` :
				`Proceed with running the following (or allow all **${tool}** calls)?`
		}

		const form = (
            <ConfirmForm
                id={frame.id}
                message={confirmMessage}
                command={frame.displayText}
                tool={frame.tool?.name || "main"}
                addTrusted={addTrustedFor(frame)}
                onSubmit={(response: AuthResponse) => {
                    socketRef.current?.emit("confirmResponse", response)
                }}
            />
        );

		let message: Message = { type: MessageType.Bot, name: frame.tool?.name, component: form, calls: state};
		if (latestBotMessageIndex.current === -1) {
			latestBotMessageIndex.current = messagesRef.current.length;
			setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages];
				updatedMessages.push(message);
				return updatedMessages;
			});
		} else {
			setMessages((prevMessages) => {
				const updatedMessages = [...prevMessages];
				if (latestBotMessageIndex.current !== -1) {
					updatedMessages[latestBotMessageIndex.current] = message;
				} else {
					updatedMessages[messagesRef.current.length - 1] = message;
				}
				return updatedMessages;
			});
		}
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
		if (frame.tool.name && trustedRef.current[frame.tool.name]) return true;


		// If this tool have a source repo, check if it is trusted. If it isn't already,
		// return false since we need to ask the user for permission.
		if (frame.tool.source?.repo) {
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
		if (frame.tool?.name?.startsWith("sys.")) return false;

		// Automatically allow all other tools
		return true;
	}

	const addTrustedFor = (frame: CallFrame) => {
		if (!frame.tool) return () => {};

		return frame.tool.source?.repo ? 
			() => {
				const repo = frame.tool!.source?.repo!.Root;
				const trimmedRepo = trimRepo(repo || "");
				trustedRepoPrefixesRef.current.push(trimmedRepo);
			} :
			() => {
				if (frame.tool?.name) trustedRef.current[frame.tool.name] = true;
			}
	}

	const loadSocket = () => {
		const socket = io();

		socket.off("connect");
		socket.off("disconnect")
		socket.off("progress");
		socket.off("error");
		socket.off("botMessage");
		socket.off("promptRequest");
		socket.off("confirmRequest");

		setConnected(false);
		setMessages([]);

		socket.on("connect", () => setConnected(true));
		socket.on("disconnect", () => setConnected(false));
		socket.on("progress", (data: {frame: CallFrame, state: any}) => handleProgress(data));
		socket.on("error", (data: string) => handleError(data));
		socket.on("promptRequest", (data: {frame: PromptFrame, state: any }) => { handlePromptRequest(data) });
		socket.on("confirmRequest", (data: {frame: CallFrame, state: any}) => { handleConfirmRequest(data) });

		setSocket(socket);
	}


	useEffect(() => { loadSocket() }, []);
	const restart = useCallback(() => {
		loadSocket();
	}, [socket]);

    const interrupt = useCallback(() => {
        if (!socket || !connected) return;
		latestBotMessageIndex.current = -1
        socket.emit("interrupt");
		setGenerating(false);
    }, [socket, connected]);

	return { socket, setSocket, connected, setConnected, messages, setMessages, restart, interrupt, generating};
};

export default useChatSocket;