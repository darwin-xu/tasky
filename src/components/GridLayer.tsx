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
    // Transform the viewport into world coordinates so the grid follows panning/zooming
    const worldLeft = -x / scale
    const worldTop = -y / scale
    const worldRight = worldLeft + width / scale
    const worldBottom = worldTop + height / scale

    // Expand the bounds slightly to avoid empty edges while panning
    const paddedLeft = worldLeft - gridSpacing
    const paddedTop = worldTop - gridSpacing
    const paddedRight = worldRight + gridSpacing
    const paddedBottom = worldBottom + gridSpacing

    // Determine the first grid coordinate that is visible (or just outside) the viewport
    const startX = Math.floor(paddedLeft / gridSpacing) * gridSpacing
    const startY = Math.floor(paddedTop / gridSpacing) * gridSpacing
    const endX = Math.ceil(paddedRight / gridSpacing) * gridSpacing
    const endY = Math.ceil(paddedBottom / gridSpacing) * gridSpacing

    const dots = []

    for (let posX = startX; posX <= endX; posX += gridSpacing) {
        for (let posY = startY; posY <= endY; posY += gridSpacing) {
            dots.push(
                <Circle
                    key={`dot-${posX}-${posY}`}
                    x={posX}
                    y={posY}
                    radius={dotRadius}
                    fill={dotColor}
                />
            )
        }
    }

    return <>{dots}</>
}

export default GridLayer
