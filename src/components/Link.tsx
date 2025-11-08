import React, { useMemo } from 'react'
import { Arrow, Group, Rect, Text, Line } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { LINK, COLORS, TEXT, SNAP_PREVIEW } from '../constants'
import PF from 'pathfinding'

export interface LinkProps {
    id: string
    sourceX: number
    sourceY: number
    sourceWidth: number
    sourceHeight: number
    targetX: number
    targetY: number
    targetWidth: number
    targetHeight: number
    linkStyle?: 'free' | 'orthogonal'
    routeAround?: boolean
    isSelected?: boolean
    onClick?: (id: string) => void
    onUpdateLinkStyle?: (id: string, style: 'free' | 'orthogonal') => void
    onUpdateRouteAround?: (id: string, routeAround: boolean) => void
    allCards?: Array<{ x: number; y: number; width: number; height: number }>
}

type RectLike = { x: number; y: number; width: number; height: number }

type Side = 'left' | 'right' | 'top' | 'bottom'

const rectsOverlap = (a: RectLike, b: RectLike): boolean => {
    return !(
        a.x + a.width <= b.x ||
        b.x + b.width <= a.x ||
        a.y + a.height <= b.y ||
        b.y + b.height <= a.y
    )
}

const getSideMidpoint = (
    rect: RectLike,
    side: Side
): { x: number; y: number } => {
    switch (side) {
        case 'left':
            return { x: rect.x, y: rect.y + rect.height / 2 }
        case 'right':
            return { x: rect.x + rect.width, y: rect.y + rect.height / 2 }
        case 'top':
            return { x: rect.x + rect.width / 2, y: rect.y }
        case 'bottom':
            return { x: rect.x + rect.width / 2, y: rect.y + rect.height }
        default:
            return { x: rect.x, y: rect.y }
    }
}

const squaredDistance = (
    a: { x: number; y: number },
    b: { x: number; y: number }
): number => {
    const dx = a.x - b.x
    const dy = a.y - b.y
    return dx * dx + dy * dy
}

const pointInsideRect = (x: number, y: number, rect: RectLike): boolean => {
    return (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height
    )
}

const segmentsIntersect = (
    ax1: number,
    ay1: number,
    ax2: number,
    ay2: number,
    bx1: number,
    by1: number,
    bx2: number,
    by2: number
): boolean => {
    const orientation = (
        px1: number,
        py1: number,
        px2: number,
        py2: number,
        px3: number,
        py3: number
    ): number => {
        return (py2 - py1) * (px3 - px2) - (px2 - px1) * (py3 - py2)
    }

    const onSegment = (
        px1: number,
        py1: number,
        px2: number,
        py2: number,
        px3: number,
        py3: number
    ): boolean => {
        return (
            Math.min(px1, px2) <= px3 &&
            px3 <= Math.max(px1, px2) &&
            Math.min(py1, py2) <= py3 &&
            py3 <= Math.max(py1, py2)
        )
    }

    const o1 = orientation(ax1, ay1, ax2, ay2, bx1, by1)
    const o2 = orientation(ax1, ay1, ax2, ay2, bx2, by2)
    const o3 = orientation(bx1, by1, bx2, by2, ax1, ay1)
    const o4 = orientation(bx1, by1, bx2, by2, ax2, ay2)

    if (o1 === 0 && onSegment(ax1, ay1, ax2, ay2, bx1, by1)) return true
    if (o2 === 0 && onSegment(ax1, ay1, ax2, ay2, bx2, by2)) return true
    if (o3 === 0 && onSegment(bx1, by1, bx2, by2, ax1, ay1)) return true
    if (o4 === 0 && onSegment(bx1, by1, bx2, by2, ax2, ay2)) return true

    return o1 > 0 !== o2 > 0 && o3 > 0 !== o4 > 0
}

