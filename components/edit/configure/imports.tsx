import {useState, useEffect, useContext} from "react";
import {Button} from "@nextui-org/react";
import {GoBook, GoBrowser, GoFileDirectory, GoGlobe, GoPencil, GoTools, GoTrash} from "react-icons/go";
import ToolCatalogModal from "@/components/edit/configure/imports/toolCatalogModal";
import { AiOutlineKubernetes, AiOutlineSlack } from "react-icons/ai";
import { FaAws, FaDigitalOcean, FaGithub } from "react-icons/fa";
import { PiMicrosoftOutlookLogoDuotone } from "react-icons/pi";
import { RiNotionFill } from "react-icons/ri";
import { EditContext } from "@/contexts/edit";
import CustomTool from "@/components/edit/configure/customTool";
import { SiAmazoneks, SiGooglecloud } from "react-icons/si";
import { VscAzure } from "react-icons/vsc";

interface ImportsProps {
    tools: string[] | undefined;
    setTools: (tools: string[]) => void;
    enableLocal?: boolean;
    className?: string;
    collapsed?: boolean;
}

const Imports: React.FC<ImportsProps> = ({tools, setTools, className, collapsed, enableLocal = "true"}) => {
    const [remoteTools, setRemoteTools] = useState<string[]>([]);
    const [localTools, setLocalTools] = useState<string[]>([]);
    const {createNewTool, deleteLocalTool} = useContext(EditContext);

    useEffect(() => {
        if (tools) {
            setLocalTools(tools.filter((t) => !(
                t.startsWith("https://")  ||
                t.startsWith("http://")   ||
                t.startsWith("sys.")      || // not local, but considered remote for the purposes of this component
                t.startsWith("github.com")
            )));
            setRemoteTools(tools.filter((t) => 
                t.startsWith("https://")  ||
                t.startsWith("http://")   ||
                t.startsWith("sys.")      || // not local, but considered remote for the purposes of this component
                t.startsWith("github.com")
            ));
        }
    }, [tools])

    const iconForTool = (tool: string) => {
        switch (tool.split("/").pop()?.replace(/-/g, " ")) {
            case "slack":
                return <AiOutlineSlack className="text-md"/>;
            case "github":
                return <FaGithub className="text-md"/>;
            case "outlook":
                return <PiMicrosoftOutlookLogoDuotone className="text-md"/>;
            case "knowledge":
                return <GoBook className="text-md"/>;
            case "notion":
                return <RiNotionFill className="text-md"/>;
            case "k8s":
                return <AiOutlineKubernetes className="text-md"/>;
            case "gcp":
                <SiGooglecloud className="text-md"/>;
            case "eksctl":
                return <SiAmazoneks className="text-md"/>;
            case "aws":
                return <FaAws className="text-md"/>;
            case "digitalocean":
                return <FaDigitalOcean className="text-md"/>;
            case "azure":
                return <VscAzure className="text-md"/>;
            case "browser":
                return <GoBrowser className="text-md"/>;
            case "workspace":
                return <GoFileDirectory className="text-md"/>;
            case "answers from the internet":
                return <GoGlobe className="text-md"/>;
            default:
                return <GoTools/>;
        }
    }

    const handleDeleteTool = (tool: string) => {
        setTools(tools!.filter((t) => t !== tool));
    }

    return (
        <div className={`${className}`}>
            {remoteTools && remoteTools.length > 0 && (
                <div className="grid grid-cols-1 gap-2 w-full mb-2">
                    {remoteTools.map((tool, i) => (
                        <div key={i} className="flex space-x-2">
                            <div className="truncate w-full border-2 dark:border-zinc-700 text-sm pl-2 rounded-lg flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                    {iconForTool(tool)}
                                    <p className="capitalize">{tool.split("/").pop()?.replace(/-/g, " ").replace("sys.", "")}</p>
                                </div>
                                <Button
                                    variant="light"
                                    isIconOnly
                                    size="sm"
                                    startContent={<GoTrash/>}
                                    onPress={() => handleDeleteTool(tool)}
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
                                        startContent={<GoTrash/>}
                                        onPress={() => deleteLocalTool(tool)}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className={`flex ${collapsed ? 'flex-col space-y-2' : 'space-x-4'} ${tools?.length ? 'pt-4' : ''}`}>
                <ToolCatalogModal 
                    tools={tools}
                    addTool={(tool) => setTools([...tools || [], tool])}
                    removeTool={(tool) => setTools(tools?.filter((t) => t !== tool) || [])}
                />
                { enableLocal && 
                    <Button
                        size="sm"
                        variant="flat"
                        className="w-full"
                        color="primary"
                        startContent={<GoPencil/>}
                        onPress={() => createNewTool()}
                    >
                        Create a tool
                    </Button>
                }
            </div>
        </div>
    );
};

export default Imports;
