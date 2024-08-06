"use client"

import React, {useState, useContext, useEffect} from "react";
import {IoMdSend} from "react-icons/io";
import {FaBackward} from "react-icons/fa";
import {
    Button,
    Textarea,
} from "@nextui-org/react";
import Commands from "@/components/script/chatBar/commands";
import {GoSquareFill} from "react-icons/go";
import { ScriptContext } from "@/contexts/script";

interface ChatBarProps {
    disabled?: boolean;
    onMessageSent: (message: string) => void;
}

const ChatBar = ({ disabled = false, onMessageSent}: ChatBarProps) => {
    const [inputValue, setInputValue] = useState('');
    const [commandsOpen, setCommandsOpen] = useState(false);
    const [locked, setLocked] = useState(false);
    const {generating, interrupt, hasParams, tool, setShowForm, setMessages} = useContext(ScriptContext);

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.ctrlKey && e.key === "t" ) {
                e.preventDefault();
                document.getElementById("chatInput")?.focus();
            } 
        }
    
        document.addEventListener("keydown", handleKeyDown);
        return function cleanup() {
          document.removeEventListener("keydown", handleKeyDown);
        };
      }, []);

    const handleSend = () => {
        setLocked(true);
        onMessageSent(inputValue);
        setInputValue(''); // Clear the input field after sending the message
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        // if the user started the message with /, we assume they are trying to run a command
        // so we don't update the input value and instead open the command modal
        setCommandsOpen(event.target.value.startsWith('/'));
        setInputValue(event.target.value);
    }

    useEffect(() => {
        if (generating) setLocked(false);
    }, [generating]);

    if (!tool.chat) {
        if (hasParams) return (
            <Button
                startContent={<FaBackward/>}
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
        <div className="flex px-4 w-full">
            <div className="w-full relative">
                <Commands text={inputValue} setText={setInputValue} isOpen={commandsOpen} setIsOpen={setCommandsOpen}>
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
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                if (inputValue === '') return;
                                if (commandsOpen) setInputValue('');
                                if (generating || commandsOpen || locked) return;
                                handleSend();
                            }
                            if (event.key === "Escape") {
                                setCommandsOpen(false);
                            }
                            if (event.key === "ArrowUp") {
                                if (commandsOpen) {
                                    event.preventDefault();
                                    document.getElementById("command-0")?.focus();
                                }
                            }
                        }}
                    />
                </Commands>
            </div>
            {generating ?
                <Button
                    startContent={<GoSquareFill className="mr-[1px] text-xl"/>}
                    isIconOnly
                    radius="full"
                    isDisabled={disabled}
                    className="ml-2 my-auto text-lg"
                    onPress={interrupt}
                /> :
                <Button
                    startContent={<IoMdSend/>}
                    isDisabled={disabled}
                    isIconOnly
                    radius="full"
                    className="ml-2 my-auto text-lg"
                    color="primary"
                    onPress={handleSend}
                />
            }
        </div>
    );
};

export default ChatBar