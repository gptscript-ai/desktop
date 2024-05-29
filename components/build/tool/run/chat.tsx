import React, { useState, useEffect, useContext } from "react";
import { IoMdSend } from "react-icons/io";
import { subtitle } from "@/components/primitives";
import { IoCloseSharp } from "react-icons/io5";
import { BuildContext } from "@/app/build/page";
import { FaBackward } from "react-icons/fa";
import { GrExpand, } from "react-icons/gr";
import { BsArrowsFullscreen } from "react-icons/bs";
import { HiOutlineArrowsPointingIn } from "react-icons/hi2";
import { type Property, type CallFrame } from "@gptscript-ai/gptscript";
import useChatSocket from "@/components/run/useChatSocket";
import Messages from "@/components/run/messages";
import {
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Button,
    Divider,
    Input,
    Modal,
    ModalHeader,
    ModalBody,
    ModalContent,
    ModalFooter,
} from "@nextui-org/react";

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
    params: Record<string, Property> | undefined;
}

export default function Chat({ name, file, params }: ChatBoxProps) {
    const { setChatPanel, setCalls } = useContext(BuildContext);
    const [showForm, setShowForm] = useState(true);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [showModal, setShowModal] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const { socket, connected, messages, setMessages} = useChatSocket();

    useEffect(() => {
        const smallBody = document.getElementById("small-message");
        if (smallBody) {
            smallBody.scrollTop = smallBody.scrollHeight;
        }
        const largeBody = document.getElementById("large-message");
        if (largeBody) {
            largeBody.scrollTop = largeBody.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (!connected) return;
        socket!.on("progress", (data: {_: any, state: CallFrame[]}) => setCalls(data.state) );
    }, [connected])

    const handleFormSubmit = () => {
        setShowForm(false);
        setMessages([]);
        socket?.emit("run", file, name, formValues);
    };

    const handleInputChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormValues((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));
    };

    const handleMessageSent = (message: Message) => {
        if (!socket || !connected) return;
        setMessages((prevMessages) => [...prevMessages, message]);
        socket.emit("userMessage", message.message);
    };

    const ChatBar = () => <>
        <Button
            startContent={<FaBackward />}
            isIconOnly
            radius="full"
            className="mr-2 my-auto text-lg"
            onPress={() => {
                setCalls(null);
                setMessages([]);
                setShowForm(true);
            }}
        />
        <input
            id="chatInput"
            autoComplete="off"
            className="border border-gray-300 dark:border-zinc-700 rounded-full shadow px-3 py-2 w-full focus:outline-primary"
            placeholder="Ask the chat bot something..."
            onKeyDown={(
                event: React.KeyboardEvent<HTMLInputElement>
            ) => {
                if (event.key === "Enter") {
                    handleMessageSent({
                        type: MessageType.User,
                        message: event.currentTarget.value,
                    });
                    event.currentTarget.value = "";
                }
            }}
        />
        <Button
            startContent={<IoMdSend />}
            isIconOnly
            radius="full"
            className="ml-2 my-auto text-lg"
            color="primary"
            onPress={() => {
                const input = document.querySelector(
                    "#chatInput"
                ) as HTMLInputElement;
                handleMessageSent({
                    type: MessageType.User,
                    message: input.value,
                });
                input.value = "";
            }}
        />
    </>

    return (
        <>
            <Card className="h-full" style={{ height: "100%" }}>
                <CardHeader className="flex flex-col gap-1 py-2 px-4">
                    <div className="w-full flex justify-between">
                        <h1 className={subtitle()}>
                            {showForm
                                ? "You're about to chat with "
                                : "You're chatting with "}
                            <span className="capitalize font-bold text-primary">
                                {name}
                            </span>
                        </h1>
                        <Button
                            radius="full"
                            size="sm"
                            isIconOnly
                            color="primary"
                            onPress={(_) => setChatPanel(<></>)}
                        >
                            <IoCloseSharp />
                        </Button>
                        <Button
                            radius="full"
                            size="sm"
                            isIconOnly
                            color="primary"
                            className="ml-2"
                            onPress={(_) => setShowModal(true)}
                        >
                            <GrExpand />
                        </Button>
                    </div>
                </CardHeader>
                <Divider />
                <CardBody
                    id="small-message"
                    className="shadow px-6 pt-6 overflow-y-scroll h-[300px]"
                >
                    {showForm ? (
                        <form>
                            {Object.entries(params || {}).map(
                                ([argName, arg]) => (
                                    <Input
                                        className="mb-6"
                                        size="lg"
                                        label={argName}
                                        placeholder={arg.description}
                                        type="text"
                                        id={argName}
                                        name={argName}
                                        value={formValues[argName] || ""}
                                        onChange={handleInputChange}
                                    />
                                )
                            )}
                        </form>
                    ) : (
                        <Messages noAvatar messages={messages}/>
                    )}
                </CardBody>

                <CardFooter>
                    {showForm ? (
                        <Button
                            className="w-full"
                            type="submit"
                            color="primary"
                            onPress={handleFormSubmit}
                        >
                            Start Chat
                        </Button>
                    ) : (
                        <ChatBar />
                    )}
                </CardFooter>
            </Card>
            <Modal
                isOpen={showModal}
                onOpenChange={setShowModal}
                hideCloseButton={true}
                size={fullscreen ? "full" : "3xl"}
                className={fullscreen ? "" : "h-4/5"}
                
            >
                <ModalContent>
                    <ModalHeader>
                        <h1 className={subtitle()}>
                            {showForm
                                ? "You're about to chat with "
                                : "You're chatting with "}
                            <span className="capitalize font-bold text-primary">
                                {name}
                            </span>
                        </h1>
                        <Button
                            radius="full"
                            size="sm"
                            isIconOnly
                            color="primary"
                            onPress={(_) => setShowModal(false)}
                        >
                            <IoCloseSharp />
                        </Button>
                        <Button
                            radius="full"
                            size="sm"
                            isIconOnly
                            color="primary"
                            className="ml-2"
                            onPress={(_) => setFullscreen(!fullscreen)}
                        >
                            { fullscreen ? <HiOutlineArrowsPointingIn className="text-lg"/> : <BsArrowsFullscreen />}
                        </Button>
                    </ModalHeader>
                    <ModalBody
                        id="large-message"
                        className="shadow px-6 pt-6 overflow-y-scroll"
                    >
                        <Messages messages={messages}/>
                    </ModalBody>
                    <ModalFooter>
                        <ChatBar />
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
}