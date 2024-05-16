import React, { useContext, useEffect, useRef, useState } from 'react';
import { BuildContext } from '@/app/build/page';
import { RunEventType } from '@gptscript-ai/gptscript';
import { Button, Tooltip } from '@nextui-org/react';
import { RiArrowDownSLine, RiCloseLine} from 'react-icons/ri';
import Tool from '../tool';

const Logs = () => {
    const { logs } = useContext(BuildContext);
    const logsContainerRef = useRef<HTMLDivElement>(null);
    const [isStickingToBottom, setIsStickingToBottom] = useState(false);

    useEffect(() => {
        if (logsContainerRef.current) {
            if (isStickingToBottom) {
                logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
            }
        }
    }, [logs, isStickingToBottom]);

    const handleStickToBottom = () => {
        setIsStickingToBottom(!isStickingToBottom);
    };

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
            <ul>
                {logs.length === 0 && <li>{'> Start a tool to view logs...'}</li>}
                {logs.map((log, i) => (
                    <li key={i}>
                        {`> ${JSON.stringify(log)}`}
                        <br />
                        <br />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Logs;