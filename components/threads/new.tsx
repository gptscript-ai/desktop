import {Popover, PopoverTrigger, PopoverContent, Button, Input} from "@nextui-org/react";
import { createThread } from '@/actions/threads';
import { fetchScripts } from '@/actions/scripts/fetch';
import { useEffect, useState } from 'react';
import { GoPlus } from "react-icons/go";

interface NewThreadProps {
    className?: string;
}

const NewThread = ({ className }: NewThreadProps) => {
    const [scripts, setScripts] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchScripts().then((data) => {
            setScripts(data);
        });
    }, []);

    const handleCreateThread = (script: string) => {
        createThread(script);
    };

    return (
        <Popover placement="right">
            <PopoverTrigger>
                <Button color="primary" className={`${className}`} startContent={<GoPlus />}>Create Thread</Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col space-y-4 p-4">
                {Object.keys(scripts).map((script) => (
                    <Button className="w-full" color="primary" key={script} onClick={()=> {handleCreateThread(script)}}>
                        {script}
                    </Button>
                ))}
            </PopoverContent>
        </Popover>
    );
};

export default NewThread;