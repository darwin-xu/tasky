# EPIC 7 Stories: Data Persistence & Backend Integration

This document breaks down EPIC 7 into individual user stories, following the INVEST principles.

---

### Story 1: Backend API Skeleton (Node.js)

- **As a** developer,
- **I want** a minimal backend API scaffold,
- **so that** the app can persist and fetch data.

**Acceptance Criteria:**

- Create a Node.js API service structure with routing, controllers, and basic error handling.
- Health check endpoint returns service status and version.
- Configuration is driven by environment variables with safe defaults.

---

### Story 2: Persist Cards and Positions

- **As a** user,
- **I want** my tasks, states, and their positions saved,
- **so that** my canvas layout is preserved between sessions.

**Acceptance Criteria:**

- API endpoints to create/read/update/delete Tasks and States, including position fields.
- Saving updates the backend; loading restores the last saved positions.
- Data model supports card fields from EPIC 2 and position on the canvas.

---

### Story 3: Persist Links

- **As a** user,
- **I want** links between cards saved and restored,
- **so that** relationships are preserved.

**Acceptance Criteria:**

- API endpoints to create/read/delete links and reassign endpoints.
- Loading a canvas restores all links with correct endpoints.

---

### Story 4: Load Canvas on App Start

- **As a** user,
- **I want** the canvas to load my data on app start,
- **so that** I can pick up where I left off.

**Acceptance Criteria:**

- On app initialization, the client loads cards, positions, and links from the backend.
- Loading failures show a clear, non-blocking error and retry option.

---

### Story 5: CRUD Endpoints for Tasks & States

- **As a** developer,
- **I want** full CRUD endpoints for tasks and states,
- **so that** the client can manage data comprehensively.

**Acceptance Criteria:**

- Endpoints: list, get by id, create, update, delete for Tasks and States.
- Server-side validation ensures required fields and types.
- Errors return appropriate HTTP status codes and messages.

---

### Story 6: Error Handling & Logging

- **As a** developer,
- **I want** consistent error handling and logs,
- **so that** I can debug issues in development and monitor in production.

**Acceptance Criteria:**

- Centralized error handler returns structured JSON errors.
- Basic request logging (method, path, status, latency) in development.
- Sensitive data is never logged.

---

### Story 7: Environment Configuration

- **As a** developer,
- **I want** environment-driven config,
- **so that** the service runs reliably across dev/test/prod.

**Acceptance Criteria:**

- Configuration values (port, DB URL, CORS) come from env vars with reasonable defaults.
- A sample .env.example documents mandatory and optional settings.

---

### Story 8: Data Model & Migrations (Basic)

- **As a** developer,
- **I want** a schema and migrations for core entities,
- **so that** the backend can evolve safely.

**Acceptance Criteria:**

- Define basic tables/collections for Users, Tasks, States, Links, and Canvas metadata.
- Initial migration creates these structures.

---

### Story 9: Ownership & Auth Integration Points

- **As a** developer,
- **I want** endpoints ready to respect user ownership,
- **so that** data stays private to users.

**Acceptance Criteria:**

- Each resource includes a user ownership field.
- Middleware hook points exist to verify user identity (to integrate with EPIC 6).

---

### Story 10: Basic Rate Limiting & CORS

- **As a** developer,
- **I want** minimal protections and cross-origin access controls,
- **so that** the API is safe and usable by the frontend.

**Acceptance Criteria:**

- Enable CORS for the frontend origin(s).
- Simple rate limiting per IP for write operations.
