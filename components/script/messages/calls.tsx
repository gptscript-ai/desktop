import { useState } from 'react';
import { GoNote } from "react-icons/go";
import StackTrace from './calls/stackTrace';
import type { CallFrame } from '@gptscript-ai/gptscript';
import { IoCloseSharp } from 'react-icons/io5';
import { MdFullscreen, MdCloseFullscreen } from 'react-icons/md';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
    Tooltip,
} from "@nextui-org/react";

const Calls = ({calls}: {calls: Record<string, CallFrame>}) => {
    const [showModal, setShowModal] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);

    return (
        <div>
            <Tooltip content="View stack trace" closeDelay={0.5}>
                <Button 
                    onPress={() => setShowModal(true)}
                    isIconOnly
                    radius='full'
                >
                    <GoNote />
                </Button>
            </Tooltip>
            <Modal
                isOpen={showModal}
                onOpenChange={setShowModal}
                hideCloseButton={true}
                size={fullscreen ? "full" : "3xl"}
                className={fullscreen ? "" : "h-4/5"}
            >
                <ModalContent>
                    <ModalHeader className="flex justify-between">
                        <div>
                            <h1 className="text-2xl my-4">Stack Trace</h1>
                            <h2 className="text-base text-zinc-500">Below you can see what this call is doing or has done.</h2>
                        </div>
                        <div>
                            <Tooltip
                                content={fullscreen ? 'Regular Size' : 'Full Screen'} 
                                closeDelay={0}
                            >
                                <Button
                                    radius="full"
                                    size="sm"
                                    isIconOnly
                                    color="primary"
                                    onPress={(_) => setFullscreen(!fullscreen)}
                                >
                                    { fullscreen ? <MdCloseFullscreen className="text-lg"/> : <MdFullscreen className="text-lg" />}
                                </Button>
                            </Tooltip>
                            <Button
                                radius="full"
                                size="sm"
                                isIconOnly
                                color="primary"
                                className="ml-2"
                                onPress={(_) => setShowModal(false)}
                            >
                                <IoCloseSharp className="text-lg" />
                            </Button>
                        </div>
                    </ModalHeader>
                    <ModalBody className='mb-4 h-full overflow-y-auto'>
                        <StackTrace calls={calls}/>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default Calls;
