# EPIC 3 Stories: Relationship & Link Management

This document breaks down EPIC 3 into individual user stories, following the INVEST principles.

---

### Story 1: Create Link (Task ➜ State)

- **As a** user,
- **I want** to create a directed visual link from a Task card to a State card,
- **so that** I can represent which states belong to a task.

**Acceptance Criteria:**

- I can start a link by dragging from a visible connector/handle on a Task and drop it on a State (or via context menu action with explicit source/target selection).
- Only valid pairs are allowed: Task ➜ State. Invalid drop targets show non-destructive feedback and cancel link creation.
- On drop, a directed link with an arrowhead from Task to State appears and is saved in in-memory state.
- Link attaches to sensible anchor points on the nearest card edge.

---

### Story 2: Fork New State From Existing State

- **As a** user,
- **I want** to fork a new State from an existing State,
- **so that** I can capture a new branch or next step while keeping a visual connection.

**Acceptance Criteria:**

- I can fork from a State via context menu or shortcut.
- A new State card is created near the source, offset and snapped to grid.
- The forked State copies fields from the source (description, date, priority) and is focused for editing.
- A directed link is created from the source State ➜ new State and saved to in-memory state.

---

### Story 3: Auto-Update Links When Cards Move

- **As a** user,
- **I want** links to follow cards as I move them,
- **so that** relationships stay visually correct.

**Acceptance Criteria:**

- While dragging a linked card, attached links update positions in real time and remain anchored to card edges.
- After drop, link endpoints snap cleanly to their final anchor points.
- Movement and link updates remain smooth with typical usage (e.g., dozens of cards and links) without visual tearing.

---

### Story 4: Select and Inspect Links

- **As a** user,
- **I want** to select a link and see clear feedback,
- **so that** I can inspect or act on it confidently.

**Acceptance Criteria:**

- Clicking a link selects it and shows a clear selection state (e.g., highlight or thicker stroke).
- A context menu for a selected link offers actions: Delete, Reassign Start, Reassign End.
- Clicking empty canvas clears link selection without side effects.

---

### Story 5: Delete Link

- **As a** user,
- **I want** to delete a link,
- **so that** I can remove relationships that are no longer valid.

**Acceptance Criteria:**

- I can delete a selected link via context menu or an obvious control.
- A confirmation step prevents accidental deletion.
- The link is removed from the canvas and in-memory state without affecting connected cards.
- No visual artifacts remain after deletion.

---

### Story 6: Reassign Link Endpoints

- **As a** user,
- **I want** to reassign a link’s start or end to a different card,
- **so that** I can correct mistakes or update relationships.

**Acceptance Criteria:**

- I can drag a selected link’s start or end handle to a new valid target.
- Valid reassignment preserves type constraints (Task ➜ State; State ➜ State only for fork-type links).
- Hovering over targets shows valid/invalid affordances; invalid targets cannot be dropped.
- Reassignment updates the existing link (no duplicate link created) and persists to in-memory state.

---

### Story 7: Visualize Relationship Hierarchy on Selection

- **As a** user,
- **I want** relationship-focused highlighting,
- **so that** I can quickly understand a Task and its related States (and State chains).

**Acceptance Criteria:**

- Selecting a Task highlights the Task, all linked States, and the connecting links; non-related elements are subtly de-emphasized.
- Selecting a State highlights its parent Task (if any), the State’s inbound/outbound State links, and adjacent States.
- Toggling selection off restores normal canvas appearance.

---

### Story 8: Link Validation Rules

- **As a** user,
- **I want** clear rules preventing invalid connections,
- **so that** the model stays consistent and predictable.

**Acceptance Criteria:**

- Disallowed connections: Task ➜ Task, State ➜ Task, self-links (card ➜ itself), duplicate links between the same pair and direction.
- Attempting a disallowed connection shows clear feedback and does not alter existing data.
- Allowed connections: Task ➜ State; State ➜ State (fork/sequence).
- Validation occurs both during creation and reassignment.

---

### Story 9: Link Routing, Layering, and Clarity

- **As a** user,
- **I want** links to be readable and not obstruct content,
- **so that** the canvas remains clear.

**Acceptance Criteria:**

- Links do not pass through card bodies; they route around card bounds (curved or orthogonal paths).
- Links render behind cards but above the grid at all zoom levels.
- Arrowheads and stroke thickness scale appropriately with zoom to remain legible.

---

### Story 10: Multiple Links and Fan-Out Management

- **As a** user,
- **I want** multiple links from a Task to remain distinguishable,
- **so that** dense relationship areas are still understandable.

**Acceptance Criteria:**

- A Task can link to many States; anchors fan out to avoid complete overlap at connection points.
- Crossing/parallel links remain visually separable near endpoints (e.g., slight spacing or smoothing).
- Rendering remains smooth with at least 100 simultaneous links on the canvas.
