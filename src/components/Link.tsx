import React from 'react'
import { Arrow, Group, Rect, Text } from 'react-konva'
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
    isSelected?: boolean
    onClick?: (id: string) => void
    onDelete?: (id: string) => void
    onReassignStart?: (id: string) => void
    onReassignEnd?: (id: string) => void
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
    isSelected = false,
    onClick,
    onDelete,
    onReassignStart,
    onReassignEnd,
}) => {
    // Calculate anchor points on card edges
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

    // Calculate midpoint for action buttons
    const midX = (sourceAnchor.x + targetAnchor.x) / 2
    const midY = (sourceAnchor.y + targetAnchor.y) / 2

    const handleClick = () => {
        if (onClick) {
            onClick(id)
        }
    }

    const handleDeleteClick = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onDelete) {
            onDelete(id)
        }
    }

    const handleReassignStartClick = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onReassignStart) {
            onReassignStart(id)
        }
    }

    const handleReassignEndClick = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onReassignEnd) {
            onReassignEnd(id)
        }
    }

    return (
        <>
            <Arrow
                points={[
                    sourceAnchor.x,
                    sourceAnchor.y,
                    targetAnchor.x,
                    targetAnchor.y,
                ]}
                stroke={isSelected ? '#2196f3' : '#6b7280'}
                strokeWidth={isSelected ? 3 : 2}
                fill={isSelected ? '#2196f3' : '#6b7280'}
                pointerLength={10}
                pointerWidth={10}
                onClick={handleClick}
                onTap={handleClick}
                hitStrokeWidth={20} // Make it easier to click
            />

            {/* Action buttons - only visible when selected */}
            {isSelected && (
                <Group x={midX} y={midY}>
                    {/* Delete button */}
                    {onDelete && (
                        <>
                            <Rect
                                x={-12}
                                y={-36}
                                width={24}
                                height={24}
                                fill="#ef4444"
                                cornerRadius={4}
                                onClick={handleDeleteClick}
                                onTap={handleDeleteClick}
                            />
                            <Text
                                text="✕"
                                x={-12}
                                y={-36}
                                width={24}
                                height={24}
                                fontSize={16}
                                fontFamily="Arial"
                                fill="white"
                                align="center"
                                verticalAlign="middle"
                                onClick={handleDeleteClick}
                                onTap={handleDeleteClick}
                            />
                        </>
                    )}

                    {/* Reassign Start button */}
                    {onReassignStart && (
                        <>
                            <Rect
                                x={-42}
                                y={-36}
                                width={24}
                                height={24}
                                fill="#8b5cf6"
                                cornerRadius={4}
                                onClick={handleReassignStartClick}
                                onTap={handleReassignStartClick}
                            />
                            <Text
                                text="⇤"
                                x={-42}
                                y={-36}
                                width={24}
                                height={24}
                                fontSize={16}
                                fontFamily="Arial"
                                fill="white"
                                align="center"
                                verticalAlign="middle"
                                onClick={handleReassignStartClick}
                                onTap={handleReassignStartClick}
                            />
                        </>
                    )}

                    {/* Reassign End button */}
                    {onReassignEnd && (
                        <>
                            <Rect
                                x={18}
                                y={-36}
                                width={24}
                                height={24}
                                fill="#8b5cf6"
                                cornerRadius={4}
                                onClick={handleReassignEndClick}
                                onTap={handleReassignEndClick}
                            />
                            <Text
                                text="⇥"
                                x={18}
                                y={-36}
                                width={24}
                                height={24}
                                fontSize={16}
                                fontFamily="Arial"
                                fill="white"
                                align="center"
                                verticalAlign="middle"
                                onClick={handleReassignEndClick}
                                onTap={handleReassignEndClick}
                            />
                        </>
                    )}
                </Group>
            )}
        </>
    )
}

export default Link
