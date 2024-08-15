'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useContext, useEffect, useState } from 'react';
import Script from '@/components/script';
import Threads from '@/components/threads';
import { ScriptContextProvider } from '@/contexts/script';
import { NavContext } from '@/contexts/nav';

function RunFile() {
  const [script, _setScript] = useState<string>(
    useSearchParams().get('file') ?? 'github.com/gptscript-ai/ui-assistant'
  );
  const [thread, _setThread] = useState<string>(
    useSearchParams().get('thread') ?? ''
  );
  const [scriptId, _scriptId] = useState<string>(
    useSearchParams().get('id') ?? ''
  );
  const { setCurrent } = useContext(NavContext);

  useEffect(() => setCurrent('/'), []);

  return (
    <ScriptContextProvider
      initialScript={script}
      initialThread={thread}
      initialScriptId={scriptId}
    >
      <section className="absolute left-0 top-[50px]">
        <div
          className="border-t-1 dark:border-zinc-800"
          style={{ width: `100vw`, height: `calc(100vh - 50px)` }}
        >
          <div className="w-full h-full flex pb-10">
            <Threads />
            <div className="mx-auto w-[75%] 2xl:w-[55%] 3xl:[w-50%]">
              <Script enableThreads showAssistantName className="pb-10" />
            </div>
          </div>
        </div>
      </section>
    </ScriptContextProvider>
  );
}

export default function Run() {
  return (
    <Suspense>
      <RunFile />
    </Suspense>
  );
}
