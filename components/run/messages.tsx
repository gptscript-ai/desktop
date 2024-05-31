import { GoSquirrel } from "react-icons/go";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { Avatar, Button } from "@nextui-org/react";
import type { CallFrame } from "@gptscript-ai/gptscript";
import Calls from "./messages/calls"
import { GoIssueReopened } from "react-icons/go";

export enum MessageType {
	User,
	Bot,
}

export type Message = {
	type: MessageType;
	message: string;
	error?: string;
	calls?: CallFrame[];
};

const Messages = ({ messages, noAvatar }: { messages: Message[], noAvatar?: boolean }) => (
	<div>
		{messages.map((message, index) =>
			message.type === MessageType.User ? (
				<div key={index} className="flex flex-col items-end mb-10">
					<p className="whitespace-pre-wrap rounded-2xl bg-blue-500 text-white py-2 px-4 max-w-full">
						{messages[index].message}
					</p>
				</div>
			) : (
				<div key={index} className="flex flex-col items-start mb-10">
					<div className="flex gap-2 w-full">
						{ !noAvatar && <Avatar isBordered color={message.error ? "danger": "default"} icon={<GoSquirrel className="text-xl" />} /> }
						<div 
							className={`rounded-2xl text-black dark:text-white pt-1 px-4 w-full border-2 dark:border-zinc-600 ${message.error ? "border-danger dark:border-danger" : ""}`}
						>
							<Markdown className="prose dark:prose-invert p-4 !max-w-none prose-thead:text-left" remarkPlugins={[remarkGfm]}>
								{messages[index].message}
							</Markdown>
							{message.error && (
								<>
									<p className="text-danger text-base pl-4 pb-6">{message.error}</p>
									<Button 
										startContent={<GoIssueReopened className="text-lg"/>}
										color="danger"
										className="ml-4 mb-6"
										onPress={() => window.location.reload()}
									>
										Restart Script
									</Button>
								</>
							)}
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