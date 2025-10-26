import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import UnsavedChangesDialog from '../components/UnsavedChangesDialog'

describe('UnsavedChangesDialog Component', () => {
    test('does not render when isOpen is false', () => {
        const mockSave = jest.fn()
        const mockDiscard = jest.fn()
        const mockCancel = jest.fn()

        render(
            <UnsavedChangesDialog
                isOpen={false}
                onSave={mockSave}
                onDiscard={mockDiscard}
                onCancel={mockCancel}
            />
        )

        expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()
    })

    test('renders when isOpen is true', () => {
        const mockSave = jest.fn()
        const mockDiscard = jest.fn()
        const mockCancel = jest.fn()

        render(
            <UnsavedChangesDialog
                isOpen={true}
                onSave={mockSave}
                onDiscard={mockDiscard}
                onCancel={mockCancel}
            />
        )

        expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
        expect(
            screen.getByText(
                'You have unsaved changes. Do you want to save before closing?'
            )
        ).toBeInTheDocument()
    })

    test('renders all three buttons', () => {
        const mockSave = jest.fn()
        const mockDiscard = jest.fn()
        const mockCancel = jest.fn()

        render(
            <UnsavedChangesDialog
                isOpen={true}
                onSave={mockSave}
                onDiscard={mockDiscard}
                onCancel={mockCancel}
            />
        )

        expect(screen.getByText('Save')).toBeInTheDocument()
        expect(screen.getByText('Discard')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    test('calls onSave when Save button is clicked', () => {
        const mockSave = jest.fn()
        const mockDiscard = jest.fn()
        const mockCancel = jest.fn()

        render(
            <UnsavedChangesDialog
                isOpen={true}
                onSave={mockSave}
                onDiscard={mockDiscard}
                onCancel={mockCancel}
            />
        )

        fireEvent.click(screen.getByText('Save'))
        expect(mockSave).toHaveBeenCalledTimes(1)
    })

    test('calls onDiscard when Discard button is clicked', () => {
        const mockSave = jest.fn()
        const mockDiscard = jest.fn()
        const mockCancel = jest.fn()

        render(
            <UnsavedChangesDialog
                isOpen={true}
                onSave={mockSave}
                onDiscard={mockDiscard}
                onCancel={mockCancel}
            />
        )

        fireEvent.click(screen.getByText('Discard'))
        expect(mockDiscard).toHaveBeenCalledTimes(1)
    })

    test('calls onCancel when Cancel button is clicked', () => {
        const mockSave = jest.fn()
        const mockDiscard = jest.fn()
        const mockCancel = jest.fn()

        render(
            <UnsavedChangesDialog
                isOpen={true}
                onSave={mockSave}
                onDiscard={mockDiscard}
                onCancel={mockCancel}
            />
        )

        fireEvent.click(screen.getByText('Cancel'))
        expect(mockCancel).toHaveBeenCalledTimes(1)
    })

    test('calls onCancel when overlay is clicked', () => {
        const mockSave = jest.fn()
        const mockDiscard = jest.fn()
        const mockCancel = jest.fn()

        render(
            <UnsavedChangesDialog
                isOpen={true}
                onSave={mockSave}
                onDiscard={mockDiscard}
                onCancel={mockCancel}
            />
        )

        const cancelButton = screen.getByText('Cancel')
        fireEvent.click(cancelButton)
        expect(mockCancel).toHaveBeenCalledTimes(1)
    })

    test('does not call onCancel when dialog content is clicked', () => {
        const mockSave = jest.fn()
        const mockDiscard = jest.fn()
        const mockCancel = jest.fn()

        render(
            <UnsavedChangesDialog
                isOpen={true}
                onSave={mockSave}
                onDiscard={mockDiscard}
                onCancel={mockCancel}
            />
        )

        const title = screen.getByText('Unsaved Changes')
        fireEvent.click(title)
        expect(mockCancel).not.toHaveBeenCalled()
    })
})
