import { renderHook, act, waitFor } from '@testing-library/react'
import { useCardDrag } from '../hooks/useCardDrag'
import { KonvaEventObject } from 'konva/lib/Node'
import * as snapToGrid from '../utils/snapToGrid'

// Mock snapToGrid utility
jest.mock('../utils/snapToGrid')

describe('useCardDrag', () => {
    beforeEach(() => {
        // Setup mock implementation
        jest.spyOn(snapToGrid, 'snapPositionToGrid').mockImplementation(
            (pos) => ({
                x: Math.round(pos.x / 20) * 20,
                y: Math.round(pos.y / 20) * 20,
            })
        )
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('initializes with correct default values', () => {
        const { result } = renderHook(() =>
            useCardDrag({
                id: 'test-card',
                gridSpacing: 20,
                scale: 1,
            })
        )

        expect(result.current.isDragging).toBe(false)
        expect(result.current.snapPreview).toBe(null)
        expect(result.current.groupRef.current).toBe(null)
    })

    test('handleDragStart sets isDragging to true', () => {
        const { result } = renderHook(() =>
            useCardDrag({
                id: 'test-card',
                gridSpacing: 20,
                scale: 1,
            })
        )

        const mockEvent = {
            cancelBubble: false,
        } as KonvaEventObject<DragEvent>

        act(() => {
            result.current.handleDragStart(mockEvent)
        })

        expect(result.current.isDragging).toBe(true)
        expect(mockEvent.cancelBubble).toBe(true)
    })

    test('handleDragStart calls onClick callback when provided', () => {
        const onClick = jest.fn()
        const { result } = renderHook(() =>
            useCardDrag({
                id: 'test-card',
                gridSpacing: 20,
                scale: 1,
                onClick,
            })
        )

        const mockEvent = {
            cancelBubble: false,
        } as KonvaEventObject<DragEvent>

        act(() => {
            result.current.handleDragStart(mockEvent)
        })

        expect(onClick).toHaveBeenCalledWith('test-card')
    })

    test('handleDragStart does not throw when onClick is not provided', () => {
        const { result } = renderHook(() =>
            useCardDrag({
                id: 'test-card',
                gridSpacing: 20,
                scale: 1,
            })
        )

        const mockEvent = {
            cancelBubble: false,
        } as KonvaEventObject<DragEvent>

        expect(() => {
            act(() => {
                result.current.handleDragStart(mockEvent)
            })
        }).not.toThrow()
    })

    test('handleDragMove updates snapPreview', async () => {
        const { result } = renderHook(() =>
            useCardDrag({
                id: 'test-card',
                gridSpacing: 20,
                scale: 1,
            })
        )

        const mockEvent = {
            target: {
                position: () => ({ x: 15, y: 25 }),
            },
            cancelBubble: false,
        } as any as KonvaEventObject<DragEvent>

        act(() => {
            result.current.handleDragMove(mockEvent)
        })

        await waitFor(() => {
            expect(result.current.snapPreview).toEqual({ x: 20, y: 20 })
        })
        expect(mockEvent.cancelBubble).toBe(true)
    })

    test('handleDragMove calls onPositionChange when provided', () => {
        const onPositionChange = jest.fn()
        const { result } = renderHook(() =>
            useCardDrag({
                id: 'test-card',
                gridSpacing: 20,
                scale: 1,
                onPositionChange,
            })
        )

        const mockEvent = {
            target: {
                position: () => ({ x: 15, y: 25 }),
            },
            cancelBubble: false,
        } as any as KonvaEventObject<DragEvent>

        act(() => {
            result.current.handleDragMove(mockEvent)
        })

        expect(onPositionChange).toHaveBeenCalledWith('test-card', 15, 25)
    })

    test('handleDragMove does not throw when onPositionChange is not provided', () => {
        const { result } = renderHook(() =>
            useCardDrag({
                id: 'test-card',
                gridSpacing: 20,
                scale: 1,
            })
        )

        const mockEvent = {
            target: {
                position: () => ({ x: 15, y: 25 }),
            },
            cancelBubble: false,
        } as any as KonvaEventObject<DragEvent>

        expect(() => {
            act(() => {
                result.current.handleDragMove(mockEvent)
            })
        }).not.toThrow()
    })

    test('handleDragEnd snaps to grid and updates position', async () => {
        const onPositionChange = jest.fn()
        const { result } = renderHook(() =>
            useCardDrag({
                id: 'test-card',
                gridSpacing: 20,
                scale: 1,
                onPositionChange,
            })
        )

        const mockPosition = jest.fn()
        mockPosition.mockReturnValue({ x: 15, y: 25 })

        const mockEvent = {
            target: {
                position: mockPosition,
            },
            cancelBubble: false,
        } as any as KonvaEventObject<DragEvent>

        act(() => {
            result.current.handleDragEnd(mockEvent)
        })

        await waitFor(() => {
            expect(result.current.isDragging).toBe(false)
            expect(result.current.snapPreview).toBe(null)
        })

        expect(mockPosition).toHaveBeenCalledWith({ x: 20, y: 20 })
        expect(onPositionChange).toHaveBeenCalledWith('test-card', 20, 20)
        expect(mockEvent.cancelBubble).toBe(true)
    })

    test('handleDragEnd does not throw when onPositionChange is not provided', () => {
        const { result } = renderHook(() =>
            useCardDrag({
                id: 'test-card',
                gridSpacing: 20,
                scale: 1,
            })
        )

        const mockPosition = jest.fn()
        mockPosition.mockReturnValue({ x: 15, y: 25 })

        const mockEvent = {
            target: {
                position: mockPosition,
            },
            cancelBubble: false,
        } as any as KonvaEventObject<DragEvent>

        expect(() => {
            act(() => {
                result.current.handleDragEnd(mockEvent)
            })
        }).not.toThrow()
    })
})
