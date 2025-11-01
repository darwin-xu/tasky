import React from 'react'
import { Rect, Text, Group } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { formatDateForDisplay } from '../utils/dateValidation'
import { getPriorityColor, getPriorityLabel } from '../utils/priorityHelpers'
import { useCardDrag } from '../hooks/useCardDrag'
import { useCardClickHandlers } from '../hooks/useCardClickHandlers'
import { SnapPreview } from './SnapPreview'
import { DeleteButton } from './DeleteButton'
import { DuplicateButton } from './DuplicateButton'
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
    const {
        groupRef,
        isDragging,
        snapPreview,
        handleDragStart,
        handleDragMove,
        handleDragEnd,
    } = useCardDrag({
        id,
        gridSpacing,
        scale,
        onPositionChange,
        onClick,
    })

    const {
        handleClick,
        handleDoubleClick,
        handleDeleteClick,
        handleDuplicateClick,
    } = useCardClickHandlers({
        id,
        onClick,
        onDoubleClick,
        onDelete,
        onDuplicate,
    })

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
                <SnapPreview
                    x={snapPreview.x}
                    y={snapPreview.y}
                    width={width}
                    height={height}
                    fill={COLORS.SNAP_PREVIEW_TASK_FILL}
                    stroke={COLORS.SNAP_PREVIEW_TASK_STROKE}
                    cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_TASK}
                />
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
                            ? COLORS.TASK_BG_DRAGGING
                            : COLORS.TASK_BG_NORMAL
                    }
                    stroke={
                        isSelected
                            ? COLORS.TASK_BORDER_SELECTED
                            : isDragging
                              ? COLORS.TASK_BORDER_DRAGGING
                              : COLORS.TASK_BORDER_NORMAL
                    }
                    strokeWidth={
                        isSelected
                            ? TASK_CARD.STROKE_WIDTH_SELECTED
                            : TASK_CARD.STROKE_WIDTH_NORMAL
                    }
                    shadowColor={COLORS.SHADOW_COLOR}
                    shadowBlur={
                        isDragging
                            ? TASK_CARD.SHADOW_BLUR_DRAGGING
                            : isSelected
                              ? TASK_CARD.SHADOW_BLUR_SELECTED
                              : TASK_CARD.SHADOW_BLUR_NORMAL
                    }
                    shadowOpacity={
                        isDragging
                            ? TASK_CARD.SHADOW_OPACITY_DRAGGING
                            : isSelected
                              ? TASK_CARD.SHADOW_OPACITY_SELECTED
                              : TASK_CARD.SHADOW_OPACITY_NORMAL
                    }
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
                    text={getPriorityLabel(priority)}
                    x={TASK_CARD.DESCRIPTION_X}
                    y={height - TASK_CARD.PRIORITY_Y_OFFSET}
                    width={width - TASK_CARD.DESCRIPTION_WIDTH_PADDING}
                    fontSize={TASK_CARD.PRIORITY_FONT_SIZE}
                    fontFamily={TEXT.FONT_FAMILY}
                    fill={getPriorityColor(priority)}
                    fontStyle="bold"
                />

                {/* Delete button - only visible when selected */}
                {isSelected && onDelete && (
                    <DeleteButton
                        x={width - TASK_CARD.DELETE_BUTTON_X_OFFSET}
                        y={TASK_CARD.BUTTON_Y}
                        size={TASK_CARD.BUTTON_SIZE}
                        fontSize={TASK_CARD.BUTTON_FONT_SIZE}
                        onClick={handleDeleteClick}
                    />
                )}

                {/* Duplicate button - only visible when selected */}
                {isSelected && onDuplicate && (
                    <DuplicateButton
                        x={width - TASK_CARD.DUPLICATE_BUTTON_X_OFFSET}
                        y={TASK_CARD.BUTTON_Y}
                        size={TASK_CARD.BUTTON_SIZE}
                        fontSize={TASK_CARD.BUTTON_FONT_SIZE}
                        fill={COLORS.BUTTON_DUPLICATE_TASK}
                        onClick={handleDuplicateClick}
                    />
                )}

                {/* Link connector handle - only visible when selected */}
                {isSelected && onLinkStart && (
                    <>
                        <Rect
                            x={width - TASK_CARD.LINK_HANDLE_X_OFFSET}
                            y={
                                height / 2 -
                                TASK_CARD.LINK_HANDLE_Y_CENTER_OFFSET
                            }
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
                            y={
                                height / 2 -
                                TASK_CARD.LINK_HANDLE_Y_CENTER_OFFSET
                            }
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
