import { useDebouncedValue } from '@/hooks/useDebounce';
import { useFetch } from '@/hooks/useFetch';
import { FeaturedTools, ToolsApiResponse } from '@/model/tools';
import {
  Card,
  Listbox,
  ListboxItem,
  ListboxSection,
  Spinner,
  Tooltip,
} from '@nextui-org/react';
import Fuse from 'fuse.js';
import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AiOutlineSlack } from 'react-icons/ai';
import { BsEye } from 'react-icons/bs';
import { FaGithub, FaGitlab, FaHubspot, FaPaintBrush } from 'react-icons/fa';
import { GoBrowser, GoFileDirectory, GoGlobe, GoSearch } from 'react-icons/go';
import {
  PiMicrosoftExcelLogo,
  PiMicrosoftOutlookLogoDuotone,
} from 'react-icons/pi';
import { SiJson, SiNotion } from 'react-icons/si';

const fuseOptions = {
  keys: ['tool.name', 'tool.description', 'tool.url', 'tool.tags', 'category'],
  threshold: 0.3,
};

const itemKey = (index: number) => `catalog-item-${index}`;

interface CatalogListboxProps {
  query: string;
  loading?: string | null;
  equippedTools: string[];
  onAddTool: (tool: string) => void;
  onEscape: () => void;
  onUncapturedKeyDown: () => void;
}

export type ToolCatalogRef = { focus: () => void };

export default forwardRef<ToolCatalogRef, CatalogListboxProps>(
  function Catalog(props, ref) {
    const {
      query,
      loading,
      equippedTools,
      onAddTool,
      onEscape,
      onUncapturedKeyDown,
    } = props;

    const debouncedQuery = useDebouncedValue(query, 250);

    const fetchTools = useFetch<ToolsApiResponse>(
      'https://tools.gptscript.ai/api/search?q=' + debouncedQuery,
      { disabled: !debouncedQuery, clearOnDisabled: true }
    );
    const { tools: toolsFromQuery = {} } = fetchTools.data ?? {};

    const featuredResults = useMemo(() => {
      const flattened = (featuredTools: FeaturedTools) =>
        Object.entries(featuredTools).flatMap(([category, tools]) =>
          tools.map((tool) => ({ tool, category }))
        );

      if (debouncedQuery.trim().length <= 0) return featuredTools;

      const fuse = new Fuse(flattened(featuredTools), fuseOptions);
      const results = fuse.search(debouncedQuery).map((result) => result.item);

      results.reverse();

      return results.reduce((acc, { tool, category }) => {
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(tool);
        return acc;
      }, {} as FeaturedTools);
    }, [debouncedQuery]);

    const handleKeyDown = (event: React.KeyboardEvent) => {
      switch (event.key) {
        case 'Enter':
        case 'ArrowUp':
        case 'ArrowDown':
          break;
        case 'Escape':
          onEscape();
          break;
        default:
          onUncapturedKeyDown();
          break;
      }
    };

    const equippedToolsRef = useRef<string[]>(equippedTools);
    equippedToolsRef.current = equippedTools;

    const { resultsWithIndexes, lastIndex } = useMemo(() => {
      let index = 0;
      const featuredCategories = Object.entries(featuredResults);

      if (Object.keys(toolsFromQuery).length !== 0) {
        featuredCategories.push([
          'Community Tools',
          Object.entries(toolsFromQuery)
            .filter(
              ([name]) =>
                !Object.values(featuredResults)
                  .flat()
                  .some((tool) => tool.url === name)
            )
            .map(([toolName, tools]) => ({
              url: toolName,
              name: toolName.split('/').pop()?.replace(/-/g, ' ') ?? '',
              description: tools[0]?.description ?? '',
              tags: [],
              icon: <></>,
            })),
        ]);
      }

      const resultsWithIndexes = featuredCategories.map(
        ([category, tools]) =>
          [
            category,
            tools.map((tool) => ({ ...tool, index: index++ })),
          ] as const
      );

      const reversed = resultsWithIndexes
        .flatMap(([, tools]) => tools)
        .reverse();
      let lastIndex: number | undefined;
      for (const item of reversed) {
        if (!equippedToolsRef.current.includes(item.url)) {
          lastIndex = item.index;
          break;
        }
      }

      return {
        resultsWithIndexes,
        lastIndex,
      };
    }, [featuredResults, toolsFromQuery]);

    const [focusedItem, setFocusedItem] = useState<number | null>(null);

    const lastIndexRef = useRef<number | undefined>(lastIndex);
    lastIndexRef.current = lastIndex;
    useImperativeHandle(ref, () => ({
      focus: () =>
        lastIndexRef.current != null &&
        focusElement(itemKey(lastIndexRef.current)),
    }));

    return (
      <Card
        className={
          'absolute bottom-14 z-[1000] p-4 max-h-[710px] w-1/2 overflow-auto border-small border-default-200 dark:border-default-100'
        }
      >
        <Listbox
          aria-label={'catalog'}
          variant={'flat'}
          disallowEmptySelection
          selectionMode={'single'}
          shouldFocusWrap={true}
          disabledKeys={equippedTools}
          defaultSelectedKeys={equippedTools}
          selectedKeys={equippedTools}
          onSelectionChange={(selected) => {
            if (selected === 'all') return;
            setFocusedItem(null);
            onAddTool(String(Array.from(selected).pop()) ?? null);
          }}
          onKeyDown={handleKeyDown}
        >
          {resultsWithIndexes.map(([category, tools]) => (
            <ListboxSection
              aria-label={`catalog-section-${category}`}
              key={category}
              title={category}
              showDivider={true}
            >
              {tools.map((tool) => (
                <ListboxItem
                  aria-label={itemKey(tool.index)}
                  startContent={
                    loading === tool.url ? <Spinner size="sm" /> : tool.icon
                  }
                  isReadOnly={loading !== null}
                  id={itemKey(tool.index)}
                  key={tool.url} // Using tool URL as the unique key
                  value={tool.url}
                  onFocus={() => setFocusedItem(tool.index)}
                >
                  <Tooltip
                    content={tool.description}
                    placement="right"
                    isOpen={focusedItem === tool.index}
                    onOpenChange={(open) =>
                      setFocusedItem(open ? tool.index : null)
                    }
                    closeDelay={0.5}
                    classNames={{
                      content: 'max-w-[250px]',
                    }}
                  >
                    {tool.name}
                  </Tooltip>
                </ListboxItem>
              ))}
            </ListboxSection>
          ))}
        </Listbox>
      </Card>
    );
  }
);

