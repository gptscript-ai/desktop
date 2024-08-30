import { useCallback, useState } from 'react';
import {
  Avatar,
  Button,
  Card,
  Chip,
  Divider,
  Input,
  Tooltip,
} from '@nextui-org/react';
import Loading from '@/components/loading';
import {
  GoBook,
  GoBrowser,
  GoCheck,
  GoFileDirectory,
  GoGlobe,
  GoLink,
  GoPencil,
  GoPlus,
  GoQuestion,
  GoSearch,
  GoTerminal,
  GoTools,
} from 'react-icons/go';
import {
  AiFillFileAdd,
  AiOutlineKubernetes,
  AiOutlineSlack,
} from 'react-icons/ai';
import {
  PiMicrosoftExcelLogo,
  PiMicrosoftOutlookLogoDuotone,
  PiToolbox,
} from 'react-icons/pi';
import {
  SiAmazoneks,
  SiGooglecloud,
  SiJson,
  SiMongodb,
  SiNotion,
  SiSupabase,
} from 'react-icons/si';
import {
  FaAws,
  FaCode,
  FaDigitalOcean,
  FaGithub,
  FaGlasses,
  FaPaintBrush,
  FaTrello,
} from 'react-icons/fa';
import { Tool } from '@gptscript-ai/gptscript';
import { VscAzure } from 'react-icons/vsc';
import {
  BsClock,
  BsDownload,
  BsEye,
  BsFiles,
  BsFolder,
  BsSearch,
} from 'react-icons/bs';
import { MdDeleteForever } from 'react-icons/md';
import { IoWarning } from 'react-icons/io5';
import { LuServer } from 'react-icons/lu';
import PropTypes from 'prop-types';

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
      url: 'github.com/gptscript-ai/tools/apis/github/write',
      tags: ['github', 'api'],
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

interface ToolCatalogProps {
  tools: string[] | undefined;
  addTool: (tool: string) => void;
}

interface ToolsSiteResponse {
  tools: Record<string, Tool[]>;
}

const ToolCatalog: React.FC<ToolCatalogProps> = ({ tools, addTool }) => {
  const [url, setUrl] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState({} as ToolsSiteResponse);
  const [loading, setLoading] = useState(false);
  const [priorityTools] = useState(featuredTools);

  const search = useCallback(() => {
    if (!query) {
      setSearchResults({} as ToolsSiteResponse);
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
                setSearchResults({} as ToolsSiteResponse);
              }
              setQuery(e.target.value);
            }}
            onClear={() => {
              setQuery('');
              setSearchResults({} as ToolsSiteResponse);
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
