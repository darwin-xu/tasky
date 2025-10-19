# Value Categorization Analysis

This document categorizes all values found in the codebase into four types: Hard-coded, Predefined, Configurable, and Calculated.

## 1. HARD-CODED VALUES
*Values that are fundamental to the design and very rarely change. Defined directly in the code.*

### Color Values

#### Task Card Colors
- **Priority Colors:**
  - High: `#ef4444` (red)
  - Medium: `#f59e0b` (amber)
  - Low: `#10b981` (green)
  - Default: `#6b7280` (gray)

- **Card Background:**
  - Normal: `#ffffff` (white)
  - Dragging: `#e3f2fd` (light blue)

- **Card Border:**
  - Selected: `#2196f3` (blue)
  - Dragging: `#2196f3` (blue)
  - Normal: `#cccccc` (light gray)

- **Text Colors:**
  - Title: `#1f2937` (dark gray)
  - Description: `#6b7280` (gray)
  - Date: `#4b5563` (medium gray)

- **Button Colors:**
  - Delete: `#ef4444` (red)
  - Duplicate: `#3b82f6` (blue)
  - Link handle: `#10b981` (green)
  - Button text: `white`

#### State Card Colors
- **Priority Colors:** (same as Task)
  - High: `#ef4444` (red)
  - Medium: `#f59e0b` (amber)
  - Low: `#10b981` (green)
  - Default: `#6b7280` (gray)

- **Card Background:**
  - Normal: `#faf5ff` (light purple)
  - Dragging: `#f3e8ff` (lighter purple)

- **Card Border:**
  - Selected: `#8b5cf6` (purple)
  - Dragging: `#8b5cf6` (purple)
  - Normal: `#d8b4fe` (light purple)

- **Priority Indicator:**
  - Default: `#eab308` (yellow)

- **Button Colors:**
  - Delete: `#ef4444` (red)
  - Fork: `#10b981` (green)
  - Duplicate: `#8b5cf6` (purple)

#### Snap Preview Colors
- **Task snap preview:**
  - Fill: `rgba(100, 149, 237, 0.3)`
  - Stroke: `rgba(100, 149, 237, 0.8)`

- **State snap preview:**
  - Fill: `rgba(139, 92, 246, 0.3)`
  - Stroke: `rgba(139, 92, 246, 0.8)`

#### Link Colors
- **Selected:** `#2196f3` (blue)
- **Normal:** `#6b7280` (gray)
- **Style toggle button:** `#8b5cf6` (purple)
- **Route around button (active):** `#10b981` (green)
- **Route around button (inactive):** `#6b7280` (gray)

#### Grid
- **Dot color (default):** `#e0e0e0` (light gray)

#### UI Elements
- **Taskbar background:** `#282c34` (dark)
- **Taskbar border:** `#4a5568` (gray)
- **Taskbar button:** `#2196f3` (blue)
- **Taskbar button hover:** `#1976d2` (darker blue)
- **Taskbar button active:** `#1565c0` (darkest blue)
- **Taskbar button focus:** `#90caf9` (light blue)

#### Modals & Overlays
- **Overlay background:** `rgba(0, 0, 0, 0.5)` or `rgba(0, 0, 0, 0.7)`
- **Modal background:** `white`
- **Modal shadow:** `rgba(0, 0, 0, 0.1)`, `rgba(0, 0, 0, 0.06)`, `rgba(0, 0, 0, 0.3)`
- **Canvas background:** `#f5f5f5` (light gray)

#### Form Elements
- **Border:** `#d1d5db` (gray)
- **Focus border (Task):** `#2196f3` (blue)
- **Focus border (State):** `#8b5cf6` (purple)
- **Focus shadow (Task):** `rgba(33, 150, 243, 0.1)`
- **Focus shadow (State):** `rgba(139, 92, 246, 0.1)`
- **Error text:** `#ef4444` (red)
- **Required indicator:** `#ef4444` (red)
- **Label text:** `#374151` (dark gray)
- **Button cancel bg:** `#f3f4f6` (light gray)
- **Button cancel hover:** `#e5e7eb` (lighter gray)
- **Button cancel text:** `#374151` (dark gray)
- **Button save (Task):** `#2196f3` (blue)
- **Button save hover (Task):** `#1976d2` (darker blue)
- **Button save (State):** `#8b5cf6` (purple)
- **Button save hover (State):** `#7c3aed` (darker purple)
- **Button disabled:** `#9ca3af` (gray)

