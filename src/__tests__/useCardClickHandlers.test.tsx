import { renderHook } from '@testing-library/react'
import { useCardClickHandlers } from '../hooks/useCardClickHandlers'
import { KonvaEventObject } from 'konva/lib/Node'

describe('useCardClickHandlers', () => {
    test('returns all handler functions', () => {
        const { result } = renderHook(() =>
            useCardClickHandlers({
                id: 'test-card',
            })
        )

        expect(result.current.handleClick).toBeDefined()
        expect(result.current.handleDoubleClick).toBeDefined()
        expect(result.current.handleDeleteClick).toBeDefined()
        expect(result.current.handleDuplicateClick).toBeDefined()
    })

    test('handleClick calls onClick callback with correct id', () => {
        const onClick = jest.fn()
        const { result } = renderHook(() =>
            useCardClickHandlers({
                id: 'test-card',
                onClick,
            })
        )

        const mockEvent = {
            cancelBubble: false,
        } as KonvaEventObject<MouseEvent>

        result.current.handleClick(mockEvent)

        expect(onClick).toHaveBeenCalledWith('test-card')
        expect(mockEvent.cancelBubble).toBe(true)
    })

    test('handleClick does not throw when onClick is not provided', () => {
        const { result } = renderHook(() =>
            useCardClickHandlers({
                id: 'test-card',
            })
        )

        const mockEvent = {
            cancelBubble: false,
        } as KonvaEventObject<MouseEvent>

        expect(() => result.current.handleClick(mockEvent)).not.toThrow()
        expect(mockEvent.cancelBubble).toBe(true)
    })

    test('handleDoubleClick calls onDoubleClick callback with correct id', () => {
        const onDoubleClick = jest.fn()
        const { result } = renderHook(() =>
            useCardClickHandlers({
                id: 'test-card',
                onDoubleClick,
            })
        )

        const mockEvent = {
            cancelBubble: false,
        } as KonvaEventObject<MouseEvent>

        result.current.handleDoubleClick(mockEvent)

        expect(onDoubleClick).toHaveBeenCalledWith('test-card')
        expect(mockEvent.cancelBubble).toBe(true)
    })

    test('handleDoubleClick does not throw when onDoubleClick is not provided', () => {
        const { result } = renderHook(() =>
            useCardClickHandlers({
                id: 'test-card',
            })
        )

        const mockEvent = {
            cancelBubble: false,
        } as KonvaEventObject<MouseEvent>

        expect(() => result.current.handleDoubleClick(mockEvent)).not.toThrow()
        expect(mockEvent.cancelBubble).toBe(true)
    })

    test('handleDeleteClick calls onDelete callback with correct id', () => {
        const onDelete = jest.fn()
        const { result } = renderHook(() =>
            useCardClickHandlers({
                id: 'test-card',
                onDelete,
            })
        )

        const mockEvent = {
            cancelBubble: false,
        } as KonvaEventObject<MouseEvent>

        result.current.handleDeleteClick(mockEvent)

        expect(onDelete).toHaveBeenCalledWith('test-card')
        expect(mockEvent.cancelBubble).toBe(true)
    })

    test('handleDeleteClick does not throw when onDelete is not provided', () => {
        const { result } = renderHook(() =>
            useCardClickHandlers({
                id: 'test-card',
            })
        )

        const mockEvent = {
            cancelBubble: false,
        } as KonvaEventObject<MouseEvent>

        expect(() => result.current.handleDeleteClick(mockEvent)).not.toThrow()
        expect(mockEvent.cancelBubble).toBe(true)
    })

    test('handleDuplicateClick calls onDuplicate callback with correct id', () => {
        const onDuplicate = jest.fn()
        const { result } = renderHook(() =>
            useCardClickHandlers({
                id: 'test-card',
                onDuplicate,
            })
        )

        const mockEvent = {
            cancelBubble: false,
        } as KonvaEventObject<MouseEvent>

        result.current.handleDuplicateClick(mockEvent)

        expect(onDuplicate).toHaveBeenCalledWith('test-card')
        expect(mockEvent.cancelBubble).toBe(true)
    })

    test('handleDuplicateClick does not throw when onDuplicate is not provided', () => {
        const { result } = renderHook(() =>
            useCardClickHandlers({
                id: 'test-card',
            })
        )

        const mockEvent = {
            cancelBubble: false,
        } as KonvaEventObject<MouseEvent>

        expect(() => result.current.handleDuplicateClick(mockEvent)).not.toThrow()
        expect(mockEvent.cancelBubble).toBe(true)
    })
})
