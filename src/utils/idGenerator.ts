/**
 * ID Generator utility
 *
 * Generates unique IDs with a counter to avoid collisions when Date.now()
 * returns the same timestamp for multiple calls in rapid succession.
 */

let counter = 0

/**
 * Generates a unique ID with a prefix
 * @param prefix - The prefix for the ID (e.g., 'task', 'state', 'link')
 * @returns A unique ID string
 */
export const generateId = (prefix: string): string => {
    const timestamp = Date.now()
    const uniqueId = `${prefix}-${timestamp}-${counter}`
    counter = (counter + 1) % 10000 // Reset counter at 10000 to keep IDs reasonable
    return uniqueId
}

/**
 * Resets the counter (useful for testing)
 */
export const resetIdCounter = (): void => {
    counter = 0
}
