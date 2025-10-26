import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import InfiniteCanvas, { InfiniteCanvasRef } from '../components/InfiniteCanvas'

// Mock react-konva
jest.mock('react-konva', () => require('../testUtils/mockKonva'))

describe('InfiniteCanvas - Dirty State Tracking', () => {
    let canvasRef: React.RefObject<InfiniteCanvasRef>

    beforeEach(() => {
        canvasRef = React.createRef()
    })

    test('canvas is not dirty initially', () => {
        render(<InfiniteCanvas ref={canvasRef} />)
        expect(canvasRef.current?.isDirty()).toBe(false)
    })

    test('canvas becomes dirty after creating a task', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)
        expect(canvasRef.current?.isDirty()).toBe(false)

        act(() => {
            canvasRef.current?.createTask()
        })
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })
    })

    test('canvas becomes dirty after creating a state', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)
        expect(canvasRef.current?.isDirty()).toBe(false)

        act(() => {
            canvasRef.current?.createState()
        })
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })
    })

    test('canvas becomes dirty after duplicating a task', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a task first
        act(() => {
            canvasRef.current?.createTask()
        })
        await waitFor(() => {
            const state = canvasRef.current?.getCanvasState()
            expect(state?.tasks.length).toBe(1)
        })

        const state = canvasRef.current?.getCanvasState()
        const taskId = state?.tasks[0]?.id
        expect(taskId).toBeDefined()

        // Mark clean
        act(() => {
            canvasRef.current?.markClean()
        })
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(false)
        })

        // Duplicate the task
        act(() => {
            canvasRef.current?.duplicateTask(taskId!)
        })
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })
    })

    test('canvas becomes dirty after duplicating a state', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state first
        act(() => {
            canvasRef.current?.createState()
        })
        await waitFor(() => {
            const canvasState = canvasRef.current?.getCanvasState()
            expect(canvasState?.states.length).toBe(1)
        })

        const canvasState = canvasRef.current?.getCanvasState()
        const stateId = canvasState?.states[0]?.id
        expect(stateId).toBeDefined()

        // Mark clean
        act(() => {
            canvasRef.current?.markClean()
        })
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(false)
        })

        // Duplicate the state
        act(() => {
            canvasRef.current?.duplicateState(stateId!)
        })
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })
    })

    test('canvas becomes dirty after forking a state', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state first
        act(() => {
            canvasRef.current?.createState()
        })
        await waitFor(() => {
            const canvasState = canvasRef.current?.getCanvasState()
            expect(canvasState?.states.length).toBe(1)
        })

        const canvasState = canvasRef.current?.getCanvasState()
        const stateId = canvasState?.states[0]?.id
        expect(stateId).toBeDefined()

        // Mark clean
        act(() => {
            canvasRef.current?.markClean()
        })
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(false)
        })

        // Fork the state
        act(() => {
            canvasRef.current?.forkState(stateId!)
        })
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })
    })

    test('markClean resets dirty state', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a task to make it dirty
        act(() => {
            canvasRef.current?.createTask()
        })
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })

        // Mark as clean
        act(() => {
            canvasRef.current?.markClean()
        })
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(false)
        })
    })

    test('loadCanvasState resets dirty state', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a task to make it dirty
        act(() => {
            canvasRef.current?.createTask()
        })
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })

        // Load a canvas state
        act(() => {
            canvasRef.current?.loadCanvasState([], [], [])
        })
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(false)
        })
    })
})
