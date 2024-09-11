'use client';

import { useSearchParams } from 'next/navigation';
import React, { Suspense, useContext, useEffect, useState } from 'react';
import Chat from '@/components/chat';
import Threads from '@/components/threads';
import { ChatContextProvider } from '@/contexts/chat';
import { NavContext } from '@/contexts/nav';
import ExploreModal from '@/components/explore/ExploreModal';
import { useDisclosure } from '@nextui-org/react';

function RunFile() {
  const [script, _setScript] = useState<string>(
    useSearchParams().get('file') ?? ''
  );
  const [scriptId, _scriptId] = useState<string>(
    useSearchParams().get('id') ?? ''
  );
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { setCurrent } = useContext(NavContext);

  useEffect(() => setCurrent('/'), []);

  return (
    <ChatContextProvider
      initialScript={script}
      initialScriptId={scriptId}
      enableThread={true}
    >
      <div className="w-full h-full flex">
        <Threads onOpenExplore={onOpen} />

        <div className="flex-auto overflow-hidden">
          <Chat showAssistantName />
        </div>
      </div>
      <ExploreModal isOpen={isOpen} onOpen={onOpen} onClose={onClose} />
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
