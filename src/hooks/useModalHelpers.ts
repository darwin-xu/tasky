import { useEffect } from 'react'
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

export interface UseDateValidationProps {
    date: string
    setDateError: (error: string) => void
}

export const useDateValidation = (date: string) => {
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

export const handleBackdropClick = (
    e: React.MouseEvent<HTMLDivElement>,
    onCancel: () => void
) => {
    if (e.target === e.currentTarget) {
        onCancel()
    }
}
