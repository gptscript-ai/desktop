import React, {useState} from 'react';
import { Input, Textarea, Button, Select, SelectItem } from '@nextui-org/react';
import { createScript } from '@/actions/me/scripts';
import {GoCheckCircle} from 'react-icons/go';
import Visibility from '@/components/edit/configure/visibility'

interface NewFormProps {
    className?: string;
    setFile: (file: string) => void;
}

const NewForm: React.FC<NewFormProps> = ({className, setFile}) => {
    const [scriptName, setScriptName] = useState('');
    const [name, setName] = useState('');
    const [instructions, setInstructions] = useState('');
    const [error, setError] = useState('');
    const [visibility, setVisibility] = useState<'public' | 'private' | 'protected'>('private');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (scriptName.includes(' ')) {
            setError('Script name cannot contain spaces');
            return;
        }
        createScript({
            displayName: scriptName,
            visibility: visibility,
            content: `Name: ${name}\nChat: true\n\n${instructions}`
        })
            .then((script) => {
                setFile(script.publicURL!)
                return;
            })
            .catch((error) => setError(`${error}`));
    };

    return (
        <form className={`flex flex-col gap-4 ${className}`} onSubmit={handleSubmit}>
            <h1 className="text-lg">Create a new agent</h1>                   
            <Input
                color="primary"
                label="Script name"
                type="text"
                variant="bordered"
                placeholder='Name of the script...'
                value={scriptName}
                errorMessage={error}
                isInvalid={!!error}
                onChange={(e) => {setError(''); setScriptName(e.target.value)}}
            />
            <Input
                color="primary"
                label="Agent name"
                variant="bordered"
                type="text"
                placeholder="Name for the agent..."
                onChange={(e) => setName(e.target.value)}
            />
            <Textarea
                color="primary"
                label="Instructions"
                variant="bordered"
                type="text"
                placeholder="Initial instructions for the agent..."
                onChange={(e) => setInstructions(e.target.value)}
            />
            <Visibility visibility={visibility} setVisibility={setVisibility} />
            <Button type="submit" color="primary" startContent={<GoCheckCircle className="text-lg"/>}>
                Create my new chatbot
            </Button>
        </form>
    );
};

export default NewForm;