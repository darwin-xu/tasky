import { CanvasData, CanvasMetadata } from '../types'

/**
 * Canvas Persistence Service
 *
 * This service provides CRUD operations for canvas persistence.
 * Currently uses localStorage as a simulated backend.
 * In future, this can be replaced with actual API calls.
 */

const STORAGE_KEY = 'tasky_canvases'
const STORAGE_VERSION_KEY = 'tasky_canvases_version'
const CURRENT_CANVAS_KEY = 'tasky_current_canvas_id'

// Simple cache to avoid repeated JSON parsing
let canvasesCache: {
    data: CanvasData[]
    timestamp: number
    version: string | null
} | null = null
const CACHE_TTL = 1000 // Cache for 1 second to balance performance and data freshness

/**
 * Get cached or fresh canvas data from localStorage
 */
const getCanvasesFromStorage = (): CanvasData[] => {
    const now = Date.now()
    const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)

    // Return cached data if still valid and version matches storage
    // Return a shallow copy to prevent mutations to the cache
    if (
        canvasesCache &&
        now - canvasesCache.timestamp < CACHE_TTL &&
        canvasesCache.version === storedVersion
    ) {
        return [...canvasesCache.data]
    }

    try {
        const data = localStorage.getItem(STORAGE_KEY)
        if (!data) {
            canvasesCache = { data: [], timestamp: now, version: storedVersion }
            return []
        }

        const canvases: CanvasData[] = JSON.parse(data)
        canvasesCache = {
            data: canvases,
            timestamp: now,
            version: storedVersion,
        }
        // Return a shallow copy to prevent mutations to the cache
        return [...canvases]
    } catch (error) {
        console.error('Error parsing canvas data:', error)
        canvasesCache = { data: [], timestamp: now, version: storedVersion }
        return []
    }
}

/**
 * Invalidate the cache (call when data changes)
 */
const invalidateCache = (): void => {
    canvasesCache = null
}

const updateStorageVersion = (): void => {
    localStorage.setItem(STORAGE_VERSION_KEY, `${Date.now()}`)
}

/**
 * Get all canvas metadata (list of saved canvases)
 */
export const listCanvases = (): CanvasMetadata[] => {
    try {
        const canvases = getCanvasesFromStorage()
        return canvases.map((canvas) => ({
            id: canvas.id,
            name: canvas.name,
            createdAt: canvas.createdAt,
            updatedAt: canvas.updatedAt,
        }))
    } catch (error) {
        console.error('Error listing canvases:', error)
        return []
    }
}

/**
 * Get a specific canvas by ID
 */
export const getCanvas = (id: string): CanvasData | null => {
    try {
        const canvases = getCanvasesFromStorage()
        return canvases.find((canvas) => canvas.id === id) || null
    } catch (error) {
        console.error('Error getting canvas:', error)
        return null
    }
}

/**
 * Get the last saved/loaded canvas
 */
export const getCurrentCanvas = (): CanvasData | null => {
    try {
        const currentId = localStorage.getItem(CURRENT_CANVAS_KEY)
        if (!currentId) return null

        return getCanvas(currentId)
    } catch (error) {
        console.error('Error getting current canvas:', error)
        return null
    }
}

/**
 * Create a new canvas
 */
export const createCanvas = (
    canvasData: Omit<CanvasData, 'id' | 'createdAt' | 'updatedAt'>
): CanvasData => {
    try {
        const now = new Date().toISOString()
        const newCanvas: CanvasData = {
            ...canvasData,
            id: `canvas-${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        }

        const canvases = getCanvasesFromStorage()
        canvases.push(newCanvas)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(canvases))
        updateStorageVersion()
        localStorage.setItem(CURRENT_CANVAS_KEY, newCanvas.id)
        invalidateCache()

        return newCanvas
    } catch (error) {
        console.error('Error creating canvas:', error)
        throw error
    }
}

/**
 * Update an existing canvas
 */
export const updateCanvas = (
    id: string,
    canvasData: Omit<CanvasData, 'id' | 'createdAt' | 'updatedAt'>
): CanvasData | null => {
    try {
        const canvases = getCanvasesFromStorage()
        const index = canvases.findIndex((canvas) => canvas.id === id)

        if (index === -1) return null

        const updatedCanvas: CanvasData = {
            ...canvasData,
            id,
            createdAt: canvases[index].createdAt,
            updatedAt: new Date().toISOString(),
        }

        canvases[index] = updatedCanvas
        localStorage.setItem(STORAGE_KEY, JSON.stringify(canvases))
        updateStorageVersion()
        localStorage.setItem(CURRENT_CANVAS_KEY, id)
        invalidateCache()

        return updatedCanvas
    } catch (error) {
        console.error('Error updating canvas:', error)
        return null
    }
}

/**
 * Delete a canvas by ID
 */
export const deleteCanvas = (id: string): boolean => {
    try {
        const canvases = getCanvasesFromStorage()
        const filteredCanvases = canvases.filter((canvas) => canvas.id !== id)

        if (filteredCanvases.length === canvases.length) {
            return false // Canvas not found
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredCanvases))
        updateStorageVersion()
        invalidateCache()

        // Clear current canvas if it was deleted
        const currentId = localStorage.getItem(CURRENT_CANVAS_KEY)
        if (currentId === id) {
            localStorage.removeItem(CURRENT_CANVAS_KEY)
        }

        return true
    } catch (error) {
        console.error('Error deleting canvas:', error)
        return false
    }
}

/**
 * Save or update canvas (convenience method)
 * If no ID is provided, creates a new canvas
 * If ID is provided, updates existing canvas
 */
export const saveCanvas = (
    canvasData: Omit<CanvasData, 'id' | 'createdAt' | 'updatedAt'>,
    id?: string
): CanvasData | null => {
    if (id) {
        return updateCanvas(id, canvasData)
    } else {
        return createCanvas(canvasData)
    }
}

/**
 * Set the current canvas ID
 */
export const setCurrentCanvasId = (id: string): void => {
    localStorage.setItem(CURRENT_CANVAS_KEY, id)
}

/**
 * Get the current canvas ID
 */
export const getCurrentCanvasId = (): string | null => {
    return localStorage.getItem(CURRENT_CANVAS_KEY)
}

/**
 * Clear the current canvas ID
 */
export const clearCurrentCanvasId = (): void => {
    localStorage.removeItem(CURRENT_CANVAS_KEY)
}
