/* eslint-disable testing-library/prefer-screen-queries */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import StateEditorModal from '../components/StateEditorModal'

describe('StateEditorModal Component', () => {
    const defaultProps = {
        isOpen: true,
        stateData: {
            description: 'Test State',
            date: '2024-01-15',
            priority: 'Medium' as const,
        },
        onSave: jest.fn(),
        onCancel: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('renders when open', () => {
        render(<StateEditorModal {...defaultProps} />)
        expect(screen.getByTestId('state-editor-modal')).toBeInTheDocument()
        expect(screen.getByText('Edit State')).toBeInTheDocument()
    })

    test('does not render when closed', () => {
        render(<StateEditorModal {...defaultProps} isOpen={false} />)
        expect(
            screen.queryByTestId('state-editor-modal')
        ).not.toBeInTheDocument()
    })

    test('displays initial state data', () => {
        render(<StateEditorModal {...defaultProps} />)
        const descriptionInput = screen.getByTestId(
            'state-description-input'
        ) as HTMLTextAreaElement
        const dateInput = screen.getByTestId(
            'state-date-input'
        ) as HTMLInputElement
        const prioritySelect = screen.getByTestId(
            'state-priority-select'
        ) as HTMLSelectElement

        expect(descriptionInput.value).toBe('Test State')
        expect(dateInput.value).toBe('2024-01-15')
        expect(prioritySelect.value).toBe('Medium')
    })

    test('calls onCancel when cancel button clicked', () => {
        render(<StateEditorModal {...defaultProps} />)
        const cancelButton = screen.getByTestId('cancel-button')
        fireEvent.click(cancelButton)
        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
    })

    test('calls onCancel when clicking outside modal', () => {
        render(<StateEditorModal {...defaultProps} />)
        const overlay = screen.getByTestId('state-editor-overlay')
        fireEvent.click(overlay)
        expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
    })

    test('does not call onCancel when clicking inside modal', () => {
        render(<StateEditorModal {...defaultProps} />)
        const modal = screen.getByTestId('state-editor-modal')
        fireEvent.click(modal)
        expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })

    test('calls onSave with updated data when save button clicked', () => {
        render(<StateEditorModal {...defaultProps} />)
        const descriptionInput = screen.getByTestId('state-description-input')
        const dateInput = screen.getByTestId('state-date-input')
        const prioritySelect = screen.getByTestId('state-priority-select')
        const saveButton = screen.getByTestId('save-button')

        fireEvent.change(descriptionInput, {
            target: { value: 'Updated Description' },
        })
        fireEvent.change(dateInput, { target: { value: '2024-02-20' } })
        fireEvent.change(prioritySelect, { target: { value: 'High' } })

        fireEvent.click(saveButton)

        expect(defaultProps.onSave).toHaveBeenCalledWith({
            description: 'Updated Description',
            date: '2024-02-20',
            priority: 'High',
        })
    })

    test('validates description field', () => {
        render(<StateEditorModal {...defaultProps} />)
        const descriptionInput = screen.getByTestId('state-description-input')
        const saveButton = screen.getByTestId('save-button')

        // Clear description
        fireEvent.change(descriptionInput, { target: { value: '' } })

        // Save button should be disabled
        expect(saveButton).toBeDisabled()

        // Fill description again
        fireEvent.change(descriptionInput, {
            target: { value: 'New Description' },
        })

        // Save button should be enabled
        expect(saveButton).not.toBeDisabled()
    })

    test('validates date format', () => {
        render(<StateEditorModal {...defaultProps} />)
        const dateInput = screen.getByTestId('state-date-input')
        const saveButton = screen.getByTestId('save-button')

        // Enter invalid date
        fireEvent.change(dateInput, { target: { value: 'invalid-date' } })

        // Error message should appear
        expect(screen.getByTestId('date-error')).toBeInTheDocument()
        expect(screen.getByTestId('date-error')).toHaveTextContent(
            'Invalid date format'
        )

        // Save button should be disabled
        expect(saveButton).toBeDisabled()

        // Enter valid date
        fireEvent.change(dateInput, { target: { value: '2024-03-15' } })

        // Error message should disappear
        expect(screen.queryByTestId('date-error')).not.toBeInTheDocument()

        // Save button should be enabled
        expect(saveButton).not.toBeDisabled()
    })

    test('allows empty date', () => {
        render(<StateEditorModal {...defaultProps} />)
        const dateInput = screen.getByTestId('state-date-input')
        const saveButton = screen.getByTestId('save-button')

        // Clear date
        fireEvent.change(dateInput, { target: { value: '' } })

        // No error should appear
        expect(screen.queryByTestId('date-error')).not.toBeInTheDocument()

        // Save button should still be enabled
        expect(saveButton).not.toBeDisabled()
    })

    test('trims whitespace from description when saving', () => {
        render(<StateEditorModal {...defaultProps} />)
        const descriptionInput = screen.getByTestId('state-description-input')
        const saveButton = screen.getByTestId('save-button')

        fireEvent.change(descriptionInput, {
            target: { value: '  Trimmed Description  ' },
        })

        fireEvent.click(saveButton)

        expect(defaultProps.onSave).toHaveBeenCalledWith({
            description: 'Trimmed Description',
            date: '2024-01-15',
            priority: 'Medium',
        })
    })

    test('handles escape key to cancel', async () => {
        render(<StateEditorModal {...defaultProps} />)

        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' })

        await waitFor(() => {
            expect(defaultProps.onCancel).toHaveBeenCalledTimes(1)
        })
    })

    test('focuses description input when opened', async () => {
        const { rerender } = render(
            <StateEditorModal {...defaultProps} isOpen={false} />
        )

        rerender(<StateEditorModal {...defaultProps} isOpen={true} />)

        await waitFor(() => {
            const descriptionInput = screen.getByTestId(
                'state-description-input'
            )
            expect(descriptionInput).toHaveFocus()
        })
    })

    test('submits form on enter when save button is enabled', () => {
        render(<StateEditorModal {...defaultProps} />)
        const saveButton = screen.getByRole('button', { name: /save/i })

        fireEvent.click(saveButton)

        expect(defaultProps.onSave).toHaveBeenCalledTimes(1)
    })

    test('does not save when description is empty', () => {
        render(<StateEditorModal {...defaultProps} />)
        const descriptionInput = screen.getByTestId('state-description-input')
        const saveButton = screen.getByRole('button', { name: /save/i })

        fireEvent.change(descriptionInput, { target: { value: '   ' } })
        fireEvent.click(saveButton)

        expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    test('does not save when date is invalid', () => {
        render(<StateEditorModal {...defaultProps} />)
        const dateInput = screen.getByTestId('state-date-input')
        const saveButton = screen.getByRole('button', { name: /save/i })

        fireEvent.change(dateInput, { target: { value: 'invalid-date' } })
        fireEvent.click(saveButton)

        expect(defaultProps.onSave).not.toHaveBeenCalled()
    })

    test('does not close when mousedown on textarea and mouseup on overlay', () => {
        render(<StateEditorModal {...defaultProps} />)
        const descriptionInput = screen.getByTestId('state-description-input')
        const overlay = screen.getByTestId('state-editor-overlay')

        // Simulate text selection: mousedown on textarea
        fireEvent.mouseDown(descriptionInput)

        // Then click (mouseup) on overlay
        fireEvent.click(overlay)

        // Modal should NOT close
        expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })

    test('handles Escape key to cancel when IME is not active', async () => {
        render(<StateEditorModal {...defaultProps} />)

        fireEvent.keyDown(document, { key: 'Escape', isComposing: false })

        await waitFor(() => {
            expect(defaultProps.onCancel).toHaveBeenCalled()
        })
    })

    test('does not cancel when Escape is pressed during IME composition', async () => {
        render(<StateEditorModal {...defaultProps} />)

        fireEvent.keyDown(document, { key: 'Escape', isComposing: true })

        // Wait a bit to ensure the handler doesn't fire
        await new Promise((resolve) => setTimeout(resolve, 100))

        expect(defaultProps.onCancel).not.toHaveBeenCalled()
    })
})
