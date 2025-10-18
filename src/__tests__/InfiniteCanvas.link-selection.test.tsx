import React from 'react'
import { render, screen } from '@testing-library/react'
import LinkComponent from '../components/Link'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('Link Component Selection and Context Menu', () => {
    test('link shows different styling when selected', () => {
        const { rerender } = render(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={false}
            />
        )

        // When not selected, arrow should be gray
        const arrows = screen.queryAllByTestId('konva-arrow')
        expect(arrows.length).toBe(1)
        expect(arrows[0].getAttribute('data-stroke')).toBe('#6b7280')
        expect(arrows[0].getAttribute('data-stroke-width')).toBe('2')

        // When selected, arrow should be blue and thicker
        rerender(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={true}
            />
        )

        expect(arrows[0].getAttribute('data-stroke')).toBe('#2196f3')
        expect(arrows[0].getAttribute('data-stroke-width')).toBe('3')
    })

    test('selected link shows action buttons', () => {
        const onDelete = jest.fn()
        const onReassignStart = jest.fn()
        const onReassignEnd = jest.fn()

        render(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={true}
                onDelete={onDelete}
                onReassignStart={onReassignStart}
                onReassignEnd={onReassignEnd}
            />
        )

        // Look for action buttons (should have delete and reassign buttons)
        const allTexts = screen.queryAllByTestId('konva-text')
        const deleteButton = allTexts.find(
            (text) => text.getAttribute('data-text') === '✕'
        )
        const reassignStartButton = allTexts.find(
            (text) => text.getAttribute('data-text') === '⇤'
        )
        const reassignEndButton = allTexts.find(
            (text) => text.getAttribute('data-text') === '⇥'
        )

        // All action buttons should be visible when link is selected
        expect(deleteButton).toBeTruthy()
        expect(reassignStartButton).toBeTruthy()
        expect(reassignEndButton).toBeTruthy()
    })

    test('action buttons not shown when link is not selected', () => {
        const onDelete = jest.fn()
        const onReassignStart = jest.fn()
        const onReassignEnd = jest.fn()

        render(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={false}
                onDelete={onDelete}
                onReassignStart={onReassignStart}
                onReassignEnd={onReassignEnd}
            />
        )

        // Action buttons should NOT be visible when link is not selected
        const allTexts = screen.queryAllByTestId('konva-text')
        const deleteButton = allTexts.find(
            (text) => text.getAttribute('data-text') === '✕'
        )
        const reassignStartButton = allTexts.find(
            (text) => text.getAttribute('data-text') === '⇤'
        )
        const reassignEndButton = allTexts.find(
            (text) => text.getAttribute('data-text') === '⇥'
        )

        expect(deleteButton).toBeUndefined()
        expect(reassignStartButton).toBeUndefined()
        expect(reassignEndButton).toBeUndefined()
    })

    test('delete button has correct styling', () => {
        const onDelete = jest.fn()

        render(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={true}
                onDelete={onDelete}
            />
        )

        // Find the delete button (red rectangle)
        const rects = screen.queryAllByTestId('konva-rect')
        const deleteButton = rects.find(
            (rect) => rect.getAttribute('data-fill') === '#ef4444'
        )

        expect(deleteButton).toBeTruthy()
        expect(deleteButton?.getAttribute('data-width')).toBe('24')
        expect(deleteButton?.getAttribute('data-height')).toBe('24')
    })

    test('reassign buttons have correct styling', () => {
        const onReassignStart = jest.fn()
        const onReassignEnd = jest.fn()

        render(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={true}
                onReassignStart={onReassignStart}
                onReassignEnd={onReassignEnd}
            />
        )

        // Find the reassign buttons (purple rectangles)
        const rects = screen.queryAllByTestId('konva-rect')
        const purpleButtons = rects.filter(
            (rect) => rect.getAttribute('data-fill') === '#8b5cf6'
        )

        expect(purpleButtons.length).toBe(2)
        purpleButtons.forEach((button) => {
            expect(button.getAttribute('data-width')).toBe('24')
            expect(button.getAttribute('data-height')).toBe('24')
        })
    })
})
