import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { GoCheckCircle } from "react-icons/go";
import type { PromptFrame, PromptResponse } from "@gptscript-ai/gptscript";
import { Input, Button } from "@nextui-org/react";

const PromptForm = ({ frame, onSubmit }: { frame: PromptFrame, onSubmit: (data: PromptResponse) => void }) => {
    const { register, handleSubmit, getValues } = useForm<Record<string, string>>();
    const [loading, setLoading] = useState(false);

    const onSubmitForm = () => {
        setLoading(true);
        onSubmit({ id: frame.id, responses: getValues()})
    };

    return (
        <form onSubmit={handleSubmit(onSubmitForm)} className="mx-4">
            {frame.fields.map((field, index) => (
                <Input 
                    key={index}
                    {...register(field)}
                    label={field}
                    className="mb-6"
                    variant="underlined"
                    type={frame.sensitive ? "password" : "text"}
                />
            ))}
            <Button
                startContent={!loading && <GoCheckCircle />}
                type="submit"
                className="mb-6 w-full"
                size="lg"
                color="primary"
                isLoading={loading}
            >
                Submit
            </Button>
        </form>
    );
};

export default PromptForm;