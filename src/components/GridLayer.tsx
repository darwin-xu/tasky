import React from 'react'
import { Circle } from 'react-konva'
import { GridLayerProps } from '../types'
import { GRID_SPACING, GRID_DOT_COLOR, GRID_DOT_RADIUS } from '../constants'

const GridLayer: React.FC<GridLayerProps> = ({
    x,
    y,
    scale,
    width,
    height,
    gridSpacing = GRID_SPACING,
    dotColor = GRID_DOT_COLOR,
    dotRadius = GRID_DOT_RADIUS,
}) => {
    // Calculate the effective grid spacing after scaling
    const scaledSpacing = gridSpacing * scale
    const scaledRadius = dotRadius * scale

    // Calculate the starting position for the grid to make it appear stationary
    // during panning. We use modulo to ensure the grid pattern continues seamlessly
    const startX = -x % scaledSpacing
    const startY = -y % scaledSpacing

    // Calculate how many dots we need to fill the visible area
    const dotsX = Math.ceil(width / scaledSpacing) + 2 // +2 for buffer
    const dotsY = Math.ceil(height / scaledSpacing) + 2 // +2 for buffer

    const dots = []

    // Generate grid dots
    for (let i = 0; i < dotsX; i++) {
        for (let j = 0; j < dotsY; j++) {
            const dotX = startX + i * scaledSpacing
            const dotY = startY + j * scaledSpacing

            // Only render dots that are within or near the visible area
            if (
                dotX >= -scaledSpacing &&
                dotX <= width + scaledSpacing &&
                dotY >= -scaledSpacing &&
                dotY <= height + scaledSpacing
            ) {
                dots.push(
                    <Circle
                        key={`dot-${i}-${j}`}
                        x={dotX}
                        y={dotY}
                        radius={scaledRadius}
                        fill={dotColor}
                    />
                )
            }
        }
    }

    return <>{dots}</>
}

export default GridLayer
