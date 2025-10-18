import React from 'react'
import { render, screen } from '@testing-library/react'
import TaskCard from '../components/TaskCard'
import StateCard from '../components/StateCard'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('Card Field Validation & Display', () => {
    describe('Date Display', () => {
        test('TaskCard displays date in human-readable format', () => {
            render(
                <TaskCard
                    id="test-task"
                    x={0}
                    y={0}
                    title="Test Task"
                    date="2024-01-15"
                    gridSpacing={20}
                    scale={1}
                />
            )

            const texts = screen.getAllByTestId('konva-text')
            const dateText = texts.find((text) =>
                text.getAttribute('data-text')?.includes('📅')
            )
            expect(dateText).toBeTruthy()
            // Should be formatted as "📅 Jan 15, 2024" instead of "📅 2024-01-15"
            expect(dateText?.getAttribute('data-text')).toMatch(
                /📅.*Jan.*15.*2024/
            )
            expect(dateText?.getAttribute('data-text')).not.toContain(
                '2024-01-15'
            )
        })

        test('StateCard displays date in human-readable format', () => {
            render(
                <StateCard
                    id="state-1"
                    x={0}
                    y={0}
                    description="Test State"
                    date="2024-03-20"
                    gridSpacing={20}
                    scale={1}
                />
            )

            const texts = screen.getAllByTestId('konva-text')
            const dateText = texts.find((text) =>
                text.getAttribute('data-text')?.includes('📅')
            )
            expect(dateText).toBeTruthy()
            // Should be formatted as "📅 Mar 20, 2024" instead of "📅 2024-03-20"
            expect(dateText?.getAttribute('data-text')).toMatch(
                /📅.*Mar.*20.*2024/
            )
            expect(dateText?.getAttribute('data-text')).not.toContain(
                '2024-03-20'
            )
        })

        test('TaskCard handles empty date gracefully', () => {
            render(
                <TaskCard
                    id="test-task"
                    x={0}
                    y={0}
                    title="Test Task"
                    date=""
                    gridSpacing={20}
                    scale={1}
                />
            )

            const texts = screen.getAllByTestId('konva-text')
            const dateText = texts.find((text) =>
                text.getAttribute('data-text')?.includes('📅')
            )
            // Date should not be rendered when empty
            expect(dateText).toBeFalsy()
        })

        test('StateCard handles empty date gracefully', () => {
            render(
                <StateCard
                    id="state-1"
                    x={0}
                    y={0}
                    description="Test State"
                    date=""
                    gridSpacing={20}
                    scale={1}
                />
            )

            const texts = screen.getAllByTestId('konva-text')
            const dateText = texts.find((text) =>
                text.getAttribute('data-text')?.includes('📅')
            )
            // Date should not be rendered when empty
            expect(dateText).toBeFalsy()
        })
    })

    describe('Priority Display', () => {
        test('TaskCard displays priority with visual indicator - High', () => {
            render(
                <TaskCard
                    id="test-task"
                    x={0}
                    y={0}
                    title="Test Task"
                    priority="High"
                    gridSpacing={20}
                    scale={1}
                />
            )

            const texts = screen.getAllByTestId('konva-text')
            const priorityText = texts.find((text) =>
                text.getAttribute('data-text')?.includes('High')
            )
            expect(priorityText).toBeTruthy()
            // Should include visual indicator (🔴)
            expect(priorityText?.getAttribute('data-text')).toBe('🔴 High')
        })

        test('TaskCard displays priority with visual indicator - Medium', () => {
            render(
                <TaskCard
                    id="test-task"
                    x={0}
                    y={0}
                    title="Test Task"
                    priority="Medium"
                    gridSpacing={20}
                    scale={1}
                />
            )

            const texts = screen.getAllByTestId('konva-text')
            const priorityText = texts.find((text) =>
                text.getAttribute('data-text')?.includes('Medium')
            )
            expect(priorityText).toBeTruthy()
            // Should include visual indicator (🟡)
            expect(priorityText?.getAttribute('data-text')).toBe('🟡 Medium')
        })

        test('TaskCard displays priority with visual indicator - Low', () => {
            render(
                <TaskCard
                    id="test-task"
                    x={0}
                    y={0}
                    title="Test Task"
                    priority="Low"
                    gridSpacing={20}
                    scale={1}
                />
            )

            const texts = screen.getAllByTestId('konva-text')
            const priorityText = texts.find((text) =>
                text.getAttribute('data-text')?.includes('Low')
            )
            expect(priorityText).toBeTruthy()
            // Should include visual indicator (🟢)
            expect(priorityText?.getAttribute('data-text')).toBe('🟢 Low')
        })

        test('StateCard displays priority with visual indicator - High', () => {
            render(
                <StateCard
                    id="state-1"
                    x={0}
                    y={0}
                    description="Test State"
                    priority="High"
                    gridSpacing={20}
                    scale={1}
                />
            )

            const texts = screen.getAllByTestId('konva-text')
            const priorityText = texts.find((text) =>
                text.getAttribute('data-text')?.includes('High')
            )
            expect(priorityText).toBeTruthy()
            // Should include visual indicator (🔴)
            expect(priorityText?.getAttribute('data-text')).toBe('🔴 High')
        })

        test('StateCard displays priority with visual indicator - Low', () => {
            render(
                <StateCard
                    id="state-1"
                    x={0}
                    y={0}
                    description="Test State"
                    priority="Low"
                    gridSpacing={20}
                    scale={1}
                />
            )

            const texts = screen.getAllByTestId('konva-text')
            const priorityText = texts.find((text) =>
                text.getAttribute('data-text')?.includes('Low')
            )
            expect(priorityText).toBeTruthy()
            // Should include visual indicator (🟢)
            expect(priorityText?.getAttribute('data-text')).toBe('🟢 Low')
        })

        test('TaskCard has color-coded priority bar', () => {
            render(
                <TaskCard
                    id="test-task"
                    x={0}
                    y={0}
                    title="Test Task"
                    priority="High"
                    gridSpacing={20}
                    scale={1}
                />
            )

            const rects = screen.getAllByTestId('konva-rect')
            // Priority bar is the second rect (first is main background)
            const priorityBar = rects.find(
                (rect) => rect.getAttribute('data-height') === '4'
            )
            expect(priorityBar).toBeTruthy()
            // High priority should be red (#ef4444)
            expect(priorityBar?.getAttribute('data-fill')).toBe('#ef4444')
        })
    })

    describe('Empty Optional Fields', () => {
        test('TaskCard handles empty description without clutter', () => {
            render(
                <TaskCard
                    id="test-task"
                    x={0}
                    y={0}
                    title="Test Task"
                    description=""
                    gridSpacing={20}
                    scale={1}
                />
            )

            const texts = screen.getAllByTestId('konva-text')
            // Should only have title and priority text, no empty description
            const titleText = texts.find(
                (text) => text.getAttribute('data-text') === 'Test Task'
            )
            expect(titleText).toBeTruthy()

            // Description should not be rendered when empty
            const descriptionTexts = texts.filter(
                (text) => text.getAttribute('data-text') === ''
            )
            expect(descriptionTexts).toHaveLength(0)
        })

        test('StateCard without date does not show date field', () => {
            render(
                <StateCard
                    id="state-1"
                    x={0}
                    y={0}
                    description="Test State"
                    gridSpacing={20}
                    scale={1}
                />
            )

            const texts = screen.getAllByTestId('konva-text')
            const dateText = texts.find((text) =>
                text.getAttribute('data-text')?.includes('📅')
            )
            // Date should not be rendered when not provided
            expect(dateText).toBeFalsy()
        })
    })
})
