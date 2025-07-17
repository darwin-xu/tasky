import React, { useEffect } from 'react';
import { Box, AppBar, Toolbar, Button, Typography } from '@mui/material';
import ReactFlow, { Background, Controls } from 'react-flow-renderer';
import { useStore } from './store';
import { fetchTasks, fetchStates, createTask, updateTask, createState, updateState, exportData } from './api';
import TaskNode from './TaskNode';
import StateNode from './StateNode';

function App() {
  const { tasks, states, setTasks, setStates, addTask, updateTask: setTaskState, addState, updateState: setStateState } = useStore();

  useEffect(() => {
    async function load() {
      setTasks(await fetchTasks());
      setStates(await fetchStates());
    }
    load();
  }, []);

  const elements = [
    ...tasks.map(task => ({
      id: task.id,
      type: 'task',
      position: { x: task.x, y: task.y },
      data: { title: task.title },
    })),
    ...states.map(state => ({
      id: state.id,
      type: 'state',
      position: { x: state.x, y: state.y },
      data: { description: state.description },
    })),
    ...states.map(state => ({
      id: `${state.id}-edge`,
      source: state.parentStateId || state.taskId,
      target: state.id,
      type: 'default',
      animated: true,
    })),
  ];

  const nodeTypes = { task: TaskNode, state: StateNode };

  const handleDragStop = (_, node) => {
    if (node.type === 'task') {
      updateTask(node.id, { x: node.position.x, y: node.position.y });
      setTaskState({ id: node.id, x: node.position.x, y: node.position.y });
    } else {
      updateState(node.id, { x: node.position.x, y: node.position.y });
      setStateState({ id: node.id, x: node.position.x, y: node.position.y });
    }
  };

  const handleCreateTask = async () => {
    const title = prompt('Task title');
    if (!title) return;
    const task = await createTask({ title });
    addTask(task);
  };

  const handleNodeDoubleClick = async (_, node) => {
    if (node.type === 'task') {
      const desc = prompt('State description');
      if (!desc) return;
      const st = await createState({ taskId: node.id, description: desc });
      addState(st);
    } else if (node.type === 'state') {
      const desc = prompt('State description');
      if (!desc) return;
      const parent = states.find(s => s.id === node.id);
      const st = await createState({ taskId: parent.taskId, parentStateId: parent.id, description: desc });
      addState(st);
    }
  };

  return (
    <Box sx={{ height: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Tasky</Typography>
          <Button color="inherit" onClick={handleCreateTask}>Create Task</Button>
          <Button color="inherit" onClick={async () => {
            const data = await exportData();
            const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'canvas.json';
            a.click();
            URL.revokeObjectURL(url);
          }}>Export</Button>
          <Button color="inherit">Configuration</Button>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <ReactFlow
        elements={elements}
        nodeTypes={nodeTypes}
        onNodeDragStop={handleDragStop}
        onNodeDoubleClick={handleNodeDoubleClick}
        snapToGrid
        snapGrid={[20, 20]}
        style={{ height: 'calc(100% - 64px)' }}
      >
        <Background gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </Box>
  );
}

export default App;
