import { renderHook, act } from '@testing-library/react'
import { useViewportState } from '../hooks/useViewportState'

describe('useViewportState Hook', () => {
    test('TC2.1: Initial State Values (Positive Case)', () => {
        const { result } = renderHook(() => useViewportState())

        expect(result.current.x).toBe(0)
        expect(result.current.y).toBe(0)
        expect(result.current.scale).toBe(1.0)
        expect(result.current.isDragging).toBe(false)
    })

    test('TC2.2: Position Update Functionality (Positive Case)', () => {
        const { result } = renderHook(() => useViewportState())

        act(() => {
            result.current.updatePosition(100, -50)
        })

        expect(result.current.x).toBe(100)
        expect(result.current.y).toBe(-50)
        expect(result.current.scale).toBe(1.0)
        expect(result.current.isDragging).toBe(false)
    })

    test('TC2.3: Scale Validation - Valid Range (Positive Case)', () => {
        const { result } = renderHook(() => useViewportState())

        // Test valid scale values
        act(() => {
            result.current.updateScale(0.5)
        })
        expect(result.current.scale).toBe(0.5)

        act(() => {
            result.current.updateScale(2.0)
        })
        expect(result.current.scale).toBe(2.0)

        act(() => {
            result.current.updateScale(0.1)
        })
        expect(result.current.scale).toBe(0.1)

        act(() => {
            result.current.updateScale(10.0)
        })
        expect(result.current.scale).toBe(10.0)
    })

    test('TC2.4: Scale Validation - Invalid Range (Negative Case)', () => {
        const { result } = renderHook(() => useViewportState())
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        // Test below minimum
        act(() => {
            result.current.updateScale(0.05)
        })
        expect(result.current.scale).toBe(0.1) // Should be clamped to minimum

        // Test above maximum
        act(() => {
            result.current.updateScale(15.0)
        })
        expect(result.current.scale).toBe(10.0) // Should be clamped to maximum

        // Test invalid values
        act(() => {
            result.current.updateScale(0)
        })
        expect(result.current.scale).toBe(1.0) // Should fallback to default

        act(() => {
            result.current.updateScale(-1)
        })
        expect(result.current.scale).toBe(1.0) // Should fallback to default

        consoleSpy.mockRestore()
    })

    test('TC2.5: Dragging State Management (Positive Case)', () => {
        const { result } = renderHook(() => useViewportState())

        act(() => {
            result.current.setDragging(true)
        })
        expect(result.current.isDragging).toBe(true)

        act(() => {
            result.current.setDragging(false)
        })
        expect(result.current.isDragging).toBe(false)
    })

    test('TC2.6: Large Coordinate Values (Stress Test)', () => {
        const { result } = renderHook(() => useViewportState())

        // Test large positive coordinates
        act(() => {
            result.current.updatePosition(1000000, 1000000)
        })
        expect(result.current.x).toBe(1000000)
        expect(result.current.y).toBe(1000000)

        // Test large negative coordinates
        act(() => {
            result.current.updatePosition(-1000000, -1000000)
        })
        expect(result.current.x).toBe(-1000000)
        expect(result.current.y).toBe(-1000000)
    })

    test('TC4.6: Invalid Coordinate Handling (Negative Case)', () => {
        const { result } = renderHook(() => useViewportState())
        const consoleSpy = jest.spyOn(console, 'warn').mockImplementation()

        // Test NaN coordinates
        act(() => {
            result.current.updatePosition(NaN, NaN)
        })
        expect(result.current.x).toBe(0) // Should fallback to original value
        expect(result.current.y).toBe(0)

        // Test Infinity coordinates
        act(() => {
            result.current.updatePosition(Infinity, -Infinity)
        })
        expect(result.current.x).toBe(0) // Should fallback to original value
        expect(result.current.y).toBe(0)

        expect(consoleSpy).toHaveBeenCalled()
        consoleSpy.mockRestore()
    })

    test('TC2.7: Zoom to Point - Zoom In (Positive Case)', () => {
        const { result } = renderHook(() => useViewportState())

        // Start at position (0, 0) with scale 1.0
        // Zoom to point (400, 300) with new scale 2.0
        act(() => {
            result.current.zoomToPoint({ x: 400, y: 300 }, 2.0)
        })

        // At scale 1.0, point (400, 300) in screen space is at world position (400, 300)
        // At scale 2.0, to keep the same world position visible at (400, 300) screen position:
        // newX = 400 - 400 * 2.0 = 400 - 800 = -400
        // newY = 300 - 300 * 2.0 = 300 - 600 = -300
        expect(result.current.x).toBe(-400)
        expect(result.current.y).toBe(-300)
        expect(result.current.scale).toBe(2.0)
    })

    test('TC2.8: Zoom to Point - Zoom Out (Positive Case)', () => {
        const { result } = renderHook(() => useViewportState())

        // Start at position (0, 0) with scale 1.0
        // Zoom to point (200, 150) with new scale 0.5
        act(() => {
            result.current.zoomToPoint({ x: 200, y: 150 }, 0.5)
        })

        // At scale 1.0, point (200, 150) in screen space is at world position (200, 150)
        // At scale 0.5, to keep the same world position visible at (200, 150) screen position:
        // newX = 200 - 200 * 0.5 = 200 - 100 = 100
        // newY = 150 - 150 * 0.5 = 150 - 75 = 75
        expect(result.current.x).toBe(100)
        expect(result.current.y).toBe(75)
        expect(result.current.scale).toBe(0.5)
    })

    test('TC2.9: Zoom to Point - Respects Scale Limits (Negative Case)', () => {
        const { result } = renderHook(() => useViewportState())

        // Try to zoom beyond maximum
        act(() => {
            result.current.zoomToPoint({ x: 100, y: 100 }, 15.0)
        })

        expect(result.current.scale).toBe(10.0) // Should be clamped to maximum

        // Try to zoom below minimum
        act(() => {
            result.current.zoomToPoint({ x: 100, y: 100 }, 0.05)
        })

        expect(result.current.scale).toBe(0.1) // Should be clamped to minimum
    })

    test('TC2.10: Zoom to Point - From Non-Zero Position (Positive Case)', () => {
        const { result } = renderHook(() => useViewportState())

        // First, set a non-zero position
        act(() => {
            result.current.updatePosition(100, 50)
        })

        // Now zoom to point (300, 200) with scale 2.0
        act(() => {
            result.current.zoomToPoint({ x: 300, y: 200 }, 2.0)
        })

        // At scale 1.0 with viewport at (100, 50), point (300, 200) in screen space
        // is at world position (300 - 100) / 1.0 = 200, (200 - 50) / 1.0 = 150
        // At scale 2.0, to keep world position (200, 150) visible at (300, 200):
        // newX = 300 - 200 * 2.0 = 300 - 400 = -100
        // newY = 200 - 150 * 2.0 = 200 - 300 = -100
        expect(result.current.x).toBe(-100)
        expect(result.current.y).toBe(-100)
        expect(result.current.scale).toBe(2.0)
    })
})
