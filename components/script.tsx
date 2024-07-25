"use client"

import React, {useEffect, useContext, useCallback, useRef} from "react";
import Messages, {MessageType} from "@/components/script/messages";
import ChatBar from "@/components/script/chatBar";
import ToolForm from "@/components/script/form";
import Loading from "@/components/loading";
import {Button} from "@nextui-org/react";
import {getWorkspaceDir} from "@/actions/workspace";
import {createThread, getThreads, generateThreadName, renameThread, Thread} from "@/actions/threads";
import { ScriptContext } from "@/contexts/script";
import {fetchScript, path} from "@/actions/scripts/fetch";

interface ScriptProps {
    file: string;
    thread?: string;
    className?: string
    messagesHeight?: string
    enableThreads?: boolean
    setThreads?: React.Dispatch<React.SetStateAction<Thread[]>>
    setSelectedThreadId?: React.Dispatch<React.SetStateAction<string | null>>
}

const Script: React.FC<ScriptProps> = ({className, messagesHeight = 'h-full', enableThreads}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = React.useState<string>("");
    const {
        script,
        tool,
        showForm,
        setShowForm,
        formValues,
        setFormValues,
        setHasRun,
        hasParams,
        messages,
        setMessages,
        thread,
        setThreads,
        setSelectedThreadId,
        socket,
        connected,
        running,
        generating,
        restartScript,
        interrupt,
        fetchThreads,
    } = useContext(ScriptContext);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [messages, inputValue]);

    useEffect(() => {
        const smallBody = document.getElementById("small-message");
        if (smallBody) smallBody.scrollTop = smallBody.scrollHeight;
    }, [messages, connected, running]);

    const handleFormSubmit = () => {
        setShowForm(false);
        setMessages([]);
        path(script)
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
            const newThread = await createThread(script, message)
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
