import React, { useState, useEffect } from "react";
import { ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@nextui-org/react";
import { subtitle } from "@/components/primitives";
import { io, Socket } from "socket.io-client";
import type { Property } from "@gptscript-ai/gptscript";
import { FaBackward } from "react-icons/fa";

interface RunProps {
    name: string;
    file: string;
    args: Record<string, Property> | undefined;
}

export default function Chat({ name, file, args }: RunProps) {
    const [messages, setMessages] = useState<String[]>([]);
    const [connected, setConnected] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [showForm, setShowForm] = useState(true);
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    useEffect(() => {
        const socket = io();
        socket.on('connect', () => setConnected(true))
        socket.on('scriptMessage', data => setMessages((prevMessages) => [...prevMessages, data]));
        socket.on('disconnect', () => { setConnected(false) });
        setSocket(socket);
        return () => { 
            setSocket(null);
            socket.disconnect()
        };
    }, []);

    const handleFormSubmit = () => {
        setShowForm(false);
        console.log(formValues);
        socket?.emit('run', file, name, formValues);
    }

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value
        }));
    }

    return (
        <ModalContent className="h-[80vh]">
            <ModalHeader className="flex flex-col gap-1">
                <h2 className={subtitle()}>
                    You're about to run <span className="capitalize font-bold text-primary">{name}</span>!
                </h2>
            </ModalHeader>
            <ModalBody className="overflow-y-scroll shadow">
                {showForm ? (
                    <form>
                        {Object.entries(args || {}).map(([argName, arg]) => (
                            <div key={argName} className="mb-4">
                                <label htmlFor={argName} className="block font-medium mb-1">{argName}</label>
                                <input
                                    type="text"
                                    id={argName}
                                    name={argName}
                                    value={formValues[argName] || ''}
                                    onChange={handleInputChange}
                                    className="border border-gray-300 rounded-md px-3 py-2 w-full"
                                />
                            </div>
                        ))}
                    </form>
                ) : (
                    <div>
                        {messages.map((message, index) => (
                            <div key={index} className="flex flex-col items-end mb-2">
                                <div className="rounded-2xl bg-blue-500 text-white py-2 px-4 max-w-[75%]">
                                    {message}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ModalBody>
            <ModalFooter>
                {showForm ? (
                    <Button 
                        className="w-full"
                        type="submit"
                        color="secondary"
                        onPress={handleFormSubmit} 
                    >
                        Run Script
                    </Button>
                ) : 
                    <Button 
                        className="w-full"
                        onPress={() => setShowForm(true)}
                        startContent={<FaBackward />}
                    >
                        Back
                    </Button>
                }
            </ModalFooter>
        </ModalContent>
    );
}
