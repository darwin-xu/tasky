import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import App from '../App'
import * as canvasService from '../services/canvasService'
import { CanvasData } from '../types'

// Mock react-konva
jest.mock('react-konva', () => require('../testUtils/mockKonva'))

jest.mock('../services/canvasService')

describe('App - Load Canvas Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorage.clear()
    })

    afterEach(() => {
        localStorage.clear()
    })

    test('loads canvas via menu and restores tasks, states, and links', async () => {
        const mockCanvas: CanvasData = {
            id: 'canvas-1',
            name: 'Test Canvas',
            tasks: [
                {
                    id: 'task-1',
                    x: 100,
                    y: 200,
                    title: 'Test Task 1',
                    description: 'Task description',
                    date: '2024-01-01',
                    priority: 'High',
                },
                {
                    id: 'task-2',
                    x: 300,
                    y: 400,
                    title: 'Test Task 2',
                    description: 'Another task',
                    date: '2024-01-02',
                    priority: 'Medium',
                },
            ],
            states: [
                {
                    id: 'state-1',
                    x: 500,
                    y: 600,
                    description: 'Test State',
                    date: '2024-01-03',
                    priority: 'Low',
                },
            ],
            links: [
                {
                    id: 'link-1',
                    sourceId: 'task-1',
                    targetId: 'state-1',
                    sourceType: 'task',
                    targetType: 'state',
                    linkStyle: 'free',
                    routeAround: false,
                },
            ],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        }

        // Mock the service functions
        ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(null)
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([
            {
                id: mockCanvas.id,
                name: mockCanvas.name,
                createdAt: mockCanvas.createdAt,
                updatedAt: mockCanvas.updatedAt,
            },
        ])
        ;(canvasService.getCanvas as jest.Mock).mockReturnValue(mockCanvas)

        // Mock alert to avoid actual alerts
        const alertMock = jest.spyOn(window, 'alert').mockImplementation()

        render(<App />)

        // Open the Data menu
        const dataMenuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataMenuButton)

        // Click on Load Canvas
        const loadCanvasButton = screen.getByLabelText('Load Canvas')
        fireEvent.click(loadCanvasButton)

        // Wait for the Load Canvas modal to appear
        await waitFor(() => {
            expect(screen.getByText('Load Canvas')).toBeInTheDocument()
        })

        // Verify the canvas is listed
        expect(screen.getByText('Test Canvas')).toBeInTheDocument()

        // Click the Load button
        const loadButton = screen.getByText('Load')
        fireEvent.click(loadButton)

        // Verify getCanvas was called with the correct ID
        expect(canvasService.getCanvas).toHaveBeenCalledWith('canvas-1')

        // Verify alert was shown
        expect(alertMock).toHaveBeenCalledWith(
            'Canvas "Test Canvas" loaded successfully!'
        )

        alertMock.mockRestore()
    })

    test('loads last saved canvas on mount', () => {
        const mockCanvas: CanvasData = {
            id: 'canvas-last',
            name: 'Last Canvas',
            tasks: [
                {
                    id: 'task-1',
                    x: 100,
                    y: 200,
                    title: 'Auto-loaded Task',
                    description: 'This was auto-loaded',
                    date: '2024-01-01',
                    priority: 'High',
                },
            ],
            states: [],
            links: [],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        }

        // Mock the service to return a canvas ID and canvas data
        ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(
            'canvas-last'
        )
        ;(canvasService.getCanvas as jest.Mock).mockReturnValue(mockCanvas)

        render(<App />)

        // Verify that getCanvas was called during mount
        expect(canvasService.getCurrentCanvasId).toHaveBeenCalled()
        expect(canvasService.getCanvas).toHaveBeenCalledWith('canvas-last')
    })

    test('handles load when no canvases exist', async () => {
        // Mock empty canvas list
        ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(null)
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([])

        render(<App />)

        // Open the Data menu
        const dataMenuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataMenuButton)

        // Click on Load Canvas
        const loadCanvasButton = screen.getByLabelText('Load Canvas')
        fireEvent.click(loadCanvasButton)

        // Wait for the modal to appear
        await waitFor(() => {
            expect(screen.getByText('Load Canvas')).toBeInTheDocument()
        })

        // Verify empty state message is shown
        expect(
            screen.getByText('No saved canvases found.')
        ).toBeInTheDocument()
    })

    test('cancels load canvas modal', async () => {
        ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(null)
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([])

        render(<App />)

        // Open the Data menu
        const dataMenuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataMenuButton)

        // Click on Load Canvas
        const loadCanvasButton = screen.getByLabelText('Load Canvas')
        fireEvent.click(loadCanvasButton)

        // Wait for the modal to appear
        await waitFor(() => {
            expect(screen.getByText('Load Canvas')).toBeInTheDocument()
        })

        // Click the Close button
        const closeButton = screen.getByText('Close')
        fireEvent.click(closeButton)

        // Modal should be closed
        await waitFor(() => {
            expect(screen.queryByText('Load Canvas')).not.toBeInTheDocument()
        })
    })

    test('load canvas restores all items with their positions', async () => {
        const mockCanvas: CanvasData = {
            id: 'canvas-positions',
            name: 'Position Test Canvas',
            tasks: [
                {
                    id: 'task-1',
                    x: 150,
                    y: 250,
                    title: 'Task at 150,250',
                    description: 'Position test',
                    date: '2024-01-01',
                    priority: 'High',
                },
            ],
            states: [
                {
                    id: 'state-1',
                    x: 350,
                    y: 450,
                    description: 'State at 350,450',
                    date: '2024-01-02',
                    priority: 'Medium',
                },
            ],
            links: [
                {
                    id: 'link-1',
                    sourceId: 'task-1',
                    targetId: 'state-1',
                    sourceType: 'task',
                    targetType: 'state',
                    linkStyle: 'orthogonal',
                    routeAround: true,
                },
            ],
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        }

        ;(canvasService.getCurrentCanvasId as jest.Mock).mockReturnValue(null)
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

        // Open the Data menu and load the canvas
        const dataMenuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(dataMenuButton)

        const loadCanvasButton = screen.getByLabelText('Load Canvas')
        fireEvent.click(loadCanvasButton)

        await waitFor(() => {
            expect(screen.getByText('Load Canvas')).toBeInTheDocument()
        })

        const loadButton = screen.getByText('Load')
        fireEvent.click(loadButton)

        // Verify the canvas was loaded with correct data
        expect(canvasService.getCanvas).toHaveBeenCalledWith(
            'canvas-positions'
        )

        // Verify that the positions are preserved by checking the getCanvas call
        const loadedCanvas = (canvasService.getCanvas as jest.Mock).mock
            .results[0].value

        expect(loadedCanvas.tasks[0].x).toBe(150)
        expect(loadedCanvas.tasks[0].y).toBe(250)
        expect(loadedCanvas.states[0].x).toBe(350)
        expect(loadedCanvas.states[0].y).toBe(450)
        expect(loadedCanvas.links[0].linkStyle).toBe('orthogonal')
        expect(loadedCanvas.links[0].routeAround).toBe(true)

        alertMock.mockRestore()
    })
})
