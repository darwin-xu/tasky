# Application Epics

This document outlines the high-level epics for the project, derived from the requirements document.

---

### EPIC 1: Core Canvas Functionality

**Description:** This epic covers the foundational features of the infinite canvas, which serves as the primary user interface for all interactions. It includes rendering the canvas, the grid system, and basic navigation.

**Dependencies:** None

**Key Features:**

- Endless (infinite) canvas rendering.
- Dotted grid background for visual structure.
- Snap-to-grid functionality for aligning elements.
- Pan (scroll) the canvas in any direction.
- Zoom in and out on the canvas.
- Responsive canvas that adapts to different screen sizes.

---

### EPIC 2: Card Management (Tasks & States)

**Description:** This epic focuses on the creation, representation, and manipulation of the core data objects: Task and State cards.

**Dependencies:** EPIC 1

**Key Features:**

- Create, Edit, and Delete Task cards.
- Task cards have fields: title, description, date, priority.
- Create, Edit, and Delete State cards.
- State cards have fields: description, date, priority.
- Cards can be freely dragged and dropped on the canvas.
- Card positions snap to the grid.
- Fork (duplicate) existing tasks or states.

---

### EPIC 3: Relationship & Link Management

**Description:** This epic covers the visual and logical connections between Task and State cards, which are essential for representing workflows and dependencies.

**Dependencies:** EPIC 2

**Key Features:**

- Create visual links (lines/arrows) between a Task and its States.
- Fork a new state from an existing state, creating a visual link.
- Links dynamically and automatically update their paths when connected cards are moved.
- Visualize the relationship hierarchy between cards.
- Remove or reassign links between cards.

---

### EPIC 4: Application Shell & UI

**Description:** This epic encompasses the main application frame, navigation, and overall user interface elements that are not part of the canvas itself.

**Dependencies:** EPIC 2

**Key Features:**

- A fixed taskbar at the top of the window.
- "Create Task" button in the taskbar.
- "Configuration" menu in the taskbar.
- A clean, minimal, and modern UI (e.g., using shadcn/ui or Material-UI).
- Consistent use of rounded corners, subtle shadows, and clear typography.
- Modals or inline editors for creating/editing cards.

---

### EPIC 5: Advanced Interactivity & UX

**Description:** This epic includes features that enhance the user experience by providing more powerful tools and smoother interactions.

**Dependencies:** EPIC 2, EPIC 3

**Key Features:**

- Undo/redo support for major actions (create, delete, move).
- Search functionality to find cards by name or content.
- Filter cards based on properties like priority, date, or tags.
- Highlight related cards and their connections upon selection.

---

### EPIC 6: User Management

**Description:** This epic covers user authentication and profile management, which are necessary for personalized data storage and future collaboration features.

**Dependencies:** None

**Key Features:**

- User registration (Email/Password).
- User login and logout.
- Secure password storage (hashing).
- API endpoints for all user management CRUD operations.
- Associate user accounts with their created data (tasks, states, canvases).

---

### EPIC 7: Data Persistence & Backend Integration

**Description:** This epic covers the backend functionality required to persist the application's state, ensuring that user data is saved and can be retrieved across sessions.

**Dependencies:** EPIC 2, EPIC 3, EPIC 6

**Key Features:**

- Backend API (Node.js) to manage data.
- Persist canvas state (cards, positions, links) to the database.
- Load the canvas state from the backend when the application starts.
- API endpoints for all CRUD operations on tasks and states.

---

### EPIC 8: Stretch Goals (Collaboration & Portability)

**Description:** This epic includes optional, advanced features that could be implemented after the core product is complete.

**Dependencies:** EPIC 5, EPIC 7

**Key Features:**

- Real-time multi-user collaboration on the same canvas.
- Export the entire canvas (layout, cards, links) to a JSON file.
- Import a canvas state from a JSON file.
