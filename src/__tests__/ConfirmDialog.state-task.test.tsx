import React from 'react'
import { render, screen } from '@testing-library/react'
import ConfirmDialog from '../components/ConfirmDialog'

describe('ConfirmDialog - State vs Task Messages', () => {
    test('shows correct title and message for state deletion', () => {
        const mockConfirm = jest.fn()
        const mockCancel = jest.fn()

        render(
            <ConfirmDialog
                isOpen={true}
                title="Delete State"
                message="Are you sure you want to delete this state? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={mockConfirm}
                onCancel={mockCancel}
            />
        )

        expect(screen.getByText('Delete State')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Are you sure you want to delete this state? This action cannot be undone.'
            )
        ).toBeInTheDocument()
    })

    test('shows correct title and message for task deletion', () => {
        const mockConfirm = jest.fn()
        const mockCancel = jest.fn()

        render(
            <ConfirmDialog
                isOpen={true}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                onConfirm={mockConfirm}
                onCancel={mockCancel}
            />
        )

        expect(screen.getByText('Delete Task')).toBeInTheDocument()
        expect(
            screen.getByText(
                'Are you sure you want to delete this task? This action cannot be undone.'
            )
        ).toBeInTheDocument()
    })
})
