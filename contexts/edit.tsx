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
    newestToolName: () => string;
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
        updateScript(file, [root, ...tools]).catch((error) => console.error(error));
    }, [file, root, tools]);

    useEffect(() => {
        if (loading) return;
        update();
    }, [root, tools])


    const newestToolName = useCallback(() => {
        let num = 1
        for (let tool of [root, ...tools]) {
            if (tool.name === `new-tool-${num}`) num++;
        }
        return `new-tool-${num}`;
    }, [root, tools]);

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
                newestToolName,
            }}
        >
            {children}
        </EditContext.Provider>
    );
};

export { EditContext, EditContextProvider };
