"use client"

import { GoSquirrel } from "react-icons/go";
import ReactMarkdown from "react-markdown";
import { Avatar } from "@nextui-org/react";

export enum MessageType {
	User,
	Bot,
}

export type Message = {
	type: MessageType;
	message: string;
	toolCalls?: Record<string,Message>;
};

const Messages = ({ messages }: { messages: Message[] }) => (
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
							icon={<GoSquirrel className="text-xl" />}
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

export default Messages