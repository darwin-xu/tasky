/* eslint-disable testing-library/prefer-screen-queries, testing-library/no-unnecessary-act, testing-library/no-container, testing-library/no-node-access */
import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react'
import InfiniteCanvas from '../components/InfiniteCanvas'

// Mock Konva for testing environment
jest.mock('react-konva', () =>
    jest.requireActual('../testUtils/mockKonva')
)

jest.mock('konva/lib/Node', () => ({
    KonvaEventObject: {},
}))

jest.mock('konva', () => ({
    default: {},
}))

// Mock getPointerPosition for mouse events
// (this variable is for test organization but not used in mock anymore)
describe('InfiniteCanvas Component', () => {
    beforeEach(() => {
        // Reset any test state if needed
    })
    test('TC1.1: Component Initialization (Positive Case)', () => {
        const container = document.createElement('div')
        container.style.width = '800px'
        container.style.height = '600px'
        document.body.appendChild(container)

        const { getByTestId, getAllByTestId } = render(<InfiniteCanvas />, {
            container,
        })

        // Component renders without throwing errors
        const stage = getByTestId('konva-stage')
        expect(stage).toBeInTheDocument()

        const layers = getAllByTestId('konva-layer')
        expect(layers).toHaveLength(2) // Grid layer and content layer
        expect(layers[0]).toBeInTheDocument() // Grid layer
        expect(layers[1]).toBeInTheDocument() // Content layer

        // Clean up
        document.body.removeChild(container)
    })

    test('TC1.2: Component with Custom Props (Positive Case)', () => {
        const { getByTestId, container } = render(
            <InfiniteCanvas
                width={1200}
                height={900}
                className="custom-canvas"
            />
        )

        // Check if custom className is applied
        const canvasContainer = container.querySelector('.custom-canvas')
        expect(canvasContainer).toBeInTheDocument()

        // Stage should exist
        const stage = getByTestId('konva-stage')
        expect(stage).toBeInTheDocument()
    })

    test('TC1.3: Component in Zero-Size Container (Edge Case)', () => {
        const container = document.createElement('div')
        container.style.width = '0px'
        container.style.height = '0px'
        document.body.appendChild(container)

        // Component should not crash
        expect(() => {
            render(<InfiniteCanvas />, { container })
        }).not.toThrow()

        // Clean up
        document.body.removeChild(container)
    })

    // Test Case 1: Verify Mouse Drag Panning
    test('TC3.1: Basic Mouse Panning (Positive Case)', () => {
        const { getByTestId } = render(<InfiniteCanvas />)
        const stage = getByTestId('konva-stage')

        // Simulate mouse drag panning: from (100,100) to (150,120) = delta (50,20)
        act(() => {
            fireEvent.mouseDown(stage)
        })

        act(() => {
            fireEvent.mouseMove(stage)
        })

        act(() => {
            fireEvent.mouseUp(stage)
        })

        // Verify viewport position changed by delta (50, 20)
        expect(stage.getAttribute('data-x')).toBe('50')
        expect(stage.getAttribute('data-y')).toBe('20')
    })

    // Test Case 2: Verify Trackpad/Wheel Panning
    test('TC3.2: Wheel/Trackpad Panning (Positive Case)', () => {
        const { getByTestId } = render(<InfiniteCanvas />)
        const stage = getByTestId('konva-stage')

        const initialX = parseInt(stage.getAttribute('data-x') || '0')
        const initialY = parseInt(stage.getAttribute('data-y') || '0')

        // Simulate wheel event with deltaX and deltaY
        act(() => {
            fireEvent.wheel(stage, { deltaX: 25, deltaY: -15 })
        })

        // Verify viewport position updated by delta values
        const newX = parseInt(stage.getAttribute('data-x') || '0')
        const newY = parseInt(stage.getAttribute('data-y') || '0')

        expect(newX).toBe(initialX + 25)
        expect(newY).toBe(initialY - 15)
    })

    // Test Case 3: Verify Cursor Changes on Drag
    test('TC3.3: Cursor Style Changes During Panning (UI Test)', () => {
        const { getByTestId, container } = render(<InfiniteCanvas />)
        const stage = getByTestId('konva-stage')
        const canvasContainer = container.querySelector(
            '.infinite-canvas-container'
        ) as HTMLElement

        // Check initial cursor state
        expect(canvasContainer.style.cursor).toBe('grab')

        // Simulate mousedown and check cursor changes to grabbing
        act(() => {
            fireEvent.mouseDown(stage)
        })

        expect(canvasContainer.style.cursor).toBe('grabbing')

        // Simulate mouseup and check cursor reverts to grab
        act(() => {
            fireEvent.mouseUp(stage)
        })

        expect(canvasContainer.style.cursor).toBe('grab')
    })

    // Test Case 4: Panning Stops When Mouse Leaves Canvas
    test('TC3.4: Panning Stops on Mouse Leave (Edge Case)', () => {
        const { getByTestId, container } = render(<InfiniteCanvas />)
        const stage = getByTestId('konva-stage')
        const canvasContainer = container.querySelector(
            '.infinite-canvas-container'
        ) as HTMLElement

        // Start panning
        act(() => {
            fireEvent.mouseDown(stage)
        })

        // Verify panning started (cursor changed)
        expect(canvasContainer.style.cursor).toBe('grabbing')

        // Simulate mouse leaving canvas
        act(() => {
            fireEvent.mouseLeave(stage)
        })

        // Verify panning stopped (cursor reverted)
        expect(canvasContainer.style.cursor).toBe('grab')
    })

    // Test Case 5: Zoom with Ctrl/Cmd + Wheel
    test('TC4.1: Zoom In with Ctrl + Wheel (Positive Case)', () => {
        const { getByTestId } = render(<InfiniteCanvas />)
        const stage = getByTestId('konva-stage')

        const initialScale = parseFloat(
            stage.getAttribute('data-scale-x') || '1'
        )
        expect(initialScale).toBe(1)

        // Simulate zoom in with Ctrl + wheel up (negative deltaY)
        act(() => {
            fireEvent.wheel(stage, { deltaY: -100, ctrlKey: true })
        })

        const newScale = parseFloat(stage.getAttribute('data-scale-x') || '1')
        expect(newScale).toBeGreaterThan(initialScale)
    })

    test('TC4.2: Zoom Out with Ctrl + Wheel (Positive Case)', () => {
        const { getByTestId } = render(<InfiniteCanvas />)
        const stage = getByTestId('konva-stage')

        const initialScale = parseFloat(
            stage.getAttribute('data-scale-x') || '1'
        )

        // Simulate zoom out with Ctrl + wheel down (positive deltaY)
        act(() => {
            fireEvent.wheel(stage, { deltaY: 100, ctrlKey: true })
        })

        const newScale = parseFloat(stage.getAttribute('data-scale-x') || '1')
        expect(newScale).toBeLessThan(initialScale)
    })

    test('TC4.3: Zoom with Cmd Key on Mac (Positive Case)', () => {
        const { getByTestId } = render(<InfiniteCanvas />)
        const stage = getByTestId('konva-stage')

        const initialScale = parseFloat(
            stage.getAttribute('data-scale-x') || '1'
        )

        // Simulate zoom in with Cmd (metaKey) + wheel
        act(() => {
            fireEvent.wheel(stage, { deltaY: -100, metaKey: true })
        })

        const newScale = parseFloat(stage.getAttribute('data-scale-x') || '1')
        expect(newScale).toBeGreaterThan(initialScale)
    })

    test('TC4.4: Wheel Without Modifier Keys Still Pans (Positive Case)', () => {
        const { getByTestId } = render(<InfiniteCanvas />)
        const stage = getByTestId('konva-stage')

        const initialX = parseFloat(stage.getAttribute('data-x') || '0')
        const initialScale = parseFloat(
            stage.getAttribute('data-scale-x') || '1'
        )

        // Simulate wheel without modifier keys (should pan, not zoom)
        act(() => {
            fireEvent.wheel(stage, { deltaX: 50, deltaY: 0 })
        })

        const newX = parseFloat(stage.getAttribute('data-x') || '0')
        const newScale = parseFloat(stage.getAttribute('data-scale-x') || '1')

        expect(newX).toBe(initialX + 50)
        expect(newScale).toBe(initialScale) // Scale should not change
    })

    test('TC4.5: Zoom Centered on Mouse Position (Positive Case)', () => {
        const { getByTestId } = render(<InfiniteCanvas />)
        const stage = getByTestId('konva-stage')

        const initialX = parseFloat(stage.getAttribute('data-x') || '0')
        const initialY = parseFloat(stage.getAttribute('data-y') || '0')
        const initialScale = parseFloat(
            stage.getAttribute('data-scale-x') || '1'
        )

        // The mock returns pointer position at (400, 300)
        // Zoom in with Ctrl + wheel
        act(() => {
            fireEvent.wheel(stage, { deltaY: -100, ctrlKey: true })
        })

        const newX = parseFloat(stage.getAttribute('data-x') || '0')
        const newY = parseFloat(stage.getAttribute('data-y') || '0')
        const newScale = parseFloat(stage.getAttribute('data-scale-x') || '1')

        // Scale should have changed
        expect(newScale).toBeGreaterThan(initialScale)

        // Position should have changed to keep point (400, 300) in same place
        // The exact calculation: newX = mouseX - (mouseX - oldX) / oldScale * newScale
        expect(newX).not.toBe(initialX)
        expect(newY).not.toBe(initialY)
    })

    // Story 6: Responsive Canvas Layout Tests
    describe('Story 6: Responsive Canvas Layout', () => {
        test('TC6.1: Canvas Uses Container Dimensions on Mount (Positive Case)', () => {
            const { getByTestId } = render(<InfiniteCanvas />)
            const stage = getByTestId('konva-stage')

            // Canvas should have dimensions (default or from container)
            const width = stage.getAttribute('data-width')
            const height = stage.getAttribute('data-height')

            expect(width).toBeTruthy()
            expect(height).toBeTruthy()
            expect(parseInt(width || '0')).toBeGreaterThan(0)
            expect(parseInt(height || '0')).toBeGreaterThan(0)
        })

        test('TC6.2: Resize Event Listener is Registered (Positive Case)', () => {
            const addEventListener = jest.spyOn(window, 'addEventListener')

            render(<InfiniteCanvas />)

            // Verify resize listener was added
            expect(addEventListener).toHaveBeenCalledWith(
                'resize',
                expect.any(Function)
            )

            addEventListener.mockRestore()
        })

        test('TC6.3: Viewport Position Preserved After Resize (Positive Case)', () => {
            const { getByTestId } = render(<InfiniteCanvas />)
            const stage = getByTestId('konva-stage')

            // Pan the canvas
            act(() => {
                fireEvent.mouseDown(stage, { clientX: 100, clientY: 100 })
                fireEvent.mouseMove(stage, { clientX: 150, clientY: 120 })
                fireEvent.mouseUp(stage)
            })

            const xAfterPan = parseFloat(stage.getAttribute('data-x') || '0')
            const yAfterPan = parseFloat(stage.getAttribute('data-y') || '0')

            // Trigger window resize
            act(() => {
                window.dispatchEvent(new Event('resize'))
            })

            // Viewport position should remain the same
            expect(stage.getAttribute('data-x')).toBe(xAfterPan.toString())
            expect(stage.getAttribute('data-y')).toBe(yAfterPan.toString())
        })

        test('TC6.4: Scale Preserved After Resize (Positive Case)', () => {
            const { getByTestId } = render(<InfiniteCanvas />)
            const stage = getByTestId('konva-stage')

            // Zoom in
            act(() => {
                fireEvent.wheel(stage, { deltaY: -100, ctrlKey: true })
            })

            const scaleAfterZoom = parseFloat(
                stage.getAttribute('data-scale-x') || '1'
            )

            // Trigger window resize
            act(() => {
                window.dispatchEvent(new Event('resize'))
            })

            // Scale should remain the same
            expect(stage.getAttribute('data-scale-x')).toBe(
                scaleAfterZoom.toString()
            )
        })

        test('TC6.5: Custom Width Prop Overrides Container (Positive Case)', () => {
            const { getByTestId } = render(<InfiniteCanvas width={1000} />)
            const stage = getByTestId('konva-stage')

            // Should use provided width
            expect(stage.getAttribute('data-width')).toBe('1000')
        })

        test('TC6.6: Custom Height Prop Overrides Container (Positive Case)', () => {
            const { getByTestId } = render(<InfiniteCanvas height={750} />)
            const stage = getByTestId('konva-stage')

            // Should use provided height
            expect(stage.getAttribute('data-height')).toBe('750')
        })

        test('TC6.7: Custom Width and Height Props Override Container (Positive Case)', () => {
            const { getByTestId } = render(
                <InfiniteCanvas width={1000} height={750} />
            )
            const stage = getByTestId('konva-stage')

            // Should use provided width and height
            expect(stage.getAttribute('data-width')).toBe('1000')
            expect(stage.getAttribute('data-height')).toBe('750')
        })

        test('TC6.8: Resize Event Listener Cleanup on Unmount (Positive Case)', () => {
            const removeEventListener = jest.spyOn(
                window,
                'removeEventListener'
            )

            const { unmount } = render(<InfiniteCanvas />)

            // Unmount component
            unmount()

            // Verify resize listener was removed
            expect(removeEventListener).toHaveBeenCalledWith(
                'resize',
                expect.any(Function)
            )

            removeEventListener.mockRestore()
        })

        test('TC6.9: Canvas Container Has Correct CSS Classes (Positive Case)', () => {
            const { container } = render(
                <InfiniteCanvas className="custom-class" />
            )

            const canvasContainer = container.querySelector(
                '.infinite-canvas-container'
            )

            expect(canvasContainer).toBeInTheDocument()
            expect(canvasContainer).toHaveClass('infinite-canvas-container')
            expect(canvasContainer).toHaveClass('custom-class')
        })
    })
})
