import {
  Button,
  Card, CircularProgress,
  Listbox,
  ListboxItem,
  ListboxSection, Spinner,
} from '@nextui-org/react';
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from 'react';
import {
  GoBook,
  GoBrowser,
  GoCheck,
  GoFileDirectory,
  GoGlobe,
  GoPencil,
  GoPlus,
  GoQuestion,
  GoSearch,
  GoTerminal,
} from 'react-icons/go';
import {
  PiMicrosoftExcelLogo,
  PiMicrosoftOutlookLogoDuotone,
  PiToolbox,
} from 'react-icons/pi';
import {
  BsClock,
  BsDownload,
  BsEye,
  BsFiles,
  BsFolder,
  BsSearch,
} from 'react-icons/bs';
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
  AiFillFileAdd,
  AiOutlineKubernetes,
  AiOutlineSlack,
} from 'react-icons/ai';
import {
  SiAmazoneks,
  SiGooglecloud,
  SiJson,
  SiMongodb,
  SiNotion,
  SiSupabase,
} from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';
import { LuServer } from 'react-icons/lu';
import { MdDeleteForever } from 'react-icons/md';
import Fuse from 'fuse.js';

const fuseOptions = {
  keys: ['tool.name', 'tool.description', 'tool.url', 'tool.tags', 'category'],
  threshold: 0.3,
};

interface CatalogListboxProps {
  query: string;
  onQueryChange: (query: string) => void;
  equippedTools: string[];
  onEquippedChange: (equippedTools: string[]) => void;
  onEscape: () => void;
}

export default function CatalogListbox({
  query,
  onQueryChange,
  equippedTools,
  onEquippedChange,
  onEscape,
}: CatalogListboxProps) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    console.log(`query updated to: "${query}"`)
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 100); // Debounce delay in milliseconds

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  const featuredResults = useMemo(() => {
    const flattened = (featuredTools: FeaturedTools) =>
      Object.entries(featuredTools).flatMap(([category, tools]) =>
        tools.map((tool) => ({ tool, category }))
      );

    let groupedTools = featuredTools
    if (debouncedQuery.trim().length > 0) {
      const fuse = new Fuse(flattened(featuredTools), fuseOptions);
      const results = fuse.search(debouncedQuery).map((result) => result.item);

      results.reverse();

      groupedTools = results.reduce((acc, { tool, category }) => {
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(tool);
        return acc;
      }, {} as FeaturedTools);
    }

    return groupedTools;
  }, [debouncedQuery]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        console.log('Enter')
        break;
      case 'Escape':
        console.log('Escape')
        onEscape();
        break;
      case 'ArrowUp':
        console.log('ArrowUp')
        break;
      case 'ArrowDown':
        console.log('ArrowDown')
        break;
      default:
        onQueryChange(query + event.key);
        break;
    }
  }

  useEffect(() => {
    if (!loading) {
      return
    }

      if (!equippedTools.includes(loading)) {
        onEquippedChange([...equippedTools, loading]);
      } else {
        setLoading(null);
        onEscape();
      }
  }, [loading, setLoading, equippedTools, onEquippedChange])


  let toolIndex = 0;

  return (
    <Card className={"absolute bottom-14 p-4 max-h-[700px] w-1/2 overflow-auto border-small border-default-200 dark:border-default-100"}>
      <Listbox
        aria-label={"catalog"}
        variant={"flat"}
        disallowEmptySelection
        selectionMode={"single"}
        shouldFocusWrap={true}
        disabledKeys={equippedTools}
        defaultSelectedKeys={equippedTools}
        selectedKeys={equippedTools}
        onSelectionChange={(selected) => setLoading((Array.from(selected) as string[]) ?.pop() ?? null)}
        onKeyDown={handleKeyDown}
      >
        {
          Object.entries(featuredResults).map(
          ([category, tools], categoryIndex) => (
            <ListboxSection
              aria-label={`catalog-section-${category}`}
              // aria-disabled={tools && tools.length > 0}
              key={category}
              title={category}
              showDivider={true}
            >
              {tools.map((tool, index) => {
                // console.log(`category: ${category}, categoryIndex: ${categoryIndex}, toolIndex: ${index}`)
                return (
                <ListboxItem
                  aria-label={`catalog-item-${toolIndex}`}
                  startContent={loading === tool.url ? (<Spinner size="sm"/>) : tool.icon }
                  // startContent={tool.icon}
                  isReadOnly={loading !== null}
                  id={`catalog-item-${toolIndex++}`}
                  key={tool.url} // Using tool URL as the unique key
                  value={tool.url}
                  title={tool.name}
                  // description={tool.description}
                  // selectedIcon={(<GoCheck/>)}
                >
                </ListboxItem>
              )})}
            </ListboxSection>
          )
        )}
      </Listbox>
    </Card>
  );
}