// Calculate the best anchor point on the edge of a rectangle
const calculateAnchorPoint = (
    sourceX: number,
    sourceY: number,
    sourceWidth: number,
    sourceHeight: number,
    targetX: number,
    targetY: number
): { x: number; y: number } => {
    // Calculate center points
    const sourceCenterX = sourceX + sourceWidth / 2
    const sourceCenterY = sourceY + sourceHeight / 2
    const targetCenterX = targetX
    const targetCenterY = targetY

    // Calculate angle from source to target
    const angle = Math.atan2(
        targetCenterY - sourceCenterY,
        targetCenterX - sourceCenterX
    )

    // Calculate intersection point on the edge of the source rectangle
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)

    let anchorX: number
    let anchorY: number

    // Determine which edge the line intersects
    const halfWidth = sourceWidth / 2
    const halfHeight = sourceHeight / 2

    if (Math.abs(cos) > Math.abs(sin * (sourceWidth / sourceHeight))) {
        // Intersects left or right edge
        if (cos > 0) {
            // Right edge
            anchorX = sourceX + sourceWidth
            anchorY = sourceCenterY + (halfWidth * sin) / cos
        } else {
            // Left edge
            anchorX = sourceX
            anchorY = sourceCenterY - (halfWidth * sin) / cos
        }
    } else {
        // Intersects top or bottom edge
        if (sin > 0) {
            // Bottom edge
            anchorX = sourceCenterX + (halfHeight * cos) / sin
            anchorY = sourceY + sourceHeight
        } else {
            // Top edge
            anchorX = sourceCenterX - (halfHeight * cos) / sin
            anchorY = sourceY
        }
    }

    return { x: anchorX, y: anchorY }
}

// Helper function to check if a line segment intersects with a rectangle
const lineSegmentIntersectsRect = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    rect: RectLike,
    padding: number = LINK.OBSTACLE_PADDING
): boolean => {
    const paddedRect: RectLike = {
        x: rect.x - padding,
        y: rect.y - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
    }

    const rectMaxX = paddedRect.x + paddedRect.width
    const rectMaxY = paddedRect.y + paddedRect.height

    const segMinX = Math.min(x1, x2)
    const segMaxX = Math.max(x1, x2)
    const segMinY = Math.min(y1, y2)
    const segMaxY = Math.max(y1, y2)

    if (
        segMaxX < paddedRect.x ||
        segMinX > rectMaxX ||
        segMaxY < paddedRect.y ||
        segMinY > rectMaxY
    ) {
        return false
    }

    if (
        pointInsideRect(x1, y1, paddedRect) ||
        pointInsideRect(x2, y2, paddedRect)
    ) {
        return true
    }

    const edges: Array<[number, number, number, number]> = [
        [paddedRect.x, paddedRect.y, rectMaxX, paddedRect.y],
        [rectMaxX, paddedRect.y, rectMaxX, rectMaxY],
        [rectMaxX, rectMaxY, paddedRect.x, rectMaxY],
        [paddedRect.x, rectMaxY, paddedRect.x, paddedRect.y],
    ]

    return edges.some(([ex1, ey1, ex2, ey2]) =>
        segmentsIntersect(x1, y1, x2, y2, ex1, ey1, ex2, ey2)
    )
}

// Helper function to check if a path (array of points) intersects any obstacles
const pathIntersectsObstacles = (
    points: number[],
    obstacles: Array<{ x: number; y: number; width: number; height: number }>,
    padding: number = LINK.OBSTACLE_PADDING
): boolean => {
    // Check each segment of the path
    for (let i = 0; i < points.length - 2; i += 2) {
        const x1 = points[i]
        const y1 = points[i + 1]
        const x2 = points[i + 2]
        const y2 = points[i + 3]

        for (const obstacle of obstacles) {
            if (lineSegmentIntersectsRect(x1, y1, x2, y2, obstacle, padding)) {
                return true
            }
        }
    }
    return false
}

