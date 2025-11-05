import { useState, useRef, useCallback, type MouseEvent } from 'react'

interface Position {
    x: number
    y: number
}

interface UseModalDragReturn {
    position: Position
    isDragging: boolean
    handleDragStart: (e: MouseEvent<HTMLElement>) => void
    resetPosition: () => void
}

// Elements that should prevent dragging when clicked
const NON_DRAGGABLE_ELEMENTS = new Set([
    'INPUT',
    'TEXTAREA',
    'SELECT',
    'BUTTON',
])

export const useModalDrag = (): UseModalDragReturn => {
    const [position, setPosition] = useState<Position>({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const dragStartPos = useRef<Position>({ x: 0, y: 0 })
    const initialModalPos = useRef<Position>({ x: 0, y: 0 })

    const handleDragStart = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            // Check if the click is on a non-draggable element
            let el = e.target as HTMLElement | null
            while (el) {
                if (NON_DRAGGABLE_ELEMENTS.has(el.tagName)) {
                    return // Don't start dragging
                }
                el = el.parentElement
            }

            // Start dragging
            setIsDragging(true)
            dragStartPos.current = { x: e.clientX, y: e.clientY }
            initialModalPos.current = { ...position }

            e.preventDefault()
        },
        [position]
    )

    // Handle mouse move during drag
    const handleMouseMove = useCallback((e: globalThis.MouseEvent) => {
        const deltaX = e.clientX - dragStartPos.current.x
        const deltaY = e.clientY - dragStartPos.current.y

        setPosition({
            x: initialModalPos.current.x + deltaX,
            y: initialModalPos.current.y + deltaY,
        })
    }, [])

    // Set up and clean up event listeners
    const startDrag = useCallback(
        (e: MouseEvent<HTMLElement>) => {
            handleDragStart(e)

            const handleMove = (moveEvent: globalThis.MouseEvent) => {
                handleMouseMove(moveEvent)
            }

            const handleUp = () => {
                setIsDragging(false)
                document.removeEventListener('mousemove', handleMove)
                document.removeEventListener('mouseup', handleUp)
            }

            document.addEventListener('mousemove', handleMove)
            document.addEventListener('mouseup', handleUp)
        },
        [handleDragStart, handleMouseMove]
    )

    const resetPosition = useCallback(() => {
        setPosition({ x: 0, y: 0 })
    }, [])

    return {
        position,
        isDragging,
        handleDragStart: startDrag,
        resetPosition,
    }
}
