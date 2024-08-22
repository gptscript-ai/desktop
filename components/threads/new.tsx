import {
  Button,
  DropdownMenu,
  Dropdown,
  DropdownTrigger,
  DropdownSection,
  DropdownItem,
} from '@nextui-org/react';
import { createThread, Thread } from '@/actions/threads';
import { useEffect, useState, useContext } from 'react';
import { ScriptContext } from '@/contexts/script';
import { GoPlus } from 'react-icons/go';
import { getScripts, Script } from '@/actions/me/scripts';
import { setWorkspaceDir } from '@/actions/workspace';
import { AuthContext } from '@/contexts/auth';
import { tildy } from '@/config/assistant';

interface NewThreadProps {
  className?: string;
}

const NewThread = ({ className }: NewThreadProps) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { me } = useContext(AuthContext);
  const { setThread, setSelectedThreadId, setScript, setThreads, setScriptId } =
    useContext(ScriptContext);

  const fetchScripts = async () => {
    setScripts([]);
    const resp = await getScripts({ owner: me?.username });
    setScripts(
      (resp.scripts || [])
        .sort((a, b) => {
          // updatedAt should always be set.
          if (!a.updatedAt || !b.updatedAt) return 0;
          if (a.updatedAt < b.updatedAt) return 1;
          if (a.updatedAt > b.updatedAt) return -1;
          return 0;
        })
        .slice(0, 3)
    );
  };

  useEffect(() => {
    fetchScripts();
  }, [isOpen]);

  const handleCreateThread = (script: string, id?: string) => {
    createThread(script, '', id).then((newThread) => {
      setScriptId(id);
      setThreads((threads: Thread[]) => [newThread, ...threads]);
      setScript(script);
      setThread(newThread.meta.id);
      setSelectedThreadId(newThread.meta.id);
      setWorkspaceDir(newThread.meta.workspace);
    });
  };

  return (
    <Dropdown placement="right-start">
      <DropdownTrigger>
        <Button
          startContent={<GoPlus />}
          className={`${className}`}
          size="lg"
          variant="light"
          isIconOnly
        />
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownSection title="Default" showDivider>
          <DropdownItem
            aria-label={'Tildy'}
            color="primary"
            key={'Tildy'}
            className="py-2 truncate max-w-[200px]"
            content={'Tildy'}
            onClick={() => {
              handleCreateThread(tildy, '');
            }}
          >
            {'Tildy'}
          </DropdownItem>
        </DropdownSection>
        <DropdownSection title="Recent Assistant" showDivider>
          {scripts.map((script, i) => (
            <DropdownItem
              key={i}
              color="primary"
              className="py-2 truncate max-w-[200px]"
              onClick={() => {
                handleCreateThread(script.publicURL!, script.id?.toString());
                setIsOpen(false);
              }}
            >
              {script.displayName}
            </DropdownItem>
          ))}
        </DropdownSection>
        <DropdownSection title="Explore">
          <DropdownItem key="My Assistants" href="/build">
            {'My Assistants'}
          </DropdownItem>
          <DropdownItem key="All Assistants" href="/explore">
            {'Explore Assistants'}
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

export default NewThread;
