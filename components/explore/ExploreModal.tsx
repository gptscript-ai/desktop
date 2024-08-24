'use client';

import { useState, useEffect, useContext, useCallback } from 'react';
import { ParsedScript } from '@/actions/me/scripts';
import { getScripts } from '@/actions/me/scripts';
import { Input } from '@nextui-org/input';
import { AuthContext } from '@/contexts/auth';
import {
  Card,
  CardHeader,
  CardBody,
  Select,
  SelectItem,
  Chip,
  Divider,
  Avatar,
  Button,
  Modal,
  ModalContent,
  ModalBody,
  ModalHeader,
  Tooltip,
} from '@nextui-org/react';
import Loading from '@/components/loading';
import { GoPerson, GoSearch } from 'react-icons/go';
import ScriptModal from '@/components/explore/scriptModal';
import { debounce } from 'lodash';
import { MdOutlineTravelExplore } from 'react-icons/md';
import { NavContext } from '@/contexts/nav';
import { BsGithub, BsTrello } from 'react-icons/bs';
import { VscAzure } from 'react-icons/vsc';
import { FaAws, FaDigitalOcean } from 'react-icons/fa';
import { SiAmazoneks, SiGooglecloud, SiKubernetes } from 'react-icons/si';
import { CiStar } from 'react-icons/ci';
import { IoStarSharp } from 'react-icons/io5';

