import React, { ReactNode } from 'react';
import { IoCopyOutline } from 'react-icons/io5';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeExternalLinks from 'rehype-external-links';
import { Avatar, Button, Tooltip } from '@nextui-org/react';
import type { CallFrame } from '@gptscript-ai/gptscript';
import Calls from './messages/calls';
import { GoIssueReopened } from 'react-icons/go';
import { defaultUrlTransform } from 'react-markdown';

export enum MessageType {
  Alert,
  Agent,
  User,
}

export type Message = {
  type: MessageType;
  icon?: ReactNode;
  message?: string;
  error?: string;
  name?: string;
  calls?: Record<string, CallFrame>;
  component?: ReactNode;
};

const abbreviate = (name: string) => {
  const words = name.split(/(?=[A-Z])|[\s_-]/);
  const firstLetters = words.map((word) => word[0]);
  return firstLetters.slice(0, 2).join('').toUpperCase();
};

// Allow links for file references in messages if it starts with file://, otherwise this will cause an empty href and cause app to reload when clicking on it
const urlTransformAllowFiles = (u: string) => {
  if (u.startsWith('file://')) {
    return u;
  }
  return defaultUrlTransform(u);
};

const Message = React.memo(
  ({
    message,
    noAvatar,
    restart,
  }: {
    message: Message;
    noAvatar?: boolean;
    restart?: () => void;
  }) => {
    if (message === undefined) {
      return null;
    }

    switch (message.type) {
      case MessageType.User:
        return (
          <div className="flex flex-col items-end mb-10">
            <p className="whitespace-pre-wrap rounded-2xl bg-blue-500 text-white py-2 px-4 max-w-full">
              {message.message}
            </p>
          </div>
        );
      case MessageType.Agent:
        return (
          <div className="flex flex-col items-start mb-10">
            <div className="flex gap-2 w-full">
              {!noAvatar && (
                <Tooltip
                  content={`Sent from ${message.name || 'System'}`}
                  placement="bottom"
                  closeDelay={0.5}
                >
                  <Avatar
                    showFallback
                    name={abbreviate(message.name || 'System')}
                    className="w-[40px] cursor-default"
                    classNames={{
                      base: `bg-white p-6 text-sm border dark:border-none dark:bg-zinc-900 ${
                        message.error && 'border-danger dark:border-danger'
                      }`,
                      name: `text-lg text-default-600`,
                    }}
                  />
                </Tooltip>
              )}

              <div
                className={`flex-auto rounded-2xl text-black dark:text-white pt-1 px-4 border dark:border-none dark:bg-zinc-900 overflow-x-hidden ${
                  message.error ? 'border-danger dark:border-danger' : ''
                }`}
              >
                {message.message && (
                  <Markdown
                    className={`!text-wrap prose overflow-x-auto dark:prose-invert p-4 !w-full !max-w-full prose-thead:text-left prose-img:rounded-xl prose-img:shadow-lg`}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[
                      [rehypeExternalLinks, { target: '_blank' }],
                    ]}
                    urlTransform={urlTransformAllowFiles}
                  >
                    {message.message}
                  </Markdown>
                )}
                <div className="overflow-x-auto">{message.component}</div>
                {message.error && (
                  <>
                    <p className="text-danger text-base pl-4 pb-6">{`${JSON.stringify(message.error)}`}</p>
                    <Tooltip
                      content="If you are no longer able to chat, click here to restart the script."
                      closeDelay={0.5}
                      placement="bottom"
                      color="danger"
                    >
                      <Button
                        startContent={<GoIssueReopened className="text-lg" />}
                        color="danger"
                        className="ml-4 mb-6"
                        onPress={restart}
                      >
                        Restart Script
                      </Button>
                    </Tooltip>
                  </>
                )}
              </div>
            </div>
            <div className="flex w-full justify-end mt-2 space-x-2">
              <Tooltip
                content="Copy Message"
                placement="bottom"
                closeDelay={0.5}
              >
                <Button
                  isIconOnly
                  radius="full"
                  startContent={<IoCopyOutline className="text-md" />}
                  className="ml-2"
                  variant="flat"
                  color="primary"
                  onPress={() => {
                    navigator.clipboard.writeText(message.message || '');
                  }}
                />
              </Tooltip>
              {message.calls && <Calls calls={message.calls} />}
            </div>
          </div>
        );
      case MessageType.Alert:
        return (
          <div className="flex flex-col items-start mb-10">
            <div className="flex gap-2 w-full">
              <div className="w-full flex gap-2 justify-center space-x-2 rounded-2xl text-black text-sm bg-zinc-50 shadow text-center py-2 px-4 dark:text-white dark:border-zinc-800 dark:border dark:bg-black">
                {message.icon ? (
                  message.icon
                ) : (
                  <div className="w-2 h-2 my-auto bg-green-500 rounded-full" />
                )}
                {message.component ? (
                  message.component
                ) : (
                  <Markdown
                    className={`!text-wrap prose overflow-x-auto dark:prose-invert prose-thead:text-left prose-p:text-sm prose-img:rounded-xl prose-img:shadow-lg`}
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[
                      [rehypeExternalLinks, { target: '_blank' }],
                    ]}
                    urlTransform={urlTransformAllowFiles}
                  >
                    {message.message}
                  </Markdown>
                )}
              </div>
            </div>
          </div>
        );
    }
  }
);

Message.displayName = 'Message';

const Messages = ({
  messages,
  latestAgentMessage,
  noAvatar,
  restart,
}: {
  messages: Message[];
  latestAgentMessage: Message;
  noAvatar?: boolean;
  restart?: () => void;
}) => (
  <div className="px-4">
    {messages.map((message, index) => (
      <Message
        key={index}
        restart={restart}
        message={message}
        noAvatar={noAvatar}
      />
    ))}
    {latestAgentMessage.message && (
      <Message
        key={messages.length}
        restart={restart}
        message={latestAgentMessage}
        noAvatar={noAvatar}
      />
    )}
  </div>
);

export default Messages;
