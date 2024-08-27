import {
  Button,
  DropdownMenu,
  Dropdown,
  DropdownTrigger,
  DropdownSection,
  DropdownItem,
} from '@nextui-org/react';
import { useEffect, useState, useContext } from 'react';
import { ChatContext } from '@/contexts/chat';
import { RiChatNewLine } from 'react-icons/ri';
import { getScript, getScripts, Script } from '@/actions/me/scripts';
import { AuthContext } from '@/contexts/auth';
import { tildy } from '@/config/assistant';

interface NewThreadProps {
  className?: string;
  onOpenExplore: () => void;
}

const NewThread = ({ className, onOpenExplore }: NewThreadProps) => {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { me } = useContext(AuthContext);
  const { handleCreateThread } = useContext(ChatContext);
  const [favorites, setFavorites] = useState<Script[]>([]);

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

    const favoriteScriptIds = Object.values(
      JSON.parse(localStorage.getItem('FavoriteAssistants') || '{}')
    );

    const favoriteScripts = await Promise.all(
      favoriteScriptIds.map(async (id) => {
        const script = await getScript(id as string);
        if (!script) return;
        return script;
      })
    );

    setFavorites(
      ((favoriteScripts || []).filter((s) => s) as Script[])
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

  return (
    <Dropdown placement="right-start">
      <DropdownTrigger>
        <Button
          startContent={<RiChatNewLine />}
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
        <DropdownSection title="Recent Assistants" showDivider>
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
        <DropdownSection title="Favorites" showDivider>
          {favorites.map((script, i) => (
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
          <DropdownItem key="All Assistants" onClick={onOpenExplore}>
            {'Explore Assistants'}
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

export default NewThread;
