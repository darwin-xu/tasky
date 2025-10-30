import React from 'react'
import { Group, Rect } from 'react-konva'
import { SNAP_PREVIEW } from '../constants'

interface SnapPreviewProps {
    x: number
    y: number
    width: number
    height: number
    fill: string
    stroke: string
    cornerRadius: number
}

export const SnapPreview: React.FC<SnapPreviewProps> = ({
    x,
    y,
    width,
    height,
    fill,
    stroke,
    cornerRadius,
}) => {
    return (
        <Group x={x} y={y}>
            <Rect
                width={width}
                height={height}
                fill={fill}
                stroke={stroke}
                strokeWidth={SNAP_PREVIEW.STROKE_WIDTH}
                dash={SNAP_PREVIEW.DASH_PATTERN}
                cornerRadius={cornerRadius}
            />
        </Group>
    )
}
