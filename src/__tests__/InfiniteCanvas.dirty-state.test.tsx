import React from 'react'
import { render, waitFor } from '@testing-library/react'
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

        canvasRef.current?.createTask()
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })
    })

    test('canvas becomes dirty after creating a state', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)
        expect(canvasRef.current?.isDirty()).toBe(false)

        canvasRef.current?.createState()
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })
    })

    test('canvas becomes dirty after duplicating a task', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a task first
        canvasRef.current?.createTask()
        await waitFor(() => {
            const state = canvasRef.current?.getCanvasState()
            expect(state?.tasks.length).toBe(1)
        })

        const state = canvasRef.current?.getCanvasState()
        const taskId = state?.tasks[0]?.id
        expect(taskId).toBeDefined()

        // Mark clean
        canvasRef.current?.markClean()
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(false)
        })

        // Duplicate the task
        canvasRef.current?.duplicateTask(taskId!)
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })
    })

    test('canvas becomes dirty after duplicating a state', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state first
        canvasRef.current?.createState()
        await waitFor(() => {
            const canvasState = canvasRef.current?.getCanvasState()
            expect(canvasState?.states.length).toBe(1)
        })

        const canvasState = canvasRef.current?.getCanvasState()
        const stateId = canvasState?.states[0]?.id
        expect(stateId).toBeDefined()

        // Mark clean
        canvasRef.current?.markClean()
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(false)
        })

        // Duplicate the state
        canvasRef.current?.duplicateState(stateId!)
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })
    })

    test('canvas becomes dirty after forking a state', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state first
        canvasRef.current?.createState()
        await waitFor(() => {
            const canvasState = canvasRef.current?.getCanvasState()
            expect(canvasState?.states.length).toBe(1)
        })

        const canvasState = canvasRef.current?.getCanvasState()
        const stateId = canvasState?.states[0]?.id
        expect(stateId).toBeDefined()

        // Mark clean
        canvasRef.current?.markClean()
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(false)
        })

        // Fork the state
        canvasRef.current?.forkState(stateId!)
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })
    })

    test('markClean resets dirty state', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a task to make it dirty
        canvasRef.current?.createTask()
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })

        // Mark as clean
        canvasRef.current?.markClean()
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(false)
        })
    })

    test('loadCanvasState resets dirty state', async () => {
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a task to make it dirty
        canvasRef.current?.createTask()
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(true)
        })

        // Load a canvas state
        canvasRef.current?.loadCanvasState([], [], [])
        await waitFor(() => {
            expect(canvasRef.current?.isDirty()).toBe(false)
        })
    })
})
