import React, { useRef, useState } from 'react'
import { Rect, Text, Group } from 'react-konva'
import Konva from 'konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { snapPositionToGrid } from '../utils/snapToGrid'

export interface DraggableCardProps {
  id: string
  x: number
  y: number
  width?: number
  height?: number
  title: string
  gridSpacing?: number
  scale?: number
  onPositionChange?: (id: string, x: number, y: number) => void
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  id,
  x,
  y,
  width = 150,
  height = 100,
  title,
  gridSpacing = 20,
  scale = 1,
  onPositionChange,
}) => {
  const groupRef = useRef<Konva.Group>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [snapPreview, setSnapPreview] = useState<{
    x: number
    y: number
  } | null>(null)

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    setIsDragging(true)
    e.cancelBubble = true // Prevent canvas panning
  }

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target
    const pos = node.position()

    // Calculate snap position for preview
    const snapped = snapPositionToGrid(pos, gridSpacing, scale)
    setSnapPreview(snapped)

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
      >
        <Rect
          width={width}
          height={height}
          fill={isDragging ? '#e3f2fd' : '#ffffff'}
          stroke={isDragging ? '#2196f3' : '#cccccc'}
          strokeWidth={2}
          shadowColor="black"
          shadowBlur={isDragging ? 15 : 5}
          shadowOpacity={isDragging ? 0.4 : 0.2}
          shadowOffsetX={2}
          shadowOffsetY={2}
          cornerRadius={4}
        />
        <Text
          text={title}
          x={10}
          y={10}
          width={width - 20}
          height={height - 20}
          fontSize={14}
          fontFamily="Arial"
          fill="#333333"
          align="center"
          verticalAlign="middle"
        />
      </Group>
    </>
  )
}

export default DraggableCard
