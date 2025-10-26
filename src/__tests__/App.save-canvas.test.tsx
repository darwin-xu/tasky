import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import * as canvasService from '../services/canvasService'

// Mock react-konva
jest.mock('react-konva', () => require('../testUtils/mockKonva'))

// Mock the canvasService module
jest.mock('../services/canvasService')

describe('App - Save Canvas Functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
        // Setup default mocks
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([])
        ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(null)
        ;(canvasService.getCanvas as jest.Mock).mockReturnValue(null)
        ;(canvasService.saveCanvas as jest.Mock).mockImplementation(
            (data, id) => {
                const canvasId = id || 'canvas-123'
                return {
                    ...data,
                    id: canvasId,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z',
                }
            }
        )
        ;(canvasService.clearCurrentCanvasId as jest.Mock).mockReturnValue(
            undefined
        )
    })

    describe('AC1 – Initial Save', () => {
        it('should show modal when saving a new canvas for the first time', () => {
            render(<App />)

            // Open the Data menu
            const dataButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataButton)

            // Click Save Canvas
            const saveButton = screen.getByLabelText('Save Canvas')
            fireEvent.click(saveButton)

            // Modal should be shown
            expect(screen.getByText('Save Canvas')).toBeInTheDocument()
            expect(screen.getByLabelText('Canvas Name')).toBeInTheDocument()
        })

        it('should save canvas with user-provided name and store it', async () => {
            // Mock alert
            const alertMock = jest.spyOn(window, 'alert').mockImplementation()

            render(<App />)

            // Create a task first to have something to save
            const createTaskButton = screen.getByLabelText('Create Task')
            fireEvent.click(createTaskButton)

            // Open the Data menu and click Save Canvas
            const dataButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataButton)
            const saveButton = screen.getByLabelText('Save Canvas')
            fireEvent.click(saveButton)

            // Fill in the canvas name
            const nameInput = screen.getByLabelText('Canvas Name')
            fireEvent.change(nameInput, {
                target: { value: 'My First Canvas' },
            })

            // Click Save button in modal
            const modalSaveButton = screen.getByRole('button', { name: 'Save' })
            fireEvent.click(modalSaveButton)

            // Verify saveCanvas was called
            await waitFor(() => {
                expect(canvasService.saveCanvas).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'My First Canvas',
                    }),
                    undefined
                )
            })

            // Verify success alert
            expect(alertMock).toHaveBeenCalledWith(
                'Canvas "My First Canvas" saved successfully!'
            )

            alertMock.mockRestore()
        })
    })

    describe('AC2 – Subsequent Saves', () => {
        it('should save directly without modal when canvas already has a name', async () => {
            const alertMock = jest.spyOn(window, 'alert').mockImplementation()

            // Setup: Canvas already exists
            const existingCanvas = {
                id: 'canvas-123',
                name: 'Existing Canvas',
                tasks: [],
                states: [],
                links: [],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(
                'canvas-123'
            )
            ;(canvasService.getCanvas as jest.Mock).mockReturnValue(
                existingCanvas
            )

            render(<App />)

            // Canvas should be loaded with name
            await waitFor(() => {
                expect(canvasService.getCanvas).toHaveBeenCalledWith(
                    'canvas-123'
                )
            })

            // Create a task to make canvas dirty
            const createTaskButton = screen.getByLabelText('Create Task')
            fireEvent.click(createTaskButton)

            // Click Save Canvas
            const dataButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataButton)
            const saveButton = screen.getByLabelText('Save Canvas')
            fireEvent.click(saveButton)

            // Modal should NOT be shown - save should happen directly
            await waitFor(() => {
                expect(
                    screen.queryByText('Save Canvas')
                ).not.toBeInTheDocument()
            })

            // Verify saveCanvas was called with existing name and ID
            await waitFor(() => {
                expect(canvasService.saveCanvas).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'Existing Canvas',
                    }),
                    'canvas-123'
                )
            })

            // Verify success alert
            expect(alertMock).toHaveBeenCalledWith(
                'Canvas "Existing Canvas" saved successfully!'
            )

            alertMock.mockRestore()
        })
    })

    describe('AC3 – Save As', () => {
        it('should show modal when using Save As even if canvas has a name', async () => {
            // Setup: Canvas already exists
            const existingCanvas = {
                id: 'canvas-123',
                name: 'Existing Canvas',
                tasks: [],
                states: [],
                links: [],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(
                'canvas-123'
            )
            ;(canvasService.getCanvas as jest.Mock).mockReturnValue(
                existingCanvas
            )

            render(<App />)

            await waitFor(() => {
                expect(canvasService.getCanvas).toHaveBeenCalledWith(
                    'canvas-123'
                )
            })

            // Open Data menu
            const dataButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataButton)

            // Click Save Canvas As
            const saveAsButton = screen.getByLabelText('Save Canvas As')
            fireEvent.click(saveAsButton)

            // Modal should be shown with current name
            expect(screen.getByText('Save Canvas')).toBeInTheDocument()
            const nameInput = screen.getByLabelText(
                'Canvas Name'
            ) as HTMLInputElement
            expect(nameInput.value).toBe('Existing Canvas')
        })

        it('should allow saving under a new name with Save As', async () => {
            const alertMock = jest.spyOn(window, 'alert').mockImplementation()

            // Setup: Canvas already exists
            const existingCanvas = {
                id: 'canvas-123',
                name: 'Original Canvas',
                tasks: [],
                states: [],
                links: [],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(
                'canvas-123'
            )
            ;(canvasService.getCanvas as jest.Mock).mockReturnValue(
                existingCanvas
            )

            render(<App />)

            await waitFor(() => {
                expect(canvasService.getCanvas).toHaveBeenCalledWith(
                    'canvas-123'
                )
            })

            // Click Save Canvas As
            const dataButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataButton)
            const saveAsButton = screen.getByLabelText('Save Canvas As')
            fireEvent.click(saveAsButton)

            // Change the name
            const nameInput = screen.getByLabelText('Canvas Name')
            fireEvent.change(nameInput, {
                target: { value: 'New Copy Canvas' },
            })

            // Save
            const modalSaveButton = screen.getByRole('button', { name: 'Save' })
            fireEvent.click(modalSaveButton)

            // Verify saveCanvas was called with new name but existing ID
            await waitFor(() => {
                expect(canvasService.saveCanvas).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'New Copy Canvas',
                    }),
                    'canvas-123'
                )
            })

            alertMock.mockRestore()
        })
    })

    describe('AC5 – Edge Case: Deleted Canvas', () => {
        it('should show modal if saved canvas was deleted', async () => {
            const alertMock = jest.spyOn(window, 'alert').mockImplementation()

            // Setup: Canvas exists initially
            const existingCanvas = {
                id: 'canvas-123',
                name: 'Deleted Canvas',
                tasks: [],
                states: [],
                links: [],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(
                'canvas-123'
            )
            // First call returns the canvas, subsequent calls return null (simulating deletion)
            ;(canvasService.getCanvas as jest.Mock)
                .mockReturnValueOnce(existingCanvas)
                .mockReturnValue(null)

            render(<App />)

            // Canvas should be loaded initially
            await waitFor(() => {
                expect(canvasService.getCanvas).toHaveBeenCalledWith(
                    'canvas-123'
                )
            })

            // Now simulate the canvas being deleted externally
            // When we try to save, getCanvas will return null

            // Try to save
            const dataButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataButton)
            const saveButton = screen.getByLabelText('Save Canvas')
            fireEvent.click(saveButton)

            // Modal should be shown because canvas no longer exists
            await waitFor(() => {
                expect(screen.getByText('Save Canvas')).toBeInTheDocument()
            })
            expect(screen.getByLabelText('Canvas Name')).toBeInTheDocument()

            // Verify clearCurrentCanvasId was called
            expect(canvasService.clearCurrentCanvasId).toHaveBeenCalled()

            alertMock.mockRestore()
        })
    })
})
