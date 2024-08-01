import {useState, useEffect, useCallback, useContext} from "react";
import {Tool} from "@gptscript-ai/gptscript";
import Imports from "@/components/edit/configure/imports";
import Loading from "@/components/loading";
import CustomTool from "@/components/edit/configure/customTool";
import Models from "@/components/edit/configure/models";
import Visibility from "@/components/edit/configure/visibility";
import {EditContext} from "@/contexts/edit";
import { ScriptContext } from "@/contexts/script";
import {
    Textarea,
    Input,
    Avatar,
    Tooltip,
    Button,
    Select,
    SelectItem,
    Card,
    CardBody,
} from "@nextui-org/react";
import {getModels} from "@/actions/models";
import { GoCode, GoPencil, GoPlay } from "react-icons/go";
import Code from "@/components/edit/configure/code";

interface ConfigureProps {
    file: string;
    tool?: Tool;
    className?: string;
    custom?: boolean;
}

const Configure: React.FC<ConfigureProps> = ({file, className, custom}) => {
    const {
        root, 
        setRoot,
        tools,
        setTools,
        loading,
        newestToolName,
        visibility,
        setVisibility,
    } = useContext(EditContext);
    const { setSubTool } = useContext(ScriptContext);
    const [models, setModels] = useState<string[]>([]);
    const [instructionsType, setInstructionsType] = useState<string>("prompt");

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
                <Visibility visibility={visibility} setVisibility={setVisibility} />
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
                <Select
                    color="primary"
                    label="Instructions Type"
                    variant="bordered"
                    defaultSelectedKeys={["prompt"]}
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
                {(instructionsType !== "code") && 
                    <>
                        <Textarea
                            color="primary"
                            fullWidth
                            variant="bordered"
                            label="Instructions"
                            placeholder="Describe your how your script should behave..."
                            defaultValue={root.instructions}
                            onChange={(e) => setRoot({...root, instructions: e.target.value})}
                        />
                        <Models options={models} defaultValue={root.modelName} onChange={(model) => setRoot({...root, modelName: model})} />
                        <Imports className="py-2" 
                            tools={root.tools}
                            contexts={root.context}
                            agents={root.agents}
                            setAgents={setRootAgents} 
                            setContexts={setRootContexts}
                            setTools={setRootTools} label={"Tool"}
                        />
                        {!custom && tools && tools.length > 0 &&
                            <Card className="w-full pt-2 pb-6" shadow="sm">
                                <CardBody>
                                    <h1 className="mb-4 px-2 text-lg">Local Tools</h1>
                                    <div className="flex flex-col space-y-2 px-2">
                                        {tools && tools.map((customTool, i) => (
                                            <div className="flex space-x-2 ">
                                                <CustomTool tool={customTool} file={file} models={models}/>
                                                <Button 
                                                    startContent={<GoPlay />}
                                                    color="primary" variant="flat"
                                                    size="sm"
                                                    className="text-sm"
                                                    isIconOnly
                                                    onPress={() => setSubTool(customTool.name || '')}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </CardBody>
                            </Card>
                        }
                    </>
                }
                {(instructionsType === "code") &&
                    <Code
                        code={root.instructions || ''}
                        onChange={(code) => setRoot({...root, instructions: code || ''})}
                    />
                }
            </div>
        </>
    );
};

export default Configure;