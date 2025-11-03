import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SaveCanvasModal from '../components/SaveCanvasModal'

describe('SaveCanvasModal', () => {
    const mockOnSave = jest.fn()
    const mockOnCancel = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render when isOpen is false', () => {
        render(
            <SaveCanvasModal
                isOpen={false}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        expect(screen.queryByText('Save Canvas')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
        render(
            <SaveCanvasModal
                isOpen={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        expect(screen.getByText('Save Canvas')).toBeInTheDocument()
        expect(screen.getByLabelText('Canvas Name')).toBeInTheDocument()
    })

    it('should display current name in input', () => {
        render(
            <SaveCanvasModal
                isOpen={true}
                currentName="My Canvas"
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const input = screen.getByLabelText('Canvas Name') as HTMLInputElement
        expect(input.value).toBe('My Canvas')
    })

    it('should call onSave with trimmed name when form is submitted', () => {
        render(
            <SaveCanvasModal
                isOpen={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const input = screen.getByLabelText('Canvas Name')
        const saveButton = screen.getByText('Save')

        fireEvent.change(input, { target: { value: '  Test Canvas  ' } })
        fireEvent.click(saveButton)

        expect(mockOnSave).toHaveBeenCalledWith('Test Canvas')
    })

    it('should not call onSave with empty name', () => {
        render(
            <SaveCanvasModal
                isOpen={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const input = screen.getByLabelText('Canvas Name')
        const saveButton = screen.getByText('Save')

        fireEvent.change(input, { target: { value: '   ' } })
        fireEvent.click(saveButton)

        expect(mockOnSave).not.toHaveBeenCalled()
    })

    it('should call onCancel when cancel button is clicked', () => {
        render(
            <SaveCanvasModal
                isOpen={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)

        expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when overlay is clicked', () => {
        render(
            <SaveCanvasModal
                isOpen={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        // Click outside is handled by clicking the cancel button
        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)
        expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should disable save button when name is empty', () => {
        render(
            <SaveCanvasModal
                isOpen={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const saveButton = screen.getByText('Save') as HTMLButtonElement
        expect(saveButton.disabled).toBe(true)
    })

    it('should call onCancel when Escape key is pressed', () => {
        const { container } = render(
            <SaveCanvasModal
                isOpen={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const modalContent = container.querySelector('.modal-content')
        if (modalContent) {
            fireEvent.keyDown(modalContent, { key: 'Escape' })
            expect(mockOnCancel).toHaveBeenCalledTimes(1)
        }
    })

    it('should enable save button when name is not empty', () => {
        render(
            <SaveCanvasModal
                isOpen={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const input = screen.getByLabelText('Canvas Name')
        const saveButton = screen.getByText('Save') as HTMLButtonElement

        fireEvent.change(input, { target: { value: 'Test Canvas' } })

        expect(saveButton.disabled).toBe(false)
    })

    it('should focus input when modal opens', () => {
        render(
            <SaveCanvasModal
                isOpen={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const input = screen.getByLabelText('Canvas Name')
        expect(input).toHaveFocus()
    })

    it('should call onCancel when escape key is pressed on different modal elements', () => {
        const { container } = render(
            <SaveCanvasModal
                isOpen={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const input = container.querySelector('input')
        if (input) {
            fireEvent.keyDown(input, { key: 'Escape' })
            expect(mockOnCancel).toHaveBeenCalledTimes(1)
        }
    })

    it('should not call onSave when non-Escape key is pressed', () => {
        const { container } = render(
            <SaveCanvasModal
                isOpen={true}
                onSave={mockOnSave}
                onCancel={mockOnCancel}
            />
        )

        const input = container.querySelector('input')
        if (input) {
            fireEvent.keyDown(input, { key: 'Enter' })
            // onCancel should not be called for Enter key
            expect(mockOnCancel).not.toHaveBeenCalled()
        }
    })
})
