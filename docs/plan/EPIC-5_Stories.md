# EPIC 5 Stories: Advanced Interactivity & UX

This document breaks down EPIC 5 into individual user stories, following the INVEST principles.

---

### Story 1: Undo/Redo Framework
- [ ] Not implemented yet

- **As a** user,
- **I want** undo and redo for major actions,
- **so that** I can safely experiment and recover from mistakes.

**Acceptance Criteria:**

- Supports undo/redo for create, delete, move (drag), and edit of cards, and link create/delete/reassign.
- Keyboard shortcuts: Cmd/Ctrl+Z (undo) and Cmd/Ctrl+Shift+Z (redo).
- Undo/redo stack persists for the current session and resets on page reload.
- Visual indicators (e.g., disabled/enabled states) reflect availability of undo/redo.

---

### Story 2: Search Cards by Text
- [ ] Not implemented yet

- **As a** user,
- **I want** to search cards by title or description,
- **so that** I can quickly find relevant items on large canvases.

**Acceptance Criteria:**

- A search input filters matching cards in real time by title/description (case-insensitive substring match).
- Non-matching cards and links are subtly de-emphasized; matches are highlighted.
- Clearing the search restores normal canvas appearance.

---

### Story 3: Filter Cards by Properties
- [ ] Not implemented yet

- **As a** user,
- **I want** to filter cards by priority, date range, or type (Task/State),
- **so that** I can focus on what matters.

**Acceptance Criteria:**

- Filter controls allow selecting one or more criteria: priority, date range, type.
- Filtering updates the canvas live; filtered-out items are hidden or de-emphasized.
- Filters can be reset to show all items.

---

### Story 4: Highlight Related Cards on Selection
- [ ] Not implemented yet

- **As a** user,
- **I want** related cards and links to be highlighted when I select an item,
- **so that** I can quickly understand context.

**Acceptance Criteria:**

- Selecting a Task highlights all linked States and connecting links.
- Selecting a State highlights its parent Task and adjacent States via links.
- Non-related items are de-emphasized until selection is cleared.

---

### Story 5: Smooth Interaction Performance
- [ ] Not implemented yet

- **As a** user,
- **I want** pan, zoom, drag, and selection interactions to remain smooth,
- **so that** the app feels responsive during heavy usage.

**Acceptance Criteria:**

- Interaction remains smooth on canvases with dozens of cards and links.
- No visual tearing, significant frame drops, or input lag during typical operations.
- Visual transitions (highlighting, de-emphasis) are subtle and non-blocking.

---

### Story 6: Persistent UI Preferences (Session)
- [ ] Not implemented yet

- **As a** user,
- **I want** search/filter criteria and visibility preferences to persist for the session,
- **so that** I don’t have to redo setup repeatedly.

**Acceptance Criteria:**

- Search text, filter selections, and de-emphasis options persist in memory until reload.
- Clearing preferences resets the canvas to the default view.

---

### Story 7: Accessible Search & Filter
- [ ] Not implemented yet

- **As a** keyboard user,
- **I want** to operate search and filters via keyboard,
- **so that** the features are accessible.

**Acceptance Criteria:**

- Inputs are keyboard reachable and have visible focus.
- Screen reader labels describe each control and state.
- Escape clears focus or closes any open filter dropdowns.

---

### Story 8: Keyboard Shortcuts for Discovery
- [ ] Not implemented yet

- **As a** user,
- **I want** keyboard shortcuts to quickly access search and filters,
- **so that** I can find and focus content faster.

**Acceptance Criteria:**

- Cmd/Ctrl+F focuses the search input without interfering with browser defaults where possible.
- A shortcut toggles the filter panel (e.g., Cmd/Ctrl+Shift+F), with visible focus on the first control.
- Shortcuts are discoverable via tooltips or a help hint and are accessible-friendly.

---

### Story 9: Navigate Search Results
- [ ] Not implemented yet

- **As a** user,
- **I want** to jump between search matches,
- **so that** I can review results efficiently.

**Acceptance Criteria:**

- Next/previous controls (and optional shortcuts) move selection through matches.
- The viewport recenters on the selected match without disorienting jumps.
- Wrap-around behavior is supported and clearly indicated.

---

### Story 10: Interaction Conflict Handling
- [x] Completed

- **As a** user,
- **I want** interactions to avoid conflicting gestures,
- **so that** my intent is respected during complex actions.

**Acceptance Criteria:**

- While dragging a card, link-creation gestures are suppressed; while panning, selection is prevented.
- Cursor states consistently reflect the active interaction (grab, pointer, crosshair, etc.).
- Priority of gesture handling is documented and consistent (pan < drag < link edit, etc.).
