import React, { useRef, useState } from 'react'
import { Rect, Text, Group } from 'react-konva'
import Konva from 'konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { snapPositionToGrid } from '../utils/snapToGrid'
import { formatDateForDisplay } from '../utils/dateValidation'

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
    width = 200,
    height = 150,
    title,
    description = '',
    date = '',
    priority = 'Medium',
    gridSpacing = 20,
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
                return '#ef4444'
            case 'Medium':
                return '#f59e0b'
            case 'Low':
                return '#10b981'
            default:
                return '#6b7280'
        }
    }

    // Priority icon/label
    const getPriorityLabel = () => {
        switch (priority) {
            case 'High':
                return '🔴 High'
            case 'Medium':
                return '🟡 Medium'
            case 'Low':
                return '🟢 Low'
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
                        fill="rgba(100, 149, 237, 0.3)"
                        stroke="rgba(100, 149, 237, 0.8)"
                        strokeWidth={2}
                        dash={[5, 5]}
                        cornerRadius={4}
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
                    fill={isDragging ? '#e3f2fd' : '#ffffff'}
                    stroke={
                        isSelected
                            ? '#2196f3'
                            : isDragging
                              ? '#2196f3'
                              : '#cccccc'
                    }
                    strokeWidth={isSelected ? 3 : 2}
                    shadowColor="black"
                    shadowBlur={isDragging ? 15 : isSelected ? 10 : 5}
                    shadowOpacity={isDragging ? 0.4 : isSelected ? 0.3 : 0.2}
                    shadowOffsetX={2}
                    shadowOffsetY={2}
                    cornerRadius={4}
                />

                {/* Priority indicator bar */}
                <Rect
                    x={0}
                    y={0}
                    width={width}
                    height={4}
                    fill={getPriorityColor()}
                    cornerRadius={[4, 4, 0, 0]}
                />

                {/* Title */}
                <Text
                    text={title}
                    x={10}
                    y={15}
                    width={width - 20}
                    fontSize={16}
                    fontFamily="Arial"
                    fontStyle="bold"
                    fill="#1f2937"
                    wrap="word"
                    ellipsis={true}
                />

                {/* Description */}
                {description && (
                    <Text
                        text={description}
                        x={10}
                        y={45}
                        width={width - 20}
                        height={60}
                        fontSize={12}
                        fontFamily="Arial"
                        fill="#6b7280"
                        wrap="word"
                        ellipsis={true}
                    />
                )}

                {/* Date */}
                {date && (
                    <Text
                        text={`📅 ${formatDateForDisplay(date)}`}
                        x={10}
                        y={height - 35}
                        width={width - 20}
                        fontSize={11}
                        fontFamily="Arial"
                        fill="#4b5563"
                    />
                )}

                {/* Priority label */}
                <Text
                    text={getPriorityLabel()}
                    x={10}
                    y={height - 20}
                    width={width - 20}
                    fontSize={11}
                    fontFamily="Arial"
                    fill={getPriorityColor()}
                    fontStyle="bold"
                />

                {/* Delete button - only visible when selected */}
                {isSelected && onDelete && (
                    <>
                        <Rect
                            x={width - 30}
                            y={5}
                            width={24}
                            height={24}
                            fill="#ef4444"
                            cornerRadius={4}
                            onClick={handleDeleteClick}
                            onTap={handleDeleteClick}
                        />
                        <Text
                            text="✕"
                            x={width - 30}
                            y={5}
                            width={24}
                            height={24}
                            fontSize={16}
                            fontFamily="Arial"
                            fill="white"
                            align="center"
                            verticalAlign="middle"
                            onClick={handleDeleteClick}
                            onTap={handleDeleteClick}
                        />
                    </>
                )}

                {/* Duplicate button - only visible when selected */}
                {isSelected && onDuplicate && (
                    <>
                        <Rect
                            x={width - 60}
                            y={5}
                            width={24}
                            height={24}
                            fill="#3b82f6"
                            cornerRadius={4}
                            onClick={handleDuplicateClick}
                            onTap={handleDuplicateClick}
                        />
                        <Text
                            text="⧉"
                            x={width - 60}
                            y={5}
                            width={24}
                            height={24}
                            fontSize={16}
                            fontFamily="Arial"
                            fill="white"
                            align="center"
                            verticalAlign="middle"
                            onClick={handleDuplicateClick}
                            onTap={handleDuplicateClick}
                        />
                    </>
                )}

                {/* Link connector handle - only visible when selected */}
                {isSelected && onLinkStart && (
                    <>
                        <Rect
                            x={width - 15}
                            y={height / 2 - 12}
                            width={24}
                            height={24}
                            fill="#10b981"
                            cornerRadius={12}
                            onMouseDown={handleLinkHandleMouseDown}
                            onTouchStart={handleLinkHandleTouchStart}
                        />
                        <Text
                            text="→"
                            x={width - 15}
                            y={height / 2 - 12}
                            width={24}
                            height={24}
                            fontSize={16}
                            fontFamily="Arial"
                            fill="white"
                            align="center"
                            verticalAlign="middle"
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
