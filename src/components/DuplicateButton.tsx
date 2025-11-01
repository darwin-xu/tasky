import React from 'react'
import { Rect, Text } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { COLORS, TEXT, SNAP_PREVIEW } from '../constants'

interface DuplicateButtonProps {
    x: number
    y: number
    size: number
    fontSize: number
    fill: string
    onClick: (e: KonvaEventObject<MouseEvent>) => void
}

export const DuplicateButton: React.FC<DuplicateButtonProps> = ({
    x,
    y,
    size,
    fontSize,
    fill,
    onClick,
}) => {
    return (
        <>
            <Rect
                x={x}
                y={y}
                width={size}
                height={size}
                fill={fill}
                cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
                onClick={onClick}
                onTap={onClick}
            />
            <Text
                text="⧉"
                x={x}
                y={y}
                width={size}
                height={size}
                fontSize={fontSize}
                fontFamily={TEXT.FONT_FAMILY}
                fill={COLORS.TEXT_WHITE}
                align={TEXT.ALIGN_CENTER}
                verticalAlign={TEXT.VERTICAL_ALIGN_MIDDLE}
                onClick={onClick}
                onTap={onClick}
            />
        </>
    )
}