function focusElement(id: string) {
  const element = document.getElementById(id);
  if (!element) return;
  element.focus();
}

// note(tylerslaton) - This will eventually be retrieved from the tools site, for now we must endure the pain of hardcoding.
const featuredTools: FeaturedTools = {
  'AI and Web': [
    {
      name: 'Vision',
      description: 'Allows the assistant to interact with images.',
      url: 'github.com/gptscript-ai/gpt4-v-vision@gateway',
      tags: ['vision', 'images', 'ai'],
      icon: <BsEye className="text-lg" />,
    },
    {
      name: 'Image Generation',
      description: 'Allows the assistant to generate images.',
      url: 'github.com/gptscript-ai/dalle-image-generation@gateway',
      tags: ['images', 'ai', 'generation'],
      icon: <FaPaintBrush className="text-lg" />,
    },
    {
      name: 'Search The Internet',
      description: 'Allows the assistant to search the web for answers.',
      url: 'github.com/gptscript-ai/answers-from-the-internet',
      tags: ['search', 'web', 'internet'],
      icon: <GoGlobe className="text-lg" />,
    },
    {
      name: 'Crawl Website',
      description: 'Allows the assistant to search a website.',
      url: 'github.com/gptscript-ai/search-website',
      tags: ['search', 'web', 'site'],
      icon: <GoSearch className="text-lg" />,
    },
    {
      name: 'Browser',
      description:
        'Provides the assistant with the ability to interact with the web via a Chrome window.',
      url: 'github.com/gptscript-ai/browser',
      tags: ['browser', 'web', 'chrome', 'search'],
      icon: <GoBrowser className="text-lg" />,
    },
  ],
  Productivity: [
    {
      name: 'Slack',
      description: 'Allows the assistant to interact with Slack.',
      url: 'github.com/gptscript-ai/tools/apis/slack/write',
      tags: ['slack', 'messaging', 'teams', 'api'],
      icon: <AiOutlineSlack className="text-lg" />,
    },
    {
      name: 'Notion',
      description: 'Allows the assistant to interact with Notion.',
      url: 'github.com/gptscript-ai/tools/apis/notion/write',
      tags: ['notion', 'documentation', 'notes', 'api'],
      icon: <SiNotion className="text-lg" />,
    },
    {
      name: 'Hubspot',
      description: 'Allows the assistant to interact with Hubspot.',
      url: 'github.com/gptscript-ai/tools/apis/hubspot/crm',
      tags: ['hubspot', 'api'],
      icon: <FaHubspot className="text-lg" />,
    },
    {
      name: 'Outlook Mail',
      description:
        'Allows the assistant to send and receive emails via Outlook.',
      url: 'github.com/gptscript-ai/tools/apis/outlook/mail/manage',
      tags: ['email', 'office', 'microsoft', 'service'],
      icon: <PiMicrosoftOutlookLogoDuotone className="text-lg" />,
    },
    {
      name: 'Outlook Calendar',
      description: 'Allows the assistant to interact with Outlook Calendar.',
      url: 'github.com/gptscript-ai/tools/apis/outlook/calendar/manage',
      tags: ['calendar', 'office', 'microsoft', 'service'],
      icon: <PiMicrosoftOutlookLogoDuotone className="text-lg" />,
    },
  ],
  'Working with Local Files': [
    {
      name: 'Structured Data Querier',
      description: 'Query Excel spreadsheets, CSV files, and JSON files.',
      url: 'github.com/gptscript-ai/structured-data-querier',
      tags: ['data', 'structured', 'query'],
      icon: <PiMicrosoftExcelLogo className="text-lg" />,
    },
    {
      name: 'JSON Query',
      description: 'Allows the assistant to query JSON data.',
      url: 'github.com/gptscript-ai/json-query',
      tags: ['json', 'query', 'data'],
      icon: <SiJson className="text-lg" />,
    },
    {
      name: 'Workspace',
      description:
        'Allows the assistant to be aware of and iteract with files in your workspace.',
      url: 'github.com/gptscript-ai/context/workspace',
      tags: ['workspace', 'files'],
      icon: <GoFileDirectory className="text-lg" />,
    },
  ],
  'Coding and DevOps': [
    {
      name: 'Github',
      description: 'Provides the ability to interact with GitHub.',
      url: 'github.com/gptscript-ai/tools/apis/github/write',
      tags: ['github', 'api'],
      icon: <FaGithub className="text-lg" />,
    },
    {
      name: 'GitLab',
      description: 'Provides the ability to interact with GitLab.',
      url: 'github.com/gptscript-ai/tools/apis/gitlab',
      tags: ['gitlab', 'api'],
      icon: <FaGitlab className="text-lg" />,
    },
  ],
};
