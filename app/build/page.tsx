"use client";

import React, { useCallback, useRef, useEffect, createContext, useState } from 'react';
import ScriptNav from './components/scriptNav';
import CustomTool from './components/tool';
import ToolBar from './components/toolbar';
import { useSearchParams } from 'next/navigation';
import 'reactflow/dist/style.css';
import type { Tool, Run } from '@gptscript-ai/gptscript';
import { debounce } from 'lodash';
import ReactFlow, {
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    ReactFlowProvider,
    Background,
    type Node as RFNode,
    type Edge as RFEdge,
    Panel,
} from 'reactflow';

const nodeTypes = {
    customTool: CustomTool,
};

const fetchGraph = async (file: string | null) => {
    if (!file) return { nodes: [], edges: [] };
    const response = await fetch(`/api/file/${file}?nodeify=true`);
    const data = await response.json();
    const nodes = data.nodes as RFNode[];
    const edges = data.edges as RFEdge[];
    return { nodes, edges };
};

type Context = {
    nodes: RFNode[];
    edges: RFEdge[];
    setNodes: React.Dispatch<React.SetStateAction<RFNode[]>>;
    setEdges: React.Dispatch<React.SetStateAction<RFEdge[]>>;
    ConfigPanel: React.JSX.Element;
    setConfigPanel: React.Dispatch<React.SetStateAction<React.JSX.Element>>;
    ChatPanel: React.JSX.Element;
    setChatPanel: React.Dispatch<React.SetStateAction<React.JSX.Element>>;
    file: string;
    run: Run | null;
    setRun: React.Dispatch<React.SetStateAction<Run | null>>;
    getId: () => string;
}

export const BuildContext = createContext({} as Context);

