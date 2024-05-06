import { useState, useEffect, memo } from 'react';
import { FaCog, FaWrench, FaRunning} from "react-icons/fa";
import { VscGrabber } from "react-icons/vsc";
import { IoIosChatboxes } from "react-icons/io";
import {
    Input,
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
    Divider,
} from "@nextui-org/react";;
import type { Tool } from '@gptscript-ai/gptscript';
import ChatWindow from "./chatWindow";
import { Handle, Position } from 'reactflow';

interface CustomToolProps {
    data: Tool;
    isConnectable: boolean;
}

export default memo(({ data, isConnectable }: CustomToolProps) => {
    const [name, setName] = useState(data.name);
    const [description, setDescription] = useState(data.description);
    const [temperature, setTemperature] = useState(data.temperature || 0);
    const [prompt, setPrompt] = useState(data.instructions);
    const [isChat, setIsChat] = useState(data.chat);

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
            console.log('newNodeData')
            window.dispatchEvent(new Event('newNodeData'));
        }
    }, [name, description, temperature, prompt, isChat]);

    return (<>
        <Handle
            type="target"
            position={Position.Left}
            style={{ background: '#555', width: '10px', height: '10px', zIndex: 999 }}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={isConnectable}
        />
        <Handle
            type="source"
            position={Position.Right}
            style={{ background: '#555', width: '10px', height: '10px', zIndex: 999 }}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={isConnectable}
        />
        <Card className="w-80 p-4">
            <VscGrabber className="w-full"/>
            <CardHeader className="">
                <div className="absolute top-1 right-4">
                    <Popover placement="right" showArrow={true} backdrop="blur">
                        <PopoverTrigger>
                            <Button radius="full" variant="light" startContent={<FaCog />} isIconOnly/>
                        </PopoverTrigger>
                        <PopoverContent>
                            <div className="flex flex-col space-y-6 m-6 w-[300px]">
                                <div>
                                    <p className="text-small text-default-500">Chat</p>
                                    <Switch
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
                            
                                <Textarea
                                    label="Description"
                                    placeholder='Describe your tool for the chat bot...'
                                    defaultValue={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                />
                                <Textarea
                                    label="Prompt"
                                    placeholder='Tell the tool what do to...'
                                    defaultValue={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    classNames={{
                                        base: "max-w-xs",
                                        input: "min-h-[20vh]",
                                    }}
                                />
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
                <Input
                    label="Name"
                    placeholder='Give your tool a name...'
                    defaultValue={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </CardBody>
            <CardFooter>
                {isChat ?
                 <ChatWindow /> :
                 <Button startContent={<FaRunning />}color="secondary" className="w-full">Run</Button>
                }
            </CardFooter>
        </Card>
    </>);
});