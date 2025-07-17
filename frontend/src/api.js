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

export async function updateTask(id, updates) {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
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

export async function updateState(id, updates) {
  const res = await fetch(`${API_URL}/states/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
}

export async function exportData() {
  const res = await fetch(`${API_URL}/export`);
  return res.json();
}

export async function importData(data) {
  await fetch(`${API_URL}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}
