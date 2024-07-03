import { 
    createThread,
    updateThread,
    getThread,
    getThreads,
    deleteThread,
    Thread,
} from '@/actions/threads';
import React, { useState } from 'react';
import { Input, Textarea, Button, Card, CardBody } from '@nextui-org/react';
import { useEffect } from 'react';
import { GoPlay, GoTrash } from 'react-icons/go';

interface ThreadsProps {
    className?: string;
}

const Threads: React.FC<ThreadsProps> = ({className}) => {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [script, setScript] = useState('');
    const [description, setDescription] = useState('');
    
    useEffect(() => { fetchThreads() }, []);

    const fetchThreads = async () => {
        const threads = await getThreads();
        setThreads(threads);
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        createThread(script);
        setScript('');
        setDescription('');
        fetchThreads();
    };

    const handleDelete = async (id: string) => {
        await deleteThread(id);
        fetchThreads();
    };

    return (
        <div className={`flex flex-col space-y-2 mt-4 ml-4 ${className}`}>
            {threads.map(thread => (
                <Card shadow="none" className="border-1" >
                    <CardBody>
                        <div key={thread.meta.id} className="flex justify-between items-center">
                            <div>
                                <h2>{thread.meta.name}</h2>
                                <h2 className="text-sm text-zinc-400">{thread.meta.script}</h2>
                            </div>
                            <div>
                                <Button startContent={<GoTrash />} size="sm" radius="full" variant="light" isIconOnly onClick={() => handleDelete(thread.meta.id)}/>
                                <Button startContent={<GoPlay />} size="sm" radius="full" variant="light" isIconOnly onClick={() => alert('Will launch thread')}/>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            ))}
        </div>
    );
}

export default Threads;