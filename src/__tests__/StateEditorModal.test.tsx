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
        fireEvent.change(descriptionInput, { target: { value: 'Updated State' } })

        const saveButton = screen.getByTestId('save-button')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                description: 'Updated State',
                date: '2024-01-15',
                priority: 'Medium',
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
        expect(mockOnSave).not.toHaveBeenCalled()
    })

    test('calls onCancel when clicking outside modal', () => {
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

    test('updates priority when selection changes', () => {
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

    test('trims whitespace from description on save', async () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const descriptionInput = screen.getByTestId('state-description-input')

        fireEvent.change(descriptionInput, { target: { value: '  Padded State  ' } })

        const saveButton = screen.getByTestId('save-button')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                description: 'Padded State',
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

    test('displays title as "Edit State"', () => {
        render(
            <StateEditorModal
                isOpen={true}
                stateData={mockStateData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        expect(screen.getByText('Edit State')).toBeInTheDocument()
    })

    test('allows changing all three fields', async () => {
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

        fireEvent.change(descriptionInput, { target: { value: 'New Description' } })
        fireEvent.change(dateInput, { target: { value: '2024-12-31' } })
        fireEvent.change(prioritySelect, { target: { value: 'Low' } })

        const saveButton = screen.getByTestId('save-button')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                description: 'New Description',
                date: '2024-12-31',
                priority: 'Low',
            })
        })
    })
})
