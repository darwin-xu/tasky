import React from 'react'
import { Arrow } from 'react-konva'

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

    const handleClick = () => {
        if (onClick) {
            onClick(id)
        }
    }

    return (
        <Arrow
            points={[sourceAnchor.x, sourceAnchor.y, targetAnchor.x, targetAnchor.y]}
            stroke={isSelected ? '#2196f3' : '#6b7280'}
            strokeWidth={isSelected ? 3 : 2}
            fill={isSelected ? '#2196f3' : '#6b7280'}
            pointerLength={10}
            pointerWidth={10}
            onClick={handleClick}
            onTap={handleClick}
            hitStrokeWidth={20} // Make it easier to click
        />
    )
}

export default Link
