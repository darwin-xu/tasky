# Link Creation Feature - EPIC 3 Story 1

## Overview
This implementation enables users to create directed visual links from Task cards to State cards, allowing representation of which states belong to a task.

## Feature Components

### 1. Data Model
**Link Interface** (`src/types/index.ts`)
```typescript
export interface Link {
    id: string
    sourceId: string
    targetId: string
    sourceType: 'task' | 'state'
    targetType: 'task' | 'state'
}
```

### 2. Visual Components

#### Link Component (`src/components/Link.tsx`)
- Renders directional arrows with arrowheads
- Calculates optimal anchor points on card edges
- Features:
  - Dynamic anchor point calculation based on card positions
  - Automatic edge intersection detection
  - Selection state highlighting
  - Click handling for link selection

#### Connector Handle (TaskCard)
- Green circular button with arrow icon (→)
- Positioned on right middle edge of task card
- Only visible when task is selected
- Triggers link creation mode on mousedown/touch

### 3. User Interaction Flow

```
1. Select Task Card
   ↓ (card selected, connector handle appears)
   
2. Click Connector Handle
   ↓ (link creation mode activated)
   
3. Drag Cursor
   ↓ (preview line follows cursor)
   
4. Click State Card
   ↓ (link validated and created)
   
5. Link Appears
   ✓ (arrow from Task → State)
```

### 4. Validation Rules

#### Allowed
- ✅ Task → State connections

#### Blocked
- ❌ Duplicate links (same source + target)
- ❌ Task → Task connections
- ❌ State → Task connections  
- ❌ Self-links (card → itself)

### 5. Rendering Architecture

The canvas uses a 3-layer structure:

```
┌─────────────────────────┐
│   Layer 3: Cards        │  ← Task & State cards
├─────────────────────────┤
│   Layer 2: Links        │  ← Arrow links
├─────────────────────────┤
│   Layer 1: Grid         │  ← Background grid
└─────────────────────────┘
```

This ensures:
- Links appear behind cards but above grid
- Proper visual hierarchy
- Clean rendering at all zoom levels

### 6. Link Anchor Calculation

The system automatically calculates the best anchor point on card edges:

```typescript
// Determines intersection point based on direction
- Calculates angle from source to target
- Identifies which edge (top, right, bottom, left) to use
- Computes exact intersection point
- Returns coordinates for arrow start/end
```

This creates clean, professional-looking connections that attach to card edges rather than centers.

### 7. State Management

Links are stored in the InfiniteCanvas component state:
- `links`: Array of Link objects
- `isCreatingLink`: Boolean flag for creation mode
- `linkSourceId`: ID of source card during creation
- `linkPreviewEnd`: Cursor position for preview line
- `selectedLinkId`: Currently selected link

### 8. Edge Cases Handled

1. **Cancel Link Creation**: Click empty canvas to cancel
2. **Invalid Targets**: Only State cards accept links from Tasks
3. **Duplicate Prevention**: Checks existing links before creation
4. **Preview Updates**: Real-time preview follows cursor during creation
5. **Selection Management**: Proper cleanup when selecting different elements

## Testing

### Unit Tests
- ✅ 204 tests passing
- ✅ Link layer rendering
- ✅ Connector handle display
- ✅ Link creation flow

### Build
- ✅ TypeScript compilation successful
- ✅ No ESLint errors
- ✅ Production build optimized

## Acceptance Criteria Status

- ✅ Can start link by dragging from visible connector on Task
- ✅ Only Task → State pairs allowed
- ✅ Invalid drop targets prevented
- ✅ Directed link with arrowhead appears on drop
- ✅ Link saved in in-memory state
- ✅ Link attaches to sensible anchor points on card edges

## Future Enhancements (Other Stories)

This implementation provides foundation for:
- **Story 2**: Fork State from State (State → State links)
- **Story 3**: Auto-update links when cards move
- **Story 4**: Select and inspect links
- **Story 5**: Delete links
- **Story 6**: Reassign link endpoints
- **Story 7**: Visualize relationship hierarchy
- **Story 8**: Additional link validation
- **Story 9**: Link routing and clarity improvements
- **Story 10**: Multiple links and fan-out management

## Usage Instructions

### Creating a Link
1. Create a Task card (blue border)
2. Create a State card (purple border)
3. Drag cards to separate positions
4. Select the Task card
5. Click the green connector handle (→) on the right edge
6. Click on the State card
7. Link appears with arrow from Task to State

### Canceling Link Creation
- Click on empty canvas area to cancel
- Link preview disappears

### Link Properties
- Gray arrow when not selected
- Blue arrow when selected (click on link)
- Arrowhead points to target (State card)
- Anchor points auto-calculate based on positions