interface ExploreModalProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export default function ExploreModal({ isOpen, onClose }: ExploreModalProps) {
  const [scripts, setScripts] = useState<ParsedScript[]>([]);
  const [filteredScripts, setFilteredScripts] = useState<ParsedScript[]>([]);
  const [loading, setLoading] = useState(true);
  const { authenticated } = useContext(AuthContext);
  const { setCurrent } = useContext(NavContext);
  const [open, setOpen] = useState(false);
  const [selectedScript, setSelectedScript] = useState<ParsedScript>(
    {} as ParsedScript
  );
  const [next, setNext] = useState<string | undefined>('');
  const [nextLoading, setNextLoading] = useState(false);
  const [query, setQuery] = useState<string>('');
  const [filter, setFilter] = useState<string>('featured');
  const [owner, setOwner] = useState<string>('');
  const [visibility, setVisibility] = useState<
    'public' | 'private' | undefined
  >();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    setFavorites(
      new Set(
        Object.values(
          JSON.parse(localStorage.getItem('FavoriteAssistants') || '{}')
        )
      )
    );
  }, []);

  const iconForAssistant = (name: string) => {
    const incoming = name.toLowerCase();
    if (incoming.includes('trello')) {
      return <BsTrello className="text-3xl" />;
    } else if (incoming.includes('azure')) {
      return <VscAzure className="text-3xl" />;
    } else if (incoming.includes('aws')) {
      return <FaAws className="text-3xl" />;
    } else if (incoming.replace(' ', '').includes('digitalocean')) {
      return <FaDigitalOcean className="text-3xl" />;
    } else if (incoming.includes('github')) {
      return <BsGithub className="text-3xl" />;
    } else if (incoming.includes('eks')) {
      return <SiAmazoneks className="text-3xl" />;
    } else if (incoming.includes('kubernetes')) {
      return <SiKubernetes className="text-3xl" />;
    } else if (incoming.replace(' ', '').includes('googlecloud')) {
      return <SiGooglecloud className="text-3xl" />;
    } else {
      return <GoPerson className="text-3xl" />;
    }
  };

  const refresh = useCallback(() => {
    setLoading(true);
    getScripts({
      limit: 10,
      search: query,
      visibility: visibility,
      filter:
        (query || owner || visibility) && filter === 'featured' ? '' : filter,
      owner: owner,
    })
      .then((resp) => {
        setNext(resp.continue);
        setScripts(resp.scripts || []);
        setFilteredScripts(resp.scripts || []);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [query, filter, owner, visibility]);

  useEffect(() => {
    setCurrent('/explore');
  }, []);

  useEffect(() => {
    if (authenticated) {
      refresh();
    }
  }, [authenticated, query, filter, owner, visibility]);

  const onToggleFavorite = (scriptId?: string) => {
    if (!scriptId) return;

    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(scriptId)) {
        newFavorites.delete(scriptId);
      } else {
        newFavorites.add(scriptId);
      }
      localStorage.setItem(
        'FavoriteAssistants',
        JSON.stringify(Array.from(newFavorites))
      );
      return newFavorites;
    });
  };

  return (
    <Modal
      backdrop="opaque"
      isOpen={isOpen}
      onClose={onClose}
      scrollBehavior="inside"
      classNames={{
        base: 'w-[80vw] h-[80vh] max-w-none max-h-none',
      }}
    >
      <ModalContent>
        <ModalHeader className="mt-4 justify-between">
          <h1 className="text-4xl font-bold text-primary-400">
            <MdOutlineTravelExplore className="inline mb-2 mr-1 text-5xl" />{' '}
            Explore
          </h1>
          <div className="w-3/4 flex justify-end space-x-4">
            <Input
              radius="lg"
              label="Owners"
              color="primary"
              size="sm"
              className="w-1/6"
              variant="bordered"
              classNames={{
                label: 'text-gray-500 dark:text-gray-400',
                input: 'text-black dark:text-white',
              }}
              isClearable
              onClear={() => setOwner('')}
              onChange={(e) => {
                if (!e.target.value) setOwner('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setOwner(e.currentTarget.value.toLowerCase());
                }
              }}
            />
            <Select
              radius="lg"
              label="Visibility"
              color="primary"
              size="sm"
              aria-label="visibility"
              className="w-1/6"
              variant="bordered"
              classNames={{
                label: 'text-gray-500 dark:text-gray-400',
                value: 'text-black dark:text-white',
              }}
              onChange={(e) => {
                setVisibility(
                  e.target.value as 'public' | 'private' | undefined
                );
              }}
            >
              <SelectItem key="public" value="public">
                Public
              </SelectItem>
              <SelectItem key="private" value="private">
                Private
              </SelectItem>
            </Select>
            <Input
              radius="lg"
              label="Tags"
              color="primary"
              size="sm"
              className="w-1/6"
              variant="bordered"
              classNames={{
                label: 'text-gray-500 dark:text-gray-400',
                input: 'text-black dark:text-white',
              }}
              isClearable
              onClear={() => setFilter('featured')}
              onChange={(e) => {
                if (!e.target.value) setFilter('featured');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setFilter(e.currentTarget.value.toLowerCase());
                }
              }}
            />
            <Input
              startContent={<GoSearch />}
              placeholder="Search"
              color="primary"
              variant="bordered"
              isClearable
              size="lg"
              className="w-1/5"
              onClear={() => setQuery('')}
              onChange={(e) => {
                if (e.target.value === '') setQuery('');
              }}
              onKeyDown={debounce((e) => {
                if (e.key === 'Enter') {
                  setQuery(e.currentTarget.value.toLowerCase());
                }
              })}
            />
          </div>
        </ModalHeader>
        <ModalBody className="m-4">
          {loading ? (
            <Loading />
          ) : (
            <div className={'pb-10'}>
              <ScriptModal
                script={selectedScript}
                open={open}
                setOpen={setOpen}
                onCloseExplore={onClose}
                refresh={refresh}
                favorites={favorites}
                onToggleFavorite={onToggleFavorite}
              />
              <div className="grid gap-12 grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 4xl:grid-cols-4">
                {filteredScripts.map((script) => (
                  <div
                    key={script.displayName}
                    onClick={() => {
                      setSelectedScript(script);
                      setOpen(true);
                    }}
                  >
                    <Card
                      className="h-[350px] border-2 border-white dark:bg-zinc-900 p-6 dark:border-zinc-900 hover:border-primary hover:shadow-2xl dark:hover:border-primary cursor-pointer transition duration-300 ease-in-out transform hover:scale-105"
                      key={script.displayName}
                      shadow="md"
                    >
                      <CardHeader className="block">
                        <div className="flex space-x-4 w-full items-center">
                          <Avatar
                            color="primary"
                            icon={iconForAssistant(
                              script.agentName
                                ? script.agentName
                                : script.displayName || ''
                            )}
                            classNames={{ base: 'w-14 h-14 p-2' }}
                          />
                          <div style={{ width: 'calc(100% - 70px)' }}>
                            <div className="flex justify-between items-center">
                              <h1 className="text-2xl font-medium truncate">
                                {script.agentName
                                  ? script.agentName
                                  : script.displayName}
                              </h1>
                              <Tooltip content="Add to My Favorites">
                                <Button
                                  isIconOnly
                                  className={`bg-white ${favorites.has(script.id?.toString() ?? '-1') ? 'text-yellow-500' : 'text-gray-500'}`}
                                  onClick={() =>
                                    onToggleFavorite(script.id?.toString())
                                  }
                                >
                                  {favorites.has(
                                    script.id?.toString() ?? '-1'
                                  ) ? (
                                    <IoStarSharp size={32} />
                                  ) : (
                                    <CiStar size={32} />
                                  )}
                                </Button>
                              </Tooltip>
                            </div>
                            <p className="block truncate">
                              <span className="text-primary text-sm">
                                {script.owner}
                              </span>
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-1 w-[90%] overflow-x-auto pt-10 pb-2">
                          {script.tags?.map((tag) => (
                            <Chip size="sm" className="pb-0 mb-0" key={tag}>
                              {tag}
                            </Chip>
                          ))}
                        </div>
                        <Divider className="mt-4" />
                      </CardHeader>
                      <CardBody>
                        <p className="text-wrap text-sm text-zinc-500">
                          {script.description
                            ? script.description
                            : 'No description provided'}
                        </p>
                      </CardBody>
                    </Card>
                  </div>
                ))}
                {next && (
                  <Button
                    isLoading={nextLoading}
                    color="primary"
                    size="lg"
                    className="col-span-1 lg:col-span-2 2xl:col-span-3 4xl:col-span-4"
                    onPress={() => {
                      setNextLoading(true);
                      getScripts({
                        limit: 10,
                        filter:
                          (query || owner || visibility) &&
                          filter === 'featured'
                            ? ''
                            : filter,
                        search: query,
                        visibility: visibility,
                        owner: owner,
                        continue: next,
                      })
                        .then((resp) => {
                          if (resp.continue) setNext(resp.continue);
                          else setNext(undefined);
                          setScripts([...scripts, ...(resp.scripts || [])]);
                          setFilteredScripts([
                            ...filteredScripts,
                            ...(resp.scripts || []),
                          ]);
                        })
                        .catch((error) => console.error(error))
                        .finally(() => setNextLoading(false));
                    }}
                  >
                    Load More
                  </Button>
                )}
              </div>
            </div>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
