'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useContext, useEffect, useState } from 'react';
import Chat from '@/components/chat';
import Threads from '@/components/threads';
import { ChatContextProvider } from '@/contexts/chat';
import { NavContext } from '@/contexts/nav';
import { tildy } from '@/config/assistant';

function RunFile() {
  const [script, _setScript] = useState<string>(
    useSearchParams().get('file') ?? tildy
  );
  const [scriptId, _scriptId] = useState<string>(
    useSearchParams().get('id') ?? ''
  );

  const { setCurrent } = useContext(NavContext);

  useEffect(() => setCurrent('/'), []);

  return (
    <ChatContextProvider
      initialScript={script}
      initialScriptId={scriptId}
      enableThread={true}
    >
      <section className="absolute left-0 top-[50px]">
        <div
          className="border-t-1 dark:border-zinc-800"
          style={{ width: `100vw`, height: `calc(100vh - 50px)` }}
        >
          <div className="w-full h-full flex pb-10">
            <Threads />
            <div className="mx-auto w-[75%] 2xl:w-[55%] 3xl:[w-50%]">
              <Chat showAssistantName className="px-4 pb-10" />
            </div>
          </div>
        </div>
      </section>
    </ChatContextProvider>
  );
}

export default function Run() {
  return (
    <Suspense>
      <RunFile />
    </Suspense>
  );
}