#### Confirm Dialog
- **Confirm button:** `#ef4444` (red)
- **Confirm button hover:** `#dc2626` (darker red)
- **Cancel button:** `#f3f4f6` (light gray)
- **Cancel button hover:** `#e5e7eb` (lighter gray)
- **Message text:** `#6b7280` (gray)

### Priority Labels & Icons
- High: `'🔴 High'`
- Medium: `'🟡 Medium'`
- Low: `'🟢 Low'`

### Date Format Icons
- Date icon: `'📅'` (prepended to dates)

### Font Families
- General: `'Arial'`
- System fonts: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`
- Monospace (debug): `monospace`

### Text Alignment
- `'center'`, `'middle'`
- `'word'` (text wrap)

### Boolean Flags
- `ellipsis: true`
- `cancelBubble: true`

---

## 2. PREDEFINED VALUES
*Values defined in a centralized location, modifiable only at compile time. Should be extracted to constants.*

### Dimensions

#### Card Dimensions
- **Default width:** `200` (TaskCard, StateCard)
- **Default height:** `120` (TaskCard, StateCard)
- **Card dimensions used in InfiniteCanvas:** `200` (width), `120` (height)

#### Component Positioning
- **TaskCard:**
  - Title Y position: `15`
  - Title X padding: `10`
  - Title width padding: `20` (width - 20)
  - Description top: `45`
  - Footer reserved height: `40`
  - Description X padding: `10`
  - Description width padding: `20`
  - Date Y offset: `30` (from bottom)
  - Priority Y offset: `15` (from bottom)
  - Priority indicator bar height: `4`
  
- **StateCard:**
  - Description Y position: `15`
  - Description X padding: `10`
  - Description height: `60`
  - Description width padding: `20`
  - Date Y offset: `35` (from bottom)
  - Priority Y offset: `20` (from bottom)
  - Priority indicator bar height: `4`

#### Button Dimensions
- **Delete button:**
  - X offset: `30` (from right edge)
  - Y position: `5`
  - Width: `24`
  - Height: `24`

- **Duplicate button (Task):**
  - X offset: `60` (from right edge)
  - Y position: `5`
  - Width: `24`
  - Height: `24`

- **Fork button (State):**
  - X offset: `60` (from right edge)
  - Y position: `5`
  - Width: `24`
  - Height: `24`

- **Duplicate button (State):**
  - X offset: `90` (from right edge)
  - Y position: `5`
  - Width: `24`
  - Height: `24`

- **Link handle (Task):**
  - X offset: `15` (from right edge)
  - Y center offset: `12`
  - Width: `24`
  - Height: `24`
  - Corner radius: `12`

#### Link Control Buttons
- **Style toggle button:**
  - X offset: `-40`
  - Y offset: `-36`
  - Width: `80`
  - Height: `24`

- **Route around button:**
  - X offset: `-40`
  - Y offset: `-8`
  - Width: `80`
  - Height: `24`

### Spacing & Layout

#### Grid
- **Default grid spacing:** `20`
- **Grid dot radius (default):** `1`
- **Grid buffer:** `2` (extra dots for seamless panning)

#### Snap Preview
- **Dash pattern:** `[5, 5]`
- **Stroke width:** `2`

#### Card Effects
- **Corner radius (Task):** `10`
- **Corner radius (State):** `0`
- **Corner radius (priority bar, Task):** `[4, 4, 0, 0]`
- **Corner radius (priority bar, State):** `0`
- **Shadow offset X:** `2`
- **Shadow offset Y:** `2`
- **Shadow blur (normal):** `5`
- **Shadow blur (selected):** `10`
- **Shadow blur (dragging):** `15`
- **Shadow opacity (normal):** `0.2`
- **Shadow opacity (selected):** `0.3`
- **Shadow opacity (dragging):** `0.4`

#### Stroke Widths
- **Card stroke (normal):** `2`
- **Card stroke (selected):** `3`
- **Link stroke (normal):** `2`
- **Link stroke (selected):** `3`
- **Link hit stroke width:** `20`

#### Arrow Dimensions
- **Pointer length:** `10`
- **Pointer width:** `10`

### Font Sizes
- **TaskCard:**
  - Title: `16`
  - Description: `12`
  - Date: `11`
  - Priority: `11`
  - Button text: `16`

- **StateCard:**
  - Description: `13`
  - Date: `11`
  - Priority: `11`
  - Button text: `16`

- **Link:**
  - Style toggle text: `12`
  - Route around text: `11`

- **Taskbar:**
  - Title: `1.5rem`
  - Button: `14px`

- **Modals:**
  - Title: `24px`
  - Label: `14px`
  - Input/textarea/select: `14px`
  - Error: `12px`
  - Button: `14px`

- **Confirm Dialog:**
  - Title: `20px`
  - Message: `14px`
  - Button: `14px`

- **Debug overlay:** `12px`

### Offsets & Increments

#### Duplicate/Fork Offsets
- **Duplicate offset X:** `40`
- **Duplicate offset Y:** `40`

#### Link Creation Offset
- **State creation offset X:** `240` (from task)
- **State creation offset Y:** `0`

#### Orthogonal Routing Padding
- **Obstacle padding:** `20`
- **Route above/below offset:** `40`
- **Clearance offset:** `10`, `30`
- **Far right offset:** `40`
- **Around obstacle offset:** `30`
- **Direct path threshold:** `60` (distance check)

### Default Values

#### Initial Viewport
- **Default width:** `800`
- **Default height:** `600`
- **Initial X:** `0`
- **Initial Y:** `0`
- **Initial scale:** `1.0`

#### Viewport Constraints
- **SCALE_MIN:** `0.1`
- **SCALE_MAX:** `10.0`

#### Zoom
- **Scale factor:** `1.05` (zoom multiplier)

#### Default Card Data
- **Default task title:** `'New Task'`
- **Default task description:** `''`
- **Default task date:** `''`
- **Default task priority:** `'Medium'`
- **Default state description:** `'New State'`
- **Default state date:** `''`
- **Default state priority:** `'Medium'`

#### Link Defaults
- **Default link style:** `'free'`
- **Default route around:** `false`

### CSS Values

#### Modal Dimensions
- **Modal width:** `90%`
- **Max width:** `500px` (Task/State editors)
- **Min width:** `320px` (Confirm dialog)
- **Max width:** `480px` (Confirm dialog)
- **Padding:** `24px`
- **Border radius:** `8px`

#### Spacing
- **Taskbar padding:** `10px 20px`
- **Taskbar gap:** `10px`
- **Button padding:** `8px 16px`
- **Button border radius:** `4px`
- **Field margin bottom:** `16px`
- **Label margin bottom:** `6px`
- **Input padding:** `8px 12px`
- **Textarea min height:** `80px`
- **Error margin top:** `6px`
- **Actions margin top:** `24px`
- **Actions gap:** `12px`
- **Title margin:** `0 0 20px 0` (Task/State editors)
- **Title margin:** `0 0 16px 0` (Confirm dialog)
- **Message margin:** `0 0 24px 0` (Confirm dialog)

#### Z-index Layers
- **Taskbar:** `100`
- **Modals/Overlays:** `1000`

#### Line Heights
- **Debug overlay:** `1.4`
- **Confirm dialog message:** `1.5`

#### Font Weights
- **Taskbar title:** `600`
- **Taskbar button:** `500`
- **Create task button:** `600`
- **Modal title:** `600`
- **Label:** `500`
- **Button:** `500`
- **Confirm dialog title:** `bold`

#### Transitions
- **Button transition:** `background-color 0.2s ease, transform 0.1s ease`
- **Generic button:** `all 0.2s`

#### Transform
- **Button active scale:** `0.98`

#### Focus Effects
- **Outline width:** `2px`
- **Outline offset:** `2px`
- **Box shadow blur:** `3px` (focus on inputs)

#### Box Shadows
- **Modal (Task/State):** `0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)`
- **Confirm dialog:** `0 10px 25px rgba(0, 0, 0, 0.3)`

#### Input Rows
- **Textarea rows:** `4` (both Task and State description)

---

## 3. CONFIGURABLE VALUES
*Values that should be stored in configuration and can be changed at runtime via UI or settings.*

### Grid Settings
- Grid spacing: `20` (currently hardcoded in multiple places)
- Grid dot color: `#e0e0e0`
- Grid dot radius: `1`

