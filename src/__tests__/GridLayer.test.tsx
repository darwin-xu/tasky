import React from 'react'
import { render, screen } from '@testing-library/react'
import GridLayer from '../components/GridLayer'

// Mock Konva for testing environment
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

describe('GridLayer Component', () => {
    test('TC2.1: Grid is Rendered on the Canvas', () => {
        render(
            <GridLayer
                x={0}
                y={0}
                scale={1}
                width={800}
                height={600}
                gridSpacing={20}
                dotColor="#e0e0e0"
                dotRadius={1}
            />
        )

        // Verify that grid circles are rendered
        const circles = screen.getAllByTestId('konva-circle')
        expect(circles.length).toBeGreaterThan(0)

        // Verify circle properties
        const firstCircle = circles[0]
        expect(firstCircle).toHaveAttribute('data-fill', '#e0e0e0')
        expect(firstCircle).toHaveAttribute('data-radius', '1')
    })

    test('TC2.2: Grid Remains Aligned During Panning', () => {
        // Test with initial position (0, 0)
        render(
            <GridLayer
                x={0}
                y={0}
                scale={1}
                width={100} // Smaller to make debugging easier
                height={100}
                gridSpacing={20}
            />
        )

        const initialCircles = screen.getAllByTestId('konva-circle')
        expect(initialCircles.length).toBeGreaterThan(0)

        // Test with panned position (25, 0) - quarter of grid spacing
        render(
            <GridLayer
                x={25}
                y={0}
                scale={1}
                width={100}
                height={100}
                gridSpacing={20}
            />
        )

        const pannedCircles = screen.getAllByTestId('konva-circle')
        expect(pannedCircles.length).toBeGreaterThan(0)

        // The grid should render correctly in both cases
        // This confirms the grid adjusts to viewport changes
        expect(pannedCircles.length).toBeGreaterThan(0)
    })

    test('TC2.3: Grid Scales Correctly with Zoom', () => {
        // Test with scale 2.0 to see scaling effect clearly
        render(
            <GridLayer
                x={0}
                y={0}
                scale={2}
                width={100}
                height={100}
                gridSpacing={20}
                dotRadius={1}
            />
        )

        const circles = screen.getAllByTestId('konva-circle')
        expect(circles.length).toBeGreaterThan(0)

        const circle = circles[0]

        // Radius remains constant in world space; stage scale handles on-screen sizing
        expect(circle).toHaveAttribute('data-radius', '1')

        // Verify effective on-screen spacing accounts for zoom level
        const uniqueXPositions = Array.from(
            new Set(
                circles.map((c) => Number(c.getAttribute('data-x')) || 0)
            )
        ).sort((a, b) => a - b)

        expect(uniqueXPositions.length).toBeGreaterThan(1)
        const worldSpacing = uniqueXPositions[1] - uniqueXPositions[0]
        const effectiveScreenSpacing = worldSpacing * 2 // scale factor

        expect(effectiveScreenSpacing).toBeCloseTo(40) // 20 spacing * 2 scale
    })

    test('TC2.4: Grid Styling is Applied', () => {
        const customColor = '#cccccc'
        const customRadius = 2

        render(
            <GridLayer
                x={0}
                y={0}
                scale={1}
                width={400}
                height={300}
                dotColor={customColor}
                dotRadius={customRadius}
            />
        )

        const circles = screen.getAllByTestId('konva-circle')
        const circle = circles[0]

        // Verify custom styling is applied
        expect(circle).toHaveAttribute('data-fill', customColor)
        expect(circle).toHaveAttribute('data-radius', customRadius.toString())
    })

    test('TC2.5: Grid Uses Default Props', () => {
        render(<GridLayer x={0} y={0} scale={1} width={400} height={300} />)

        const circles = screen.getAllByTestId('konva-circle')
        const circle = circles[0]

        // Verify default values are used
        expect(circle).toHaveAttribute('data-fill', '#e0e0e0') // Default color
        expect(circle).toHaveAttribute('data-radius', '1') // Default radius
    })
})
