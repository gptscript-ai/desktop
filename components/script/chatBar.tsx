'use client';

import React, { useState, useContext, useEffect } from 'react';
import { IoMdSend } from 'react-icons/io';
import { Spinner } from '@nextui-org/react';
import { FaBackward } from 'react-icons/fa';
import { Button, Textarea } from '@nextui-org/react';
import Commands from '@/components/script/chatBar/commands';
import { GoKebabHorizontal, GoSquareFill } from 'react-icons/go';
import { ScriptContext } from '@/contexts/script';
import { MessageType } from '@/components/script/messages';

interface ChatBarProps {
  disabled?: boolean;
  onMessageSent: (message: string) => void;
}

const ChatBar = ({ disabled = false, onMessageSent }: ChatBarProps) => {
  const [inputValue, setInputValue] = useState('');
  const [commandsOpen, setCommandsOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const {
    generating,
    interrupt,
    hasParams,
    tool,
    setShowForm,
    messages,
    setMessages,
  } = useContext(ScriptContext);
  const [userMessages, setUserMessages] = useState<string[]>([]);
  const [_userMessagesIndex, setUserMessagesIndex] = useState(-1);

  const getMessageAtIndex = (index: number) => {
    if (index >= 0 && index < userMessages.length) {
      return userMessages[userMessages.length - 1 - index];
    }
    return '';
  };

  useEffect(() => {
    setUserMessages(
      messages
        .filter((m) => m.type === MessageType.User)
        .map((m) => m.message ?? '')
    );
  }, [messages]);

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

  const handleSend = () => {
    setLocked(true);
    onMessageSent(inputValue);
    setInputValue(''); // Clear the input field after sending the message
    setUserMessagesIndex(-1);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // if the user started the message with /, we assume they are trying to run a command
    // so we don't update the input value and instead open the command modal
    setCommandsOpen(event.target.value.startsWith('/'));
    setInputValue(event.target.value);
  };

  useEffect(() => {
    if (generating) setLocked(false);
  }, [generating]);

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
    <div className="flex px-4 space-x-2 sw-full mx-auto 2xl:w-[75%]">
      <Button
        isIconOnly
        startContent={<GoKebabHorizontal />}
        radius="full"
        className="text-lg"
        color="primary"
        onPress={() => {
          if (disabled) return;
          setCommandsOpen(true);
        }}
        onBlur={() => setTimeout(() => setCommandsOpen(false), 300)} // super hacky but it does work
      />
      <div className="w-full relative">
        <Commands
          text={inputValue}
          setText={setInputValue}
          isOpen={commandsOpen}
          setIsOpen={setCommandsOpen}
        >
          <Textarea
            color="primary"
            isDisabled={disabled}
            id="chatInput"
            autoComplete="off"
            placeholder="Start chatting or type / for more options "
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
              }
              if (event.key === 'ArrowUp') {
                if (commandsOpen) {
                  event.preventDefault();
                  document.getElementById('command-0')?.focus();
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
          isDisabled={disabled}
          className="text-lg"
          onPress={interrupt}
        />
      ) : (
        <>
          {disabled ? (
            <Spinner />
          ) : (
            <Button
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
