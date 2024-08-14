import {Popover, PopoverTrigger, PopoverContent, Button, Menu, MenuItem, MenuSection} from "@nextui-org/react";
import {createThread, Thread} from '@/actions/threads';
import {useEffect, useState, useContext} from 'react';
import {ScriptContext} from '@/contexts/script';
import {GoPlus } from "react-icons/go";
import {getScripts, Script} from "@/actions/me/scripts";

interface NewThreadProps {
    className?: string;
}

const NewThread = ({className}: NewThreadProps) => {
    const [scripts, setScripts] = useState<Script[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const {
        workspace,
        setThread,
        setSelectedThreadId,
        setScript,
        setThreads,
        scriptId,
    } = useContext(ScriptContext);

    const fetchScripts = async () => {
        setScripts([]);
        const resp = await getScripts();
        setLoading(false);
        setScripts(resp.scripts || []);
    }

    useEffect(() => { fetchScripts() }, [isOpen]);

    const handleCreateThread = (script: string) => {
        createThread(script, '', scriptId).then((newThread) => {
            setThreads((threads: Thread[]) => [newThread, ...threads]);
            setScript(script);
            setThread(newThread.meta.id);
            setSelectedThreadId(newThread.meta.id);
            setLoading(false);
        });
    };

    return (
        <Popover placement="right" isOpen={isOpen} onOpenChange={(open) => setIsOpen(open)}>
            <PopoverTrigger>
                <Button startContent={<GoPlus/>} className={`${className}`} size="lg" variant="light" isIconOnly/>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col space-y-3 p-4">
                <Menu aria-label="my-scripts">
                    <MenuSection aria-label={"my-scripts"} title="Select a script">
                        {scripts.map((script, i) => (
                            <MenuItem
                                aria-label={script.displayName}
                                key={i} color="primary"
                                className="py-2 truncate max-w-[200px]"
                                content={script.displayName}
                                onClick={() => {
                                    handleCreateThread(script.publicURL!); setIsOpen(false)
                                }}
                            >
                                {script.displayName}
                            </MenuItem>
                        ))}
                    </MenuSection>
                </Menu>
            </PopoverContent>
        </Popover>
    );
};

export default NewThread;
