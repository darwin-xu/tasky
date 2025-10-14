/* eslint-disable testing-library/prefer-screen-queries, testing-library/no-unnecessary-act, testing-library/no-container, testing-library/no-node-access */
import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'
import InfiniteCanvas, { InfiniteCanvasRef } from '../components/InfiniteCanvas'

// Mock Konva for testing environment
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

jest.mock('konva/lib/Node', () => ({
    KonvaEventObject: {},
}))

jest.mock('konva', () => ({
    default: {},
}))

describe('InfiniteCanvas - State Card Editing', () => {
    test('opens state editor modal on state card double-click', async () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state
        act(() => {
            canvasRef.current?.createState()
        })

        // Find the state card group and simulate double-click
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups.find((group) => {
            return group.getAttribute('data-x') && group.getAttribute('data-y')
        })

        expect(stateGroup).toBeTruthy()

        act(() => {
            fireEvent.doubleClick(stateGroup!)
        })

        // Wait for the editor modal to appear
        await waitFor(() => {
            expect(screen.getByTestId('state-editor-modal')).toBeInTheDocument()
        })
    })

    test('state editor modal displays current state data', async () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state
        act(() => {
            canvasRef.current?.createState()
        })

        // Find and double-click the state card
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups.find((group) => {
            return group.getAttribute('data-x') && group.getAttribute('data-y')
        })

        act(() => {
            fireEvent.doubleClick(stateGroup!)
        })

        await waitFor(() => {
            expect(screen.getByTestId('state-description-input')).toHaveValue('New State')
            expect(screen.getByTestId('state-priority-select')).toHaveValue('Medium')
        })
    })

    test('updates state card when editor saves changes', async () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state
        act(() => {
            canvasRef.current?.createState()
        })

        // Find and double-click the state card
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups.find((group) => {
            return group.getAttribute('data-x') && group.getAttribute('data-y')
        })

        act(() => {
            fireEvent.doubleClick(stateGroup!)
        })

        await waitFor(() => {
            expect(screen.getByTestId('state-editor-modal')).toBeInTheDocument()
        })

        // Update description
        const descriptionInput = screen.getByTestId('state-description-input')
        fireEvent.change(descriptionInput, { target: { value: 'Updated State Description' } })

        // Save changes
        const saveButton = screen.getByTestId('save-button')
        fireEvent.click(saveButton)

        // Wait for modal to close
        await waitFor(() => {
            expect(screen.queryByTestId('state-editor-modal')).not.toBeInTheDocument()
        })

        // Verify the state card was updated
        const texts = screen.getAllByTestId('konva-text')
        const updatedText = texts.find(
            (text) => text.getAttribute('data-text') === 'Updated State Description'
        )
        expect(updatedText).toBeTruthy()
    })

    test('closes state editor modal when cancel is clicked', async () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state
        act(() => {
            canvasRef.current?.createState()
        })

        // Find and double-click the state card
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups.find((group) => {
            return group.getAttribute('data-x') && group.getAttribute('data-y')
        })

        act(() => {
            fireEvent.doubleClick(stateGroup!)
        })

        await waitFor(() => {
            expect(screen.getByTestId('state-editor-modal')).toBeInTheDocument()
        })

        // Update description but cancel
        const descriptionInput = screen.getByTestId('state-description-input')
        fireEvent.change(descriptionInput, { target: { value: 'Cancelled Changes' } })

        // Cancel changes
        const cancelButton = screen.getByTestId('cancel-button')
        fireEvent.click(cancelButton)

        // Wait for modal to close
        await waitFor(() => {
            expect(screen.queryByTestId('state-editor-modal')).not.toBeInTheDocument()
        })

        // Verify the state card was NOT updated
        const texts = screen.getAllByTestId('konva-text')
        const cancelledText = texts.find(
            (text) => text.getAttribute('data-text') === 'Cancelled Changes'
        )
        expect(cancelledText).toBeFalsy()

        // Original text should still be there
        const originalText = texts.find(
            (text) => text.getAttribute('data-text') === 'New State'
        )
        expect(originalText).toBeTruthy()
    })

    test('updates state priority and reflects on card', async () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state
        act(() => {
            canvasRef.current?.createState()
        })

        // Find and double-click the state card
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups.find((group) => {
            return group.getAttribute('data-x') && group.getAttribute('data-y')
        })

        act(() => {
            fireEvent.doubleClick(stateGroup!)
        })

        await waitFor(() => {
            expect(screen.getByTestId('state-editor-modal')).toBeInTheDocument()
        })

        // Change priority
        const prioritySelect = screen.getByTestId('state-priority-select')
        fireEvent.change(prioritySelect, { target: { value: 'High' } })

        // Save changes
        const saveButton = screen.getByTestId('save-button')
        fireEvent.click(saveButton)

        // Wait for modal to close
        await waitFor(() => {
            expect(screen.queryByTestId('state-editor-modal')).not.toBeInTheDocument()
        })

        // Verify priority was updated
        const texts = screen.getAllByTestId('konva-text')
        const priorityText = texts.find(
            (text) => text.getAttribute('data-text') === 'Priority: High'
        )
        expect(priorityText).toBeTruthy()
    })

    test('updates state date and reflects on card', async () => {
        const canvasRef = React.createRef<InfiniteCanvasRef>()
        render(<InfiniteCanvas ref={canvasRef} />)

        // Create a state
        act(() => {
            canvasRef.current?.createState()
        })

        // Find and double-click the state card
        const groups = screen.getAllByTestId('konva-group')
        const stateGroup = groups.find((group) => {
            return group.getAttribute('data-x') && group.getAttribute('data-y')
        })

        act(() => {
            fireEvent.doubleClick(stateGroup!)
        })

        await waitFor(() => {
            expect(screen.getByTestId('state-editor-modal')).toBeInTheDocument()
        })

        // Add date
        const dateInput = screen.getByTestId('state-date-input')
        fireEvent.change(dateInput, { target: { value: '2024-06-15' } })

        // Save changes
        const saveButton = screen.getByTestId('save-button')
        fireEvent.click(saveButton)

        // Wait for modal to close
        await waitFor(() => {
            expect(screen.queryByTestId('state-editor-modal')).not.toBeInTheDocument()
        })

        // Verify date was updated
        const texts = screen.getAllByTestId('konva-text')
        const dateText = texts.find(
            (text) => text.getAttribute('data-text') === '📅 2024-06-15'
        )
        expect(dateText).toBeTruthy()
    })
})
