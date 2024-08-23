import { useContext, useEffect, useState } from 'react';
import { Button } from '@nextui-org/react';
import {
  GoBook,
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
import ToolCatalogModal from '@/components/edit/configure/imports/toolCatalogModal';
import {
  AiFillFileAdd,
  AiOutlineKubernetes,
  AiOutlineSlack,
} from 'react-icons/ai';
import {
  FaAws,
  FaCode,
  FaDigitalOcean,
  FaGithub,
  FaGlasses,
  FaPaintBrush,
  FaTrello,
} from 'react-icons/fa';
import {
  PiMicrosoftExcelLogo,
  PiMicrosoftOutlookLogoDuotone,
} from 'react-icons/pi';
import { EditContext } from '@/contexts/edit';
import CustomTool from '@/components/edit/configure/customTool';
import {
  SiAmazoneks,
  SiGooglecloud,
  SiJson,
  SiMongodb,
  SiNotion,
  SiSupabase,
} from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';
import {
  BsClock,
  BsCode,
  BsDownload,
  BsEye,
  BsFiles,
  BsFolder,
  BsSearch,
} from 'react-icons/bs';
import { MdDeleteForever } from 'react-icons/md';
import PropTypes from 'prop-types';

import { load } from '@/actions/gptscript';

interface ImportsProps {
  tools: string[] | undefined;
  setTools: (tools: string[]) => void;
  enableLocal?: boolean;
  className?: string;
  collapsed?: boolean;
}

const Imports: React.FC<ImportsProps> = ({
  tools,
  setTools,
  className,
  collapsed,
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
      updatedRemoteTools.set(ref, await getDisplayName(ref));
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
      <div
        className={`flex ${collapsed ? 'flex-col space-y-2' : 'space-x-4'} ${tools?.length ? 'pt-4' : ''}`}
      >
        <ToolCatalogModal
          tools={tools}
          addTool={(tool) => {
            setTools([...(tools || []), tool]);
          }}
          removeTool={(tool) => {
            if (isRemote(tool)) {
              deleteRemoteTool(tool);
            } else {
              setTools(tools?.filter((t) => t !== tool) || []);
            }
          }}
        />
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

async function getDisplayName(ref: string): Promise<string> {
  let displayName: string =
    ref.split('/').pop()?.replace('sys.', '').replace('.', ' ') ?? ref;

  if (!ref.startsWith('sys.')) {
    const loadedTool = await load(ref);
    const loadedName = loadedTool.toolSet[loadedTool.entryToolId].name;
    if (loadedName) {
      displayName = loadedName;
    }
  }

  return displayName.replace(/-/g, ' ');
}

// note - I know this is a bit of a mess, but it's a quick way to get icons for tools
const iconForTool = (toolName: string | undefined) => {
  switch (toolName) {
    case 'github.com/gptscript-ai/gpt4-v-vision@gateway':
      return <BsEye className="text-md" />;
    case 'github.com/gptscript-ai/dalle-image-generation@gateway':
      return <FaPaintBrush className="text-md" />;
    case 'github.com/gptscript-ai/answers-from-the-internet':
      return <GoGlobe className="text-md" />;
    case 'github.com/gptscript-ai/search-website':
      return <GoSearch className="text-md" />;
    case 'github.com/gptscript-ai/browser':
      return <GoBrowser className="text-md" />;
    case 'github.com/gptscript-ai/tools/apis/slack/write':
      return <AiOutlineSlack className="text-md" />;
    case 'github.com/gptscript-ai/tools/apis/notion/write':
      return <SiNotion className="text-md" />;
    case 'github.com/gptscript-ai/tools/apis/trello':
      return <FaTrello className="text-md" />;
    case 'github.com/gptscript-ai/tools/apis/outlook/mail/manage':
      return <PiMicrosoftOutlookLogoDuotone className="text-md" />;
    case 'github.com/gptscript-ai/tools/apis/outlook/calendar/manage':
      return <PiMicrosoftOutlookLogoDuotone className="text-md" />;
    case 'github.com/gptscript-ai/knowledge@v0.4.7-gateway':
      return <GoBook className="text-md" />;
    case 'github.com/gptscript-ai/structured-data-querier':
      return <PiMicrosoftExcelLogo className="text-md" />;
    case 'github.com/gptscript-ai/json-query':
      return <SiJson className="text-md" />;
    case 'github.com/gptscript-ai/context/filesystem':
      return <BsFiles className="text-md" />;
    case 'github.com/gptscript-ai/context/workspace':
      return <GoFileDirectory className="text-md" />;
    case 'github.com/gptscript-ai/tools/clis/github':
      return <FaGithub className="text-md" />;
    case 'github.com/gptscript-ai/tools/clis/aws':
      return <FaAws className="text-md" />;
    case 'github.com/gptscript-ai/tools/clis/azure':
      return <VscAzure className="text-md" />;
    case 'github.com/gptscript-ai/tools/clis/digitalocean':
      return <FaDigitalOcean className="text-md" />;
    case 'github.com/gptscript-ai/tools/clis/eksctl':
      return <SiAmazoneks className="text-md" />;
    case 'github.com/gptscript-ai/tools/clis/atlas':
      return <SiMongodb className="text-md" />;
    case 'github.com/gptscript-ai/tools/clis/gcp':
      return <SiGooglecloud className="text-md" />;
    case 'github.com/gptscript-ai/tools/clis/k8s':
      return <AiOutlineKubernetes className="text-md" />;
    case 'github.com/gptscript-ai/tools/clis/supabase':
      return <SiSupabase className="text-md" />;
    case 'sys.append':
      return <AiFillFileAdd className="text-md" />;
    case 'sys.download':
      return <BsDownload className="text-md" />;
    case 'sys.exec':
      return <GoTerminal className="text-md" />;
    case 'sys.find':
      return <BsFiles className="text-md" />;
    case 'sys.getenv':
      return <BsCode className="text-md" />;
    case 'sys.http.html2text':
      return <FaCode className="text-md" />;
    case 'sys.http.get':
      return <GoGlobe className="text-md" />;
    case 'sys.http.post':
      return <GoGlobe className="text-md" />;
    case 'sys.ls':
      return <BsFolder className="text-md" />;
    case 'sys.prompt':
      return <GoQuestion className="text-md" />;
    case 'sys.read':
      return <FaGlasses className="text-md" />;
    case 'sys.remove':
      return <MdDeleteForever className="text-md" />;
    case 'sys.stat':
      return <BsSearch className="text-md" />;
    case 'sys.time.now':
      return <BsClock className="text-md" />;
    case 'sys.write':
      return <GoPencil className="text-md" />;
  }
};
