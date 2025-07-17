import React, { useEffect } from 'react';
import { Box, AppBar, Toolbar, Button, Typography } from '@mui/material';
import ReactFlow, { Background, Controls } from 'react-flow-renderer';
import { useStore } from './store';
import { fetchTasks, fetchStates } from './api';

function App() {
  const { tasks, states, setTasks, setStates } = useStore();

  useEffect(() => {
    async function load() {
      setTasks(await fetchTasks());
      setStates(await fetchStates());
    }
    load();
  }, []);

  const elements = [
    ...tasks.map(task => ({ id: task.id, type: 'default', data: { label: task.title }, position: { x: 0, y: 0 } })),
    ...states.map(state => ({ id: state.id, type: 'default', data: { label: state.description }, position: { x: 100, y: 100 } })),
    ...states.map(state => ({ id: `${state.id}-edge`, source: state.taskId, target: state.id, type: 'default', animated: true }))
  ];

  return (
    <Box sx={{ height: '100vh' }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Tasky</Typography>
          <Button color="inherit">Create Task</Button>
          <Button color="inherit">Configuration</Button>
        </Toolbar>
      </AppBar>
      <Toolbar />
      <ReactFlow elements={elements} snapToGrid snapGrid={[20, 20]} style={{ height: 'calc(100% - 64px)' }}>
        <Background gap={20} size={1} />
        <Controls />
      </ReactFlow>
    </Box>
  );
}

export default App;
