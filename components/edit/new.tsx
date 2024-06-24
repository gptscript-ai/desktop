import React, { useState } from 'react';
import { Input, Textarea, Button, Divider } from '@nextui-org/react';
import { newFile } from '@/actions/scripts/new';
import { GoCheckCircle } from 'react-icons/go';

interface NewFormProps {
    className?: string;
    setFile: (file: string) => void;
}

const NewForm: React.FC<NewFormProps> = ({className, setFile}) => {
    const [filename, setFilename] = useState('');
    const [name, setName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        newFile(name, instructions, filename)
            .then((file) => setFile(file))
            .catch((error) => setError(`${error}`));
    };

    return (
        <form className={`flex flex-col gap-4 ${className}`} onSubmit={handleSubmit}>
            <h1 className="text-lg">Create a new chat bot</h1>
            <Input
                label="Filename"
                type="text"
                variant="bordered"
                placeholder='my-assistant.gpt (optional)'
                value={filename}
                errorMessage={error}
                isInvalid={!!error}
                onChange={(e) => setFilename(e.target.value)}
            />
            <Input
                label="Chat Bot Name"
                variant="bordered"
                type="text"
                placeholder="Name for the chat bot"
                onChange={(e) => setName(e.target.value)}
            />
            <Textarea
                label="Instructions"
                variant="bordered"
                type="text"
                placeholder="Initial instructions for the chat bot"
                onChange={(e) => setInstructions(e.target.value)}
            />
            <Button type="submit" color="primary" startContent={<GoCheckCircle className="text-lg"/>}>Create my new chat bot</Button>
        </form>
    );
};

export default NewForm;