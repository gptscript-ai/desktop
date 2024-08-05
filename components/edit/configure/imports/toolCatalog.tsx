import {useContext, useEffect, useState} from "react";
import {
    Button,
    Card,
    Chip,
    Divider,
    Input,
    Select,
    SelectItem,
} from "@nextui-org/react";
import {GoBook, GoBrowser, GoCheck, GoFileDirectory, GoGlobe, GoLink, GoPerson, GoPlay, GoPlus, GoSearch, GoTerminal, GoTools, GoTrash} from "react-icons/go";
import {AiOutlineKubernetes, AiOutlineSlack} from "react-icons/ai";
import {PiMicrosoftOutlookLogoDuotone} from "react-icons/pi";
import {RiNotionFill} from "react-icons/ri";
import {FaGithub} from "react-icons/fa";
import {EditContext} from "@/contexts/edit";

const priorityTools = [
    {
        name: "Github",
        description: "A command-line tool for GitHub.",
        url: "github.com/gptscript-ai/github",
        tags: ["github", "cli"],
        icon: <FaGithub className="text-7xl"/>,
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
        name: "Notion",
        description: "Allows the agent to use Notion as a datasource or interact with notes.",
        url: "github.com/gptscript-ai/notion",
        tags: ["notion", "notes", "collaboration", "service"],
        icon: <RiNotionFill className="text-7xl"/>
    },
    {
        name: "Kubernetes",
        description: "Provides the agent with the ability to interact with Kubernetes.",
        url: "github.com/gptscript-ai/kubernetes",
        tags: ["kubernetes", "containers", "ops", "cli"],
        icon: <AiOutlineKubernetes className="text-7xl"/>,
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

const ToolCatalog: React.FC<ToolCatalogProps> = ({tools, addTool, removeTool}) => {
    const [url, setUrl] = useState("");

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

    return (
        <div>
            <div className="mt-24 mb-10 px-10 flex w-full justify-between items-center">
                <h1 className="text-3xl font-bold text-primary lg:text-4xl">Tool catalog</h1>
                <div className="flex space-x-4 justify-end items-center w-4/6">
                    <Input
                        startContent={<GoSearch />}
                        placeholder="Search for tools..."
                        isClearable
                        color="primary"
                        variant="flat"
                        className="w-2/6"
                    />
                    <Select 
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
            <div className="px-10">
                <Divider/>
            </div>
            
            <div className="h-full w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-10 overflow-y-auto p-10">
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
                                    onChange={(e) => setUrl(e.target.value)}
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
        </div>
    );
};

export default ToolCatalog;