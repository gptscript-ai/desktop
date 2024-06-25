import { useState, memo, useEffect } from 'react';
import {
    Input,
    Popover,
    PopoverTrigger,
    PopoverContent,
    Textarea,
    Button,
    Slider,
    Divider,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
} from "@nextui-org/react";
import ChatWindow from "./chatWindow";
import { Handle, Position } from 'reactflow';
import { FaCog } from "react-icons/fa";
import { VscGrabber } from "react-icons/vsc";
import type { Tool } from '@gptscript-ai/gptscript';

interface ChatProps {
    data: Tool;
    isConnectable: boolean;
}

export default memo(({ data, isConnectable }: ChatProps) => {
    const [name, setName] = useState(data.name);
    const [temperature, setTemperature] = useState(data.temperature || 0);
    const [prompt, setPrompt] = useState(data.instructions);

    useEffect(() => {
        setName(name);
        setTemperature(temperature);
        setPrompt(prompt);
        data.name = name;
        data.temperature = temperature;
        data.instructions = prompt;
    }, [name, temperature, prompt]);

    return (<>
        <Handle
            type="source"
            position={Position.Right}
            style={{ background: '#555', width: '10px', height: '10px', zIndex: 999 }}
            onConnect={(params) => console.log('handle onConnect', params)}
            isConnectable={isConnectable}
        />
        <Card className="w-80">
            <CardHeader className="flex flex-col space-y-4">
                <VscGrabber />
            </CardHeader>
            <CardBody>
                <Input
                    className="mb-4"
                    label="Name"
                    placeholder='Give your chat bot a name...'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Popover placement="right" showArrow={true} backdrop="blur">
                    <PopoverTrigger>
                        <Button startContent={<FaCog />}>
                            Configuration
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <div className="flex flex-col space-y-6 m-6 w-[300px]">
                            <Textarea
                                label="Prompt"
                                placeholder='Describe how you want your chat bot to behave...'
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
                                value={temperature}
                                className="max-w-md"
                                onChange={(e) => setTemperature(e as number)}
                            />
                        </div>
                    </PopoverContent>
                </Popover>
            </CardBody>
            <Divider />
            <CardFooter>
                <ChatWindow />
            </CardFooter>
        </Card>
    </>);
});