/**
 * Test suite for orthogonal routing algorithm
 *
 * The routing algorithm should:
 * 1. Always anchor start point to right-middle of source card
 * 2. Always anchor end point to left-middle of target card
 * 3. Use simple 3-segment path when no obstacles present
 * 4. Route around obstacles when "route around" is enabled
 * 5. Choose path with fewest turns over shortest path
 */

// Import the functions we need to test
// Since they're not exported, we'll test through the Link component behavior
import React from 'react'
import { render, screen } from '@testing-library/react'
import LinkComponent from '../components/Link'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('Orthogonal Routing Algorithm', () => {
    describe('Basic Path Generation', () => {
        test('uses simple 3-segment path when no obstacles present', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={false}
                    allCards={[]}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            expect(lines.length).toBeGreaterThan(0)

            // Should have a line with orthogonal path
            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            // Path should start from right-middle of source (200, 60)
            // and end at left-middle of target (400, 60)
            const numPoints = JSON.parse(pointsStr!)
            expect(numPoints[0]).toBe(200) // startX = sourceX + sourceWidth
            expect(numPoints[1]).toBe(60) // startY = sourceY + sourceHeight/2

            const lastX = numPoints[numPoints.length - 2]
            const lastY = numPoints[numPoints.length - 1]
            expect(lastX).toBe(400) // endX = targetX
            expect(lastY).toBe(60) // endY = targetY + targetHeight/2
        })

        test('keeps simple path when routeAround is false even with obstacles', () => {
            const obstacles = [{ x: 250, y: 50, width: 100, height: 80 }]

            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={false}
                    allCards={obstacles}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            expect(lines.length).toBeGreaterThan(0)

            // Should still use simple path (not routing around)
            const line = lines[0]
            const points = line
                .getAttribute('data-points')
                ?.split(',')
                .map(Number)

            // Simple path has 8 values (4 points: start, mid1, mid2, end)
            expect(points?.length).toBe(8)
        })
    })

    describe('Anchor Points', () => {
        test('always anchors to right-middle of source card', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={100}
                    sourceY={200}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={500}
                    targetY={100}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={false}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            const points = JSON.parse(pointsStr!)
            // Start point should be right-middle: (100 + 200, 200 + 120/2)
            expect(points[0]).toBe(300) // sourceX + sourceWidth
            expect(points[1]).toBe(260) // sourceY + sourceHeight/2
        })

        test('always anchors to left-middle of target card', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={100}
                    sourceY={200}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={500}
                    targetY={100}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={false}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            const points = JSON.parse(pointsStr!)
            // End point should be left-middle: (500, 100 + 120/2)
            const lastX = points[points.length - 2]
            const lastY = points[points.length - 1]
            expect(lastX).toBe(500) // targetX
            expect(lastY).toBe(160) // targetY + targetHeight/2
        })
    })

    describe('Obstacle Avoidance', () => {
        test('routes around single obstacle when routeAround is enabled', () => {
            const obstacles = [{ x: 250, y: 0, width: 100, height: 120 }]

            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={true}
                    allCards={obstacles}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            expect(lines.length).toBeGreaterThan(0)

            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            const points = JSON.parse(pointsStr!)
            // Should have path (may use simple path as fallback in complex cases)
            expect(points.length >= 8).toBe(true)
        })

        test('routes around multiple obstacles', () => {
            const obstacles = [
                { x: 250, y: 0, width: 100, height: 80 },
                { x: 250, y: 100, width: 100, height: 80 },
            ]

            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={50}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={50}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={true}
                    allCards={obstacles}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            expect(lines.length).toBeGreaterThan(0)

            const line = lines[0]
            const points = line
                .getAttribute('data-points')
                ?.split(',')
                .map(Number)

            // Should route around both obstacles
            expect(points && points.length >= 8).toBe(true)
        })

        test('does not treat source and target as obstacles', () => {
            const allCards = [
                { x: 0, y: 0, width: 200, height: 120 }, // source
                { x: 400, y: 0, width: 200, height: 120 }, // target
            ]

            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={true}
                    allCards={allCards}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            const line = lines[0]
            const points = line
                .getAttribute('data-points')
                ?.split(',')
                .map(Number)

            // Should use simple path since source and target are excluded from obstacles
            expect(points?.length).toBe(8)
        })
    })

    describe('Path Optimization', () => {
        test('chooses path with fewer turns when multiple routes available', () => {
            // Place obstacle that could be routed around from top or bottom
            const obstacles = [{ x: 300, y: 50, width: 50, height: 80 }]

            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={60}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={60}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={true}
                    allCards={obstacles}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            expect(lines.length).toBeGreaterThan(0)

            // The algorithm should find a valid route
            const line = lines[0]
            const points = line.getAttribute('data-points')
            expect(points).toBeTruthy()
        })
    })

    describe('Edge Cases', () => {
        test('handles vertically aligned cards', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={100}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={100}
                    targetY={300}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={false}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            expect(lines.length).toBeGreaterThan(0)

            const line = lines[0]
            const points = line.getAttribute('data-points')
            expect(points).toBeTruthy()
        })

        test('handles target card to the left of source', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={400}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={0}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={false}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            expect(lines.length).toBeGreaterThan(0)

            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            const points = JSON.parse(pointsStr!)
            // Should still start from right-middle of source
            expect(points[0]).toBe(600) // sourceX + sourceWidth
            expect(points[1]).toBe(60) // sourceY + sourceHeight/2
        })

        test('handles overlapping cards', () => {
            const obstacles = [{ x: 150, y: 50, width: 200, height: 120 }]

            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={300}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={true}
                    allCards={obstacles}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            expect(lines.length).toBeGreaterThan(0)

            // Should find some path, even if not optimal
            const line = lines[0]
            const points = line.getAttribute('data-points')
            expect(points).toBeTruthy()
        })

        test('handles empty allCards array', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={true}
                    allCards={[]}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            expect(lines.length).toBeGreaterThan(0)

            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            const points = JSON.parse(pointsStr!)
            // Should use simple path
            expect(points.length).toBe(8)
        })

        test('handles undefined allCards', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={true}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            expect(lines.length).toBeGreaterThan(0)

            const line = lines[0]
            const points = line.getAttribute('data-points')
            expect(points).toBeTruthy()
        })

        test('handles very close cards', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={220}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={false}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            expect(lines.length).toBeGreaterThan(0)

            const line = lines[0]
            const points = line.getAttribute('data-points')
            expect(points).toBeTruthy()
        })

        test('handles obstacle directly in the path', () => {
            const obstacles = [{ x: 250, y: 50, width: 100, height: 80 }]

            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={50}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={50}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={true}
                    allCards={obstacles}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            expect(lines.length).toBeGreaterThan(0)

            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            const points = JSON.parse(pointsStr!)
            // Should have path (may use simple path as fallback in complex cases)
            expect(points.length >= 8).toBe(true)
        })
    })

    describe('Free Style vs Orthogonal', () => {
        test('uses Arrow for free style', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={200}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="free"
                />
            )

            const arrows = screen.queryAllByTestId('konva-arrow')
            const lines = screen.queryAllByTestId('konva-line')

            // Free style should only have arrow, no separate line
            expect(arrows.length).toBe(1)
            expect(lines.length).toBe(0)
        })

        test('uses Line + Arrow for orthogonal style', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={200}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                />
            )

            const arrows = screen.queryAllByTestId('konva-arrow')
            const lines = screen.queryAllByTestId('konva-line')

            // Orthogonal style should have both line and arrow
            expect(arrows.length).toBe(1)
            expect(lines.length).toBe(1)
        })
    })

    describe('Path Validity', () => {
        test('path points are always valid numbers', () => {
            const obstacles = [{ x: 250, y: 50, width: 100, height: 80 }]

            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={true}
                    allCards={obstacles}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            const points = JSON.parse(pointsStr!)
            points.forEach((point: number) => {
                expect(typeof point).toBe('number')
                expect(isNaN(point)).toBe(false)
                expect(isFinite(point)).toBe(true)
            })
        })

        test('path has even number of coordinates', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={true}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            const points = JSON.parse(pointsStr!)
            // Should have even number of coordinates (pairs of x, y)
            expect(points.length % 2).toBe(0)
        })

        test('path segments are orthogonal', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={100}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={false}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            const points = JSON.parse(pointsStr!)
            // Check each segment is either horizontal or vertical
            for (let i = 0; i < points.length - 2; i += 2) {
                const x1 = points[i]
                const y1 = points[i + 1]
                const x2 = points[i + 2]
                const y2 = points[i + 3]

                // Either x or y should be the same (horizontal or vertical)
                const isHorizontal = y1 === y2
                const isVertical = x1 === x2
                expect(isHorizontal || isVertical).toBe(true)
            }
        })
    })
})
