// ToolForm.tsx
import React from 'react';
import { Input, Divider } from "@nextui-org/react";
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
        <h1 className="text-2xl font-bold mb-2">You&apos;re about to run <span className="text-primary">{tool.name}</span></h1>
        <h2 className="text-zinc-600">
            Almost there! The script you&apos;re trying to run is requesting input from you first.
            Fill them out and then get started by clicking the button at the bottom of the page.
        </h2>
        <Divider className="my-6"/>
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
