import React, { useEffect, useRef, useState } from 'react';
import { Button, Tooltip } from '@nextui-org/react';
import type { CallFrame } from '@gptscript-ai/gptscript';
import { GoArrowDown, GoArrowUp } from 'react-icons/go';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';

const StackTrace = ({calls}: {calls: Record<string, CallFrame> | null}) => {
    if (!calls) return null;

    const logsContainerRef = useRef<HTMLDivElement>(null);
    const [allOpen, setAllOpen] = useState(true);

    const EmptyLogs = () => {
        return (
            <div className="">
                <p>Waiting for the first event from GPTScript...</p>
            </div>
        )
    }

    const Summary = ({call}: {call: CallFrame}) => {
        if (call.tool?.chat) {
            return <summary>
                {call.type !== "callFinish" ? `Chat open with ${call.tool.name}` : `Chatted with ${call.tool.name}`}
            </summary>
        }

        return (
            <summary>
                {call.type !== "callFinish" ?
                    call.tool?.name ? `Running ${call.tool.name}` : `Loading ${call.toolCategory}` + "..." : 
                    call.tool?.name ? `Ran ${call.tool.name}` : `Loaded ${call.toolCategory}`
                } 
                {call?.type !== "callFinish" && <AiOutlineLoading3Quarters className="ml-2 animate-spin inline"/>}
            </summary>
        )
    };

    const RenderLogs = () => {
        const callMap = new Map<string, Map<string, CallFrame>>();

        Object.keys(calls).forEach((key) => {
            const parentId = calls[key].parentID || "";
            const callFrame = callMap.get(parentId);
            if (!callFrame) {
                callMap.set(parentId, new Map<string, CallFrame>());
            }
            callMap.get(parentId)?.set(key, calls[key]);
        });

        const renderLogsRecursive = (parentId: string) => {
            const logs = callMap.get(parentId);
            if (!logs) return null;
            return (
                <div className={parentId ? "pl-10" : ""}>
                    {Array.from(logs.entries()).map(([key, call]) => (
                        <div key={key}>
                            <details open={allOpen} className="cursor-pointer">
                                <Summary call={call} />
                                <div className='ml-10'>
                                    <details open={allOpen} className="cursor-pointer">
                                        <summary>Input</summary>
                                        <p className="ml-10">{JSON.stringify(call?.input)}</p>
                                    </details>
                                    <details open={allOpen} className="cursor-pointer">
                                        <summary>Messages</summary>

                                        <div className="">
                                            <ul className="ml-10 list-disc">
                                                {call.output && call.output.map((output, key) => output.content &&(
                                                    <li key={key}>
                                                        <p>{ output.content && output.content}</p>
                                                    </li>
                                                ))} 
                                            </ul>
                                        </div>
                                    </details>
                                    { callMap.get(call.id) && (
                                        <details open={allOpen}className="cursor-pointer">
                                            <summary>Calls</summary>
                                            {renderLogsRecursive(call.id)}
                                        </details> 
                                    )}
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
                content={allOpen ? 'Collapse all' : 'Expand all'} 
                closeDelay={0}
            >
                <Button
                    onPress={()=> {setAllOpen(!allOpen)}}
                    className="absolute right-8"
                    isIconOnly
                    radius='full'
                    color="primary"
                >
                    { allOpen ? <GoArrowUp/> : <GoArrowDown /> }
                </Button>
            </Tooltip>
            {calls ? <RenderLogs /> : <EmptyLogs />}
        </div>
    );
};

export default StackTrace;