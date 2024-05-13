import { useState, useEffect, memo, createContext } from "react";
import { FaCog } from "react-icons/fa";
import { VscGrabber } from "react-icons/vsc";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    Textarea,
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Chip,
    Select,
    SelectItem,
    Tooltip,
} from "@nextui-org/react";;
import { Handle, Position } from "reactflow";
import type { Tool } from "@gptscript-ai/gptscript";
import RunModal from "./run/modal";
import CustomConfig from "./toolConfigs/custom";
import ExternalConfig from "./toolConfigs/external";
import ContextConfig from "./toolConfigs/context";

interface CustomToolProps {
    data: Tool;
    isConnectable: boolean;
}

const toolTypes = {
    "Custom": "A custom tool where you can define the behavior",
    "External": "An external tool that brings predefined behavior",
    "Context": "A tool that provides context to the script",
}

type Context = {
    data: Tool;
    isChat: boolean;
    setIsChat: (isChat: boolean) => void;
    name: string;
    setName: (name: string) => void;
    prompt: string;
    setPrompt: (prompt: string) => void;
    toolType: string;
    setToolType: (toolType: string) => void;
    description: string;
    setDescription: (description: string) => void;
    temperature: number;
    setTemperature: (temperature: number) => void;
}

export const ToolContext = createContext({} as Context);

export default memo(({data, isConnectable}: CustomToolProps) => {
    const [description, setDescription] = useState(data.description);
    const [temperature, setTemperature] = useState(data.temperature || 0);
    const [name, setName] = useState(data.name);
    const [prompt, setPrompt] = useState(data.instructions);
    const [isChat, setIsChat] = useState(data.chat);
    const [toolType, setToolType] = useState("Custom");

    useEffect(() => {
        console.log(data.description)

        const hasChanged = (
            description !== data.description || 
            temperature !== data.temperature || 
            prompt !== data.instructions || 
            isChat !== data.chat
        );

        if (hasChanged) {
            data.instructions = prompt;
            data.chat = isChat;
            data.description = description;
            data.temperature = temperature;
            window.dispatchEvent(new Event("newNodeData"));
        }

        if (data.name !== name){
            window.dispatchEvent(new Event("nodeNameChange"));
        }

    }, [name, prompt, isChat, data, description, temperature]);

    const context = {
        data,
        isChat,
        setIsChat,
        name,
        setName,
        prompt,
        setPrompt,
        toolType,
        setToolType,
        description,
        setDescription,
        temperature,
        setTemperature,
    }

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
        <Tooltip
            color="primary"
            closeDelay={0}
            content="External tool"
            showArrow={true}
        >
            <Handle
                id="external"
                type="source"
                position={Position.Right}
                style={{ background: "#555", width: "10px", height: "10px", zIndex: 999, top: 40 }}
                isConnectable={isConnectable}
            />
        </Tooltip>
        <Tooltip
            color="primary"
            closeDelay={0}
            content="Context"
            showArrow={true}
        >
            <Handle
                id="context"
                type="source"
                position={Position.Right}
                style={{ background: "#555", width: "10px", height: "10px", zIndex: 999, bottom: 40, top: 'auto'}}
                isConnectable={isConnectable}
            />
        </Tooltip>
        <ToolContext.Provider value={context}>
            <Card className="w-[400px] p-4">         
                <VscGrabber className="w-full" />
                <CardHeader>
                    <div className="absolute top-2 left-4">
                        <Popover placement="right" showArrow={true} backdrop="opaque">
                            <PopoverTrigger>
                                <Button radius="full" variant="light" startContent={<FaCog />} isIconOnly />
                            </PopoverTrigger>
                            <PopoverContent>
                                <div className="w-[500px] max-h-[700px] overflow-y-scroll p-6">
                                    <div className="mb-6">
                                        <Tooltip 
                                            color="warning"
                                            closeDelay={0}
                                            content="Changing the tool type will reset this tool's configuration."
                                            showArrow={true}
                                        >
                                            <Select 
                                                label="Choose a tool type"
                                                defaultSelectedKeys={['Custom']}
                                                onChange={(e) => {setToolType(e.target.value)}}
                                            >
                                                {Object.keys(toolTypes).map((toolType) => (
                                                    <SelectItem key={toolType} value={toolType}>
                                                        {toolType}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </Tooltip>
                                    </div>
                                    { toolType === "Custom" && <CustomConfig /> }
                                    { toolType === "External" && <ExternalConfig /> }
                                    { toolType === "Context" && <ContextConfig data={data}/> }
                                </div>
                            </PopoverContent>
                        </Popover>
                    </div>
                </CardHeader>
                <CardBody>
                    <div className="nodrag nowheel cursor-auto">
                        <input
                            className="nodrag nowheel cursor-text text-2xl font-bold mb-4 mx-1 w-full dark:bg-zinc-900"
                            defaultValue={name}
                            placeholder="Give your tool a name..."
                            onChange={(e) => setName(e.target.value)}
                        />
                        <Textarea
                            className="nodrag nowheel cursor-text h-full w-full overflow-y-scroll resize-none"
                            placeholder="Tell the tool what do to..."
                            variant="flat"
                            defaultValue={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>
                    { data.arguments && data.arguments.properties &&
                        <div className="mt-4 flex flex-wrap">
                            {Object.keys(data.arguments.properties).map((arg) => {
                                if (!data.arguments.properties) return null;
                                return (
                                    <Chip
                                        variant="flat"
                                        color="primary"
                                        className="mt-2 mr-2"
                                        key={arg}
                                    >
                                        {arg}
                                    </Chip>
                                );
                            })}
                        </div>
                    }
                </CardBody>
                <CardFooter>
                    <RunModal
                        name={name}
                        file={"new-file-0.gpt"}
                        chat={isChat}
                        args={data.arguments?.properties}
                    />
                </CardFooter>
            </Card>
        </ToolContext.Provider>
    </>);
});
