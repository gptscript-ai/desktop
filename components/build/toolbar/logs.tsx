import React, { useContext, useEffect, useRef, useState } from 'react';
import { BuildContext } from '@/app/build/page';
import { Button, Tooltip } from '@nextui-org/react';
import { RiArrowDownSLine, RiCloseLine} from 'react-icons/ri';
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import type { Call, ChatToolMessage, ChatErrorMessage, ChatOutputMessage } from '@gptscript-ai/gptscript';

const Logs = () => {
    const { run } = useContext(BuildContext);
    const logsContainerRef = useRef<HTMLDivElement>(null);
    const [isStickingToBottom, setIsStickingToBottom] = useState(false);

    useEffect(() => {
        if (logsContainerRef.current) {
            if (isStickingToBottom) {
                logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
            }
        }
    }, [run, isStickingToBottom]);

    const handleStickToBottom = () => {
        setIsStickingToBottom(!isStickingToBottom);
    };

    const EmptyLogs = () => {
        return (
            <div className="">
                <p>Run a tool to view its progress here...</p>
            </div>
        )
    }

    const RenderLogs = () => {
        const logMap = new Map<string, Call[]>();

        run?.calls?.forEach((call) => {
            const parentId = call.parentID || "";
            const logs = logMap.get(parentId) || [];
            logs.push(call);
            logMap.set(parentId, logs);
        });

        const renderLogsRecursive = (parentId: string) => {
            const logs = logMap.get(parentId) || [];
            return (
                <div className="pl-10">
                    {logs.map((call, index) => (
                        <div key={index}>
                            <details open={true}>
                                <summary>
                                    {call?.state === "running" ? 
                                        `Running ${call.tool?.name}...` : 
                                        `Finished running ${call.tool?.name}`}
                                    {call?.state === "running" && <AiOutlineLoading3Quarters className="ml-2 animate-spin inline"/>}
                                </summary>
                                <div className='ml-10'>
                                    <details>
                                        <summary>Input</summary>
                                        <p className="ml-10">{JSON.stringify(call?.input)}</p>
                                    </details>
                                    <details>
                                        <summary>Output</summary>
                                        <p className="ml-10">{call?.output}</p>
                                    </details>
                                    <details>
                                        <summary>Messages</summary>
                                        {call.messages && call.messages.map((message: any, index) => (
                                            <div className="ml-10">
                                                <p>
                                                    {message.role && 
                                                        <span className="font-bold">
                                                            { message.content && `${message.role}: `}
                                                        </span>
                                                    }
                                                    
                                                    { message.content && JSON.stringify(message.content)}
                                                </p>
                                                { message.error && <p className="ml-10">{JSON.stringify(message.error)}</p>}
                                                { message.output && <p className="ml-10">{JSON.stringify(message.output)}</p>}
                                            </div>
                                        ))} 
                                    </details>
                                    <details open={true}>
                                        <summary>Calls</summary>
                                        {renderLogsRecursive(call.id)}
                                    </details>
                                </div>
                            </details>
                        </div>
                    ))}
                </div>
            );
        };

        return (
            <details open={true}>
                <summary >
                    {run?.state === "running" ? `Running ${run?.filePath}...` : `Finished running ${run?.filePath}`}
                </summary>

                {renderLogsRecursive("")}

            </details>
        );
    }

    return (
        <div className="h-full overflow-scroll p-4 rounded-2xl border-2 shadow-lg border-primary border-lg bg-black text-white" ref={logsContainerRef}>
            <Tooltip 
                content={isStickingToBottom ? 'Unstick from bottom' : 'Stick to bottom'} 
                closeDelay={0}
            >
                <Button
                    onPress={handleStickToBottom}
                    className="absolute right-8"
                    isIconOnly
                    radius='full'
                    color="primary"
                >
                    { isStickingToBottom ? <RiCloseLine /> : <RiArrowDownSLine /> }
                </Button>
            </Tooltip>
            {run ? <RenderLogs /> : <EmptyLogs />}
        </div>
    );
};

export default Logs;