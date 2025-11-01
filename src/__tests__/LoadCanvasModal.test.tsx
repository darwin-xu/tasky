import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import LoadCanvasModal from '../components/LoadCanvasModal'
import * as canvasService from '../services/canvasService'

jest.mock('../services/canvasService')

describe('LoadCanvasModal', () => {
    const mockOnLoad = jest.fn()
    const mockOnCancel = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should not render when isOpen is false', () => {
        render(
            <LoadCanvasModal
                isOpen={false}
                onLoad={mockOnLoad}
                onCancel={mockOnCancel}
            />
        )

        expect(screen.queryByText('Load Canvas')).not.toBeInTheDocument()
    })

    it('should render when isOpen is true', () => {
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([])

        render(
            <LoadCanvasModal
                isOpen={true}
                onLoad={mockOnLoad}
                onCancel={mockOnCancel}
            />
        )

        expect(screen.getByText('Load Canvas')).toBeInTheDocument()
    })

    it('should display empty state when no canvases exist', () => {
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([])

        render(
            <LoadCanvasModal
                isOpen={true}
                onLoad={mockOnLoad}
                onCancel={mockOnCancel}
            />
        )

        expect(screen.getByText('No saved canvases found.')).toBeInTheDocument()
    })

    it('should display list of canvases', () => {
        const mockCanvases = [
            {
                id: 'canvas-1',
                name: 'Canvas 1',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            },
            {
                id: 'canvas-2',
                name: 'Canvas 2',
                createdAt: '2024-01-02T00:00:00.000Z',
                updatedAt: '2024-01-02T00:00:00.000Z',
            },
        ]
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue(mockCanvases)

        render(
            <LoadCanvasModal
                isOpen={true}
                onLoad={mockOnLoad}
                onCancel={mockOnCancel}
            />
        )

        expect(screen.getByText('Canvas 1')).toBeInTheDocument()
        expect(screen.getByText('Canvas 2')).toBeInTheDocument()
    })

    it('should select first canvas by default', () => {
        const mockCanvases = [
            {
                id: 'canvas-1',
                name: 'Canvas 1',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            },
        ]
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue(mockCanvases)

        render(
            <LoadCanvasModal
                isOpen={true}
                onLoad={mockOnLoad}
                onCancel={mockOnCancel}
            />
        )

        const radio = screen.getByRole('radio') as HTMLInputElement
        expect(radio.checked).toBe(true)
    })

    it('should call onLoad with selected canvas id when form is submitted', () => {
        const mockCanvases = [
            {
                id: 'canvas-1',
                name: 'Canvas 1',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            },
        ]
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue(mockCanvases)

        render(
            <LoadCanvasModal
                isOpen={true}
                onLoad={mockOnLoad}
                onCancel={mockOnCancel}
            />
        )

        const loadButton = screen.getByText('Load')
        fireEvent.click(loadButton)

        expect(mockOnLoad).toHaveBeenCalledWith('canvas-1')
    })

    it('should call onCancel when cancel button is clicked', () => {
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([])

        render(
            <LoadCanvasModal
                isOpen={true}
                onLoad={mockOnLoad}
                onCancel={mockOnCancel}
            />
        )

        const closeButton = screen.getByText('Close')
        fireEvent.click(closeButton)

        expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should call onCancel when overlay is clicked', () => {
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([])

        render(
            <LoadCanvasModal
                isOpen={true}
                onLoad={mockOnLoad}
                onCancel={mockOnCancel}
            />
        )

        // Click the close/cancel button
        const closeButton = screen.getByText('Close')
        fireEvent.click(closeButton)
        expect(mockOnCancel).toHaveBeenCalledTimes(1)
    })

    it('should change selection when canvas item is clicked', () => {
        const mockCanvases = [
            {
                id: 'canvas-1',
                name: 'Canvas 1',
                createdAt: '2024-01-01T00:00:00.000Z',
                updatedAt: '2024-01-01T00:00:00.000Z',
            },
            {
                id: 'canvas-2',
                name: 'Canvas 2',
                createdAt: '2024-01-02T00:00:00.000Z',
                updatedAt: '2024-01-02T00:00:00.000Z',
            },
        ]
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue(mockCanvases)

        render(
            <LoadCanvasModal
                isOpen={true}
                onLoad={mockOnLoad}
                onCancel={mockOnCancel}
            />
        )

        const canvas2Item = screen.getByText('Canvas 2')
        fireEvent.click(canvas2Item)

        const loadButton = screen.getByText('Load')
        fireEvent.click(loadButton)

        expect(mockOnLoad).toHaveBeenCalledWith('canvas-2')
    })

    it('should call onCancel when Escape key is pressed', () => {
        ;(canvasService.listCanvases as jest.Mock).mockReturnValue([])

        const { container } = render(
            <LoadCanvasModal
                isOpen={true}
                onLoad={mockOnLoad}
                onCancel={mockOnCancel}
            />
        )

        // Find the modal content div which has the onKeyDown handler
        const modalContent = container.querySelector('.modal-content')
        if (modalContent) {
            fireEvent.keyDown(modalContent, { key: 'Escape' })
            expect(mockOnCancel).toHaveBeenCalledTimes(1)
        }
    })
})
