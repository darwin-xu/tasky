import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import * as canvasService from '../services/canvasService'
import { CanvasData } from '../types'

// Mock react-konva
jest.mock('react-konva', () => require('../testUtils/mockKonva'))

jest.mock('../services/canvasService')

describe('App - Save Canvas Functionality', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    afterEach(() => {
        localStorage.clear()
    })

    describe('AC1 - Initial Save', () => {
        test('shows modal on first save when canvas has no name', async () => {
            ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(
                null
            )

            render(<App />)

            // Open the Data menu
            const dataMenuButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataMenuButton)

            // Click on Save Canvas
            const saveCanvasButton = screen.getByLabelText('Save Canvas')
            fireEvent.click(saveCanvasButton)

            // Verify modal appears
            await waitFor(() => {
                expect(screen.getByText('Save Canvas')).toBeInTheDocument()
            })

            // Verify input field is present
            expect(screen.getByLabelText('Canvas Name')).toBeInTheDocument()
        })

        test('stores canvas name after first save', async () => {
            const mockSavedCanvas: CanvasData = {
                id: 'canvas-123',
                name: 'My First Canvas',
                tasks: [],
                states: [],
                links: [],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(
                null
            )
            ;(canvasService.saveCanvas as jest.Mock).mockReturnValue(
                mockSavedCanvas
            )

            const alertMock = jest.spyOn(window, 'alert').mockImplementation()

            render(<App />)

            // Open the Data menu
            const dataMenuButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataMenuButton)

            // Click on Save Canvas
            const saveCanvasButton = screen.getByLabelText('Save Canvas')
            fireEvent.click(saveCanvasButton)

            // Wait for modal and enter name
            await waitFor(() => {
                expect(screen.getByLabelText('Canvas Name')).toBeInTheDocument()
            })

            const nameInput = screen.getByLabelText('Canvas Name')
            fireEvent.change(nameInput, {
                target: { value: 'My First Canvas' },
            })

            // Click Save button
            const saveButton = screen.getByRole('button', { name: 'Save' })
            fireEvent.click(saveButton)

            // Verify saveCanvas was called with correct data
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

    describe('AC2 - Subsequent Saves', () => {
        test('saves directly without modal when canvas has a name', async () => {
            const mockCanvas: CanvasData = {
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
            ;(canvasService.getCanvas as jest.Mock).mockReturnValue(mockCanvas)
            ;(canvasService.saveCanvas as jest.Mock).mockReturnValue(mockCanvas)

            const alertMock = jest.spyOn(window, 'alert').mockImplementation()

            render(<App />)

            // Create a task to make canvas dirty
            const createButton = screen.getByLabelText('Create Task')
            fireEvent.click(createButton)

            // Open the Data menu
            const dataMenuButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataMenuButton)

            // Click on Save Canvas
            const saveCanvasButton = screen.getByLabelText('Save Canvas')
            fireEvent.click(saveCanvasButton)

            // Verify modal does NOT appear
            await waitFor(() => {
                expect(
                    screen.queryByText('Save Canvas')
                ).not.toBeInTheDocument()
            })

            // Verify saveCanvas was called with existing canvas ID
            expect(canvasService.saveCanvas).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Existing Canvas',
                }),
                'canvas-123'
            )

            // Verify success alert
            expect(alertMock).toHaveBeenCalledWith(
                'Canvas "Existing Canvas" saved successfully!'
            )

            alertMock.mockRestore()
        })

        test('saves with same name on multiple saves', async () => {
            const mockCanvas: CanvasData = {
                id: 'canvas-123',
                name: 'Persistent Canvas',
                tasks: [],
                states: [],
                links: [],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(
                'canvas-123'
            )
            ;(canvasService.getCanvas as jest.Mock).mockReturnValue(mockCanvas)
            ;(canvasService.saveCanvas as jest.Mock).mockReturnValue(mockCanvas)

            const alertMock = jest.spyOn(window, 'alert').mockImplementation()

            render(<App />)

            // Save first time
            const dataMenuButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataMenuButton)
            const saveCanvasButton = screen.getByLabelText('Save Canvas')
            fireEvent.click(saveCanvasButton)

            await waitFor(() => {
                expect(canvasService.saveCanvas).toHaveBeenCalledTimes(1)
            })

            // Save second time - should still use same name
            fireEvent.click(dataMenuButton)
            const saveCanvasButton2 = screen.getByLabelText('Save Canvas')
            fireEvent.click(saveCanvasButton2)

            await waitFor(() => {
                expect(canvasService.saveCanvas).toHaveBeenCalledTimes(2)
            })

            // Both calls should use the same name
            expect(canvasService.saveCanvas).toHaveBeenNthCalledWith(
                1,
                expect.objectContaining({ name: 'Persistent Canvas' }),
                'canvas-123'
            )
            expect(canvasService.saveCanvas).toHaveBeenNthCalledWith(
                2,
                expect.objectContaining({ name: 'Persistent Canvas' }),
                'canvas-123'
            )

            alertMock.mockRestore()
        })
    })

    describe('AC3 - Save As', () => {
        test('Save As always shows modal even when canvas has a name', async () => {
            const mockCanvas: CanvasData = {
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
            ;(canvasService.getCanvas as jest.Mock).mockReturnValue(mockCanvas)

            render(<App />)

            // Open the Data menu
            const dataMenuButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataMenuButton)

            // Click on Save As
            const saveAsButton = screen.getByLabelText('Save As Canvas')
            fireEvent.click(saveAsButton)

            // Verify modal appears even though canvas has a name
            await waitFor(() => {
                expect(screen.getByText('Save Canvas')).toBeInTheDocument()
            })

            expect(screen.getByLabelText('Canvas Name')).toBeInTheDocument()
        })

        test('Save As can save with a new name', async () => {
            const mockCanvas: CanvasData = {
                id: 'canvas-123',
                name: 'Original Canvas',
                tasks: [],
                states: [],
                links: [],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            const mockNewCanvas: CanvasData = {
                id: 'canvas-456',
                name: 'New Canvas Name',
                tasks: [],
                states: [],
                links: [],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(
                'canvas-123'
            )
            ;(canvasService.getCanvas as jest.Mock).mockReturnValue(mockCanvas)
            ;(canvasService.saveCanvas as jest.Mock).mockReturnValue(
                mockNewCanvas
            )

            const alertMock = jest.spyOn(window, 'alert').mockImplementation()

            render(<App />)

            // Open the Data menu
            const dataMenuButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataMenuButton)

            // Click on Save As
            const saveAsButton = screen.getByLabelText('Save As Canvas')
            fireEvent.click(saveAsButton)

            // Wait for modal
            await waitFor(() => {
                expect(screen.getByLabelText('Canvas Name')).toBeInTheDocument()
            })

            // Change the name
            const nameInput = screen.getByLabelText('Canvas Name')
            fireEvent.change(nameInput, {
                target: { value: 'New Canvas Name' },
            })

            // Click Save
            const saveButton = screen.getByRole('button', { name: 'Save' })
            fireEvent.click(saveButton)

            // Verify saveCanvas was called with new name
            await waitFor(() => {
                expect(canvasService.saveCanvas).toHaveBeenCalledWith(
                    expect.objectContaining({
                        name: 'New Canvas Name',
                    }),
                    'canvas-123'
                )
            })

            alertMock.mockRestore()
        })
    })

    describe('AC5 - Edge Case: Deleted Canvas', () => {
        test('prompts for new name if saved canvas is deleted', async () => {
            // Setup: Canvas was loaded with ID and name
            ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(
                'canvas-123'
            )
            // But getCanvas returns null (canvas was deleted)
            ;(canvasService.getCanvas as jest.Mock).mockReturnValue(null)

            render(<App />)

            // Open the Data menu
            const dataMenuButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataMenuButton)

            // Click on Save Canvas
            const saveCanvasButton = screen.getByLabelText('Save Canvas')
            fireEvent.click(saveCanvasButton)

            // Verify modal appears because canvas was deleted
            await waitFor(() => {
                expect(screen.getByText('Save Canvas')).toBeInTheDocument()
            })

            expect(screen.getByLabelText('Canvas Name')).toBeInTheDocument()
        })

        test('clears current canvas ID when canvas is deleted', async () => {
            const mockCanvas: CanvasData = {
                id: 'canvas-123',
                name: 'Original Canvas',
                tasks: [],
                states: [],
                links: [],
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            }

            // Initially return the canvas (so it gets loaded on mount)
            ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(
                'canvas-123'
            )
            let getCanvasCalls = 0
            ;(canvasService.getCanvas as jest.Mock).mockImplementation(() => {
                getCanvasCalls++
                if (getCanvasCalls === 1) {
                    // First call during mount - canvas exists
                    return mockCanvas
                } else {
                    // Subsequent calls - canvas was deleted
                    return null
                }
            })
            ;(
                canvasService.clearCurrentCanvasId as jest.Mock
            ).mockImplementation()

            render(<App />)

            // Wait for canvas to be loaded
            await waitFor(() => {
                expect(canvasService.getCanvas).toHaveBeenCalledWith(
                    'canvas-123'
                )
            })

            // Now click save - canvas should be detected as deleted
            const dataMenuButton = screen.getByLabelText('Data Menu')
            fireEvent.click(dataMenuButton)
            const saveCanvasButton = screen.getByLabelText('Save Canvas')
            fireEvent.click(saveCanvasButton)

            // Verify clearCurrentCanvasId was called
            await waitFor(() => {
                expect(
                    canvasService.clearCurrentCanvasId
                ).toHaveBeenCalledTimes(1)
            })

            // Verify modal appears
            await waitFor(() => {
                expect(screen.getByText('Save Canvas')).toBeInTheDocument()
            })
        })
    })
})
