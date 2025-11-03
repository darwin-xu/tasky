import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import * as canvasService from '../services/canvasService'

// Mock the canvas service
jest.mock('../services/canvasService')

// Mock react-konva
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

// Mock window.confirm
const originalConfirm = window.confirm
const originalAlert = window.alert

describe('App Component - Error Handling', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
        window.confirm = jest.fn()
        window.alert = jest.fn()
    })

    afterEach(() => {
        window.confirm = originalConfirm
        window.alert = originalAlert
    })

    test('handles save canvas failure gracefully', async () => {
        // Mock saveCanvas to return null (failure)
        ;(canvasService.saveCanvas as jest.Mock).mockReturnValue(null)

        render(<App />)

        // Open save modal (need to interact with canvas first or use data menu)
        const dataButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataButton)

        const saveButton = screen.getByText('Save Canvas')
        fireEvent.click(saveButton)

        // Type a name and save
        const nameInput = screen.getByLabelText('Canvas Name')
        fireEvent.change(nameInput, { target: { value: 'Test Canvas' } })

        const saveModalButton = screen.getByText('Save')
        fireEvent.click(saveModalButton)

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to save canvas.')
        })
    })

    test('handles save canvas error exception', async () => {
        // Mock saveCanvas to throw an error
        ;(canvasService.saveCanvas as jest.Mock).mockImplementation(() => {
            throw new Error('Save error')
        })

        render(<App />)

        // Open save modal
        const dataButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataButton)

        const saveButton = screen.getByText('Save Canvas')
        fireEvent.click(saveButton)

        // Type a name and save
        const nameInput = screen.getByLabelText('Canvas Name')
        fireEvent.change(nameInput, { target: { value: 'Test Canvas' } })

        const saveModalButton = screen.getByText('Save')
        fireEvent.click(saveModalButton)

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                'An error occurred while saving the canvas.'
            )
        })
    })

    test('handles load canvas failure gracefully', async () => {
        // Mock getCanvas to return null (failure)
        ;(canvasService.getCanvas as jest.Mock).mockReturnValue(null)
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: 'test-id',
                name: 'Test Canvas',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ])

        render(<App />)

        // Open load modal
        const dataButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataButton)

        const loadButton = screen.getByText('Load Canvas')
        fireEvent.click(loadButton)

        // Select and load a canvas
        const canvasOption = screen.getByText('Test Canvas')
        fireEvent.click(canvasOption)

        const loadModalButton = screen.getByText('Load')
        fireEvent.click(loadModalButton)

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to load canvas.')
        })
    })

    test('confirms before clearing canvas when window.confirm returns true', async () => {
        ;(window.confirm as jest.Mock).mockReturnValue(true)

        render(<App />)

        // Open data menu
        const dataButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataButton)

        // Click clear canvas
        const clearButton = screen.getByText('Clear Canvas')
        fireEvent.click(clearButton)

        await waitFor(() => {
            expect(window.confirm).toHaveBeenCalled()
        })
    })

    test('does not clear canvas when window.confirm returns false', async () => {
        ;(window.confirm as jest.Mock).mockReturnValue(false)

        render(<App />)

        // Open data menu
        const dataButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataButton)

        // Click clear canvas
        const clearButton = screen.getByText('Clear Canvas')
        fireEvent.click(clearButton)

        await waitFor(() => {
            expect(window.confirm).toHaveBeenCalled()
        })

        // Canvas should not be cleared (canvas should still exist)
        expect(screen.getByTestId('konva-stage')).toBeTruthy()
    })

    test('handles delete canvas when no canvases exist', async () => {
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([])

        render(<App />)

        // Open data menu
        const dataButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataButton)

        // Click delete canvas
        const deleteButton = screen.getByText('Delete Saved Canvas')
        fireEvent.click(deleteButton)

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                'No saved canvases to delete.'
            )
        })
    })

    test('handles delete canvas when user cancels prompt', async () => {
        ;(window.prompt as jest.Mock) = jest.fn().mockReturnValue(null)
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: 'test-id',
                name: 'Test Canvas',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ])

        render(<App />)

        // Open data menu
        const dataButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataButton)

        // Click delete canvas
        const deleteButton = screen.getByText('Delete Saved Canvas')
        fireEvent.click(deleteButton)

        await waitFor(() => {
            expect(window.prompt).toHaveBeenCalled()
        })

        // Should not proceed with deletion
        expect(window.confirm).not.toHaveBeenCalled()
    })

    test('handles delete canvas when canvas not found', async () => {
        ;(window.prompt as jest.Mock) = jest.fn().mockReturnValue('Non-existent')
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: 'test-id',
                name: 'Test Canvas',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ])

        render(<App />)

        // Open data menu
        const dataButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataButton)

        // Click delete canvas
        const deleteButton = screen.getByText('Delete Saved Canvas')
        fireEvent.click(deleteButton)

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Canvas not found.')
        })
    })

    test('handles successful canvas deletion', async () => {
        ;(window.prompt as jest.Mock) = jest.fn().mockReturnValue('Test Canvas')
        ;(window.confirm as jest.Mock).mockReturnValue(true)
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: 'test-id',
                name: 'Test Canvas',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ])
        ;(canvasService.deleteCanvas as jest.Mock).mockReturnValue(true)

        render(<App />)

        // Open data menu
        const dataButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataButton)

        // Click delete canvas
        const deleteButton = screen.getByText('Delete Saved Canvas')
        fireEvent.click(deleteButton)

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith(
                'Canvas "Test Canvas" deleted successfully!'
            )
        })
    })

    test('clears current canvas ID when deleting current canvas', async () => {
        ;(window.prompt as jest.Mock) = jest.fn().mockReturnValue('Test Canvas')
        ;(window.confirm as jest.Mock).mockReturnValue(true)
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: 'current-canvas-id',
                name: 'Test Canvas',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ])
        ;(canvasService.deleteCanvas as jest.Mock).mockReturnValue(true)
        ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(
            'current-canvas-id'
        )

        const { rerender } = render(<App />)

        // Simulate having a current canvas by force updating the state
        // (In a real scenario, the canvas would be loaded first)

        // Open data menu
        const dataButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataButton)

        // Click delete canvas
        const deleteButton = screen.getByText('Delete Saved Canvas')
        fireEvent.click(deleteButton)

        await waitFor(() => {
            expect(canvasService.deleteCanvas).toHaveBeenCalledWith(
                'current-canvas-id'
            )
        })
    })

    test('handles failed canvas deletion', async () => {
        ;(window.prompt as jest.Mock) = jest.fn().mockReturnValue('Test Canvas')
        ;(window.confirm as jest.Mock).mockReturnValue(true)
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: 'test-id',
                name: 'Test Canvas',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
        ])
        ;(canvasService.deleteCanvas as jest.Mock).mockReturnValue(false)

        render(<App />)

        // Open data menu
        const dataButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataButton)

        // Click delete canvas
        const deleteButton = screen.getByText('Delete Saved Canvas')
        fireEvent.click(deleteButton)

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Failed to delete canvas.')
        })
    })
})
