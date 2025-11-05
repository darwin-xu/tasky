import { useEffect, useRef, type MouseEvent } from 'react'
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
            if (e.key === 'Escape' && !e.isComposing) {
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

// Form elements that should prevent backdrop close during interaction
const FORM_ELEMENTS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'])

// Hook to manage backdrop click behavior for modals
export const useModalBackdropHandler = () => {
    const isMouseDownOnFormElementRef = useRef(false)

    const handleModalMouseDown = (e: MouseEvent<HTMLDivElement>) => {
        let el = e.target as HTMLElement | null
        isMouseDownOnFormElementRef.current = false
        while (el) {
            if (FORM_ELEMENTS.has(el.tagName)) {
                isMouseDownOnFormElementRef.current = true
                break
            }
            el = el.parentElement
        }
    }

    const handleBackdropClick = (
        e: MouseEvent<HTMLDivElement>,
        onCancel: () => void
    ) => {
        // Don't close if the mousedown was on a form element
        if (isMouseDownOnFormElementRef.current) {
            isMouseDownOnFormElementRef.current = false
            return
        }

        if (e.target === e.currentTarget) {
            onCancel()
        }
    }

    return { handleModalMouseDown, handleBackdropClick }
}
