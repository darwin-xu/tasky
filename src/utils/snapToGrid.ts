/**
 * Snap-to-grid utility functions
 */

import { GRID_SPACING, VIEWPORT_INITIAL_SCALE } from '../constants'

/**
 * Snaps a coordinate to the nearest grid point
 * @param value - The coordinate value to snap
 * @param gridSpacing - The spacing between grid points (default: GRID_SPACING)
 * @param scale - The current zoom scale (default: 1)
 * @returns The snapped coordinate value
 */
export const snapToGrid = (
    value: number,
    gridSpacing: number = GRID_SPACING,
    scale: number = VIEWPORT_INITIAL_SCALE
): number => {
    // Calculate the effective grid spacing after scaling
    const scaledSpacing = gridSpacing * scale

    // Round to the nearest grid point
    return Math.round(value / scaledSpacing) * scaledSpacing
}

/**
 * Snaps a position object to the nearest grid point
 * @param position - The position to snap {x, y}
 * @param gridSpacing - The spacing between grid points (default: GRID_SPACING)
 * @param scale - The current zoom scale (default: 1)
 * @returns The snapped position
 */
export const snapPositionToGrid = (
    position: { x: number; y: number },
    gridSpacing: number = GRID_SPACING,
    scale: number = VIEWPORT_INITIAL_SCALE
): { x: number; y: number } => {
    return {
        x: snapToGrid(position.x, gridSpacing, scale),
        y: snapToGrid(position.y, gridSpacing, scale),
    }
}

/**
 * Converts screen coordinates to world coordinates
 * @param screenPos - Screen position {x, y}
 * @param viewportX - Viewport x position
 * @param viewportY - Viewport y position
 * @param scale - Current zoom scale
 * @returns World coordinates
 */
export const screenToWorld = (
    screenPos: { x: number; y: number },
    viewportX: number,
    viewportY: number,
    scale: number
): { x: number; y: number } => {
    return {
        x: (screenPos.x - viewportX) / scale,
        y: (screenPos.y - viewportY) / scale,
    }
}

/**
 * Converts world coordinates to screen coordinates
 * @param worldPos - World position {x, y}
 * @param viewportX - Viewport x position
 * @param viewportY - Viewport y position
 * @param scale - Current zoom scale
 * @returns Screen coordinates
 */
export const worldToScreen = (
    worldPos: { x: number; y: number },
    viewportX: number,
    viewportY: number,
    scale: number
): { x: number; y: number } => {
    return {
        x: worldPos.x * scale + viewportX,
        y: worldPos.y * scale + viewportY,
    }
}
