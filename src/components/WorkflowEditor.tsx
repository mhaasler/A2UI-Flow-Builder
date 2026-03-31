import React, { useCallback, useEffect } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Handle,
  Position,
  Connection,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useStateStore } from '@json-render/react';

// Custom Node Component
const ProfileNode = ({ data, isConnectable }: any) => {
  return (
    <div className="bg-white border-2 border-slate-200 rounded-lg p-4 shadow-sm min-w-[250px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-indigo-500" />
      <div className="font-bold text-sm mb-3 text-slate-800 border-b pb-2">{data.label}</div>
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Select Profile</label>
        <select 
          className="w-full text-sm border border-slate-300 rounded-md p-2 bg-slate-50 focus:ring-2 focus:ring-indigo-500 outline-none"
          value={data.selectedProfileId || ''}
          onChange={(e) => data.onChange(data.id, e.target.value)}
        >
          <option value="">-- Select {data.kind} --</option>
          {data.profiles.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name || p.id}</option>
          ))}
        </select>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-indigo-500" />
    </div>
  );
};

const nodeTypes = {
  profileNode: ProfileNode,
};

export const WorkflowEditor = ({ pluginId, profiles, onSave }: any) => {
  const { state, set } = useStateStore();
  
  // Initialize from global state if available, otherwise start with an empty canvas
  const initialNodes = (state.nodes && Array.isArray(state.nodes) && state.nodes.length > 0) ? state.nodes : [];
  const initialEdges = (state.edges && Array.isArray(state.edges) && state.edges.length > 0) ? state.edges : [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } } as any, eds)),
    [setEdges],
  );

  // Update node data when selection changes
  const handleNodeChange = useCallback((nodeId: string, profileId: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          node.data = { ...node.data, selectedProfileId: profileId };
          
          // Also update global state so UpsertProfile saves it correctly
          if (nodeId === 'source') set('sourceProfileId', profileId);
          if (nodeId === 'storage') set('rawStorageProfileId', profileId);
          if (nodeId === 'mapper') set('mapperProfileId', profileId);
          if (nodeId === 'target') set('targetProfileId', profileId);
        }
        return node;
      })
    );
  }, [setNodes, set]);

  // Ensure nodes have the onChange handler and latest profiles
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onChange: handleNodeChange,
          profiles: profiles.filter((p:any) => p.pluginId.startsWith(node.data.kind + '.')),
        },
      }))
    );
  }, [profiles, handleNodeChange, setNodes]);

  // Save layout to state
  useEffect(() => {
    set('nodes', nodes);
    set('edges', edges);
  }, [nodes, edges, set]);

  const addNode = (kind: string, label: string) => {
    const newNodeId = `${kind}-${Date.now()}`;
    const newNode = {
      id: newNodeId,
      type: 'profileNode',
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: {
        label,
        kind,
        profiles: profiles.filter((p:any) => p.pluginId.startsWith(`${kind}.`)),
        selectedProfileId: '',
        id: newNodeId,
        onChange: handleNodeChange
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="w-full h-full flex flex-col absolute inset-0">
      <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center z-10 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-800">Visual Workflow Editor</h2>
          <p className="text-sm text-slate-500">Connect your profiles to build the data pipeline.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 mr-4 border-r border-slate-200 pr-4">
            <button onClick={() => addNode('source', 'Source')} className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200">+ Source</button>
            <button onClick={() => addNode('storage', 'Storage')} className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200">+ Storage</button>
            <button onClick={() => addNode('mapper', 'Mapper')} className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200">+ Mapper</button>
            <button onClick={() => addNode('target', 'Target')} className="px-3 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border border-slate-200">+ Target</button>
          </div>
          <div className="flex flex-col">
            <label className="text-xs font-bold text-slate-500 uppercase">Workflow Name</label>
            <input 
              type="text" 
              className="border border-slate-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Daily Sync"
              value={state.profileName || ''}
              onChange={(e) => set('profileName', e.target.value)}
            />
          </div>
          <button 
            onClick={onSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium shadow-sm transition-colors"
          >
            Save Workflow
          </button>
        </div>
      </div>
      <div className="flex-1 w-full h-full bg-slate-50 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          attributionPosition="bottom-right"
        >
          <Controls />
          <Background color="#cbd5e1" gap={16} />
        </ReactFlow>
      </div>
    </div>
  );
};
