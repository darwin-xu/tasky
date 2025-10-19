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
    TASK_CARD,
    COLORS,
    TEXT,
    SNAP_PREVIEW,
} from '../constants'

export interface TaskCardProps {
    id: string
    x: number
    y: number
    width?: number
    height?: number
    title: string
    description?: string
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
    onLinkStart?: (sourceId: string) => void
}

const TaskCard: React.FC<TaskCardProps> = ({
    id,
    x,
    y,
    width = CARD_WIDTH,
    height = CARD_HEIGHT,
    title,
    description = '',
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
    onLinkStart,
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

    const handleLinkHandleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onLinkStart) {
            onLinkStart(id)
        }
    }

    const handleLinkHandleTouchStart = (e: KonvaEventObject<TouchEvent>) => {
        e.cancelBubble = true
        if (onLinkStart) {
            onLinkStart(id)
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

    const descriptionTop = TASK_CARD.DESCRIPTION_TOP
    const footerReservedHeight = TASK_CARD.FOOTER_RESERVED_HEIGHT
    const descriptionHeight = Math.max(
        0,
        height - descriptionTop - footerReservedHeight
    )

    return (
        <>
            {/* Snap preview indicator */}
            {isDragging && snapPreview && (
                <Group x={snapPreview.x} y={snapPreview.y}>
                    <Rect
                        width={width}
                        height={height}
                        fill={COLORS.SNAP_PREVIEW_TASK_FILL}
                        stroke={COLORS.SNAP_PREVIEW_TASK_STROKE}
                        strokeWidth={SNAP_PREVIEW.STROKE_WIDTH}
                        dash={SNAP_PREVIEW.DASH_PATTERN}
                        cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
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
                    fill={isDragging ? COLORS.TASK_BG_DRAGGING : COLORS.TASK_BG_NORMAL}
                    stroke={
                        isSelected
                            ? COLORS.TASK_BORDER_SELECTED
                            : isDragging
                              ? COLORS.TASK_BORDER_DRAGGING
                              : COLORS.TASK_BORDER_NORMAL
                    }
                    strokeWidth={isSelected ? TASK_CARD.STROKE_WIDTH_SELECTED : TASK_CARD.STROKE_WIDTH_NORMAL}
                    shadowColor={COLORS.SHADOW_COLOR}
                    shadowBlur={isDragging ? TASK_CARD.SHADOW_BLUR_DRAGGING : isSelected ? TASK_CARD.SHADOW_BLUR_SELECTED : TASK_CARD.SHADOW_BLUR_NORMAL}
                    shadowOpacity={isDragging ? TASK_CARD.SHADOW_OPACITY_DRAGGING : isSelected ? TASK_CARD.SHADOW_OPACITY_SELECTED : TASK_CARD.SHADOW_OPACITY_NORMAL}
                    shadowOffsetX={TASK_CARD.SHADOW_OFFSET_X}
                    shadowOffsetY={TASK_CARD.SHADOW_OFFSET_Y}
                    cornerRadius={TASK_CARD.CORNER_RADIUS}
                />

                {/* Priority indicator bar */}
                <Rect
                    x={0}
                    y={0}
                    width={width}
                    height={TASK_CARD.PRIORITY_BAR_HEIGHT}
                    fill={COLORS.TASK_PRIORITY_BAR}
                    cornerRadius={TASK_CARD.PRIORITY_BAR_CORNER_RADIUS}
                />

                {/* Title */}
                <Text
                    text={title}
                    x={TASK_CARD.TITLE_X}
                    y={TASK_CARD.TITLE_Y}
                    width={width - TASK_CARD.TITLE_WIDTH_PADDING}
                    fontSize={TASK_CARD.TITLE_FONT_SIZE}
                    fontFamily={TEXT.FONT_FAMILY}
                    fontStyle="bold"
                    fill={COLORS.TEXT_TITLE}
                    wrap={TEXT.WRAP_WORD}
                    ellipsis={true}
                />

                {/* Description */}
                {description && descriptionHeight > 0 && (
                    <Text
                        text={description}
                        x={TASK_CARD.DESCRIPTION_X}
                        y={descriptionTop}
                        width={width - TASK_CARD.DESCRIPTION_WIDTH_PADDING}
                        height={descriptionHeight}
                        fontSize={TASK_CARD.DESCRIPTION_FONT_SIZE}
                        fontFamily={TEXT.FONT_FAMILY}
                        fill={COLORS.TEXT_DESCRIPTION}
                        wrap={TEXT.WRAP_WORD}
                        ellipsis={true}
                    />
                )}

                {/* Date */}
                {date && (
                    <Text
                        text={`${TEXT.DATE_ICON} ${formatDateForDisplay(date)}`}
                        x={TASK_CARD.DESCRIPTION_X}
                        y={height - TASK_CARD.DATE_Y_OFFSET}
                        width={width - TASK_CARD.DESCRIPTION_WIDTH_PADDING}
                        fontSize={TASK_CARD.DATE_FONT_SIZE}
                        fontFamily={TEXT.FONT_FAMILY}
                        fill={COLORS.TEXT_DATE}
                    />
                )}

                {/* Priority label */}
                <Text
                    text={getPriorityLabel()}
                    x={TASK_CARD.DESCRIPTION_X}
                    y={height - TASK_CARD.PRIORITY_Y_OFFSET}
                    width={width - TASK_CARD.DESCRIPTION_WIDTH_PADDING}
                    fontSize={TASK_CARD.PRIORITY_FONT_SIZE}
                    fontFamily={TEXT.FONT_FAMILY}
                    fill={getPriorityColor()}
                    fontStyle="bold"
                />

                {/* Delete button - only visible when selected */}
                {isSelected && onDelete && (
                    <>
                        <Rect
                            x={width - TASK_CARD.DELETE_BUTTON_X_OFFSET}
                            y={TASK_CARD.BUTTON_Y}
                            width={TASK_CARD.BUTTON_SIZE}
                            height={TASK_CARD.BUTTON_SIZE}
                            fill={COLORS.BUTTON_DELETE}
                            cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
                            onClick={handleDeleteClick}
                            onTap={handleDeleteClick}
                        />
                        <Text
                            text="✕"
                            x={width - TASK_CARD.DELETE_BUTTON_X_OFFSET}
                            y={TASK_CARD.BUTTON_Y}
                            width={TASK_CARD.BUTTON_SIZE}
                            height={TASK_CARD.BUTTON_SIZE}
                            fontSize={TASK_CARD.BUTTON_FONT_SIZE}
                            fontFamily={TEXT.FONT_FAMILY}
                            fill={COLORS.TEXT_WHITE}
                            align={TEXT.ALIGN_CENTER}
                            verticalAlign={TEXT.VERTICAL_ALIGN_MIDDLE}
                            onClick={handleDeleteClick}
                            onTap={handleDeleteClick}
                        />
                    </>
                )}

                {/* Duplicate button - only visible when selected */}
                {isSelected && onDuplicate && (
                    <>
                        <Rect
                            x={width - TASK_CARD.DUPLICATE_BUTTON_X_OFFSET}
                            y={TASK_CARD.BUTTON_Y}
                            width={TASK_CARD.BUTTON_SIZE}
                            height={TASK_CARD.BUTTON_SIZE}
                            fill={COLORS.BUTTON_DUPLICATE_TASK}
                            cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
                            onClick={handleDuplicateClick}
                            onTap={handleDuplicateClick}
                        />
                        <Text
                            text="⧉"
                            x={width - TASK_CARD.DUPLICATE_BUTTON_X_OFFSET}
                            y={TASK_CARD.BUTTON_Y}
                            width={TASK_CARD.BUTTON_SIZE}
                            height={TASK_CARD.BUTTON_SIZE}
                            fontSize={TASK_CARD.BUTTON_FONT_SIZE}
                            fontFamily={TEXT.FONT_FAMILY}
                            fill={COLORS.TEXT_WHITE}
                            align={TEXT.ALIGN_CENTER}
                            verticalAlign={TEXT.VERTICAL_ALIGN_MIDDLE}
                            onClick={handleDuplicateClick}
                            onTap={handleDuplicateClick}
                        />
                    </>
                )}

                {/* Link connector handle - only visible when selected */}
                {isSelected && onLinkStart && (
                    <>
                        <Rect
                            x={width - TASK_CARD.LINK_HANDLE_X_OFFSET}
                            y={height / 2 - TASK_CARD.LINK_HANDLE_Y_CENTER_OFFSET}
                            width={TASK_CARD.LINK_HANDLE_SIZE}
                            height={TASK_CARD.LINK_HANDLE_SIZE}
                            fill={COLORS.BUTTON_LINK}
                            cornerRadius={TASK_CARD.LINK_HANDLE_CORNER_RADIUS}
                            onMouseDown={handleLinkHandleMouseDown}
                            onTouchStart={handleLinkHandleTouchStart}
                        />
                        <Text
                            text="→"
                            x={width - TASK_CARD.LINK_HANDLE_X_OFFSET}
                            y={height / 2 - TASK_CARD.LINK_HANDLE_Y_CENTER_OFFSET}
                            width={TASK_CARD.LINK_HANDLE_SIZE}
                            height={TASK_CARD.LINK_HANDLE_SIZE}
                            fontSize={TASK_CARD.BUTTON_FONT_SIZE}
                            fontFamily={TEXT.FONT_FAMILY}
                            fill={COLORS.TEXT_WHITE}
                            align={TEXT.ALIGN_CENTER}
                            verticalAlign={TEXT.VERTICAL_ALIGN_MIDDLE}
                            onMouseDown={handleLinkHandleMouseDown}
                            onTouchStart={handleLinkHandleTouchStart}
                        />
                    </>
                )}
            </Group>
        </>
    )
}

export default TaskCard
