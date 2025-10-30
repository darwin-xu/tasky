import { COLORS, TEXT } from '../constants'

export type Priority = 'Low' | 'Medium' | 'High'

export const getPriorityColor = (priority: Priority): string => {
    switch (priority) {
        case 'High':
            return COLORS.PRIORITY_HIGH
        case 'Medium':
            return COLORS.PRIORITY_MEDIUM
        case 'Low':
            return COLORS.PRIORITY_LOW
        default:
            return COLORS.PRIORITY_DEFAULT
    }
}

export const getPriorityLabel = (priority: Priority): string => {
    switch (priority) {
        case 'High':
            return TEXT.PRIORITY_HIGH_LABEL
        case 'Medium':
            return TEXT.PRIORITY_MEDIUM_LABEL
        case 'Low':
            return TEXT.PRIORITY_LOW_LABEL
        default:
            return `Priority: ${priority}`
    }
}
