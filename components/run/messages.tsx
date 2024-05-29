import { GoSquirrel } from "react-icons/go";
import ReactMarkdown from "react-markdown";
import { Avatar } from "@nextui-org/react";
import type { CallFrame } from "@gptscript-ai/gptscript";
import Calls from "./messages/calls"

export enum MessageType {
	User,
	Bot,
}

export type Message = {
	type: MessageType;
	message: string;
	calls?: CallFrame[];
};

const Messages = ({ messages }: { messages: Message[] }) => (
	<div>
		{messages.map((message, index) =>
			message.type === MessageType.User ? (
				<div key={index} className="flex flex-col items-end mb-10">
					<div className="rounded-2xl bg-blue-500 text-white py-2 px-4 max-w-full">
						{messages[index].message}
					</div>
				</div>
			) : (
				<div key={index} className="flex flex-col items-start mb-10">
					<div className="flex gap-2 w-full">
						<Avatar isBordered icon={<GoSquirrel className="text-xl" />} />
						<div className="rounded-2xl text-black dark:text-white pt-1 px-4 w-full border-2 dark:border-zinc-600">
							<ReactMarkdown className="prose dark:prose-invert p-4 !max-w-none">
								{messages[index].message}
							</ReactMarkdown>
						</div>
					</div>
					{ messages[index].calls && 
						<div className="flex w-full justify-end mt-2">
							<Calls calls={messages[index].calls!}/>
						</div> 
					}
				</div>
			)
		)}
	</div>
);

export default Messages;