import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3001;

let tasks = [];
let states = [];

// Task endpoints
app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, description, date, priority, x = 0, y = 0 } = req.body;
  const id = uuidv4();
  const task = { id, title, description, date, priority, x, y };
  tasks.push(task);
  res.status(201).json(task);
});

app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  const task = tasks.find(t => t.id === id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  Object.assign(task, req.body);
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  tasks = tasks.filter(t => t.id !== id);
  states = states.filter(s => s.taskId !== id);
  res.status(204).end();
});

// State endpoints
app.get('/api/states', (req, res) => {
  res.json(states);
});

app.post('/api/states', (req, res) => {
  const { taskId, parentStateId = null, description, date, priority, x = 0, y = 0 } = req.body;
  const id = uuidv4();
  const state = { id, taskId, parentStateId, description, date, priority, x, y };
  states.push(state);
  res.status(201).json(state);
});

app.put('/api/states/:id', (req, res) => {
  const { id } = req.params;
  const state = states.find(s => s.id === id);
  if (!state) return res.status(404).json({ error: 'State not found' });
  Object.assign(state, req.body);
  res.json(state);
});

app.delete('/api/states/:id', (req, res) => {
  const { id } = req.params;
  states = states.filter(s => s.id !== id);
  res.status(204).end();
});

// Export all data
app.get('/api/export', (req, res) => {
  res.json({ tasks, states });
});

// Import data (replace existing)
app.post('/api/import', (req, res) => {
  const { tasks: t = [], states: s = [] } = req.body;
  tasks = t;
  states = s;
  res.status(201).end();
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
