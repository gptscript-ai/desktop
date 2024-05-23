// ToolForm.tsx
import React from 'react';
import { Input } from "@nextui-org/react";
import type { Tool } from "@gptscript-ai/gptscript";

const ToolForm = ({
  tool,
  formValues,
  handleInputChange,
}: {
    tool: Tool;
    formValues: { [key: string]: string };
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
    <form className="flex mt-6 flex-col w-full">
        {tool.arguments?.properties && Object.entries(tool.arguments.properties).map(([argName, arg]) => (
            <Input
                key={argName}
                className="mb-6"
                size="lg"
                label={argName}
                placeholder={arg.description}
                type="text"
                id={argName}
                name={argName}
                value={formValues[argName] || ""}
                onChange={handleInputChange}
            />
        ))}
    </form>
);

export default ToolForm;