"use client"

import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Tool } from "@gptscript-ai/gptscript";
import Messages, { type Message, MessageType } from "@/components/script/messages";
import ChatBar from "@/components/script/chatBar";
import ToolForm from "@/components/script/form";
import Loading from "@/components/loading";
import useChatSocket from '@/components/script/useChatSocket';
import { Button } from "@nextui-org/react";
import { fetchScript, path } from "@/actions/scripts/fetch";
import { getWorkspaceDir } from "@/actions/workspace";

interface ScriptProps {
    file: string;
	className?: string
	messagesHeight?: string
}

const Script: React.FC<ScriptProps> = ({ file, className, messagesHeight = 'h-full' }) => {
	const [tool, setTool] = useState<Tool>({} as Tool);
	const [showForm, setShowForm] = useState(true);
	const [formValues, setFormValues] = useState<Record<string, string>>({});
	const [inputValue, setInputValue] = useState('');
	const messagesRef = useRef<Message[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const { socket, connected, messages, setMessages, restart, interrupt, generating} = useChatSocket();
	const [hasRun, setHasRun] = useState(false);
	const [hasParams, setHasParams] = useState(false);

	useEffect(() => {
		setHasParams(tool.arguments?.properties != undefined && Object.keys(tool.arguments?.properties).length > 0);
	}, [tool]);

	useEffect(() => {
		if (hasRun || !socket || !connected) return;
		if ( !tool.arguments?.properties || Object.keys(tool.arguments.properties).length === 0 ) {
			path(file)
                .then(async (path) => { 
                    const workspace = await getWorkspaceDir()
                    return { path, workspace}
                })
                .then(({path, workspace}) => { socket.emit("run", path, tool.name, formValues, workspace) });
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
		fetchScript(file).then((data) => setTool(data));
	}, []);

	useEffect(() => {
		const smallBody = document.getElementById("small-message");
		if (smallBody) {
			smallBody.scrollTop = smallBody.scrollHeight;
		}
	}, [messages]);

	const handleFormSubmit = () => {
		setShowForm(false);
		setMessages([]);
		path(file)
            .then(async (path) => { 
                const workspace = await getWorkspaceDir()
                return { path, workspace}
            })
            .then(({path, workspace}) => { socket?.emit("run", path, tool.name, formValues, workspace) });
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

	const restartScript = useCallback(() => {
		fetchScript(file).then((data) => setTool(data));
		restart();
		setHasRun(false);
	}, [file, restart]);

	return (
		<div className={`h-full w-full ${className}`}>
			{messages.length || (showForm && hasParams)  ? (<>
				<div
					id="small-message"
					className={`px-6 pt-10 overflow-y-auto w-full items-center ${messagesHeight}`}
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
							onRestart={restartScript}
                            onInterrupt={interrupt}
                            generating={generating}
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

export default Script;
