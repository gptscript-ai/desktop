import { useState, useEffect, useContext, useCallback } from "react";
import { Tool, Block } from "@gptscript-ai/gptscript";
import Imports from "@/components/edit/configure/imports";
import {
    Textarea,
    Input,
    Avatar,
    Tooltip,
    Button,
} from "@nextui-org/react";
import { EditContext } from "@/contexts/edit";
import { debounce } from "lodash";
import { GoTrash } from "react-icons/go";

interface ConfigureProps {
    file: string;
    tool: Tool;
    className?: string;
}

const Configure: React.FC<ConfigureProps> = ({file, className, tool }) => {
    const [root, setRoot] = useState<Tool>({} as Tool);
    
    const { update, tools, setTools} = useContext(EditContext)
    
    useEffect(() => { setRoot(tool) }, []);

    useEffect(() => {
        setTools((prevTools) => {
            const updatedTools = prevTools.map((tool: Tool) => {
                if (tool.name === root.name) {
                    return root;
                }
                return tool;
            });
            return updatedTools as Tool[];
        });
        update();
    }, [root]);

    const setRootTools = useCallback((newTools: string[]) => {
        setRoot({...root, tools: newTools});
    }, [root]);

    const setRootContexts = useCallback((newContexts: string[]) => {
        setRoot({...root, context: newContexts});
    }, [root]);

    const setRootAgents = useCallback((newAgents: string[]) => {
        setRoot({...root, context: newAgents});
    }, [root]);

    const abbreviate = (name: string) => {
        const words = name.split(/(?=[A-Z])|[\s_-]/);
        const firstLetters = words.map(word => word[0]);
        return firstLetters.slice(0, 2).join('').toUpperCase();
    }

    const handleDelete = () => {
        setTools((prevTools) => {
            prevTools.forEach((t: Tool) => {
                t.tools?.filter(tImport => tImport !== root.name);
            });
            return prevTools.filter((t: Tool) => t.name !== root.name)
        });
        update();
    }

    return root && 
        <div>
            <div className="w-full">
                <Tooltip 
                    content={`${root.name || "Main"}`}
                    placement="bottom"
                    closeDelay={0.5}
                >
                    <Avatar 
                        size="md" 
                        name={abbreviate(root.name || 'Main')} 
                        className="mx-auto mb-6 mt-4"
                        classNames={{base: "bg-white p-6 text-sm border dark:border-none dark:bg-zinc-900"}}
                    />
                </Tooltip>
            </div>
            <div className="px-2 flex flex-col space-y-4 mb-6">
                <Input
                    variant="bordered"
                    label="Name"
                    placeholder="Give your chat bot a name"
                    value={root.name}
                    onChange={(e) => setRoot({...root, name: e.target.value})}
                />

                <Textarea
                    fullWidth
                    variant="bordered"
                    label="Description"
                    placeholder="Describe your script..."
                    value={root.description}
                    onChange={(e) => setRoot({...root, description: e.target.value})}
                />
                <Textarea
                    fullWidth
                    variant="bordered"
                    label="Instructions"
                    placeholder="Describe your how your script should behave..."
                    value={root.instructions}
                    onChange={(e) => setRoot({...root, instructions: e.target.value})}
                />
                <Imports className="py-2" tools={root.tools} setTools={setRootTools} label={"Basic Tool"}/>
                <Imports className="py-2" tools={root.context} setTools={setRootContexts} label={"Context Tool"}/>
                <Imports className="py-2" tools={root.agents} setTools={setRootAgents} label={"Agent Tool"}/>
                <Button onClick={handleDelete} color="danger" startContent={<GoTrash/>} className="w-full">Delete Tool</Button>
            </div>
        </div>
};

export default Configure;