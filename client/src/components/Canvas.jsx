import React, { useCallback, useState } from 'react';
import ReactFlow, { MiniMap, Controls, Background, useNodesState, useEdgesState, addEdge } from 'react-flow-renderer';
import TaskCard from './TaskCard';

const initialNodes = [];
const initialEdges = [];

export default function Canvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(params => setEdges(eds => addEdge(params, eds)), []);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        snapToGrid={true}
        snapGrid={[20, 20]}
        fitView
      >
        <MiniMap />
        <Controls />
        <Background gap={20} />
      </ReactFlow>
    </div>
  );
}
