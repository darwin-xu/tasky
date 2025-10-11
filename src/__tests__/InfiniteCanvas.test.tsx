import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react'

// Mock Konva for testing environment
jest.mock('react-konva', () => {
  const mockStage = ({
    children,
    width,
    height,
    x,
    y,
    scaleX,
    scaleY,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    onMouseLeave,
    onWheel,
    ...props
  }: any) => {
    const stageInstance = {
      getPointerPosition: () => ({ x: 100, y: 100 }),
      getStage: function () {
        return this
      },
    }

    const handleMouseDown = (e: any) => {
      if (onMouseDown) {
        onMouseDown({
          target: stageInstance,
          evt: e,
        })
      }
    }

    const handleMouseMove = (e: any) => {
      if (onMouseMove) {
        onMouseMove({
          target: {
            getStage: () => ({
              getPointerPosition: () => ({ x: 150, y: 120 }),
            }),
          },
          evt: e,
        })
      }
    }

    const handleMouseUp = (e: any) => {
      if (onMouseUp) {
        onMouseUp({
          target: {
            getStage: () => ({
              getPointerPosition: () => ({ x: 150, y: 120 }),
            }),
          },
          evt: e,
        })
      }
    }

    const handleMouseLeave = (e: any) => {
      if (onMouseLeave) {
        onMouseLeave({
          target: {
            getStage: () => ({
              getPointerPosition: () => ({ x: 100, y: 100 }),
            }),
          },
          evt: e,
        })
      }
    }

    const handleWheel = (e: any) => {
      if (onWheel) {
        onWheel({
          target: {
            getStage: () => ({
              getPointerPosition: () => ({ x: 400, y: 300 }),
            }),
          },
          evt: { ...e, preventDefault: jest.fn() },
        })
      }
    }

    return (
      <div
        data-testid="konva-stage"
        data-width={width}
        data-height={height}
        data-x={x}
        data-y={y}
        data-scale-x={scaleX}
        data-scale-y={scaleY}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
        {...props}
      >
        {children}
      </div>
    )
  }

  return {
    Stage: mockStage,
    Layer: ({ children, ...props }: any) => (
      <div data-testid="konva-layer" {...props}>
        {children}
      </div>
    ),
    Circle: ({ x, y, radius, fill, ...props }: any) => (
      <div
        data-testid="konva-circle"
        data-x={x}
        data-y={y}
        data-radius={radius}
        data-fill={fill}
        {...props}
      />
    ),
    Group: ({ children, draggable, x, y, ...props }: any) => (
      <div
        data-testid="konva-group"
        draggable={draggable}
        data-x={x}
        data-y={y}
        {...props}
      >
        {children}
      </div>
    ),
    Rect: ({ width, height, fill, stroke, ...props }: any) => (
      <div
        data-testid="konva-rect"
        data-width={width}
        data-height={height}
        data-fill={fill}
        data-stroke={stroke}
        {...props}
      />
    ),
    Text: ({ text, ...props }: any) => (
      <div data-testid="konva-text" data-text={text} {...props} />
    ),
  }
})

jest.mock('konva/lib/Node', () => ({
  KonvaEventObject: {},
}))

jest.mock('konva', () => ({
  default: {},
}))

// Mock getPointerPosition for mouse events
// (this variable is for test organization but not used in mock anymore)

import InfiniteCanvas from '../components/InfiniteCanvas'

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
      <InfiniteCanvas width={1200} height={900} className="custom-canvas" />
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

    const initialScale = parseFloat(stage.getAttribute('data-scale-x') || '1')
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

    const initialScale = parseFloat(stage.getAttribute('data-scale-x') || '1')

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

    const initialScale = parseFloat(stage.getAttribute('data-scale-x') || '1')

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
    const initialScale = parseFloat(stage.getAttribute('data-scale-x') || '1')

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
    const initialScale = parseFloat(stage.getAttribute('data-scale-x') || '1')

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
})
