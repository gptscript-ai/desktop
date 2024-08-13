import {useState, useEffect, useContext, useCallback} from "react";
import {Tool, Property} from "@gptscript-ai/gptscript";
import Params from "@/components/edit/configure/params";
import Models from "@/components/edit/configure/models";
import Imports from "@/components/edit/configure/imports";
import Script from "@/components/script";
import Code from "@/components/edit/configure/code";
import {
    Textarea,
    Input,
    Avatar,
    Tooltip,
    Button,
    Switch,
    Modal,
    ModalBody,
    Select,
    SelectItem,
    ModalContent,
    Accordion,
    AccordionItem,
} from "@nextui-org/react";
import {EditContext} from "@/contexts/edit";
import {GoCode, GoPencil, GoPlay, GoTools, GoTrash} from "react-icons/go";
import {LuWrench, LuMessageSquare} from "react-icons/lu";
import { ScriptContextProvider } from "@/contexts/script";
import { HiCog } from "react-icons/hi2";


interface ConfigureProps {
    tool: string;
    className?: string;
}

const CustomTool: React.FC<ConfigureProps> = ({className, tool}) => {
    const [customTool, setCustomTool] = useState<Tool>({} as Tool);
    const [name, setName] = useState<string>('');
    const [chat, setChat] = useState<boolean>(false);
    const [model, setModel] = useState<string | undefined>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialLoad, setInitialLoad] = useState(false);
    const [instructionsType, setInstructionsType] = useState<string>("prompt");
    const {
        setRoot,
        setTools,
        tools,
        scriptPath,
        models,
        dependencies,
        setDependencies,
        scriptId,
    } = useContext(EditContext)

    useEffect(() => {
        if (initialLoad) return;
        const toolMatch = tools.find((t: Tool) => t.name === tool);
        setCustomTool(toolMatch || {} as Tool);
        setName(toolMatch?.name || '');
        setChat(toolMatch?.chat || false);
        setModel(toolMatch?.modelName);
        setInitialLoad(true);
    }, [tools]);

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
        if (
            customTool.instructions?.startsWith("#!node") ||
            customTool.instructions?.startsWith("#!python") ||
            customTool.instructions?.startsWith("#!bash")
        ) {
            setInstructionsType("code");
        }
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

        setDependencies((prevDeps) => {
            return prevDeps.map((dep) => {
                if (dep.forTool === customTool.name) {
                    dep.forTool = name;
                }
                return dep;
            });
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
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                size="sm" 
                variant="light"
                isIconOnly
                startContent={<GoPencil/>}
            />
            <Modal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                size="5xl"
                className="dark:bg-zinc-950 dark:border-2 dark:border-zinc-800"
                scrollBehavior="inside"
                classNames={{base:"w-[95%] max-w-none h-[95%] max-h-none", wrapper: "overflow-hidden"}}
            >
                <ModalContent>
                    <ModalBody className="grid grid-cols-2">
                        <div className="border-r-2 dark:border-zinc-700 pr-6 h-full overflow-y-auto">
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
                                        thumbIcon={({isSelected, className}) =>
                                            isSelected ? (
                                                <LuMessageSquare className={className}/>
                                            ) : (
                                                <LuWrench className={className}/>
                                            )
                                        }
                                    />
                                </Tooltip>
                            </div>
                            <div className="px-2 flex flex-col space-y-4 mb-6">
                                <Input
                                    color="primary"
                                    variant="bordered"
                                    label="Name"
                                    placeholder="Give your tool a name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                                <Textarea
                                    color="primary"
                                    fullWidth
                                    variant="bordered"
                                    label="Description"
                                    placeholder="Describe your tool..."
                                    value={customTool.description}
                                    onChange={(e) => setCustomTool({...customTool, description: e.target.value})}
                                />
                                <Select
                                    color="primary"
                                    label="Instructions Type"
                                    variant="bordered"
                                    defaultSelectedKeys={[customTool.instructions?.startsWith('#!') ? "code" : "prompt"]}
                                    onChange={(e) => setInstructionsType(e.target.value)}
                                >
                                    <SelectItem key="prompt" value="prompt" textValue="Prompt" startContent={<GoPencil />}>
                                        <h1>Prompt</h1>
                                        <p className="text-default-500 text-tiny">Standard - Describe behavior using natural language.</p>
                                    </SelectItem>
                                    <SelectItem key="code" value="code" startContent={<GoCode />} textValue="Code">
                                        <h1>Code</h1>
                                        <p className="text-default-500 text-tiny">Advanced - Describe behavior using proramming languages.</p>
                                    </SelectItem>
                                </Select>
                                {instructionsType !== "code" &&
                                    <>
                                        <Textarea
                                            color="primary"
                                            fullWidth
                                            maxRows={50}
                                            variant="bordered"
                                            label="Instructions"
                                            placeholder="Describe your how your tool should behave..."
                                            value={customTool.instructions}
                                            onChange={(e) => setCustomTool({...customTool, instructions: e.target.value})}
                                        />
                                        <Accordion isCompact fullWidth selectionMode="multiple">
                                            <AccordionItem
                                                aria-label="Parameters"
                                                title={<h1>Parameters</h1>}
                                                startContent={<LuWrench />}
                                                classNames={{content: "p-10 pt-6"}}
                                            >
                                                <Params params={customTool.arguments?.properties} setParams={setParams}/>
                                            </AccordionItem>
                                            <AccordionItem
                                                aria-label="tools"
                                                title={<h1>Tools</h1>}
                                                startContent={<GoTools />}
                                                classNames={{content: "p-10 pt-6"}}
                                            >
                                                <Imports enableLocal={false} tools={customTool.tools || []} setTools={setCustomToolTools}/>
                                            </AccordionItem>
                                            <AccordionItem
                                                aria-label="Advanced"
                                                title={<h1>Advanced</h1>}
                                                startContent={<HiCog />}
                                                classNames={{content: "px-10 pt-6 h-[500px] space-y-4"}}
                                                >
                                                <Models options={models} defaultValue={model} onChange={(model) => {
                                                    setCustomTool({...customTool, modelName: model})
                                                }}/>
                                                <Button 
                                                    onClick={handleDelete}
                                                    color="danger"
                                                    variant="flat"
                                                    startContent={<GoTrash/>}
                                                    className="w-full"
                                                >
                                                    Delete Tool
                                                </Button>
                                            </AccordionItem>
                                        </Accordion>
                                    </>
                                }
                                {instructionsType === "code" &&
                                    <>
                                        <Code 
                                            code={customTool.instructions || ''}
                                            onChange={(e) => setCustomTool({...customTool, instructions: e})}
                                            dependencies={dependencies.find((d) => d.forTool === customTool.name)?.content || ''}
                                            onDependenciesChange={(code, type) => setDependencies([...dependencies.filter((d) => d.forTool !== customTool.name), {forTool: customTool.name ||'', content: code, type: type}])}
                                        />
                                    </>
                                }
                            </div>
                        </div>
                        <div className="h-full overflow-y-auto">
                            <ScriptContextProvider initialScript={scriptPath} initialThread="" initialSubTool={customTool.name} initialScriptId={`${scriptId}`}>
                                <Script messagesHeight="h-[93%]" />
                            </ScriptContextProvider>
                        </div>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
};

export default CustomTool;