import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Taskbar from '../components/Taskbar'

describe('Taskbar Component', () => {
    test('renders taskbar with title', () => {
        const mockCreateTask = jest.fn()
        const mockCreateState = jest.fn()
        render(<Taskbar onCreateTask={mockCreateTask} onCreateState={mockCreateState} />)

        const title = screen.getByText('Tasky - Infinite Canvas')
        expect(title).toBeInTheDocument()
    })

    test('renders Create Task button', () => {
        const mockCreateTask = jest.fn()
        const mockCreateState = jest.fn()
        render(<Taskbar onCreateTask={mockCreateTask} onCreateState={mockCreateState} />)

        const button = screen.getByText('+ Create Task')
        expect(button).toBeInTheDocument()
        expect(button.tagName).toBe('BUTTON')
    })

    test('calls onCreateTask when Create Task button is clicked', () => {
        const mockCreateTask = jest.fn()
        const mockCreateState = jest.fn()
        render(<Taskbar onCreateTask={mockCreateTask} onCreateState={mockCreateState} />)

        const button = screen.getByText('+ Create Task')
        fireEvent.click(button)

        expect(mockCreateTask).toHaveBeenCalledTimes(1)
    })

    test('Create Task button has correct accessibility attributes', () => {
        const mockCreateTask = jest.fn()
        const mockCreateState = jest.fn()
        render(<Taskbar onCreateTask={mockCreateTask} onCreateState={mockCreateState} />)

        const button = screen.getByLabelText('Create Task')
        expect(button).toBeInTheDocument()
    })

    test('Create Task button has appropriate CSS classes', () => {
        const mockCreateTask = jest.fn()
        const mockCreateState = jest.fn()
        render(<Taskbar onCreateTask={mockCreateTask} onCreateState={mockCreateState} />)

        const button = screen.getByText('+ Create Task')
        expect(button.className).toContain('taskbar-button')
        expect(button.className).toContain('create-task-button')
    })

    test('renders Create State button', () => {
        const mockCreateTask = jest.fn()
        const mockCreateState = jest.fn()
        render(<Taskbar onCreateTask={mockCreateTask} onCreateState={mockCreateState} />)

        const button = screen.getByText('+ Create State')
        expect(button).toBeInTheDocument()
        expect(button.tagName).toBe('BUTTON')
    })

    test('calls onCreateState when Create State button is clicked', () => {
        const mockCreateTask = jest.fn()
        const mockCreateState = jest.fn()
        render(<Taskbar onCreateTask={mockCreateTask} onCreateState={mockCreateState} />)

        const button = screen.getByText('+ Create State')
        fireEvent.click(button)

        expect(mockCreateState).toHaveBeenCalledTimes(1)
    })

    test('Create State button has correct accessibility attributes', () => {
        const mockCreateTask = jest.fn()
        const mockCreateState = jest.fn()
        render(<Taskbar onCreateTask={mockCreateTask} onCreateState={mockCreateState} />)

        const button = screen.getByLabelText('Create State')
        expect(button).toBeInTheDocument()
    })

    test('Create State button has appropriate CSS classes', () => {
        const mockCreateTask = jest.fn()
        const mockCreateState = jest.fn()
        render(<Taskbar onCreateTask={mockCreateTask} onCreateState={mockCreateState} />)

        const button = screen.getByText('+ Create State')
        expect(button.className).toContain('taskbar-button')
        expect(button.className).toContain('create-state-button')
    })
})
