"use client"

import React, { useState } from "react";
import { IoMdSend } from "react-icons/io";
import { FaBackward } from "react-icons/fa";
import {
	Button,
    Textarea,
    Tooltip,
} from "@nextui-org/react";
import Upload from "./chatBar/upload";
import { GoIssueReopened, GoSquare, GoSquareFill } from "react-icons/go";

const ChatBar = ({
    generating,
    onBack,
    noChat,
    onInterrupt,
    onMessageSent,
    backButton,
    onRestart,
}: {
    generating: boolean;
    onBack: () => void;
    onInterrupt: () => void;
    onMessageSent: (message: string) => void;
    backButton: boolean;
    onRestart: () => void;
    noChat?: boolean;
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        onMessageSent(inputValue);
        setInputValue(''); // Clear the input field after sending the message
    };

    if (noChat) {
        if (backButton) return (
            <Button
                startContent={<FaBackward />}
                className="mr-2 my-auto text-lg w-full"
                onPress={onBack}
            >
                Change options
            </Button>
        );
        return null;
    }

    return (
        <div className="flex px-4 w-full">
            {backButton && <Button
                startContent={<FaBackward />}
                isIconOnly
                radius="full"
                className="mr-2 my-auto text-lg"
                onPress={onBack}
            />}
            <Tooltip content="Restart the chat">
                <Button
                    radius="full"
                    className="mr-2"
                    color="primary"
                    isIconOnly
                    startContent={<GoIssueReopened className="text-lg"/>}
                    onPress={onRestart}
                />
            </Tooltip>
            <Upload />
            <Textarea
                id="chatInput"
                autoComplete="off"
                placeholder="Ask the chat bot something..."
                value={inputValue}
                radius="full"
                minRows={1}
                variant="bordered"
                color="primary"
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
                    startContent={<GoSquareFill className="mr-[1px] text-xl" />}
                    isIconOnly
                    radius="full"
                    className="ml-2 my-auto text-lg"
                    onPress={onInterrupt}
                /> : 
                <Button
                    startContent={<IoMdSend />}
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