/**
 * Debug test for single obstacle routing
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import LinkComponent from '../src/components/Link'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../src/testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('Debug single obstacle', () => {
    test('debug routing with single obstacle', () => {
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
        const line = lines[0]
        const pointsStr = line.getAttribute('data-points')
        const points = JSON.parse(pointsStr!)
        
        console.log("Points:", points)
        console.log("Points length:", points.length)
        console.log("Number of segments:", (points.length - 2) / 2)
    })
})
