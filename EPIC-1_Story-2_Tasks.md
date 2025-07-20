# Tasks for User Story: Visual Grid System

This document breaks down the user story "Visual Grid System" into specific, actionable tasks for both development (product code) and quality assurance (test cases).

---

### User Story: Visual Grid System
*   **As a** user,
*   **I want** to see a non-intrusive dotted grid on the canvas background,
*   **so that** I have a visual guide to help me align elements consistently.

---

### Product Code Tasks

1.  **Task 1: Create a `Grid` Component**
    *   **Description:** Develop a dedicated React component (e.g., `GridLayer`) responsible for rendering the grid pattern onto the Konva stage.
    *   **To-Do:**
        *   Create the `GridLayer.js` component file.
        *   This component will receive the current viewport `x`, `y`, `scale`, and dimensions (`width`, `height`) as props.
        *   Integrate the `GridLayer` component into the `InfiniteCanvas`, rendering it as a distinct layer behind the main content layer.

2.  **Task 2: Implement Grid Drawing Logic**
    *   **Description:** Write the logic to dynamically draw a grid of dots that fills the entire visible viewport. The grid should give the illusion of being infinite.
    *   **To-Do:**
        *   Define a configurable grid spacing (e.g., `gridSpacing = 20`).
        *   Calculate the start and end points for drawing the grid based on the viewport's current position and dimensions. The drawing loop should start from the top-left of the visible area and end at the bottom-right.
        *   Use the viewport's `x` and `y` offset to calculate the starting position of the grid pattern, ensuring it appears stationary as the user pans. For example, `startX = -viewport.x % (gridSpacing * scale)`.
        *   Use Konva `Circle` shapes to render the individual dots of the grid.

3.  **Task 3: Adapt Grid to Zoom Levels**
    *   **Description:** Ensure the grid scales correctly and remains performant and visually clean at different zoom levels.
    *   **To-Do:**
        *   The size and spacing of the rendered grid dots must be adjusted by the current `scale` factor.
        *   (Optional but recommended) Implement logic to adjust grid density based on the zoom level. For example, show a more detailed grid when zoomed in and a less dense grid when zoomed out to prevent visual clutter.

4.  **Task 4: Style the Grid for Subtle Appearance**
    *   **Description:** Style the grid to be a helpful guide without being distracting.
    *   **To-Do:**
        *   Set the fill color of the grid dots to a light, low-contrast color (e.g., `#e0e0e0`).
        *   Set the radius of the dots to be small (e.g., 1px).
        *   Ensure these style properties are easily configurable via props passed to the `GridLayer` component.

---

### Test Case Tasks

1.  **Test Case 1: Grid is Rendered on the Canvas**
    *   **Description:** Verify that the `GridLayer` component renders the dot pattern when the canvas is visible.
    *   **To-Do:**
        *   Write a unit test that renders the `InfiniteCanvas` containing the `GridLayer`.
        *   Since asserting the exact pixels of a canvas is difficult, the test can verify that the `GridLayer` component renders the correct number of `Circle` components based on the given viewport dimensions and grid spacing.
        *   Assert that the `GridLayer` is present in the React component tree.

2.  **Test Case 2: Grid Remains Aligned During Panning**
    *   **Description:** Confirm that the grid appears stationary relative to the world as the user pans the canvas.
    *   **To-Do:**
        *   Write a test that simulates a pan by updating the viewport `x` and `y` props passed to the `GridLayer`.
        *   Assert that the calculated positions of the rendered dots are correctly offset to maintain a consistent grid pattern in the new viewport.

3.  **Test Case 3: Grid Scales Correctly with Zoom**
    *   **Description:** Verify that the grid's visual appearance (dot size, spacing) updates correctly when the user zooms.
    *   **To-Do:**
        *   Write a test that changes the `scale` prop passed to the `GridLayer`.
        *   Assert that the `radius` and spacing of the rendered `Circle` components are correctly multiplied by the scale factor.

4.  **Test Case 4: Grid Styling is Applied**
    *   **Description:** Ensure the grid dots are rendered with the specified subtle styling.
    *   **To-Do:**
        *   Write a test that renders the `GridLayer`.
        *   Inspect the props of the rendered `Circle` components.
        *   Assert that the `fill` and `radius` props match the expected values for a subtle appearance (e.g., `{ fill: '#e0e0e0', radius: 1 }`).