type FeaturedTool = {
  name: string;
  description: string;
  url: string;
  tags: string[];
  icon: JSX.Element;
};
type FeaturedTools = Record<string, FeaturedTool[]>;

// note(tylerslaton) - This will eventually be retrieved from the tools site, for now we must endure the pain of hardcoding.
const featuredTools: FeaturedTools = {
  'AI and Web': [
    {
      name: 'Vision',
      description: 'Allows the assistant to interact with images.',
      url: 'github.com/gptscript-ai/gpt4-v-vision@gateway',
      tags: ['vision', 'images', 'ai'],
      icon: <BsEye className="text-2xl" />,
    },
    {
      name: 'Image Generation',
      description: 'Allows the assistant to generate images.',
      url: 'github.com/gptscript-ai/dalle-image-generation@gateway',
      tags: ['images', 'ai', 'generation'],
      icon: <FaPaintBrush className="text-2xl" />,
    },
    {
      name: 'Search The Internet',
      description: 'Allows the assistant to search the web for answers.',
      url: 'github.com/gptscript-ai/answers-from-the-internet',
      tags: ['search', 'web', 'internet'],
      icon: <GoGlobe className="text-2xl" />,
    },
    {
      name: 'Crawl Website',
      description: 'Allows the assistant to search a website.',
      url: 'github.com/gptscript-ai/search-website',
      tags: ['search', 'web', 'site'],
      icon: <GoSearch className="text-2xl" />,
    },
    {
      name: 'Browser',
      description:
        'Provides the assistant with the ability to interact with the web via a Chrome window.',
      url: 'github.com/gptscript-ai/browser',
      tags: ['browser', 'web', 'chrome', 'search'],
      icon: <GoBrowser className="text-2xl" />,
    },
  ],
  Productivity: [
    {
      name: 'Slack',
      description: 'Allows the assistant to interact with Slack.',
      url: 'github.com/gptscript-ai/tools/apis/slack/write',
      tags: ['slack', 'messaging', 'teams', 'api'],
      icon: <AiOutlineSlack className="text-2xl" />,
    },
    {
      name: 'Notion',
      description: 'Allows the assistant to interact with Notion.',
      url: 'github.com/gptscript-ai/tools/apis/notion/write',
      tags: ['notion', 'documentation', 'notes', 'api'],
      icon: <SiNotion className="text-2xl" />,
    },
    {
      name: 'Trello',
      description: 'Allows the assistant to interact with Trello.',
      url: 'github.com/gptscript-ai/tools/apis/trello',
      tags: ['trello', 'project', 'management', 'api'],
      icon: <FaTrello className="text-2xl" />,
    },
    {
      name: 'Outlook Mail',
      description:
        'Allows the assistant to send and receive emails via Outlook.',
      url: 'github.com/gptscript-ai/tools/apis/outlook/mail/manage',
      tags: ['email', 'office', 'microsoft', 'service'],
      icon: <PiMicrosoftOutlookLogoDuotone className="text-2xl" />,
    },
    {
      name: 'Outlook Calendar',
      description: 'Allows the assistant to interact with Outlook Calendar.',
      url: 'github.com/gptscript-ai/tools/apis/outlook/calendar/manage',
      tags: ['calendar', 'office', 'microsoft', 'service'],
      icon: <PiMicrosoftOutlookLogoDuotone className="text-2xl" />,
    },
  ],
  'Working with Local Files': [
    {
      name: 'Knowledge',
      description: 'Provides the assistant with information based context.',
      url: 'github.com/gptscript-ai/knowledge@v0.4.7-gateway',
      tags: ['knowledge', 'rag'],
      icon: <GoBook className="text-2xl" />,
    },
    {
      name: 'Structured Data Querier',
      description: 'Query Excel spreadsheets, CSV files, and JSON files.',
      url: 'github.com/gptscript-ai/structured-data-querier',
      tags: ['data', 'structured', 'query'],
      icon: <PiMicrosoftExcelLogo className="text-2xl" />,
    },
    {
      name: 'JSON Query',
      description: 'Allows the assistant to query JSON data.',
      url: 'github.com/gptscript-ai/json-query',
      tags: ['json', 'query', 'data'],
      icon: <SiJson className="text-2xl" />,
    },
    {
      name: 'Filesystem',
      description: 'Allows the assistant to interact with the filesystem.',
      url: 'github.com/gptscript-ai/context/filesystem',
      tags: ['json', 'query', 'data'],
      icon: <BsFiles className="text-2xl" />,
    },
    {
      name: 'Workspace',
      description:
        'Allows the assistant to be aware of and iteract with files in your workspace.',
      url: 'github.com/gptscript-ai/context/workspace',
      tags: ['workspace', 'files'],
      icon: <GoFileDirectory className="text-2xl" />,
    },
  ],
  'Coding and DevOps': [
    {
      name: 'Github',
      description: 'Provides the ability to interact with GitHub.',
      url: 'github.com/gptscript-ai/tools/clis/github',
      tags: ['github', 'cli'],
      icon: <FaGithub className="text-2xl" />,
    },
    {
      name: 'Amazon Web Services',
      description: 'Provides the ability to interact with AWS.',
      url: 'github.com/gptscript-ai/tools/clis/aws',
      tags: ['aws', 'cloud', 'amazon', 'cli'],
      icon: <FaAws className="text-2xl" />,
    },
    {
      name: 'Azure',
      description: 'Provides the ability to interact with Azure.',
      url: 'github.com/gptscript-ai/tools/clis/azure',
      tags: ['azure', 'cloud', 'microsoft', 'cli'],
      icon: <VscAzure className="text-2xl" />,
    },
    {
      name: 'Digital Ocean',
      description: 'Provides the ability to interact with Digital Ocean.',
      url: 'github.com/gptscript-ai/tools/clis/digitalocean',
      tags: ['digital', 'ocean', 'cloud', 'cli'],
      icon: <FaDigitalOcean className="text-2xl" />,
    },
    {
      name: 'Amazon EKS',
      description: 'Provides the ability to interact with Amazon EKS Clusters.',
      url: 'github.com/gptscript-ai/tools/clis/eksctl',
      tags: ['eksctl', 'kubernetes', 'aws', 'cli', 'eks', 'amazon'],
      icon: <SiAmazoneks className="text-2xl" />,
    },
    {
      name: 'MongoDB Atlas',
      description: 'Provides the ability to interact with MongoDB Atlas.',
      url: 'github.com/gptscript-ai/tools/clis/atlas',
      tags: ['atlas', 'mongodb', 'db', 'cloud', 'cli'],
      icon: <SiMongodb className="text-2xl" />,
    },
    {
      name: 'Google Cloud Platform',
      description:
        'Provides the ability to interact with Google Cloud Platform.',
      url: 'github.com/gptscript-ai/tools/clis/gcp',
      tags: ['gcp', 'cloud', 'google', 'cli'],
      icon: <SiGooglecloud className="text-2xl" />,
    },
    {
      name: 'Kubernetes',
      description:
        'Provides the ability to interact with Kubernetes using kubectl, helm, and other CLIs',
      url: 'github.com/gptscript-ai/tools/clis/k8s',
      tags: ['kubernetes', 'containers', 'ops', 'cli'],
      icon: <AiOutlineKubernetes className="text-2xl" />,
    },
    {
      name: 'Supabase',
      description: 'Allows the agent to interact with Supabase via the CLI.',
      url: 'github.com/gptscript-ai/tools/clis/supabase',
      tags: ['supabase', 'db', 'authentication', 'api', 'cli'],
      icon: <SiSupabase className="text-2xl" />,
    },
  ],
  'System Tools': [
    {
      name: 'Append',
      description: 'Appends the contents to a file',
      url: 'sys.append',
      tags: ['system', 'append'],
      icon: <AiFillFileAdd className="text-2xl" />,
    },
    {
      name: 'Download',
      description:
        'Downloads a URL, saving the contents to disk at a given location.',
      url: 'sys.download',
      tags: ['system', 'download'],
      icon: <BsDownload className="text-2xl" />,
    },
    {
      name: 'Execute',
      description: 'Execute a command and get the output of the command.',
      url: 'sys.exec',
      tags: ['system', 'execute', 'exec'],
      icon: <GoTerminal className="text-2xl" />,
    },
    {
      name: 'Find',
      description:
        'Traverse a directory looking for files that match a pattern in the style of the unix find command.',
      url: 'sys.find',
      tags: ['system', 'find'],
      icon: <BsFiles className="text-2xl" />,
    },
    {
      name: 'Get Environment Variable',
      description: 'Gets the value of an OS environment variable.',
      url: 'sys.getenv',
      tags: ['system', 'getenv', 'environment', 'env'],
      icon: <LuServer className="text-2xl" />,
    },
    {
      name: 'HTML to Text',
      description:
        'Download the contents of a http or https URL returning the content as rendered text converted from HTML.',
      url: 'sys.http.html2text',
      tags: ['system', 'http', 'html', 'text'],
      icon: <FaCode className="text-2xl" />,
    },
    {
      name: 'HTTP GET',
      description: 'Download the contents of a http or https URL.',
      url: 'sys.http.get',
      tags: ['system', 'http', 'get'],
      icon: <GoGlobe className="text-2xl" />,
    },
    {
      name: 'HTTP POST',
      description:
        'Write contents to a http or https URL using the POST method.',
      url: 'sys.http.post',
      tags: ['system', 'http', 'post'],
      icon: <GoGlobe className="text-2xl" />,
    },
    {
      name: 'List Directory',
      description: 'Lists the contents of a directory.',
      url: 'sys.ls',
      tags: ['system', 'ls', 'list', 'directory'],
      icon: <BsFolder className="text-2xl" />,
    },
    {
      name: 'Prompt',
      description: 'Prompts the user for input.',
      url: 'sys.prompt',
      tags: ['system', 'prompt', 'input'],
      icon: <GoQuestion className="text-2xl" />,
    },
    {
      name: 'Read File',
      description: 'Reads the contents of a file.',
      url: 'sys.read',
      tags: ['system', 'read', 'file'],
      icon: <FaGlasses className="text-2xl" />,
    },
    {
      name: 'Remove File',
      description: 'Removes the specified file.',
      url: 'sys.remove',
      tags: ['system', 'remove', 'file'],
      icon: <MdDeleteForever className="text-2xl" />,
    },
    {
      name: 'File Stat',
      description: 'Gets size, modfied time, and mode of the specified file.',
      url: 'sys.stat',
      tags: ['system', 'stat', 'file'],
      icon: <BsSearch className="text-2xl" />,
    },
    {
      name: 'Current Time',
      description: 'Returns the current date and time in RFC3339 format.',
      url: 'sys.time.now',
      tags: ['system', 'time', 'now'],
      icon: <BsClock className="text-2xl" />,
    },
    {
      name: 'Write File',
      description: 'Write the contents to a file.',
      url: 'sys.write',
      tags: ['system', 'write', 'file'],
      icon: <GoPencil className="text-2xl" />,
    },
  ],
  'From URL': [],
};
