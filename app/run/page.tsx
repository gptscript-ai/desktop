"use client"

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import type { Tool, Block} from "@gptscript-ai/gptscript";
import Messages, { type Message, MessageType } from "../../components/run/messages";
import ChatBar from "@/components/run/chatBar";
import ToolForm from "@/components/run/form";
import Loading from "@/components/loading";
import useChatSocket from '@/components/run/useChatSocket';
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
		<div className="h-full w-full px-10 2xl:w-1/2 2xl:mx-auto 2xl:px-0 flex flex-col pb-10">
			{messages.length || (showForm && hasParams)  ? (<>
				<div
					id="small-message"
					className="px-6 pt-10 overflow-y-scroll w-full items-center h-full"
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

				<div className="w-full ">
					{showForm && hasParams ? (
						<Button
							className="mt-4 w-full"
							type="submit"
							color={tool.chat ? "primary" : "secondary"}
							onPress={handleFormSubmit}
							size="lg"
						>
							{ tool.chat ? "Start chat" : "Run script" }
						</Button>
					) : (
						<ChatBar
							backButton={hasParams}
							noChat={!tool.chat}
							onBack={() => {
								setMessages([]);
								setShowForm(true);
							}}
							onMessageSent={handleMessageSent}
						/>
					)}
				</div>
			</>) : (
				<Loading>Loading your script...</Loading>
			)}
		</div>
	);
};

export default RunScript;
