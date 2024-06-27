import { ReactNode } from "react";
import { GoSquirrel } from "react-icons/go";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import { Avatar, Button, Tooltip } from "@nextui-org/react";
import type { CallFrame } from "@gptscript-ai/gptscript";
import Calls from "./messages/calls"
import { GoIssueReopened } from "react-icons/go";

export enum MessageType {
	User,
	Bot,
}

export type Message = {
    type: MessageType;
    message?: string;
    error?: string;
	name?: string;
    calls?: Record<string, CallFrame>;
    component?: ReactNode;
};

const abbreviate = (name: string) => {
	const words = name.split(/(?=[A-Z])|[\s_-]/);
	const firstLetters = words.map(word => word[0]);
	return firstLetters.slice(0, 2).join('').toUpperCase();
}

const Messages = ({ messages, noAvatar }: { messages: Message[], noAvatar?: boolean }) => (
	<div>
		{messages.map((message, index) =>
			message?.type === MessageType.User ? (
				<div key={index} className="flex flex-col items-end mb-10">
					<p className="whitespace-pre-wrap rounded-2xl bg-blue-500 text-white py-2 px-4 max-w-full">
						{messages[index].message}
					</p>
				</div>
			) : (
				<div key={index} className="flex flex-col items-start mb-10">
					<div className="flex gap-2 w-full">
						{ !noAvatar &&
							<Tooltip 
								content={`Sent from ${message?.name || "Main"}`}
								placement="bottom"
								closeDelay={0.5}
							>
								<Avatar
									showFallback
									name={abbreviate(message?.name || 'Main')} 
									icon={!message?.name && <GoSquirrel className="text-xl" />}
									className="w-[40px] cursor-default"
									classNames={{base: "bg-white p-6 text-sm border dark:border-none dark:bg-zinc-900"}}
									color={message?.error ? "danger": "default"} 
								/>
							</Tooltip>
						}
						<div 
							className={`w-[93%] rounded-2xl text-black dark:text-white pt-1 px-4 border dark:border-none dark:bg-zinc-900 ${message.error ? "border-danger dark:border-danger" : ""}`}
						>
							{ messages[index].message && 
                                <Markdown className="!text-wrap prose overflow-x-auto dark:prose-invert p-4 !w-full !max-w-full prose-thead:text-left prose-img:rounded-xl prose-img:shadow-lg" remarkPlugins={[remarkGfm]}>
								    {messages[index].message}
							    </Markdown>
                            }
							{ messages[index].component }
							{message?.error && (
								<>
									<p className="text-danger text-base pl-4 pb-6">{message?.error}</p>
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