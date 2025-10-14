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

describe('InfiniteCanvas - State Card Editing', () => {
    test('opens state editor modal when state card is double-clicked', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Find the state card group
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups.find((g) => {
            const x = g.getAttribute('data-x')
            const y = g.getAttribute('data-y')
            return x !== null && y !== null
        })

        expect(stateGroup).toBeTruthy()

        // Double-click the state card
        act(() => {
            fireEvent.doubleClick(stateGroup!)
        })

        // Check that the state editor modal is now open
        expect(screen.getByTestId('state-editor-modal')).toBeInTheDocument()
    })

    test('state editor modal displays current state data', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Find and double-click the state card
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups.find((g) => {
            const x = g.getAttribute('data-x')
            const y = g.getAttribute('data-y')
            return x !== null && y !== null
        })

        act(() => {
            fireEvent.doubleClick(stateGroup!)
        })

        // Verify the editor shows the default state data
        expect(screen.getByTestId('state-description-input')).toHaveValue('New State')
        expect(screen.getByTestId('state-date-input')).toHaveValue('')
        expect(screen.getByTestId('state-priority-select')).toHaveValue('Medium')
    })

    test('saves edited state data when save button is clicked', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Find and double-click the state card
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups.find((g) => {
            const x = g.getAttribute('data-x')
            const y = g.getAttribute('data-y')
            return x !== null && y !== null
        })

        act(() => {
            fireEvent.doubleClick(stateGroup!)
        })

        // Edit the state
        const descriptionInput = screen.getByTestId('state-description-input')
        const dateInput = screen.getByTestId('state-date-input')
        const prioritySelect = screen.getByTestId('state-priority-select')

        act(() => {
            fireEvent.change(descriptionInput, { target: { value: 'Updated State Description' } })
            fireEvent.change(dateInput, { target: { value: '2024-05-20' } })
            fireEvent.change(prioritySelect, { target: { value: 'High' } })
        })

        // Save the changes
        const saveButton = screen.getByTestId('save-button')
        act(() => {
            fireEvent.click(saveButton)
        })

        // Verify the modal is closed
        expect(screen.queryByTestId('state-editor-modal')).not.toBeInTheDocument()

        // Verify the state card displays the updated data
        const texts = screen.getAllByTestId('konva-text')
        const descriptionText = texts.find(
            (text) => text.getAttribute('data-text') === 'Updated State Description'
        )
        const dateText = texts.find(
            (text) => text.getAttribute('data-text') === '📅 2024-05-20'
        )
        const priorityText = texts.find(
            (text) => text.getAttribute('data-text') === 'Priority: High'
        )

        expect(descriptionText).toBeTruthy()
        expect(dateText).toBeTruthy()
        expect(priorityText).toBeTruthy()
    })

    test('cancels editing when cancel button is clicked', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Find and double-click the state card
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups.find((g) => {
            const x = g.getAttribute('data-x')
            const y = g.getAttribute('data-y')
            return x !== null && y !== null
        })

        act(() => {
            fireEvent.doubleClick(stateGroup!)
        })

        // Edit the state
        const descriptionInput = screen.getByTestId('state-description-input')
        act(() => {
            fireEvent.change(descriptionInput, { target: { value: 'Changed Description' } })
        })

        // Cancel the changes
        const cancelButton = screen.getByTestId('cancel-button')
        act(() => {
            fireEvent.click(cancelButton)
        })

        // Verify the modal is closed
        expect(screen.queryByTestId('state-editor-modal')).not.toBeInTheDocument()

        // Verify the state card still has the original data
        const texts = screen.getAllByTestId('konva-text')
        const originalText = texts.find(
            (text) => text.getAttribute('data-text') === 'New State'
        )
        const changedText = texts.find(
            (text) => text.getAttribute('data-text') === 'Changed Description'
        )

        expect(originalText).toBeTruthy()
        expect(changedText).toBeFalsy()
    })

    test('edits persist across multiple edits', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Find the state card
        const findStateGroup = () => {
            const groups = screen.getAllByTestId('konva-group')
            return groups.find((g) => {
                const x = g.getAttribute('data-x')
                const y = g.getAttribute('data-y')
                return x !== null && y !== null
            })
        }

        // First edit
        act(() => {
            fireEvent.doubleClick(findStateGroup()!)
        })

        act(() => {
            fireEvent.change(screen.getByTestId('state-description-input'), {
                target: { value: 'First Edit' },
            })
            fireEvent.click(screen.getByTestId('save-button'))
        })

        // Second edit
        act(() => {
            fireEvent.doubleClick(findStateGroup()!)
        })

        // Verify the first edit is shown
        expect(screen.getByTestId('state-description-input')).toHaveValue('First Edit')

        act(() => {
            fireEvent.change(screen.getByTestId('state-description-input'), {
                target: { value: 'Second Edit' },
            })
            fireEvent.click(screen.getByTestId('save-button'))
        })

        // Verify the second edit is displayed on the card
        const texts = screen.getAllByTestId('konva-text')
        const secondEditText = texts.find(
            (text) => text.getAttribute('data-text') === 'Second Edit'
        )

        expect(secondEditText).toBeTruthy()
    })

    test('can edit different state cards independently', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create two state cards with a delay to ensure unique IDs
        act(() => {
            canvasRef.current?.createState()
        })

        // Wait a tiny bit to ensure different timestamp
        act(() => {
            canvasRef.current?.createState()
        })

        const groups = screen.getAllByTestId('konva-group')
        const stateGroups = groups.filter((g) => {
            const x = g.getAttribute('data-x')
            const y = g.getAttribute('data-y')
            return x !== null && y !== null
        })

        // Should have at least 2 state cards
        expect(stateGroups.length).toBeGreaterThanOrEqual(2)

        // Edit first state card
        act(() => {
            fireEvent.doubleClick(stateGroups[0])
        })

        act(() => {
            fireEvent.change(screen.getByTestId('state-description-input'), {
                target: { value: 'First State' },
            })
            fireEvent.click(screen.getByTestId('save-button'))
        })

        // Edit second state card
        act(() => {
            fireEvent.doubleClick(stateGroups[stateGroups.length - 1])
        })

        act(() => {
            fireEvent.change(screen.getByTestId('state-description-input'), {
                target: { value: 'Second State' },
            })
            fireEvent.click(screen.getByTestId('save-button'))
        })

        // Verify both states have their own data
        const texts = screen.getAllByTestId('konva-text')
        const firstStateText = texts.find(
            (text) => text.getAttribute('data-text') === 'First State'
        )
        const secondStateText = texts.find(
            (text) => text.getAttribute('data-text') === 'Second State'
        )

        expect(firstStateText).toBeTruthy()
        expect(secondStateText).toBeTruthy()
    })

    test('does not open editor when double-clicking task card', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a task card
        act(() => {
            canvasRef.current?.createTask()
        })

        // Find and double-click the task card
        const groups = screen.getAllByTestId('konva-group')
        const taskGroup = groups.find((g) => {
            const x = g.getAttribute('data-x')
            const y = g.getAttribute('data-y')
            return x !== null && y !== null
        })

        act(() => {
            fireEvent.doubleClick(taskGroup!)
        })

        // Verify that the task editor modal is open (not state editor)
        expect(screen.getByTestId('task-editor-modal')).toBeInTheDocument()
        expect(screen.queryByTestId('state-editor-modal')).not.toBeInTheDocument()
    })

    test('validates date format in state editor', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Find and double-click the state card
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups.find((g) => {
            const x = g.getAttribute('data-x')
            const y = g.getAttribute('data-y')
            return x !== null && y !== null
        })

        act(() => {
            fireEvent.doubleClick(stateGroup!)
        })

        // Enter an invalid date
        const dateInput = screen.getByTestId('state-date-input')
        act(() => {
            fireEvent.change(dateInput, { target: { value: '01/15/2024' } })
        })

        // Verify error is shown and save is disabled
        expect(screen.getByTestId('date-error')).toBeInTheDocument()
        expect(screen.getByTestId('save-button')).toBeDisabled()
    })

    test('allows editing state with empty date', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Find and double-click the state card
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups.find((g) => {
            const x = g.getAttribute('data-x')
            const y = g.getAttribute('data-y')
            return x !== null && y !== null
        })

        act(() => {
            fireEvent.doubleClick(stateGroup!)
        })

        // Edit description and priority but leave date empty
        act(() => {
            fireEvent.change(screen.getByTestId('state-description-input'), {
                target: { value: 'State Without Date' },
            })
            fireEvent.change(screen.getByTestId('state-priority-select'), {
                target: { value: 'Low' },
            })
            fireEvent.click(screen.getByTestId('save-button'))
        })

        // Verify the changes were saved
        const texts = screen.getAllByTestId('konva-text')
        const descriptionText = texts.find(
            (text) => text.getAttribute('data-text') === 'State Without Date'
        )
        const priorityText = texts.find(
            (text) => text.getAttribute('data-text') === 'Priority: Low'
        )

        expect(descriptionText).toBeTruthy()
        expect(priorityText).toBeTruthy()
    })
})
