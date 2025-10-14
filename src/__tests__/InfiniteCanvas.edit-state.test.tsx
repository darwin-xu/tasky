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
    test('opens state editor on double click', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Get the state card group
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups[0]

        // Simulate double click
        act(() => {
            fireEvent.dblClick(stateGroup)
        })

        // Editor should be open
        expect(screen.getByTestId('state-editor-modal')).toBeInTheDocument()
        expect(screen.getByText('Edit State')).toBeInTheDocument()
    })

    test('state editor displays current state data', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Get the state card group
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups[0]

        // Simulate double click to open editor
        act(() => {
            fireEvent.dblClick(stateGroup)
        })

        // Check that the editor shows the current data
        const descriptionInput = screen.getByTestId(
            'state-description-input'
        ) as HTMLTextAreaElement

        expect(descriptionInput.value).toBe('New State')
    })

    test('saves edited state data', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Get the state card group
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups[0]

        // Simulate double click to open editor
        act(() => {
            fireEvent.dblClick(stateGroup)
        })

        // Edit the data
        const descriptionInput = screen.getByTestId('state-description-input')
        const dateInput = screen.getByTestId('state-date-input')
        const prioritySelect = screen.getByTestId('state-priority-select')

        act(() => {
            fireEvent.change(descriptionInput, {
                target: { value: 'Updated State' },
            })
            fireEvent.change(dateInput, { target: { value: '2024-03-15' } })
            fireEvent.change(prioritySelect, { target: { value: 'High' } })
        })

        // Save changes
        const saveButton = screen.getByTestId('save-button')
        act(() => {
            fireEvent.click(saveButton)
        })

        // Editor should close
        expect(
            screen.queryByTestId('state-editor-modal')
        ).not.toBeInTheDocument()

        // Re-open editor to verify changes were saved
        act(() => {
            fireEvent.dblClick(stateGroup)
        })

        // Check that the updated data is displayed
        const updatedDescriptionInput = screen.getByTestId(
            'state-description-input'
        ) as HTMLTextAreaElement
        const updatedDateInput = screen.getByTestId(
            'state-date-input'
        ) as HTMLInputElement
        const updatedPrioritySelect = screen.getByTestId(
            'state-priority-select'
        ) as HTMLSelectElement

        expect(updatedDescriptionInput.value).toBe('Updated State')
        expect(updatedDateInput.value).toBe('2024-03-15')
        expect(updatedPrioritySelect.value).toBe('High')
    })

    test('cancels editing without saving changes', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Get the state card group
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups[0]

        // Simulate double click to open editor
        act(() => {
            fireEvent.dblClick(stateGroup)
        })

        // Edit the data
        const descriptionInput = screen.getByTestId('state-description-input')

        act(() => {
            fireEvent.change(descriptionInput, {
                target: { value: 'Changed Description' },
            })
        })

        // Cancel changes
        const cancelButton = screen.getByTestId('cancel-button')
        act(() => {
            fireEvent.click(cancelButton)
        })

        // Editor should close
        expect(
            screen.queryByTestId('state-editor-modal')
        ).not.toBeInTheDocument()

        // Re-open editor to verify changes were NOT saved
        act(() => {
            fireEvent.dblClick(stateGroup)
        })

        const unchangedDescriptionInput = screen.getByTestId(
            'state-description-input'
        ) as HTMLTextAreaElement

        expect(unchangedDescriptionInput.value).toBe('New State')
    })

    test('validates date input in state editor', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Get the state card group
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups[0]

        // Simulate double click to open editor
        act(() => {
            fireEvent.dblClick(stateGroup)
        })

        // Enter invalid date
        const dateInput = screen.getByTestId('state-date-input')

        act(() => {
            fireEvent.change(dateInput, { target: { value: 'invalid-date' } })
        })

        // Error message should appear
        expect(screen.getByTestId('date-error')).toBeInTheDocument()

        // Save button should be disabled
        const saveButton = screen.getByTestId('save-button')
        expect(saveButton).toBeDisabled()
    })

    test('validates required description field', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Get the state card group
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups[0]

        // Simulate double click to open editor
        act(() => {
            fireEvent.dblClick(stateGroup)
        })

        // Clear description
        const descriptionInput = screen.getByTestId('state-description-input')

        act(() => {
            fireEvent.change(descriptionInput, { target: { value: '' } })
        })

        // Save button should be disabled
        const saveButton = screen.getByTestId('save-button')
        expect(saveButton).toBeDisabled()
    })

    test('updates card display after editing', () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state card
        act(() => {
            canvasRef.current?.createState()
        })

        // Get the state card group
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups[0]

        // Simulate double click to open editor
        act(() => {
            fireEvent.dblClick(stateGroup)
        })

        // Edit the description
        const descriptionInput = screen.getByTestId('state-description-input')

        act(() => {
            fireEvent.change(descriptionInput, {
                target: { value: 'Visible Update' },
            })
        })

        // Save changes
        const saveButton = screen.getByTestId('save-button')
        act(() => {
            fireEvent.click(saveButton)
        })

        // Check that the card displays the updated description
        const texts = screen.getAllByTestId('konva-text')
        const descriptionText = texts.find(
            (text) => text.getAttribute('data-text') === 'Visible Update'
        )

        expect(descriptionText).toBeTruthy()
    })
})
