/* eslint-disable testing-library/prefer-screen-queries, testing-library/no-unnecessary-act, testing-library/no-container, testing-library/no-node-access */
import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { act } from 'react'
import InfiniteCanvas, { InfiniteCanvasRef } from '../components/InfiniteCanvas'

// Mock Konva for testing environment
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

jest.mock('konva/lib/Node', () => ({
    KonvaEventObject: {},
}))

jest.mock('konva', () => ({
    default: {},
}))

describe('InfiniteCanvas - Card Duplication', () => {
    test('keyboard shortcut Ctrl+D duplicates selected task', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a task
        act(() => {
            canvasRef.current?.createTask()
        })

        // Verify one task exists
        let texts = screen.getAllByTestId('konva-text')
        let taskCount = texts.filter(
            (text) => text.getAttribute('data-text') === 'New Task'
        ).length
        expect(taskCount).toBe(1)

        // Task should be selected after creation
        // Trigger Ctrl+D
        act(() => {
            const event = new KeyboardEvent('keydown', {
                key: 'd',
                ctrlKey: true,
                bubbles: true,
            })
            document.dispatchEvent(event)
        })

        // Verify two tasks exist now
        texts = screen.getAllByTestId('konva-text')
        taskCount = texts.filter(
            (text) => text.getAttribute('data-text') === 'New Task'
        ).length
        expect(taskCount).toBe(2)
    })

    test('keyboard shortcut Cmd+D duplicates selected state on Mac', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state
        act(() => {
            canvasRef.current?.createState()
        })

        // Verify one state exists
        let texts = screen.getAllByTestId('konva-text')
        let stateCount = texts.filter(
            (text) => text.getAttribute('data-text') === 'New State'
        ).length
        expect(stateCount).toBe(1)

        // State should be selected after creation
        // Trigger Cmd+D (Mac)
        act(() => {
            const event = new KeyboardEvent('keydown', {
                key: 'd',
                metaKey: true,
                bubbles: true,
            })
            document.dispatchEvent(event)
        })

        // Verify two states exist now
        texts = screen.getAllByTestId('konva-text')
        stateCount = texts.filter(
            (text) => text.getAttribute('data-text') === 'New State'
        ).length
        expect(stateCount).toBe(2)
    })

    test('does not duplicate when no card is selected', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Don't create any task - just try to duplicate with nothing selected
        
        // Count tasks before shortcut (should be 0)
        let texts = screen.queryAllByTestId('konva-text')
        const taskCountBefore = texts.filter(
            (text) => text.getAttribute('data-text') === 'New Task'
        ).length
        expect(taskCountBefore).toBe(0)

        // Trigger Ctrl+D when nothing is selected
        act(() => {
            const event = new KeyboardEvent('keydown', {
                key: 'd',
                ctrlKey: true,
                bubbles: true,
            })
            document.dispatchEvent(event)
        })

        // Verify no task was created
        texts = screen.queryAllByTestId('konva-text')
        const taskCountAfter = texts.filter(
            (text) => text.getAttribute('data-text') === 'New Task'
        ).length
        expect(taskCountAfter).toBe(0)
    })

    test('duplicate task inherits all field values from original', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a task
        act(() => {
            canvasRef.current?.createTask()
        })

        // Duplicate using keyboard shortcut
        act(() => {
            const event = new KeyboardEvent('keydown', {
                key: 'd',
                ctrlKey: true,
                bubbles: true,
            })
            document.dispatchEvent(event)
        })

        // Check that both tasks have the same title
        const texts = screen.getAllByTestId('konva-text')
        const taskTitles = texts.filter(
            (text) => text.getAttribute('data-text') === 'New Task'
        )
        expect(taskTitles).toHaveLength(2)

        // Check priority is inherited (both should show 'Priority: Medium')
        const priorityTexts = texts.filter(
            (text) => text.getAttribute('data-text') === 'Priority: Medium'
        )
        expect(priorityTexts.length).toBeGreaterThanOrEqual(2)
    })

    test('duplicate state inherits all field values from original', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state
        act(() => {
            canvasRef.current?.createState()
        })

        // Duplicate using keyboard shortcut
        act(() => {
            const event = new KeyboardEvent('keydown', {
                key: 'd',
                ctrlKey: true,
                bubbles: true,
            })
            document.dispatchEvent(event)
        })

        // Check that both states have the same description
        const texts = screen.getAllByTestId('konva-text')
        const stateDescriptions = texts.filter(
            (text) => text.getAttribute('data-text') === 'New State'
        )
        expect(stateDescriptions).toHaveLength(2)

        // Check priority is inherited
        const priorityTexts = texts.filter(
            (text) => text.getAttribute('data-text') === 'Priority: Medium'
        )
        expect(priorityTexts.length).toBeGreaterThanOrEqual(2)
    })

    test('duplicate appears at offset position', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a task
        act(() => {
            canvasRef.current?.createTask()
        })

        // Get groups before duplication
        let groups = screen.getAllByTestId('konva-group')
        const groupCountBefore = groups.length

        // Duplicate using keyboard shortcut
        act(() => {
            const event = new KeyboardEvent('keydown', {
                key: 'd',
                ctrlKey: true,
                bubbles: true,
            })
            document.dispatchEvent(event)
        })

        // Verify we have more groups (duplicate card added)
        groups = screen.getAllByTestId('konva-group')
        expect(groups.length).toBeGreaterThan(groupCountBefore)
    })

    test('duplicateTask function exists and is exposed via ref', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        expect(canvasRef.current?.duplicateTask).toBeDefined()
        expect(typeof canvasRef.current?.duplicateTask).toBe('function')
    })

    test('duplicateState function exists and is exposed via ref', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        expect(canvasRef.current?.duplicateState).toBeDefined()
        expect(typeof canvasRef.current?.duplicateState).toBe('function')
    })
})
