import { useState, useEffect, memo, createContext, useContext, useCallback } from "react";
import { FaCog, FaRunning } from "react-icons/fa";
import { VscGrabber } from "react-icons/vsc";
import { IoIosChatboxes } from "react-icons/io";
import { Handle, Position } from "reactflow";
import type { Tool, Property } from "@gptscript-ai/gptscript";
import Config from "./tool/config";
import { GraphContext } from "@/contexts/graph";
import Chat from "./tool/chat";
import External from "./tool/config/external";
import ParamsTable from "./tool/config/paramTable";
import ModalTextArea from "./modalTextArea";
import { debounce } from 'lodash';
import { IsExternalTool } from "./tool/config/external";
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Badge,
    Tooltip,
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@nextui-org/react";

interface CustomToolProps {
    data: Tool;
    isConnectable: boolean;
}

type Context = {
    data: Tool;
    isChat: boolean; setIsChat: (isChat: boolean) => void;
    name: string; setName: (name: string) => void;
    prompt: string; setPrompt: (prompt: string) => void;
    description: string; setDescription: (description: string) => void;
    temperature: number; setTemperature: (temperature: number) => void;
    params: Record<string, Property> | undefined; setParams: (params: Record<string, Property> | undefined) => void;
    jsonResponse: boolean; setJsonResponse: (jsonResponse: boolean) => void;
    internalPrompt: boolean; setInternalPrompt: (internalPrompt: boolean) => void;
    modelName: string; setModelName: (modelName: string) => void;
    maxTokens: number; setMaxTokens: (maxTokens: number) => void;
    tools: string[]; setTools: (tools: string[]) => void;
    context: string[]; setContext: (context: string[]) => void;
}

export const ToolContext = createContext({} as Context);

