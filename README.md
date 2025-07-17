# Tasky

A simple task tracking tool featuring an infinite canvas interface.

Drag tasks and states to reposition them. Double-click nodes to add new states. An export button saves the canvas as JSON.

## Structure

- `backend` – Express.js API server
- `frontend` – React + Vite client

## Getting Started

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend to be running on `http://localhost:3001`.

For API details see [backend/README.md](backend/README.md).
