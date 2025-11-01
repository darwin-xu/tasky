import { useState, useCallback, useMemo } from 'react'
import { ViewportState, ViewportActions } from '../types'
import {
    VIEWPORT_SCALE_MIN,
    VIEWPORT_SCALE_MAX,
    VIEWPORT_INITIAL_SCALE,
    VIEWPORT_INITIAL_X,
    VIEWPORT_INITIAL_Y,
} from '../constants'

const validateScale = (scale: number): number => {
    if (isNaN(scale) || !isFinite(scale) || scale <= 0) {
        console.warn('Invalid scale value, using default 1.0')
        return VIEWPORT_INITIAL_SCALE
    }
    return Math.max(VIEWPORT_SCALE_MIN, Math.min(VIEWPORT_SCALE_MAX, scale))
}

const validateCoordinate = (value: number, fallback: number = 0): number => {
    if (isNaN(value) || !isFinite(value)) {
        if (process.env.NODE_ENV !== 'production') {
            console.warn('Invalid coordinate value, using fallback', fallback)
        }
        return fallback
    }
    return value
}

export const useViewportState = (): ViewportState & ViewportActions => {
    const [state, setState] = useState<ViewportState>({
        x: VIEWPORT_INITIAL_X,
        y: VIEWPORT_INITIAL_Y,
        scale: VIEWPORT_INITIAL_SCALE,
        isDragging: false,
    })

    const updatePosition = useCallback((x: number, y: number) => {
        setState((prevState) => {
            const validX = validateCoordinate(x, prevState.x)
            const validY = validateCoordinate(y, prevState.y)

            return {
                ...prevState,
                x: validX,
                y: validY,
            }
        })
    }, [])

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
            setState((prevState) => {
                const validScale = validateScale(newScale)

                // Calculate the world position of the point before zoom
                const worldX = (point.x - prevState.x) / prevState.scale
                const worldY = (point.y - prevState.y) / prevState.scale

                // Calculate new viewport position to keep the point in the same screen position
                const newX = point.x - worldX * validScale
                const newY = point.y - worldY * validScale

                const validX = validateCoordinate(newX, prevState.x)
                const validY = validateCoordinate(newY, prevState.y)

                return {
                    ...prevState,
                    x: validX,
                    y: validY,
                    scale: validScale,
                }
            })
        },
        []
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
