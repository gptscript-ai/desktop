import React, { useState, useEffect } from "react";
import { IoMdSend } from "react-icons/io";
import { ModalContent, ModalHeader, ModalBody, ModalFooter, Button} from "@nextui-org/react";
import { subtitle } from "@/components/primitives";
import { io, Socket } from "socket.io-client";

enum MessageType {
    User,
    Bot,
}

type Message = {
    type: MessageType;
    message: string;
};


interface ChatBoxProps {
    name: string;
    file: string;
}

export default function Chat({ name, file }: ChatBoxProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [connected, setConnected] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const socket = io();

        socket.on('connect', () => {
            setConnected(true);
            socket.emit('run', file, name);
        })

        socket.on('message', data => {
            console.log('system message:', data);
        });

        socket.on('scriptMessage', data => {
            setMessages((prevMessages) => [...prevMessages, 
                { type: MessageType.Bot, message: data }
            ]);
        });

        socket.on('disconnect', () => { setConnected(false) });

        setSocket(socket);

        return () => { 
            setSocket(null);
            socket.disconnect()
        };
    }, []);
    

    const handleMessageSent = (message: Message) => {
        if (!socket || !connected) return;
        setMessages((prevMessages) => [...prevMessages, message]);
        socket.emit('userMessage', message.message);
    };

    return (
        <ModalContent className="h-[60vh]">
            <ModalHeader className="flex flex-col gap-1">
                <h2 className={subtitle()}>
                    You're chatting with <span className="capitalize font-bold text-primary">{name}</span>!
                </h2>
            </ModalHeader>
            <ModalBody className="overflow-y-scroll shadow">
                <div>
                    {messages.map((message, index) => (
                        message.type === MessageType.User ? (
                            <div key={index} className="flex flex-col items-end mb-2">
                                <div className="rounded-2xl bg-blue-500 text-white py-2 px-4 max-w-[75%]">
                                    {messages[index].message}
                                </div>
                            </div>
                        ) : (
                            <div key={index} className="flex flex-col items-start mb-2">
                                <div className="rounded-2xl bg-gray-200 text-black dark:text-white dark:bg-zinc-700 py-2 px-4 max-w-[75%]">
                                    {messages[index].message}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            </ModalBody>

            <ModalFooter>
                <input
                    id="chatInput"
                    className="border border-gray-300 dark:border-zinc-700 rounded-full shadow px-3 py-2 w-full focus:outline-primary"
                    placeholder="Ask the chat bot something..."
                    onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                        if (event.key === "Enter") {
                            handleMessageSent({ type: MessageType.User, message: event.currentTarget.value });
                            event.currentTarget.value = "";
                        }
                    }}
                />
                <Button
                    startContent={<IoMdSend/>}
                    isIconOnly radius="full"
                    className="ml-2 my-auto text-lg"
                    color="primary"
                    onPress={() => {
                        const input = document.querySelector("#chatInput") as HTMLInputElement;
                        handleMessageSent({ type: MessageType.User, message: input.value });
                        input.value = "";
                    }}
                />
            </ModalFooter>
        </ModalContent>
    );
}
