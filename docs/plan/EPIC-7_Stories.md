# EPIC 7 Stories: Data Persistence & Backend Integration

This document breaks down EPIC 7 into individual user stories, following the INVEST principles.

---

### Story 1: Interface for Persistent Data
- [ ] Not implemented yet

- **As a** user,
- **I want** have a menu for persistent data,
- **so that** I can save and restore my tasks, states, and links.

**Acceptance Criteria:**

- A menu option exists to save the current canvas state to DB.
- A menu option exists to load the last saved canvas state from DB.
- A menu option exists to clear the current canvas state.
- A menu option exists to delete the saved canvas from DB.
- No actual data persistence is implemented yet; this is just the interface.

---

### Story 2: Persist Canvas
- [ ] Not implemented yet

- **As a** user,
- **I want** my canvas to be saved with their layout,
- **so that** I can return to my work later without losing my progress.

**Acceptance Criteria:**

- API endpoints to create/read/update/delete Tasks, States, and Links, including position fields.
- Hook the save option in the menu to these endpoints.
- Hook the save option in the menu to these endpoints.
- Users can save multiple canvases to the database, each with a user-defined name.
- Design all necessary data structures to store information for Tasks, States, and Links, along with a canvas metadata structure to hold them all together.

---

### Story 3: Load Canvas
- [ ] Not implemented yet

- **As a** user,
- **I want** load a canvas with all its tasks, states, and links,
- **so that** I can continue working seamlessly.

**Acceptance Criteria:**

- Hook the load option in the menu to the API endpoint to fetch the last saved canvas.
- Loading a canvas restores all items along with their positions.


---

### Story 4: Load Canvas on App Start
- [ ] Not implemented yet

- **As a** user,
- **I want** the canvas to load my data on app start,
- **so that** I can pick up where I left off.

**Acceptance Criteria:**

- On app initialization, the client loads cards, positions, and links from the backend.
- Loading failures show a clear, non-blocking error and retry option.

---

### Story 5: CRUD Endpoints for Tasks & States
- [ ] Not implemented yet

- **As a** developer,
- **I want** full CRUD endpoints for tasks and states,
- **so that** the client can manage data comprehensively.

**Acceptance Criteria:**

- Endpoints: list, get by id, create, update, delete for Tasks and States.
- Server-side validation ensures required fields and types.
- Errors return appropriate HTTP status codes and messages.

---

### Story 6: Error Handling & Logging
- [ ] Not implemented yet

- **As a** developer,
- **I want** consistent error handling and logs,
- **so that** I can debug issues in development and monitor in production.

**Acceptance Criteria:**

- Centralized error handler returns structured JSON errors.
- Basic request logging (method, path, status, latency) in development.
- Sensitive data is never logged.

---

### Story 7: Environment Configuration
- [ ] Not implemented yet

- **As a** developer,
- **I want** environment-driven config,
- **so that** the service runs reliably across dev/test/prod.

**Acceptance Criteria:**

- Configuration values (port, DB URL, CORS) come from env vars with reasonable defaults.
- A sample .env.example documents mandatory and optional settings.

---

### Story 8: Data Model & Migrations (Basic)
- [ ] Not implemented yet

- **As a** developer,
- **I want** a schema and migrations for core entities,
- **so that** the backend can evolve safely.

**Acceptance Criteria:**

- Define basic tables/collections for Users, Tasks, States, Links, and Canvas metadata.
- Initial migration creates these structures.

---

### Story 9: Ownership & Auth Integration Points
- [ ] Not implemented yet

- **As a** developer,
- **I want** endpoints ready to respect user ownership,
- **so that** data stays private to users.

**Acceptance Criteria:**

- Each resource includes a user ownership field.
- Middleware hook points exist to verify user identity (to integrate with EPIC 6).

---

### Story 10: Basic Rate Limiting & CORS
- [ ] Not implemented yet

- **As a** developer,
- **I want** minimal protections and cross-origin access controls,
- **so that** the API is safe and usable by the frontend.

**Acceptance Criteria:**

- Enable CORS for the frontend origin(s).
- Simple rate limiting per IP for write operations.
