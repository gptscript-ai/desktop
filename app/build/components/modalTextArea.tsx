import { useState } from 'react';
import { GrExpand } from "react-icons/gr";
import {
    Textarea,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    Button,
} from "@nextui-org/react";

interface ModalTextAreaProps {
    defaultValue: string;
    className: string;
    placeholder: string;
    header: string;
    setText: (newText: string) => void;
}

const ModalTextArea = (props: ModalTextAreaProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className={props.className}>
            <div>
                <Button 
                    onPress={() => setIsModalOpen(true)}
                    size="sm"
                    variant="light"
                    isIconOnly
                    radius='full'
                    className="absolute right-3 z-10"
                >
                    <GrExpand className="text-zinc-500"/>
                </Button>
                <Textarea 
                    value={props.defaultValue}
                    onChange={(e) => props.setText(e.target.value)}
                    placeholder={props.placeholder}
                    variant="faded"
                />
            </div>
            <Modal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                size="3xl"
                className="h-4/5"
                backdrop='blur'
            >
                <ModalContent>
                    <ModalHeader>
                        <h1 className="text-2xl my-4">{props.header}</h1>
                    </ModalHeader>
                    <ModalBody className='mb-4'>
                        <textarea 
                            defaultValue={props.defaultValue}
                            placeholder={props.placeholder}
                            onChange={(e) => props.setText(e.target.value)}
                            wrap="soft"
                            className="min-h-full bg-gray-100 dark:bg-zinc-800 resize-none p-4 rounded-xl dark:text-white text-blck text-lg"
                            style={{
                                whiteSpace: 'pre',
                                outline: 'none'
                            }}
                        />
                    </ModalBody>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default ModalTextArea;