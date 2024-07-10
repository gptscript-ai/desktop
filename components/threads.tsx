import React, { useState, useEffect } from 'react';
import { Button } from '@nextui-org/react';
import { GoPlay, GoTrash } from 'react-icons/go';
import New from './threads/new';
import { getThreads, deleteThread, Thread } from '@/actions/threads';

interface ThreadsProps {
    className?: string;
    setThread: (thread: string) => void;
    setScript: (script: string) => void;
}

const Threads: React.FC<ThreadsProps> = ({ className, setThread, setScript }) => {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

    useEffect(() => { fetchThreads() }, []);

    const fetchThreads = async () => {
        const threads = await getThreads();
        setThreads(threads);
    };

    const handleDelete = async (id: string) => {
        await deleteThread(id);
        fetchThreads();
    };

    const handleRun = async (script: string, id: string) => {
        setScript(script);
        setThread(id);
        setSelectedThreadId(id); // Update the selected thread ID
    };

    const isSelected = (id: string) => id === selectedThreadId;

    return (
        <div className={`mt-4 ml-4 overflow-y-auto space-y-2 ${className}`}>
            <New className="w-full" />
            {threads.map((thread, key) => (
                <div key={key} className={`border-1 dark:border-none px-4 py-1.5 rounded-xl ${isSelected(thread.meta.id) ? 'bg-blue-100' : ''}`} >
                    <div className="flex justify-between items-center">
                        <h2 className="text-sm">{thread.meta.name}</h2>
                        <div>
                            <Button startContent={<GoTrash />} size="sm" radius="full" variant="light" isIconOnly onClick={() => handleDelete(thread.meta.id)} />
                            <Button startContent={<GoPlay />} size="sm" radius="full" variant="light" isIconOnly onClick={() => handleRun(thread.meta.script, thread.meta.id)} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Threads;