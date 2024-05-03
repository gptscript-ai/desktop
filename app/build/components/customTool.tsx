import { useState, useEffect, memo } from 'react';
import { FaCog } from "react-icons/fa";
import { VscGrabber } from "react-icons/vsc";
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
    CardBody
} from "@nextui-org/react";
import type { Tool } from '@gptscript-ai/gptscript';
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

    useEffect(() => {
        setName(name);
        setDescription(description);
        setTemperature(temperature);
        setPrompt(prompt);
        data.name = name;
        data.temperature = temperature;
        data.instructions = prompt;
        data.description = description;
    }, [name, description, temperature, prompt]);

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
        <Card className="w-80">
            <CardHeader className="flex flex-col space-y-4 justify-center">
                <VscGrabber/>
            </CardHeader>
            <CardBody>
                <Input
                    className="mb-4"
                    label="Name"
                    placeholder='Give your tool a name...'
                    defaultValue={name}
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
            </CardBody>
        </Card>
    </>);
});