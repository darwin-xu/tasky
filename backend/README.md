# Tasky Backend

Simple Express.js server providing REST API for tasks and states.

## Setup

```bash
npm install
npm start
```

By default the server runs on port `3001`.

## API

### `GET /api/tasks`
List all tasks.

### `POST /api/tasks`
Create a new task. Body accepts `title`, `description`, `date`, `priority`, and optional `x`, `y` coordinates.

### `PUT /api/tasks/:id`
Update an existing task. Use to move a task or edit fields.

### `DELETE /api/tasks/:id`
Remove a task and its states.

### `GET /api/states`
List all states.

### `POST /api/states`
Create a state linked to a task or parent state. Body accepts `taskId`, optional `parentStateId`, fields `description`, `date`, `priority`, and `x`, `y`.

### `PUT /api/states/:id`
Update an existing state.

### `DELETE /api/states/:id`
Delete a state.

### `GET /api/export`
Export all tasks and states as JSON.

### `POST /api/import`
Import tasks and states from JSON replacing current data.
