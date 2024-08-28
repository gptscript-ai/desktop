'use client';

import React, {
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react';
import Messages, { MessageType } from '@/components/chat/messages';
import ChatBar from '@/components/chat/chatBar';
import ToolForm from '@/components/chat/form';
import Loading from '@/components/loading';
import { Button } from '@nextui-org/react';
import { getWorkspaceDir } from '@/actions/workspace';
import { getGatewayUrl } from '@/actions/gateway';
import { ChatContext } from '@/contexts/chat';
import ScriptToolsDropdown from '@/components/scripts/tool-dropdown';
import AssistantNotFound from '@/components/assistant-not-found';
import { generateThreadName, renameThread } from '@/actions/threads';
import KnowledgeDropdown from '@/components/scripts/knowledge-dropdown';
import SaveScriptDropdown from '@/components/scripts/script-save';
import { Tool } from '@gptscript-ai/gptscript';
import { rootTool } from '@/actions/gptscript';
import { gatewayTool } from '@/actions/knowledge/util';

interface ScriptProps {
  className?: string;
  messagesHeight?: string;
  showAssistantName?: boolean;
  inputPlaceholder?: string;
  disableInput?: boolean;
  disableCommands?: boolean;
}

const Chat: React.FC<ScriptProps> = ({
  className,
  messagesHeight = 'h-full',
  showAssistantName,
  inputPlaceholder,
  disableInput = false,
  disableCommands = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, _setInputValue] = useState<string>('');
  const [toolCatalogOpen, setToolCatalogOpen] = React.useState(false);
  const [tool, setTool] = useState<Tool>({} as Tool);

  const {
    script,
    scriptDisplayName,
    scriptContent,
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
    fetchThreads,
  } = useContext(ChatContext);

  useEffect(() => {
    rootTool(scriptContent).then((tool) => setTool(tool));
  }, [scriptContent]);

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
        thread,
        gatewayTool()
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

  const hasNoUserMessages = useCallback(
    () => messages.filter((m) => m.type === MessageType.User).length === 0,
    [messages]
  );

  const handleMessageSent = async (message: string) => {
    if (!socket || !connected) return;

    setMessages((prevMessages) => [
      ...prevMessages,
      { type: MessageType.User, message },
    ]);
    if (hasNoUserMessages() && thread) {
      renameThread(thread, await generateThreadName(message));
      fetchThreads();
    }
    socket.emit('userMessage', message, thread);
  };

  return (
    <div className={`h-full w-full ${className}`}>
      {connected || (showForm && hasParams) ? (
        <>
          <div
            id="small-message"
            className={`overflow-y-auto w-full items-center ${messagesHeight}`}
          >
            {showForm && hasParams ? (
              <ToolForm
                tool={tool}
                formValues={formValues}
                handleInputChange={handleInputChange}
              />
            ) : (
              <div>
                {showAssistantName && scriptDisplayName && (
                  <div className="sticky top-0 p-4 z-50 bg-background">
                    <h1 className="text-3xl font-medium truncate">
                      {scriptDisplayName ?? ''}
                    </h1>
                    <div className="flex gap-2">
                      <ScriptToolsDropdown />
                      <KnowledgeDropdown />
                      <SaveScriptDropdown />
                    </div>
                  </div>
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
              <ChatBar
                disableInput={disableInput || !running}
                disableCommands={disableCommands}
                inputPlaceholder={inputPlaceholder}
                onMessageSent={handleMessageSent}
                toolCatalogOpen={toolCatalogOpen}
                setToolCatalogOpen={setToolCatalogOpen}
              />
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

export default Chat;
