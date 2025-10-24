import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import * as canvasService from '../services/canvasService'
import { CanvasData } from '../types'

// Mock react-konva
jest.mock('react-konva', () => require('../testUtils/mockKonva'))

jest.mock('../services/canvasService')

describe('App - Unsaved Changes Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
        ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(null)
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([])
    })

    afterEach(() => {
        localStorage.clear()
    })

    test('shows unsaved changes dialog when loading canvas with unsaved changes', async () => {
        const mockCanvas: CanvasData = {
            id: 'canvas-1',
            name: 'Test Canvas',
            tasks: [],
            states: [],
            links: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        }

        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: mockCanvas.id,
                name: mockCanvas.name,
                createdAt: mockCanvas.createdAt,
                updatedAt: mockCanvas.updatedAt,
            },
        ])
        ;(canvasService.getCanvas as jest.Mock).mockReturnValue(mockCanvas)

        const alertMock = jest.spyOn(window, 'alert').mockImplementation()

        render(<App />)

        // Create a task to make the canvas dirty
        const createTaskButton = screen.getByLabelText('Create Task')
        fireEvent.click(createTaskButton)

        // Open the Data menu and try to load a canvas
        const dataMenuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataMenuButton)

        const loadCanvasButton = screen.getByLabelText('Load Canvas')
        fireEvent.click(loadCanvasButton)

        await waitFor(() => {
            expect(screen.getByText('Load Canvas')).toBeInTheDocument()
        })

        // Click the Load button
        const loadButton = screen.getByText('Load')
        fireEvent.click(loadButton)

        // Should show the unsaved changes dialog
        await waitFor(() => {
            expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
        })

        alertMock.mockRestore()
    })

    test('discards unsaved changes and loads canvas when Discard is clicked', async () => {
        const mockCanvas: CanvasData = {
            id: 'canvas-1',
            name: 'Test Canvas',
            tasks: [
                {
                    id: 'task-1',
                    x: 100,
                    y: 200,
                    title: 'Loaded Task',
                    description: 'Task from saved canvas',
                    date: '2024-01-01',
                    priority: 'High',
                },
            ],
            states: [],
            links: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        }

        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: mockCanvas.id,
                name: mockCanvas.name,
                createdAt: mockCanvas.createdAt,
                updatedAt: mockCanvas.updatedAt,
            },
        ])
        ;(canvasService.getCanvas as jest.Mock).mockReturnValue(mockCanvas)

        const alertMock = jest.spyOn(window, 'alert').mockImplementation()

        render(<App />)

        // Create a task to make the canvas dirty
        const createTaskButton = screen.getByLabelText('Create Task')
        fireEvent.click(createTaskButton)

        // Open the Data menu and try to load a canvas
        const dataMenuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataMenuButton)

        const loadCanvasButton = screen.getByLabelText('Load Canvas')
        fireEvent.click(loadCanvasButton)

        await waitFor(() => {
            expect(screen.getByText('Load Canvas')).toBeInTheDocument()
        })

        // Click the Load button
        const loadButton = screen.getByText('Load')
        fireEvent.click(loadButton)

        // Wait for unsaved changes dialog
        await waitFor(() => {
            expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
        })

        // Click Discard
        const discardButton = screen.getByText('Discard')
        fireEvent.click(discardButton)

        // Verify the canvas was loaded
        await waitFor(() => {
            expect(canvasService.getCanvas).toHaveBeenCalledWith('canvas-1')
        })

        expect(alertMock).toHaveBeenCalledWith(
            'Canvas "Test Canvas" loaded successfully!'
        )

        alertMock.mockRestore()
    })

    test('cancels load when Cancel is clicked in unsaved changes dialog', async () => {
        const mockCanvas: CanvasData = {
            id: 'canvas-1',
            name: 'Test Canvas',
            tasks: [],
            states: [],
            links: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        }

        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: mockCanvas.id,
                name: mockCanvas.name,
                createdAt: mockCanvas.createdAt,
                updatedAt: mockCanvas.updatedAt,
            },
        ])
        ;(canvasService.getCanvas as jest.Mock).mockReturnValue(mockCanvas)

        const alertMock = jest.spyOn(window, 'alert').mockImplementation()

        render(<App />)

        // Create a task to make the canvas dirty
        const createTaskButton = screen.getByLabelText('Create Task')
        fireEvent.click(createTaskButton)

        // Open the Data menu and try to load a canvas
        const dataMenuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataMenuButton)

        const loadCanvasButton = screen.getByLabelText('Load Canvas')
        fireEvent.click(loadCanvasButton)

        await waitFor(() => {
            expect(screen.getByText('Load Canvas')).toBeInTheDocument()
        })

        // Click the Load button
        const loadButton = screen.getByText('Load')
        fireEvent.click(loadButton)

        // Wait for unsaved changes dialog
        await waitFor(() => {
            expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
        })

        // Click Cancel
        const cancelButtons = screen.getAllByText('Cancel')
        const unsavedChangesCancel = cancelButtons[cancelButtons.length - 1]
        fireEvent.click(unsavedChangesCancel)

        // Verify the canvas was NOT loaded
        expect(canvasService.getCanvas).not.toHaveBeenCalled()
        expect(alertMock).not.toHaveBeenCalled()

        // Dialog should be closed
        await waitFor(() => {
            expect(
                screen.queryByText('Unsaved Changes')
            ).not.toBeInTheDocument()
        })

        alertMock.mockRestore()
    })

    test('opens save modal when Save is clicked in unsaved changes dialog', async () => {
        const mockCanvas: CanvasData = {
            id: 'canvas-1',
            name: 'Test Canvas',
            tasks: [],
            states: [],
            links: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        }

        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: mockCanvas.id,
                name: mockCanvas.name,
                createdAt: mockCanvas.createdAt,
                updatedAt: mockCanvas.updatedAt,
            },
        ])

        render(<App />)

        // Create a task to make the canvas dirty
        const createTaskButton = screen.getByLabelText('Create Task')
        fireEvent.click(createTaskButton)

        // Open the Data menu and try to load a canvas
        const dataMenuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataMenuButton)

        const loadCanvasButton = screen.getByLabelText('Load Canvas')
        fireEvent.click(loadCanvasButton)

        await waitFor(() => {
            expect(screen.getByText('Load Canvas')).toBeInTheDocument()
        })

        // Click the Load button
        const loadButton = screen.getByText('Load')
        fireEvent.click(loadButton)

        // Wait for unsaved changes dialog
        await waitFor(() => {
            expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
        })

        // Click Save
        const saveButtons = screen.getAllByText('Save')
        const unsavedChangesSave = saveButtons[saveButtons.length - 1]
        fireEvent.click(unsavedChangesSave)

        // Should open the Save Canvas modal
        await waitFor(() => {
            expect(screen.getByText('Save Canvas')).toBeInTheDocument()
        })
    })

    test('shows unsaved changes dialog when clearing canvas with unsaved changes', async () => {
        const confirmMock = jest.spyOn(window, 'confirm').mockReturnValue(true)

        render(<App />)

        // Create a task to make the canvas dirty
        const createTaskButton = screen.getByLabelText('Create Task')
        fireEvent.click(createTaskButton)

        // Open the Data menu and try to clear
        const dataMenuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataMenuButton)

        const clearCanvasButton = screen.getByLabelText('Clear Canvas')
        fireEvent.click(clearCanvasButton)

        // Should show the unsaved changes dialog
        await waitFor(() => {
            expect(screen.getByText('Unsaved Changes')).toBeInTheDocument()
        })

        confirmMock.mockRestore()
    })

    test('does not show unsaved changes dialog when loading canvas without changes', async () => {
        const mockCanvas: CanvasData = {
            id: 'canvas-1',
            name: 'Test Canvas',
            tasks: [],
            states: [],
            links: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        }

        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: mockCanvas.id,
                name: mockCanvas.name,
                createdAt: mockCanvas.createdAt,
                updatedAt: mockCanvas.updatedAt,
            },
        ])
        ;(canvasService.getCanvas as jest.Mock).mockReturnValue(mockCanvas)

        const alertMock = jest.spyOn(window, 'alert').mockImplementation()

        render(<App />)

        // Open the Data menu and load a canvas (no unsaved changes)
        const dataMenuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataMenuButton)

        const loadCanvasButton = screen.getByLabelText('Load Canvas')
        fireEvent.click(loadCanvasButton)

        await waitFor(() => {
            expect(screen.getByText('Load Canvas')).toBeInTheDocument()
        })

        // Click the Load button
        const loadButton = screen.getByText('Load')
        fireEvent.click(loadButton)

        // Should NOT show the unsaved changes dialog
        expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()

        // Should directly load the canvas
        await waitFor(() => {
            expect(canvasService.getCanvas).toHaveBeenCalledWith('canvas-1')
        })

        alertMock.mockRestore()
    })

    test('resets dirty state after saving canvas', async () => {
        const mockSavedCanvas: CanvasData = {
            id: 'canvas-new',
            name: 'My Canvas',
            tasks: [],
            states: [],
            links: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        }

        ;(canvasService.saveCanvas as jest.Mock).mockReturnValue(
            mockSavedCanvas
        )

        const alertMock = jest.spyOn(window, 'alert').mockImplementation()

        render(<App />)

        // Create a task to make the canvas dirty
        const createTaskButton = screen.getByLabelText('Create Task')
        fireEvent.click(createTaskButton)

        // Open the Data menu and save
        const dataMenuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataMenuButton)

        const saveCanvasButton = screen.getByLabelText('Save Canvas')
        fireEvent.click(saveCanvasButton)

        await waitFor(() => {
            expect(screen.getByText('Save Canvas')).toBeInTheDocument()
        })

        // Enter canvas name and save
        const nameInput = screen.getByLabelText('Canvas Name')
        fireEvent.change(nameInput, { target: { value: 'My Canvas' } })

        const saveButton = screen.getByText('Save')
        fireEvent.click(saveButton)

        // Verify canvas was saved
        expect(canvasService.saveCanvas).toHaveBeenCalled()

        // Now try to load a canvas - should NOT show unsaved changes dialog
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: mockSavedCanvas.id,
                name: mockSavedCanvas.name,
                createdAt: mockSavedCanvas.createdAt,
                updatedAt: mockSavedCanvas.updatedAt,
            },
        ])
        ;(canvasService.getCanvas as jest.Mock).mockReturnValue(mockSavedCanvas)

        fireEvent.click(dataMenuButton)
        const loadCanvasButton = screen.getByLabelText('Load Canvas')
        fireEvent.click(loadCanvasButton)

        await waitFor(() => {
            expect(screen.getByText('Load Canvas')).toBeInTheDocument()
        })

        const loadButton = screen.getByText('Load')
        fireEvent.click(loadButton)

        // Should NOT show unsaved changes dialog
        expect(screen.queryByText('Unsaved Changes')).not.toBeInTheDocument()

        alertMock.mockRestore()
    })
})
