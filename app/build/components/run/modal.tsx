import React from "react";
import { Modal, Button, useDisclosure } from "@nextui-org/react";
import type { Property } from "@gptscript-ai/gptscript";
import { IoIosChatboxes } from "react-icons/io";
import { FaRunning } from "react-icons/fa";
import Chat from "./chat";
import Run from "./run";

interface RunModalProps {
    name: string;
    file: string;
    chat: boolean;
    args?: Record<string, Property>;
}

export default function RunModal({ name, file, chat, args }: RunModalProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    return (<>
        <Button 
            className="w-full" 
            onPress={onOpen} 
            color={chat ? 'primary' : 'secondary'}
            startContent={chat ? <IoIosChatboxes /> : <FaRunning />}
        >
            { chat ? 'Chat' : 'Run' }
        </Button>
        <Modal 
            backdrop="blur"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            { chat ? <Chat name={name} file={file}/> : <Run name={name} file={file} args={args}/> }
        </Modal>
    </>);
}
