import React from 'react'
import { render, screen, fireEvent, act } from '@testing-library/react'
import InfiniteCanvas from '../components/InfiniteCanvas'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('InfiniteCanvas Link Selection and Context Menu', () => {
    test('link shows selection state when clicked', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create a task (which auto-selects)
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        // Find the link handle and click it to create a state and link
        const texts = screen.queryAllByTestId('konva-text')
        const linkHandle = texts.find(
            (text) => text.getAttribute('data-text') === '→'
        )
        expect(linkHandle).toBeTruthy()

        await act(async () => {
            if (linkHandle) {
                fireEvent.mouseDown(linkHandle)
            }
        })

        // Link should have been created
        const arrows = screen.queryAllByTestId('konva-arrow')
        expect(arrows.length).toBe(1)

        // Initially link should not be selected (gray)
        expect(arrows[0].getAttribute('data-stroke')).toBe('#6b7280')

        // Click the arrow to select it
        await act(async () => {
            fireEvent.click(arrows[0])
        })

        // Arrow should now be selected (blue, thicker)
        expect(arrows[0].getAttribute('data-stroke')).toBe('#2196f3')
        expect(arrows[0].getAttribute('data-stroke-width')).toBe('3')
    })

    test('selected link shows action buttons', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create a task and link
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        const texts = screen.queryAllByTestId('konva-text')
        const linkHandle = texts.find(
            (text) => text.getAttribute('data-text') === '→'
        )

        await act(async () => {
            if (linkHandle) {
                fireEvent.mouseDown(linkHandle)
            }
        })

        // Find and click the arrow to select it
        const arrows = screen.queryAllByTestId('konva-arrow')
        expect(arrows.length).toBe(1)

        await act(async () => {
            fireEvent.click(arrows[0])
        })

        // Look for action buttons (should have delete and reassign buttons)
        const allTexts = screen.queryAllByTestId('konva-text')
        const deleteButton = allTexts.find(
            (text) => text.getAttribute('data-text') === '✕'
        )
        const reassignStartButton = allTexts.find(
            (text) => text.getAttribute('data-text') === '⇤'
        )
        const reassignEndButton = allTexts.find(
            (text) => text.getAttribute('data-text') === '⇥'
        )

        // All action buttons should be visible when link is selected
        expect(deleteButton).toBeTruthy()
        expect(reassignStartButton).toBeTruthy()
        expect(reassignEndButton).toBeTruthy()
    })

    test('clicking empty canvas clears link selection', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create a task and link
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        const texts = screen.queryAllByTestId('konva-text')
        const linkHandle = texts.find(
            (text) => text.getAttribute('data-text') === '→'
        )

        await act(async () => {
            if (linkHandle) {
                fireEvent.mouseDown(linkHandle)
            }
        })

        // Find and click the arrow to select it
        const arrows = screen.queryAllByTestId('konva-arrow')
        expect(arrows.length).toBe(1)

        await act(async () => {
            fireEvent.click(arrows[0])
        })

        // Arrow should be selected (blue)
        expect(arrows[0].getAttribute('data-stroke')).toBe('#2196f3')

        // Click on stage to deselect
        const stage = screen.getByTestId('konva-stage')
        await act(async () => {
            fireEvent.click(stage)
        })

        // Arrow should be deselected (gray)
        expect(arrows[0].getAttribute('data-stroke')).toBe('#6b7280')
    })

    test('delete button opens confirmation dialog', async () => {
        const ref = React.createRef<any>()
        const { container } = render(<InfiniteCanvas ref={ref} />)

        // Create a task and link
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        const texts = screen.queryAllByTestId('konva-text')
        const linkHandle = texts.find(
            (text) => text.getAttribute('data-text') === '→'
        )

        await act(async () => {
            if (linkHandle) {
                fireEvent.mouseDown(linkHandle)
            }
        })

        // Find and click the arrow to select it
        const arrows = screen.queryAllByTestId('konva-arrow')
        expect(arrows.length).toBe(1)

        await act(async () => {
            fireEvent.click(arrows[0])
        })

        // Find the delete button (red rectangle) within the link's action buttons
        const rects = screen.queryAllByTestId('konva-rect')
        const deleteButton = rects.find(
            (rect) => rect.getAttribute('data-fill') === '#ef4444'
        )
        expect(deleteButton).toBeTruthy()

        await act(async () => {
            if (deleteButton) {
                fireEvent.click(deleteButton)
            }
        })

        // Check that confirmation dialog appears
        const dialog = container.querySelector('.confirm-dialog')
        expect(dialog).toBeInTheDocument()

        // Check dialog title
        const dialogTitle = container.querySelector('.confirm-dialog-title')
        expect(dialogTitle?.textContent).toBe('Delete Link')
    })

    test('confirming deletion removes the link', async () => {
        const ref = React.createRef<any>()
        const { container } = render(<InfiniteCanvas ref={ref} />)

        // Create a task and link
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        const texts = screen.queryAllByTestId('konva-text')
        const linkHandle = texts.find(
            (text) => text.getAttribute('data-text') === '→'
        )

        await act(async () => {
            if (linkHandle) {
                fireEvent.mouseDown(linkHandle)
            }
        })

        // Verify link was created
        let arrows = screen.queryAllByTestId('konva-arrow')
        expect(arrows.length).toBe(1)

        // Find and click the arrow to select it
        await act(async () => {
            fireEvent.click(arrows[0])
        })

        // Find and click the delete button
        const rects = screen.queryAllByTestId('konva-rect')
        const deleteButton = rects.find(
            (rect) => rect.getAttribute('data-fill') === '#ef4444'
        )

        await act(async () => {
            if (deleteButton) {
                fireEvent.click(deleteButton)
            }
        })

        // Find and click the confirm button
        const confirmButton = container.querySelector(
            '.confirm-dialog-actions button.confirm'
        )
        expect(confirmButton).toBeTruthy()

        await act(async () => {
            if (confirmButton) {
                fireEvent.click(confirmButton)
            }
        })

        // Verify link was removed
        arrows = screen.queryAllByTestId('konva-arrow')
        expect(arrows.length).toBe(0)
    })

    test('canceling deletion keeps the link', async () => {
        const ref = React.createRef<any>()
        const { container } = render(<InfiniteCanvas ref={ref} />)

        // Create a task and link
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        const texts = screen.queryAllByTestId('konva-text')
        const linkHandle = texts.find(
            (text) => text.getAttribute('data-text') === '→'
        )

        await act(async () => {
            if (linkHandle) {
                fireEvent.mouseDown(linkHandle)
            }
        })

        // Verify link was created
        let arrows = screen.queryAllByTestId('konva-arrow')
        expect(arrows.length).toBe(1)

        // Find and click the arrow to select it
        await act(async () => {
            fireEvent.click(arrows[0])
        })

        // Find and click the delete button
        const rects = screen.queryAllByTestId('konva-rect')
        const deleteButton = rects.find(
            (rect) => rect.getAttribute('data-fill') === '#ef4444'
        )

        await act(async () => {
            if (deleteButton) {
                fireEvent.click(deleteButton)
            }
        })

        // Find and click the cancel button
        const cancelButton = container.querySelector(
            '.confirm-dialog-actions button:not(.confirm-btn)'
        )
        expect(cancelButton).toBeTruthy()

        await act(async () => {
            if (cancelButton) {
                fireEvent.click(cancelButton)
            }
        })

        // Verify link still exists
        arrows = screen.queryAllByTestId('konva-arrow')
        expect(arrows.length).toBe(1)
    })

    test('reassign start button is clickable', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create a task and link
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        const texts = screen.queryAllByTestId('konva-text')
        const linkHandle = texts.find(
            (text) => text.getAttribute('data-text') === '→'
        )

        await act(async () => {
            if (linkHandle) {
                fireEvent.mouseDown(linkHandle)
            }
        })

        // Find and click the arrow to select it
        const arrows = screen.queryAllByTestId('konva-arrow')
        expect(arrows.length).toBe(1)

        await act(async () => {
            fireEvent.click(arrows[0])
        })

        // Find all purple rectangles (reassign buttons)
        const rects = screen.queryAllByTestId('konva-rect')
        const purpleButtons = rects.filter(
            (rect) => rect.getAttribute('data-fill') === '#8b5cf6'
        )
        expect(purpleButtons.length).toBeGreaterThanOrEqual(2)

        // Click the first purple button (reassign start)
        await act(async () => {
            fireEvent.click(purpleButtons[0])
        })

        // Check that placeholder message was logged
        expect(consoleSpy).toHaveBeenCalled()
        const calls = consoleSpy.mock.calls
        const matchingCall = calls.find((call) =>
            call.some(
                (arg) =>
                    typeof arg === 'string' &&
                    arg.includes('Reassign start for link:')
            )
        )
        expect(matchingCall).toBeTruthy()

        consoleSpy.mockRestore()
    })

    test('reassign end button is clickable', async () => {
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create a task and link
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        const texts = screen.queryAllByTestId('konva-text')
        const linkHandle = texts.find(
            (text) => text.getAttribute('data-text') === '→'
        )

        await act(async () => {
            if (linkHandle) {
                fireEvent.mouseDown(linkHandle)
            }
        })

        // Find and click the arrow to select it
        const arrows = screen.queryAllByTestId('konva-arrow')
        expect(arrows.length).toBe(1)

        await act(async () => {
            fireEvent.click(arrows[0])
        })

        // Find all purple rectangles (reassign buttons)
        const rects = screen.queryAllByTestId('konva-rect')
        const purpleButtons = rects.filter(
            (rect) => rect.getAttribute('data-fill') === '#8b5cf6'
        )
        expect(purpleButtons.length).toBeGreaterThanOrEqual(2)

        // Click the second purple button (reassign end)
        await act(async () => {
            fireEvent.click(purpleButtons[1])
        })

        // Check that placeholder message was logged
        expect(consoleSpy).toHaveBeenCalled()
        const calls = consoleSpy.mock.calls
        const matchingCall = calls.find((call) =>
            call.some(
                (arg) =>
                    typeof arg === 'string' &&
                    arg.includes('Reassign end for link:')
            )
        )
        expect(matchingCall).toBeTruthy()

        consoleSpy.mockRestore()
    })
})
