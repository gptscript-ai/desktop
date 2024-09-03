import CustomTool from '@/components/edit/configure/customTool';
import { EditContext } from '@/contexts/edit';
import { Button, Tooltip, useDisclosure } from '@nextui-org/react';
import PropTypes from 'prop-types';
import { useContext, useEffect, useRef, useState } from 'react';
import {
  AiFillFileAdd,
  AiOutlineKubernetes,
  AiOutlineSlack,
} from 'react-icons/ai';
import { BsCode, BsDownload, BsEye, BsFiles, BsFolder } from 'react-icons/bs';
import {
  FaAws,
  FaCode,
  FaDigitalOcean,
  FaGithub,
  FaGitlab,
  FaHubspot,
  FaPaintBrush,
  FaTrello,
} from 'react-icons/fa';
import {
  GoBrowser,
  GoFileDirectory,
  GoGlobe,
  GoPencil,
  GoQuestion,
  GoSearch,
  GoTerminal,
  GoTools,
  GoTrash,
} from 'react-icons/go';
import {
  PiMicrosoftExcelLogo,
  PiMicrosoftOutlookLogoDuotone,
} from 'react-icons/pi';
import {
  SiAmazoneks,
  SiGooglecloud,
  SiJson,
  SiMongodb,
  SiNotion,
  SiSupabase,
} from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';

import { getToolDisplayName } from '@/actions/gptscript';
import {
  CatalogListBox,
  ToolCatalogRef,
} from '@/components/chat/chatBar/CatalogListBox';
import { UrlToolModal } from '@/components/shared/tools/UrlToolModal';

interface ImportsProps {
  tools: string[] | undefined;
  setTools: (tools: string[]) => void;
  enableLocal?: boolean;
  className?: string;
}

