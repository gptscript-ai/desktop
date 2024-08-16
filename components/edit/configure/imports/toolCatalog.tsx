import { useCallback, useState } from 'react';
import { Avatar, Button, Card, Chip, Divider, Input } from '@nextui-org/react';
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
  'From URL': [],
  'AI and Web': [
    {
      name: 'Vision',
      description: 'Allows the assistant to interact with images.',
      url: 'github.com/gptscript-ai/gpt4-v-vision@gateway',
      tags: ['vision', 'images', 'ai'],
      icon: <BsEye className="text-5xl" />,
    },
    {
      name: 'Image Generation',
      description: 'Allows the assistant to generate images.',
      url: 'github.com/gptscript-ai/dalle-image-generation@gateway',
      tags: ['images', 'ai', 'generation'],
      icon: <FaPaintBrush className="text-5xl" />,
    },
    {
      name: 'Answers From The Internet',
      description: 'Allows the assistant to search the web for answers.',
      url: 'github.com/gptscript-ai/answers-from-the-internet',
      tags: ['search', 'web', 'internet'],
      icon: <GoGlobe className="text-5xl" />,
    },
    {
      name: 'Search Website',
      description: 'Allows the assistant to search a website.',
      url: 'github.com/gptscript-ai/search-website',
      tags: ['search', 'web', 'site'],
      icon: <GoSearch className="text-5xl" />,
    },
    {
      name: 'Browser',
      description:
        'Provides the assistant with the ability to interact with the web via a Chrome window.',
      url: 'github.com/gptscript-ai/browser',
      tags: ['browser', 'web', 'chrome', 'search'],
      icon: <GoBrowser className="text-5xl" />,
    },
  ],
  Productivity: [
    {
      name: 'Slack',
      description: 'Allows the assistant to interact with Slack.',
      url: 'github.com/gptscript-ai/tools/apis/slack/write',
      tags: ['slack', 'messaging', 'teams', 'api'],
      icon: <AiOutlineSlack className="text-5xl" />,
    },
    {
      name: 'Notion',
      description: 'Allows the assistant to interact with Notion.',
      url: 'github.com/gptscript-ai/tools/apis/notion/write',
      tags: ['notion', 'documentation', 'notes', 'api'],
      icon: <SiNotion className="text-5xl" />,
    },
    {
      name: 'Trello',
      description: 'Allows the assistant to interact with Trello.',
      url: 'github.com/gptscript-ai/tools/apis/trello',
      tags: ['trello', 'project', 'management', 'api'],
      icon: <FaTrello className="text-5xl" />,
    },
    {
      name: 'Outlook Mail',
      description:
        'Allows the assistant to send and receive emails via Outlook.',
      url: 'github.com/gptscript-ai/tools/apis/outlook/mail/manage',
      tags: ['email', 'office', 'microsoft', 'service'],
      icon: <PiMicrosoftOutlookLogoDuotone className="text-5xl" />,
    },
    {
      name: 'Outlook Calendar',
      description: 'Allows the assistant to interact with Outlook Calendar.',
      url: 'github.com/gptscript-ai/tools/apis/outlook/calendar/manage',
      tags: ['calendar', 'office', 'microsoft', 'service'],
      icon: <PiMicrosoftOutlookLogoDuotone className="text-5xl" />,
    },
  ],
  'Working with Local Files': [
    {
      name: 'Knowledge',
      description: 'Provides the assistant with information based context.',
      url: 'github.com/gptscript-ai/knowledge@v0.4.7-gateway',
      tags: ['knowledge', 'rag'],
      icon: <GoBook className="text-5xl" />,
    },
    {
      name: 'Structured Data Querier',
      description: 'Query Excel spreadsheets, CSV files, and JSON files.',
      url: 'github.com/gptscript-ai/structured-data-querier',
      tags: ['data', 'structured', 'query'],
      icon: <PiMicrosoftExcelLogo className="text-5xl" />,
    },
    {
      name: 'JSON Query',
      description: 'Allows the assistant to query JSON data.',
      url: 'github.com/gptscript-ai/json-query',
      tags: ['json', 'query', 'data'],
      icon: <SiJson className="text-5xl" />,
    },
    {
      name: 'Filesystem',
      description: 'Allows the assistant to interact with the filesystem.',
      url: 'github.com/gptscript-ai/context/filesystem',
      tags: ['json', 'query', 'data'],
      icon: <BsFiles className="text-5xl" />,
    },
    {
      name: 'Workspace',
      description:
        'Allows the assistant to be aware of and iteract with files in your workspace.',
      url: 'github.com/gptscript-ai/context/workspace',
      tags: ['workspace', 'files'],
      icon: <GoFileDirectory className="text-5xl" />,
    },
  ],
  'Coding and DevOps': [
    {
      name: 'Github',
      description: 'Provides the ability to interact with GitHub.',
      url: 'github.com/gptscript-ai/tools/clis/github',
      tags: ['github', 'cli'],
      icon: <FaGithub className="text-5xl" />,
    },
    {
      name: 'Amazon Web Services',
      description: 'Provides the ability to interact with AWS.',
      url: 'github.com/gptscript-ai/tools/clis/aws',
      tags: ['aws', 'cloud', 'amazon', 'cli'],
      icon: <FaAws className="text-5xl" />,
    },
    {
      name: 'Azure',
      description: 'Provides the ability to interact with Azure.',
      url: 'github.com/gptscript-ai/tools/clis/azure',
      tags: ['azure', 'cloud', 'microsoft', 'cli'],
      icon: <VscAzure className="text-5xl" />,
    },
    {
      name: 'Digital Ocean',
      description: 'Provides the ability to interact with Digital Ocean.',
      url: 'github.com/gptscript-ai/tools/clis/digitalocean',
      tags: ['digital', 'ocean', 'cloud', 'cli'],
      icon: <FaDigitalOcean className="text-5xl" />,
    },
    {
      name: 'Amazon EKS',
      description: 'Provides the ability to interact with Amazon EKS Clusters.',
      url: 'github.com/gptscript-ai/tools/clis/eksctl',
      tags: ['eksctl', 'kubernetes', 'aws', 'cli', 'eks', 'amazon'],
      icon: <SiAmazoneks className="text-5xl" />,
    },
    {
      name: 'MongoDB Atlas',
      description: 'Provides the ability to interact with MongoDB Atlas.',
      url: 'github.com/gptscript-ai/tools/clis/atlas',
      tags: ['atlas', 'mongodb', 'db', 'cloud', 'cli'],
      icon: <SiMongodb className="text-5xl" />,
    },
    {
      name: 'Google Cloud Platform',
      description:
        'Provides the ability to interact with Google Cloud Platform.',
      url: 'github.com/gptscript-ai/tools/clis/gcp',
      tags: ['gcp', 'cloud', 'google', 'cli'],
      icon: <SiGooglecloud className="text-5xl" />,
    },
    {
      name: 'Kubernetes',
      description:
        'Provides the ability to interact with Kubernetes using kubectl, helm, and other CLIs',
      url: 'github.com/gptscript-ai/tools/clis/k8s',
      tags: ['kubernetes', 'containers', 'ops', 'cli'],
      icon: <AiOutlineKubernetes className="text-5xl" />,
    },
    {
      name: 'Supabase',
      description: 'Allows the agent to interact with Supabase via the CLI.',
      url: 'github.com/gptscript-ai/tools/clis/supabase',
      tags: ['supabase', 'db', 'authentication', 'api', 'cli'],
      icon: <SiSupabase className="text-5xl" />,
    },
  ],
  'System Tools': [
    {
      name: 'Append',
      description: 'Appends the contents to a file',
      url: 'sys.append',
      tags: ['system', 'append'],
      icon: <AiFillFileAdd className="text-5xl" />,
    },
    {
      name: 'Download',
      description:
        'Downloads a URL, saving the contents to disk at a given location.',
      url: 'sys.download',
      tags: ['system', 'download'],
      icon: <BsDownload className="text-5xl" />,
    },
    {
      name: 'Execute',
      description: 'Execute a command and get the output of the command.',
      url: 'sys.exec',
      tags: ['system', 'execute', 'exec'],
      icon: <GoTerminal className="text-5xl" />,
    },
    {
      name: 'Find',
      description:
        'Traverse a directory looking for files that match a pattern in the style of the unix find command.',
      url: 'sys.find',
      tags: ['system', 'find'],
      icon: <BsFiles className="text-5xl" />,
    },
    {
      name: 'Get Environment Variable',
      description: 'Gets the value of an OS environment variable.',
      url: 'sys.getenv',
      tags: ['system', 'getenv', 'environment', 'env'],
      icon: <LuServer className="text-5xl" />,
    },
    {
      name: 'HTML to Text',
      description:
        'Download the contents of a http or https URL returning the content as rendered text converted from HTML.',
      url: 'sys.http.html2text',
      tags: ['system', 'http', 'html', 'text'],
      icon: <FaCode className="text-5xl" />,
    },
    {
      name: 'HTTP GET',
      description: 'Download the contents of a http or https URL.',
      url: 'sys.http.get',
      tags: ['system', 'http', 'get'],
      icon: <GoGlobe className="text-5xl" />,
    },
    {
      name: 'HTTP POST',
      description:
        'Write contents to a http or https URL using the POST method.',
      url: 'sys.http.post',
      tags: ['system', 'http', 'post'],
      icon: <GoGlobe className="text-5xl" />,
    },
    {
      name: 'List Directory',
      description: 'Lists the contents of a directory.',
      url: 'sys.ls',
      tags: ['system', 'ls', 'list', 'directory'],
      icon: <BsFolder className="text-5xl" />,
    },
    {
      name: 'Prompt',
      description: 'Prompts the user for input.',
      url: 'sys.prompt',
      tags: ['system', 'prompt', 'input'],
      icon: <GoQuestion className="text-5xl" />,
    },
    {
      name: 'Read File',
      description: 'Reads the contents of a file.',
      url: 'sys.read',
      tags: ['system', 'read', 'file'],
      icon: <FaGlasses className="text-5xl" />,
    },
    {
      name: 'Remove File',
      description: 'Removes the specified file.',
      url: 'sys.remove',
      tags: ['system', 'remove', 'file'],
      icon: <MdDeleteForever className="text-5xl" />,
    },
    {
      name: 'File Stat',
      description: 'Gets size, modfied time, and mode of the specified file.',
      url: 'sys.stat',
      tags: ['system', 'stat', 'file'],
      icon: <BsSearch className="text-5xl" />,
    },
    {
      name: 'Current Time',
      description: 'Returns the current date and time in RFC3339 format.',
      url: 'sys.time.now',
      tags: ['system', 'time', 'now'],
      icon: <BsClock className="text-5xl" />,
    },
    {
      name: 'Write File',
      description: 'Write the contents to a file.',
      url: 'sys.write',
      tags: ['system', 'write', 'file'],
      icon: <GoPencil className="text-5xl" />,
    },
  ],
};

