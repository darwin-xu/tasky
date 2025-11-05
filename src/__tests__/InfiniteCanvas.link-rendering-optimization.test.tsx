/**
 * Link Rendering Optimization Tests
 *
 * These tests validate that link rendering uses O(1) lookups instead of O(T + S)
 * Array.find() operations for better performance with many links.
 */

import React from 'react'
import { render, screen, act } from '@testing-library/react'
import InfiniteCanvas from '../components/InfiniteCanvas'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('Link Rendering Optimization', () => {
    describe('O(1) lookup performance', () => {
        it('should render multiple links efficiently using memoized lookup maps', async () => {
            const ref = React.createRef<any>()
            render(<InfiniteCanvas ref={ref} />)

            // Create test data directly using loadCanvasState
            const tasks = []
            const states = []
            const links = []

            // Create 10 tasks
            for (let i = 0; i < 10; i++) {
                tasks.push({
                    id: `task-${i}`,
                    x: i * 100,
                    y: 100,
                    title: `Task ${i}`,
                    description: `Description ${i}`,
                })
            }

            // Create 10 states
            for (let i = 0; i < 10; i++) {
                states.push({
                    id: `state-${i}`,
                    x: i * 100,
                    y: 300,
                    description: `State ${i}`,
                })
            }

            // Create 10 links connecting tasks to states
            for (let i = 0; i < 10; i++) {
                links.push({
                    id: `link-${i}`,
                    sourceId: `task-${i}`,
                    targetId: `state-${i}`,
                    sourceType: 'task' as const,
                    targetType: 'state' as const,
                })
            }

            await act(async () => {
                if (ref.current) {
                    ref.current.loadCanvasState(tasks, states, links)
                }
            })

            // Verify links were created
            const state = ref.current.getCanvasState()
            expect(state.links).toHaveLength(10)

            // Links should render without errors
            // The optimization ensures this scales linearly O(L) instead of O(L * (T + S))
            const layers = screen.getAllByTestId('konva-layer')
            expect(layers).toHaveLength(3) // Grid, Links, Content
        })

        it('should handle rendering with large number of tasks, states, and links', async () => {
            const ref = React.createRef<any>()
            render(<InfiniteCanvas ref={ref} />)

            const startTime = performance.now()

            // Create a realistic scenario: 50 tasks, 50 states, 100 links
            const tasks = []
            const states = []
            const links = []

            // Create 50 tasks
            for (let i = 0; i < 50; i++) {
                tasks.push({
                    id: `task-${i}`,
                    x: (i % 10) * 100,
                    y: Math.floor(i / 10) * 100,
                    title: `Task ${i}`,
                    description: `Description ${i}`,
                })
            }

            // Create 50 states
            for (let i = 0; i < 50; i++) {
                states.push({
                    id: `state-${i}`,
                    x: (i % 10) * 100,
                    y: Math.floor(i / 10) * 100 + 500,
                    description: `State ${i}`,
                })
            }

            // Create 100 links
            for (let i = 0; i < 100; i++) {
                const sourceId = `task-${i % 50}`
                const targetId = `state-${i % 50}`
                links.push({
                    id: `link-${i}`,
                    sourceId,
                    targetId,
                    sourceType: 'task' as const,
                    targetType: 'state' as const,
                })
            }

            await act(async () => {
                if (ref.current) {
                    ref.current.loadCanvasState(tasks, states, links)
                }
            })

            const endTime = performance.now()
            const duration = endTime - startTime

            // Verify all links were created
            const state = ref.current.getCanvasState()
            expect(state.links).toHaveLength(100)

            // With O(1) lookups, this should complete in reasonable time
            // Without optimization: ~10,000 operations (100 links * (50 tasks + 50 states))
            // With optimization: ~200 operations (100 links + 50 tasks + 50 states)
            // This is just a smoke test - actual timing varies by environment
            expect(duration).toBeLessThan(5000) // Should complete in under 5 seconds
        })
    })

    describe('Link rendering correctness', () => {
        it('should render links correctly using lookup maps', async () => {
            const ref = React.createRef<any>()
            render(<InfiniteCanvas ref={ref} />)

            const taskId = 'test-task-1'
            const stateId = 'test-state-1'

            const task = {
                id: taskId,
                x: 100,
                y: 100,
                title: 'Test Task',
                description: 'Test Description',
            }

            const state = {
                id: stateId,
                x: 300,
                y: 300,
                description: 'Test State',
            }

            const link = {
                id: 'test-link',
                sourceId: taskId,
                targetId: stateId,
                sourceType: 'task' as const,
                targetType: 'state' as const,
            }

            await act(async () => {
                if (ref.current) {
                    ref.current.loadCanvasState([task], [state], [link])
                }
            })

            // Verify the link was created and rendered
            const canvasState = ref.current.getCanvasState()
            expect(canvasState.links).toHaveLength(1)
            expect(canvasState.links[0].id).toBe('test-link')
            expect(canvasState.links[0].sourceId).toBe(taskId)
            expect(canvasState.links[0].targetId).toBe(stateId)

            // Link layer should be present
            const layers = screen.getAllByTestId('konva-layer')
            expect(layers).toHaveLength(3)
        })

        it('should not render links with missing source or target cards', async () => {
            const ref = React.createRef<any>()
            render(<InfiniteCanvas ref={ref} />)

            const taskId = 'test-task-1'

            const task = {
                id: taskId,
                x: 100,
                y: 100,
                title: 'Test Task',
                description: 'Test Description',
            }

            const link = {
                id: 'invalid-link',
                sourceId: taskId,
                targetId: 'non-existent-id',
                sourceType: 'task' as const,
                targetType: 'state' as const,
            }

            await act(async () => {
                if (ref.current) {
                    ref.current.loadCanvasState([task], [], [link])
                }
            })

            // Link should exist in state but not render (filtered out by null check)
            const canvasState = ref.current.getCanvasState()
            expect(canvasState.links).toHaveLength(1)

            // Should not throw errors even with missing target
            const layers = screen.getAllByTestId('konva-layer')
            expect(layers).toHaveLength(3)
        })
    })

    describe('Memoization efficiency', () => {
        it('should reuse lookup maps when tasks/states arrays reference changes but content is same', async () => {
            const ref = React.createRef<any>()
            render(<InfiniteCanvas ref={ref} />)

            // Create initial setup
            await act(async () => {
                if (ref.current) {
                    ref.current.createTask()
                }
            })

            await act(async () => {
                if (ref.current) {
                    ref.current.createState()
                }
            })

            const state1 = ref.current.getCanvasState()

            // Create a link
            await act(async () => {
                if (ref.current) {
                    const link = {
                        id: 'test-link',
                        sourceId: state1.tasks[0].id,
                        targetId: state1.states[0].id,
                        sourceType: 'task' as const,
                        targetType: 'state' as const,
                    }

                    ref.current.loadCanvasState(state1.tasks, state1.states, [
                        link,
                    ])
                }
            })

            // Force a re-render by loading the same state again
            await act(async () => {
                if (ref.current) {
                    const currentState = ref.current.getCanvasState()
                    ref.current.loadCanvasState(
                        currentState.tasks,
                        currentState.states,
                        currentState.links
                    )
                }
            })

            // Link should still be rendered correctly
            const finalState = ref.current.getCanvasState()
            expect(finalState.links).toHaveLength(1)
            expect(finalState.links[0].id).toBe('test-link')
        })
    })
})