const AddNodeOnEdgeDrop = () => {
    const file = useSearchParams().get('file');
    const reactFlowWrapper = useRef(null);
    const connectingNode = useRef({id:'',handleId:''});
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [configPanel, setConfigPanel] = useState(<></>)
    const [chatPanel, setChatPanel] = useState(<></>);
    const [run, setRun] = useState<Run | null>(null);
    const { screenToFlowPosition } = useReactFlow();

    // Call a debounced post to update the script with the new nodes every second.
    const updateScript = useCallback(debounce(async (nodes: RFNode[]) => {
        await fetch(`/api/file/${file}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(nodes),
        });
    }, 1000),[]);

    // Create a new file if the file param is 'new'
    useEffect(() => {
        if (file === 'new') {
            fetch(`/api/file`, { method: 'POST' })
                .then((response) => response.json())
                .then((data: any) => {
                    window.location.href = `/build?file=${data.file.replace('.gpt', '')}`;
                });
        }
    }, []);

    // Fetch the graph data for this file
    useEffect(() => {
        fetchGraph(file).then((graph) => {
            setEdges(graph.edges);
            setNodes(graph.nodes);
        });
    }, []);

    // Call the updateScript function when the user changes a node's data
    // TODO: This gets triggered every time the node changes so we should adjust that.
    useEffect(() => {
        const handleEvent = (_: Event) => updateScript(nodes);
        window.removeEventListener('newNodeData', handleEvent)
        window.addEventListener('newNodeData', handleEvent);
        return () => window.removeEventListener('newNodeData', handleEvent);
    }, [updateScript, nodes]);

    // Generate a unique id for a new node based on the existing nodes
    const getId = (): string => {
        let id = 1;
        while (nodes.some((node) => node.id === `new-tool-${id}`)) {
            id++;
        }
        return `${id}`;
    };

    // When a connection is made between two nodes in the graph we want to update the script
    // to reflect the new connection. This involves adding the target tool to the source tool's
    // tools array and updating the script with the new nodes.
    const onConnect = useCallback(
        (params: any) => {
            params.animated = true;
            connectingNode.current = {id:'', handleId:''};

            const sourceNode = nodes.find((node) => node.id === params.source)?.data as Tool;
            const targetNode = nodes.find((node) => node.id === params.target)?.data as Tool;

            if (!sourceNode?.tools) sourceNode.tools = [];
            if (!sourceNode?.tools?.includes(targetNode.name)) {
                sourceNode.tools.push(targetNode.name);
            }
            setNodes((nds) => {
                const newNodes = nds.map((node) => {
                    if (node.id === sourceNode?.name) node.data = sourceNode;
                    return node;
                });
                updateScript(newNodes);
                return newNodes;
            });
            setEdges((eds) => addEdge(params, eds));
        },
        [nodes]
    );

    // When a connection between two nodes is deleted we want to remove the target tool from the
    // source tool's tools array and update the script with the new nodes.
    const onEdgesDelete = useCallback((removedEdges: RFEdge[]) => {
        removedEdges.forEach((removedEdge) => {
            const sourceNode = nodes.find((node) => node.id === removedEdge.source)?.data as Tool;
            const targetNode = nodes.find((node) => node.id === removedEdge.target)?.data as Tool;
            if (sourceNode?.tools) {
                const index = sourceNode.tools.indexOf(targetNode?.name);
                if (index !== -1) {
                    sourceNode.tools.splice(index, 1);
                }
            }
        });
        setNodes((nds) => {
            const newNodes = nds.map((node) => {
                const sourceNode = nodes.find((n) => n.id === node.id)?.data as Tool;
                if (sourceNode) {
                    node.data = sourceNode;
                }
                return node;
            });
            updateScript(newNodes);
            return newNodes;
        });
        setEdges((eds) => eds.filter((edge) => !removedEdges.some((removedEdge) => removedEdge.id === edge.id)));
    }, [nodes]);

    // When a connection is started we want to store the id of the node that is being connected
    const onConnectStart = useCallback((_: any, { nodeId, handleId }: any) => {
        connectingNode.current = {id: nodeId, handleId};
    }, []);

    // When a connection is ended we want to check if the target of the connection is a node or the pane
    // If the target is the pane we want to create a new tool node and connect it to the source tool node.
    // If the target is a node we want to connect the source tool node to the target tool node.
    const onConnectEnd = useCallback(
        (event: any) => {
            if (!connectingNode.current.id) return;
            const targetIsPane = event.target.classList.contains('react-flow__pane');
            if (!targetIsPane) return;

            // Build the new tool node
            const sourceNode = nodes.find((node) => node.id === connectingNode.current.id);
            const id = `new-tool-${getId()}`;
            const newNode = {
                id,
                type: 'customTool',
                position: screenToFlowPosition({x: event.clientX, y: event.clientY,}),
                data: { name: id, type: 'tool'},
                origin: [0.0, 0.0],
            };

            setNodes((nds) => {
                const newNodes = nds.concat(newNode);
                
                // Update the source node with the new tool
                newNodes.forEach((node) => {
                    if (node.id === connectingNode.current.id) {
                        if (!(sourceNode?.data as Tool)?.tools) (sourceNode?.data as Tool).tools = [];
                        if (!(sourceNode?.data as Tool)?.tools?.includes(newNode.id)) {
                            (sourceNode?.data as Tool).tools.push(newNode.id);
                        }
                        node.data = sourceNode?.data;
                    }
                });

                // Update the script with the new nodes
                updateScript(newNodes);
                return newNodes;
            });

            setEdges((eds) => [
                ...eds,
                {
                    id: newNode.id,
                    source: connectingNode.current.id,
                    target: newNode.id,
                    animated: true,
                    sourceHandleId: connectingNode.current.handleId,
                },
            ]);
        },
        [screenToFlowPosition, nodes]
    );

    // When a node is dragged we want to update the script with the new node positions.
    const onNodeDragStop = useCallback((_event: any, _node: any) => updateScript(nodes), [nodes]);

    // When a node is deleted we want to update the script with the remaining nodes.
    const onNodeDelete = useCallback((removedNodes: RFNode[]) => {
        const newNodes: RFNode[] = (nodes as RFNode[]).filter((node) => {
            return !removedNodes.find((removedNode) => removedNode.id === node.id);
        });
        updateScript(newNodes);
    }, [nodes]);


    const context = {
        nodes: nodes,
        edges: edges,
        setNodes: setNodes,
        setEdges: setEdges,
        ConfigPanel: configPanel,
        setConfigPanel: setConfigPanel,
        ChatPanel: chatPanel,
        setChatPanel: setChatPanel,
        file: `${file}.gpt` || '',
        run: run,
        setRun: setRun,
        getId: getId,
    };

    return (
        <BuildContext.Provider value={context}>
            <div className="w-full h-full" ref={reactFlowWrapper}>
                <ReactFlow
                    nodeTypes={nodeTypes}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodesDelete={onNodeDelete}
                    onConnect={onConnect}
                    onConnectStart={onConnectStart}
                    onConnectEnd={onConnectEnd}
                    onNodeDragStop={onNodeDragStop}
                    onEdgesDelete={onEdgesDelete}
                    nodeOrigin={[0.0, 0.5]}
                    fitView
                    
                >
                    <Panel position="top-left">
                        <ScriptNav />
                    </Panel>
                    <Panel position="bottom-left" className="max-w-3/4 max-h-3/4">
                        <ToolBar />
                    </Panel>
                    <Panel position="top-right">
                        {configPanel}
                    </Panel>
                    <Panel position="bottom-right">
                        {chatPanel}
                    </Panel>
                    <Background />
                </ReactFlow>
            </div>
        </BuildContext.Provider>
    );
};

export default () => (
    <ReactFlowProvider>
        <AddNodeOnEdgeDrop />
    </ReactFlowProvider>
);