interface ToolCatalogProps {
  tools: string[] | undefined;
  addTool: (tool: string) => void;
  removeTool: (tool: string) => void;
}

interface ToolsSiteResponse {
  tools: Record<string, Tool[]>;
}

const ToolCatalog: React.FC<ToolCatalogProps> = ({
  tools,
  addTool,
  removeTool,
}) => {
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
      <div className="mt-24 mb-10 px-10 flex w-full justify-between items-center">
        <h1 className="text-3xl font-bold text-primary lg:text-5xl">
          <PiToolbox className="inline text-5xl lg:text-5xl mb-1" /> Tool
          catalog
        </h1>
        <div className="flex space-x-4 justify-end items-center w-4/6">
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
            className="w-2/6"
          />
        </div>
      </div>

      {searchResults && Object.keys(searchResults).length > 0 ? (
        <div>
          {searchResults.tools &&
            Object.keys(searchResults.tools).length === 0 && (
              <div className="pl-12">
                <p className="text-lg">
                  No tools found. Please try refining your search...
                </p>
              </div>
            )}
          <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-10 overflow-y-auto p-10">
            {searchResults.tools &&
              Object.keys(searchResults.tools).map((repo) => (
                <Card key={repo} className="h-[275px] p-4">
                  <div className="flex justify-between">
                    <GoTools className="text-7xl" />
                    <Button
                      size="md"
                      className="mb-2"
                      isIconOnly
                      radius="full"
                      variant="flat"
                      startContent={
                        tools?.includes(repo) ? <GoCheck /> : <GoPlus />
                      }
                      color={tools?.includes(repo) ? 'success' : 'primary'}
                      onPress={() => {
                        if (tools?.includes(repo)) {
                          removeTool(repo);
                        } else {
                          addTool(repo);
                        }
                      }}
                    />
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl mt-4 pb-8 h-[200px]">
                    <h2 className="text-xl mb-4 font-bold capitalize">
                      {repo
                        .split('/')
                        .pop()
                        ?.replace(/-/g, ' ')
                        .replace('sys.', '') || 'Custom Tool'}
                    </h2>
                    <p className="truncate text-sm">
                      {searchResults.tools[repo][0]?.description ||
                        'No description provided.'}
                    </p>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ) : loading ? (
        <Loading />
      ) : (
        <div className="h-full w-full">
          {Object.keys(priorityTools).map((category) => (
            <div key={category} className="w-full px-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">{category}</h2>
              <Divider />
              {category === 'System Tools' && (
                <p className="text-sm p-4 bg-warning-50 rounded-xl mt-4 text-warning-950">
                  <IoWarning className="inline text-lg mb-1 mr-1" /> These are
                  lower level tools. Most interact directly with your
                  workstation.
                </p>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-10 overflow-y-auto p-10">
                {category === 'From URL' && (
                  <Card className="h-[275px] p-4">
                    <Avatar
                      icon={<GoLink className="text-5xl" />}
                      color="primary"
                      classNames={{ base: 'w-20 h-20' }}
                    />

                    <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl mt-4">
                      <h2 className="text-xl mb-4 font-bold">Add by URL</h2>
                      <p className="text-sm mb-2">
                        Add a tool to the catalog by providing a URL.
                      </p>
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
                          className="mb-2"
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
                                icon: <GoTools className="text-5xl" />,
                              });
                            } else {
                              removeTool(url);
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
                )}
                {priorityTools[category].map((tool, i) => (
                  <Card key={tool.name + i} className="h-[275px] p-4">
                    <div className="flex justify-between">
                      <Avatar
                        icon={tool.icon}
                        color="primary"
                        classNames={{ base: 'w-20 h-20' }}
                      />
                      <Button
                        size="md"
                        className="mb-2"
                        isIconOnly
                        radius="full"
                        variant="flat"
                        startContent={
                          tools?.includes(tool.url) ? <GoCheck /> : <GoPlus />
                        }
                        color={
                          tools?.includes(tool.url) ? 'success' : 'primary'
                        }
                        onPress={() => {
                          if (tools?.includes(tool.url)) {
                            removeTool(tool.url);
                          } else {
                            addTool(tool.url);
                          }
                        }}
                      />
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl mt-4 pb-8">
                      <h2 className="text-xl mb-4 font-bold capitalize">
                        {tool.name}
                      </h2>
                      <p className="truncate text-sm">{tool.description}</p>
                      <div className="w-full overflow-x-auto flex space-x-2 mt-2">
                        {tool.tags.map((tag) => (
                          <Chip key={tag} size="sm">
                            {tag}
                          </Chip>
                        ))}
                      </div>
                    </div>
                  </Card>
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