// Calculate orthogonal path points using A* pathfinding algorithm
const calculateOrthogonalPath = (
    sourceX: number,
    sourceY: number,
    sourceWidth: number,
    sourceHeight: number,
    targetX: number,
    targetY: number,
    targetWidth: number,
    targetHeight: number,
    routeAround: boolean,
    allCards?: Array<{ x: number; y: number; width: number; height: number }>
): number[] => {
    const padding = LINK.OBSTACLE_PADDING

    // Always anchor to right-middle of source and left-middle of target
    const startX = sourceX + sourceWidth
    const startY = sourceY + sourceHeight / 2
    const endX = targetX
    const endY = targetY + targetHeight / 2

    // Filter out source and target from obstacles
    const obstacles = (allCards || []).filter(
        (card) =>
            !(card.x === sourceX && card.y === sourceY) &&
            !(card.x === targetX && card.y === targetY)
    )

    // Simple 3-segment path (right, down/up, right)
    const midX = (startX + endX) / 2
    const simplePath = [startX, startY, midX, startY, midX, endY, endX, endY]

    // If no obstacles or route around is disabled, return simple path
    if (!routeAround || obstacles.length === 0) {
        return simplePath
    }

    // Check if simple path is clear
    if (!pathIntersectsObstacles(simplePath, obstacles, padding)) {
        return simplePath
    }

    // Use A* pathfinding on a grid
    try {
        // Define grid cell size (smaller = more precise but slower)
        const gridSize = 20

        // Find the bounding box for the grid
        const minX = Math.min(
            startX,
            endX,
            ...obstacles.map((o) => o.x - padding)
        )
        const maxX = Math.max(
            startX,
            endX,
            ...obstacles.map((o) => o.x + o.width + padding)
        )
        const minY = Math.min(
            startY,
            endY,
            ...obstacles.map((o) => o.y - padding)
        )
        const maxY = Math.max(
            startY,
            endY,
            ...obstacles.map((o) => o.y + o.height + padding)
        )

        // Add some margin to the grid
        const margin = gridSize * 5
        const gridMinX = minX - margin
        const gridMinY = minY - margin
        const gridMaxX = maxX + margin
        const gridMaxY = maxY + margin

        // Calculate grid dimensions
        const gridWidth = Math.ceil((gridMaxX - gridMinX) / gridSize)
        const gridHeight = Math.ceil((gridMaxY - gridMinY) / gridSize)

        // Create grid (0 = walkable, 1 = obstacle)
        const grid = new PF.Grid(gridWidth, gridHeight)

        // Mark obstacles on the grid
        for (const obstacle of obstacles) {
            const obsMinX = obstacle.x - padding
            const obsMinY = obstacle.y - padding
            const obsMaxX = obstacle.x + obstacle.width + padding
            const obsMaxY = obstacle.y + obstacle.height + padding

            // Convert to grid coordinates
            const gridObsMinX = Math.floor((obsMinX - gridMinX) / gridSize)
            const gridObsMinY = Math.floor((obsMinY - gridMinY) / gridSize)
            const gridObsMaxX = Math.ceil((obsMaxX - gridMinX) / gridSize)
            const gridObsMaxY = Math.ceil((obsMaxY - gridMinY) / gridSize)

            // Mark cells as unwalkable
            for (let gx = gridObsMinX; gx <= gridObsMaxX; gx++) {
                for (let gy = gridObsMinY; gy <= gridObsMaxY; gy++) {
                    if (
                        gx >= 0 &&
                        gx < gridWidth &&
                        gy >= 0 &&
                        gy < gridHeight
                    ) {
                        grid.setWalkableAt(gx, gy, false)
                    }
                }
            }
        }

        // Convert start and end to grid coordinates
        const gridStartX = Math.floor((startX - gridMinX) / gridSize)
        const gridStartY = Math.floor((startY - gridMinY) / gridSize)
        const gridEndX = Math.floor((endX - gridMinX) / gridSize)
        const gridEndY = Math.floor((endY - gridMinY) / gridSize)

        // Make sure start and end are walkable
        if (
            gridStartX >= 0 &&
            gridStartX < gridWidth &&
            gridStartY >= 0 &&
            gridStartY < gridHeight
        ) {
            grid.setWalkableAt(gridStartX, gridStartY, true)
        }
        if (
            gridEndX >= 0 &&
            gridEndX < gridWidth &&
            gridEndY >= 0 &&
            gridEndY < gridHeight
        ) {
            grid.setWalkableAt(gridEndX, gridEndY, true)
        }

        // Use A* to find the path (orthogonal movement only)
        const finder = new PF.AStarFinder({
            allowDiagonal: false,
            dontCrossCorners: true,
        })

        const gridPath = finder.findPath(
            gridStartX,
            gridStartY,
            gridEndX,
            gridEndY,
            grid
        )

        if (gridPath && gridPath.length > 0) {
            // Convert grid path back to world coordinates
            const worldPath: number[] = []

            // Always start at the exact start point
            worldPath.push(startX, startY)

            // Convert grid coordinates to world coordinates, skipping colinear points
            for (let i = 1; i < gridPath.length - 1; i++) {
                const [gx, gy] = gridPath[i]
                const x = gridMinX + gx * gridSize
                const y = gridMinY + gy * gridSize

                // Check if this point creates a turn (not colinear with previous segment)
                if (worldPath.length >= 4) {
                    const prevX = worldPath[worldPath.length - 2]
                    const prevY = worldPath[worldPath.length - 1]
                    const prevPrevX = worldPath[worldPath.length - 4]
                    const prevPrevY = worldPath[worldPath.length - 3]

                    // Skip if colinear (same direction as previous segment)
                    const dx1 = prevX - prevPrevX
                    const dy1 = prevY - prevPrevY
                    const dx2 = x - prevX
                    const dy2 = y - prevY

                    if ((dx1 === 0 && dx2 === 0) || (dy1 === 0 && dy2 === 0)) {
                        // Colinear, skip this point but update the last point
                        worldPath[worldPath.length - 2] = x
                        worldPath[worldPath.length - 1] = y
                        continue
                    }
                }

                worldPath.push(x, y)
            }

            // Always end at the exact end point
            worldPath.push(endX, endY)

            return worldPath
        }
    } catch (error) {
        console.warn(
            'A* pathfinding failed, falling back to simple path',
            error
        )
    }

    // If pathfinding fails, return simple path (best effort)
    return simplePath
}

