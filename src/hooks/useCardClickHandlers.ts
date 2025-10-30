import { KonvaEventObject } from 'konva/lib/Node'

export interface UseCardClickHandlersProps {
    id: string
    onClick?: (id: string) => void
    onDoubleClick?: (id: string) => void
    onDelete?: (id: string) => void
    onDuplicate?: (id: string) => void
}

export const useCardClickHandlers = ({
    id,
    onClick,
    onDoubleClick,
    onDelete,
    onDuplicate,
}: UseCardClickHandlersProps) => {
    const handleClick = (e: KonvaEventObject<MouseEvent>) => {
        if (onClick) {
            onClick(id)
        }
        e.cancelBubble = true
    }

    const handleDoubleClick = (e: KonvaEventObject<MouseEvent>) => {
        if (onDoubleClick) {
            onDoubleClick(id)
        }
        e.cancelBubble = true
    }

    const handleDeleteClick = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onDelete) {
            onDelete(id)
        }
    }

    const handleDuplicateClick = (e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true
        if (onDuplicate) {
            onDuplicate(id)
        }
    }

    return {
        handleClick,
        handleDoubleClick,
        handleDeleteClick,
        handleDuplicateClick,
    }
}
