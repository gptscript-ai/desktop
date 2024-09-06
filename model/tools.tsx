import { Tool } from '@gptscript-ai/gptscript';
import {
  AiFillFileAdd,
  AiOutlineKubernetes,
  AiOutlineSlack,
} from 'react-icons/ai';
import { BsCode, BsDownload, BsEye, BsFiles, BsFolder } from 'react-icons/bs';
import {
  FaPaintBrush,
  FaHubspot,
  FaGithub,
  FaGitlab,
  FaAws,
  FaCode,
  FaDigitalOcean,
  FaTrello,
} from 'react-icons/fa';
import {
  GoGlobe,
  GoSearch,
  GoBrowser,
  GoFileDirectory,
  GoQuestion,
  GoTerminal,
} from 'react-icons/go';
import {
  PiMicrosoftOutlookLogoDuotone,
  PiMicrosoftExcelLogo,
} from 'react-icons/pi';
import {
  SiNotion,
  SiJson,
  SiAmazoneks,
  SiGooglecloud,
  SiMongodb,
  SiSupabase,
} from 'react-icons/si';
import { VscAzure } from 'react-icons/vsc';

export interface ToolsApiResponse {
  tools: Record<string, Tool[]>;
}

export type FeaturedTool = {
  name: string;
  description: string;
  url: string;
  tags: string[];
  category: string;
  icon: React.ReactNode;
};

// note(tylerslaton) - This will eventually be retrieved from the tools site, for now we must endure the pain of hardcoding.
export const FeaturedToolList: FeaturedTool[] = [
  {
    name: 'Vision',
    description: 'Allows the assistant to interact with images.',
    url: 'github.com/gptscript-ai/gpt4-v-vision@gateway',
    tags: ['vision', 'images', 'ai'],
    icon: <BsEye className="text-lg" />,
    category: 'AI and Web',
  },
  {
    name: 'Image Generation',
    description: 'Allows the assistant to generate images.',
    url: 'github.com/gptscript-ai/dalle-image-generation@gateway',
    tags: ['images', 'ai', 'generation'],
    icon: <FaPaintBrush className="text-lg" />,
    category: 'AI and Web',
  },
  {
    name: 'Search The Internet',
    description: 'Allows the assistant to search the web for answers.',
    url: 'github.com/gptscript-ai/answers-from-the-internet',
    tags: ['search', 'web', 'internet'],
    icon: <GoGlobe className="text-lg" />,
    category: 'AI and Web',
  },
  {
    name: 'Crawl Website',
    description: 'Allows the assistant to search a website.',
    url: 'github.com/gptscript-ai/search-website',
    tags: ['search', 'web', 'site'],
    icon: <GoSearch className="text-lg" />,
    category: 'AI and Web',
  },
  {
    name: 'Browser',
    description:
      'Provides the assistant with the ability to interact with the web via a Chrome window.',
    url: 'github.com/gptscript-ai/browser',
    tags: ['browser', 'web', 'chrome', 'search'],
    icon: <GoBrowser className="text-lg" />,
    category: 'AI and Web',
  },
  {
    name: 'Slack',
    description: 'Allows the assistant to interact with Slack.',
    url: 'github.com/gptscript-ai/tools/apis/slack/write',
    tags: ['slack', 'messaging', 'teams', 'api'],
    icon: <AiOutlineSlack className="text-lg" />,
    category: 'Productivity',
  },
  {
    name: 'Notion',
    description: 'Allows the assistant to interact with Notion.',
    url: 'github.com/gptscript-ai/tools/apis/notion/write',
    tags: ['notion', 'documentation', 'notes', 'api'],
    icon: <SiNotion className="text-lg" />,
    category: 'Productivity',
  },
  {
    name: 'Hubspot',
    description: 'Allows the assistant to interact with Hubspot.',
    url: 'github.com/gptscript-ai/tools/apis/hubspot/crm/write',
    tags: ['hubspot', 'api'],
    icon: <FaHubspot className="text-lg" />,
    category: 'Productivity',
  },
  {
    name: 'Outlook Mail',
    description: 'Allows the assistant to send and receive emails via Outlook.',
    url: 'github.com/gptscript-ai/tools/apis/outlook/mail/manage',
    tags: ['email', 'office', 'microsoft', 'service'],
    icon: <PiMicrosoftOutlookLogoDuotone className="text-lg" />,
    category: 'Productivity',
  },
  {
    name: 'Outlook Calendar',
    description: 'Allows the assistant to interact with Outlook Calendar.',
    url: 'github.com/gptscript-ai/tools/apis/outlook/calendar/manage',
    tags: ['calendar', 'office', 'microsoft', 'service'],
    icon: <PiMicrosoftOutlookLogoDuotone className="text-lg" />,
    category: 'Productivity',
  },
  {
    name: 'Structured Data Querier',
    description: 'Query Excel spreadsheets, CSV files, and JSON files.',
    url: 'github.com/gptscript-ai/structured-data-querier',
    tags: ['data', 'structured', 'query'],
    icon: <PiMicrosoftExcelLogo className="text-lg" />,
    category: 'Working with Local Files',
  },
  {
    name: 'JSON Query',
    description: 'Allows the assistant to query JSON data.',
    url: 'github.com/gptscript-ai/json-query',
    tags: ['json', 'query', 'data'],
    icon: <SiJson className="text-lg" />,
    category: 'Working with Local Files',
  },
  {
    name: 'Workspace',
    description:
      'Allows the assistant to be aware of and iteract with files in your workspace.',
    url: 'github.com/gptscript-ai/context/workspace',
    tags: ['workspace', 'files'],
    icon: <GoFileDirectory className="text-lg" />,
    category: 'Working with Local Files',
  },
  {
    name: 'Github',
    description: 'Provides the ability to interact with GitHub.',
    url: 'github.com/gptscript-ai/tools/apis/github/write',
    tags: ['github', 'api'],
    icon: <FaGithub className="text-lg" />,
    category: 'Coding and DevOps',
  },
  {
    name: 'GitLab',
    description: 'Provides the ability to interact with GitLab.',
    url: 'github.com/gptscript-ai/tools/apis/gitlab',
    tags: ['gitlab', 'api'],
    icon: <FaGitlab className="text-lg" />,
    category: 'Coding and DevOps',
  },
];

// some tools are not in the featured tools list, but still can have an icon. That's what this map is for
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

export const FeaturedToolMap = new Map(
  FeaturedToolList.map((tool) => [tool.url, tool])
);

// Object.groupBy is not supported in all browsers :(
export const FeaturedToolsByCategory = FeaturedToolList.reduce((acc, tool) => {
  if (!acc.get(tool.category)) {
    acc.set(tool.category, []);
  }

  acc.get(tool.category)?.push(tool);

  return acc;
}, new Map<string, FeaturedTool[]>());

export const ToolIcon = ({ toolName }: { toolName?: string }) => {
  if (!toolName) return <GoQuestion className="text-md" />;
  return (
    FeaturedToolMap.get(toolName)?.icon ??
    toolIconMap.get(toolName)?.() ?? <GoQuestion className="text-md" />
  );
};
