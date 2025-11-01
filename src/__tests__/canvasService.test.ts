import {
    listCanvases,
    getCanvas,
    getCurrentCanvas,
    createCanvas,
    updateCanvas,
    deleteCanvas,
    saveCanvas,
    getCurrentCanvasId,
    setCurrentCanvasId,
    clearCurrentCanvasId,
} from '../services/canvasService'

describe('Canvas Service', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear()
    })

    describe('createCanvas', () => {
        it('should create a new canvas', () => {
            const canvasData = {
                name: 'Test Canvas',
                tasks: [],
                states: [],
                links: [],
            }

            const result = createCanvas(canvasData)

            expect(result.id).toBeDefined()
            expect(result.name).toBe('Test Canvas')
            expect(result.tasks).toEqual([])
            expect(result.states).toEqual([])
            expect(result.links).toEqual([])
            expect(result.createdAt).toBeDefined()
            expect(result.updatedAt).toBeDefined()
        })

        it('should set the created canvas as current', () => {
            const canvasData = {
                name: 'Test Canvas',
                tasks: [],
                states: [],
                links: [],
            }

            const result = createCanvas(canvasData)
            const currentId = getCurrentCanvasId()

            expect(currentId).toBe(result.id)
        })
    })

    describe('listCanvases', () => {
        it('should return empty array when no canvases exist', () => {
            const result = listCanvases()
            expect(result).toEqual([])
        })

        it('should return list of canvas metadata', () => {
            createCanvas({
                name: 'Canvas 1',
                tasks: [],
                states: [],
                links: [],
            })
            createCanvas({
                name: 'Canvas 2',
                tasks: [],
                states: [],
                links: [],
            })

            const result = listCanvases()

            expect(result).toHaveLength(2)
            expect(result[0].name).toBe('Canvas 1')
            expect(result[1].name).toBe('Canvas 2')
            expect(result[0].id).toBeDefined()
            expect(result[0].createdAt).toBeDefined()
            expect(result[0].updatedAt).toBeDefined()
        })
    })

    describe('getCanvas', () => {
        it('should return null when canvas does not exist', () => {
            const result = getCanvas('nonexistent-id')
            expect(result).toBeNull()
        })

        it('should return canvas by id', () => {
            const canvas = createCanvas({
                name: 'Test Canvas',
                tasks: [
                    {
                        id: 'task-1',
                        x: 100,
                        y: 200,
                        title: 'Test Task',
                    },
                ],
                states: [],
                links: [],
            })

            const result = getCanvas(canvas.id)

            expect(result).not.toBeNull()
            expect(result?.name).toBe('Test Canvas')
            expect(result?.tasks).toHaveLength(1)
            expect(result?.tasks[0].title).toBe('Test Task')
        })
    })

    describe('getCurrentCanvas', () => {
        it('should return null when no current canvas is set', () => {
            const result = getCurrentCanvas()
            expect(result).toBeNull()
        })

        it('should return the current canvas', () => {
            const canvas = createCanvas({
                name: 'Current Canvas',
                tasks: [],
                states: [],
                links: [],
            })

            const result = getCurrentCanvas()

            expect(result).not.toBeNull()
            expect(result?.id).toBe(canvas.id)
            expect(result?.name).toBe('Current Canvas')
        })
    })

    describe('updateCanvas', () => {
        it('should return null when canvas does not exist', () => {
            const result = updateCanvas('nonexistent-id', {
                name: 'Updated',
                tasks: [],
                states: [],
                links: [],
            })
            expect(result).toBeNull()
        })

        it('should update existing canvas', async () => {
            const canvas = createCanvas({
                name: 'Original Name',
                tasks: [],
                states: [],
                links: [],
            })

            // Wait 10ms to ensure different timestamp
            await new Promise((resolve) => setTimeout(resolve, 10))

            const result = updateCanvas(canvas.id, {
                name: 'Updated Name',
                tasks: [
                    {
                        id: 'task-1',
                        x: 100,
                        y: 200,
                        title: 'New Task',
                    },
                ],
                states: [],
                links: [],
            })

            expect(result).not.toBeNull()
            expect(result?.name).toBe('Updated Name')
            expect(result?.tasks).toHaveLength(1)
            expect(result?.createdAt).toBe(canvas.createdAt)
            // updatedAt should be greater than or equal to createdAt
            expect(
                new Date(result!.updatedAt).getTime()
            ).toBeGreaterThanOrEqual(new Date(canvas.createdAt).getTime())
        })

        it('should set updated canvas as current', () => {
            const canvas = createCanvas({
                name: 'Test Canvas',
                tasks: [],
                states: [],
                links: [],
            })

            clearCurrentCanvasId()
            expect(getCurrentCanvasId()).toBeNull()

            updateCanvas(canvas.id, {
                name: 'Updated',
                tasks: [],
                states: [],
                links: [],
            })

            expect(getCurrentCanvasId()).toBe(canvas.id)
        })
    })

    describe('deleteCanvas', () => {
        it('should return false when canvas does not exist', () => {
            const result = deleteCanvas('nonexistent-id')
            expect(result).toBe(false)
        })

        it('should delete existing canvas', () => {
            const canvas = createCanvas({
                name: 'To Delete',
                tasks: [],
                states: [],
                links: [],
            })

            const result = deleteCanvas(canvas.id)

            expect(result).toBe(true)
            expect(getCanvas(canvas.id)).toBeNull()
        })

        it('should clear current canvas ID if deleted canvas was current', () => {
            const canvas = createCanvas({
                name: 'Current Canvas',
                tasks: [],
                states: [],
                links: [],
            })

            expect(getCurrentCanvasId()).toBe(canvas.id)

            deleteCanvas(canvas.id)

            expect(getCurrentCanvasId()).toBeNull()
        })
    })

    describe('saveCanvas', () => {
        it('should create new canvas when no id provided', () => {
            const result = saveCanvas({
                name: 'New Canvas',
                tasks: [],
                states: [],
                links: [],
            })

            expect(result).not.toBeNull()
            expect(result?.name).toBe('New Canvas')
            expect(result?.id).toBeDefined()
        })

        it('should update canvas when id is provided', () => {
            const canvas = createCanvas({
                name: 'Original',
                tasks: [],
                states: [],
                links: [],
            })

            const result = saveCanvas(
                {
                    name: 'Updated',
                    tasks: [],
                    states: [],
                    links: [],
                },
                canvas.id
            )

            expect(result).not.toBeNull()
            expect(result?.id).toBe(canvas.id)
            expect(result?.name).toBe('Updated')
        })
    })

    describe('canvas ID management', () => {
        it('should set and get current canvas ID', () => {
            const testId = 'test-canvas-123'
            setCurrentCanvasId(testId)

            expect(getCurrentCanvasId()).toBe(testId)
        })

        it('should clear current canvas ID', () => {
            setCurrentCanvasId('test-id')
            expect(getCurrentCanvasId()).toBe('test-id')

            clearCurrentCanvasId()
            expect(getCurrentCanvasId()).toBeNull()
        })
    })

    describe('error handling', () => {
        it('should handle corrupted canvas data gracefully', () => {
            // Set invalid JSON in localStorage
            localStorage.setItem('canvases', 'invalid-json{')

            const result = listCanvases()
            expect(result).toEqual([])
        })

        it('should handle corrupted current canvas ID', () => {
            // Set a current canvas ID without any canvas data
            localStorage.clear()
            setCurrentCanvasId('non-existent-canvas-id')

            const result = getCurrentCanvas()
            expect(result).toBeNull()
        })

        it('should recover from corrupted data when creating new canvas', () => {
            // Set invalid JSON in localStorage
            localStorage.setItem('canvases', 'invalid-json{')

            // Should still be able to create a new canvas
            const result = createCanvas({
                name: 'Recovery Canvas',
                tasks: [],
                states: [],
                links: [],
            })

            expect(result).not.toBeNull()
            expect(result.name).toBe('Recovery Canvas')

            // Verify the canvases list is now valid
            const canvases = listCanvases()
            expect(canvases).toHaveLength(1)
        })

        it('should handle malformed canvas objects', () => {
            // Set malformed canvas data
            localStorage.setItem(
                'canvases',
                JSON.stringify([
                    {
                        // Missing required fields
                        name: 'Incomplete',
                    },
                ])
            )

            // Should handle gracefully and return empty array
            const result = listCanvases()
            expect(Array.isArray(result)).toBe(true)
        })
    })
})
