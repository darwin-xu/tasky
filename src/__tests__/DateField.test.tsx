import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { DateField } from '../components/DateField'

describe('DateField Component', () => {
    const mockOnChange = jest.fn()

    beforeEach(() => {
        mockOnChange.mockClear()
    })

    test('renders with default label and className', () => {
        render(<DateField id="test-date" value="" onChange={mockOnChange} />)

        const label = screen.getByText('Date')
        const input = screen.getByTestId('date-input')

        expect(label).toBeTruthy()
        expect(input).toBeTruthy()
    })

    test('renders with custom label', () => {
        render(
            <DateField
                id="test-date"
                value=""
                onChange={mockOnChange}
                label="Custom Date"
            />
        )

        const label = screen.getByText('Custom Date')
        expect(label).toBeTruthy()
    })

    test('renders with custom testId', () => {
        render(
            <DateField
                id="test-date"
                value=""
                onChange={mockOnChange}
                testId="custom-date-input"
            />
        )

        const input = screen.getByTestId('custom-date-input')
        expect(input).toBeTruthy()
    })

    test('renders with custom className', () => {
        const { container } = render(
            <DateField
                id="test-date"
                value=""
                onChange={mockOnChange}
                className="custom-field"
            />
        )

        const fieldDiv = container.querySelector('.custom-field')
        expect(fieldDiv).toBeTruthy()
    })

    test('displays error message when error prop is provided', () => {
        render(
            <DateField
                id="test-date"
                value=""
                onChange={mockOnChange}
                error="Invalid date format"
            />
        )

        const errorMessage = screen.getByTestId('date-error')
        expect(errorMessage).toBeTruthy()
        expect(errorMessage.textContent).toBe('Invalid date format')
    })

    test('does not display error message when error prop is not provided', () => {
        render(<DateField id="test-date" value="" onChange={mockOnChange} />)

        const errorMessage = screen.queryByTestId('date-error')
        expect(errorMessage).toBeNull()
    })

    test('calls onChange when input value changes', () => {
        render(<DateField id="test-date" value="" onChange={mockOnChange} />)

        const input = screen.getByTestId('date-input')
        fireEvent.change(input, { target: { value: '2024-01-15' } })

        expect(mockOnChange).toHaveBeenCalledWith('2024-01-15')
        expect(mockOnChange).toHaveBeenCalledTimes(1)
    })

    test('displays the provided value', () => {
        render(
            <DateField
                id="test-date"
                value="2024-01-15"
                onChange={mockOnChange}
            />
        )

        const input = screen.getByTestId('date-input') as HTMLInputElement
        expect(input.value).toBe('2024-01-15')
    })

    test('has placeholder text', () => {
        render(<DateField id="test-date" value="" onChange={mockOnChange} />)

        const input = screen.getByTestId('date-input') as HTMLInputElement
        expect(input.placeholder).toBe('YYYY-MM-DD')
    })
})