### Snap-to-Grid
- Enable/disable snap-to-grid (currently always on)
- Grid spacing for snapping

### Link Routing
- Default link style: `'free'` or `'orthogonal'`
- Default route around: `true`/`false`
- Obstacle padding for routing
- Routing strategy preferences

### Card Defaults
- Default card width: `200`
- Default card height: `120`
- Default priority: `'Medium'`

### Theme/Appearance
- Could make colors configurable (themes)
- Font sizes (accessibility)
- Shadow effects intensity

### Auto-save Settings
- Currently not implemented, but could be configurable

### Keyboard Shortcuts
- Duplicate shortcut: `Ctrl+D` / `Cmd+D`
- Could be made configurable

---

## 4. CALCULATED VALUES
*Values that must be derived from other values at runtime. Never hardcoded.*

### Layout Calculations

#### TaskCard
- **Description height:**
  ```typescript
  const descriptionHeight = Math.max(0, height - descriptionTop - footerReservedHeight)
  // Currently: height - 45 - 40
  ```

#### GridLayer
- **Scaled spacing:**
  ```typescript
  const scaledSpacing = gridSpacing * scale
  ```
- **Scaled radius:**
  ```typescript
  const scaledRadius = dotRadius * scale
  ```
- **Grid start positions:**
  ```typescript
  const startX = -x % scaledSpacing
  const startY = -y % scaledSpacing
  ```
