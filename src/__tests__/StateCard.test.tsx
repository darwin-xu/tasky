/* eslint-disable testing-library/prefer-screen-queries */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import StateCard from '../components/StateCard'

// Mock Konva for testing environment
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

jest.mock('konva/lib/Node', () => ({
    KonvaEventObject: {},
}))

jest.mock('konva', () => ({
    default: {},
}))

describe('StateCard Component', () => {
    const defaultProps = {
        id: 'state-1',
        x: 100,
        y: 100,
        description: 'Test State',
        date: '2024-01-01',
        priority: 'Medium' as const,
    }

    test('renders state card with description', () => {
        render(<StateCard {...defaultProps} />)
        const texts = screen.getAllByTestId('konva-text')
        const descriptionText = texts.find(
            (text) => text.getAttribute('data-text') === 'Test State'
        )
        expect(descriptionText).toBeTruthy()
    })

    test('renders state card with date', () => {
        render(<StateCard {...defaultProps} />)
        const texts = screen.getAllByTestId('konva-text')
        // Date should be formatted as human-readable (e.g., "📅 Jan 1, 2024")
        const dateText = texts.find((text) =>
            text.getAttribute('data-text')?.includes('Jan')
        )
        expect(dateText).toBeTruthy()
        expect(dateText?.getAttribute('data-text')).toMatch(/📅.*Jan.*1.*2024/)
    })

    test('renders state card with priority', () => {
        render(<StateCard {...defaultProps} />)
        const texts = screen.getAllByTestId('konva-text')
        const priorityText = texts.find(
            (text) => text.getAttribute('data-text') === '🟡 Medium'
        )
        expect(priorityText).toBeTruthy()
    })

    test('renders state card without date when not provided', () => {
        render(<StateCard {...defaultProps} date="" />)
        const texts = screen.getAllByTestId('konva-text')
        const dateText = texts.find((text) =>
            text.getAttribute('data-text')?.includes('📅')
        )
        expect(dateText).toBeFalsy()
    })

    test('renders state card with High priority', () => {
        render(<StateCard {...defaultProps} priority="High" />)
        const texts = screen.getAllByTestId('konva-text')
        const priorityText = texts.find(
            (text) => text.getAttribute('data-text') === '🔴 High'
        )
        expect(priorityText).toBeTruthy()
    })

    test('renders state card with Low priority', () => {
        render(<StateCard {...defaultProps} priority="Low" />)
        const texts = screen.getAllByTestId('konva-text')
        const priorityText = texts.find(
            (text) => text.getAttribute('data-text') === '🟢 Low'
        )
        expect(priorityText).toBeTruthy()
    })

    test('renders state card at specified position', () => {
        render(<StateCard {...defaultProps} x={150} y={200} />)
        const group = screen.getByTestId('konva-group')
        expect(group?.getAttribute('data-x')).toBe('150')
        expect(group?.getAttribute('data-y')).toBe('200')
    })

    test('renders state card with custom dimensions', () => {
        render(<StateCard {...defaultProps} width={250} height={150} />)
        const rects = screen.getAllByTestId('konva-rect')
        const mainRect = rects[0] // First rect is the main card background
        expect(mainRect?.getAttribute('data-width')).toBe('250')
        expect(mainRect?.getAttribute('data-height')).toBe('150')
    })

    test('has draggable property', () => {
        render(<StateCard {...defaultProps} />)
        const group = screen.getByTestId('konva-group')
        expect(group.getAttribute('draggable')).toBe('true')
    })

    test('shows delete button when selected', () => {
        const handleDelete = jest.fn()
        render(
            <StateCard
                {...defaultProps}
                isSelected={true}
                onDelete={handleDelete}
            />
        )

        // Check for delete button (✕ text)
        const texts = screen.getAllByTestId('konva-text')
        const deleteButton = texts.find(
            (text) => text.getAttribute('data-text') === '✕'
        )
        expect(deleteButton).toBeTruthy()
    })

    test('does not show delete button when not selected', () => {
        const handleDelete = jest.fn()
        render(
            <StateCard
                {...defaultProps}
                isSelected={false}
                onDelete={handleDelete}
            />
        )

        // Check for delete button (✕ text)
        const texts = screen.getAllByTestId('konva-text')
        const deleteButton = texts.find(
            (text) => text.getAttribute('data-text') === '✕'
        )
        expect(deleteButton).toBeFalsy()
    })

    test('shows fork button when selected and onFork is provided', () => {
        const handleFork = jest.fn()
        render(
            <StateCard
                {...defaultProps}
                isSelected={true}
                onFork={handleFork}
            />
        )

        // Check for fork button (⑂ text)
        const texts = screen.getAllByTestId('konva-text')
        const forkButton = texts.find(
            (text) => text.getAttribute('data-text') === '⑂'
        )
        expect(forkButton).toBeTruthy()
    })

    test('does not show fork button when not selected', () => {
        const handleFork = jest.fn()
        render(
            <StateCard
                {...defaultProps}
                isSelected={false}
                onFork={handleFork}
            />
        )

        // Check for fork button (⑂ text)
        const texts = screen.getAllByTestId('konva-text')
        const forkButton = texts.find(
            (text) => text.getAttribute('data-text') === '⑂'
        )
        expect(forkButton).toBeFalsy()
    })

    test('does not show fork button when onFork is not provided', () => {
        render(<StateCard {...defaultProps} isSelected={true} />)

        // Check for fork button (⑂ text)
        const texts = screen.getAllByTestId('konva-text')
        const forkButton = texts.find(
            (text) => text.getAttribute('data-text') === '⑂'
        )
        expect(forkButton).toBeFalsy()
    })

    test('shows duplicate button when selected and onDuplicate is provided', () => {
        const handleDuplicate = jest.fn()
        render(
            <StateCard
                {...defaultProps}
                isSelected={true}
                onDuplicate={handleDuplicate}
            />
        )

        // Check for duplicate button (⧉ text)
        const texts = screen.getAllByTestId('konva-text')
        const duplicateButton = texts.find(
            (text) => text.getAttribute('data-text') === '⧉'
        )
        expect(duplicateButton).toBeTruthy()
    })

    test('does not show duplicate button when not selected', () => {
        const handleDuplicate = jest.fn()
        render(
            <StateCard
                {...defaultProps}
                isSelected={false}
                onDuplicate={handleDuplicate}
            />
        )

        // Check for duplicate button (⧉ text)
        const texts = screen.getAllByTestId('konva-text')
        const duplicateButton = texts.find(
            (text) => text.getAttribute('data-text') === '⧉'
        )
        expect(duplicateButton).toBeFalsy()
    })

    test('handles fork button click event', () => {
        const handleFork = jest.fn()
        render(
            <StateCard
                {...defaultProps}
                isSelected={true}
                onFork={handleFork}
            />
        )

        const rects = screen.getAllByTestId('konva-rect')
        const forkButtonRect = rects.find(
            (rect) => rect.getAttribute('data-fill') === '#10b981'
        )

        expect(forkButtonRect).toBeTruthy()

        if (forkButtonRect) {
            const clickEvent = {
                cancelBubble: false,
            }
            fireEvent.click(forkButtonRect, clickEvent)
            expect(handleFork).toHaveBeenCalledWith('state-1')
        }
    })
})