const Link: React.FC<LinkProps> = ({
    id,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    targetX,
    targetY,
    targetWidth,
    targetHeight,
    linkStyle = 'free',
    routeAround = false,
    isSelected = false,
    onClick,
    onUpdateLinkStyle,
    onUpdateRouteAround,
    allCards = [],
}) => {
    // Memoize path calculation to avoid expensive computations on every render
    const { pathPoints, arrowPoints } = useMemo(() => {
        let pathPoints: number[]
        let arrowPoints: number[]

        if (linkStyle === 'orthogonal') {
            // Calculate orthogonal path
            pathPoints = calculateOrthogonalPath(
                sourceX,
                sourceY,
                sourceWidth,
                sourceHeight,
                targetX,
                targetY,
                targetWidth,
                targetHeight,
                routeAround,
                allCards
            )

            // For arrow, use the last two segments
            const len = pathPoints.length
            arrowPoints = [
                pathPoints[len - 4],
                pathPoints[len - 3],
                pathPoints[len - 2],
                pathPoints[len - 1],
            ]
        } else {
            // Free style: draw direct path without considering obstacles
            const sourceRect: RectLike = {
                x: sourceX,
                y: sourceY,
                width: sourceWidth,
                height: sourceHeight,
            }
            const targetRect: RectLike = {
                x: targetX,
                y: targetY,
                width: targetWidth,
                height: targetHeight,
            }

            if (rectsOverlap(sourceRect, targetRect)) {
                return { pathPoints: [], arrowPoints: [] }
            }

            const connectionPairs: Array<{
                sourceSide: Side
                targetSide: Side
            }> = [
                { sourceSide: 'left', targetSide: 'right' },
                { sourceSide: 'right', targetSide: 'left' },
                { sourceSide: 'top', targetSide: 'bottom' },
                { sourceSide: 'bottom', targetSide: 'top' },
            ]

            // Calculate all possible connection points without obstacle checking
            const candidates = connectionPairs.map((pair) => {
                const start = getSideMidpoint(sourceRect, pair.sourceSide)
                const end = getSideMidpoint(targetRect, pair.targetSide)
                return {
                    start,
                    end,
                    distance: squaredDistance(start, end),
                }
            })

            // Select the shortest path without considering obstacles
            const preferred = candidates.reduce((min, curr) =>
                curr.distance < min.distance ? curr : min
            )

            if (!preferred) {
                const fallbackSource = calculateAnchorPoint(
                    sourceX,
                    sourceY,
                    sourceWidth,
                    sourceHeight,
                    targetX + targetWidth / 2,
                    targetY + targetHeight / 2
                )
                const fallbackTarget = calculateAnchorPoint(
                    targetX,
                    targetY,
                    targetWidth,
                    targetHeight,
                    sourceX + sourceWidth / 2,
                    sourceY + sourceHeight / 2
                )
                arrowPoints = [
                    fallbackSource.x,
                    fallbackSource.y,
                    fallbackTarget.x,
                    fallbackTarget.y,
                ]
                pathPoints = arrowPoints
            } else {
                arrowPoints = [
                    preferred.start.x,
                    preferred.start.y,
                    preferred.end.x,
                    preferred.end.y,
                ]
                pathPoints = arrowPoints
            }
        }

        return { pathPoints, arrowPoints }
    }, [
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        targetX,
        targetY,
        targetWidth,
        targetHeight,
        linkStyle,
        routeAround,
        allCards,
    ])

    // Early return if overlapping rectangles in free mode
    if (pathPoints.length === 0 && arrowPoints.length === 0) {
        return null
    }

    // Calculate midpoint for control buttons
    const midX = (pathPoints[0] + pathPoints[pathPoints.length - 2]) / 2
    const midY = (pathPoints[1] + pathPoints[pathPoints.length - 1]) / 2

    const handleClick = () => {
        if (onClick) {
            onClick(id)
        }
    }

    const handleStyleToggle = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onUpdateLinkStyle) {
            const newStyle = linkStyle === 'free' ? 'orthogonal' : 'free'
            onUpdateLinkStyle(id, newStyle)
        }
    }

    const handleRouteAroundToggle = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onUpdateRouteAround) {
            onUpdateRouteAround(id, !routeAround)
        }
    }

    return (
        <>
            {linkStyle === 'orthogonal' ? (
                <>
                    <Line
                        points={pathPoints}
                        stroke={
                            isSelected
                                ? COLORS.LINK_SELECTED
                                : COLORS.LINK_NORMAL
                        }
                        strokeWidth={
                            isSelected
                                ? LINK.STROKE_WIDTH_SELECTED
                                : LINK.STROKE_WIDTH_NORMAL
                        }
                        onClick={handleClick}
                        onTap={handleClick}
                        hitStrokeWidth={LINK.HIT_STROKE_WIDTH}
                    />
                    <Arrow
                        points={arrowPoints}
                        stroke={
                            isSelected
                                ? COLORS.LINK_SELECTED
                                : COLORS.LINK_NORMAL
                        }
                        strokeWidth={
                            isSelected
                                ? LINK.STROKE_WIDTH_SELECTED
                                : LINK.STROKE_WIDTH_NORMAL
                        }
                        fill={
                            isSelected
                                ? COLORS.LINK_SELECTED
                                : COLORS.LINK_NORMAL
                        }
                        pointerLength={LINK.POINTER_LENGTH}
                        pointerWidth={LINK.POINTER_WIDTH}
                        onClick={handleClick}
                        onTap={handleClick}
                        hitStrokeWidth={LINK.HIT_STROKE_WIDTH}
                    />
                </>
            ) : (
                <Arrow
                    points={arrowPoints}
                    stroke={
                        isSelected ? COLORS.LINK_SELECTED : COLORS.LINK_NORMAL
                    }
                    strokeWidth={
                        isSelected
                            ? LINK.STROKE_WIDTH_SELECTED
                            : LINK.STROKE_WIDTH_NORMAL
                    }
                    fill={
                        isSelected ? COLORS.LINK_SELECTED : COLORS.LINK_NORMAL
                    }
                    pointerLength={LINK.POINTER_LENGTH}
                    pointerWidth={LINK.POINTER_WIDTH}
                    onClick={handleClick}
                    onTap={handleClick}
                    hitStrokeWidth={LINK.HIT_STROKE_WIDTH}
                />
            )}

            {/* Control buttons - only visible when selected */}
            {isSelected && (
                <Group x={midX} y={midY}>
                    {/* Link style toggle button */}
                    {onUpdateLinkStyle && (
                        <>
                            <Rect
                                x={LINK.STYLE_TOGGLE_X_OFFSET}
                                y={LINK.STYLE_TOGGLE_Y_OFFSET}
                                width={LINK.CONTROL_BUTTON_WIDTH}
                                height={LINK.CONTROL_BUTTON_HEIGHT}
                                fill={COLORS.LINK_STYLE_BUTTON}
                                cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
                                onClick={handleStyleToggle}
                                onTap={handleStyleToggle}
                            />
                            <Text
                                text={
                                    linkStyle === 'free'
                                        ? 'Free ⇄ Ortho'
                                        : 'Ortho ⇄ Free'
                                }
                                x={LINK.STYLE_TOGGLE_X_OFFSET}
                                y={LINK.STYLE_TOGGLE_Y_OFFSET}
                                width={LINK.CONTROL_BUTTON_WIDTH}
                                height={LINK.CONTROL_BUTTON_HEIGHT}
                                fontSize={LINK.STYLE_TOGGLE_FONT_SIZE}
                                fontFamily={TEXT.FONT_FAMILY}
                                fill={COLORS.TEXT_WHITE}
                                align={TEXT.ALIGN_CENTER}
                                verticalAlign={TEXT.VERTICAL_ALIGN_MIDDLE}
                                onClick={handleStyleToggle}
                                onTap={handleStyleToggle}
                            />
                        </>
                    )}

                    {/* Route around toggle button - only visible when orthogonal */}
                    {linkStyle === 'orthogonal' && onUpdateRouteAround && (
                        <>
                            <Rect
                                x={LINK.ROUTE_AROUND_X_OFFSET}
                                y={LINK.ROUTE_AROUND_Y_OFFSET}
                                width={LINK.CONTROL_BUTTON_WIDTH}
                                height={LINK.CONTROL_BUTTON_HEIGHT}
                                fill={
                                    routeAround
                                        ? COLORS.LINK_ROUTE_AROUND_ACTIVE
                                        : COLORS.LINK_ROUTE_AROUND_INACTIVE
                                }
                                cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
                                onClick={handleRouteAroundToggle}
                                onTap={handleRouteAroundToggle}
                            />
                            <Text
                                text={
                                    routeAround
                                        ? '☑ Route Around'
                                        : '☐ Route Around'
                                }
                                x={LINK.ROUTE_AROUND_X_OFFSET}
                                y={LINK.ROUTE_AROUND_Y_OFFSET}
                                width={LINK.CONTROL_BUTTON_WIDTH}
                                height={LINK.CONTROL_BUTTON_HEIGHT}
                                fontSize={LINK.ROUTE_AROUND_FONT_SIZE}
                                fontFamily={TEXT.FONT_FAMILY}
                                fill={COLORS.TEXT_WHITE}
                                align={TEXT.ALIGN_CENTER}
                                verticalAlign={TEXT.VERTICAL_ALIGN_MIDDLE}
                                onClick={handleRouteAroundToggle}
                                onTap={handleRouteAroundToggle}
                            />
                        </>
                    )}
                </Group>
            )}
        </>
    )
}

export default Link
