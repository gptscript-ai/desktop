import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Tool, Text, Block } from '@gptscript-ai/gptscript';
import { fetchFullScript } from '@/actions/scripts/fetch';
import { updateScript } from '@/actions/scripts/update';

interface EditContextProps{
    file: string,
    children: React.ReactNode
}

interface EditContextState {
    loading: boolean; setLoading: (loading: boolean) => void;
    root: Tool; setRoot: React.Dispatch<React.SetStateAction<Tool>>;
    tools: Tool[]; setTools: React.Dispatch<React.SetStateAction<Tool[]>>;
    texts: Text[]; setTexts: React.Dispatch<React.SetStateAction<Text[]>>;
    script: Block[]; setScript: React.Dispatch<React.SetStateAction<Block[]>>;

    // actions
    update: () => Promise<void>;
}

// EditContext is managing the state of the script editor.
const EditContext = createContext<EditContextState>({} as EditContextState);
const EditContextProvider: React.FC<EditContextProps> = ({ file, children }) => {
    const [loading, setLoading] = useState(true);
    const [root, setRoot] = useState<Tool>({} as Tool);
    const [tools, setTools] = useState<Tool[]>([]);
    const [texts, setTexts] = useState<Text[]>([]);
    const [script, setScript] = useState<Block[]>([]);

    // The first tool in the script is not always the root tool, so we find it
    // by finding the first non-text tool in the script.
    const findRoot = (script: Block[]): Tool => {
        for (let block of script) {
            if (block.type === 'text') continue;
            return block;
        }
        return {} as Tool;
    }

    const findTools = useCallback((script: Block[]): Tool[] => {
        let withoutRoot = [...script];
        for (let i = 0; i < withoutRoot.length; i++) {
            if(withoutRoot[i].type === 'text') continue;
            withoutRoot.splice(i, 1);
            break;
        }        
        return withoutRoot.filter((block) => block.type === 'tool') as Tool[];
    }, [root])

    const findTexts = (script: Block[]): Text[] => {
        return script.filter((block) => block.type === 'text') as Text[];
    }

    useEffect(() => {
        fetchFullScript(file)
            .then((script: Block[]) => { setScript(script); return script })
            .then((script: Block[]) => { setRoot(findRoot(script)); return script})
            .then((script: Block[]) => { setTools(findTools(script)); return script })
            .then((script: Block[]) => setTexts(findTexts(script)))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, []);

    // note - this deletes text tools right now
    const update = useCallback(async () => {
        return updateScript(file, [root, ...tools])
            .catch((error) => console.error(error));
    }, [file, root, tools]);

    // Provide the context value to the children components
    return (
        <EditContext.Provider 
            value={{ 
                loading, setLoading, 
                root, setRoot, 
                tools, setTools,
                texts, setTexts,
                script, setScript,
                update,
            }}
        >
            {children}
        </EditContext.Provider>
    );
};

export { EditContext, EditContextProvider };

/*

interface ConfigureProps {
    file: string;
    tool?: Tool;
    className?: string;
    custom?: boolean;
}

const Configure: React.FC<ConfigureProps> = ({file, className, custom}) => {
    const [loading, setLoading] = useState(true);
    const [root, setRoot] = useState<Tool>({} as Tool);
    const [rootIndex, setRootIndex] = useState<number>(0);
    const [tools, setTools] = useState<string[]>([]);
    const [contexts, setContexts] = useState<string[]>([]);
    const [script, setScript] = useState<Block[]>([]);

    // initial fetch
    useEffect(() => {
        fetchFullScript(file)
            .then((data: Block[]) => { setScript(data); return data })
            .then((data: Block[]) => findRoot(data))
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, []);

    useEffect(debounce(() => {
        if (loading) return;
        updateTool(file, root.name || "root", script)
    }, 1000), [root, script, loading]);

    const findRoot = (script: Block[]): Tool => {
        for (let i = 0; i < script.length; i++) {
            const tool = script[i];
            if (tool.type === 'text') continue;
            setRoot(tool);
            setRootIndex(i);
            return tool;
        }
        return {} as Tool;
    }

    const abbreviate = (name: string) => {
        const words = name.split(/(?=[A-Z])|[\s_-]/);
        const firstLetters = words.map(word => word[0]);
        return firstLetters.slice(0, 2).join('').toUpperCase();
    }

    const customTools = useCallback(() => {
        return script.filter((block, i) => block.type === 'tool' && i > rootIndex ) as Tool[];
    }, [script, rootIndex]);

    if (loading) return <Loading>Loading your script's details...</Loading>;
*/