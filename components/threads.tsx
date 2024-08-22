import { useState, useContext } from 'react';
import New from './threads/new';
import Menu from './threads/menu';
import { Button, Divider, Tooltip } from '@nextui-org/react';
import { GoSidebarExpand, GoSidebarCollapse } from 'react-icons/go';
import { ScriptContext } from '@/contexts/script';

interface ThreadsProps {
  className?: string;
}

const Threads: React.FC<ThreadsProps> = () => {
  const {
    setScript,
    setScriptContent,
    setThread,
    threads,
    setScriptId,
    selectedThreadId,
    setSelectedThreadId,
  } = useContext(ScriptContext);

  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleRun = async (script: string, id: string, scriptId: string) => {
    setScriptContent(null);
    setScript(script);
    setThread(id);
    setScriptId(scriptId);
    setSelectedThreadId(id);
  };

  const isSelected = (id: string) => id === selectedThreadId;

  return (
    <div
      className={`relative p-4 overflow-y-auto ${isCollapsed ? 'border-none' : 'border-r-1 dark:border-r-zinc-800'}`}
    >
      <div className={`flex justify-between items-center mb-2`}>
        <Tooltip
          content={isCollapsed ? 'Expand threads' : 'Collapse threads'}
          placement="top"
          closeDelay={0.5}
          radius="full"
        >
          <Button
            startContent={
              isCollapsed ? <GoSidebarCollapse /> : <GoSidebarExpand />
            }
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="light"
            size="lg"
            isIconOnly
          />
        </Tooltip>
        <New />
      </div>
      <div
        style={{
          width: isCollapsed ? '50px' : 'max-w-[300px]',
          transition: 'width 0.3s ease-in-out',
        }}
      >
        <Divider
          className="mb-4"
          style={{
            opacity: isCollapsed ? 0 : 1,
            transition: 'opacity 0.2s 0.2s',
          }}
        />
        <div
          style={{
            opacity: isCollapsed ? 0 : 1,
            transition: 'opacity 0.05s 0.05s',
            pointerEvents: isCollapsed ? 'none' : 'auto',
          }}
        >
          <div className="space-y-2">
            {threads.length === 0 ? (
              <div className=" text-center text-sm text-gray-500">
                No threads created yet...
              </div>
            ) : (
              threads.map((thread, key) => (
                <Tooltip
                  key={key}
                  content={thread.meta.name}
                  placement="right"
                  className="max-w-[300px]"
                  delay={1000}
                  closeDelay={0.5}
                >
                  <div
                    key={key}
                    className={`border-1 border-gray-300 px-4 rounded-xl transition duration-150 ease-in-out ${isSelected(thread.meta.id) ? 'bg-primary border-primary dark:border-primary-50 dark:bg-primary-50 text-white' : 'hover:bg-gray-100 dark:hover:bg-zinc-700 cursor-pointer dark:bg-zinc-800 dark:border-zinc-800'} `}
                    onClick={() =>
                      handleRun(
                        thread.meta.script,
                        thread.meta.id,
                        thread.meta.scriptId || ''
                      )
                    }
                  >
                    <div className="flex justify-between items-center">
                      <h2 className="text-sm truncate">{thread.meta.name}</h2>
                      <Menu
                        thread={thread.meta.id}
                        className={
                          isSelected(thread.meta.id) ? 'text-white' : ''
                        }
                      />
                    </div>
                  </div>
                </Tooltip>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Threads;
