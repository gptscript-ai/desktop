import React, {createContext, useState, useEffect, useCallback, useRef} from 'react';
import {Tool, Text, Block} from '@gptscript-ai/gptscript';
import {getScript, updateScript} from '@/actions/me/scripts';
import { parse, stringify} from '@/actions/gptscript';

const DEBOUNCE_TIME = 1000; // milliseconds

export type ToolType = "tool" | "context" | "agent";

interface EditContextProps {
    scriptPath: string,
    children: React.ReactNode
}

interface EditContextState {
    loading: boolean;
    setLoading: (loading: boolean) => void;
    root: Tool;
    setRoot: React.Dispatch<React.SetStateAction<Tool>>;
    tools: Tool[];
    setTools: React.Dispatch<React.SetStateAction<Tool[]>>;
    texts: Text[];
    setTexts: React.Dispatch<React.SetStateAction<Text[]>>;
    script: Block[];
    setScript: React.Dispatch<React.SetStateAction<Block[]>>;
    visibility: 'public' | 'private' | 'protected';
    setVisibility: React.Dispatch<React.SetStateAction<'public' | 'private' | 'protected'>>;

    // actions
    update: () => Promise<void>;
    newestToolName: () => string;
    addNewTool: (toolType: ToolType) => void;
}

// EditContext is managing the state of the script editor.
const EditContext = createContext<EditContextState>({} as EditContextState);
const EditContextProvider: React.FC<EditContextProps> = ({scriptPath, children}) => {
    const [loading, setLoading] = useState(true);
    const [root, setRoot] = useState<Tool>({} as Tool);
    const [tools, setTools] = useState<Tool[]>([]);
    const [texts, setTexts] = useState<Text[]>([]);
    const [script, setScript] = useState<Block[]>([]);
    const [scriptId, setScriptId] = useState<number>(-1);
    const [visibility, setVisibility] = useState<'public' | 'private' | 'protected'>('private');
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

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
            if (withoutRoot[i].type === 'text') continue;
            withoutRoot.splice(i, 1);
            break;
        }
        return withoutRoot.filter((block) => block.type === 'tool') as Tool[];
    }, [root])

    const findTexts = (script: Block[]): Text[] => {
        return script.filter((block) => block.type === 'text') as Text[];
    }

    useEffect(() => {
        getScript(scriptPath)
            .then(async (script) => {
                const parsedScript = await parse(script.content || '')
                setScript(parsedScript);
                setRoot(findRoot(parsedScript));
                setTools(findTools(parsedScript));
                setTexts(findTexts(parsedScript));
                setVisibility(script.visibility as 'public' | 'private' | 'protected');
                setScriptId(script.id!);
            })
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, []);

    // note: The update function is debounced to prevent too many requests. The
    //       lodash debounce function was not used because it was causing issues.
    //       It is also worth noting that this deletes text tools.
    const update = useCallback(async () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            await updateScript({
                visibility: visibility,
                content: await stringify([root, ...tools]),
                id: scriptId,
            }).catch((error) => console.error(error));
        }, DEBOUNCE_TIME);
    }, [scriptId, root, tools, visibility]);

    useEffect(() => {
        if (loading) return;
        update();
    }, [root, tools, visibility])

    const newestToolName = useCallback(() => {
        let num = 1
        for (let tool of [root, ...tools]) {
            if (tool.name === `new-tool-${num}`) num++;
        }
        return `new-tool-${num}`;
    }, [root, tools]);

    const addNewTool = (toolType: ToolType) => {
        const id = Math.random().toString(36).substring(7)
        const newTool: Tool = {
            id,
            type: 'tool',
            name: newestToolName(),
        }
        setTools([...(tools || []), newTool]);
        console.log(toolType)
        if (!toolType) toolType = "tool"
        switch(toolType) {
            case 'tool':
                setRoot({...root, tools: [...(root.tools || []), newTool.name!]});
                break;
            case 'context':
                setRoot({...root, context: [...(root.context || []), newTool.name!]});
                break;
            case 'agent':
                setRoot({...root, agents: [...(root.agents || []), newTool.name!]});
                break;
        }
    }

    // Provide the context value to the children components
    return (
        <EditContext.Provider
            value={{
                loading, setLoading,
                root, setRoot,
                tools, setTools,
                texts, setTexts,
                script, setScript,
                visibility, setVisibility,
                update,
                newestToolName,
                addNewTool,
            }}
        >
            {children}
        </EditContext.Provider>
    );
};

export {EditContext, EditContextProvider};
