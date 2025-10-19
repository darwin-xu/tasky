import React from 'react'
import { Arrow, Group, Rect, Text, Line } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'

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
    rect: { x: number; y: number; width: number; height: number },
    padding: number = 20
): boolean => {
    const rectLeft = rect.x - padding
    const rectRight = rect.x + rect.width + padding
    const rectTop = rect.y - padding
    const rectBottom = rect.y + rect.height + padding

    // Check if horizontal line intersects
    if (y1 === y2) {
        const minX = Math.min(x1, x2)
        const maxX = Math.max(x1, x2)
        return (
            y1 >= rectTop &&
            y1 <= rectBottom &&
            maxX >= rectLeft &&
            minX <= rectRight
        )
    }

    // Check if vertical line intersects
    if (x1 === x2) {
        const minY = Math.min(y1, y2)
        const maxY = Math.max(y1, y2)
        return (
            x1 >= rectLeft &&
            x1 <= rectRight &&
            maxY >= rectTop &&
            minY <= rectBottom
        )
    }

    return false
}

// Helper function to check if a path (array of points) intersects any obstacles
const pathIntersectsObstacles = (
    points: number[],
    obstacles: Array<{ x: number; y: number; width: number; height: number }>,
    padding: number = 20
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
    const padding = 20

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

    // Try different routing strategies
    const strategies: number[][] = []

    // Find the leftmost and rightmost obstacle bounds
    const obstacleLeft = Math.min(...obstacles.map((o) => o.x - padding))
    const obstacleRight = Math.max(...obstacles.map((o) => o.x + o.width + padding))

    // Strategy 1: Route far above all obstacles
    const maxTop = Math.min(
        sourceY,
        targetY,
        ...obstacles.map((o) => o.y)
    )
    const routeAbove = maxTop - padding - 40
    
    // Go straight out past obstacles before turning up
    const clearRightX = Math.min(obstacleLeft - 10, startX + 40)
    const pathAbove = [
        startX,
        startY,
        clearRightX,
        startY,
        clearRightX,
        routeAbove,
        Math.max(endX - 30, clearRightX),
        routeAbove,
        Math.max(endX - 30, clearRightX),
        endY,
        endX,
        endY,
    ]
    if (!pathIntersectsObstacles(pathAbove, obstacles, padding)) {
        strategies.push(pathAbove)
    }

    // Strategy 2: Route far below all obstacles
    const maxBottom = Math.max(
        sourceY + sourceHeight,
        targetY + targetHeight,
        ...obstacles.map((o) => o.y + o.height)
    )
    const routeBelow = maxBottom + padding + 40
    
    const pathBelow = [
        startX,
        startY,
        clearRightX,
        startY,
        clearRightX,
        routeBelow,
        Math.max(endX - 30, clearRightX),
        routeBelow,
        Math.max(endX - 30, clearRightX),
        endY,
        endX,
        endY,
    ]
    if (!pathIntersectsObstacles(pathBelow, obstacles, padding)) {
        strategies.push(pathBelow)
    }

    // Strategy 3: Route far to the right of all obstacles
    const farRight = obstacleRight + 40
    if (farRight < endX - 30) {
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
            // Try routing above this obstacle
            const aboveY = obsTop - 30
            const beforeObsX = Math.max(startX + 20, obsLeft - 30)
            const afterObsX = Math.min(endX - 20, obsRight + 30)
            
            const pathAroundTop = [
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
            if (!pathIntersectsObstacles(pathAroundTop, obstacles, padding)) {
                strategies.push(pathAroundTop)
            }

            // Try routing below this obstacle
            const belowY = obsBottom + 30
            const pathAroundBottom = [
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
            if (!pathIntersectsObstacles(pathAroundBottom, obstacles, padding)) {
                strategies.push(pathAroundBottom)
            }
        }
    }

    // Strategy 5: Direct vertical-horizontal path if very close
    if (Math.abs(endX - startX) < 60) {
        const pathDirect = [startX, startY, startX + 30, startY, startX + 30, endY, endX, endY]
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
        // Free path - calculate anchor points on card edges
        const sourceAnchor = calculateAnchorPoint(
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            targetX + targetWidth / 2,
            targetY + targetHeight / 2
        )

        const targetAnchor = calculateAnchorPoint(
            targetX,
            targetY,
            targetWidth,
            targetHeight,
            sourceX + sourceWidth / 2,
            sourceY + sourceHeight / 2
        )

        arrowPoints = [
            sourceAnchor.x,
            sourceAnchor.y,
            targetAnchor.x,
            targetAnchor.y,
        ]
        pathPoints = arrowPoints
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
                        stroke={isSelected ? '#2196f3' : '#6b7280'}
                        strokeWidth={isSelected ? 3 : 2}
                        onClick={handleClick}
                        onTap={handleClick}
                        hitStrokeWidth={20}
                    />
                    <Arrow
                        points={arrowPoints}
                        stroke={isSelected ? '#2196f3' : '#6b7280'}
                        strokeWidth={isSelected ? 3 : 2}
                        fill={isSelected ? '#2196f3' : '#6b7280'}
                        pointerLength={10}
                        pointerWidth={10}
                        onClick={handleClick}
                        onTap={handleClick}
                        hitStrokeWidth={20}
                    />
                </>
            ) : (
                <Arrow
                    points={arrowPoints}
                    stroke={isSelected ? '#2196f3' : '#6b7280'}
                    strokeWidth={isSelected ? 3 : 2}
                    fill={isSelected ? '#2196f3' : '#6b7280'}
                    pointerLength={10}
                    pointerWidth={10}
                    onClick={handleClick}
                    onTap={handleClick}
                    hitStrokeWidth={20}
                />
            )}

            {/* Control buttons - only visible when selected */}
            {isSelected && (
                <Group x={midX} y={midY}>
                    {/* Link style toggle button */}
                    {onUpdateLinkStyle && (
                        <>
                            <Rect
                                x={-40}
                                y={-36}
                                width={80}
                                height={24}
                                fill="#8b5cf6"
                                cornerRadius={4}
                                onClick={handleStyleToggle}
                                onTap={handleStyleToggle}
                            />
                            <Text
                                text={
                                    linkStyle === 'free'
                                        ? 'Free ⇄ Ortho'
                                        : 'Ortho ⇄ Free'
                                }
                                x={-40}
                                y={-36}
                                width={80}
                                height={24}
                                fontSize={12}
                                fontFamily="Arial"
                                fill="white"
                                align="center"
                                verticalAlign="middle"
                                onClick={handleStyleToggle}
                                onTap={handleStyleToggle}
                            />
                        </>
                    )}

                    {/* Route around toggle button - only visible when orthogonal */}
                    {linkStyle === 'orthogonal' && onUpdateRouteAround && (
                        <>
                            <Rect
                                x={-40}
                                y={-8}
                                width={80}
                                height={24}
                                fill={routeAround ? '#10b981' : '#6b7280'}
                                cornerRadius={4}
                                onClick={handleRouteAroundToggle}
                                onTap={handleRouteAroundToggle}
                            />
                            <Text
                                text={
                                    routeAround
                                        ? '☑ Route Around'
                                        : '☐ Route Around'
                                }
                                x={-40}
                                y={-8}
                                width={80}
                                height={24}
                                fontSize={11}
                                fontFamily="Arial"
                                fill="white"
                                align="center"
                                verticalAlign="middle"
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
