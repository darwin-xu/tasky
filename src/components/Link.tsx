import React, { useMemo } from 'react'
import { Arrow, Group, Rect, Text, Line } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { LINK, COLORS, TEXT, SNAP_PREVIEW } from '../constants'

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

// Count the number of turns in a path
const countTurns = (points: number[]): number => {
    let turns = 0
    for (let i = 0; i < points.length - 4; i += 2) {
        const dx1 = points[i + 2] - points[i]
        const dy1 = points[i + 3] - points[i + 1]
        const dx2 = points[i + 4] - points[i + 2]
        const dy2 = points[i + 5] - points[i + 3]

        // Check if direction changed (turn occurred)
        if ((dx1 === 0 && dy2 === 0) || (dy1 === 0 && dx2 === 0)) {
            turns++
        }
    }
    return turns
}

// Calculate orthogonal path points using heuristic routing
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

    // Rule 4: Always move away from source first by going right
    // Calculate the minimum clearance needed from the source
    const minClearanceX = startX + LINK.CLEARANCE_OFFSET_LARGE

    // Rule 5: When approaching target from above, use left → down → right pattern
    // Determine the approach pattern based on relative positions
    const needsLeftApproach = endX < startX || endX < minClearanceX

    let simplePath: number[]

    if (needsLeftApproach) {
        // Target is to the left or requires wrapping around
        // Go right to clear source, up/down to target level, left past target, then right to connect
        const clearanceX = Math.max(
            minClearanceX,
            endX + targetWidth + LINK.CLEARANCE_OFFSET_LARGE
        )
        const approachX = endX - LINK.CLEARANCE_OFFSET_LARGE

        simplePath = [
            startX,
            startY,
            clearanceX,
            startY,
            clearanceX,
            endY,
            approachX,
            endY,
            approachX,
            endY,
            endX,
            endY,
        ]
    } else {
        // Target is to the right - use standard path
        // Rule 4: Use max to ensure we always go right first, never left
        const midX = Math.max((startX + endX) / 2, minClearanceX)

        simplePath = [startX, startY, midX, startY, midX, endY, endX, endY]
    }

    // If no obstacles or route around is disabled, return simple path
    if (!routeAround || obstacles.length === 0) {
        return simplePath
    }

    // Check if simple path is clear
    if (!pathIntersectsObstacles(simplePath, obstacles, padding)) {
        return simplePath
    }

    // Try different routing strategies
    const strategies: number[][] = []

    // Find the rightmost obstacle bound
    const obstacleRight = Math.max(
        ...obstacles.map((o) => o.x + o.width + padding)
    )

    // Common variables for routing strategies
    // Find if any obstacles would block a vertical path upward from minClearanceX
    const wouldBlockVertical = obstacles.some((o) => {
        const oLeft = o.x - padding
        const oRight = o.x + o.width + padding
        const oTop = o.y - padding
        const oBottom = o.y + o.height + padding
        const minTop = Math.min(sourceY, targetY, ...obstacles.map((o) => o.y))
        const routeAboveY = minTop - padding - LINK.ROUTE_ABOVE_BELOW_OFFSET
        // Obstacle blocks vertical if it overlaps minClearanceX and spans from routeAbove to startY
        return (
            oLeft <= minClearanceX &&
            oRight >= minClearanceX &&
            oTop <= startY &&
            oBottom >= routeAboveY
        )
    })

    // If vertical path is blocked, go right past all obstacles first
    const initialRightX = wouldBlockVertical
        ? obstacleRight + LINK.CLEARANCE_OFFSET_LARGE
        : minClearanceX

    // If we went past the target, we need to come back left
    const needsWrapAround = initialRightX >= endX

    // Approach X for wrapping around
    const approachTargetX = endX - LINK.CLEARANCE_OFFSET_LARGE

    // Strategy 1: Route far above all obstacles
    const maxTop = Math.min(sourceY, targetY, ...obstacles.map((o) => o.y))
    const routeAbove = maxTop - padding - LINK.ROUTE_ABOVE_BELOW_OFFSET

    let pathAbove: number[]
    if (needsWrapAround) {
        // Go right past obstacles, up, left past target, down, right to target
        const beyondTarget = Math.max(
            initialRightX,
            endX + LINK.CLEARANCE_OFFSET_LARGE
        )
        pathAbove = [
            startX,
            startY,
            beyondTarget,
            startY,
            beyondTarget,
            routeAbove,
            approachTargetX,
            routeAbove,
            approachTargetX,
            endY,
            endX,
            endY,
        ]
    } else {
        // Standard above routing
        pathAbove = [
            startX,
            startY,
            initialRightX,
            startY,
            initialRightX,
            routeAbove,
            approachTargetX,
            routeAbove,
            approachTargetX,
            endY,
            endX,
            endY,
        ]
    }

    if (!pathIntersectsObstacles(pathAbove, obstacles, padding)) {
        strategies.push(pathAbove)
    }

    // Strategy 2: Route far below all obstacles
    const maxBottom = Math.max(
        sourceY + sourceHeight,
        targetY + targetHeight,
        ...obstacles.map((o) => o.y + o.height)
    )
    const routeBelow = maxBottom + padding + LINK.ROUTE_ABOVE_BELOW_OFFSET

    // Use same logic as above strategy
    let pathBelow: number[]
    if (needsWrapAround) {
        const beyondTarget = Math.max(
            initialRightX,
            endX + LINK.CLEARANCE_OFFSET_LARGE
        )
        pathBelow = [
            startX,
            startY,
            beyondTarget,
            startY,
            beyondTarget,
            routeBelow,
            approachTargetX,
            routeBelow,
            approachTargetX,
            endY,
            endX,
            endY,
        ]
    } else {
        pathBelow = [
            startX,
            startY,
            initialRightX,
            startY,
            initialRightX,
            routeBelow,
            approachTargetX,
            routeBelow,
            approachTargetX,
            endY,
            endX,
            endY,
        ]
    }
    if (!pathIntersectsObstacles(pathBelow, obstacles, padding)) {
        strategies.push(pathBelow)
    }

    // Strategy 3: Route far to the right of all obstacles
    const farRight = Math.max(
        minClearanceX,
        obstacleRight + LINK.FAR_RIGHT_OFFSET
    )
    // Rule 5: Ensure we approach from the left if target is reachable
    if (farRight >= endX) {
        // Need to wrap around
        const pathFarRight = [
            startX,
            startY,
            farRight,
            startY,
            farRight,
            endY,
            approachTargetX,
            endY,
            endX,
            endY,
        ]
        if (!pathIntersectsObstacles(pathFarRight, obstacles, padding)) {
            strategies.push(pathFarRight)
        }
    } else {
        const pathFarRight = [
            startX,
            startY,
            farRight,
            startY,
            farRight,
            endY,
            endX,
            endY,
        ]
        if (!pathIntersectsObstacles(pathFarRight, obstacles, padding)) {
            strategies.push(pathFarRight)
        }
    }

    // Strategy 4: Route around individual obstacles (above and below)
    for (const obstacle of obstacles) {
        const obsLeft = obstacle.x - padding
        const obsRight = obstacle.x + obstacle.width + padding
        const obsTop = obstacle.y - padding
        const obsBottom = obstacle.y + obstacle.height + padding

        // Only consider obstacles that are actually in the way
        if (obsRight > startX && obsLeft < endX) {
            // Check if obstacle is at source Y level (blocks horizontal movement)
            const blocksHorizontal = obsTop <= startY && obsBottom >= startY

            if (blocksHorizontal) {
                // Special handling: obstacle blocks horizontal movement at source Y level
                // We MUST go up or down first BEFORE going right past the obstacle
                // Otherwise any horizontal movement at startY will hit the obstacle

                // Go right just enough to clear the source, then immediately up/down
                const initialX = Math.min(
                    minClearanceX,
                    obsLeft - LINK.CLEARANCE_OFFSET_SMALL
                )

                // If we can't even go right to initialX (obstacle is too close to source)
                // then we just go straight up/down from startX
                const firstRightX = initialX > startX ? initialX : startX

                // Try going above the obstacle
                const aboveY = obsTop - LINK.AROUND_OBSTACLE_OFFSET
                const pastObsX = obsRight + LINK.CLEARANCE_OFFSET_SMALL

                let pathAroundTop: number[]
                if (firstRightX > startX) {
                    // Can go right a bit before going up
                    pathAroundTop = [
                        startX,
                        startY,
                        firstRightX,
                        startY,
                        firstRightX,
                        aboveY,
                        pastObsX,
                        aboveY,
                        pastObsX,
                        endY,
                        endX,
                        endY,
                    ]
                } else {
                    // Go up immediately from source
                    pathAroundTop = [
                        startX,
                        startY,
                        startX,
                        aboveY,
                        pastObsX,
                        aboveY,
                        pastObsX,
                        endY,
                        endX,
                        endY,
                    ]
                }
                if (
                    !pathIntersectsObstacles(pathAroundTop, obstacles, padding)
                ) {
                    strategies.push(pathAroundTop)
                }

                // Try going below the obstacle
                const belowY = obsBottom + LINK.AROUND_OBSTACLE_OFFSET
                let pathAroundBottom: number[]
                if (firstRightX > startX) {
                    pathAroundBottom = [
                        startX,
                        startY,
                        firstRightX,
                        startY,
                        firstRightX,
                        belowY,
                        pastObsX,
                        belowY,
                        pastObsX,
                        endY,
                        endX,
                        endY,
                    ]
                } else {
                    pathAroundBottom = [
                        startX,
                        startY,
                        startX,
                        belowY,
                        pastObsX,
                        belowY,
                        pastObsX,
                        endY,
                        endX,
                        endY,
                    ]
                }
                if (
                    !pathIntersectsObstacles(
                        pathAroundBottom,
                        obstacles,
                        padding
                    )
                ) {
                    strategies.push(pathAroundBottom)
                }
            } else {
                // Original logic for obstacles not at source Y level
                // Rule 4: Ensure we start by moving right from source
                const beforeObsX = Math.max(
                    minClearanceX,
                    obsLeft - LINK.AROUND_OBSTACLE_OFFSET
                )
                const afterObsX = Math.max(
                    beforeObsX,
                    obsRight + LINK.AROUND_OBSTACLE_OFFSET
                )

                // Try routing above this obstacle
                const aboveY = obsTop - LINK.AROUND_OBSTACLE_OFFSET

                // Rule 5: Check if we need to approach target from left
                let pathAroundTop: number[]
                if (afterObsX >= endX) {
                    // Need to approach from left
                    const approachTargetX = endX - LINK.CLEARANCE_OFFSET_LARGE
                    pathAroundTop = [
                        startX,
                        startY,
                        beforeObsX,
                        startY,
                        beforeObsX,
                        aboveY,
                        afterObsX,
                        aboveY,
                        afterObsX,
                        endY,
                        approachTargetX,
                        endY,
                        endX,
                        endY,
                    ]
                } else {
                    pathAroundTop = [
                        startX,
                        startY,
                        beforeObsX,
                        startY,
                        beforeObsX,
                        aboveY,
                        afterObsX,
                        aboveY,
                        afterObsX,
                        endY,
                        endX,
                        endY,
                    ]
                }
                if (
                    !pathIntersectsObstacles(pathAroundTop, obstacles, padding)
                ) {
                    strategies.push(pathAroundTop)
                }

                // Try routing below this obstacle
                const belowY = obsBottom + LINK.AROUND_OBSTACLE_OFFSET
                let pathAroundBottom: number[]
                if (afterObsX >= endX) {
                    // Need to approach from left
                    const approachTargetX = endX - LINK.CLEARANCE_OFFSET_LARGE
                    pathAroundBottom = [
                        startX,
                        startY,
                        beforeObsX,
                        startY,
                        beforeObsX,
                        belowY,
                        afterObsX,
                        belowY,
                        afterObsX,
                        endY,
                        approachTargetX,
                        endY,
                        endX,
                        endY,
                    ]
                } else {
                    pathAroundBottom = [
                        startX,
                        startY,
                        beforeObsX,
                        startY,
                        beforeObsX,
                        belowY,
                        afterObsX,
                        belowY,
                        afterObsX,
                        endY,
                        endX,
                        endY,
                    ]
                }
                if (
                    !pathIntersectsObstacles(
                        pathAroundBottom,
                        obstacles,
                        padding
                    )
                ) {
                    strategies.push(pathAroundBottom)
                }
            }
        }
    }

    // Strategy 5: Direct path with proper clearance (Rule 4 compliant)
    if (endX > minClearanceX) {
        const pathDirect = [
            startX,
            startY,
            minClearanceX,
            startY,
            minClearanceX,
            endY,
            endX,
            endY,
        ]
        if (!pathIntersectsObstacles(pathDirect, obstacles, padding)) {
            strategies.push(pathDirect)
        }
    }

    // If we found valid strategies, pick the one with fewest turns
    if (strategies.length > 0) {
        strategies.sort((a, b) => {
            const turnsA = countTurns(a)
            const turnsB = countTurns(b)
            if (turnsA !== turnsB) {
                return turnsA - turnsB
            }
            // If same number of turns, prefer shorter path
            const lengthA = a.length
            const lengthB = b.length
            return lengthA - lengthB
        })
        return strategies[0]
    }

    // If no valid strategy found, return simple path (best effort)
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
