import {useState, useEffect, useCallback, useContext} from "react";
import {Tool} from "@gptscript-ai/gptscript";
import Imports from "@/components/edit/configure/imports";
import Loading from "@/components/loading";
import CustomTool from "@/components/edit/configure/customTool";
import Models from "@/components/edit/configure/models";
import {EditContext} from "@/contexts/edit";
import {
    Textarea,
    Input,
    Avatar,
    Tooltip,
    Button,
    Accordion,
    AccordionItem,
    Autocomplete,
    AutocompleteItem,

} from "@nextui-org/react";
import {getModels} from "@/actions/models";
import {FaPlus} from "react-icons/fa";

interface ConfigureProps {
    file: string;
    tool?: Tool;
    className?: string;
    custom?: boolean;
}

const Configure: React.FC<ConfigureProps> = ({file, className, custom}) => {
    const {
        root, setRoot,
        tools, setTools,
        loading, setLoading,
        newestToolName,
    } = useContext(EditContext);
    const [models, setModels] = useState<string[]>([]);

    useEffect(() => {
        getModels().then((m) => {
            setModels(m)
        })
    }, []);

    const abbreviate = (name: string) => {
        const words = name.split(/(?=[A-Z])|[\s_-]/);
        const firstLetters = words.map(word => word[0]);
        return firstLetters.slice(0, 2).join('').toUpperCase();
    }

    const setRootTools = useCallback((newTools: string[]) => {
        setRoot({...root, tools: newTools});
    }, [root]);

    const setRootContexts = useCallback((newContexts: string[]) => {
        setRoot({...root, context: newContexts});
    }, [root]);

    const setRootAgents = useCallback((newAgents: string[]) => {
        setRoot({...root, agents: newAgents});
    }, [root]);

    if (loading) return <Loading>Loading your script's details...</Loading>;

    return (
        <>
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
                    color="primary"
                    variant="bordered"
                    label="Name"
                    placeholder="Give your chat bot a name..."
                    defaultValue={root.name}
                    onChange={(e) => setRoot({...root, name: e.target.value})}
                />
                <Textarea
                    color="primary"
                    fullWidth
                    variant="bordered"
                    label="Description"
                    placeholder="Describe your script..."
                    defaultValue={root.description}
                    onChange={(e) => setRoot({...root, description: e.target.value})}
                />
                <Textarea
                    color="primary"
                    fullWidth
                    variant="bordered"
                    label="Instructions"
                    placeholder="Describe your how your script should behave..."
                    defaultValue={root.instructions}
                    onChange={(e) => setRoot({...root, instructions: e.target.value})}
                />
                <Models options={models} defaultValue={root.modelName}
                        onChange={(model) => setRoot({...root, modelName: model})}/>
                <Imports className="py-2" tools={root.tools} setTools={setRootTools} label={"Basic tool"}/>
                <Imports className="py-2" tools={root.context} setTools={setRootContexts} label={"context Tool"}/>
                <Imports className="py-2" tools={root.agents} setTools={setRootAgents} label={"agent Tool"}/>
            </div>
            {!custom &&
                <div className="w-full">
                    <h1 className="mb-2 px-2">Custom Tools</h1>
                    <Button
                        className="w-[98.7%] ml-2 mb-2 shadow-md"
                        size="md"
                        color="primary"
                        startContent={<FaPlus className="text-xl font-bolder"/>}
                        onPress={() => {
                            const id = Math.random().toString(36).substring(7)
                            const newTool: Tool = {
                                id,
                                type: 'tool',
                                name: newestToolName(),
                            }
                            setRoot({...root, tools: [...(root.tools || []), newTool.name!]});
                            setTools([...(tools || []), newTool]);
                        }}
                    >
                        Add a new custom tool
                    </Button>
                    <div>
                        {tools &&
                            <Accordion variant="splitted" className="w-full" isCompact>
                                {tools.map((customTool, i) => (
                                    <AccordionItem key={i} title={customTool.name || 'main'}>
                                        <CustomTool file={file} tool={customTool} models={models}/>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        }
                    </div>
                </div>
            }
        </>
    );
};

export default Configure;