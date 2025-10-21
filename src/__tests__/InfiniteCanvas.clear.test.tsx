/* eslint-disable testing-library/prefer-screen-queries */
import React from 'react'
import { render, screen, act } from '@testing-library/react'
import InfiniteCanvas, { InfiniteCanvasRef } from '../components/InfiniteCanvas'

// Mock Konva for testing environment
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

jest.mock('konva/lib/Node', () => ({
    KonvaEventObject: {},
}))

jest.mock('konva', () => ({
    default: {},
}))

describe('InfiniteCanvas - Clear Canvas', () => {
    test('clearCanvas removes all tasks', async () => {
        const ref = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={ref} />)

        // Create some tasks
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
                ref.current.createTask()
                ref.current.createTask()
            }
        })

        // Verify tasks exist by checking for task title text
        const texts = screen.queryAllByTestId('konva-text')
        const taskTitles = texts.filter(
            (text) => text.getAttribute('data-text') === 'New Task'
        )
        expect(taskTitles.length).toBe(3)

        // Clear canvas
        await act(async () => {
            if (ref.current) {
                ref.current.clearCanvas()
            }
        })

        // Verify tasks are removed
        const textsAfterClear = screen.queryAllByTestId('konva-text')
        const taskTitlesAfterClear = textsAfterClear.filter(
            (text) => text.getAttribute('data-text') === 'New Task'
        )
        expect(taskTitlesAfterClear.length).toBe(0)
    })

    test('clearCanvas removes all states', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create some states
        await act(async () => {
            if (ref.current) {
                ref.current.createState()
                ref.current.createState()
            }
        })

        // Verify states exist by checking for state description text
        const texts = screen.queryAllByTestId('konva-text')
        const stateDescriptions = texts.filter(
            (text) => text.getAttribute('data-text') === 'New State'
        )
        expect(stateDescriptions.length).toBe(2)

        // Clear canvas
        await act(async () => {
            if (ref.current) {
                ref.current.clearCanvas()
            }
        })

        // Verify states are removed
        const textsAfterClear = screen.queryAllByTestId('konva-text')
        const stateDescriptionsAfterClear = textsAfterClear.filter(
            (text) => text.getAttribute('data-text') === 'New State'
        )
        expect(stateDescriptionsAfterClear.length).toBe(0)
    })

    test('clearCanvas removes all tasks and states together', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create tasks and states
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
                ref.current.createState()
                ref.current.createTask()
                ref.current.createState()
            }
        })

        // Verify both exist
        const texts = screen.queryAllByTestId('konva-text')
        const taskTitles = texts.filter(
            (text) => text.getAttribute('data-text') === 'New Task'
        )
        const stateDescriptions = texts.filter(
            (text) => text.getAttribute('data-text') === 'New State'
        )
        expect(taskTitles.length).toBe(2)
        expect(stateDescriptions.length).toBe(2)

        // Clear canvas
        await act(async () => {
            if (ref.current) {
                ref.current.clearCanvas()
            }
        })

        // Verify all are removed
        const textsAfterClear = screen.queryAllByTestId('konva-text')
        const taskTitlesAfterClear = textsAfterClear.filter(
            (text) => text.getAttribute('data-text') === 'New Task'
        )
        const stateDescriptionsAfterClear = textsAfterClear.filter(
            (text) => text.getAttribute('data-text') === 'New State'
        )
        expect(taskTitlesAfterClear.length).toBe(0)
        expect(stateDescriptionsAfterClear.length).toBe(0)
    })

    test('clearCanvas can be called on an empty canvas', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Clear empty canvas should not throw error
        await act(async () => {
            expect(() => {
                if (ref.current) {
                    ref.current.clearCanvas()
                }
            }).not.toThrow()
        })
    })

    test('clearCanvas can be called multiple times', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create some tasks
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
                ref.current.createTask()
            }
        })

        // Clear multiple times
        await act(async () => {
            if (ref.current) {
                ref.current.clearCanvas()
                ref.current.clearCanvas()
            }
        })

        // Verify still works correctly
        const textsAfterClear = screen.queryAllByTestId('konva-text')
        const taskTitlesAfterClear = textsAfterClear.filter(
            (text) => text.getAttribute('data-text') === 'New Task'
        )
        expect(taskTitlesAfterClear.length).toBe(0)
    })
})
