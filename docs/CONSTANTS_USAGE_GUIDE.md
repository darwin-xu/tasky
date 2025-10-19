# Constants Usage Guide

## Quick Reference

This guide helps developers understand how to use the constants in the Tasky codebase.

## Import Patterns

### Basic Import
```typescript
import { CARD_WIDTH, CARD_HEIGHT, GRID_SPACING } from '../constants'
```

### Component-Specific Imports
```typescript
// For Task Cards
import { TASK_CARD, COLORS, TEXT, SNAP_PREVIEW } from '../constants'

// For State Cards
import { STATE_CARD, COLORS, TEXT, SNAP_PREVIEW } from '../constants'

// For Links
import { LINK, COLORS, TEXT } from '../constants'

// For Viewport/Canvas
import { 
    VIEWPORT_DEFAULT_WIDTH,
    VIEWPORT_DEFAULT_HEIGHT,
    VIEWPORT_ZOOM_FACTOR,
    GRID_SPACING,
    DEFAULTS,
    OFFSETS
} from '../constants'
```

## Common Use Cases

### 1. Card Dimensions
```typescript
// Always use constants for card dimensions
const MyCard = () => (
    <Rect
        width={CARD_WIDTH}      // Instead of: 200
        height={CARD_HEIGHT}    // Instead of: 120
    />
)
```

### 2. Grid Spacing
```typescript
// Use GRID_SPACING for all grid-related calculations
const snapped = snapPositionToGrid(
    position,
    GRID_SPACING,  // Instead of: 20
    scale
)
```

### 3. Task Card Layout
```typescript
// Use TASK_CARD constants for positioning
<Text
    x={TASK_CARD.TITLE_X}                                    // Instead of: 10
    y={TASK_CARD.TITLE_Y}                                    // Instead of: 15
    width={width - TASK_CARD.TITLE_WIDTH_PADDING}          // Instead of: width - 20
    fontSize={TASK_CARD.TITLE_FONT_SIZE}                   // Instead of: 16
    fontFamily={TEXT.FONT_FAMILY}                          // Instead of: 'Arial'
/>
```

### 4. State Card Layout
```typescript
// Use STATE_CARD constants for positioning
<Text
    x={STATE_CARD.DESCRIPTION_X}                           // Instead of: 10
    y={STATE_CARD.DESCRIPTION_Y}                           // Instead of: 15
    width={width - STATE_CARD.DESCRIPTION_WIDTH_PADDING}  // Instead of: width - 20
    height={STATE_CARD.DESCRIPTION_HEIGHT}                // Instead of: 60
/>
```

### 5. Colors
```typescript
// Use COLORS constants instead of hardcoded strings
fill={COLORS.PRIORITY_HIGH}           // Instead of: '#ef4444'
stroke={COLORS.TASK_BORDER_SELECTED}  // Instead of: '#2196f3'
```

### 6. Default Values
```typescript
// Use DEFAULTS for creating new entities
const newTask: Task = {
    id: `task-${Date.now()}`,
    x: snapped.x,
    y: snapped.y,
    title: DEFAULTS.TASK_TITLE,              // Instead of: 'New Task'
    description: DEFAULTS.TASK_DESCRIPTION,   // Instead of: ''
    date: DEFAULTS.TASK_DATE,                // Instead of: ''
    priority: DEFAULTS.TASK_PRIORITY,        // Instead of: 'Medium'
}
```

### 7. Offsets
```typescript
// Use OFFSETS for positioning calculations
const offsetX = original.x + OFFSETS.DUPLICATE_X  // Instead of: original.x + 40
const offsetY = original.y + OFFSETS.DUPLICATE_Y  // Instead of: original.y + 40
```

### 8. Link Routing
```typescript
// Use LINK constants for routing calculations
if (Math.abs(endX - startX) < LINK.DIRECT_PATH_THRESHOLD) {
    // Use direct path
}

const padding = LINK.OBSTACLE_PADDING
const routeAbove = maxTop - padding - LINK.ROUTE_ABOVE_BELOW_OFFSET
```

## Constants Organization

### Card-Related
- `CARD_WIDTH` - Standard card width (200)
- `CARD_HEIGHT` - Standard card height (120)
- `TASK_CARD` - All Task card layout values
- `STATE_CARD` - All State card layout values

### Grid-Related
- `GRID_SPACING` - Grid spacing (20)
- `GRID_DOT_RADIUS` - Grid dot size (1)
- `GRID_DOT_COLOR` - Grid dot color

### Viewport-Related
- `VIEWPORT_DEFAULT_WIDTH` - Default width (800)
- `VIEWPORT_DEFAULT_HEIGHT` - Default height (600)
- `VIEWPORT_INITIAL_SCALE` - Starting scale (1.0)
- `VIEWPORT_SCALE_MIN` - Min zoom (0.1)
- `VIEWPORT_SCALE_MAX` - Max zoom (10.0)
- `VIEWPORT_ZOOM_FACTOR` - Zoom increment (1.05)

