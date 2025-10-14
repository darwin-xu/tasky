/**
 * Validates a date string and returns whether it's valid
 * Accepts dates in YYYY-MM-DD format or empty string
 */
export const isValidDate = (dateString: string): boolean => {
    if (dateString === '') {
        return true // Empty date is valid
    }

    // Check format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateString)) {
        return false
    }

    // Parse and validate the actual date
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
        return false
    }

    // Verify the date components match (handles invalid dates like 2023-02-31)
    const [year, month, day] = dateString.split('-').map(Number)
    return (
        date.getFullYear() === year &&
        date.getMonth() === month - 1 &&
        date.getDate() === day
    )
}

/**
 * Formats a date string for display
 */
export const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return ''
    if (!isValidDate(dateString)) return dateString

    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}
