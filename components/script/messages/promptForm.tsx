import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { GoCheckCircle } from "react-icons/go";
import type { PromptFrame, PromptResponse } from "@gptscript-ai/gptscript";
import { Input, Button } from "@nextui-org/react";

const PromptForm = ({ frame, onSubmit }: { frame: PromptFrame, onSubmit: (data: PromptResponse) => void }) => {
    const { register, handleSubmit, getValues } = useForm<Record<string, string>>();
    const [submitted, setSubmitted] = useState(false);

    const onSubmitForm = () => {
        setSubmitted(true);
        onSubmit({ id: frame.id, responses: getValues()})
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="mx-4">
            {frame.fields.map((field, index) => (
                field && <Input 
                    key={index}
                    {...register(field)}
                    label={field.charAt(0).toUpperCase() + field.slice(1)} // Capitalize the field name
                    className="mb-6"
                    variant="underlined"
                    type={frame.sensitive ? "password" : "text"}
                />
            ))}
            <Button
                startContent={<GoCheckCircle />}
                type="submit"
                className="mb-6 w-full"
                size="lg"
                color="primary"
                isDisabled={submitted}
            >
                {submitted ? "Submitted" : "Submit"}
            </Button>
        </form>
    );
};

export default PromptForm;