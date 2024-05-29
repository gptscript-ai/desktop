import React, { useEffect, useRef, useState } from 'react';
import { Button, Tooltip } from '@nextui-org/react';
import { RiArrowDownSLine, RiCloseLine} from 'react-icons/ri';
import type { CallFrame } from '@gptscript-ai/gptscript';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const StackTrace = ({calls}: {calls: CallFrame[]}) => {
    const logsContainerRef = useRef<HTMLDivElement>(null);
    const [isStickingToBottom, setIsStickingToBottom] = useState(false);

    useEffect(() => {
        if (logsContainerRef.current) {
            if (isStickingToBottom) {
                logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
            }
        }
    }, [calls, isStickingToBottom]);

    const handleStickToBottom = () => {
        setIsStickingToBottom(!isStickingToBottom);
    };

    const EmptyLogs = () => {
        return (
            <div className="">
                <p>Waiting for the first event from GPTScript...</p>
            </div>
        )
    }

    const RenderLogs = () => {
        const callMap = new Map<string, CallFrame[]>();

        calls.forEach((call) => {
            const parentId = call.parentID || "";
            const logs = callMap.get(parentId) || [];
            logs.push(call);
            callMap.set(parentId, logs);
        });

        const renderLogsRecursive = (parentId: string) => {
            const logs = callMap.get(parentId) || [];
            return (
                <div className={parentId ? "pl-10" : ""}>
                    {logs.map((call, key) => (
                        <div key={key}>
                            <details open={true} className="cursor-pointer">
                                <summary>
                                    {call.type !== "callFinish" ? 
                                        call.tool?.name ? `Running ${call.tool.name}` : `Loading ${call.toolCategory}` + "..." : 
                                        call.tool?.name ? `Ran ${call.tool.name}` : `Loaded ${call.toolCategory}`
                                    } 
                                    {call?.type !== "callFinish" && <AiOutlineLoading3Quarters className="ml-2 animate-spin inline"/>}
                                </summary>
                                <div className='ml-10'>
                                    <details className="cursor-pointer">
                                        <summary>Input</summary>
                                        <p className="ml-10">{JSON.stringify(call?.input)}</p>
                                    </details>
                                    <details className="cursor-pointer">
                                        <summary>Output</summary>
                                        <p className="ml-10">{JSON.stringify(call.output)}</p>
                                    </details>
                                    <details className="cursor-pointer">
                                        <summary>Messages</summary>
                                        {call.output && call.output.map((output, key) => (
                                            <div className="ml-10" key={key}>
                                                <p>{ output.content && JSON.stringify(output.content)}</p>
                                            </div>
                                        ))} 
                                    </details>
                                    <details open={true} className="cursor-pointer">
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

        return renderLogsRecursive("");
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
            {calls ? <RenderLogs /> : <EmptyLogs />}
        </div>
    );
};

export default StackTrace;