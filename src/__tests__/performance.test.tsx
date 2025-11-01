/**
 * Performance Tests
 *
 * These tests validate that performance optimizations are working correctly.
 * They test memoization, caching, and expensive computation optimizations.
 */

import { renderHook, act } from '@testing-library/react'
import { useViewportState } from '../hooks/useViewportState'
import * as canvasService from '../services/canvasService'
import { CanvasData } from '../types'

describe('Performance Optimizations', () => {
    // Performance test thresholds
    const THRESHOLDS = {
        RAPID_READS_MS: 100,
        COORDINATE_UPDATES_MS: 500,
        INVALID_VALUES_MS: 500,
        MEMORY_INCREASE_MB: 5,
        CACHE_MAX_CALLS: 6, // Without caching, we'd have 3 listCanvases calls × 2 localStorage.getItem calls each
        CACHE_TTL_WAIT_MS: 1100, // Slightly longer than the 1000ms cache TTL
    }

    beforeEach(() => {
        localStorage.clear()
    })

    describe('useViewportState memoization', () => {
        it('should not recreate callback functions on state changes', () => {
            const { result, rerender } = renderHook(() => useViewportState())

            // Capture initial callbacks
            const initialUpdatePosition = result.current.updatePosition
            const initialUpdateScale = result.current.updateScale
            const initialSetDragging = result.current.setDragging
            const initialZoomToPoint = result.current.zoomToPoint

            // Change state
            act(() => {
                result.current.updatePosition(100, 100)
            })

            rerender()

            // Callbacks should remain the same (stable references)
            expect(result.current.updatePosition).toBe(initialUpdatePosition)
            expect(result.current.updateScale).toBe(initialUpdateScale)
            expect(result.current.setDragging).toBe(initialSetDragging)
            expect(result.current.zoomToPoint).toBe(initialZoomToPoint)
        })

        it('should update state without recreating callbacks', () => {
            const { result } = renderHook(() => useViewportState())

            const callbacks = {
                updatePosition: result.current.updatePosition,
                updateScale: result.current.updateScale,
                setDragging: result.current.setDragging,
                zoomToPoint: result.current.zoomToPoint,
            }

            // Multiple state updates
            act(() => {
                result.current.updatePosition(50, 50)
                result.current.updateScale(1.5)
                result.current.setDragging(true)
            })

            // All callbacks should still be the same
            expect(result.current.updatePosition).toBe(callbacks.updatePosition)
            expect(result.current.updateScale).toBe(callbacks.updateScale)
            expect(result.current.setDragging).toBe(callbacks.setDragging)
            expect(result.current.zoomToPoint).toBe(callbacks.zoomToPoint)

            // But state should be updated
            expect(result.current.x).toBe(50)
            expect(result.current.y).toBe(50)
            expect(result.current.scale).toBe(1.5)
            expect(result.current.isDragging).toBe(true)
        })
    })

    describe('canvasService caching', () => {
        const mockCanvas: Omit<CanvasData, 'id' | 'createdAt' | 'updatedAt'> = {
            name: 'Test Canvas',
            tasks: [],
            states: [],
            links: [],
        }

        beforeEach(() => {
            // Clear localStorage and the module cache before each test
            localStorage.clear()
            // Force cache invalidation by waiting for TTL or directly accessing service internals
            // We need to ensure the cache is cleared between tests
        })

        it('should cache parsed localStorage data', () => {
            // Ensure cache is clear
            localStorage.clear()

            // Create a canvas
            canvasService.createCanvas(mockCanvas)

            // Spy on localStorage.getItem to count calls
            const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')

            // Call listCanvases multiple times in quick succession
            canvasService.listCanvases()
            canvasService.listCanvases()
            canvasService.listCanvases()

            // Due to caching, we should have fewer getItem calls than list calls
            // The cache should prevent parsing the same data multiple times
            const getItemCalls = getItemSpy.mock.calls.length

            // Clean up
            getItemSpy.mockRestore()
            localStorage.clear()

            // We should have made some calls, but caching should have reduced them
            expect(getItemCalls).toBeGreaterThan(0)
            expect(getItemCalls).toBeLessThan(THRESHOLDS.CACHE_MAX_CALLS)
        })

        it('should invalidate cache on data changes', async () => {
            // Wait for cache to expire from previous test (cache TTL is 1000ms)
            await new Promise((resolve) =>
                setTimeout(resolve, THRESHOLDS.CACHE_TTL_WAIT_MS)
            )

            // Ensure we start clean
            localStorage.clear()

            // Create initial canvas
            const canvas1 = canvasService.createCanvas({
                ...mockCanvas,
                name: 'Canvas 1',
            })

            // Get list (should cache)
            const list1 = canvasService.listCanvases()
            expect(list1.length).toBe(1)

            // Create another canvas (should invalidate cache)
            canvasService.createCanvas({
                ...mockCanvas,
                name: 'Canvas 2',
            })

            // Get list again (should fetch fresh data)
            const list2 = canvasService.listCanvases()
            expect(list2.length).toBe(2)

            // Update canvas (should invalidate cache)
            canvasService.updateCanvas(canvas1.id, {
                ...mockCanvas,
                name: 'Updated Canvas 1',
            })

            // Get specific canvas (should fetch fresh data)
            const updated = canvasService.getCanvas(canvas1.id)
            expect(updated?.name).toBe('Updated Canvas 1')
        })

        it('should handle rapid reads efficiently', () => {
            // Freeze Date.now so the cache never expires during the loop
            const nowSpy = jest.spyOn(Date, 'now')
            let fakeNow = 1_700_000_000_000
            nowSpy.mockImplementation(() => fakeNow)

            // Create test data (uses mocked Date.now for determinism)
            canvasService.createCanvas(mockCanvas)

            const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')

            try {
                // Perform many reads in quick succession while advancing fake time slightly
                for (let i = 0; i < 100; i++) {
                    canvasService.listCanvases()
                    fakeNow += 5 // Keep TTL under 1000ms so cache stays valid
                }

                // With caching we should read the canvas payload exactly once
                const canvasReads = getItemSpy.mock.calls.filter(
                    ([key]) => key === 'tasky_canvases'
                )
                expect(canvasReads).toHaveLength(1)
            } finally {
                getItemSpy.mockRestore()
                nowSpy.mockRestore()
            }
        })
    })

    describe('Validation optimizations', () => {
        it('should validate coordinates efficiently', () => {
            const { result } = renderHook(() => useViewportState())

            const startTime = performance.now()

            // Perform many position updates
            for (let i = 0; i < 1000; i++) {
                act(() => {
                    result.current.updatePosition(i, i)
                })
            }

            const endTime = performance.now()
            const duration = endTime - startTime

            // 1000 updates should complete reasonably fast
            // Note: Threshold may vary by environment
            expect(duration).toBeLessThan(THRESHOLDS.COORDINATE_UPDATES_MS)

            // Final state should be correct
            expect(result.current.x).toBe(999)
            expect(result.current.y).toBe(999)
        })

        it('should handle invalid values efficiently', () => {
            const { result } = renderHook(() => useViewportState())

            const startTime = performance.now()

            // Suppress console warnings for this test
            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

            // Mix valid and invalid updates
            for (let i = 0; i < 500; i++) {
                act(() => {
                    if (i % 2 === 0) {
                        result.current.updatePosition(i, i)
                    } else {
                        // Invalid values will preserve previous state (fallback to prevState)
                        result.current.updatePosition(NaN, Infinity)
                    }
                })
            }

            const endTime = performance.now()
            const duration = endTime - startTime

            consoleSpy.mockRestore()

            // Should still be fast even with validation
            // Note: Threshold may vary by environment
            expect(duration).toBeLessThan(THRESHOLDS.INVALID_VALUES_MS)

            // Last update was invalid (i=499), so it preserved the previous valid state (i=498)
            expect(result.current.x).toBe(498)
            expect(result.current.y).toBe(498)
        })
    })

    describe('Memory efficiency', () => {
        it('should not leak memory with repeated state updates', () => {
            const { result } = renderHook(() => useViewportState())

            // Store initial heap usage (if available)
            const initialMemory =
                (performance as any).memory?.usedJSHeapSize || 0

            // Perform many state updates
            for (let i = 0; i < 10000; i++) {
                act(() => {
                    result.current.updatePosition(i % 1000, i % 1000)
                    result.current.updateScale(1 + (i % 10) / 10)
                    result.current.setDragging(i % 2 === 0)
                })
            }

            // Check final heap usage (if available)
            const finalMemory = (performance as any).memory?.usedJSHeapSize || 0

            // Verify test completed successfully
            expect(result.current).toBeDefined()

            // If memory API is available, verify no significant leak
            // Note: This is environment-dependent and may not be available in all browsers
            const hasMemoryAPI = initialMemory > 0 && finalMemory > 0
            if (hasMemoryAPI) {
                const memoryIncrease = finalMemory - initialMemory
                const memoryIncreaseInMB = memoryIncrease / (1024 * 1024)

                // Memory increase should be minimal
                // eslint-disable-next-line jest/no-conditional-expect
                expect(memoryIncreaseInMB).toBeLessThan(
                    THRESHOLDS.MEMORY_INCREASE_MB
                )
            }
        })
    })

    describe('Callback stability', () => {
        it('should maintain stable callback references across renders', () => {
            const { result, rerender } = renderHook(() => useViewportState())

            const callbackRefs = new Set()

            // Collect callback references across multiple re-renders
            for (let i = 0; i < 10; i++) {
                callbackRefs.add(result.current.updatePosition)
                callbackRefs.add(result.current.updateScale)
                callbackRefs.add(result.current.setDragging)
                callbackRefs.add(result.current.zoomToPoint)

                act(() => {
                    result.current.updatePosition(i * 10, i * 10)
                })

                rerender()
            }

            // Should have exactly 4 unique references (one for each callback)
            expect(callbackRefs.size).toBe(4)
        })
    })
})
