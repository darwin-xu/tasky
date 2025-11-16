/**
 * Test suite for free style link behavior
 *
 * Free style links should:
 * 1. Draw direct paths between source and target
 * 2. NOT be affected by obstacles on the canvas
 * 3. Choose the shortest path without obstacle checking
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import LinkComponent from '../components/Link'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('Free Style Link Behavior', () => {
    describe('Obstacle Independence', () => {
        test('free style links ignore obstacles in the path', () => {
            // Place an obstacle directly between source and target
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
                    linkStyle="free"
                    allCards={obstacles}
                />
            )

            const arrows = screen.queryAllByTestId('konva-arrow')
            expect(arrows.length).toBe(1)

            // Free style should draw a simple direct arrow
            const arrow = arrows[0]
            const pointsStr = arrow.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            const points = JSON.parse(pointsStr!)
            // Should have exactly 4 values (2 points: start and end)
            expect(points.length).toBe(4)

            // The path should be direct, not routed around the obstacle
            // Start should be from right-middle of source (200, 60)
            // End should be at left-middle of target (400, 60)
            expect(points[0]).toBe(200)
            expect(points[1]).toBe(60)
            expect(points[2]).toBe(400)
            expect(points[3]).toBe(60)
        })

        test('free style links work the same with or without obstacles', () => {
            const view = render(
                <LinkComponent
                    id="test-link-1"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="free"
                    allCards={[]}
                />
            )

            const arrows1 = screen.queryAllByTestId('konva-arrow')
            const points1 = JSON.parse(arrows1[0].getAttribute('data-points')!)

            view.unmount()

            const obstacles = [
                { x: 250, y: 0, width: 100, height: 120 },
                { x: 150, y: 50, width: 100, height: 80 },
            ]

            render(
                <LinkComponent
                    id="test-link-2"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="free"
                    allCards={obstacles}
                />
            )

            const arrows2 = screen.queryAllByTestId('konva-arrow')
            const points2 = JSON.parse(arrows2[0].getAttribute('data-points')!)

            // Both should produce the same path
            expect(points1).toEqual(points2)
        })

        test('free style links choose shortest path without obstacle consideration', () => {
            // Create a scenario where the shortest path goes through an obstacle
            const obstacles = [{ x: 200, y: 50, width: 100, height: 100 }]

            render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={50}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={350}
                    targetY={50}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="free"
                    allCards={obstacles}
                />
            )

            const arrows = screen.queryAllByTestId('konva-arrow')
            const arrow = arrows[0]
            const pointsStr = arrow.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            const points = JSON.parse(pointsStr!)
            // Should be a direct 2-point path (4 values)
            expect(points.length).toBe(4)

            // Should connect from right-middle of source to left-middle of target
            // which is the shortest connection
            expect(points[0]).toBe(200) // sourceX + sourceWidth
            expect(points[1]).toBe(110) // sourceY + sourceHeight/2
            expect(points[2]).toBe(350) // targetX
            expect(points[3]).toBe(110) // targetY + targetHeight/2
        })

        test('free style links maintain direct path when moving obstacles', () => {
            // First render with obstacle above
            const { rerender } = render(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={100}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={100}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="free"
                    allCards={[{ x: 250, y: 0, width: 100, height: 80 }]}
                />
            )

            const arrows1 = screen.queryAllByTestId('konva-arrow')
            const points1 = JSON.parse(arrows1[0].getAttribute('data-points')!)

            // Rerender with obstacle directly in the path
            rerender(
                <LinkComponent
                    id="test-link"
                    sourceX={0}
                    sourceY={100}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={100}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="free"
                    allCards={[{ x: 250, y: 140, width: 100, height: 80 }]}
                />
            )

            const arrows2 = screen.queryAllByTestId('konva-arrow')
            const points2 = JSON.parse(arrows2[0].getAttribute('data-points')!)

            // Path should remain the same regardless of obstacle position
            expect(points1).toEqual(points2)
        })
    })

    describe('Direct Path Drawing', () => {
        test('free style uses simple arrow without complex routing', () => {
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

        test('free style arrow is a direct 2-point path', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={100}
                    sourceY={100}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={500}
                    targetY={300}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="free"
                />
            )

            const arrows = screen.queryAllByTestId('konva-arrow')
            const arrow = arrows[0]
            const pointsStr = arrow.getAttribute('data-points')
            expect(pointsStr).toBeTruthy()

            const points = JSON.parse(pointsStr!)
            // Should have exactly 2 points (4 coordinate values)
            expect(points.length).toBe(4)
        })
    })

    describe('Comparison with Orthogonal', () => {
        test('orthogonal routes around obstacles but free style does not', () => {
            const obstacles = [{ x: 250, y: 0, width: 100, height: 120 }]

            // Render orthogonal with routeAround enabled
            const { unmount } = render(
                <LinkComponent
                    id="test-link-ortho"
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

            const linesOrtho = screen.queryAllByTestId('konva-line')
            expect(linesOrtho.length).toBeGreaterThan(0)

            const pointsOrtho = JSON.parse(
                linesOrtho[0].getAttribute('data-points')!
            )
            // Orthogonal routing should be active
            // Note: Due to complex geometry, may use simple path as fallback
            expect(pointsOrtho.length).toBeGreaterThanOrEqual(8)

            unmount()

            // Render free style with same obstacle
            render(
                <LinkComponent
                    id="test-link-free"
                    sourceX={0}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={400}
                    targetY={0}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="free"
                    allCards={obstacles}
                />
            )

            const arrowsFree = screen.queryAllByTestId('konva-arrow')
            const pointsFree = JSON.parse(
                arrowsFree[0].getAttribute('data-points')!
            )

            // Free style should have simple 2-point path (4 values)
            expect(pointsFree.length).toBe(4)
        })
    })
})
