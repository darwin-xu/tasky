import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ConfirmDialog from '../components/ConfirmDialog'

describe('ConfirmDialog Component', () => {
    test('does not render when isOpen is false', () => {
        const mockConfirm = jest.fn()
        const mockCancel = jest.fn()

        const { container } = render(
            <ConfirmDialog
                isOpen={false}
                title="Test Title"
                message="Test Message"
                onConfirm={mockConfirm}
                onCancel={mockCancel}
            />
        )

        expect(container.firstChild).toBeNull()
    })

    test('renders when isOpen is true', () => {
        const mockConfirm = jest.fn()
        const mockCancel = jest.fn()

        render(
            <ConfirmDialog
                isOpen={true}
                title="Test Title"
                message="Test Message"
                onConfirm={mockConfirm}
                onCancel={mockCancel}
            />
        )

        expect(screen.getByText('Test Title')).toBeInTheDocument()
        expect(screen.getByText('Test Message')).toBeInTheDocument()
    })

    test('renders default button labels', () => {
        const mockConfirm = jest.fn()
        const mockCancel = jest.fn()

        render(
            <ConfirmDialog
                isOpen={true}
                title="Test Title"
                message="Test Message"
                onConfirm={mockConfirm}
                onCancel={mockCancel}
            />
        )

        expect(screen.getByText('Confirm')).toBeInTheDocument()
        expect(screen.getByText('Cancel')).toBeInTheDocument()
    })

    test('renders custom button labels', () => {
        const mockConfirm = jest.fn()
        const mockCancel = jest.fn()

        render(
            <ConfirmDialog
                isOpen={true}
                title="Test Title"
                message="Test Message"
                confirmLabel="Delete"
                cancelLabel="No Thanks"
                onConfirm={mockConfirm}
                onCancel={mockCancel}
            />
        )

        expect(screen.getByText('Delete')).toBeInTheDocument()
        expect(screen.getByText('No Thanks')).toBeInTheDocument()
    })

    test('calls onConfirm when confirm button is clicked', () => {
        const mockConfirm = jest.fn()
        const mockCancel = jest.fn()

        render(
            <ConfirmDialog
                isOpen={true}
                title="Test Title"
                message="Test Message"
                onConfirm={mockConfirm}
                onCancel={mockCancel}
            />
        )

        fireEvent.click(screen.getByText('Confirm'))
        expect(mockConfirm).toHaveBeenCalledTimes(1)
    })

    test('calls onCancel when cancel button is clicked', () => {
        const mockConfirm = jest.fn()
        const mockCancel = jest.fn()

        render(
            <ConfirmDialog
                isOpen={true}
                title="Test Title"
                message="Test Message"
                onConfirm={mockConfirm}
                onCancel={mockCancel}
            />
        )

        fireEvent.click(screen.getByText('Cancel'))
        expect(mockCancel).toHaveBeenCalledTimes(1)
    })

    test('calls onCancel when overlay is clicked', () => {
        const mockConfirm = jest.fn()
        const mockCancel = jest.fn()

        render(
            <ConfirmDialog
                isOpen={true}
                title="Test Title"
                message="Test Message"
                onConfirm={mockConfirm}
                onCancel={mockCancel}
            />
        )

        const overlay = document.querySelector('.confirm-dialog-overlay')
        if (overlay) {
            fireEvent.click(overlay)
            expect(mockCancel).toHaveBeenCalledTimes(1)
        }
    })

    test('does not call onCancel when dialog content is clicked', () => {
        const mockConfirm = jest.fn()
        const mockCancel = jest.fn()

        render(
            <ConfirmDialog
                isOpen={true}
                title="Test Title"
                message="Test Message"
                onConfirm={mockConfirm}
                onCancel={mockCancel}
            />
        )

        const dialog = document.querySelector('.confirm-dialog')
        if (dialog) {
            fireEvent.click(dialog)
            expect(mockCancel).not.toHaveBeenCalled()
        }
    })
})
