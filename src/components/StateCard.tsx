import React, { useRef, useState } from 'react'
import { Rect, Text, Group } from 'react-konva'
import Konva from 'konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { snapPositionToGrid } from '../utils/snapToGrid'
import { formatDateForDisplay } from '../utils/dateValidation'
import {
    CARD_WIDTH,
    CARD_HEIGHT,
    GRID_SPACING,
    STATE_CARD,
    COLORS,
    TEXT,
    SNAP_PREVIEW,
} from '../constants'

export interface StateCardProps {
    id: string
    x: number
    y: number
    width?: number
    height?: number
    description: string
    date?: string
    priority?: 'Low' | 'Medium' | 'High'
    gridSpacing?: number
    scale?: number
    isSelected?: boolean
    onPositionChange?: (id: string, x: number, y: number) => void
    onClick?: (id: string) => void
    onDoubleClick?: (id: string) => void
    onDelete?: (id: string) => void
    onDuplicate?: (id: string) => void
    onFork?: (id: string) => void
}

const StateCard: React.FC<StateCardProps> = ({
    id,
    x,
    y,
    width = CARD_WIDTH,
    height = CARD_HEIGHT,
    description,
    date = '',
    priority = 'Medium',
    gridSpacing = GRID_SPACING,
    scale = 1,
    isSelected = false,
    onPositionChange,
    onClick,
    onDoubleClick,
    onDelete,
    onDuplicate,
    onFork,
}) => {
    const groupRef = useRef<Konva.Group>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [snapPreview, setSnapPreview] = useState<{
        x: number
        y: number
    } | null>(null)

    const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
        setIsDragging(true)
        // Select the card when dragging starts
        if (onClick) {
            onClick(id)
        }
        e.cancelBubble = true // Prevent canvas panning
    }

    const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
        const node = e.target
        const pos = node.position()

        // Calculate snap position for preview
        const snapped = snapPositionToGrid(pos, gridSpacing, scale)
        setSnapPreview(snapped)

        // Update position in real-time during drag for link updates
        if (onPositionChange) {
            onPositionChange(id, pos.x, pos.y)
        }

        e.cancelBubble = true // Prevent canvas panning
    }

    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        const node = e.target
        const pos = node.position()

        // Snap to grid
        const snapped = snapPositionToGrid(pos, gridSpacing, scale)

        // Update position
        node.position(snapped)

        // Clear preview
        setSnapPreview(null)
        setIsDragging(false)

        // Notify parent
        if (onPositionChange) {
            onPositionChange(id, snapped.x, snapped.y)
        }

        e.cancelBubble = true // Prevent canvas panning
    }

    const handleClick = (e: KonvaEventObject<MouseEvent>) => {
        if (onClick) {
            onClick(id)
        }
        e.cancelBubble = true
    }

    const handleDoubleClick = (e: KonvaEventObject<MouseEvent>) => {
        if (onDoubleClick) {
            onDoubleClick(id)
        }
        e.cancelBubble = true
    }

    const handleDeleteClick = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onDelete) {
            onDelete(id)
        }
    }

    const handleDuplicateClick = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onDuplicate) {
            onDuplicate(id)
        }
    }

    const handleForkClick = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onFork) {
            onFork(id)
        }
    }

    // Priority color mapping
    const getPriorityColor = () => {
        switch (priority) {
            case 'High':
                return COLORS.PRIORITY_HIGH
            case 'Medium':
                return COLORS.PRIORITY_MEDIUM
            case 'Low':
                return COLORS.PRIORITY_LOW
            default:
                return COLORS.PRIORITY_DEFAULT
        }
    }

    // Priority icon/label
    const getPriorityLabel = () => {
        switch (priority) {
            case 'High':
                return TEXT.PRIORITY_HIGH_LABEL
            case 'Medium':
                return TEXT.PRIORITY_MEDIUM_LABEL
            case 'Low':
                return TEXT.PRIORITY_LOW_LABEL
            default:
                return `Priority: ${priority}`
        }
    }

    return (
        <>
            {/* Snap preview indicator */}
            {isDragging && snapPreview && (
                <Group x={snapPreview.x} y={snapPreview.y}>
                    <Rect
                        width={width}
                        height={height}
                        fill={COLORS.SNAP_PREVIEW_STATE_FILL}
                        stroke={COLORS.SNAP_PREVIEW_STATE_STROKE}
                        strokeWidth={SNAP_PREVIEW.STROKE_WIDTH}
                        dash={SNAP_PREVIEW.DASH_PATTERN}
                        cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_STATE}
                    />
                </Group>
            )}

            {/* Actual draggable card */}
            <Group
                ref={groupRef}
                x={x}
                y={y}
                draggable
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onClick={handleClick}
                onDblClick={handleDoubleClick}
            >
                <Rect
                    width={width}
                    height={height}
                    fill={
                        isDragging
                            ? COLORS.STATE_BG_DRAGGING
                            : COLORS.STATE_BG_NORMAL
                    }
                    stroke={
                        isSelected
                            ? COLORS.STATE_BORDER_SELECTED
                            : isDragging
                              ? COLORS.STATE_BORDER_DRAGGING
                              : COLORS.STATE_BORDER_NORMAL
                    }
                    strokeWidth={
                        isSelected
                            ? STATE_CARD.STROKE_WIDTH_SELECTED
                            : STATE_CARD.STROKE_WIDTH_NORMAL
                    }
                    shadowColor={COLORS.SHADOW_COLOR}
                    shadowBlur={
                        isDragging
                            ? STATE_CARD.SHADOW_BLUR_DRAGGING
                            : isSelected
                              ? STATE_CARD.SHADOW_BLUR_SELECTED
                              : STATE_CARD.SHADOW_BLUR_NORMAL
                    }
                    shadowOpacity={
                        isDragging
                            ? STATE_CARD.SHADOW_OPACITY_DRAGGING
                            : isSelected
                              ? STATE_CARD.SHADOW_OPACITY_SELECTED
                              : STATE_CARD.SHADOW_OPACITY_NORMAL
                    }
                    shadowOffsetX={STATE_CARD.SHADOW_OFFSET_X}
                    shadowOffsetY={STATE_CARD.SHADOW_OFFSET_Y}
                    cornerRadius={STATE_CARD.CORNER_RADIUS}
                />

                {/* Priority indicator bar */}
                <Rect
                    x={0}
                    y={0}
                    width={width}
                    height={STATE_CARD.PRIORITY_BAR_HEIGHT}
                    fill={COLORS.STATE_PRIORITY_BAR}
                    cornerRadius={STATE_CARD.PRIORITY_BAR_CORNER_RADIUS}
                />

                {/* Description */}
                <Text
                    text={description}
                    x={STATE_CARD.DESCRIPTION_X}
                    y={STATE_CARD.DESCRIPTION_Y}
                    width={width - STATE_CARD.DESCRIPTION_WIDTH_PADDING}
                    height={STATE_CARD.DESCRIPTION_HEIGHT}
                    fontSize={STATE_CARD.DESCRIPTION_FONT_SIZE}
                    fontFamily={TEXT.FONT_FAMILY}
                    fill={COLORS.TEXT_TITLE}
                    wrap={TEXT.WRAP_WORD}
                    ellipsis={true}
                />

                {/* Date */}
                {date && (
                    <Text
                        text={`${TEXT.DATE_ICON} ${formatDateForDisplay(date)}`}
                        x={STATE_CARD.DESCRIPTION_X}
                        y={height - STATE_CARD.DATE_Y_OFFSET}
                        width={width - STATE_CARD.DESCRIPTION_WIDTH_PADDING}
                        fontSize={STATE_CARD.DATE_FONT_SIZE}
                        fontFamily={TEXT.FONT_FAMILY}
                        fill={COLORS.TEXT_DATE}
                    />
                )}

                {/* Priority label */}
                <Text
                    text={getPriorityLabel()}
                    x={STATE_CARD.DESCRIPTION_X}
                    y={height - STATE_CARD.PRIORITY_Y_OFFSET}
                    width={width - STATE_CARD.DESCRIPTION_WIDTH_PADDING}
                    fontSize={STATE_CARD.PRIORITY_FONT_SIZE}
                    fontFamily={TEXT.FONT_FAMILY}
                    fill={getPriorityColor()}
                    fontStyle="bold"
                />

                {/* Delete button - only visible when selected */}
                {isSelected && onDelete && (
                    <>
                        <Rect
                            x={width - STATE_CARD.DELETE_BUTTON_X_OFFSET}
                            y={STATE_CARD.BUTTON_Y}
                            width={STATE_CARD.BUTTON_SIZE}
                            height={STATE_CARD.BUTTON_SIZE}
                            fill={COLORS.BUTTON_DELETE}
                            cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
                            onClick={handleDeleteClick}
                            onTap={handleDeleteClick}
                        />
                        <Text
                            text="✕"
                            x={width - STATE_CARD.DELETE_BUTTON_X_OFFSET}
                            y={STATE_CARD.BUTTON_Y}
                            width={STATE_CARD.BUTTON_SIZE}
                            height={STATE_CARD.BUTTON_SIZE}
                            fontSize={STATE_CARD.BUTTON_FONT_SIZE}
                            fontFamily={TEXT.FONT_FAMILY}
                            fill={COLORS.TEXT_WHITE}
                            align={TEXT.ALIGN_CENTER}
                            verticalAlign={TEXT.VERTICAL_ALIGN_MIDDLE}
                            onClick={handleDeleteClick}
                            onTap={handleDeleteClick}
                        />
                    </>
                )}

                {/* Fork button - only visible when selected */}
                {isSelected && onFork && (
                    <>
                        <Rect
                            x={width - STATE_CARD.FORK_BUTTON_X_OFFSET}
                            y={STATE_CARD.BUTTON_Y}
                            width={STATE_CARD.BUTTON_SIZE}
                            height={STATE_CARD.BUTTON_SIZE}
                            fill={COLORS.BUTTON_FORK}
                            cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
                            onClick={handleForkClick}
                            onTap={handleForkClick}
                        />
                        <Text
                            text="⑂"
                            x={width - STATE_CARD.FORK_BUTTON_X_OFFSET}
                            y={STATE_CARD.BUTTON_Y}
                            width={STATE_CARD.BUTTON_SIZE}
                            height={STATE_CARD.BUTTON_SIZE}
                            fontSize={STATE_CARD.BUTTON_FONT_SIZE}
                            fontFamily={TEXT.FONT_FAMILY}
                            fill={COLORS.TEXT_WHITE}
                            align={TEXT.ALIGN_CENTER}
                            verticalAlign={TEXT.VERTICAL_ALIGN_MIDDLE}
                            onClick={handleForkClick}
                            onTap={handleForkClick}
                        />
                    </>
                )}

                {/* Duplicate button - only visible when selected */}
                {isSelected && onDuplicate && (
                    <>
                        <Rect
                            x={width - STATE_CARD.DUPLICATE_BUTTON_X_OFFSET}
                            y={STATE_CARD.BUTTON_Y}
                            width={STATE_CARD.BUTTON_SIZE}
                            height={STATE_CARD.BUTTON_SIZE}
                            fill={COLORS.BUTTON_DUPLICATE_STATE}
                            cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
                            onClick={handleDuplicateClick}
                            onTap={handleDuplicateClick}
                        />
                        <Text
                            text="⧉"
                            x={width - STATE_CARD.DUPLICATE_BUTTON_X_OFFSET}
                            y={STATE_CARD.BUTTON_Y}
                            width={STATE_CARD.BUTTON_SIZE}
                            height={STATE_CARD.BUTTON_SIZE}
                            fontSize={STATE_CARD.BUTTON_FONT_SIZE}
                            fontFamily={TEXT.FONT_FAMILY}
                            fill={COLORS.TEXT_WHITE}
                            align={TEXT.ALIGN_CENTER}
                            verticalAlign={TEXT.VERTICAL_ALIGN_MIDDLE}
                            onClick={handleDuplicateClick}
                            onTap={handleDuplicateClick}
                        />
                    </>
                )}
            </Group>
        </>
    )
}

export default StateCard
