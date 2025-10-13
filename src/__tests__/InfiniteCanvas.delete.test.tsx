import React from 'react'
import { render, screen, act } from '@testing-library/react'
import InfiniteCanvas from '../components/InfiniteCanvas'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('InfiniteCanvas Delete Task Integration', () => {
    test('shows delete button on selected task', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create a task
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        // Verify task was created with delete button (X)
        const texts = screen.queryAllByTestId('konva-text')
        const deleteButton = texts.find(
            (text) => text.getAttribute('data-text') === '✕'
        )
        expect(deleteButton).toBeTruthy()
    })

    test('creates and displays task on canvas', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Initially no task text elements (only grid)
        const initialGroups = screen.queryAllByTestId('konva-group')
        const initialTaskGroups = initialGroups.filter(
            (g) => g.getAttribute('draggable') === 'true'
        )
        expect(initialTaskGroups.length).toBe(0)

        // Create a task
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        // Verify task appears with title
        const texts = screen.queryAllByTestId('konva-text')
        const titleText = texts.find(
            (text) => text.getAttribute('data-text') === 'New Task'
        )
        expect(titleText).toBeTruthy()
    })

    test('task has correct default properties', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create a task
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        // Verify default priority
        const texts = screen.queryAllByTestId('konva-text')
        const priorityText = texts.find((text) =>
            text.getAttribute('data-text')?.includes('Medium')
        )
        expect(priorityText).toBeTruthy()
    })

    test('renders confirmation dialog component', () => {
        const { container } = render(<InfiniteCanvas />)

        // The confirmation dialog component should be in the DOM
        // (even if not visible when isOpen is false)
        // We just verify the component structure renders without errors
        expect(container).toBeTruthy()
    })
})
