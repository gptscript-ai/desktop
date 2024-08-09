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
        <div></div>
    );
}

export default function Run() {
    return (
        <Suspense>
            <RunFile/>
        </Suspense>
    )
}
