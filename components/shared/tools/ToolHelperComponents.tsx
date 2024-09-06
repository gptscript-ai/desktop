import { FeaturedTool } from '@/model/tools';
import { AiOutlineSlack } from 'react-icons/ai';
import { BsEye } from 'react-icons/bs';
import { FaGithub, FaGitlab, FaHubspot, FaPaintBrush } from 'react-icons/fa';
import {
  GoBrowser,
  GoFileDirectory,
  GoGlobe,
  GoQuestion,
  GoSearch,
} from 'react-icons/go';
import {
  PiMicrosoftExcelLogo,
  PiMicrosoftOutlookLogoDuotone,
} from 'react-icons/pi';
import { SiJson, SiNotion } from 'react-icons/si';

// note(tylerslaton) - This will eventually be retrieved from the tools site, for now we must endure the pain of hardcoding.
const featuredTools: FeaturedTool[] = [
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

export const FeaturedToolMap = new Map(
  featuredTools.map((tool) => [tool.url, tool])
);

// using Object.groupby for backwards compatibility
export const FeaturedToolsByCategory = Object.groupBy(
  featuredTools,
  (tool) => tool.category
);

export const ToolIcon = ({ toolName }: { toolName?: string }) => {
  if (!toolName) return <GoQuestion className="text-md" />;
  return (
    FeaturedToolMap.get(toolName)?.icon || <GoQuestion className="text-md" />
  );
};
