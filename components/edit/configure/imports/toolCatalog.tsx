import {useCallback, useContext, useEffect, useState} from "react";
import {
    Button,
    Card,
    Chip,
    Divider,
    Input,
    Select,
    SelectItem,
} from "@nextui-org/react";
import {
    GoBook, 
    GoBrowser, 
    GoCheck, 
    GoFileDirectory, 
    GoGlobe, 
    GoLink, 
    GoPerson, 
    GoPlay, 
    GoPlus, 
    GoSearch, 
    GoTerminal, 
    GoTools, 
    GoTrash
} from "react-icons/go";
import {AiOutlineKubernetes, AiOutlineSlack} from "react-icons/ai";
import {PiMicrosoftOutlookLogoDuotone} from "react-icons/pi";
import {RiNotionFill} from "react-icons/ri";
import {SiAmazoneks, SiGooglecloud} from "react-icons/si";
import {FaAws, FaDigitalOcean, FaGithub, FaMicrosoft} from "react-icons/fa";
import { Tool } from "@gptscript-ai/gptscript";
import Loading from "@/components/loading";
import { VscAzure } from "react-icons/vsc";

const priorityTools = [
    {
        name: "Github",
        description: "Provides the ability to interact with GitHub.",
        url: "github.com/gptscript-ai/tools/clis/github",
        tags: ["github", "cli"],
        icon: <FaGithub className="text-7xl"/>,
    },
    {
        name: "Amazon Web Services",
        description: "Provides the ability to interact with AWS.",
        url: "github.com/gptscript-ai/tools/clis/aws",
        tags: ["aws", "cloud", "amazon", "cli"],
        icon: <FaAws className="text-7xl"/>,
    },
    {
        name: "Azure",
        description: "Provides the ability to interact with Azure.",
        url: "github.com/gptscript-ai/tools/clis/azure",
        tags: ["azure", "cloud", "microsoft", "cli"],
        icon: <VscAzure className="text-7xl"/>,
    },
    {
        name: "Digitial Ocean",
        description: "Provides the ability to interact with Digital Ocean.",
        url: "github.com/gptscript-ai/tools/clis/digital-ocean",
        tags: ["digital", "ocean", "cloud", "cli"],
        icon: <FaDigitalOcean className="text-7xl"/>,
    },
    {
        name: "eksctl",
        description: "Provides the ability to interact with Amazon EKS Clusters.",
        url: "github.com/gptscript-ai/tools/clis/eksctl",
        tags: ["eksctl", "kubernetes", "aws", "cli", "eks", "amazon"],
        icon: <SiAmazoneks className="text-7xl"/>
    },
    {
        name: "Google Cloud Platform",
        description: "Provides the ability to interact with Google Cloud Platform.",
        url: "github.com/gptscript-ai/tools/clis/gcp",
        tags: ["gcp", "cloud", "google", "cli"],
        icon: <SiGooglecloud className="text-7xl"/>,
    },
    {
        name: "Kubernetes",
        description: "Provides the ability to interact with Kubernetes using kubectl, helm, and other CLIs",
        url: "github.com/gptscript-ai/tools/clis/kubernetes",
        tags: ["kubernetes", "containers", "ops", "cli"],
        icon: <AiOutlineKubernetes className="text-7xl"/>,
    },
    {
        name: "Outlook",
        description: "Allows the agent to send and receive emails via Outlook.",
        url: "github.com/gptscript-ai/outlook",
        tags: ["email", "office", "microsoft", "service"],
        icon: <PiMicrosoftOutlookLogoDuotone className="text-7xl"/>
    },
    {
        name: "Knowledge",
        description: "Provides the agent with information based context.",
        url: "github.com/gptscript-ai/knowledge",
        tags: ["knowledge", "rag"],
        icon: <GoBook className="text-7xl"/>,
    },
    {
        name: "Answers From The Internet",
        description: "Allows the agent to search the web for answers.",
        url: "github.com/gptscript-ai/answers-from-the-internet",
        tags: ["search", "web", "internet"],
        icon: <GoGlobe className="text-7xl"/>
    },
    {
        name: "Browser",
        description: "Provides the agent with the ability to interact with the web via a Chrome window.",
        url: "github.com/gptscript-ai/browser",
        tags: ["browser", "web", "chrome", "search"],
        icon: <GoBrowser className="text-7xl"/>
    },
    {
        name: "Slack",
        description: "Allows the agent to interact with Slack.",
        url: "github.com/gptscript-ai/slack",
        tags: ["slack", "messaging", "teams", "service"],
        icon: <AiOutlineSlack className="text-7xl"/>
    },
    {
        name: "Workspace",
        description: "Allows the agent to be aware of and iteract with files in your workspace.",
        url: "github.com/gptscript-ai/context/workspace",
        tags: ["workspace", "files"],
        icon: <GoFileDirectory className="text-7xl"/>,
    },
]

interface ToolCatalogProps {
    tools: string[] | undefined;
    addTool: (tool: string) => void;
    removeTool: (tool: string) => void;

}

interface ToolsSiteResponse {
    tools: Record<string, Tool[]>;
}

