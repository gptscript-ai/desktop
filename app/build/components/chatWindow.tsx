import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, useDisclosure, Input, Divider } from "@nextui-org/react";
import { title, subtitle } from "@/components/primitives";
import { IoIosChatboxes } from "react-icons/io";

enum MessageType {
    User,
    Bot,
}

type Message = {
    type: MessageType;
    message: string;
};


export default function ChatWindow() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [messages, setMessages] = useState<Message[]>([]);

    const handleMessageSent = (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        setTimeout(() => {
            setMessages((prevMessages) => [...prevMessages, { type: MessageType.Bot, message: "I'm a bot, I'll work eventually!" }]);
        }, 1000);
    };

    return (
        <>
            <Button className="w-full" onPress={onOpen} color="primary" startContent={<IoIosChatboxes />}>
                Chat
            </Button>
            <Modal backdrop="blur" isOpen={isOpen} onOpenChange={onOpenChange}>
                <ModalContent className="h-[60vh]">
                    <ModalHeader className="flex flex-col gap-1">
                        <h2 className={subtitle()}>You're chatting with... FooBar</h2>
                    </ModalHeader>
                    <ModalBody className="overflow-y-scroll shadow">
                        <div>
                            {messages.map((message, index) => (
                                message.type === MessageType.User ? (
                                    <div key={index} className="flex flex-col items-start mb-2">
                                        <div className="rounded-2xl bg-blue-500 text-white py-2 px-4">
                                            {messages[index].message}
                                        </div>
                                    </div>
                                ) : (
                                    <div key={index} className="flex flex-col items-end mb-2">
                                        <div className="rounded-2xl bg-gray-200 text-gray-800 py-2 px-4">
                                            {messages[index].message}
                                        </div>
                                    </div>
                                )
                            ))}
                        </div>
                    </ModalBody>
                    <ModalFooter>
                        <Input
                            placeholder="Ask the chat bot something..."
                            onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
                                if (event.key === "Enter") {
                                    handleMessageSent({ type: MessageType.User, message: event.currentTarget.value });
                                    event.currentTarget.value = "";
                                }
                            }}
                        />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}
