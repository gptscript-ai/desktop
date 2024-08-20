'use client';

import { useContext, useEffect, useState, useRef } from 'react';
import Messages, { MessageType } from '@/components/script/messages';
import ChatBar from '@/components/script/chatBar';
import ToolForm from '@/components/script/form';
import Loading from '@/components/loading';
import { Button } from '@nextui-org/react';
import { getWorkspaceDir } from '@/actions/workspace';
import { getGatewayUrl } from '@/actions/gateway';
import { ScriptContext } from '@/contexts/script';
import AssistantNotFound from '@/components/assistant-not-found';

interface ScriptProps {
  className?: string;
  messagesHeight?: string;
  enableThreads?: boolean;
  showAssistantName?: boolean;
}

const Script: React.FC<ScriptProps> = ({
  className,
  messagesHeight = 'h-full',
  showAssistantName,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, _setInputValue] = useState<string>('');
  const {
    script,
    scriptDisplayName,
    tool,
    showForm,
    setShowForm,
    formValues,
    setFormValues,
    setHasRun,
    hasParams,
    messages,
    setMessages,
    thread,
    socket,
    connected,
    running,
    notFound,
    restartScript,
  } = useContext(ScriptContext);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [messages, inputValue]);

  useEffect(() => {
    const smallBody = document.getElementById('small-message');
    if (smallBody) smallBody.scrollTop = smallBody.scrollHeight;
  }, [messages, connected, running]);

  const handleFormSubmit = () => {
    setShowForm(false);
    setMessages([]);
    getWorkspaceDir().then(async (workspace) => {
      socket?.emit(
        'run',
        `${await getGatewayUrl()}/${script}`,
        tool.name,
        formValues,
        workspace,
        thread
      );
    });
    setHasRun(true);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [event.target.name]: event.target.value,
    }));
  };

  const handleMessageSent = async (message: string) => {
    if (!socket || !connected) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { type: MessageType.User, message },
    ]);
    socket.emit('userMessage', message, thread);
  };

  return (
    <div className={`h-full w-full ${className}`}>
      {connected || (showForm && hasParams) ? (
        <>
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
              <div>
                {showAssistantName && (
                  <h1 className="mb-10 text-2xl font-medium truncate">
                    {scriptDisplayName ?? ''}
                  </h1>
                )}
                <Messages restart={restartScript} messages={messages} />
              </div>
            )}
          </div>

          <div className="w-full ">
            {showForm && hasParams ? (
              <Button
                className="mt-4 w-full"
                type="submit"
                color={tool.chat ? 'primary' : 'secondary'}
                onPress={handleFormSubmit}
                size="lg"
              >
                {tool.chat ? 'Start chat' : 'Run script'}
              </Button>
            ) : (
              <ChatBar disabled={!running} onMessageSent={handleMessageSent} />
            )}
          </div>
        </>
      ) : notFound ? (
        <AssistantNotFound />
      ) : (
        <Loading>Loading your assistant...</Loading>
      )}
    </div>
  );
};

export default Script;