- **Number of dots:**
  ```typescript
  const dotsX = Math.ceil(width / scaledSpacing) + 2
  const dotsY = Math.ceil(height / scaledSpacing) + 2
  ```

### Position Calculations

#### InfiniteCanvas
- **Center position (for new cards):**
  ```typescript
  const centerX = (dimensions.width / 2 - viewport.x) / viewport.scale
  const centerY = (dimensions.height / 2 - viewport.y) / viewport.scale
  ```

#### Snap to Grid
- **Snapped position:**
  ```typescript
  Math.round(value / scaledSpacing) * scaledSpacing
  ```

#### Duplicate Offsets
- **Duplicate position:**
  ```typescript
  const offsetX = original.x + 40
  const offsetY = original.y + 40
  const snapped = snapPositionToGrid({ x: offsetX, y: offsetY }, gridSpacing, scale)
  ```

#### Link Creation Offset
- **New state position:**
  ```typescript
  const offsetX = sourceTask.x + 240
  const offsetY = sourceTask.y
  const snapped = snapPositionToGrid({ x: offsetX, y: offsetY }, 20, viewport.scale)
  ```

### Viewport Calculations

#### Panning Delta
- **Mouse/touch move:**
  ```typescript
  const dx = pos.x - lastPointerPosition.x
  const dy = pos.y - lastPointerPosition.y
  viewport.updatePosition(viewport.x + dx, viewport.y + dy)
  ```

#### Zoom to Point
- **World coordinates:**
  ```typescript
  const worldX = (point.x - state.x) / state.scale
  const worldY = (point.y - state.y) / state.scale
  ```
- **New viewport position:**
  ```typescript
  const newX = point.x - worldX * validScale
  const newY = point.y - worldY * validScale
  ```

