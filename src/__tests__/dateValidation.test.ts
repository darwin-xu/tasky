import { isValidDate, formatDateForDisplay } from '../utils/dateValidation'

describe('dateValidation', () => {
    describe('isValidDate', () => {
        test('accepts empty string', () => {
            expect(isValidDate('')).toBe(true)
        })

        test('accepts valid date in YYYY-MM-DD format', () => {
            expect(isValidDate('2024-01-15')).toBe(true)
            expect(isValidDate('2023-12-31')).toBe(true)
            expect(isValidDate('2024-06-30')).toBe(true)
        })

        test('rejects invalid format', () => {
            expect(isValidDate('01/15/2024')).toBe(false)
            expect(isValidDate('2024-1-15')).toBe(false)
            expect(isValidDate('2024-01-5')).toBe(false)
            expect(isValidDate('24-01-15')).toBe(false)
        })

        test('rejects invalid dates', () => {
            expect(isValidDate('2024-02-31')).toBe(false) // Feb doesn't have 31 days
            expect(isValidDate('2024-13-01')).toBe(false) // Invalid month
            expect(isValidDate('2024-00-01')).toBe(false) // Invalid month
            expect(isValidDate('2024-01-00')).toBe(false) // Invalid day
        })

        test('handles leap years correctly', () => {
            expect(isValidDate('2024-02-29')).toBe(true) // 2024 is a leap year
            expect(isValidDate('2023-02-29')).toBe(false) // 2023 is not a leap year
        })

        test('rejects malformed strings', () => {
            expect(isValidDate('not a date')).toBe(false)
            expect(isValidDate('2024-abc-01')).toBe(false)
            expect(isValidDate('2024-01')).toBe(false)
        })
    })

    describe('formatDateForDisplay', () => {
        test('returns empty string for empty input', () => {
            expect(formatDateForDisplay('')).toBe('')
        })

        test('formats valid date correctly', () => {
            const result = formatDateForDisplay('2024-01-15')
            expect(result).toMatch(/Jan.*15.*2024/)
        })

        test('returns original string for invalid date', () => {
            expect(formatDateForDisplay('invalid')).toBe('invalid')
            expect(formatDateForDisplay('2024-13-01')).toBe('2024-13-01')
        })
    })
})
