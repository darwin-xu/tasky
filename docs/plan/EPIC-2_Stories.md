# EPIC 2 Stories: Card Management (Tasks & States)

This document breaks down EPIC 2 into individual user stories, following the INVEST principles.

---

### Story 1: Create Task Card

*   **As a** user,
*   **I want** to create a new Task card on the canvas,
*   **so that** I can capture and organize work items visually.

**Acceptance Criteria:**
*   I can create a Task card via an obvious entry point (e.g., button, context menu, or shortcut).
*   The new card appears at the invocation location (cursor) or at a sensible default (canvas center) and respects snap-to-grid.
*   Task fields are present: title, description, date, priority.
*   The card is focused/selected after creation and ready for editing.
*   Creating a card does not degrade panning/zooming performance.

---

### Story 2: Edit Task Card

*   **As a** user,
*   **I want** to edit a Task card’s fields,
*   **so that** I can keep task details accurate and up to date.

**Acceptance Criteria:**
*   I can edit title, description, date, and priority through inline editing or an editor UI.
*   Priority is chosen from a finite set of options defined by the app.
*   Edits are saved to in-memory app state and reflected immediately on the card.
*   Exiting the editor (e.g., Enter, click outside, or explicit Save) preserves changes.
*   Invalid inputs (e.g., malformed date) are clearly indicated and do not overwrite existing valid data.

---

### Story 3: Delete Task Card

*   **As a** user,
*   **I want** to delete a Task card,
*   **so that** I can remove items that are no longer relevant.

**Acceptance Criteria:**
*   I can delete a Task card via context menu or an obvious control.
*   A confirmation step prevents accidental deletion.
*   The card is removed from the canvas and the in-memory state.
*   Deletion does not leave any visual artifacts on the canvas.

---

### Story 4: Create State Card

*   **As a** user,
*   **I want** to create a new State card on the canvas,
*   **so that** I can represent the status/progression of a task over time.

**Acceptance Criteria:**
*   I can create a State card via an obvious entry point (e.g., button, context menu, or shortcut).
*   The new card appears at the invocation location (cursor) or a sensible default and respects snap-to-grid.
*   State fields are present: description, date, priority.
*   The card is focused/selected after creation and ready for editing.

---

### Story 5: Edit State Card

*   **As a** user,
*   **I want** to edit a State card’s fields,
*   **so that** I can update progress details accurately.

**Acceptance Criteria:**
*   I can edit description, date, and priority through inline editing or an editor UI.
*   Priority is chosen from a finite set of options defined by the app.
*   Edits are saved to in-memory app state and reflected immediately on the card.
*   Validation feedback appears for invalid inputs (e.g., malformed date) without losing prior data.

---

### Story 6: Delete State Card

*   **As a** user,
*   **I want** to delete a State card,
*   **so that** I can remove outdated or incorrect states.

**Acceptance Criteria:**
*   I can delete a State card via context menu or an obvious control.
*   A confirmation step prevents accidental deletion.
*   The card is removed from the canvas and in-memory state.

---

### Story 7: Drag and Drop Cards

*   **As a** user,
*   **I want** to drag and drop Task and State cards anywhere on the canvas,
*   **so that** I can visually arrange information in a meaningful layout.

**Acceptance Criteria:**
*   Clicking and dragging a card moves it; the card follows the cursor smoothly.
*   The card remains selected while dragging and after drop.
*   Dragging performance remains smooth with multiple cards on the canvas.
*   Cards do not jump unexpectedly when the canvas pans or zooms.

---

### Story 8: Card Snap-to-Grid

*   **As a** user,
*   **I want** cards to snap to the grid when moved,
*   **so that** my layout remains neat and aligned.

**Acceptance Criteria:**
*   When a card is dropped, its position snaps to the nearest grid point.
*   A subtle visual affordance (e.g., magnetic feel or guide) indicates snapping near grid points.
*   Snapping behavior is consistent with the canvas grid scale and zoom level.

---

### Story 9: Fork / Duplicate Card

*   **As a** user,
*   **I want** to duplicate an existing Task or State card,
*   **so that** I can reuse structure or content without re-entering data.

**Acceptance Criteria:**
*   I can duplicate a card via context menu or shortcut.
*   The duplicate inherits all field values from the original at the time of duplication.
*   The duplicate appears offset from the original and respects snap-to-grid.
*   No relationships/links are created as part of duplication in this epic (links are handled in a separate epic).

---

### Story 10: Card Field Validation & Display

*   **As a** user,
*   **I want** clear validation and consistent display of card fields,
*   **so that** I can trust the information shown on the canvas.

**Acceptance Criteria:**
*   Dates use a consistent, human-readable format.
*   Priority is displayed consistently with a label or visual cue.
*   Empty optional fields are shown unobtrusively (e.g., placeholder) and do not clutter the UI.
*   Validation does not block navigation or canvas interaction and provides clear, accessible feedback.