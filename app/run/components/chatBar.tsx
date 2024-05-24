"use client"

import React, { useState } from "react";
import { IoMdSend } from "react-icons/io";
import { FaBackward } from "react-icons/fa";
import {
	Button,
} from "@nextui-org/react";

const ChatBar = ({
    onBack,
    onMessageSent,
    backButton,
}: {
    onBack: () => void;
    backButton: boolean;
    onMessageSent: (message: string) => void;
}) => {
    const [inputValue, setInputValue] = useState('');

    const handleSend = () => {
        onMessageSent(inputValue);
        setInputValue(''); // Clear the input field after sending the message
    };

    return (
        <div className="flex border-2 dark:border-zinc-600 rounded-full p-4 w-full">
            {backButton && <Button
                startContent={<FaBackward />}
                isIconOnly
                radius="full"
                className="mr-2 my-auto text-lg"
                onPress={onBack}
            />}
            <input
                id="chatInput"
                autoComplete="off"
                className="border border-gray-300 dark:border-zinc-700 rounded-full shadow px-3 py-2 w-full focus:outline-primary"
                placeholder="Ask the chat bot something..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                    if (event.key === "Enter") {
                        handleSend();
                    }
                }}
            />
            <Button
                startContent={<IoMdSend />}
                isIconOnly
                radius="full"
                className="ml-2 my-auto text-lg"
                color="primary"
                onPress={handleSend}
            />
        </div>
    );
};

export default ChatBar