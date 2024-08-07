import React, {createContext, useState, useEffect, useCallback, useRef} from 'react';
import {Tool, Text, Block} from '@gptscript-ai/gptscript';
import {getScript, updateScript} from '@/actions/me/scripts';
import { parse, stringify} from '@/actions/gptscript';
import { getModels } from '@/actions/models';

const DEBOUNCE_TIME = 1000; // milliseconds
const DYNAMIC_INSTRUCTIONS = "dynamic-instructions";

export type ToolType = "tool" | "context" | "agent";
export type DependencyBlock = {
    content: string;
    forTool: string;
    type: string;
}

interface EditContextProps {
    scriptPath: string,
    children: React.ReactNode
}

interface EditContextState {
    loading: boolean;
    setLoading: (loading: boolean) => void;
    root: Tool;
    dependencies: DependencyBlock[]; setDependencies: React.Dispatch<React.SetStateAction<DependencyBlock[]>>;
    models: string[], setModels: React.Dispatch<React.SetStateAction<string[]>>;
    setRoot: React.Dispatch<React.SetStateAction<Tool>>;
    tools: Tool[];
    setTools: React.Dispatch<React.SetStateAction<Tool[]>>;
    texts: Text[];
    setTexts: React.Dispatch<React.SetStateAction<Text[]>>;
    script: Block[];
    setScript: React.Dispatch<React.SetStateAction<Block[]>>;
    visibility: 'public' | 'private' | 'protected';
    setVisibility: React.Dispatch<React.SetStateAction<'public' | 'private' | 'protected'>>;
    dynamicInstructions: string; setDynamicInstructions: React.Dispatch<React.SetStateAction<string>>;
    scriptPath: string;

    // actions
    update: () => Promise<void>;
    newestToolName: () => string;
    createNewTool: () => void;
    addRootTool: (tool: string) => void;
    removeRootTool: (tool: string) => void;
    deleteLocalTool: (tool: string) => void;
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
    const [models, setModels] = useState<string[]>([]);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    
    // Dynamic instructions are simply a text tool with the name "dynamic-instructions" that is 
    // imported as a context in the root tool. This field is used to store the instructions for
    // that tool.
    const [dynamicInstructions, setDynamicInstructions] = useState<string>('');

    // Dependencies are special text tools that reference a tool, type, and content. They are used
    // to store requirements.txt and package.json files for the script.
    const [dependencies, setDependencies] = useState<DependencyBlock[]>([]);

    useEffect(() => {
        getModels().then((m) => {
            setModels(m)
        })

        getScript(scriptPath)
            .then(async (script) => {
                const parsedScript = await parse(script.content || '')
                setScript(parsedScript);
                setRoot(findRoot(parsedScript));
                setTexts(findTexts(parsedScript));
                setVisibility(script.visibility as 'public' | 'private' | 'protected');
                setScriptId(script.id!);

                // dynamic instructions are stored in a special tool
                const tools = findTools(parsedScript);
                setTools(tools);
                setDynamicInstructions(tools.find((t) => t.name === DYNAMIC_INSTRUCTIONS)?.instructions || '');
            })
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, []);


    useEffect(() => {
        if (loading) return;
        update();
    }, [root, tools, dependencies, visibility])

    useEffect(() => {
        setTools((prevTools) => {
            return [
                ...prevTools.filter((t) => t.name !== DYNAMIC_INSTRUCTIONS),
                {name: DYNAMIC_INSTRUCTIONS, type: 'tool', instructions: dynamicInstructions}
            ] as Tool[];
        });

        setRoot((prevRoot) => {
            if (prevRoot.context?.includes(DYNAMIC_INSTRUCTIONS)) return prevRoot;
            return {...prevRoot, context: [...(prevRoot.context || []), DYNAMIC_INSTRUCTIONS]};
        });
    }, [dynamicInstructions]);

    useEffect(() => {

    }, [dependencies])

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

    // note: The update function is debounced to prevent too many requests. The
    //       lodash debounce function was not used because it was causing issues.
    //       It is also worth noting that this deletes text tools.
    const update = useCallback(async () => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(async () => {
            await updateScript({
                visibility: visibility,
                content: await stringify([root, ...tools, ...dependenciesToText(dependencies)]),
                id: scriptId,
            }).catch((error) => console.error(error));
        }, DEBOUNCE_TIME);
    }, [scriptId, root, tools, dependencies, visibility]);

    const newestToolName = useCallback(() => {
        let num = 1
        for (let tool of [root, ...tools]) {
            if (tool.name === `new-tool-${num}`) num++;
        }
        return `new-tool-${num}`;
    }, [root, tools]);

    const createNewTool = () => {
        const id = Math.random().toString(36).substring(7)
        const newTool: Tool = {
            id,
            type: 'tool',
            name: newestToolName(),
        }
        setTools([...(tools || []), newTool]);
        setRoot({...root, tools: [...(root.tools || []), newTool.name!]});
    }

    const addRootTool = (tool: string) => {
        setRoot({...root, tools: [...(root.tools || []), tool]});
    }

    const removeRootTool = (tool: string) => {
        setRoot({...root, tools: (root.tools || []).filter((t) => t !== tool)});
    }

    const deleteLocalTool = (tool: string) => {
        setRoot((prevRoot) => {
            if (!prevRoot.tools) return prevRoot;
            prevRoot.tools = prevRoot.tools.filter(tImport => tImport !== tool);
            return prevRoot;
        });

        setTools((prevTools) => {
            let updatedTools = prevTools.filter((t: Tool) => t.name !== tool);
            updatedTools = updatedTools.map((t: Tool) => {
                if (t.tools) {
                    t.tools = t.tools?.filter(tImport => tImport !== tool);
                }
                return t;
            });
            return updatedTools;
        });
    }

    const dependenciesToText = (dependencies: DependencyBlock[]): Text[] => {
        return dependencies
            .filter((dep) => dep.content.trim() !== '') // Filter out empty dependencies
            .map((dep) => {
                return {
                    id: `${dep.forTool}-${dep.type}`,
                    format: `metadata:${dep.forTool}:${dep.type}`,
                    type: 'text',
                    content: dep.content,
                    name: dep.forTool,
                }
            });
    }

    // Provide the context value to the children components
    return (
        <EditContext.Provider
            value={{
                scriptPath,
                dependencies, setDependencies,
                dynamicInstructions, setDynamicInstructions,
                models, setModels,
                loading, setLoading,
                root, setRoot,
                tools, setTools,
                texts, setTexts,
                script, setScript,
                visibility, setVisibility,
                update,
                addRootTool,
                deleteLocalTool,
                removeRootTool,
                newestToolName,
                createNewTool,
            }}
        >
            {children}
        </EditContext.Provider>
    );
};

export {EditContext, EditContextProvider};
