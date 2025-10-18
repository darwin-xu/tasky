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

// Calculate orthogonal path points
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
    const sourceCenterX = sourceX + sourceWidth / 2
    const sourceCenterY = sourceY + sourceHeight / 2
    const targetCenterX = targetX + targetWidth / 2
    const targetCenterY = targetY + targetHeight / 2

    // Start from right edge of source
    const startX = sourceX + sourceWidth
    const startY = sourceCenterY

    // End at left edge of target (or appropriate edge)
    let endX: number
    let endY: number

    // Determine which edge of target to connect to
    if (targetCenterX > sourceCenterX) {
        // Target is to the right, connect to left edge
        endX = targetX
        endY = targetCenterY
    } else if (targetCenterX < sourceCenterX) {
        // Target is to the left, connect to right edge
        endX = targetX + targetWidth
        endY = targetCenterY
    } else {
        // Target is aligned vertically
        if (targetCenterY > sourceCenterY) {
            // Target is below, connect to top edge
            endX = targetCenterX
            endY = targetY
        } else {
            // Target is above, connect to bottom edge
            endX = targetCenterX
            endY = targetY + targetHeight
        }
    }

    if (!routeAround) {
        // Simple orthogonal path - shortest path
        const midX = (startX + endX) / 2
        return [startX, startY, midX, startY, midX, endY, endX, endY]
    }

    // Route around obstacles
    const padding = 20 // Padding around cards

    // Check if path intersects with any cards
    const pathIntersectsCard = (
        x1: number,
        y1: number,
        x2: number,
        y2: number,
        card: { x: number; y: number; width: number; height: number }
    ): boolean => {
        // Expand card bounds with padding
        const cardLeft = card.x - padding
        const cardRight = card.x + card.width + padding
        const cardTop = card.y - padding
        const cardBottom = card.y + card.height + padding

        // Check if horizontal line intersects
        if (y1 === y2) {
            const minX = Math.min(x1, x2)
            const maxX = Math.max(x1, x2)
            return (
                y1 >= cardTop &&
                y1 <= cardBottom &&
                maxX >= cardLeft &&
                minX <= cardRight
            )
        }

        // Check if vertical line intersects
        if (x1 === x2) {
            const minY = Math.min(y1, y2)
            const maxY = Math.max(y1, y2)
            return (
                x1 >= cardLeft &&
                x1 <= cardRight &&
                maxY >= cardTop &&
                minY <= cardBottom
            )
        }

        return false
    }

    // Simple routing: go around by adding waypoints
    const midX = (startX + endX) / 2
    let points = [startX, startY, midX, startY, midX, endY, endX, endY]

    // Check if any segment intersects a card and route around if needed
    if (allCards) {
        for (const card of allCards) {
            // Skip source and target cards
            if (
                (card.x === sourceX && card.y === sourceY) ||
                (card.x === targetX && card.y === targetY)
            ) {
                continue
            }

            // Check if horizontal segment intersects
            if (pathIntersectsCard(startX, startY, midX, startY, card)) {
                // Route above or below the card
                const cardTop = card.y - padding
                const cardBottom = card.y + card.height + padding

                if (startY < targetCenterY) {
                    // Going down, route below
                    points = [
                        startX,
                        startY,
                        startX + 20,
                        startY,
                        startX + 20,
                        cardBottom,
                        midX,
                        cardBottom,
                        midX,
                        endY,
                        endX,
                        endY,
                    ]
                } else {
                    // Going up, route above
                    points = [
                        startX,
                        startY,
                        startX + 20,
                        startY,
                        startX + 20,
                        cardTop,
                        midX,
                        cardTop,
                        midX,
                        endY,
                        endX,
                        endY,
                    ]
                }
                break
            }
        }
    }

    return points
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
