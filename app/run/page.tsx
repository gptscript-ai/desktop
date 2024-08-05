"use client"

import {useSearchParams} from 'next/navigation';
import {Suspense, useState} from 'react';
import Script from "@/components/script";
import Threads from "@/components/threads";
import { ScriptContextProvider } from '@/contexts/script';

function RunFile() {
    const [script, _setScript] = useState<string>(useSearchParams().get('file') ?? '');
    const [thread, _setThread] = useState<string>(useSearchParams().get('thread') ?? '')
    const [scriptId, _scriptId] = useState<string>(useSearchParams().get('id') ?? '');

    return (
        <ScriptContextProvider initialScript={script} initialThread={thread} initialScriptId={scriptId}>
            <div className="w-full h-full flex pb-10">
                <Threads />
                <div className="mx-auto w-1/2">
                    <Script 
                        enableThreads 
                        className="pb-10"
                    />
                </div>
            </div>
        </ScriptContextProvider>
    );
}

export default function Run() {
    return (
        <Suspense>
            <RunFile/>
        </Suspense>
    )
}
