import Loading from '@/components/loading';
import { FeaturedTools, ToolsApiResponse } from '@/model/tools';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  Input,
  Tooltip,
} from '@nextui-org/react';
import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import { AiOutlineSlack } from 'react-icons/ai';
import { BsEye } from 'react-icons/bs';
import { FaGithub, FaGitlab, FaHubspot, FaPaintBrush } from 'react-icons/fa';
import {
  GoBrowser,
  GoCheck,
  GoFileDirectory,
  GoGlobe,
  GoLink,
  GoPlus,
  GoSearch,
  GoTools,
} from 'react-icons/go';
import { IoWarning } from 'react-icons/io5';
import {
  PiMicrosoftExcelLogo,
  PiMicrosoftOutlookLogoDuotone,
  PiToolbox,
} from 'react-icons/pi';
import { SiJson, SiNotion } from 'react-icons/si';

// note(tylerslaton) - This will eventually be retrieved from the tools site, for now we must endure the pain of hardcoding.
const priorityTools: FeaturedTools = {
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
      url: 'github.com/gptscript-ai/tools/apis/github/write',
      tags: ['github', 'api'],
      icon: <FaGithub className="text-2xl" />,
    },
    {
      name: 'GitLab',
      description: 'Provides the ability to interact with GitLab.',
      url: 'github.com/gptscript-ai/tools/apis/gitlab',
      tags: ['gitlab', 'api'],
      icon: <FaGitlab className="text-lg" />,
    },
  ],
  'From URL': [],
};

interface ToolCatalogProps {
  tools: string[] | undefined;
  addTool: (tool: string) => void;
}

