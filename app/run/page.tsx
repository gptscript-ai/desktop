"use client"

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import { subtitle } from "@/components/primitives";
import type { Tool, Block} from "@gptscript-ai/gptscript";
import Messages, { type Message, MessageType } from "./components/messages";
import ChatBar from "./components/chatBar";
import ToolForm from "./components/form";
import Loading from "./components/loading";
import useChatSocket from './components/useChatSocket';
import { Button } from "@nextui-org/react";

const fetchScript = async (file: string): Promise<Tool> => {
	const response = await fetch(`/api/file/${file}`);
	const script = await response.json() as Block[];
	for (let tool of script) {
		if (tool.type === 'text') continue;
		return tool;
	}
	return {} as Tool;
};

const RunScript = () => {
	const file = useSearchParams().get('file');
	const [tool, setTool] = useState<Tool>({} as Tool);
	const [showForm, setShowForm] = useState(true);
	const [formValues, setFormValues] = useState<Record<string, string>>({});
	const [inputValue, setInputValue] = useState('');
	const messagesRef = useRef<Message[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const { socket, connected, messages, setMessages} = useChatSocket();
	const [hasRun, setHasRun] = useState(false);
	const [hasParams, setHasParams] = useState(false);

	useEffect(() => {
		setHasParams(tool.arguments?.properties != undefined && Object.keys(tool.arguments?.properties).length > 0);
	}, [tool]);

	useEffect(() => {
		if (hasRun || !socket || !connected) return;
		if ( !tool.arguments?.properties || Object.keys(tool.arguments.properties).length === 0 ) {
			socket.emit("run", file + ".gpt", tool.name, formValues);
			setHasRun(true);
		}
	}, [tool, file, formValues]);

	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.focus();
		}
	}, [messages, inputValue]);

	useEffect(() => {
		messagesRef.current = messages;
	}, [messages]);

	useEffect(() => {
		fetchScript(file || '').then((data) => setTool(data));
	}, [file]);

	useEffect(() => {
		const smallBody = document.getElementById("small-message");
		if (smallBody) {
			smallBody.scrollTop = smallBody.scrollHeight;
		}
	}, [messages]);

	const handleFormSubmit = () => {
		setShowForm(false);
		setMessages([]);
		socket?.emit("run", file + ".gpt", tool.name, formValues);
		setHasRun(true);
	};

	const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFormValues((prevValues) => ({
			...prevValues,
			[event.target.name]: event.target.value,
		}));
	};

    const handleMessageSent = (message: string) => {
        if (!socket || !connected) return;
        setMessages((prevMessages) => [...prevMessages, { type: MessageType.User, message }]);
        socket.emit("userMessage", message);
    };

	return (
		<div className="h-full flex flex-col items-center justify-center w-full px-10 2xl:w-1/2 2xl:mx-auto 2xl:px-0">
			{messages.length ? (<>
				<div className="border-2 dark:border-zinc-600 rounded-lg w-full py-2 text-center">
					<h1 className={subtitle()}>
						{showForm && hasParams ?
							"You're about to chat with " :
							"You're chatting with "}
						<span className="capitalize font-bold text-primary">
							{tool.name}
						</span>
					</h1>
					{showForm && hasParams ?
						<h2 className="text-zinc-500">
							The script you're trying to run needs some information from you before running. Please fill out the form below and click 'Start Chat' to begin.
						</h2> :
						<h2 className="text-zinc-500">
							{tool.description || "This tool doesn't have a description."}
						</h2>
					}
				</div>

				<div
					id="small-message"
					className="h-5/6 px-6 pt-6 overflow-y-scroll w-full items-center"
				>
					{showForm && hasParams ? (
						<ToolForm
						tool={tool}
						formValues={formValues}
						handleInputChange={handleInputChange}
						/>
					) : (
						<Messages messages={messages} />
					)}
				</div>

				<div className="w-full">
					{showForm && hasParams ? (
						<Button
							className="mt-4 w-full"
							type="submit"
							color="primary"
							onPress={handleFormSubmit}
							size="lg"
						>
							Start Chat
						</Button>
					) : (
						<ChatBar
							onBack={() => {
								setMessages([]);
								setShowForm(true);
							}}
							onMessageSent={handleMessageSent}
						/>
					)}
				</div>
			</>) : (
				<Loading />
			)}
		</div>
	);
};

export default RunScript;
