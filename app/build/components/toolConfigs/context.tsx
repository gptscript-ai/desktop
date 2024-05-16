import { useState, useEffect } from "react";
import ArgsTable from "../paramTable";
import type { Tool } from "@gptscript-ai/gptscript";


interface ContextProps {
    data: Tool;
}

const Context: React.FC<ContextProps> = ({ data }) => {
    const [description, setDescription] = useState(data.description);
    const [temperature, setTemperature] = useState(data.temperature || 0);
    const [isChat, setIsChat] = useState(data.chat);

    useEffect(() => {
        if ( description !== data.description || temperature !== data.temperature || isChat !== data.chat) {
            data.temperature = temperature;
            data.description = description;
            data.chat = isChat;
            window.dispatchEvent(new Event("newNodeData"));
        }
    }, [description, temperature, isChat]);

    return (
        <div className="flex flex-col space-y-6">
            <ArgsTable />
        </div>
    );
};

export default Context;