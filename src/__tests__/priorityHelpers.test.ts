import {
    getPriorityColor,
    getPriorityLabel,
    Priority,
} from '../utils/priorityHelpers'

describe('priorityHelpers', () => {
    describe('getPriorityColor', () => {
        test('returns correct color for High priority', () => {
            const color = getPriorityColor('High')
            expect(color).toBeTruthy()
            expect(typeof color).toBe('string')
        })

        test('returns correct color for Medium priority', () => {
            const color = getPriorityColor('Medium')
            expect(color).toBeTruthy()
            expect(typeof color).toBe('string')
        })

        test('returns correct color for Low priority', () => {
            const color = getPriorityColor('Low')
            expect(color).toBeTruthy()
            expect(typeof color).toBe('string')
        })

        test('returns default color for unknown priority', () => {
            const color = getPriorityColor('Unknown' as Priority)
            expect(color).toBeTruthy()
            expect(typeof color).toBe('string')
        })

        test('returns different colors for different priorities', () => {
            const highColor = getPriorityColor('High')
            const mediumColor = getPriorityColor('Medium')
            const lowColor = getPriorityColor('Low')

            expect(highColor).not.toBe(mediumColor)
            expect(mediumColor).not.toBe(lowColor)
            expect(highColor).not.toBe(lowColor)
        })
    })

    describe('getPriorityLabel', () => {
        test('returns correct label for High priority', () => {
            const label = getPriorityLabel('High')
            expect(label).toBeTruthy()
            expect(typeof label).toBe('string')
            expect(label).toContain('High')
        })

        test('returns correct label for Medium priority', () => {
            const label = getPriorityLabel('Medium')
            expect(label).toBeTruthy()
            expect(typeof label).toBe('string')
            expect(label).toContain('Medium')
        })

        test('returns correct label for Low priority', () => {
            const label = getPriorityLabel('Low')
            expect(label).toBeTruthy()
            expect(typeof label).toBe('string')
            expect(label).toContain('Low')
        })

        test('returns default label for unknown priority', () => {
            const label = getPriorityLabel('Unknown' as Priority)
            expect(label).toBeTruthy()
            expect(typeof label).toBe('string')
            expect(label).toContain('Priority')
            expect(label).toContain('Unknown')
        })
    })
})
