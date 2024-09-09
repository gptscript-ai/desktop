'use client';

import React, { useState, useContext, useEffect, useMemo, useRef } from 'react';
import { IoMdSend } from 'react-icons/io';
import { Spinner, Tooltip } from '@nextui-org/react';
import { FaBackward } from 'react-icons/fa';
import { Button, Textarea } from '@nextui-org/react';
import Commands, { ChatCommandsRef } from '@/components/chat/chatBar/commands';
import {
  GoIssueReopened,
  GoKebabHorizontal,
  GoSquareFill,
} from 'react-icons/go';
import { ChatContext } from '@/contexts/chat';
import { MessageType } from '@/components/chat/messages';
import { Tool } from '@gptscript-ai/gptscript';
import { rootTool } from '@/actions/gptscript';

interface ChatBarProps {
  disableInput?: boolean;
  disableCommands?: boolean;
  inputPlaceholder?: string;
  noChat?: boolean;
  onMessageSent: (message: string) => void;
}

const ChatBar = ({
  disableInput = false,
  disableCommands = false,
  noChat = false,
  inputPlaceholder,
  onMessageSent,
}: ChatBarProps) => {
  const [inputValue, setInputValue] = useState('');
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const {
    generating,
    running,
    interrupt,
    hasParams,
    scriptContent,
    setShowForm,
    messages,
    setMessages,
    restartScript,
    waitingForUserResponse,
  } = useContext(ChatContext);

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const userMessages = useMemo(() => {
    return messagesRef.current
      .filter((m) => m && m.type === MessageType.User)
      .map((m) => m.message ?? '');
  }, [generating, running]);

  const [_userMessagesIndex, setUserMessagesIndex] = useState(-1);
  const [tool, setTool] = useState<Tool>({} as Tool);

  const getMessageAtIndex = (index: number) => {
    if (index >= 0 && index < userMessages.length) {
      return userMessages[userMessages.length - 1 - index];
    }
    return '';
  };

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        document.getElementById('chatInput')?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return function cleanup() {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!catalogOpen) {
      setInputValue('');
    }
    document.getElementById('chatInput')?.focus();
  }, [catalogOpen, setInputValue]);

  const handleSend = () => {
    setLocked(true);
    onMessageSent(inputValue);
    setInputValue(''); // Clear the input field after sending the message
    setUserMessagesIndex(-1);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // if the user started the message with /, we assume they are trying to run a command
    // so we don't update the input value and instead open the command modal
    if (!disableCommands) setCommandsOpen(event.target.value.startsWith('/'));
    setInputValue(event.target.value);
  };

  useEffect(() => {
    if (generating) setLocked(false);
  }, [generating]);

  useEffect(() => {
    if (scriptContent.length > 0) {
      rootTool(scriptContent).then((tool) => setTool(tool));
    }
  }, [scriptContent]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const commandsRef = useRef<ChatCommandsRef>(null);

  if (!tool.chat) {
    if (hasParams)
      return (
        <Button
          startContent={<FaBackward />}
          className="mr-2 my-auto text-lg w-full"
          onPress={() => {
            setMessages([]);
            setShowForm(true);
          }}
        >
          Change options
        </Button>
      );
    return null;
  }

  return (
    <div className="flex px-4 space-x-2 sw-full">
      {!disableCommands &&
        (noChat ? (
          <Tooltip content="Restart script">
            <Button
              isIconOnly
              startContent={<GoIssueReopened />}
              radius="full"
              className="text-lg"
              color="primary"
              onPress={() => {
                restartScript();
              }}
            />
          </Tooltip>
        ) : (
          <Button
            isIconOnly
            startContent={<GoKebabHorizontal />}
            radius="full"
            className="text-lg"
            color="primary"
            disabled={disableInput}
            onPress={() => {
              if (disableInput) return;
              setCommandsOpen(true);
            }}
            onBlur={() => setTimeout(() => setCommandsOpen(false), 300)} // super hacky but it does work
          />
        ))}
      <div className="w-full relative">
        <Commands
          ref={commandsRef}
          text={inputValue}
          setText={setInputValue}
          isOpen={commandsOpen}
          setIsOpen={setCommandsOpen}
          isCatalogOpen={catalogOpen}
          inputElement={inputRef.current}
          setIsCatalogOpen={setCatalogOpen}
        >
          <Textarea
            ref={inputRef}
            color="primary"
            isDisabled={disableInput}
            id="chatInput"
            autoComplete="off"
            placeholder={
              catalogOpen
                ? 'Search for tools to add or press <Esc> to return to the chat'
                : disableInput
                  ? 'Waiting for a response to a prompt in chat...'
                  : inputPlaceholder ||
                    'Start chatting or type / for more options'
            }
            value={inputValue}
            radius="full"
            minRows={1}
            variant="bordered"
            onChange={handleChange}
            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                if (inputValue === '') return;
                if (commandsOpen) setInputValue('');
                if (generating || commandsOpen || locked) return;
                handleSend();
              }
              if (event.key === 'Escape') {
                setCommandsOpen(false);
                setCatalogOpen(false);
                document.getElementById('chatInput')?.focus();
              }
              if (event.key === 'ArrowUp') {
                event.preventDefault();
                const catalogStart = document.getElementById(`catalog-item-0`);
                if (commandsOpen) {
                  commandsRef.current?.focusCommands();
                } else if (catalogStart) {
                  commandsRef.current?.focusCatalog();
                } else {
                  setUserMessagesIndex((prevIndex) => {
                    const newIndex = Math.min(
                      prevIndex + 1,
                      userMessages.length - 1
                    );
                    setInputValue(getMessageAtIndex(newIndex));
                    return newIndex;
                  });
                }
              }
              if (event.key === 'ArrowDown') {
                setUserMessagesIndex((prevIndex) => {
                  const newIndex = Math.max(prevIndex - 1, -1);
                  setInputValue(
                    newIndex === -1 ? '' : getMessageAtIndex(newIndex)
                  );
                  return newIndex;
                });
              }
            }}
          />
        </Commands>
      </div>
      {generating ? (
        <Button
          startContent={<GoSquareFill className="mr-[1px] text-xl" />}
          isIconOnly
          radius="full"
          isDisabled={disableInput && !waitingForUserResponse}
          className="text-lg"
          onPress={interrupt}
        />
      ) : (
        <>
          {disableInput && !disableCommands && !noChat ? (
            <Spinner />
          ) : (
            <Button
              disabled={!disableInput}
              startContent={<IoMdSend />}
              isIconOnly
              isDisabled={!inputValue}
              radius="full"
              className="text-lg"
              color="primary"
              onPress={handleSend}
            />
          )}
        </>
      )}
    </div>
  );
};

export default ChatBar;
