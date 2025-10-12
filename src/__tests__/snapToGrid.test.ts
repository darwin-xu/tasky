import {
    snapToGrid,
    snapPositionToGrid,
    screenToWorld,
    worldToScreen,
} from '../utils/snapToGrid'

describe('Snap-to-Grid Utilities', () => {
    describe('snapToGrid', () => {
        test('TC5.1: Snaps to nearest grid point at scale 1', () => {
            expect(snapToGrid(0, 20, 1)).toBe(0)
            expect(snapToGrid(10, 20, 1)).toBe(20) // 10 is exactly halfway, rounds to nearest (20)
            expect(snapToGrid(9, 20, 1)).toBe(0) // 9 is closer to 0
            expect(snapToGrid(11, 20, 1)).toBe(20)
            expect(snapToGrid(20, 20, 1)).toBe(20)
            expect(snapToGrid(29, 20, 1)).toBe(20) // 29 is closer to 20
            expect(snapToGrid(30, 20, 1)).toBe(40) // 30 is exactly halfway, rounds to 40
            expect(snapToGrid(31, 20, 1)).toBe(40)
        })

        test('TC5.2: Snaps correctly with different grid spacing', () => {
            expect(snapToGrid(24, 50, 1)).toBe(0) // 24 is closer to 0
            expect(snapToGrid(25, 50, 1)).toBe(50) // 25 is exactly halfway, rounds to 50
            expect(snapToGrid(26, 50, 1)).toBe(50)
            expect(snapToGrid(74, 50, 1)).toBe(50) // 74 is closer to 50
            expect(snapToGrid(75, 50, 1)).toBe(100) // 75 is exactly halfway, rounds to 100
            expect(snapToGrid(76, 50, 1)).toBe(100)
        })

        test('TC5.3: Snaps correctly at different zoom scales', () => {
            // At scale 2, grid spacing is 40 (20 * 2)
            expect(snapToGrid(0, 20, 2)).toBe(0)
            expect(snapToGrid(19, 20, 2)).toBe(0) // 19 is closer to 0
            expect(snapToGrid(20, 20, 2)).toBe(40) // 20 is exactly halfway, rounds to 40
            expect(snapToGrid(21, 20, 2)).toBe(40)
            expect(snapToGrid(40, 20, 2)).toBe(40)

            // At scale 0.5, grid spacing is 10 (20 * 0.5)
            expect(snapToGrid(0, 20, 0.5)).toBe(0)
            expect(snapToGrid(4, 20, 0.5)).toBe(0) // 4 is closer to 0
            expect(snapToGrid(5, 20, 0.5)).toBe(10) // 5 is exactly halfway, rounds to 10
            expect(snapToGrid(6, 20, 0.5)).toBe(10)
            expect(snapToGrid(10, 20, 0.5)).toBe(10)
        })

        test('TC5.4: Handles negative coordinates', () => {
            expect(snapToGrid(-9, 20, 1)).toBeCloseTo(0, 5) // -9 is closer to 0 (handles -0 vs 0)
            expect(snapToGrid(-10, 20, 1)).toBeCloseTo(0, 5) // -10 is exactly halfway, Math.round rounds to -0
            expect(snapToGrid(-11, 20, 1)).toBe(-20)
            expect(snapToGrid(-29, 20, 1)).toBe(-20) // -29 is closer to -20
            expect(snapToGrid(-30, 20, 1)).toBe(-20) // -30 is exactly halfway, Math.round rounds to -0 which becomes -20 after multiplication
            expect(snapToGrid(-31, 20, 1)).toBe(-40)
        })
    })

    describe('snapPositionToGrid', () => {
        test('TC5.5: Snaps position object to grid', () => {
            const pos = { x: 15, y: 26 }
            const snapped = snapPositionToGrid(pos, 20, 1)
            expect(snapped).toEqual({ x: 20, y: 20 }) // 15->20 (closer), 26->20 (closer)
        })

        test('TC5.6: Snaps position at different scales', () => {
            const pos = { x: 25, y: 35 }
            const snapped = snapPositionToGrid(pos, 20, 2)
            // Grid spacing at scale 2 is 40
            expect(snapped).toEqual({ x: 40, y: 40 })
        })

        test('TC5.7: Handles negative positions', () => {
            const pos = { x: -15, y: -26 }
            const snapped = snapPositionToGrid(pos, 20, 1)
            expect(snapped).toEqual({ x: -20, y: -20 })
        })
    })

    describe('screenToWorld', () => {
        test('TC5.8: Converts screen to world coordinates', () => {
            const screenPos = { x: 100, y: 200 }
            const world = screenToWorld(screenPos, 0, 0, 1)
            expect(world).toEqual({ x: 100, y: 200 })
        })

        test('TC5.9: Converts with viewport offset', () => {
            const screenPos = { x: 100, y: 200 }
            const world = screenToWorld(screenPos, 50, 50, 1)
            expect(world).toEqual({ x: 50, y: 150 })
        })

        test('TC5.10: Converts with scale', () => {
            const screenPos = { x: 100, y: 200 }
            const world = screenToWorld(screenPos, 0, 0, 2)
            expect(world).toEqual({ x: 50, y: 100 })
        })
    })

    describe('worldToScreen', () => {
        test('TC5.11: Converts world to screen coordinates', () => {
            const worldPos = { x: 100, y: 200 }
            const screen = worldToScreen(worldPos, 0, 0, 1)
            expect(screen).toEqual({ x: 100, y: 200 })
        })

        test('TC5.12: Converts with viewport offset', () => {
            const worldPos = { x: 50, y: 150 }
            const screen = worldToScreen(worldPos, 50, 50, 1)
            expect(screen).toEqual({ x: 100, y: 200 })
        })

        test('TC5.13: Converts with scale', () => {
            const worldPos = { x: 50, y: 100 }
            const screen = worldToScreen(worldPos, 0, 0, 2)
            expect(screen).toEqual({ x: 100, y: 200 })
        })
    })
})
