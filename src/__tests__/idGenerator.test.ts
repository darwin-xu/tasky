import { generateId, resetIdCounter } from '../utils/idGenerator'

describe('idGenerator', () => {
    beforeEach(() => {
        resetIdCounter()
    })

    test('generateId creates unique IDs with prefix', () => {
        const id1 = generateId('task')
        const id2 = generateId('task')

        expect(id1).toMatch(/^task-\d+-\d+$/)
        expect(id2).toMatch(/^task-\d+-\d+$/)
        expect(id1).not.toBe(id2)
    })

    test('generateId uses different prefixes', () => {
        const taskId = generateId('task')
        const stateId = generateId('state')
        const linkId = generateId('link')

        expect(taskId).toMatch(/^task-/)
        expect(stateId).toMatch(/^state-/)
        expect(linkId).toMatch(/^link-/)
    })

    test('generateId increments counter for rapid calls', () => {
        const id1 = generateId('test')
        const id2 = generateId('test')
        const id3 = generateId('test')

        // Extract counter values from IDs
        const counter1 = parseInt(id1.split('-')[2])
        const counter2 = parseInt(id2.split('-')[2])
        const counter3 = parseInt(id3.split('-')[2])

        expect(counter2).toBe(counter1 + 1)
        expect(counter3).toBe(counter2 + 1)
    })

    test('resetIdCounter resets the counter to 0', () => {
        generateId('test')
        generateId('test')
        generateId('test')

        resetIdCounter()

        const id = generateId('test')
        const counter = parseInt(id.split('-')[2])

        expect(counter).toBe(0)
    })

    test('counter wraps around at 10000', () => {
        // This test simulates the counter wrapping
        resetIdCounter()

        // Generate 10000 IDs to wrap the counter
        for (let i = 0; i < 10000; i++) {
            generateId('test')
        }

        const id = generateId('test')
        const counter = parseInt(id.split('-')[2])

        expect(counter).toBe(0)
    })
})
