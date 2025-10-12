import React from 'react'
import { render } from '@testing-library/react'
import DraggableCard from '../components/DraggableCard'

// Mock react-konva components
jest.mock('react-konva', () => ({
    Group: ({ children, draggable, x, y, ...props }: any) => (
        <div
            data-testid="konva-group"
            draggable={draggable}
            data-x={x}
            data-y={y}
            {...props}
        >
            {children}
        </div>
    ),
    Rect: ({ width, height, fill, stroke, ...props }: any) => (
        <div
            data-testid="konva-rect"
            data-width={width}
            data-height={height}
            data-fill={fill}
            data-stroke={stroke}
            {...props}
        />
    ),
    Text: ({ text, ...props }: any) => (
        <div data-testid="konva-text" data-text={text} {...props} />
    ),
    Stage: ({ children, ...props }: any) => (
        <div data-testid="konva-stage" {...props}>
            {children}
        </div>
    ),
    Layer: ({ children, ...props }: any) => (
        <div data-testid="konva-layer" {...props}>
            {children}
        </div>
    ),
}))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('DraggableCard Component', () => {
    test('TC5.14: Card renders with correct initial position', () => {
        const { getByTestId } = render(
            <DraggableCard
                id="test-card"
                x={100}
                y={100}
                title="Test Card"
                gridSpacing={20}
                scale={1}
            />
        )

        const group = getByTestId('konva-group')
        expect(group).toBeTruthy()
        expect(group.getAttribute('data-x')).toBe('100')
        expect(group.getAttribute('data-y')).toBe('100')
    })

    test('TC5.15: Card has draggable property', () => {
        const { getByTestId } = render(
            <DraggableCard
                id="test-card"
                x={0}
                y={0}
                title="Test Card"
                gridSpacing={20}
                scale={1}
            />
        )

        const group = getByTestId('konva-group')
        expect(group.getAttribute('draggable')).toBe('true')
    })

    test('TC5.16: Card renders title text', () => {
        const { getByTestId } = render(
            <DraggableCard
                id="test-card"
                x={0}
                y={0}
                title="My Test Card"
                gridSpacing={20}
                scale={1}
            />
        )

        const text = getByTestId('konva-text')
        expect(text.getAttribute('data-text')).toBe('My Test Card')
    })

    test('TC5.17: Card respects custom dimensions', () => {
        const { getAllByTestId } = render(
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

        const rects = getAllByTestId('konva-rect')
        // First rect is the main card background
        expect(rects[0].getAttribute('data-width')).toBe('200')
        expect(rects[0].getAttribute('data-height')).toBe('150')
    })

    test('TC5.18: onPositionChange callback is provided', () => {
        const onPositionChange = jest.fn()

        const { getByTestId } = render(
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

        const group = getByTestId('konva-group')
        expect(group).toBeTruthy()
        // The callback shouldn't be called on initial render
        expect(onPositionChange).not.toHaveBeenCalled()
    })
})
