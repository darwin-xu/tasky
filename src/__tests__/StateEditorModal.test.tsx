import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StateEditorModal from '../components/StateEditorModal'

describe('StateEditorModal', () => {
    const mockStateData = {
        description: 'Test State',
        date: '2024-01-15',
        priority: 'Medium' as const,
    }

    const mockOnSave = jest.fn()
    const mockOnCancel = jest.fn()

    beforeEach(() => {
        mockOnSave.mockClear()
        mockOnCancel.mockClear()
    })

    test('does not render when isOpen is false', () => {
        render(
            <StateEditorModal
                isOpen={false}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        expect(screen.queryByTestId('state-editor-modal')).not.toBeInTheDocument()
    })

    test('renders with initial state data when isOpen is true', () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        expect(screen.getByTestId('state-editor-modal')).toBeInTheDocument()
        expect(screen.getByTestId('state-description-input')).toHaveValue('Test State')
        expect(screen.getByTestId('state-date-input')).toHaveValue('2024-01-15')
        expect(screen.getByTestId('state-priority-select')).toHaveValue('Medium')
    })

    test('updates description when input changes', () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const descriptionInput = screen.getByTestId('state-description-input')
        fireEvent.change(descriptionInput, { target: { value: 'Updated State' } })

        expect(descriptionInput).toHaveValue('Updated State')
    })

    test('updates date when input changes', () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const dateInput = screen.getByTestId('state-date-input')
        fireEvent.change(dateInput, { target: { value: '2024-02-20' } })

        expect(dateInput).toHaveValue('2024-02-20')
    })

    test('updates priority when select changes', () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const prioritySelect = screen.getByTestId('state-priority-select')
        fireEvent.change(prioritySelect, { target: { value: 'High' } })

        expect(prioritySelect).toHaveValue('High')
    })

    test('shows error for invalid date format', async () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const dateInput = screen.getByTestId('state-date-input')
        fireEvent.change(dateInput, { target: { value: '01/15/2024' } })

        await waitFor(() => {
            expect(screen.getByTestId('date-error')).toBeInTheDocument()
        })

        const saveButton = screen.getByTestId('save-button')
        expect(saveButton).toBeDisabled()
    })

    test('disables save button when description is empty', () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const descriptionInput = screen.getByTestId('state-description-input')
        fireEvent.change(descriptionInput, { target: { value: '' } })

        const saveButton = screen.getByTestId('save-button')
        expect(saveButton).toBeDisabled()
    })

    test('calls onSave with updated data when save button is clicked', async () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const descriptionInput = screen.getByTestId('state-description-input')
        const dateInput = screen.getByTestId('state-date-input')
        const prioritySelect = screen.getByTestId('state-priority-select')

        fireEvent.change(descriptionInput, { target: { value: 'Updated State' } })
        fireEvent.change(dateInput, { target: { value: '2024-03-25' } })
        fireEvent.change(prioritySelect, { target: { value: 'High' } })

        const saveButton = screen.getByTestId('save-button')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                description: 'Updated State',
                date: '2024-03-25',
                priority: 'High',
            })
        })
    })

    test('calls onCancel when cancel button is clicked', () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const cancelButton = screen.getByTestId('cancel-button')
        fireEvent.click(cancelButton)

        expect(mockOnCancel).toHaveBeenCalled()
    })

    test('calls onCancel when Escape key is pressed', () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        fireEvent.keyDown(document, { key: 'Escape' })

        expect(mockOnCancel).toHaveBeenCalled()
    })

    test('calls onCancel when clicking backdrop', () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const overlay = screen.getByTestId('state-editor-overlay')
        fireEvent.click(overlay)

        expect(mockOnCancel).toHaveBeenCalled()
    })

    test('does not close when clicking inside modal', () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const modal = screen.getByTestId('state-editor-modal')
        fireEvent.click(modal)

        expect(mockOnCancel).not.toHaveBeenCalled()
    })

    test('trims whitespace from description when saving', async () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const descInput = screen.getByTestId('state-description-input')
        fireEvent.change(descInput, {
            target: { value: '  Padded Description  ' },
        })

        const saveButton = screen.getByTestId('save-button')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                description: 'Padded Description',
                date: '2024-01-15',
                priority: 'Medium',
            })
        })
    })

    test('accepts empty date', async () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const dateInput = screen.getByTestId('state-date-input')
        fireEvent.change(dateInput, { target: { value: '' } })

        const saveButton = screen.getByTestId('save-button')
        expect(saveButton).not.toBeDisabled()

        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                description: 'Test State',
                date: '',
                priority: 'Medium',
            })
        })
    })

    test('allows valid date formats', async () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const dateInput = screen.getByTestId('state-date-input')
        fireEvent.change(dateInput, { target: { value: '2024-12-31' } })

        expect(screen.queryByTestId('date-error')).not.toBeInTheDocument()

        const saveButton = screen.getByTestId('save-button')
        expect(saveButton).not.toBeDisabled()

        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                description: 'Test State',
                date: '2024-12-31',
                priority: 'Medium',
            })
        })
    })

    test('has all priority options available', () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const prioritySelect = screen.getByTestId('state-priority-select')
        const options = Array.from(prioritySelect.querySelectorAll('option'))

        expect(options).toHaveLength(3)
        expect(options.map((opt) => opt.value)).toEqual(['Low', 'Medium', 'High'])
    })

    test('form can be submitted with Enter key', async () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const descriptionInput = screen.getByTestId('state-description-input')
        fireEvent.change(descriptionInput, { target: { value: 'Updated State' } })
        
        const form = screen.getByTestId('state-editor-modal').querySelector('form')
        if (form) {
            fireEvent.submit(form)

            await waitFor(() => {
                expect(mockOnSave).toHaveBeenCalledWith({
                    description: 'Updated State',
                    date: '2024-01-15',
                    priority: 'Medium',
                })
            })
        }
    })

    test('resets form when modal reopens with new data', () => {
        const { rerender } = render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        // Modify the inputs
        const descriptionInput = screen.getByTestId('state-description-input')
        fireEvent.change(descriptionInput, { target: { value: 'Changed' } })

        // Close and reopen with different data
        rerender(
            <StateEditorModal
                isOpen={false}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const newStateData = {
            description: 'New State',
            date: '2024-06-01',
            priority: 'Low' as const,
        }

        rerender(
            <StateEditorModal
                isOpen={true}
                stateData={newStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        expect(screen.getByTestId('state-description-input')).toHaveValue('New State')
        expect(screen.getByTestId('state-date-input')).toHaveValue('2024-06-01')
        expect(screen.getByTestId('state-priority-select')).toHaveValue('Low')
    })
})
