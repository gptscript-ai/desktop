"use client"

import React, { useState, useEffect} from "react";
import { useSearchParams } from 'next/navigation';
import { IoMdSend } from "react-icons/io";
import { subtitle } from "@/components/primitives";
import { io, Socket } from "socket.io-client";
import { FaBackward } from "react-icons/fa";
import { GoSquirrel } from "react-icons/go";
import type { Tool, Block } from "@gptscript-ai/gptscript";
import ReactMarkdown from "react-markdown";
import {
	Button,
	Avatar,
	Input,
	Divider,
} from "@nextui-org/react";

enum MessageType {
	User,
	Bot,
}

type Message = {
	type: MessageType;
	message: string;
};

const fetchScript = async (file: string): Promise<Tool> => {
	const response = await fetch(`/api/file/${file}`);
	const script = await response.json() as Block[];
	for (let tool of script) {
		if (tool.type === 'text') continue;
		return tool;
	}
	return {} as Tool;
};

export default function RunScript() {
	const file = useSearchParams().get('file');
	const [tool, setTool] = useState<Tool>({} as Tool);
	const [messages, setMessages] = useState<Message[]>([]);
	const [connected, setConnected] = useState(false);
	const [socket, setSocket] = useState<Socket | null>(null);
	const [showForm, setShowForm] = useState(true);
	const [formValues, setFormValues] = useState<Record<string, string>>({});

	useEffect(() => {
		fetchScript(file || '').then((data) => setTool(data));
		const socket = io();

		socket.on("connect", () => {
			setConnected(true);
			if (!tool.arguments?.properties || Object.keys(tool.arguments.properties).length === 0 ) {
				socket?.emit("run", file+".gpt", tool.name, formValues);
			}
			// setRun(null);
		});

		socket.on("message", (data) => {
			console.log("system message:", data);
		});

		socket.on("scriptMessage", (data) => {
			setMessages((prevMessages) => [
				...prevMessages,
				{ type: MessageType.Bot, message: data },
			]);
		});

		socket.on("progress", (data) => {
			console.log("progress:", data);
		});

		// socket.on("state", (data: Run) => setRun(data));
		socket.on("disconnect", () => {
			setConnected(false);
		});

		setSocket(socket);

		return () => {
			setSocket(null);
			socket.disconnect();
		};
	}, []);

	useEffect(() => {
		const smallBody = document.getElementById("small-message");
		if (smallBody) {
			smallBody.scrollTop = smallBody.scrollHeight;
		}
		const largeBody = document.getElementById("large-message");
		if (largeBody) {
			largeBody.scrollTop = largeBody.scrollHeight;
		}
	}, [messages]);

	const handleFormSubmit = () => {
		setShowForm(false);
		setMessages([]);
		socket?.emit("run", file+".gpt", tool.name, formValues);
	};

	const handleInputChange = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setFormValues((prevValues) => ({
			...prevValues,
			[event.target.name]: event.target.value,
		}));
	};

	const handleMessageSent = (message: Message) => {
		if (!socket || !connected) return;
		setMessages((prevMessages) => [...prevMessages, message]);
		socket.emit("userMessage", message.message);
	};

	const Messages = () => (
		<div>
			{messages.map((message, index) =>
				message.type === MessageType.User ? (
					<div
						key={index}
						className="flex flex-col items-end mb-10"
					>
						<div className="rounded-2xl bg-blue-500 text-white py-2 px-4 max-w-full">
							{messages[index].message}
						</div>
					</div>
				) : (
					<div
						key={index}
						className="flex flex-col items-start mb-10" // Center the bot message
					>
						<div className="flex gap-2 w-full">
							<Avatar
								isBordered
        						icon={<GoSquirrel className="text-xl"/>}
							/>
							<div className="rounded-2xl text-black dark:text-white pt-1 px-4 w-full border-2 dark:border-zinc-600 ">
								<ReactMarkdown className="prose dark:prose-invert p-4 !max-w-none">
									{messages[index].message}
								</ReactMarkdown>
							</div>
						</div>
					</div>
				)
			)}
		</div>
	);


	const ChatBar = () => (
		<div className="flex border-2 dark:border-zinc-600 shadow-md rounded-full p-4 w-full">
			<Button
				startContent={<FaBackward />}
				isIconOnly
				radius="full"
				className="mr-2 my-auto text-lg"
				onPress={() => {
					// setRun(null);
					setMessages([]);
					setShowForm(true);
				}}
			/>
			<input
				id="chatInput"
				autoComplete="off"
				className="border border-gray-300 dark:border-zinc-700 rounded-full shadow px-3 py-2 w-full focus:outline-primary"
				placeholder="Ask the chat bot something..."
				onKeyDown={(
					event: React.KeyboardEvent<HTMLInputElement>
				) => {
					if (event.key === "Enter") {
						handleMessageSent({
							type: MessageType.User,
							message: event.currentTarget.value,
						});
						event.currentTarget.value = "";
					}
				}}
			/>
			<Button
				startContent={<IoMdSend />}
				isIconOnly
				radius="full"
				className="ml-2 my-auto text-lg"
				color="primary"
				onPress={() => {
					const input = document.querySelector(
						"#chatInput"
					) as HTMLInputElement;
					handleMessageSent({
						type: MessageType.User,
						message: input.value,
					});
					input.value = "";
				}}
			/>
		</div>
	)

	return (
		<div className="h-full flex flex-col items-center justify-center w-full px-10 2xl:w-1/2 2xl:mx-auto 2xl:px-0">
			<div className="w-full">
				<h1 className={subtitle()}>
					{showForm && tool.arguments?.properties && Object.keys(tool.arguments.properties).length > 0 ? 
						"You're about to chat with " :
						"You're chatting with "}
					<span className="capitalize font-bold text-primary">
						{tool.name}
					</span>
				</h1>
				{showForm && tool.arguments?.properties && Object.keys(tool.arguments.properties).length > 0 && <h2 className="text-zinc-500">
					The script you're trying to run needs some information from you before running. Please fill out the form below and click 'Start Chat' to begin.
				</h2>}
				<Divider className="my-6"/>
			</div>

			<div
				id="small-message"
				className="h-5/6 px-6 pt-6 overflow-y-scroll w-full items-center"
			>
				{showForm && tool.arguments?.properties && Object.keys(tool.arguments.properties).length > 0 ? (
					<form className="flex flex-col w-full">
						{Object.entries(tool.arguments.properties).map(
							([argName, arg]) => (
								<Input
									key={argName}
									className="mb-6"
									size="lg"
									label={argName}
									placeholder={arg.description}
									type="text"
									id={argName}
									name={argName}
									value={formValues[argName] || ""}
									onChange={handleInputChange}
								/>
							)
						)}
					</form>
				) : (
					< Messages />
				)}
			</div>

			<div className="w-full">
				{showForm && tool.arguments?.properties && Object.keys(tool.arguments.properties).length > 0 ? (
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
					<ChatBar />
				)}
			</div>
			
		</div>
	);
}