const ToolCatalog: React.FC<ToolCatalogProps> = ({tools, addTool, removeTool}) => {
    const [url, setUrl] = useState("");
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState({} as ToolsSiteResponse);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!tools) return;
        tools.map((tool) => {
            if (
                !priorityTools.map((t) => t.url).includes(tool)
                && (tool.startsWith("https://") || tool.startsWith("http://") || tool.startsWith("github.com"))
            ) {
                priorityTools.push({
                    name: tool.split("/").pop()?.replace(/-/g, " ") || "Custom Tool",
                    description: "A tool added by URL.",
                    url: tool,
                    tags: ["custom"],
                    icon: <GoTools className="text-7xl"/>
                })
            }
        })
    }, []);

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
                <h1 className="text-3xl font-bold text-primary lg:text-4xl">Tool catalog</h1>
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
                            if (e.target.value === "") {
                                setSearchResults({} as ToolsSiteResponse);
                            } 
                            setQuery(e.target.value)
                        }}
                        onClear={() => {
                            setQuery("");
                            setSearchResults({} as ToolsSiteResponse);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                search();
                            }
                        }}
                        className="w-2/6"
                    />
                    <Select 
                        aria-label="Filter tools by type"
                        variant="flat"
                        color="primary"
                        placeholder="All"
                        className="w-1/6"
                        selectionMode="multiple"
                        classNames={{popoverContent: 'w-[220px]'}}
                    >
                        <SelectItem key="foo" value="foo" textValue="CLI" startContent={<GoTerminal className="mr-1"/>}>
                            CLI required
                        </SelectItem>
                        <SelectItem key="bar" value="bar" textValue="OAuth" startContent={<GoPerson className="mr-1"/>}>
                            OAuth Login required
                        </SelectItem>
                    </Select>
                </div>
            </div>

            {searchResults && Object.keys(searchResults).length > 0 ? (
                <div>
                    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-10 overflow-y-auto p-10">
                        {Object.keys(searchResults.tools).map((repo) => (
                            <Card key={repo} className="h-[275px] p-4">
                                <div className="flex justify-between">
                                    <GoTools className="text-7xl"/>
                                    <Button
                                        size="md"
                                        className="mb-2"
                                        isIconOnly
                                        radius="full"
                                        variant="flat"
                                        startContent={tools?.includes(repo) ? <GoCheck /> : <GoPlus />}
                                        color={tools?.includes(repo) ? 'success' : 'primary'}
                                        onPress={() => {
                                            if (tools?.includes(repo)) {
                                                removeTool(repo);
                                            } else {
                                                addTool(repo)
                                            }
                                        }}
                                    />
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl mt-4 pb-8 h-[200px]">
                                    <h2 className="text-xl mb-4 font-bold capitalize">{repo.split("/").pop()?.replace(/-/g, " ").replace("sys.", "") || "Custom Tool"}</h2>
                                    <p className="truncate text-sm">{searchResults.tools[repo][0]?.description || "No description provided."}</p>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            ) : loading ?
                (
                    <Loading />
                ) :
                (
                    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-10 overflow-y-auto p-10">
                        <Card className="h-[275px] p-4">
                            <GoLink className="text-7xl"/>
                            <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl mt-4">
                                <h2 className="text-xl mb-4 font-bold">Add by URL</h2>
                                <p className="text-sm mb-2">Add a tool to the catalog by providing a URL.</p>
                                <div className="flex space-x-2">
                                    <Input
                                        size="sm"
                                        placeholder="URL for tool..."
                                        color="primary"
                                        variant="flat"
                                        value={url}
                                        onChange={(e) => {
                                            setUrl(e.target.value.replace("https://github.com", "github.com"))
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
                                            addTool(url)
                                            priorityTools.push({
                                                name: url.split("/").pop()?.replace(/-/g, " ") || "Custom Tool",
                                                description: "A custom tool you added.",
                                                url: url,
                                                tags: [url, "from-url"],
                                                icon: <GoTools className="text-7xl"/>
                                            })
                                            setUrl("")
                                        }}
                                    />
                                </div>
                            </div>
                        </Card>
                        {priorityTools.map((tool) => (
                            <Card key={tool.name} className="h-[275px] p-4">
                                <div className="flex justify-between">
                                    {tool.icon}
                                    <Button
                                        size="md"
                                        className="mb-2"
                                        isIconOnly
                                        radius="full"
                                        variant="flat"
                                        startContent={tools?.includes(tool.url) ? <GoCheck /> : <GoPlus />}
                                        color={tools?.includes(tool.url) ? 'success' : 'primary'}
                                        onPress={() => {
                                            if (tools?.includes(tool.url)) {
                                                removeTool(tool.url);
                                            } else {
                                                addTool(tool.url)
                                            }
                                        }}
                                    />
                                </div>
                                <div className="bg-zinc-50 dark:bg-zinc-800 p-4 rounded-xl mt-4 pb-8">
                                    <h2 className="text-xl mb-4 font-bold capitalize">{tool.name}</h2>
                                    <p className="truncate text-sm">{tool.description}</p>
                                    <div className="w-full overflow-x-auto flex space-x-2 mt-2">
                                        {tool.tags.map((tag) => (
                                            <Chip key={tag} size="sm">{tag}</Chip>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )
            }
        </div>
    );
};

export default ToolCatalog;