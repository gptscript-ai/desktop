'use client';

import { useEffect, useState, Suspense, useContext } from 'react';
import { useSearchParams } from 'next/navigation';
import Configure from '@/components/edit/configure';
import { EditContextProvider } from '@/contexts/edit';
import { ChatContextProvider } from '@/contexts/chat';
import New from '@/components/edit/new';
import ScriptNav from '@/components/edit/scriptNav';
import { NavContext } from '@/contexts/nav';

function EditFile() {
  const [file, setFile] = useState<string>(useSearchParams().get('file') || '');
  const [scriptId] = useState<string>(useSearchParams().get('id') || '');
  const [collapsed, setCollapsed] = useState(false);

  const { setCurrent } = useContext(NavContext);
  useEffect(() => setCurrent('/build'), []);

  return !file || file === 'new' ? (
    <div className="w-full h-full flex items-center justify-center align-center">
      <div className="absolute left-2 top-2">
        <ScriptNav collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>
      <New className="w-1/2" setFile={setFile} />
    </div>
  ) : (
    <ChatContextProvider
      initialScript={file}
      initialScriptId={scriptId}
      enableThread={false}
    >
      <EditContextProvider scriptPath={file} initialScriptId={scriptId}>
        <div
          className={`w-full h-full grid ${collapsed ? 'grid-cols-4' : 'grid-cols-2'}`}
        >
          <div className="absolute left-6 top-6">
            <ScriptNav collapsed={collapsed} setCollapsed={setCollapsed} />
          </div>
          <Configure collapsed={collapsed} />
        </div>
      </EditContextProvider>
    </ChatContextProvider>
  );
}

export default function Edit() {
  return (
    <Suspense>
      <EditFile />
    </Suspense>
  );
}
