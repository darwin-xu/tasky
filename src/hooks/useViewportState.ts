import { useState, useCallback, useMemo } from 'react'
import { ViewportState, ViewportActions } from '../types'

const SCALE_MIN = 0.1
const SCALE_MAX = 10.0

const validateScale = (scale: number): number => {
    if (isNaN(scale) || !isFinite(scale) || scale <= 0) {
        console.warn('Invalid scale value, using default 1.0')
        return 1.0
    }
    return Math.max(SCALE_MIN, Math.min(SCALE_MAX, scale))
}

const validateCoordinate = (value: number, fallback: number = 0): number => {
    if (isNaN(value) || !isFinite(value)) {
        console.warn('Invalid coordinate value, using fallback', fallback)
        return fallback
    }
    return value
}

export const useViewportState = (): ViewportState & ViewportActions => {
    const [state, setState] = useState<ViewportState>({
        x: 0,
        y: 0,
        scale: 1.0,
        isDragging: false,
    })

    const updatePosition = useCallback(
        (x: number, y: number) => {
            const validX = validateCoordinate(x, state.x)
            const validY = validateCoordinate(y, state.y)

            setState((prevState) => ({
                ...prevState,
                x: validX,
                y: validY,
            }))
        },
        [state.x, state.y]
    )

    const updateScale = useCallback((scale: number) => {
        const validScale = validateScale(scale)
        setState((prevState) => ({
            ...prevState,
            scale: validScale,
        }))
    }, [])

    const setDragging = useCallback((isDragging: boolean) => {
        setState((prevState) => ({
            ...prevState,
            isDragging,
        }))
    }, [])

    const zoomToPoint = useCallback(
        (point: { x: number; y: number }, newScale: number) => {
            const validScale = validateScale(newScale)

            // Calculate the world position of the point before zoom
            const worldX = (point.x - state.x) / state.scale
            const worldY = (point.y - state.y) / state.scale

            // Calculate new viewport position to keep the point in the same screen position
            const newX = point.x - worldX * validScale
            const newY = point.y - worldY * validScale

            const validX = validateCoordinate(newX, state.x)
            const validY = validateCoordinate(newY, state.y)

            setState((prevState) => ({
                ...prevState,
                x: validX,
                y: validY,
                scale: validScale,
            }))
        },
        [state.x, state.y, state.scale]
    )

    // Memoize the return object to prevent unnecessary re-renders
    return useMemo(
        () => ({
            ...state,
            updatePosition,
            updateScale,
            setDragging,
            zoomToPoint,
        }),
        [state, updatePosition, updateScale, setDragging, zoomToPoint]
    )
}