const ToolCatalog: React.FC<ToolCatalogProps> = ({ tools, addTool }) => {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState({} as ToolsApiResponse);
  const [loading, setLoading] = useState(false);

  const search = useCallback(() => {
    if (!query) {
      setSearchResults({} as ToolsApiResponse);
      return;
    }
    setLoading(true);
    fetch('https://tools.gptscript.ai/api/search?q=' + query)
      .then((res) => res.json())
      .then((data) => {
        setSearchResults(data);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div>
      <div className="mt-24 mb-10 px-10 w-full">
        <div className="flex w-full justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-primary lg:text-4xl">
            <PiToolbox className="inline text-4xl lg:text-4xl mb-1" /> Tool
            catalog
          </h1>
          <Input
            aria-label="Search on tools.gptscript.ai..."
            startContent={<GoSearch />}
            placeholder="Search on tools.gptscript.ai..."
            isClearable
            color="primary"
            variant="flat"
            value={query}
            onChange={(e) => {
              if (e.target.value === '') {
                setSearchResults({} as ToolsApiResponse);
              }
              setQuery(e.target.value);
            }}
            onClear={() => {
              setQuery('');
              setSearchResults({} as ToolsApiResponse);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                search();
              }
            }}
            className="w-[250px] ml-auto"
          />
        </div>
      </div>

      {searchResults && Object.keys(searchResults).length > 0 ? (
        <div>
          {searchResults.tools &&
            Object.keys(searchResults.tools).length === 0 && (
              <div className="pl-12">
                <p className="text-medium">
                  No tools found. Please try refining your search...
                </p>
              </div>
            )}
          <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,250px))] gap-4 overflow-y-auto p-4">
            {searchResults.tools &&
              Object.keys(searchResults.tools).map((repo) => (
                <Tooltip
                  key={repo}
                  content={
                    <div>
                      {searchResults.tools[repo][0].description ||
                        'No description provided.'}
                    </div>
                  }
                  placement="top-start"
                >
                  <Card key={repo} className="w-full h-[110px] p-2">
                    <div className="flex justify-between">
                      <GoTools className="text-2xl" />
                      <Button
                        size="sm"
                        className="mb-1"
                        isIconOnly
                        radius="full"
                        variant="flat"
                        startContent={
                          tools?.includes(repo) ? <GoCheck /> : <GoPlus />
                        }
                        disabled={tools?.includes(repo)}
                        color={tools?.includes(repo) ? 'success' : 'primary'}
                        onPress={() => {
                          if (!tools?.includes(repo)) {
                            addTool(repo);
                          }
                        }}
                      />
                    </div>
                    <div className="p-2 rounded-xl mt-2">
                      <h2 className="text-medium mb-2 font-bold capitalize">
                        {repo
                          .split('/')
                          .pop()
                          ?.replace(/-/g, ' ')
                          .replace('sys.', '') || 'Custom Tool'}
                      </h2>
                    </div>
                  </Card>
                </Tooltip>
              ))}
          </div>
        </div>
      ) : loading ? (
        <Loading />
      ) : (
        <div className="h-full w-full">
          {Object.keys(priorityTools).map((category) => (
            <div key={category} className="w-full px-6">
              <h2 className="text-xl font-bold mt-6 mb-2">{category}</h2>
              <Divider />
              {category === 'System Tools' && (
                <p className="text-sm p-2 bg-warning-50 rounded-xl mt-2 text-warning-950">
                  <IoWarning className="inline text-sm mb-1 mr-1" /> These are
                  lower-level tools. Most interact directly with your
                  workstation.
                </p>
              )}
              <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,230px))] gap-3 overflow-y-auto p-4">
                {category === 'From URL' && (
                  <Tooltip
                    content={
                      <div>Add a tool to the catalog by providing a URL.</div>
                    }
                    placement="top-start"
                  >
                    <Card className="w-full p-2">
                      <Avatar
                        icon={<GoLink className="text-2xl" />}
                        color="primary"
                        classNames={{ base: 'w-10 h-10' }}
                      />

                      <div className="p-2 rounded-xl mt-2">
                        <h2 className="text-lg mb-2 font-bold">Add by URL</h2>
                        <div className="flex space-x-2">
                          <Input
                            size="sm"
                            placeholder="URL for tool..."
                            color="primary"
                            variant="flat"
                            value={url}
                            onChange={(e) => {
                              setUrl(
                                e.target.value.replace(
                                  'https://github.com',
                                  'github.com'
                                )
                              );
                            }}
                          />
                          <Button
                            size="sm"
                            className="mb-1"
                            isIconOnly
                            radius="full"
                            variant="flat"
                            startContent={<GoPlus />}
                            color="primary"
                            onPress={() => {
                              if (!url) return;
                              if (
                                !priorityTools['From URL']
                                  .map((t) => t.url)
                                  .includes(url)
                              ) {
                                addTool(url);
                                priorityTools['From URL'].push({
                                  name:
                                    url.split('/').pop()?.replace(/-/g, ' ') ||
                                    'Custom Tool',
                                  description: 'A custom tool you added.',
                                  url: url,
                                  tags: [url, 'from-url'],
                                  icon: <GoTools className="text-2xl" />,
                                });
                              } else {
                                priorityTools['From URL'] = priorityTools[
                                  'From URL'
                                ].filter((t) => t.url !== url);
                              }
                              setUrl('');
                            }}
                          />
                        </div>
                      </div>
                    </Card>
                  </Tooltip>
                )}
                {priorityTools[category].map((tool, i) => (
                  <Tooltip
                    key={tool.name + i}
                    content={
                      <div>
                        <div>
                          {tool.description || 'No description provided.'}
                        </div>
                        <div className="w-full overflow-x-auto flex space-x-1 mt-1">
                          {tool.tags.map((tag) => (
                            <Chip key={tag} size="sm">
                              {tag}
                            </Chip>
                          ))}
                        </div>
                      </div>
                    }
                    placement="top-start"
                  >
                    <Card className="w-full h-[110px] p-2">
                      <div className="flex justify-between">
                        <Avatar
                          icon={tool.icon}
                          color="primary"
                          classNames={{ base: 'w-10 h-10' }}
                        />
                        <Button
                          size="sm"
                          className="mb-1"
                          isIconOnly
                          radius="full"
                          variant="flat"
                          disabled={tools?.includes(tool.url)}
                          startContent={
                            tools?.includes(tool.url) ? <GoCheck /> : <GoPlus />
                          }
                          color={
                            tools?.includes(tool.url) ? 'success' : 'primary'
                          }
                          onPress={() => {
                            if (!tools?.includes(tool.url)) {
                              addTool(tool.url);
                            }
                          }}
                        />
                      </div>
                      <div className="p-2 rounded-xl mt-2">
                        <h2 className="text-medium mb-2 font-bold capitalize">
                          {tool.name}
                        </h2>
                      </div>
                    </Card>
                  </Tooltip>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ToolCatalog.propTypes = {
  // @ts-ignore
  tools: PropTypes.arrayOf(PropTypes.string).isRequired,
  addTool: PropTypes.func.isRequired,
  removeTool: PropTypes.func.isRequired,
};

export default ToolCatalog;
