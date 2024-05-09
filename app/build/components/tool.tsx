import { useState, useEffect, memo } from "react";
import { FaCog, FaWrench } from "react-icons/fa";
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from "react-icons/md";
import { VscGrabber } from "react-icons/vsc";
import { IoIosChatboxes } from "react-icons/io";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
    Textarea,
    Slider,
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Switch,
    Chip,
    Select,
    SelectItem,
    Tooltip,
} from "@nextui-org/react";;
import type { Tool } from "@gptscript-ai/gptscript";
import ArgsTable from "./argsTable";
import RunModal from "./run/modal";
import { Handle, Position } from "reactflow";

interface CustomToolProps {
    data: Tool;
    isConnectable: boolean;
}

const toolTypes = {
    "Custom": "A custom tool where you can define the behavior",
    "External": "An external tool that brings predefined behavior",
    "Context": "A tool that provides context to the script",
}

export default memo(({ data, isConnectable }: CustomToolProps) => {
    const [name, setName] = useState(data.name);
    const [description, setDescription] = useState(data.description);
    const [temperature, setTemperature] = useState(data.temperature || 0);
    const [prompt, setPrompt] = useState(data.instructions);
    const [isChat, setIsChat] = useState(data.chat);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        if (name !== data.name ||
            description !== data.description ||
            temperature !== data.temperature ||
            prompt !== data.instructions ||
            isChat !== data.chat) {
            data.name = name;
            data.temperature = temperature;
            data.instructions = prompt;
            data.description = description;
            data.chat = isChat;
            window.dispatchEvent(new Event("newNodeData"));
        }
    }, [name, description, temperature, prompt, isChat]);

    return (<>
        <Handle
            type="target"
            position={Position.Left}
            style={{ background: "#555", width: "10px", height: "10px", zIndex: 999 }}
            onConnect={(params) => console.log("handle onConnect", params)}
            isConnectable={isConnectable}
        />
        <Handle
            type="source"
            position={Position.Right}
            style={{ background: "#555", width: "10px", height: "10px", zIndex: 999 }}
            onConnect={(params) => console.log("handle onConnect", params)}
            isConnectable={isConnectable}
        />
        <Card className="w-[400px] p-4">
            <VscGrabber className="w-full" />
            <CardHeader>
                <div className="absolute top-1 right-4">
                    <Popover placement="right" showArrow={true} backdrop="opaque">
                        <PopoverTrigger>
                            <Button radius="full" variant="light" startContent={<FaCog />} isIconOnly />
                        </PopoverTrigger>
                        <PopoverContent>
                            <div className="flex flex-col space-y-6 p-6 w-[500px] max-h-[700px] overflow-y-scroll">
                                <div className="flex space-x-4">
                                    <Select label="Choose a tool type">
                                        {Object.keys(toolTypes).map((toolType) => (
                                            <SelectItem key={toolType} value={toolType}>
                                                {toolType}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    <Tooltip
                                        color="primary"
                                        closeDelay={0}
                                        content="Toggle the ability to chat with this tool"
                                        showArrow={true}
                                    >
                                        <div className="h-full my-auto">
                                            <Switch
                                                size="lg"
                                                isSelected={isChat}
                                                onValueChange={setIsChat}
                                                thumbIcon={({ isSelected, className }) =>
                                                    isSelected ? (
                                                        <IoIosChatboxes className={className} />
                                                    ) : (
                                                        <FaWrench className={className} />
                                                    )
                                                }
                                            />
                                        </div>
                                    </Tooltip>
                                </div>

                                <Textarea
                                    fullWidth
                                    label="Description"
                                    placeholder="Describe your tool..."
                                    defaultValue={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />

                                <ArgsTable args={data.arguments?.properties} />

                                <Slider
                                    label="Creativity"
                                    step={0.01}
                                    maxValue={1}
                                    minValue={0}
                                    defaultValue={temperature}
                                    className="max-w-md"
                                    onChange={(e) => setTemperature(e as number)}
                                />
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
    </>);
});
