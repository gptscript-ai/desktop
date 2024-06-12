import React, { useState, useEffect, useContext } from "react";
import { IoMdSend } from "react-icons/io";
import { subtitle } from "@/components/primitives";
import { IoCloseSharp } from "react-icons/io5";
import { GraphContext } from "@/contexts/graph";
import { FaBackward } from "react-icons/fa";
import { GrExpand, } from "react-icons/gr";
import { BsArrowsFullscreen } from "react-icons/bs";
import { HiOutlineArrowsPointingIn } from "react-icons/hi2";
import { type Property, type CallFrame } from "@gptscript-ai/gptscript";
import useChatSocket from "@/components/script/useChatSocket";
import Messages from "@/components/script/messages";
import { path } from "@/actions/scripts/fetch";
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

interface ChatProps {
    name: string;
    file: string;
    chat: boolean;
    params: Record<string, Property> | undefined;
}

export default function Chat({ name, file, params, chat }: ChatProps) {
    const { setChatPanel, setCalls } = useContext(GraphContext);
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
        socket!.on("progress", (data: {_: any, state: Record<string, CallFrame>}) => setCalls(data.state) );
    }, [connected])

    const handleFormSubmit = () => {
        setShowForm(false);
        setMessages([]);
        path(file).then((file) => socket?.emit("run", file, name, formValues));
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
        {chat ? (
            <>
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
        ): (
            <Button
                startContent={<FaBackward />}
                isIconOnly
                radius="full"
                className="mr-2 my-auto text-lg w-full"
                onPress={() => {
                    setCalls(null);
                    setMessages([]);
                    setShowForm(true);
                }}
            />
        )}
    </>

    return (
        <>
            <Card className="h-full" style={{ height: "100%" }}>
                <CardHeader className="flex flex-col gap-1 py-2 px-4">
                    <div className="w-full flex justify-between">
                        <h1 className={subtitle()}>
                            {showForm
                                ? chat ? "You're about to chat with " : "You're about to run "
                                : chat ? "You're chatting with " : "You're running "
                            }
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
                            color={chat ? "primary" : "secondary"}
                            onPress={handleFormSubmit}
                        >
                            {chat ? "Start chat" : "Run tool"}
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
                                ? chat ? "You're about to chat with " : "You're about to run "
                                : chat ? "You're chatting with " : "You're running "
                            }
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