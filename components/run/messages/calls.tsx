import { useState } from 'react';
import { GoNote } from "react-icons/go";
import StackTrace from './calls/stackTrace';
import type { CallFrame } from '@gptscript-ai/gptscript';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    Tooltip,
} from "@nextui-org/react";

const Calls = ({calls}: {calls: CallFrame[]}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <Tooltip content="View stack trace" closeDelay={0.5}>
                <Button 
                    onPress={() => setIsModalOpen(true)}
                    isIconOnly
                    radius='full'
                >
                    <GoNote />
                </Button>
            </Tooltip>
            <Modal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                size="4xl"
                className="h-5/6"
                backdrop='blur'
            >
                <ModalContent>
                    <ModalHeader>
                        <div>
                            <h1 className="text-2xl my-4">Stack Trace</h1>
                            <h2 className="text-base text-zinc-500">Below you can see what this call is doing or has done.</h2>
                        </div>
                    </ModalHeader>
                    <ModalBody className='mb-4 h-full overflow-y-scroll'>
                        <StackTrace calls={calls}/>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default Calls;