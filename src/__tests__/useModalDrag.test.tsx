import { renderHook, act } from '@testing-library/react'
import { useModalDrag } from '../hooks/useModalDrag'

// Helper to create a mock mouse event with proper target
const createMouseEvent = (
    type: string,
    target: HTMLElement,
    clientX: number,
    clientY: number
) => {
    const event = {
        type,
        target,
        currentTarget: target,
        clientX,
        clientY,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        bubbles: true,
    } as any
    return event
}

describe('useModalDrag', () => {
    test('initializes with position at origin', () => {
        const { result } = renderHook(() => useModalDrag())

        expect(result.current.position).toEqual({ x: 0, y: 0 })
        expect(result.current.isDragging).toBe(false)
    })

    test('resets position when resetPosition is called', () => {
        const { result } = renderHook(() => useModalDrag())

        // Manually set position (simulating a drag)
        const div = document.createElement('div')
        act(() => {
            const mouseDownEvent = createMouseEvent('mousedown', div, 100, 100)
            result.current.handleDragStart(mouseDownEvent)
        })

        act(() => {
            const mouseMoveEvent = new MouseEvent('mousemove', {
                bubbles: true,
                clientX: 150,
                clientY: 150,
            })
            document.dispatchEvent(mouseMoveEvent)
        })

        // Position should have changed
        expect(result.current.position.x).toBeGreaterThan(0)

        // Reset position
        act(() => {
            result.current.resetPosition()
        })

        expect(result.current.position).toEqual({ x: 0, y: 0 })
    })

    test('does not start drag when clicking on INPUT element', () => {
        const { result } = renderHook(() => useModalDrag())

        const input = document.createElement('input')
        const mouseDownEvent = createMouseEvent('mousedown', input, 100, 100)

        act(() => {
            result.current.handleDragStart(mouseDownEvent)
        })

        expect(result.current.isDragging).toBe(false)
    })

    test('does not start drag when clicking on TEXTAREA element', () => {
        const { result } = renderHook(() => useModalDrag())

        const textarea = document.createElement('textarea')
        const mouseDownEvent = createMouseEvent('mousedown', textarea, 100, 100)

        act(() => {
            result.current.handleDragStart(mouseDownEvent)
        })

        expect(result.current.isDragging).toBe(false)
    })

    test('does not start drag when clicking on BUTTON element', () => {
        const { result } = renderHook(() => useModalDrag())

        const button = document.createElement('button')
        const mouseDownEvent = createMouseEvent('mousedown', button, 100, 100)

        act(() => {
            result.current.handleDragStart(mouseDownEvent)
        })

        expect(result.current.isDragging).toBe(false)
    })

    test('does not start drag when clicking on SELECT element', () => {
        const { result } = renderHook(() => useModalDrag())

        const select = document.createElement('select')
        const mouseDownEvent = createMouseEvent('mousedown', select, 100, 100)

        act(() => {
            result.current.handleDragStart(mouseDownEvent)
        })

        expect(result.current.isDragging).toBe(false)
    })

    test('starts drag when clicking on non-form elements', () => {
        const { result } = renderHook(() => useModalDrag())

        const div = document.createElement('div')
        const mouseDownEvent = createMouseEvent('mousedown', div, 100, 100)

        act(() => {
            result.current.handleDragStart(mouseDownEvent)
        })

        expect(result.current.isDragging).toBe(true)
        expect(mouseDownEvent.preventDefault).toHaveBeenCalled()
    })

    test('updates position during drag', () => {
        const { result } = renderHook(() => useModalDrag())

        // Start drag
        const div = document.createElement('div')
        const mouseDownEvent = createMouseEvent('mousedown', div, 100, 100)

        act(() => {
            result.current.handleDragStart(mouseDownEvent)
        })

        // Simulate mouse move
        act(() => {
            const mouseMoveEvent = new MouseEvent('mousemove', {
                bubbles: true,
                clientX: 150,
                clientY: 200,
            })
            document.dispatchEvent(mouseMoveEvent)
        })

        // Position should be updated
        expect(result.current.position.x).toBe(50) // 150 - 100
        expect(result.current.position.y).toBe(100) // 200 - 100
    })

    test('stops dragging on mouse up', () => {
        const { result } = renderHook(() => useModalDrag())

        // Start drag
        const div = document.createElement('div')
        const mouseDownEvent = createMouseEvent('mousedown', div, 100, 100)

        act(() => {
            result.current.handleDragStart(mouseDownEvent)
        })

        expect(result.current.isDragging).toBe(true)

        // Simulate mouse up
        act(() => {
            const mouseUpEvent = new MouseEvent('mouseup', {
                bubbles: true,
            })
            document.dispatchEvent(mouseUpEvent)
        })

        expect(result.current.isDragging).toBe(false)
    })

    test('does not start drag when clicking inside a form element nested in div', () => {
        const { result } = renderHook(() => useModalDrag())

        const div = document.createElement('div')
        const input = document.createElement('input')
        div.appendChild(input)

        const mouseDownEvent = createMouseEvent('mousedown', input, 100, 100)

        act(() => {
            result.current.handleDragStart(mouseDownEvent)
        })

        expect(result.current.isDragging).toBe(false)
    })
})
