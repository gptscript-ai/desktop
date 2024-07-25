"use client"

import React, {useState, useEffect, useRef, useCallback} from "react";
import type {Tool} from "@gptscript-ai/gptscript";
import Messages, {MessageType} from "@/components/script/messages";
import ChatBar from "@/components/script/chatBar";
import ToolForm from "@/components/script/form";
import Loading from "@/components/loading";
import useChatSocket from '@/components/script/useChatSocket';
import {Button} from "@nextui-org/react";
import {fetchScript, path} from "@/actions/scripts/fetch";
import {getWorkspaceDir} from "@/actions/workspace";
import {createThread, getThreads, generateThreadName, renameThread, Thread} from "@/actions/threads";
import debounce from "lodash/debounce";

interface ScriptProps {
    file: string;
    thread?: string;
    className?: string
    messagesHeight?: string
    enableThreads?: boolean
    setThreads?: React.Dispatch<React.SetStateAction<Thread[]>>
    setSelectedThreadId?: React.Dispatch<React.SetStateAction<string | null>>
}

const Script: React.FC<ScriptProps> = ({file, thread, setThreads, className, messagesHeight = 'h-full', enableThreads, setSelectedThreadId}) => {
    const [tool, setTool] = useState<Tool>({} as Tool);
    const [showForm, setShowForm] = useState(true);
    const [formValues, setFormValues] = useState<Record<string, string>>({});
    const [inputValue, setInputValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);
    const [hasRun, setHasRun] = useState(false);
    const [hasParams, setHasParams] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);
    const {
        socket, connected, running, messages, setMessages, restart, interrupt, generating, error
    } = useChatSocket(isEmpty);

    const fetchThreads = async () => {
        if (!setThreads) return;
        const threads = await getThreads();
        setThreads(threads);
    };

    useEffect(() => {
        setHasParams(tool.arguments?.properties != undefined && Object.keys(tool.arguments?.properties).length > 0);
        setIsEmpty(!tool.instructions);
    }, [tool]);

    useEffect(() => {
        if (thread) restartScript();
    }, [thread]);

    useEffect(() => {
        if (hasRun || !socket || !connected) return;
        if (!tool.arguments?.properties || Object.keys(tool.arguments.properties).length === 0) {
            path(file)
                .then(async (path) => {
                    const workspace = await getWorkspaceDir()
                    return {path, workspace}
                })
                .then(({path, workspace}) => {
                    socket.emit("run", path, tool.name, formValues, workspace, thread)
                });
            setHasRun(true);
        }
    }, [tool, connected, file, formValues, thread]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [messages, inputValue]);

    useEffect(() => {
        fetchScript(file).then((data) => setTool(data));
    }, []);

    useEffect(() => {
        const smallBody = document.getElementById("small-message");
        if (smallBody) smallBody.scrollTop = smallBody.scrollHeight;
    }, [messages, connected, running]);

    const handleFormSubmit = () => {
        setShowForm(false);
        setMessages([]);
        path(file)
            .then(async (path) => {
                const workspace = await getWorkspaceDir()
                return {path, workspace}
            })
            .then(({path, workspace}) => {
                socket?.emit("run", path, tool.name, formValues, workspace, thread)
            });
        setHasRun(true);
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFormValues((prevValues) => ({
            ...prevValues,
            [event.target.name]: event.target.value,
        }));
    };

    const handleMessageSent = async (message: string) => {
        if (!socket || !connected) return;

        let threadId = "";
        if (hasNoUserMessages() && enableThreads && !thread && setThreads && setSelectedThreadId) {
            const newThread = await createThread(file, message)
            threadId = newThread?.meta?.id;
            setThreads(await getThreads());
            setSelectedThreadId(threadId);
        }


        setMessages((prevMessages) => [...prevMessages, {type: MessageType.User, message}]);
        socket.emit("userMessage", message, threadId);

        if (hasNoUserMessages() && thread) {
            renameThread(thread, await generateThreadName(message));
            fetchThreads();
        }

    };

    const restartScript = useCallback(
        // This is debonced as allowing the user to spam the restart button can cause race
        // conditions. In particular, the restart may not be processed correctly and can
        // get the user into a state where no run has been sent to the server.
        debounce(async () => {
            setTool(await fetchScript(file));
            restart();
            setHasRun(false);
        }, 200),
        [file, restart]
    );

    const hasNoUserMessages = useCallback(() => messages.filter((m) => m.type === MessageType.User).length === 0, [messages]);

    return (
        <div className={`h-full w-full ${className}`}>
            {(connected && running) || (showForm && hasParams) ? (<>
                <div
                    id="small-message"
                    className={`px-6 pt-10 overflow-y-auto w-full items-center ${messagesHeight}`}
                >
                    {showForm && hasParams ? (
                        <ToolForm
                            tool={tool}
                            formValues={formValues}
                            handleInputChange={handleInputChange}
                        />
                    ) : (
                        <Messages restart={restartScript} messages={messages}/>
                    )}
                </div>

                <div className="w-full ">
                    {showForm && hasParams ? (
                        <Button
                            className="mt-4 w-full"
                            type="submit"
                            color={tool.chat ? "primary" : "secondary"}
                            onPress={handleFormSubmit}
                            size="lg"
                        >
                            {tool.chat ? "Start chat" : "Run script"}
                        </Button>
                    ) : (
                        <ChatBar
                            backButton={hasParams}
                            noChat={!tool.chat}
                            onRestart={restartScript}
                            onInterrupt={interrupt}
                            generating={generating}
                            onBack={() => {
                                setMessages([]);
                                setShowForm(true);
                            }}
                            onMessageSent={handleMessageSent}
                        />
                    )}
                </div>
            </>) : (
                <Loading>Loading your script...</Loading>
            )}
        </div>
    );
};

export default Script;
