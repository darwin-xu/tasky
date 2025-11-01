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

    const handleForkClick = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onFork) {
            onFork(id)
        }
    }

    return (
        <>
            {/* Snap preview indicator */}
            {isDragging && snapPreview && (
                <SnapPreview
                    x={snapPreview.x}
                    y={snapPreview.y}
                    width={width}
                    height={height}
                    fill={COLORS.SNAP_PREVIEW_STATE_FILL}
                    stroke={COLORS.SNAP_PREVIEW_STATE_STROKE}
                    cornerRadius={SNAP_PREVIEW.CORNER_RADIUS_STATE}
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
                    text={getPriorityLabel(priority)}
                    x={STATE_CARD.DESCRIPTION_X}
                    y={height - STATE_CARD.PRIORITY_Y_OFFSET}
                    width={width - STATE_CARD.DESCRIPTION_WIDTH_PADDING}
                    fontSize={STATE_CARD.PRIORITY_FONT_SIZE}
                    fontFamily={TEXT.FONT_FAMILY}
                    fill={getPriorityColor(priority)}
                    fontStyle="bold"
                />

                {/* Delete button - only visible when selected */}
                {isSelected && onDelete && (
                    <DeleteButton
                        x={width - STATE_CARD.DELETE_BUTTON_X_OFFSET}
                        y={STATE_CARD.BUTTON_Y}
                        size={STATE_CARD.BUTTON_SIZE}
                        fontSize={STATE_CARD.BUTTON_FONT_SIZE}
                        onClick={handleDeleteClick}
                    />
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
                    <DuplicateButton
                        x={width - STATE_CARD.DUPLICATE_BUTTON_X_OFFSET}
                        y={STATE_CARD.BUTTON_Y}
                        size={STATE_CARD.BUTTON_SIZE}
                        fontSize={STATE_CARD.BUTTON_FONT_SIZE}
                        fill={COLORS.BUTTON_DUPLICATE_STATE}
                        onClick={handleDuplicateClick}
                    />
                )}
            </Group>
        </>
    )
}

export default StateCard
