import React from 'react'
import { render, screen } from '@testing-library/react'
import TaskCard from '../components/TaskCard'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('TaskCard Component', () => {
    test('renders with correct initial position', () => {
        render(
            <TaskCard
                id="test-task"
                x={100}
                y={100}
                title="Test Task"
                gridSpacing={20}
                scale={1}
            />
        )

        const group = screen.getByTestId('konva-group')
        expect(group).toBeTruthy()
        expect(group.getAttribute('data-x')).toBe('100')
        expect(group.getAttribute('data-y')).toBe('100')
    })

    test('has draggable property', () => {
        render(
            <TaskCard
                id="test-task"
                x={0}
                y={0}
                title="Test Task"
                gridSpacing={20}
                scale={1}
            />
        )

        const group = screen.getByTestId('konva-group')
        expect(group.getAttribute('draggable')).toBe('true')
    })

    test('renders title text', () => {
        render(
            <TaskCard
                id="test-task"
                x={0}
                y={0}
                title="My Test Task"
                gridSpacing={20}
                scale={1}
            />
        )

        const texts = screen.getAllByTestId('konva-text')
        const titleText = texts.find(
            (text) => text.getAttribute('data-text') === 'My Test Task'
        )
        expect(titleText).toBeTruthy()
    })

    test('renders with description', () => {
        render(
            <TaskCard
                id="test-task"
                x={0}
                y={0}
                title="Test Task"
                description="Task description"
                gridSpacing={20}
                scale={1}
            />
        )

        const texts = screen.getAllByTestId('konva-text')
        const descriptionText = texts.find(
            (text) => text.getAttribute('data-text') === 'Task description'
        )
        expect(descriptionText).toBeTruthy()
    })

    test('renders with date', () => {
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
            text.getAttribute('data-text')?.includes('2024-01-15')
        )
        expect(dateText).toBeTruthy()
    })

    test('renders with priority', () => {
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
    })

    test('respects custom dimensions', () => {
        render(
            <TaskCard
                id="test-task"
                x={0}
                y={0}
                width={250}
                height={180}
                title="Test Task"
                gridSpacing={20}
                scale={1}
            />
        )

        const rects = screen.getAllByTestId('konva-rect')
        // Find the main card background rect (should be the second one after priority bar)
        const mainRect = rects.find(
            (rect) =>
                rect.getAttribute('data-width') === '250' &&
                rect.getAttribute('data-height') === '180'
        )
        expect(mainRect).toBeTruthy()
    })

    test('supports selection state', () => {
        render(
            <TaskCard
                id="test-task"
                x={0}
                y={0}
                title="Test Task"
                gridSpacing={20}
                scale={1}
                isSelected={true}
            />
        )

        const group = screen.getByTestId('konva-group')
        expect(group).toBeTruthy()
    })

    test('onClick callback is provided', () => {
        const onClick = jest.fn()

        render(
            <TaskCard
                id="test-task"
                x={0}
                y={0}
                title="Test Task"
                gridSpacing={20}
                scale={1}
                onClick={onClick}
            />
        )

        const group = screen.getByTestId('konva-group')
        expect(group).toBeTruthy()
        expect(onClick).not.toHaveBeenCalled()
    })

    test('onPositionChange callback is provided', () => {
        const onPositionChange = jest.fn()

        render(
            <TaskCard
                id="test-task"
                x={0}
                y={0}
                title="Test Task"
                gridSpacing={20}
                scale={1}
                onPositionChange={onPositionChange}
            />
        )

        const group = screen.getByTestId('konva-group')
        expect(group).toBeTruthy()
        expect(onPositionChange).not.toHaveBeenCalled()
    })

    test('renders delete button when selected and onDelete is provided', () => {
        const onDelete = jest.fn()

        render(
            <TaskCard
                id="test-task"
                x={0}
                y={0}
                title="Test Task"
                gridSpacing={20}
                scale={1}
                isSelected={true}
                onDelete={onDelete}
            />
        )

        const texts = screen.getAllByTestId('konva-text')
        const deleteButton = texts.find(
            (text) => text.getAttribute('data-text') === '✕'
        )
        expect(deleteButton).toBeTruthy()
    })

    test('does not render delete button when not selected', () => {
        const onDelete = jest.fn()

        render(
            <TaskCard
                id="test-task"
                x={0}
                y={0}
                title="Test Task"
                gridSpacing={20}
                scale={1}
                isSelected={false}
                onDelete={onDelete}
            />
        )

        const texts = screen.getAllByTestId('konva-text')
        const deleteButton = texts.find(
            (text) => text.getAttribute('data-text') === '✕'
        )
        expect(deleteButton).toBeFalsy()
    })

    test('does not render delete button when onDelete is not provided', () => {
        render(
            <TaskCard
                id="test-task"
                x={0}
                y={0}
                title="Test Task"
                gridSpacing={20}
                scale={1}
                isSelected={true}
            />
        )

        const texts = screen.getAllByTestId('konva-text')
        const deleteButton = texts.find(
            (text) => text.getAttribute('data-text') === '✕'
        )
        expect(deleteButton).toBeFalsy()
    })

    test('onDelete callback is provided', () => {
        const onDelete = jest.fn()

        render(
            <TaskCard
                id="test-task"
                x={0}
                y={0}
                title="Test Task"
                gridSpacing={20}
                scale={1}
                isSelected={true}
                onDelete={onDelete}
            />
        )

        const group = screen.getByTestId('konva-group')
        expect(group).toBeTruthy()
        expect(onDelete).not.toHaveBeenCalled()
    })
})
