# Snap-to-Grid Feature Documentation

## Overview
The snap-to-grid feature ensures that cards (Tasks and States) align neatly to a grid when moved on the infinite canvas. This creates a clean, organized layout and improves visual consistency.

## Implementation

### Core Functionality
The snap-to-grid functionality is implemented in `/src/utils/snapToGrid.ts` and is used by all draggable card components:
- `DraggableCard`
- `TaskCard` 
- `StateCard`

### Key Components

#### 1. Snap Logic (`snapToGrid.ts`)
```typescript
snapToGrid(value, gridSpacing, scale)
```
- Snaps a single coordinate value to the nearest grid point
- Accounts for zoom scale to ensure consistent grid alignment at all zoom levels
- Uses `Math.round()` for nearest-point snapping

```typescript
snapPositionToGrid(position, gridSpacing, scale)
```
- Snaps both x and y coordinates of a position object
- Returns snapped position `{x, y}`

#### 2. Visual Affordance
All card components display a **snap preview** during drag:
- **Dashed outline** showing where the card will snap
- **Semi-transparent fill** indicating the preview nature
- **Color-coded** by card type:
  - DraggableCard: `rgba(100, 149, 237, 0.3)` - Cornflower Blue
  - TaskCard: `rgba(100, 149, 237, 0.3)` - Cornflower Blue  
  - StateCard: `rgba(139, 92, 246, 0.3)` - Purple

#### 3. Drag Behavior

**During Drag (`onDragMove`):**
1. Card position updates freely as user drags
2. Snap preview calculates nearest grid point
3. Preview outline shows future snap position

**On Drop (`onDragEnd`):**
1. Final position is snapped to grid
2. Card moves to snapped position
3. Preview is cleared
4. Parent component is notified of new position

### Grid Configuration

**Default Settings:**
- Grid spacing: `20px`
- Adjusts with canvas scale/zoom
- Effective spacing = `gridSpacing * scale`

**Examples:**
- At scale 1.0: Grid spacing is 20px
- At scale 2.0: Grid spacing is 40px (zoomed in)
- At scale 0.5: Grid spacing is 10px (zoomed out)

## Acceptance Criteria ✓

### ✓ Position Snapping
When a card is dropped, its position snaps to the nearest grid point.

**Implementation:** The `handleDragEnd` function in all card components uses `snapPositionToGrid()` to calculate and apply the snapped position.

### ✓ Visual Affordance  
A subtle visual affordance (magnetic feel or guide) indicates snapping near grid points.

**Implementation:** During drag, a semi-transparent dashed outline appears at the snap position, giving users visual feedback of where the card will land.

### ✓ Scale Consistency
Snapping behavior is consistent with the canvas grid scale and zoom level.

**Implementation:** The `snapToGrid` function multiplies grid spacing by the current scale factor, ensuring grid alignment at all zoom levels.

## Testing

### Unit Tests
- `snapToGrid.test.ts` - Tests for snap-to-grid utility functions
  - Tests basic snapping at scale 1
  - Tests different grid spacings
  - Tests zoom scale integration
  - Tests negative coordinates
  - Tests position object snapping

### Component Tests  
- `snapToGrid.drag.test.tsx` - Tests for drag-and-snap behavior (17 test cases)
  - DraggableCard snap-to-grid (TC8.1-8.4)
  - TaskCard snap-to-grid (TC8.5-8.7)
  - StateCard snap-to-grid (TC8.8-8.9)
  - Scale/zoom integration (TC8.10-8.12)
  - Visual affordance (TC8.13-8.14)
  - Edge cases (TC8.15-8.17)

### Manual Testing
1. Create cards using "+ Create Task" or "+ Create State" buttons
2. Drag cards around the canvas
3. Observe snap preview (dashed outline) during drag
4. Verify card snaps to grid on drop
5. Test at different zoom levels (Ctrl+Scroll)
6. Verify grid alignment remains consistent

## User Experience

### Visual Feedback
- **During Drag:** Users see a dashed outline showing where the card will snap
- **On Drop:** Card smoothly moves to the snapped position
- **Grid Dots:** Background grid dots help users understand the grid structure

### Performance
- Snapping calculations are lightweight (simple math operations)
- No impact on drag performance
- Snap preview updates in real-time during drag

## Edge Cases Handled

1. **Zero Grid Spacing:** Component renders without errors
2. **Negative Positions:** Correctly snaps negative coordinates
3. **Large Coordinates:** Handles very large coordinate values
4. **Fractional Scale:** Works correctly with fractional zoom scales (e.g., 0.5, 1.5)

## Related Files
- `/src/utils/snapToGrid.ts` - Core snap logic
- `/src/components/DraggableCard.tsx` - DraggableCard with snap
- `/src/components/TaskCard.tsx` - TaskCard with snap
- `/src/components/StateCard.tsx` - StateCard with snap
- `/src/components/GridLayer.tsx` - Visual grid dots
- `/src/__tests__/snapToGrid.test.ts` - Unit tests
- `/src/__tests__/snapToGrid.drag.test.tsx` - Component tests
