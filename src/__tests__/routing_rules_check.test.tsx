/**
 * Test suite to validate compliance with specific routing rules
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

describe('Routing Rules Compliance', () => {
    describe('Rule 4: Lines must move away from items first', () => {
        test('when target is directly below source, line goes RIGHT first (not down)', () => {
            // Target directly below source
            // Source: (100, 100) to (300, 220)
            // Target: (100, 300) to (300, 420)
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={100}
                    sourceY={100}
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
            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            const points = JSON.parse(pointsStr!)

            // Start point: right-middle of source = (300, 160)
            expect(points[0]).toBe(300)
            expect(points[1]).toBe(160)

            // Second point should be to the RIGHT (x > 300), NOT down with same x
            // Rule 4: Must move away from item first
            const secondX = points[2]
            const secondY = points[3]
            
            console.log('Path points:', points)
            console.log('Second point:', secondX, secondY)
            
            // The line should go RIGHT first to clear the source item
            expect(secondX).toBeGreaterThan(300) // Must move right first
        })

        test('when target is to the left and below, line goes RIGHT first to clear source', () => {
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={400}
                    sourceY={0}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={0}
                    targetY={200}
                    targetWidth={200}
                    targetHeight={120}
                    linkStyle="orthogonal"
                    routeAround={false}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            const points = JSON.parse(pointsStr!)

            // Start: (600, 60)
            expect(points[0]).toBe(600)
            expect(points[1]).toBe(60)

            // Must go RIGHT first to clear source before routing around
            const secondX = points[2]
            expect(secondX).toBeGreaterThan(600)
        })
    })

    describe('Rule 5: Connector entry - never connect directly from above', () => {
        test('when approaching from above, goes left → down → right', () => {
            // Place target to the right and below source
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
                    routeAround={false}
                />
            )

            const lines = screen.queryAllByTestId('konva-line')
            const line = lines[0]
            const pointsStr = line.getAttribute('data-points')
            const points = JSON.parse(pointsStr!)

            console.log('Path for Rule 5 test:', points)

            // End point: left-middle of target = (400, 260)
            const endX = points[points.length - 2]
            const endY = points[points.length - 1]
            expect(endX).toBe(400)
            expect(endY).toBe(260)

            // Find the point just before the end
            const beforeEndX = points[points.length - 4]
            const beforeEndY = points[points.length - 3]

            console.log('Before end point:', beforeEndX, beforeEndY)
            console.log('End point:', endX, endY)

            // Rule 5: If we're approaching from above (beforeEndY < endY),
            // we should NOT be directly above (beforeEndX should not equal endX)
            // Instead, we should be coming from the left (beforeEndX < endX) horizontally
            if (beforeEndY < endY) {
                // Approaching from above - check the segment before that
                const twoBeforeX = points[points.length - 6]
                const twoBeforeY = points[points.length - 5]
                
                console.log('Two before end:', twoBeforeX, twoBeforeY)
                
                // The last horizontal segment should approach from the left
                expect(beforeEndY).toBe(endY) // Last segment should be horizontal
                expect(beforeEndX).toBeLessThan(endX) // Approaching from left
            }
        })
    })

    describe('Rule 4 and 5: Combined with route around', () => {
        test('with obstacles, still respects rule 4 (move away from source)', () => {
            const obstacles = [{ x: 250, y: 50, width: 100, height: 80 }]
            
            render(
                <LinkComponent
                    id="test-link"
                    sourceX={100}
                    sourceY={100}
                    sourceWidth={200}
                    sourceHeight={120}
                    targetX={100}
                    targetY={300}
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
            const points = JSON.parse(pointsStr!)

            console.log('Path with obstacles:', points)

            // Start: (300, 160)
            expect(points[0]).toBe(300)
            expect(points[1]).toBe(160)

            // Second point must move RIGHT to clear source
            const secondX = points[2]
            expect(secondX).toBeGreaterThan(300)
        })
    })
})
