"use client"

import React, { use, useCallback, useRef } from 'react';
import ScriptNav from './components/scriptNav';
import CustomTool from './components/customTool';
import Chat from './components/chatTool';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation'
import 'reactflow/dist/style.css';
import type { Tool } from '@gptscript-ai/gptscript';
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
import Script from 'next/script';

const nodeTypes = {
    customTool: CustomTool,
    chat: Chat,
};

const fetchGraph = async (file: string | null) => {
    if (!file) return {nodes: [], edges: []};
    const response = await fetch(`http://localhost:3000/api/file/${file}?nodeify=true`);
    const data = await response.json();
    const nodes = data.nodes as RFNode[];
    const edges = data.edges as RFEdge[];
    return {nodes, edges};
};

const AddNodeOnEdgeDrop = () => {
    const file = useSearchParams().get('file');
    const reactFlowWrapper = useRef(null);
    const connectingNodeId = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { screenToFlowPosition } = useReactFlow();

    useEffect(() => {
        if (file === "new") {
            fetch(`http://localhost:3000/api/file`, {method: 'POST'})
                .then((response) => response.json())
                .then((data: any) => {
                    window.location.href = `/build?file=${data.file.replace('.gpt', '')}`;
                });
        }
    }, []);

    let id = 1;
    const getId = (): string => {
        while (nodes.some((node) => node.id === `new-tool-${id}`)) {
            id++;
        }
        return `${id}`;
    };

    useEffect(() => {
        fetchGraph(file).then((graph) => {
            setEdges(graph.edges);
            setNodes(graph.nodes);
        });
    }, []);

    const onConnect = useCallback(
        (params: any) => {
            params.animated = true;
            connectingNodeId.current = null;
            
            const sourceNode = nodes.find((node) => node.id === params.source)?.data as Tool;
            const targetNode = nodes.find((node) => node.id === params.target)?.data as Tool;

            if (!sourceNode?.tools) sourceNode.tools = [];
            if (!sourceNode?.tools?.includes(targetNode.name)) {
                sourceNode.tools.push(targetNode.name);
            }
            console.log('sourceNode', sourceNode);
            setNodes((nds) => {
                const newNodes = nds.map((node) => {
                    if (node.id === sourceNode?.name) node.data = sourceNode;
                    return node;
                });
                updateScript(newNodes);
                return newNodes;
            });
            setEdges((eds) => addEdge(params, eds))
        },
        [nodes],
    );

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

    const onConnectStart = useCallback((_: any, { nodeId }: any) => {
        connectingNodeId.current = nodeId;
    }, []);

    const onConnectEnd = useCallback(
        (event: any) => {
            if (!connectingNodeId.current) return;

            const targetIsPane = event.target.classList.contains('react-flow__pane');
            
            if (targetIsPane) {
                const sourceNode = nodes.find((node) => node.id === connectingNodeId.current);
                const id = `new-tool-${getId()}`;
                const newNode = {
                    id,
                    type: 'customTool',
                    position: screenToFlowPosition({
                        x: event.clientX,
                        y: event.clientY,
                    }),
                    data: {
                        name: id,
                        type: 'tool',
                    },
                    origin: [0.0, 0.0],
                };

                setNodes((nds) => {                    
                    const newNodes = nds.concat(newNode);
                    newNodes.forEach((node) => {
                        if (node.id === connectingNodeId.current) {
                            if (!(sourceNode?.data as Tool)?.tools) (sourceNode?.data as Tool).tools = [];
                            if (!(sourceNode?.data as Tool)?.tools?.includes(newNode.id)) {
                                (sourceNode?.data as Tool).tools.push(newNode.id);
                            }
                            node.data = sourceNode?.data;
                        }
                    })
                    updateScript(newNodes);
                    return newNodes;
                });
                setEdges((eds) =>
                    (eds as any).concat({ id: newNode.id, source: connectingNodeId.current, target: newNode.id, animated: true}),
                );
            }
        },
        [screenToFlowPosition, nodes],
    );

    const onNodeDragStop = useCallback((_event: any, _node: any) => updateScript(nodes), [nodes]);
    const onKeyUp = useCallback(() => updateScript(nodes), [nodes]);
    const onNodeDelete = useCallback((removedNodes: RFNode[]) => {
        const newNodes: RFNode[] = (nodes as RFNode[]).filter((node) => {
            return !removedNodes.find((removedNode) => removedNode.id === node.id)
        });
        updateScript(newNodes);
    },[nodes]);

    const updateScript = async (nodes: RFNode[]) => await fetch(`http://localhost:3000/api/file/${file}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nodes),
    });

    return (
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
                onKeyUp={onKeyUp}
                maxZoom={0.9}
                nodeOrigin={[0.0, 0.5]}
                fitView
            >
                <Panel position='top-left'>
                    <ScriptNav />
                </Panel>
                <Background />
            </ReactFlow>
        </div>
    );
};

export default () => (
  <ReactFlowProvider>
    <AddNodeOnEdgeDrop />
  </ReactFlowProvider>
);
