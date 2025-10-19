# Orthogonal Link Routing Algorithm

## Overview

This document describes the orthogonal link routing algorithm with obstacle avoidance implemented in the Link component.

## Problem Statement

When links are set to "orthogonal" style with "route around" enabled, they need to:
1. Connect from the right-middle of the source card to the left-middle of the target card
2. Use only horizontal and vertical segments (no diagonal lines)
3. Avoid passing through other cards on the canvas
4. Choose paths with the fewest turns over shorter paths
5. Fall back to a simple path if no obstacles block the way

## Algorithm Design

### Anchor Points

The algorithm **always** uses fixed anchor points:
- **Start point**: Right-middle of source card (`sourceX + sourceWidth`, `sourceY + sourceHeight/2`)
- **End point**: Left-middle of target card (`targetX`, `targetY + targetHeight/2`)

This ensures consistent and predictable link endpoints regardless of routing strategy.

### Simple Path (No Obstacles)

When no obstacles are present or route-around is disabled, the algorithm uses a simple 3-segment path:

```
[startX, startY, midX, startY, midX, endY, endX, endY]
```

Where `midX = (startX + endX) / 2`

This creates a path that:
1. Goes horizontally from source to midpoint
2. Goes vertically from midpoint to target's Y coordinate
3. Goes horizontally from midpoint to target

### Obstacle Detection

The algorithm:
1. Filters out source and target cards from obstacle list (cards can't be obstacles to themselves)
2. Adds padding (20 pixels) around each obstacle to create a buffer zone
3. Checks each segment of a path against all obstacles using axis-aligned bounding box intersection

A horizontal line segment intersects an obstacle if:
- The segment's Y coordinate falls within the obstacle's Y range (including padding)
- The segment's X range overlaps with the obstacle's X range (including padding)

A vertical line segment intersects an obstacle if:
- The segment's X coordinate falls within the obstacle's X range (including padding)
- The segment's Y range overlaps with the obstacle's Y range (including padding)

### Routing Strategies

When the simple path intersects obstacles, the algorithm tries multiple routing strategies and picks the best one:

#### Strategy 1: Route Above All Obstacles
- Finds the topmost Y coordinate among source, target, and obstacles
- Routes 40 pixels above this point
- Goes slightly right before turning up to avoid obstacles at the start
- Path: `[startX, startY, clearX, startY, clearX, aboveY, nearEndX, aboveY, nearEndX, endY, endX, endY]`

#### Strategy 2: Route Below All Obstacles
- Finds the bottommost Y coordinate among source, target, and obstacles
- Routes 40 pixels below this point
- Similar waypoint strategy as routing above
- Path: `[startX, startY, clearX, startY, clearX, belowY, nearEndX, belowY, nearEndX, endY, endX, endY]`

#### Strategy 3: Route Far Right
- Finds the rightmost X coordinate of all obstacles
- Routes 40 pixels to the right of this point
- Only used if there's enough space before the target
- Path: `[startX, startY, farRight, startY, farRight, endY, endX, endY]`

#### Strategy 4: Route Around Individual Obstacles
- For each obstacle that's actually in the way:
  - Try routing above it (30 pixels above its top edge)
  - Try routing below it (30 pixels below its bottom edge)
- Calculates appropriate waypoints before and after the obstacle
- Path (above): `[startX, startY, beforeX, startY, beforeX, aboveY, afterX, aboveY, afterX, endY, endX, endY]`
- Path (below): `[startX, startY, beforeX, startY, beforeX, belowY, afterX, belowY, afterX, endY, endX, endY]`

#### Strategy 5: Direct Path (Very Close Cards)
- Used when source and target are very close (less than 60 pixels apart)
- Goes slightly right, then vertically, then to target
- Path: `[startX, startY, startX+30, startY, startX+30, endY, endX, endY]`

### Path Selection

After generating all valid strategies (those that don't intersect obstacles), the algorithm:

1. **Counts turns** in each path (changes from horizontal to vertical or vice versa)
2. **Sorts** paths by:
   - Primary: Fewest turns (minimizes path complexity)
   - Secondary: Shortest path length (if turns are equal)
3. **Returns** the path with the fewest turns

This ensures the path is visually simple and easy to follow, even if it's not the absolute shortest distance.

### Fallback Behavior

If no valid strategy is found (rare edge case), the algorithm returns the simple path as a best-effort approach. This ensures links are always drawn, even if they might overlap obstacles.

## Implementation Details

### Helper Functions

#### `lineSegmentIntersectsRect(x1, y1, x2, y2, rect, padding)`
- Checks if a single line segment intersects with a rectangle
- Handles both horizontal and vertical segments
- Applies padding to rectangle bounds

#### `pathIntersectsObstacles(points, obstacles, padding)`
- Checks if any segment of a path intersects any obstacle
- Iterates through path segments and obstacles
- Returns `true` if any intersection found

#### `countTurns(points)`
- Counts direction changes in a path
- Detects when path switches from horizontal to vertical or vice versa
- Used to prefer simpler paths

### Performance Considerations

- Algorithm is O(n*m) where n is number of strategies and m is number of obstacles
- Typically 5-10 strategies tested per link
- Early termination when valid strategies found
- No pathfinding grid required (continuous space)
- Suitable for real-time canvas with dozens of links

## Test Coverage

The algorithm includes comprehensive test cases covering:

1. **Basic Path Generation**
   - Simple path when no obstacles
   - Path preservation when route-around is disabled

2. **Anchor Points**
   - Right-middle source anchor verification
   - Left-middle target anchor verification

3. **Obstacle Avoidance**
   - Single obstacle routing
   - Multiple obstacle routing
   - Source/target exclusion from obstacles

4. **Path Optimization**
   - Fewest turns preference
   - Multiple route comparison

5. **Edge Cases**
   - Vertically aligned cards
   - Target to left of source
   - Overlapping cards
   - Empty/undefined obstacle lists
   - Very close cards
   - Obstacles directly in path

6. **Style Verification**
   - Free vs orthogonal rendering
   - Line + Arrow components

7. **Path Validity**
   - Valid numeric coordinates
   - Even number of coordinates (x,y pairs)
   - Orthogonal segments (horizontal or vertical only)

## Future Enhancements

Potential improvements for future iterations:

1. **A* Pathfinding**: For complex scenarios with many obstacles, implement A* on a grid
2. **Bezier Curves**: Add smooth curves at corners for more polished appearance
3. **Link Bundling**: Group multiple parallel links to reduce visual clutter
4. **Dynamic Padding**: Adjust padding based on zoom level
5. **Path Caching**: Cache computed paths until cards move
6. **Diagonal Support**: Add option for diagonal connectors in addition to orthogonal

## References

- Orthogonal edge routing is a well-studied problem in graph layout
- Similar algorithms used in Visio, Lucidchart, and other diagramming tools
- This implementation uses heuristic strategies rather than full pathfinding for performance
