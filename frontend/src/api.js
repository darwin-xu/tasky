const API_URL = 'http://localhost:3001/api';

export async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks`);
  return res.json();
}

export async function createTask(task) {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
  });
  return res.json();
}

export async function fetchStates() {
  const res = await fetch(`${API_URL}/states`);
  return res.json();
}

export async function createState(state) {
  const res = await fetch(`${API_URL}/states`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(state),
  });
  return res.json();
}
