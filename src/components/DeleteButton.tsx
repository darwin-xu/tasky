import React from 'react'
import { Rect, Text } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { COLORS, TEXT, SNAP_PREVIEW } from '../constants'

interface DeleteButtonProps {
    x: number
    y: number
    size: number
    fontSize: number
    onClick: (e: KonvaEventObject<MouseEvent>) => void
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
    x,
    y,
    size,
    fontSize,
    onClick,
}) => {
    return (
        <>
            <Rect
                x={x}
                y={y}
                width={size}
                height={size}
                fill={COLORS.BUTTON_DELETE}
                cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
                onClick={onClick}
                onTap={onClick}
            />
            <Text
                text="✕"
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
