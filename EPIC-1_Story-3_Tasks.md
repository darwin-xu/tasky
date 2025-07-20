# Tasks for User Story: Canvas Panning

This document breaks down the user story "Canvas Panning" into specific, actionable tasks for both development (product code) and quality assurance (test cases).

---

### User Story: Canvas Panning
*   **As a** user,
*   **I want** to pan the canvas in any direction (horizontally and vertically),
*   **so that** I can navigate to different areas of my workspace.

---

### Product Code Tasks

1.  **Task 1: Implement Mouse Drag-to-Pan Logic**
    *   **Description:** Capture mouse events on the canvas stage to enable panning by clicking and dragging the background.
    *   **To-Do:**
        *   Add `onMouseDown`, `onMouseMove`, and `onMouseUp` event handlers to the Konva `Stage`.
        *   On `mousedown`, record the initial pointer position and set a state flag (e.g., `isPanning = true`).
        *   On `mousemove`, if `isPanning` is true, calculate the difference between the current and initial pointer positions.
        *   Update the viewport's `x` and `y` state based on this difference.
        *   On `mouseup` (or `onMouseLeave`), reset the panning state flag (`isPanning = false`).

2.  **Task 2: Implement Trackpad Panning (Scroll Event)**
    *   **Description:** Handle the `onWheel` event to allow users to pan the canvas using a trackpad's two-finger scroll.
    *   **To-Do:**
        *   Add an `onWheel` event handler to the Konva `Stage`.
        *   Inside the handler, call `evt.evt.preventDefault()` to stop the page from scrolling.
        *   Read the `deltaX` and `deltaY` values from the wheel event.
        *   Update the viewport's `x` and `y` state by adding the `deltaX` and `deltaY` values to the current position.

3.  **Task 3: Implement Cursor Style Changes for UX**
    *   **Description:** Provide clear visual feedback to the user by changing the mouse cursor style during the panning operation.
    *   **To-Do:**
        *   Set the default cursor for the pannable stage area to `"grab"`.
        *   On `mousedown`, programmatically change the cursor style of the stage to `"grabbing"`.
        *   On `mouseup` or `mouseleave`, revert the cursor style back to `"grab"`.

4.  **Task 4: Optimize Panning Performance**
    *   **Description:** Ensure the panning interaction is smooth and responsive, even on complex canvases.
    *   **To-Do:**
        *   Ensure the `mousemove` event handler contains only efficient calculations.
        *   Profile the component during panning to identify and resolve any performance bottlenecks. Using `requestAnimationFrame` for state updates can be considered if stuttering occurs, though modern frameworks often handle this internally.

---

### Test Case Tasks

1.  **Test Case 1: Verify Mouse Drag Panning**
    *   **Description:** Confirm that clicking and dragging the canvas background correctly updates the viewport's position.
    *   **To-Do:**
        *   Write a test that simulates a `mousedown` event on the stage.
        *   Simulate one or more `mousemove` events to a new coordinate.
        *   Simulate a `mouseup` event.
        *   Assert that the final `x` and `y` state of the viewport has been updated by the correct total delta of the mouse movement.

2.  **Test Case 2: Verify Trackpad/Wheel Panning**
    *   **Description:** Confirm that using the scroll wheel or a trackpad gesture correctly pans the canvas.
    *   **To-Do:**
        *   Write a test that dispatches a `wheel` event on the stage with specific `deltaX` and `deltaY` values.
        *   Assert that the `x` and `y` state of the viewport has been updated by the `deltaX` and `deltaY` amounts.
        *   Assert that the default browser scroll behavior was prevented.

3.  **Test Case 3: Verify Cursor Changes on Drag**
    *   **Description:** Ensure the cursor style changes appropriately to provide visual feedback during panning.
    *   **To-Do:**
        *   Write a test that simulates a `mousedown` event.
        *   Assert that the `style.cursor` of the canvas container is set to `"grabbing"`.
        *   Simulate a `mouseup` event.
        *   Assert that the `style.cursor` has reverted to its default state (`"grab"`)

4.  **Test Case 4: Panning Stops When Mouse Leaves Canvas**
    *   **Description:** The panning operation should cease if the user is dragging and the mouse leaves the canvas area.
    *   **To-Do:**
        *   Write a test that simulates a `mousedown` on the canvas.
        *   Simulate a `mousemove` event.
        *   Simulate the mouse leaving the canvas area by triggering an `onMouseLeave` event.
        *   Assert that the component's internal panning state is correctly reset (e.g., `isPanning = false`).
