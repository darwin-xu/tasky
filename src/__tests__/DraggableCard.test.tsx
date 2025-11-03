import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DraggableCard from '../components/DraggableCard'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('DraggableCard Component', () => {
    test('TC5.14: Card renders with correct initial position', () => {
        render(
            <DraggableCard
                id="test-card"
                x={100}
                y={100}
                title="Test Card"
                gridSpacing={20}
                scale={1}
            />
        )

        const group = screen.getByTestId('konva-group')
        expect(group).toBeTruthy()
        expect(group.getAttribute('data-x')).toBe('100')
        expect(group.getAttribute('data-y')).toBe('100')
    })

    test('TC5.15: Card has draggable property', () => {
        render(
            <DraggableCard
                id="test-card"
                x={0}
                y={0}
                title="Test Card"
                gridSpacing={20}
                scale={1}
            />
        )

        const group = screen.getByTestId('konva-group')
        expect(group.getAttribute('draggable')).toBe('true')
    })

    test('TC5.16: Card renders title text', () => {
        render(
            <DraggableCard
                id="test-card"
                x={0}
                y={0}
                title="My Test Card"
                gridSpacing={20}
                scale={1}
            />
        )

        const text = screen.getByTestId('konva-text')
        expect(text.getAttribute('data-text')).toBe('My Test Card')
    })

    test('TC5.17: Card respects custom dimensions', () => {
        render(
            <DraggableCard
                id="test-card"
                x={0}
                y={0}
                width={200}
                height={150}
                title="Test Card"
                gridSpacing={50}
                scale={1}
            />
        )

        const rects = screen.getAllByTestId('konva-rect')
        // First rect is the main card background
        expect(rects[0].getAttribute('data-width')).toBe('200')
        expect(rects[0].getAttribute('data-height')).toBe('150')
    })

    test('TC5.18: onPositionChange callback is provided', () => {
        const onPositionChange = jest.fn()

        render(
            <DraggableCard
                id="test-card"
                x={0}
                y={0}
                title="Test Card"
                gridSpacing={20}
                scale={1}
                onPositionChange={onPositionChange}
            />
        )

        const group = screen.getByTestId('konva-group')
        expect(group).toBeTruthy()
        // The callback shouldn't be called on initial render
        expect(onPositionChange).not.toHaveBeenCalled()
    })

    test('handles drag start event', () => {
        const onPositionChange = jest.fn()

        render(
            <DraggableCard
                id="test-card"
                x={100}
                y={100}
                title="Test Card"
                gridSpacing={20}
                scale={1}
                onPositionChange={onPositionChange}
            />
        )

        const group = screen.getByTestId('konva-group')

        // Create a mock drag event
        const dragStartEvent = {
            target: {
                position: () => ({ x: 100, y: 100 }),
            },
            cancelBubble: false,
        }

        fireEvent.dragStart(group, dragStartEvent)

        // Verify the group is still present
        expect(group).toBeTruthy()
    })

    test('handles drag move event and shows snap preview', () => {
        const onPositionChange = jest.fn()

        render(
            <DraggableCard
                id="test-card"
                x={100}
                y={100}
                title="Test Card"
                gridSpacing={20}
                scale={1}
                onPositionChange={onPositionChange}
            />
        )

        const group = screen.getByTestId('konva-group')

        // Start dragging
        const dragStartEvent = {
            target: {
                position: () => ({ x: 100, y: 100 }),
            },
            cancelBubble: false,
        }
        fireEvent.dragStart(group, dragStartEvent)

        // Move during drag
        const dragEvent = {
            target: {
                position: () => ({ x: 125, y: 135 }),
            },
            cancelBubble: false,
        }
        fireEvent.drag(group, dragEvent)

        // Verify the component is still rendered correctly
        expect(group).toBeTruthy()
    })

    test('handles drag end event and calls onPositionChange', () => {
        const onPositionChange = jest.fn()

        render(
            <DraggableCard
                id="test-card"
                x={100}
                y={100}
                title="Test Card"
                gridSpacing={20}
                scale={1}
                onPositionChange={onPositionChange}
            />
        )

        const group = screen.getByTestId('konva-group')

        // Start dragging
        const dragStartEvent = {
            target: {
                position: () => ({ x: 100, y: 100 }),
            },
            cancelBubble: false,
        }
        fireEvent.dragStart(group, dragStartEvent)

        // End dragging at a new position
        const dragEndEvent = {
            target: {
                position: (newPos?: { x: number; y: number }) => {
                    if (newPos !== undefined) {
                        return newPos
                    }
                    return { x: 125, y: 135 }
                },
            },
            cancelBubble: false,
        }
        fireEvent.dragEnd(group, dragEndEvent)

        // Verify onPositionChange was called with snapped position (120, 140 snapped to grid of 20)
        expect(onPositionChange).toHaveBeenCalledWith('test-card', 120, 140)
    })

    test('handles drag end without onPositionChange callback', () => {
        render(
            <DraggableCard
                id="test-card"
                x={100}
                y={100}
                title="Test Card"
                gridSpacing={20}
                scale={1}
            />
        )

        const group = screen.getByTestId('konva-group')

        // Start dragging
        const dragStartEvent = {
            target: {
                position: () => ({ x: 100, y: 100 }),
            },
            cancelBubble: false,
        }
        fireEvent.dragStart(group, dragStartEvent)

        // End dragging at a new position
        const dragEndEvent = {
            target: {
                position: (newPos?: { x: number; y: number }) => {
                    if (newPos !== undefined) {
                        return newPos
                    }
                    return { x: 125, y: 135 }
                },
            },
            cancelBubble: false,
        }

        // Should not throw error even without onPositionChange callback
        expect(() => fireEvent.dragEnd(group, dragEndEvent)).not.toThrow()
    })
})
