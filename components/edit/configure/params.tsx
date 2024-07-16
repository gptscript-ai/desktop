import { useState, useEffect } from "react";
import { Property } from "@gptscript-ai/gptscript";
import {
    Input,
    Button,
    input,
} from "@nextui-org/react";
import { debounce, set } from "lodash"
import { GoPlus, GoTrash } from "react-icons/go";

interface ExternalProps {
    params: Record<string, Property> | undefined;
    setParams: (params: Record<string, Property>) => void;
    className?: string;
    description?: string;
}

const Imports: React.FC<ExternalProps> = ({params, setParams, className, description}) => {
    const [error, setError] = useState<string | null>(null);
    const [input, setInput] = useState<string>("");
    const [inputDescription, setInputDescription] = useState<string>("");

    const handleDeleteParam = (param: string) => {
        const updatedParams = { ...params };
        delete updatedParams[param];
        setParams(updatedParams);
    }

    const handleAddParam = () => {
        if (params && Object.keys(params)?.includes(input)) {
            setError(`Parameter ${input} already exists`);
            return;
        }
        if (!input) {
            setError("Parameter cannot be empty");
            return;
        }
        setParams({...params || {}, [input]: {type: "string", description: inputDescription}});
        setInput("");
        setInputDescription("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleAddParam();
        }
    };

    return (
        <div className={className}>
            <h1>Parameters</h1>
            <div>{description}</div>
            {params && Object.keys(params).map((param) => (
                <div key={param} className="flex space-x-2 mt-2">
                    <Input
                        color="primary"
                        size="sm"
                        placeholder="Name..."
                        className="w-1/3"
                        variant="bordered"
                        defaultValue={param}
                        onBlur={(e) => {
                            const target = e.target as HTMLInputElement;
                            const updatedParams = { ...params };
                            updatedParams[target.value] = updatedParams[param];
                            delete updatedParams[param];
                            setParams(updatedParams);
                        }}
                    />
                    <Input
                        color="primary"
                        size="sm"
                        placeholder="Description..."
                        variant="bordered"
                        value={params[param].description}
                        onChange={(e) => {
                            setParams({
                                ...params,
                                [param]: {
                                    ...params[param],
                                    description: e.target.value,
                                },
                            });
                        }}
                    />
                    <Button
                        variant="bordered"
                        size="sm"
                        onClick={() => handleDeleteParam(param)}
                        isIconOnly
                        startContent={<GoTrash />}
                    />
                </div>
            ))}
            <div className="flex space-x-2 mt-2">
                <Input
                    color="primary"
                    size="sm"
                    placeholder="Name..."
                    className="w-1/3"
                    variant="bordered"
                    value={input}
                    onChange={(e) => { setError(null); setInput(e.target.value)}}
                    errorMessage={error}
                    isInvalid={!!error}
                    onKeyDown={handleKeyDown}
                />
                <Input
                    color="primary"
                    size="sm"
                    placeholder="Description..."
                    variant="bordered"
                    value={inputDescription}
                    onChange={(e) => setInputDescription(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <Button
                    variant="bordered"
                    size="sm"
                    onClick={handleAddParam}
                    isIconOnly
                    startContent={<GoPlus />}
                />
            </div>
        </div>
    );
};

export default Imports;
