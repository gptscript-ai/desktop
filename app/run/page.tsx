"use client"

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Script from "@/components/script";
import Threads from "@/components/threads";
import { Thread } from '@/actions/threads';

const Run = () => {
    const [file, setFile] = useState<string>(useSearchParams().get('file') || '');
    const [thread, setThread] = useState<string>(useSearchParams().get('thread') || '');
    const [threads, setThreads] = useState<Thread[]>([]);
    const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

	return (
        <div className="w-full h-full flex pb-10">
            <Threads 
                setThread={setThread}
                setScript={setFile}
                setThreads={setThreads}
                threads={threads}
                selectedThreadId={selectedThreadId} 
                setSelectedThreadId={setSelectedThreadId}
            />
            <div className="mx-auto w-1/2">
			    <Script 
                    enableThreads 
                    className="pb-10"
                    file={file}
                    thread={thread}
                    setThreads={setThreads}
                    setSelectedThreadId={setSelectedThreadId}
                />
            </div>
        </div>
	);
};

export default Run;
