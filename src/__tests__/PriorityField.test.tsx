import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { PriorityField } from '../components/PriorityField'
import { Priority } from '../utils/priorityHelpers'

describe('PriorityField Component', () => {
    const mockOnChange = jest.fn()

    beforeEach(() => {
        mockOnChange.mockClear()
    })

    test('renders with default label and className', () => {
        render(
            <PriorityField
                id="test-priority"
                value="Medium"
                onChange={mockOnChange}
            />
        )

        const label = screen.getByText('Priority')
        const select = screen.getByTestId('priority-select')

        expect(label).toBeTruthy()
        expect(select).toBeTruthy()
    })

    test('renders with custom label', () => {
        render(
            <PriorityField
                id="test-priority"
                value="Medium"
                onChange={mockOnChange}
                label="Custom Priority"
            />
        )

        const label = screen.getByText('Custom Priority')
        expect(label).toBeTruthy()
    })

    test('renders with custom testId', () => {
        render(
            <PriorityField
                id="test-priority"
                value="Medium"
                onChange={mockOnChange}
                testId="custom-priority-select"
            />
        )

        const select = screen.getByTestId('custom-priority-select')
        expect(select).toBeTruthy()
    })

    test('renders with custom className', () => {
        const { container } = render(
            <PriorityField
                id="test-priority"
                value="Medium"
                onChange={mockOnChange}
                className="custom-field"
            />
        )

        const fieldDiv = container.querySelector('.custom-field')
        expect(fieldDiv).toBeTruthy()
    })

    test('displays all priority options', () => {
        render(
            <PriorityField
                id="test-priority"
                value="Medium"
                onChange={mockOnChange}
            />
        )

        const select = screen.getByTestId(
            'priority-select'
        ) as HTMLSelectElement
        const options = Array.from(select.options).map((opt) => opt.value)

        expect(options).toEqual(['Low', 'Medium', 'High'])
    })

    test('displays the selected value', () => {
        render(
            <PriorityField
                id="test-priority"
                value="High"
                onChange={mockOnChange}
            />
        )

        const select = screen.getByTestId(
            'priority-select'
        ) as HTMLSelectElement
        expect(select.value).toBe('High')
    })

    test('calls onChange when selection changes', () => {
        render(
            <PriorityField
                id="test-priority"
                value="Medium"
                onChange={mockOnChange}
            />
        )

        const select = screen.getByTestId('priority-select')
        fireEvent.change(select, { target: { value: 'High' } })

        expect(mockOnChange).toHaveBeenCalledWith('High')
        expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    test('handles all priority values correctly', () => {
        const priorities: Priority[] = ['Low', 'Medium', 'High']

        priorities.forEach((priority) => {
            const { rerender } = render(
                <PriorityField
                    id="test-priority"
                    value={priority}
                    onChange={mockOnChange}
                />
            )

            const select = screen.getByTestId(
                'priority-select'
            ) as HTMLSelectElement
            expect(select.value).toBe(priority)

            // Clean up for next iteration
            rerender(<div />)
        })
    })
})
