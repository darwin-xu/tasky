import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Taskbar from '../components/Taskbar'

describe('Taskbar Data Menu', () => {
    const mockCallbacks = {
        onCreateTask: jest.fn(),
        onSaveCanvas: jest.fn(),
        onLoadCanvas: jest.fn(),
        onClearCanvas: jest.fn(),
        onDeleteSavedCanvas: jest.fn(),
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('renders Data menu button', () => {
        render(<Taskbar {...mockCallbacks} />)

        const menuButton = screen.getByLabelText('Data Menu')
        expect(menuButton).toBeInTheDocument()
        expect(menuButton.textContent).toContain('Data')
    })

    test('menu is initially closed', () => {
        render(<Taskbar {...mockCallbacks} />)

        const saveOption = screen.queryByText('Save Canvas')
        expect(saveOption).not.toBeInTheDocument()
    })

    test('opens menu when Data button is clicked', () => {
        render(<Taskbar {...mockCallbacks} />)

        const menuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(menuButton)

        expect(screen.getByText('Save Canvas')).toBeInTheDocument()
        expect(screen.getByText('Load Canvas')).toBeInTheDocument()
        expect(screen.getByText('Clear Canvas')).toBeInTheDocument()
        expect(screen.getByText('Delete Saved Canvas')).toBeInTheDocument()
    })

    test('closes menu when Data button is clicked again', () => {
        render(<Taskbar {...mockCallbacks} />)

        const menuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(menuButton)
        expect(screen.getByText('Save Canvas')).toBeInTheDocument()

        fireEvent.click(menuButton)
        expect(screen.queryByText('Save Canvas')).not.toBeInTheDocument()
    })

    test('calls onSaveCanvas when Save Canvas is clicked', () => {
        render(<Taskbar {...mockCallbacks} />)

        const menuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(menuButton)

        const saveOption = screen.getByText('Save Canvas')
        fireEvent.click(saveOption)

        expect(mockCallbacks.onSaveCanvas).toHaveBeenCalledTimes(1)
    })

    test('calls onLoadCanvas when Load Canvas is clicked', () => {
        render(<Taskbar {...mockCallbacks} />)

        const menuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(menuButton)

        const loadOption = screen.getByText('Load Canvas')
        fireEvent.click(loadOption)

        expect(mockCallbacks.onLoadCanvas).toHaveBeenCalledTimes(1)
    })

    test('calls onClearCanvas when Clear Canvas is clicked', () => {
        render(<Taskbar {...mockCallbacks} />)

        const menuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(menuButton)

        const clearOption = screen.getByText('Clear Canvas')
        fireEvent.click(clearOption)

        expect(mockCallbacks.onClearCanvas).toHaveBeenCalledTimes(1)
    })

    test('calls onDeleteSavedCanvas when Delete Saved Canvas is clicked', () => {
        render(<Taskbar {...mockCallbacks} />)

        const menuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(menuButton)

        const deleteOption = screen.getByText('Delete Saved Canvas')
        fireEvent.click(deleteOption)

        expect(mockCallbacks.onDeleteSavedCanvas).toHaveBeenCalledTimes(1)
    })

    test('closes menu after selecting an option', () => {
        render(<Taskbar {...mockCallbacks} />)

        const menuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(menuButton)

        const saveOption = screen.getByText('Save Canvas')
        fireEvent.click(saveOption)

        expect(screen.queryByText('Save Canvas')).not.toBeInTheDocument()
    })

    test('closes menu when clicking outside', async () => {
        render(<Taskbar {...mockCallbacks} />)

        const menuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(menuButton)

        expect(screen.getByText('Save Canvas')).toBeInTheDocument()

        // Click outside the menu
        fireEvent.mouseDown(document.body)

        await waitFor(() => {
            expect(screen.queryByText('Save Canvas')).not.toBeInTheDocument()
        })
    })

    test('menu button has correct aria attributes', () => {
        render(<Taskbar {...mockCallbacks} />)

        const menuButton = screen.getByLabelText('Data Menu')
        expect(menuButton).toHaveAttribute('aria-expanded', 'false')

        fireEvent.click(menuButton)
        expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    })

    test('menu items have correct role and aria-label attributes', () => {
        render(<Taskbar {...mockCallbacks} />)

        const menuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(menuButton)

        const saveOption = screen.getByLabelText('Save Canvas')
        expect(saveOption).toHaveAttribute('role', 'menuitem')

        const loadOption = screen.getByLabelText('Load Canvas')
        expect(loadOption).toHaveAttribute('role', 'menuitem')

        const clearOption = screen.getByLabelText('Clear Canvas')
        expect(clearOption).toHaveAttribute('role', 'menuitem')

        const deleteOption = screen.getByLabelText('Delete Saved Canvas')
        expect(deleteOption).toHaveAttribute('role', 'menuitem')
    })

    test('dropdown menu has correct role attribute', () => {
        render(<Taskbar {...mockCallbacks} />)

        const menuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(menuButton)

        const dropdown = screen.getByRole('menu')
        expect(dropdown).toBeInTheDocument()
    })

    test('works without optional callbacks', () => {
        render(<Taskbar onCreateTask={mockCallbacks.onCreateTask} />)

        const menuButton = screen.getByLabelText('Data Menu')
        fireEvent.click(menuButton)

        const saveOption = screen.getByText('Save Canvas')
        fireEvent.click(saveOption)

        // Should not throw error
        expect(screen.queryByText('Save Canvas')).not.toBeInTheDocument()
    })
})
