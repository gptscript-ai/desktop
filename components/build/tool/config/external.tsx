import { useState, useEffect, useContext } from "react";
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    Divider,
} from "@nextui-org/react";
import { FaPlus, FaTrash } from "react-icons/fa";
import { debounce } from "lodash"
import { ToolContext } from "@/components/build/tool";

export const IsExternalTool = (tool: string) => {
    if (tool.includes("from")){
        const parsedTool = tool.split(" ");
        if (parsedTool.length !== 3){
            return false;
        }
        tool = parsedTool[2];
    }

    return tool.startsWith("http://") ||
        tool.startsWith("https://") ||
        tool.startsWith("github.com") ||
        tool.startsWith("sys.") ||
        tool.includes("from") ||
        tool.endsWith(".gpt");
}

const External = () => {
    const [results, setResults] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [externalTools, setExternalTools] = useState<string[]>([]);
    const { tools, setTools } = useContext(ToolContext);
    const [error, setError] = useState<string | null>(null);
    
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

    useEffect(() => {
        if (tools) {
            const externalTools = tools.filter((tool) => IsExternalTool(tool));
            setExternalTools(externalTools);
        }
    }, [tools]);

    const handleDeleteTool = (tool: string) => {
        const updatedTools = tools.filter((t) => t !== tool);
        setTools(updatedTools);
    }

    return (
        <>
            {externalTools && externalTools.length > 0 && (
                <>
                    <Table removeWrapper aria-label="External Tools">
                        <TableHeader>
                            <TableColumn>Tool</TableColumn>
                            <TableColumn>Action</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {externalTools.map((tool) => (
                                <TableRow key={tool} >
                                    <TableCell>
                                        <p className="w-[390px] overflow-x-scroll truncate">{tool}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            isIconOnly
                                            startContent={<FaTrash />}
                                            onPress={() => handleDeleteTool(tool)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Divider className="my-4" />
                </>
            )}
            <div className="flex w-full h-full">
                <Input
                    size="md"
                    id="externalToolInput"
                    placeholder="Enter a URL or file path"
                    isInvalid={error !== null}
                    errorMessage={error}
                    onKeyDown={(e) => {
                        setError(null);
                        if (e.key === 'Enter') {
                            if (IsExternalTool(e.currentTarget.value)) {
                                setTools([...tools, e.currentTarget.value]);
                            } else {
                                setError("Must be a path to a .gpt file or URL.")
                            }
                        }
                    }}
                />
                <Button
                    className="my-auto ml-2"
                    size="md"
                    color="primary"
                    radius="full"
                    isIconOnly
                    startContent={<FaPlus/>}
                    onPress={() => {
                        setError(null);
                        const input = document.querySelector("#externalToolInput") as HTMLInputElement;
                        if (IsExternalTool(input.value)) {
                            setTools([...tools, input.value]);
                        } else {
                            setError("Must be a path to a .gpt file or URL.")
                        }
                    }}
                />
            </div>
        </>
    );
};

export default External;