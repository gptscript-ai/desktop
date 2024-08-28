'use client';

import React, { useCallback, useContext, useEffect, useState } from 'react';
import { GoPencil, GoTrash } from 'react-icons/go';
import Loading from '@/components/loading';
import {
  createScript,
  deleteScript,
  getScript,
  getScripts,
  ParsedScript,
  Script,
} from '@/actions/me/scripts';
import { AuthContext } from '@/contexts/auth';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Divider,
  ScrollShadow,
} from '@nextui-org/react';
import { LuMessageSquare } from 'react-icons/lu';
import { FaCopy } from 'react-icons/fa';
import { Tool } from '@gptscript-ai/gptscript/src/gptscript';
import { stringify } from '@/actions/gptscript';
import { deleteDataset } from '@/actions/knowledge/knowledge';

interface ScriptsProps {
  showFavorites?: boolean;
}

export default function Scripts({ showFavorites }: ScriptsProps) {
  const [scripts, setScripts] = useState<ParsedScript[]>([]);
  const [favoriteScripts, setFavoriteScripts] = useState<ParsedScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const { authenticated, me } = useContext(AuthContext);

  const refresh = async () => {
    if (!showFavorites) {
      const scripts = await getScripts({ owner: me?.username });
      setScripts(scripts.scripts || []);
    } else {
      const favoriteScriptIds = Object.values(
        JSON.parse(localStorage.getItem('FavoriteAssistants') || '{}')
      );

      const favorites = await Promise.all(
        favoriteScriptIds.map(async (id) => {
          const script = await getScript(id as string);
          if (!script) return;
          return script;
        })
      );
      setFavoriteScripts((favorites || []).filter((s) => s) as ParsedScript[]);
    }

    setLoading(false);
  };

  const handleDelete = useCallback(async (script: ParsedScript) => {
    await deleteScript(script);
    setScripts((scripts) =>
      scripts.filter((currScript) => currScript.id !== script.id)
    );
    if (script.id) {
      await deleteDataset(script.id.toString());
    }
  }, []);

  const onClickCopy = async (script: ParsedScript) => {
    if (!script.id) {
      return;
    }
    setIsCopying(true);
    const toCreate: Script = {
      displayName: 'Copy of ' + script.agentName ?? script.displayName,
      visibility: 'private',
    };
    if (script.script.length > 0 && script.script[0].type === 'tool') {
      (script.script[0] as Tool).name = toCreate.displayName;
    }
    toCreate.content = await stringify(script.script);
    toCreate.slug =
      toCreate.displayName?.toLowerCase().replaceAll(' ', '-') +
      '-' +
      Math.random().toString(36).substring(2, 7);

    const { id } = await createScript(toCreate);
    if (!id) {
      console.error('failed to create script');
      setIsCopying(false);
      return;
    }
    const createdScript = await getScript(id?.toString());
    if (!createdScript) {
      console.error('failed to get created script');
      setIsCopying(false);
      return;
    }
    setIsCopying(false);
    window.location.href = `/edit?file=${createdScript.publicURL}&id=${createdScript.id}`;
  };

  useEffect(() => {
    if (authenticated && me) {
      refresh();
    }
  }, [authenticated, me, showFavorites]);

  const ScriptItems = () =>
    authenticated ? (
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 4xl:grid-cols-4 w-full gap-10">
        {(showFavorites ? favoriteScripts : scripts).map((script) => (
          <Card key={script.id} className="p-4 h-[350px]">
            <CardHeader className="w-full grid grid-cols-1">
              <div className="flex justify-between">
                <div className="flex gap-3 items-center">
                  <h1 className="text-2xl truncate mb-6">
                    {script.agentName ? script.agentName : script.displayName}
                  </h1>
                </div>
              </div>
              <Divider />
            </CardHeader>
            <CardBody className="overflow-y-auto">
              <ScrollShadow size={8}>
                <p className="max-w-full max-h-full text-zinc-500">
                  {script.description
                    ? script.description
                    : 'No description provided.'}
                </p>
              </ScrollShadow>
            </CardBody>
            <CardFooter className="flex justify-between space-x-2">
              <Button
                className="w-full"
                startContent={<LuMessageSquare />}
                color="primary"
                variant="flat"
                onPress={() => {
                  window.location.href = `/?file=${script.publicURL}&id=${script.id}`;
                }}
              >
                Chat
              </Button>
              {me?.username === script.owner && !showFavorites && (
                <>
                  <Button
                    className="w-full"
                    variant="flat"
                    color="primary"
                    startContent={<GoPencil />}
                    onPress={() => {
                      window.location.href = `/edit?file=${script.publicURL}&id=${script.id}`;
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    className="w-full"
                    startContent={<GoTrash />}
                    variant="flat"
                    onPress={() => {
                      handleDelete(script);
                    }}
                  >
                    Delete
                  </Button>
                </>
              )}
              {showFavorites && (
                <>
                  <Button
                    className="w-full"
                    variant="flat"
                    color="primary"
                    startContent={<FaCopy />}
                    isLoading={isCopying}
                    onPress={() => onClickCopy(script)}
                  >
                    Make a Copy
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    ) : (
      <Card>
        <CardBody className="flex items-center h-full my-10">
          <p>Login to create your own files!</p>
        </CardBody>
      </Card>
    );

  return (
    <div>
      {loading ? (
        <div className="h-[50vh]">
          <Loading />
        </div>
      ) : (
        <ScriptItems />
      )}
    </div>
  );
}
