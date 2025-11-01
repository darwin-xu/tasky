import { useEffect, type MouseEvent } from 'react'
import { isValidDate } from '../utils/dateValidation'

export interface UseModalEscapeHandlerProps {
    isOpen: boolean
    onCancel: () => void
}

export const useModalEscapeHandler = ({
    isOpen,
    onCancel,
}: UseModalEscapeHandlerProps) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCancel()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            return () => document.removeEventListener('keydown', handleEscape)
        }
    }, [isOpen, onCancel])
}

export const useDateValidation = () => {
    const validateDate = (
        value: string,
        setDateError: (error: string) => void
    ) => {
        if (value && !isValidDate(value)) {
            setDateError(
                'Invalid date format. Use YYYY-MM-DD (e.g., 2024-12-31)'
            )
        } else {
            setDateError('')
        }
    }

    return { validateDate }
}

// Track if mousedown occurred on a form element
let mouseDownOnFormElement = false

export const handleBackdropClick = (
    e: MouseEvent<HTMLDivElement>,
    onCancel: () => void
) => {
    // Don't close if the mousedown was on a form element (prevents closing during text selection)
    if (mouseDownOnFormElement) {
        mouseDownOnFormElement = false
        return
    }

    if (e.target === e.currentTarget) {
        onCancel()
    }
}

// Helper to track mousedown on form elements
export const handleModalMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
    ) {
        mouseDownOnFormElement = true
    } else {
        mouseDownOnFormElement = false
    }
}
