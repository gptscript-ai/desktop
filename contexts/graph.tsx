import React, {createContext, useState, useCallback} from 'react';
import type {Node as RFNode, Edge as RFEdge, NodeChange, EdgeChange} from 'reactflow';
import {useNodesState, useEdgesState} from 'reactflow';
import type {CallFrame} from '@gptscript-ai/gptscript';
import {debounce, type DebouncedFunc} from 'lodash';

type OnChange<ChangesType> = (changes: ChangesType[]) => void;
type context = {
    nodes: RFNode[];
    edges: RFEdge[];
    setNodes: React.Dispatch<React.SetStateAction<RFNode[]>>;
    setEdges: React.Dispatch<React.SetStateAction<RFEdge[]>>;
    onNodesChange: OnChange<NodeChange>;
    onEdgesChange: OnChange<EdgeChange>;
    configPanel: React.JSX.Element;
    setConfigPanel: React.Dispatch<React.SetStateAction<React.JSX.Element>>;
    chatPanel: React.JSX.Element;
    setChatPanel: React.Dispatch<React.SetStateAction<React.JSX.Element>>;
    file: string;
    setFile: React.Dispatch<React.SetStateAction<string>>;
    calls: Record<string, CallFrame> | null;
    setCalls: React.Dispatch<React.SetStateAction<Record<string, CallFrame> | null>>;
    getId: () => string;
    updateScript: DebouncedFunc<(nodes: RFNode[]) => Promise<void>>;
    fetchGraph: (file: string | null) => Promise<{ nodes: RFNode[], edges: RFEdge[] }>;
}

export const GraphContext = createContext({} as context);

export const GraphContextProvider = ({children}: { children?: React.ReactNode }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [configPanel, setConfigPanel] = useState<React.JSX.Element>(<></>);
    const [chatPanel, setChatPanel] = useState<React.JSX.Element>(<></>);
    const [file, setFile] = useState<string>('');
    const [calls, setCalls] = useState<Record<string, CallFrame> | null>(null);

    const getId = (): string => {
        let id = 1;
        while (nodes.some((node) => node.id === `new-tool-${id}`)) {
            id++;
        }
        return `${id}`;
    };

    const fetchGraph = async (file: string | null) => {
        if (!file) return {nodes: [], edges: []};
        const response = await fetch(`/api/file/${file}?nodeify=true`);
        const data = await response.json();
        const nodes = data.nodes as RFNode[];
        const edges = data.edges as RFEdge[];
        return {nodes, edges};
    };

    // Call a debounced post to update the script with the new nodes every second.
    const updateScript = useCallback(debounce(async (nodes: RFNode[]) => {
        await fetch(`/api/file/${file}`, {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(nodes),
        });
    }, 1000), [file]);

    return (
        <GraphContext.Provider value={{
            file, setFile,
            nodes, setNodes, onNodesChange,
            edges, setEdges, onEdgesChange,
            configPanel, setConfigPanel,
            chatPanel, setChatPanel,
            calls, setCalls,
            getId,
            fetchGraph,
            updateScript,
        }}>
            {children}
        </GraphContext.Provider>
    );
};