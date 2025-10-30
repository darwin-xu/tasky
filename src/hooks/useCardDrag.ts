import { useState, useRef } from 'react'
import Konva from 'konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { snapPositionToGrid } from '../utils/snapToGrid'

export interface UseCardDragProps {
    id: string
    gridSpacing: number
    scale: number
    onPositionChange?: (id: string, x: number, y: number) => void
    onClick?: (id: string) => void
}

export const useCardDrag = ({
    id,
    gridSpacing,
    scale,
    onPositionChange,
    onClick,
}: UseCardDragProps) => {
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

    return {
        groupRef,
        isDragging,
        snapPreview,
        handleDragStart,
        handleDragMove,
        handleDragEnd,
    }
}
