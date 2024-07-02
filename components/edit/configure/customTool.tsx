import { useState, useEffect, useContext, useCallback } from "react";
import { Tool, Property } from "@gptscript-ai/gptscript";
import Imports from "@/components/edit/configure/imports";
import Params from "@/components/edit/configure/params";
import {
    Textarea,
    Input,
    Avatar,
    Tooltip,
    Button,
    Switch,
} from "@nextui-org/react";
import { EditContext } from "@/contexts/edit";
import { GoTrash } from "react-icons/go";
import { LuWrench, LuMessageSquare } from "react-icons/lu";


interface ConfigureProps {
    file: string;
    tool: Tool;
    className?: string;
}

const CustomTool: React.FC<ConfigureProps> = ({file, className, tool }) => {
    const [customTool, setCustomTool] = useState<Tool>({} as Tool);
    const [name, setName] = useState<string>('');
    const [chat, setChat] = useState<boolean>(false);
    const { setRoot, setTools} = useContext(EditContext)
    
    useEffect(() => { setCustomTool(tool); setName(tool.name || '') }, []);

    useEffect(() => {
        setChat(customTool.chat || false);
        setTools((prevTools) => {
            return prevTools.map((tool: Tool) => {
                if (tool.name === customTool.name) {
                    return customTool;
                }
                return tool;
            });
        });
    }, [customTool]);
    
    useEffect(() => {
        setRoot((prevRoot) => {
            if (!prevRoot.tools) return prevRoot;

            prevRoot.tools = prevRoot.tools.map((tool: string) => {
                if (tool === customTool.name) return name;
                return tool;
            });

            return prevRoot;
        });

        setTools((prevTools) => {
            let updatedTools = prevTools.map((t: Tool) => {
                // replace all instances of the old name with the new name
                t.tools?.map((tImport) => tImport === customTool.name ? name : tImport);
                if (t.name === customTool.name) t.name = name;
                return t;
            });
            return updatedTools;
        });
    }, [name])

    const setCustomToolTools = useCallback((newTools: string[]) => {
        setCustomTool({...customTool, tools: newTools});
    }, [customTool]);

    const setCustomToolContexts = useCallback((newContexts: string[]) => {
        setCustomTool({...customTool, context: newContexts});
    }, [customTool]);

    const setCustomToolAgents = useCallback((newAgents: string[]) => {
        setCustomTool({...customTool, context: newAgents});
    }, [customTool]);

    const setParams = useCallback((newParams: Record<string, Property>) => {
        setCustomTool(prevCustomTool => ({...prevCustomTool, arguments: {properties: newParams, type: "object"}}));
    }, [setCustomTool]);

    const abbreviate = (name: string) => {
        const words = name.split(/(?=[A-Z])|[\s_-]/);
        const firstLetters = words.map(word => word[0]);
        return firstLetters.slice(0, 2).join('').toUpperCase();
    }

    const handleDelete = () => {
        setRoot((prevRoot) => {
            if (!prevRoot.tools) return prevRoot;
            prevRoot.tools = prevRoot.tools.filter(tImport => tImport !== customTool.name);
            return prevRoot;
        });

        setTools((prevTools) => {
            let updatedTools = prevTools.filter((t: Tool) => t.name !== customTool.name);
            updatedTools = updatedTools.map((t: Tool) => {
                if (t.tools) {
                    t.tools = t.tools?.filter(tImport => tImport !== customTool.name);
                }
                return t;
            });
            return updatedTools;
        });
    }

    return customTool && 
        <div>
            <div className="w-full flex flex-col justify-center space-y-4 mb-6">
                <Tooltip 
                    content={`${name || "Main"}`}
                    placement="bottom"
                    closeDelay={0.5}
                >
                    <Avatar 
                        size="md" 
                        name={abbreviate(name || 'Main')} 
                        className="mx-auto mt-4"
                        classNames={{base: "bg-white p-6 text-sm border dark:border-none dark:bg-zinc-900"}}
                    />
                </Tooltip>
                <Tooltip 
                    content={`${customTool.chat ? "Disable" : "Enable"} chat for this tool`}
                    placement="bottom"
                    closeDelay={0.5}
                >
                    <Switch
                        className="mx-auto pl-2"
                        isSelected={chat}
                        onChange={(e) => setCustomTool({...customTool, chat: e.target.checked})}
                        thumbIcon={({ isSelected, className }) =>
                            isSelected ? (
                            <LuMessageSquare className={className} />
                            ) : (
                            <LuWrench className={className} />
                            )
                        }
                    />
                </Tooltip>
            </div>
            <div className="px-2 flex flex-col space-y-4 mb-6">
                <Input
                    variant="bordered"
                    label="Name"
                    placeholder="Give your chat bot a name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Textarea
                    fullWidth
                    variant="bordered"
                    label="Description"
                    placeholder="Describe your script..."
                    value={customTool.description}
                    onChange={(e) => setCustomTool({...customTool, description: e.target.value})}
                />
                <Textarea
                    fullWidth
                    variant="bordered"
                    label="Instructions"
                    placeholder="Describe your how your script should behave..."
                    value={customTool.instructions}
                    onChange={(e) => setCustomTool({...customTool, instructions: e.target.value})}
                />
                <Params className="py-2" params={customTool.arguments?.properties} setParams={setParams} />
                <Imports className="py-2" tools={customTool.tools} setTools={setCustomToolTools} label={"Basic Tool"}/>
                <Imports className="py-2" tools={customTool.context} setTools={setCustomToolContexts} label={"Context Tool"}/>
                <Imports className="py-2" tools={customTool.agents} setTools={setCustomToolAgents} label={"Agent Tool"}/>
                <Button onClick={handleDelete} color="danger" variant="bordered" startContent={<GoTrash/>} className="w-full">Delete Tool</Button>
            </div>
        </div>
};

export default CustomTool;