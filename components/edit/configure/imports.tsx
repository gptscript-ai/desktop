import {useState, useEffect} from "react";
import {
    Button,
    input,
    Select,
    SelectItem,
} from "@nextui-org/react";
import {debounce, set} from "lodash"
import {GoBook, GoPeople, GoPlus, GoTools, GoTrash} from "react-icons/go";
import Input from "@/components/edit/configure/imports/input";
import { ToolType } from "@/contexts/edit";
import { Tool } from "@gptscript-ai/gptscript";

interface ExternalProps {
    tools: string[] | undefined;
    agents: string[] | undefined;
    contexts: string[] | undefined;
    setTools: (tools: string[]) => void;
    setAgents: (agents: string[]) => void;
    setContexts: (contexts: string[]) => void;
    label: string;
    className?: string;
    description?: string;
}

const Imports: React.FC<ExternalProps> = ({tools, setTools, contexts, setContexts, agents, setAgents, label, className, description}) => {
    const [results, setResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [input, setInput] = useState<string>("");
    const [inputType, setInputType] = useState<string>("tool");

    const search = debounce((query: string) => {
        setLoading(true);
        fetch(`https://tools.gptscript.ai/api/search?q=${query}&limit=50`)
            .then(response => response.json())
            .then((result: any) => {
                setResults(Object.keys(result.tools));
            })
            .then(() => setLoading(false))
            .catch(err => console.error(err));
    }, 500);

    useEffect(() => search("gptscript-ai"), [])

    const handleDeleteTool = (tool: string) => {
        setTools(tools!.filter((t) => t !== tool));
    }
    const handleDeleteAgent = (agent: string) => {
        setAgents(agents!.filter((a) => a !== agent));
    }
    const handleDeleteContext = (context: string) => {
        setContexts(contexts!.filter((c) => c !== context));
    }

    const handleAddTool = () => {
        if (tools?.includes(input)) {
            setError(`Tool ${input} has already been imported`);
            return;
        }
        if (!input) {
            setError("Tool cannot be empty");
            return;
        }
        console.log(inputType);
        switch (inputType) {
            case 'tool':
                setTools([...tools || [], input]);
                break;
            case 'context':
                setContexts([...contexts || [], input]);
                break;
            case 'agent':
                setAgents([...agents || [], input]);
                break;
        }
        setInput("");
    };

    return (
        <div className={`${className}`}>
            <h1 className="mb-2 capitalize">{label + 's'}</h1>
            <h2>{description}</h2>
            {tools && tools.length > 0 && (
                <div className="grid grid-cols-1 gap-2 w-full mb-2">
                    {tools.map((tool, i) => (
                        <div key={i} className="flex space-x-2">
                            <p className="truncate w-full border-2 dark:border-zinc-700 text-sm pt-1 pl-2 rounded-lg w-1/5 flex">
                                <GoTools className="mt-[3px] mr-2"/> Tool
                            </p>
                            <p className="truncate w-full border-2 dark:border-zinc-700 text-sm pt-1 pl-2 rounded-lg">
                                {tool}
                            </p>
                            <Button
                                variant="bordered"
                                isIconOnly
                                size="sm"
                                startContent={<GoTrash/>}
                                onPress={() => handleDeleteTool(tool)}
                            />
                        </div>
                    ))}
                </div>
            )}
            {contexts && contexts.length > 0 && (
                <div className="grid grid-cols-1 gap-2 w-full mb-2">
                    {contexts.map((tool, i) => (
                        <div key={i} className="flex space-x-2">
                            <p className="truncate w-full border-2 dark:border-zinc-700 text-sm pt-1 pl-2 rounded-lg w-1/5 flex">
                                <GoBook className="mt-[3px] mr-2"/> Context
                            </p>
                            <p className="truncate w-full border-2 dark:border-zinc-700 text-sm pt-1 pl-2 rounded-lg">
                                {tool}
                            </p>
                            <Button
                                variant="bordered"
                                isIconOnly
                                size="sm"
                                startContent={<GoTrash/>}
                                onPress={() => handleDeleteContext(tool)}
                            />
                        </div>
                    ))}
                </div>
            )}
            {agents && agents.length > 0 && (
                <div className="grid grid-cols-1 gap-2 w-full mb-2">
                    {agents.map((tool, i) => (
                        <div key={i} className="flex space-x-2">
                            <p className="truncate w-full border-2 dark:border-zinc-700 text-sm pt-1 pl-2 rounded-lg w-1/5 flex">
                                <GoPeople className="mt-[3px] mr-2"/> Agent
                            </p>
                            <p className="truncate w-full border-2 dark:border-zinc-700 text-sm pt-1 pl-2 rounded-lg">
                                {tool}
                            </p>
                            <Button
                                variant="bordered"
                                isIconOnly
                                size="sm"
                                startContent={<GoTrash/>}
                                onPress={() => handleDeleteAgent(tool)}
                            />
                        </div>
                    ))}
                </div>
            )}
            <div className="flex w-full h-full space-x-2">
                <Select
                    color="primary"
                    aria-label="tool-type"
                    size="sm"
                    className="w-1/5"
                    classNames={{popoverContent: 'w-[150px]'}}
                    variant="bordered"
                    placeholder="Type"
                    onChange={(e) => setInputType(e.target.value)}
                >
                    <SelectItem key="tool" value="basic" startContent={<GoTools />}>Tool</SelectItem>
                    <SelectItem key="context" value="context" startContent={<GoBook />}>Context</SelectItem>
                    <SelectItem key="agent" value="agent" startContent={<GoPeople />}>Agent</SelectItem>
                </Select>

                <Input
                    options={[...tools || [], ...agents || [], ...contexts || []]}
                    onChange={(e) => setInput(e || '')}
                    toolType={inputType as ToolType}
                    onEnter={handleAddTool}
                />

                <Button
                    variant="bordered"
                    isIconOnly
                    size="sm"
                    startContent={<GoPlus/>}
                    onPress={handleAddTool}
                />
            </div>
        </div>
    );
};

export default Imports;