### Snap Preview
- `SNAP_PREVIEW.STROKE_WIDTH` - Preview stroke (2)
- `SNAP_PREVIEW.DASH_PATTERN` - Dash array ([5, 5])
- `SNAP_PREVIEW.CORNER_RADIUS_TASK` - Task corner radius (4)
- `SNAP_PREVIEW.CORNER_RADIUS_STATE` - State corner radius (0)

### Link-Related
- `LINK.STROKE_WIDTH_NORMAL` - Normal stroke (2)
- `LINK.STROKE_WIDTH_SELECTED` - Selected stroke (3)
- `LINK.POINTER_LENGTH` - Arrow length (10)
- `LINK.POINTER_WIDTH` - Arrow width (10)
- `LINK.OBSTACLE_PADDING` - Routing padding (20)
- Plus many routing-specific constants

### Offsets
- `OFFSETS.DUPLICATE_X` - Horizontal duplicate offset (40)
- `OFFSETS.DUPLICATE_Y` - Vertical duplicate offset (40)
- `OFFSETS.LINK_STATE_CREATION_X` - Link state X offset (240)
- `OFFSETS.LINK_STATE_CREATION_Y` - Link state Y offset (0)

### Defaults
- `DEFAULTS.TASK_TITLE` - Default task title
- `DEFAULTS.STATE_DESCRIPTION` - Default state description
- `DEFAULTS.LINK_STYLE` - Default link style ('free')
- And more...

### Colors
- `COLORS.PRIORITY_HIGH` - High priority color
- `COLORS.TASK_BG_NORMAL` - Task background
- `COLORS.STATE_BORDER_SELECTED` - State border
- `COLORS.TEXT_TITLE` - Title text color
- And many more...

### Text
- `TEXT.FONT_FAMILY` - Font family ('Arial')
- `TEXT.PRIORITY_HIGH_LABEL` - High priority label ('🔴 High')
- `TEXT.DATE_ICON` - Date icon ('📅')
- `TEXT.ALIGN_CENTER` - Center alignment
- `TEXT.VERTICAL_ALIGN_MIDDLE` - Middle vertical alignment

## Best Practices

### ✅ DO

1. **Always import from constants**
   ```typescript
   import { CARD_WIDTH } from '../constants'
   ```

2. **Use descriptive constant names**
   ```typescript
   width={CARD_WIDTH}  // Clear what this is
   ```

3. **Use nested constants for related values**
   ```typescript
   fontSize={TASK_CARD.TITLE_FONT_SIZE}
   ```

4. **Keep constants organized by category**
   ```typescript
   // All card-related constants in TASK_CARD
   // All color constants in COLORS
   ```

### ❌ DON'T

1. **Don't hardcode values**
   ```typescript
   width={200}  // BAD - use CARD_WIDTH instead
   ```

2. **Don't duplicate constant values**
   ```typescript
   const MY_WIDTH = 200  // BAD - CARD_WIDTH already exists
   ```

3. **Don't use magic numbers**
   ```typescript
   x={position.x + 40}  // BAD - use OFFSETS.DUPLICATE_X
   ```

4. **Don't bypass constants for "convenience"**
   ```typescript
   gridSpacing={20}  // BAD - use GRID_SPACING
   ```

## When to Add New Constants

### Add a new constant when:
1. A value is used in multiple places
2. A value might need to change globally
3. A value has semantic meaning
4. A value is related to layout or sizing

### Example:
```typescript
// Bad - hardcoded
const buttonMargin = 8

// Good - constant
export const BUTTON_MARGIN = 8
```

## Modifying Constants

### To change a value globally:
1. Update the value in `src/constants/index.ts`
2. Run tests to ensure no regressions
3. Verify UI looks correct

### Example:
```typescript
// Change card width globally
export const CARD_WIDTH = 220  // Changed from 200

// All cards will now be 220px wide
```

## Testing with Constants

Constants make testing easier:

```typescript
import { CARD_WIDTH, CARD_HEIGHT } from '../constants'

test('card has correct dimensions', () => {
    const card = render(<TaskCard {...props} />)
    expect(card.width).toBe(CARD_WIDTH)
    expect(card.height).toBe(CARD_HEIGHT)
})
```

## Common Mistakes

### Mistake 1: Not importing constants
```typescript
// BAD
const width = 200

// GOOD
import { CARD_WIDTH } from '../constants'
const width = CARD_WIDTH
```

### Mistake 2: Creating local constants
```typescript
// BAD
const GRID_SIZE = 20  // Duplicate of GRID_SPACING

// GOOD
import { GRID_SPACING } from '../constants'
```

### Mistake 3: Mixing hardcoded and constants
```typescript
// BAD - inconsistent
width={CARD_WIDTH}
height={120}  // Should be CARD_HEIGHT

// GOOD - consistent
width={CARD_WIDTH}
height={CARD_HEIGHT}
```

## Summary

1. ✅ Always import constants instead of hardcoding values
2. ✅ Use descriptive constant names from the constants file
3. ✅ Keep related constants organized
4. ✅ Run tests after modifying constants
5. ❌ Never hardcode values that exist as constants
6. ❌ Don't create duplicate constants

For the complete list of constants, see `src/constants/index.ts`.