export default memo(({data, isConnectable}: CustomToolProps) => {
    console.log('rendering tool')
    const [description, setDescription] = useState(data.description);
    const [temperature, setTemperature] = useState(data.temperature);
    const [jsonResponse, setJsonResponse] = useState(data.jsonResponse)
    const [internalPrompt, setInternalPrompt] = useState(data.internalPrompt)
    const [modelName, setModelName] = useState(data.modelName)
    const [maxTokens, setMaxTokens] = useState(data.maxTokens)
    const [name, setName] = useState(data.name);
    const [prompt, setPrompt] = useState(data.instructions);
    const [isChat, setIsChat] = useState(data.chat);
    const [params, setParams ] = useState<Record<string, Property> | undefined>(data.arguments?.properties);
    const [tools, setTools] = useState(data.tools || []);
    const [context, setContext] = useState(data.context || []);
    const { setChatPanel, setConfigPanel, file, getId } = useContext(GraphContext);

    const updateName = useCallback(debounce(async (previous: string, incoming: string) => {
        data.name = incoming;
        await fetch(`/api/file/${file.replace('.gpt','')}/${previous}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
    }, 1000),[file, data]);

    useEffect(() => {
        const hasChanged = (
            description !== data.description || 
            temperature !== data.temperature || 
            prompt !== data.instructions || 
            isChat !== data.chat ||
            jsonResponse !== data.jsonResponse ||
            internalPrompt !== data.internalPrompt ||
            modelName !== data.modelName ||
            maxTokens !== data.maxTokens ||
            JSON.stringify(context) !== JSON.stringify(data.context) ||
            JSON.stringify(params) !== JSON.stringify(data.arguments?.properties) ||
            JSON.stringify(tools) !== JSON.stringify(data.tools)
        );

        if (hasChanged) {
            data.instructions = prompt;
            data.chat = isChat;
            data.description = description;
            data.temperature = temperature;
            data.jsonResponse = jsonResponse;
            data.internalPrompt = internalPrompt;
            data.modelName = modelName;
            data.maxTokens = maxTokens;
            if (!data.arguments) data.arguments = { type: "object" };
            data.context = context;
            data.tools = tools;
            data.arguments.properties = params;
            window.dispatchEvent(new Event("newNodeData"));
        }

        if (data.name !== name){
            let incoming = name
            if (!incoming) {
                incoming = `new-tool-${getId()}`
            }
            updateName(data.name, incoming);
        }

    }, [
        name,
        prompt,
        isChat,
        data,
        description,
        temperature,
        jsonResponse,
        modelName,
        maxTokens,
        internalPrompt,
        tools,
        setTools,
        params,
        context,
    ]);

    const toolContext = {
        data,
        isChat, setIsChat,
        name, setName,
        prompt, setPrompt,
        description, setDescription,
        temperature, setTemperature,
        params, setParams,
        jsonResponse, setJsonResponse,
        internalPrompt, setInternalPrompt,
        modelName, setModelName,
        maxTokens, setMaxTokens,
        tools, setTools,
        context, setContext,
    }

    const onConfigClick = () => setConfigPanel(
        <ToolContext.Provider value={toolContext}>
            <Card className="w-[35vw] 2xl:w-[30vw] 3xl:w-[25vw] h-[43vh] overflow-y-scroll">
                <Config />
            </Card>
        </ToolContext.Provider>
    )

    const onRunClick = () => setChatPanel(
        <ToolContext.Provider value={toolContext}>
            <Card className="w-[35vw] 2xl:w-[30vw] 3xl:w-[25vw] h-[45vh] overflow-y-scroll">
                <Chat chat={isChat} name={name} file={file} params={params}/>
            </Card>
        </ToolContext.Provider>
    )

    return (<>
        <Handle
            type="target"
            position={Position.Left}
            style={{ background: "#555", width: "10px", height: "10px", zIndex: 999 }}
            onConnect={(params) => console.log("handle onConnect", params)}
            isConnectable={isConnectable}
        />
        <Tooltip
            color="primary"
            closeDelay={0}
            content="Custom tool"
            showArrow={true}
        >
            <Handle
                id="custom"
                type="source"
                position={Position.Right}
                style={{ background: "#555", width: "10px", height: "10px", zIndex: 999}}
                isConnectable={isConnectable}
            />
        </Tooltip>
        <ToolContext.Provider value={toolContext}>
            <Card className="w-[400px] p-4">         
                <VscGrabber className="w-full" />
                <CardHeader>
                    <Button className="absolute top-2 left-4" radius="full" variant="light" startContent={<FaCog />} isIconOnly onPress={onConfigClick}/>
                </CardHeader>
                <CardBody>
                    <div className="nodrag nowheel cursor-auto">
                        <input
                            id= "name"
                            className="nodrag nowheel cursor-text text-2xl font-bold mb-4 mx-1 w-full dark:bg-zinc-900"
                            defaultValue={name}
                            placeholder="Give your tool a name..."
                            onChange={(e) => setName(e.target.value)}
                        />
                        <ModalTextArea
                            className="nodrag nowheel cursor-text h-full w-full overflow-y-scroll resize-none"
                            placeholder="Tell the tool what do to..."
                            header={`Editing the prompt for ${name}`}
                            defaultValue={prompt}
                            setText={setPrompt}
                        />
                    </div>

                    <Badge color="primary" className="mt-6 right-1" content={params ? Object.keys(params).length : 0}>
                        <Popover placement="bottom" showArrow>
                            <PopoverTrigger>
                                <Button variant="bordered" className="w-full mt-6">Parameters</Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-4 w-[500px]">
                                <ParamsTable />
                            </PopoverContent>
                        </Popover>
                    </Badge>

                    <Badge color="primary" className="mt-6 right-1" content={tools ? tools.filter((tool) => IsExternalTool(tool)).length : 0}>
                        <Popover placement="bottom" showArrow>
                            <PopoverTrigger>
                                <Button variant="bordered" className="w-full mt-6">External Tools</Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-4 w-[500px]">
                                <External />
                            </PopoverContent>
                        </Popover>
                    </Badge>

                </CardBody>
                <CardFooter>
                    <Button 
                        className="w-full" 
                        onPress={onRunClick} 
                        color={isChat ? 'primary' : 'secondary'}
                        startContent={isChat ? <IoIosChatboxes /> : <FaRunning />}
                    >
                        { isChat ? 'Chat' : 'Run' }
                    </Button>
                </CardFooter>
            </Card>
        </ToolContext.Provider>
    </>);
});