#### Wheel Zoom
- **New scale:**
  ```typescript
  const scaleBy = 1.05
  const direction = deltaY > 0 ? -1 : 1
  const newScale = viewport.scale * Math.pow(scaleBy, direction)
  ```

### Link Routing Calculations

#### Anchor Points
- **Edge calculation based on angle:**
  ```typescript
  const angle = Math.atan2(targetCenterY - sourceCenterY, targetCenterX - sourceCenterX)
  // Then calculate intersection with rectangle edge
  ```

#### Orthogonal Path
- **Start/End points:**
  ```typescript
  const startX = sourceX + sourceWidth
  const startY = sourceY + sourceHeight / 2
  const endX = targetX
  const endY = targetY + targetHeight / 2
  ```
- **Mid point (simple path):**
  ```typescript
  const midX = (startX + endX) / 2
  ```
- **Obstacle bounds:**
  ```typescript
  const obstacleLeft = Math.min(...obstacles.map((o) => o.x - padding))
  const obstacleRight = Math.max(...obstacles.map((o) => o.x + o.width + padding))
  const maxTop = Math.min(sourceY, targetY, ...obstacles.map((o) => o.y))
  const maxBottom = Math.max(sourceY + sourceHeight, targetY + targetHeight, ...obstacles.map((o) => o.y + o.height))
  ```

#### Link Control Button Position
- **Midpoint:**
  ```typescript
  const midX = (pathPoints[0] + pathPoints[pathPoints.length - 2]) / 2
  const midY = (pathPoints[1] + pathPoints[pathPoints.length - 1]) / 2
  ```

### Card Positioning

#### Button Positions (relative to card)
- **Link handle center:**
  ```typescript
  x={width - 15}
  y={height / 2 - 12}
  ```
- **Delete button:**
  ```typescript
  x={width - 30}
  ```
- **Duplicate button (Task):**
  ```typescript
  x={width - 60}
  ```
- **Fork button (State):**
  ```typescript
  x={width - 60}
  ```
- **Duplicate button (State):**
  ```typescript
  x={width - 90}
  ```

### Dimension Calculations

#### Container Size
- **Responsive dimensions:**
  ```typescript
  setDimensions({
    width: width || rect.width || 800,
    height: height || rect.height || 600,
  })
  ```

### ID Generation
- **Unique IDs:**
  ```typescript
  id: `task-${Date.now()}`
  id: `state-${Date.now()}`
  id: `link-${Date.now()}`
  ```

### Coordinate Transformations

#### Screen to World
```typescript
{
  x: (screenPos.x - viewportX) / scale,
  y: (screenPos.y - viewportY) / scale,
}
```

#### World to Screen
```typescript
{
  x: worldPos.x * scale + viewportX,
  y: worldPos.y * scale + viewportY,
}
```

### Validation Calculations

#### Scale Validation
```typescript
Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale))
```

#### Coordinate Validation
```typescript
isNaN(value) || !isFinite(value) ? fallback : value
```

### Text Processing
- **Trimmed values:**
  ```typescript
  title.trim()
  description.trim()
  ```

---

## Summary

### Hard-coded (56 color definitions, fonts, icons)
- Should remain in code but could be organized into theme objects
- Rarely change
- Include: all colors, font families, priority labels, icons

### Predefined (150+ numeric values)
- **SHOULD BE EXTRACTED** to constants file
- Modified only at compile time
- Include: dimensions, spacing, offsets, font sizes, default values

### Configurable (13 settings)
- Should be moved to user/app settings
- Modified at runtime
- Include: grid settings, defaults, theme preferences

### Calculated (40+ formulas)
- Must remain as runtime calculations
- Derived from other values
- Include: positions, transforms, layout calculations, viewport math

---

## Recommendations

1. **Create constants file** for all predefined values
2. **Group related values** (e.g., all card dimensions together)
3. **Use descriptive names** (e.g., `CARD_WIDTH` instead of `200`)
4. **Consider theme system** for colors
5. **Add configuration UI** for configurable values
6. **Document all calculated values** with comments explaining the formula
7. **Use TypeScript enums** for priority levels and other fixed sets