const Imports: React.FC<ImportsProps> = ({
  tools,
  setTools,
  className,
  enableLocal = 'true',
}) => {
  // remoteTools contains a mapping of tool references to display names for
  const [remoteTools, setRemoteTools] = useState<Map<string, string>>(
    new Map()
  );
  const [localTools, setLocalTools] = useState<string[]>([]);
  const { createNewTool, deleteLocalTool } = useContext(EditContext);

  const updateRemoteTools = async (remoteRefs: string[]) => {
    const updatedRemoteTools = new Map(remoteTools);
    for (const ref of remoteRefs) {
      if (updatedRemoteTools.has(ref)) {
        // We've already the display name of this tool
        continue;
      }
      updatedRemoteTools.set(ref, await getToolDisplayName(ref));
    }

    setRemoteTools(() => {
      const newRemoteTools = new Map();
      updatedRemoteTools.forEach((value, key) => {
        newRemoteTools.set(key, value);
      });
      return newRemoteTools;
    });
  };

  useEffect(() => {
    if (tools) {
      setLocalTools(tools.filter((t) => !isRemote(t)));
      updateRemoteTools(tools.filter(isRemote)).catch((e) => {
        console.error('failed to update remote tools', e);
      });
    }
  }, [tools]);

  const deleteRemoteTool = (tool: string) => {
    // Remove the remote tool's display name mapping
    setRemoteTools((prevRemoteTools) => {
      const newRemoteTools = new Map(prevRemoteTools);
      newRemoteTools.delete(tool);
      return newRemoteTools;
    });

    // Remove the tool from the assistant
    setTools(tools!.filter((t) => t !== tool));
  };

  const urlToolModal = useDisclosure();

  const catalogRef = useRef<ToolCatalogRef>(null);
  const catalogMenu = useDisclosure();

  useEffect(() => {
    if (catalogMenu.isOpen) catalogRef.current?.focus();
  }, [catalogMenu.isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') catalogMenu.onClose();
    };

    document.addEventListener('keyup', handler);
    return () => {
      document.removeEventListener('keyup', handler);
    };
  }, [catalogMenu]);

  return (
    <div className={`${className}`}>
      {remoteTools && remoteTools.size > 0 && (
        <div className="grid grid-cols-1 gap-2 w-full mb-2">
          {Array.from(remoteTools.keys()).map((ref, i) => (
            <div key={i} className="flex space-x-2">
              <div className="truncate w-full border-2 dark:border-zinc-700 text-sm pl-2 rounded-lg flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  {iconForTool(ref)}
                  <p className="capitalize">{remoteTools.get(ref)!}</p>
                </div>
                <Button
                  variant="light"
                  isIconOnly
                  size="sm"
                  startContent={<GoTrash />}
                  onPress={() => deleteRemoteTool(ref)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
      {localTools && localTools.length > 0 && (
        <div className="grid grid-cols-1 gap-2 w-full mb-2">
          {localTools.map((tool, i) => (
            <div key={i} className="flex space-x-2">
              <div className="truncate w-full border-2 dark:border-zinc-700 text-sm pl-2 rounded-lg flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <GoTools />
                  <p className="">{tool}</p>
                </div>
                <div>
                  <CustomTool tool={tool} />
                  <Button
                    variant="light"
                    isIconOnly
                    size="sm"
                    startContent={<GoTrash />}
                    onPress={() => deleteLocalTool(tool)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className={`flex flex-col gap-2`}>
        <Tooltip
          content={
            <CatalogListBox
              equippedTools={tools || []}
              onAddTool={(tool) => {
                setTools([...(tools || []), tool]);
                catalogMenu.onClose();
              }}
              ref={catalogRef}
            />
          }
          isOpen={catalogMenu.isOpen}
        >
          <Button
            startContent={<GoTools />}
            variant="flat"
            className="w-full"
            color="primary"
            size="sm"
            onPress={catalogMenu.onOpenChange}
          >
            Featured Tools
          </Button>
        </Tooltip>

        <UrlToolModal
          isOpen={urlToolModal.isOpen}
          onAddTool={(tool) => {
            setTools([...(tools || []), tool]);
            urlToolModal.onClose();
          }}
          onClose={urlToolModal.onClose}
        />

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="flat"
            className="w-full"
            color="primary"
            startContent={<GoGlobe />}
            onClick={() => urlToolModal.onOpenChange()}
          >
            Add Tool via URL
          </Button>

          {enableLocal && (
            <Button
              size="sm"
              variant="flat"
              className="w-full"
              color="primary"
              startContent={<GoPencil />}
              onPress={() => createNewTool()}
            >
              Create a tool
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

Imports.propTypes = {
  // @ts-ignore
  tools: PropTypes.arrayOf(PropTypes.string).isRequired,
  setTools: PropTypes.func.isRequired,
  className: PropTypes.string,
  collapsed: PropTypes.bool,
  enableLocal: PropTypes.bool,
};

export default Imports;

function isRemote(ref: string): boolean {
  return (
    ref.startsWith('https://') ||
    ref.startsWith('http://') ||
    ref.startsWith('sys.') || // not local, but considered remote for the purposes of this component
    ref.startsWith('github.com')
  );
}

const toolIconMap = new Map<string, () => React.ReactNode>([
  [
    'github.com/gptscript-ai/gpt4-v-vision@gateway',
    () => <BsEye className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/dalle-image-generation@gateway',
    () => <FaPaintBrush className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/answers-from-the-internet',
    () => <GoGlobe className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/search-website',
    () => <GoSearch className="text-md" />,
  ],
  ['github.com/gptscript-ai/browser', () => <GoBrowser className="text-md" />],
  [
    'github.com/gptscript-ai/tools/apis/slack/write',
    () => <AiOutlineSlack className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/apis/notion/write',
    () => <SiNotion className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/apis/trello',
    () => <FaTrello className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/apis/hubspot/crm/write',
    () => <FaHubspot className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/apis/outlook/mail/manage',
    () => <PiMicrosoftOutlookLogoDuotone className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/apis/outlook/calendar/manage',
    () => <PiMicrosoftOutlookLogoDuotone className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/structured-data-querier',
    () => <PiMicrosoftExcelLogo className="text-md" />,
  ],
  ['github.com/gptscript-ai/json-query', () => <SiJson className="text-md" />],
  [
    'github.com/gptscript-ai/context/filesystem',
    () => <BsFiles className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/context/workspace',
    () => <GoFileDirectory className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/apis/github/write',
    () => <FaGithub className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/apis/gitlab',
    () => <FaGitlab className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/clis/aws',
    () => <FaAws className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/clis/azure',
    () => <VscAzure className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/clis/digitalocean',
    () => <FaDigitalOcean className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/clis/eksctl',
    () => <SiAmazoneks className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/clis/atlas',
    () => <SiMongodb className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/clis/gcp',
    () => <SiGooglecloud className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/clis/k8s',
    () => <AiOutlineKubernetes className="text-md" />,
  ],
  [
    'github.com/gptscript-ai/tools/clis/supabase',
    () => <SiSupabase className="text-md" />,
  ],
  ['sys.append', () => <AiFillFileAdd className="text-md" />],
  ['sys.download', () => <BsDownload className="text-md" />],
  ['sys.exec', () => <GoTerminal className="text-md" />],
  ['sys.find', () => <BsFiles className="text-md" />],
  ['sys.getenv', () => <BsCode className="text-md" />],
  ['sys.http.html2text', () => <FaCode className="text-md" />],
  ['sys.http.get', () => <GoGlobe className="text-md" />],
  ['sys.http.post', () => <GoGlobe className="text-md" />],
  ['sys.ls', () => <BsFolder className="text-md" />],
  ['sys.prompt', () => <GoQuestion className="text-md" />],
]);

const iconForTool = (toolName: string | undefined) => {
  if (!toolName) return <GoQuestion className="text-md" />;
  return toolIconMap.get(toolName)?.() || <GoQuestion className="text-md" />;
};
