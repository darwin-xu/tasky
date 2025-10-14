import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import TaskEditorModal from '../components/TaskEditorModal'

describe('TaskEditorModal', () => {
    const mockTaskData = {
        title: 'Test Task',
        description: 'Test Description',
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
            <TaskEditorModal
                isOpen={false}
                taskData={mockTaskData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        expect(screen.queryByTestId('task-editor-modal')).not.toBeInTheDocument()
    })

    test('renders with initial task data when isOpen is true', () => {
        render(
            <TaskEditorModal
                isOpen={true}
                taskData={mockTaskData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        expect(screen.getByTestId('task-editor-modal')).toBeInTheDocument()
        expect(screen.getByTestId('task-title-input')).toHaveValue('Test Task')
        expect(screen.getByTestId('task-description-input')).toHaveValue(
            'Test Description'
        )
        expect(screen.getByTestId('task-date-input')).toHaveValue('2024-01-15')
        expect(screen.getByTestId('task-priority-select')).toHaveValue('Medium')
    })

    test('calls onSave with updated data when save button is clicked', async () => {
        render(
            <TaskEditorModal
                isOpen={true}
                taskData={mockTaskData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const titleInput = screen.getByTestId('task-title-input')
        fireEvent.change(titleInput, { target: { value: 'Updated Task' } })

        const saveButton = screen.getByTestId('save-button')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                title: 'Updated Task',
                description: 'Test Description',
                date: '2024-01-15',
                priority: 'Medium',
            })
        })
    })

    test('calls onCancel when cancel button is clicked', () => {
        render(
            <TaskEditorModal
                isOpen={true}
                taskData={mockTaskData}
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
            <TaskEditorModal
                isOpen={true}
                taskData={mockTaskData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const overlay = screen.getByTestId('task-editor-overlay')
        fireEvent.click(overlay)

        expect(mockOnCancel).toHaveBeenCalled()
    })

    test('shows error for invalid date format', async () => {
        render(
            <TaskEditorModal
                isOpen={true}
                taskData={mockTaskData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const dateInput = screen.getByTestId('task-date-input')
        fireEvent.change(dateInput, { target: { value: '01/15/2024' } })

        await waitFor(() => {
            expect(screen.getByTestId('date-error')).toBeInTheDocument()
        })

        const saveButton = screen.getByTestId('save-button')
        expect(saveButton).toBeDisabled()
    })

    test('disables save button when title is empty', () => {
        render(
            <TaskEditorModal
                isOpen={true}
                taskData={mockTaskData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const titleInput = screen.getByTestId('task-title-input')
        fireEvent.change(titleInput, { target: { value: '' } })

        const saveButton = screen.getByTestId('save-button')
        expect(saveButton).toBeDisabled()
    })

    test('updates priority when selection changes', () => {
        render(
            <TaskEditorModal
                isOpen={true}
                taskData={mockTaskData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const prioritySelect = screen.getByTestId('task-priority-select')
        fireEvent.change(prioritySelect, { target: { value: 'High' } })

        expect(prioritySelect).toHaveValue('High')
    })

    test('trims whitespace from title and description on save', async () => {
        render(
            <TaskEditorModal
                isOpen={true}
                taskData={mockTaskData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const titleInput = screen.getByTestId('task-title-input')
        const descInput = screen.getByTestId('task-description-input')

        fireEvent.change(titleInput, { target: { value: '  Padded Task  ' } })
        fireEvent.change(descInput, {
            target: { value: '  Padded Description  ' },
        })

        const saveButton = screen.getByTestId('save-button')
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                title: 'Padded Task',
                description: 'Padded Description',
                date: '2024-01-15',
                priority: 'Medium',
            })
        })
    })

    test('accepts empty date', async () => {
        render(
            <TaskEditorModal
                isOpen={true}
                taskData={mockTaskData}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const dateInput = screen.getByTestId('task-date-input')
        fireEvent.change(dateInput, { target: { value: '' } })

        const saveButton = screen.getByTestId('save-button')
        expect(saveButton).not.toBeDisabled()

        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(mockOnSave).toHaveBeenCalledWith({
                title: 'Test Task',
                description: 'Test Description',
                date: '',
                priority: 'Medium',
            })
        })
    })
})
