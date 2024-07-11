import {Popover, PopoverTrigger, PopoverContent, Button, Menu, MenuItem, MenuSection, Tooltip} from "@nextui-org/react";
import { createThread, Thread } from '@/actions/threads';
import { fetchScripts } from '@/actions/scripts/fetch';
import { useEffect, useState } from 'react';
import { GoPencil, GoPersonFill, GoPlus } from "react-icons/go";

interface NewThreadProps {
    className?: string;
    setSelectedThreadId: React.Dispatch<React.SetStateAction<string | null>>;
    setThread: React.Dispatch<React.SetStateAction<string>>;
    setScript: React.Dispatch<React.SetStateAction<string>>;
    setThreads: React.Dispatch<React.SetStateAction<Thread[]>>;
}

const NewThread = ({ className, setThread, setSelectedThreadId, setScript, setThreads }: NewThreadProps) => {
    const [scripts, setScripts] = useState<Record<string, string>>({});
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        fetchScripts().then((data) => {
            setScripts(data);
        });
    }, []);

    const handleCreateThread = (script: string) => {
        createThread(script).then((newThread) => {
            setThreads((threads: Thread[]) => [newThread, ...threads]);
            setScript(script.replace('.gpt', ''));
            setThread(newThread.meta.id);
            setSelectedThreadId(newThread.meta.id);
        });
    };

    return (
        <Popover placement="right" isOpen={isOpen} onOpenChange={(open)=> setIsOpen(open)}>
            <PopoverTrigger>
                <Button startContent={<GoPlus />} className={`${className}`} size="lg" variant="light" isIconOnly/>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col space-y-3 p-4">
                <Menu aria-label="my-scripts">
                    <MenuSection aria-label={"my-scripts"} title="My Scripts">
                        {Object.keys(scripts).map((script,i) => (
                            <MenuItem aria-label={script} key={i} color="primary" className="py-2 truncate max-w-[200px]" content={script} onClick={() => { handleCreateThread(script); setIsOpen(false)}}>
                                {script}
                            </MenuItem>
                        ))}    
                    </MenuSection>
                </Menu>
            </PopoverContent>
        </Popover>
    );
};

export default NewThread;