import {useState, useContext, useEffect} from "react";
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
import {FaPlus, FaTrash} from "react-icons/fa";
import {ToolContext} from "@/components/build/tool";

export const IsValidContext = (tool: string) => {
    if (tool.includes("from")) {
        const parsedTool = tool.split(" ");
        if (parsedTool.length !== 3) {
            return false;
        }
        tool = parsedTool[2];
    }

    // this will have to be updated for sure
    return tool.startsWith("http://") ||
        tool.startsWith("https://") ||
        tool.startsWith("github.com") ||
        tool.startsWith("sys.") ||
        tool.startsWith("/") ||
        tool.startsWith("./")
}

const External = () => {
    const {context, setContext} = useContext(ToolContext);
    const [error, setError] = useState<string | null>(null);

    const handleDeleteContext = (tool: string) => {
        const updatedContext = context.filter((c) => c !== tool);
        setContext(updatedContext);
    }

    return (
        <>
            {context && context.length > 0 && (
                <>
                    <Table removeWrapper aria-label="Contexts">
                        <TableHeader>
                            <TableColumn>Context</TableColumn>
                            <TableColumn>Action</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {context.map((c) => (
                                <TableRow key={c}>
                                    <TableCell>
                                        <p className="overflow-x-scroll truncate">{c}</p>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            size="sm"
                                            color="danger"
                                            isIconOnly
                                            startContent={<FaTrash/>}
                                            onPress={() => handleDeleteContext(c)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <Divider className="my-4"/>
                </>
            )}
            <div className="flex w-full h-full">
                <Input
                    size="md"
                    id="contextInput"
                    placeholder="Enter a URL or file path"
                    isInvalid={error !== null}
                    errorMessage={error}
                    onKeyDown={(e) => {
                        setError(null);
                        if (e.key === 'Enter') {
                            if (IsValidContext(e.currentTarget.value)) {
                                setContext([...context, e.currentTarget.value]);
                            } else {
                                setError("Must be a path to a file or URL.")
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
                        const input = document.querySelector("#contextInput") as HTMLInputElement;
                        if (IsValidContext(input.value)) {
                            setContext([...context, input.value]);
                        } else {
                            setError("Must be a path to a file or URL.")
                        }
                    }}
                />
            </div>
        </>
    );
};

export default External;