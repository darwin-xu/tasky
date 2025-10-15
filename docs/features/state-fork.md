# State Fork Feature - EPIC 3 Story 2

## Overview
This implementation enables users to fork a new State from an existing State, creating a visual connection between them through a directed link. This allows users to capture branching workflows or progression steps.

## Feature Description

### Fork vs Duplicate
- **Duplicate**: Creates an independent copy of a State (no link created)
- **Fork**: Creates a copy of a State AND creates a directed link from source → forked state

### User Interface

When a State card is selected, three action buttons appear in the top-right corner:

1. **Duplicate Button (⧉)** - Purple button at position (width - 90, 5)
2. **Fork Button (⑂)** - Green button at position (width - 60, 5) 
3. **Delete Button (✕)** - Red button at position (width - 30, 5)

### Fork Button Details
- **Color**: Green (#10b981)
- **Icon**: ⑂ (fork symbol)
- **Position**: Middle button in the action bar
- **Visibility**: Only visible when State is selected

## Functionality

### What Happens When You Fork a State

1. **Creates New State**
   - Copies description from source state
   - Copies date from source state
   - Copies priority from source state
   - Generates unique ID (`state-${Date.now()}`)

2. **Positions New State**
   - Offsets 40px right from source
   - Offsets 40px down from source
   - Snaps to 20px grid

3. **Creates Link**
   - Type: State → State
   - Source: Original state
   - Target: Forked state
   - Saved to in-memory links array

4. **Focuses New State**
   - Automatically selects the forked state
   - Ready for immediate editing via double-click

## Implementation Details

### Components Modified

#### StateCard.tsx
- Added `onFork?: (id: string) => void` prop
- Added `handleForkClick` handler
- Added Fork button UI (green button with ⑂ icon)
- Repositioned existing buttons to accommodate fork button

#### InfiniteCanvas.tsx
- Added `forkState` function to component
- Exposed `forkState` via ref interface
- Updated link rendering to support State → State links
- Modified link lookup to handle both Task → State and State → State

### Link Rendering Enhancement

The link rendering logic now supports:
- **Task → State** links (original functionality from Story 1)
- **State → State** links (new functionality for forking)

```typescript
// Dynamic link resolution
const sourceCard = link.sourceType === 'task' 
    ? tasks.find(t => t.id === link.sourceId)
    : states.find(s => s.id === link.sourceId)

const targetCard = link.targetType === 'task'
    ? tasks.find(t => t.id === link.targetId)  
    : states.find(s => s.id === link.targetId)
```

## Usage Instructions

### Forking a State

1. **Create a State card** (purple border)
2. **Click to select** the State card
3. **Click the green Fork button (⑂)** in the top-right
4. **New State appears** offset from original with a link
5. **Double-click to edit** the forked state

### Visual Indicators

- **Selected State**: Shows all three action buttons
- **Link Arrow**: Gray arrow from source → forked state
- **Offset Position**: New state appears 40px down-right from source
- **Grid Snap**: Position automatically snaps to 20px grid

## Testing

### Test Coverage

Created comprehensive test suite in `InfiniteCanvas.fork.test.tsx`:

1. ✅ `forkState` function exists and is exposed via ref
2. ✅ Fork creates a new state with copied fields
3. ✅ Fork creates a link from source to forked state
4. ✅ Forked state appears at offset position
5. ✅ Forked state is selected after creation
6. ✅ Fork button appears on selected state card
7. ✅ State → State links are supported

All tests pass successfully.

## Acceptance Criteria

✅ **Can fork from a State via context menu or shortcut**
- Fork button available in State card action bar
- Visual button with clear icon (⑂)

✅ **New State card created near source, offset and snapped to grid**
- 40px offset right and down
- Automatic grid snapping to 20px grid

✅ **Forked State copies fields from source**
- Description copied
- Date copied  
- Priority copied

✅ **Directed link created from source State → new State**
- State → State link type supported
- Link saved to in-memory state
- Link renders with arrow pointing to target

✅ **Focused for editing**
- Forked state automatically selected
- Ready for immediate editing

## Future Enhancements

This implementation provides foundation for:
- **Story 3**: Auto-update links when cards move
- **Story 4**: Select and inspect links
- **Story 5**: Delete links
- **Story 6**: Reassign link endpoints
- **Story 7**: Visualize relationship hierarchy on selection
- **Story 8**: Additional link validation
- **Story 9**: Link routing and clarity improvements
- **Story 10**: Multiple links and fan-out management

## Technical Notes

### Link Data Structure

```typescript
interface Link {
    id: string
    sourceId: string
    targetId: string
    sourceType: 'task' | 'state'
    targetType: 'task' | 'state'
}
```

### State Data Structure

```typescript
interface State {
    id: string
    x: number
    y: number
    description: string
    date?: string
    priority?: 'Low' | 'Medium' | 'High'
}
```

### Key Functions

- `forkState(stateId: string)` - Creates forked state with link
- `duplicateState(stateId: string)` - Creates copy without link
- Link rendering supports dynamic card type resolution
