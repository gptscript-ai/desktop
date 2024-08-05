"use client"

import React, {useState, useContext} from "react";
import {IoMdSend} from "react-icons/io";
import {FaBackward} from "react-icons/fa";
import {
    Button,
    Menu,
    MenuItem,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Textarea,
    Tooltip,
} from "@nextui-org/react";
import Upload from "./chatBar/upload";
import {GoFile, GoInbox, GoIssueReopened, GoKebabHorizontal, GoSquare, GoSquareFill, GoTools} from "react-icons/go";
import { PiToolbox } from "react-icons/pi";
import { ScriptContext } from "@/contexts/script";

interface ChatBarProps {
    disabled?: boolean;
    onMessageSent: (message: string) => void;
}

const ChatBar = ({ disabled = false, onMessageSent}: ChatBarProps) => {
    const [inputValue, setInputValue] = useState('');
    const {generating, restartScript, interrupt, hasParams, tool, setShowForm, setMessages} = useContext(ScriptContext);


    const handleSend = () => {
        onMessageSent(inputValue);
        setInputValue(''); // Clear the input field after sending the message
    };

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
            <Popover>
                <PopoverTrigger>
                    <Button
                        startContent={<GoKebabHorizontal className="text-xl"/>}
                        isIconOnly
                        color="primary"
                        radius="full"
                        className="my-auto text-lg mr-2"
                    />
                </PopoverTrigger>
                <PopoverContent>
                    <Menu>
                        {/* <MenuItem>
                            {backButton && <Button
                                startContent={<FaBackward/>}
                                isIconOnly
                                radius="full"
                                className="mr-2 my-auto text-lg"
                                onPress={onBack}
                            />}
                        </MenuItem> */}
                        <MenuItem
                            startContent={<GoTools/>}
                            onPress={() => {}}
                        >
                            Add tools
                            {/* <Upload disabled={disabled} onRestart={onRestart}/> */}
                        </MenuItem>
                        <MenuItem
                            startContent={<GoInbox/>}
                        >
                            Manage workspace
                            {/* <Upload disabled={disabled} onRestart={onRestart}/> */}
                        </MenuItem>
                        <MenuItem
                            startContent={<GoIssueReopened />}
                            onPress={() => {restartScript()}}
                        >
                            Restart chat
                            {/* <Tooltip content="Restart the chat">
                                <Button
                                    radius="full"
                                    className="mr-2"
                                    color="primary"
                                    isIconOnly
                                    startContent={<GoIssueReopened className="text-lg"/>}
                                    onPress={onRestart}
                                />
                            </Tooltip> */}
                        </MenuItem>
                       
                    </Menu>
                </PopoverContent>
            </Popover>
            <Textarea
                color="primary"
                isDisabled={disabled}
                id="chatInput"
                autoComplete="off"
                placeholder="Ask the chat bot something..."
                value={inputValue}
                radius="full"
                minRows={1}
                variant="bordered"
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                        if (generating) return;
                        event.preventDefault();
                        handleSend();
                    }
                }}
            />
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