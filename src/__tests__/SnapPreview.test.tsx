import React from 'react'
import { render, screen } from '@testing-library/react'
import { SnapPreview } from '../components/SnapPreview'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('SnapPreview Component', () => {
    test('renders with correct position', () => {
        render(
            <SnapPreview
                x={100}
                y={200}
                width={150}
                height={100}
                fill="rgba(100, 149, 237, 0.3)"
                stroke="rgba(100, 149, 237, 0.8)"
                cornerRadius={4}
            />
        )

        const group = screen.getByTestId('konva-group')
        expect(group).toBeTruthy()
        expect(group.getAttribute('data-x')).toBe('100')
        expect(group.getAttribute('data-y')).toBe('200')
    })

    test('renders rect with correct dimensions', () => {
        render(
            <SnapPreview
                x={0}
                y={0}
                width={250}
                height={180}
                fill="rgba(100, 149, 237, 0.3)"
                stroke="rgba(100, 149, 237, 0.8)"
                cornerRadius={4}
            />
        )

        const rect = screen.getByTestId('konva-rect')
        expect(rect.getAttribute('data-width')).toBe('250')
        expect(rect.getAttribute('data-height')).toBe('180')
    })

    test('renders rect with correct colors', () => {
        const fill = 'rgba(255, 0, 0, 0.5)'
        const stroke = 'rgba(0, 255, 0, 0.8)'

        render(
            <SnapPreview
                x={0}
                y={0}
                width={150}
                height={100}
                fill={fill}
                stroke={stroke}
                cornerRadius={8}
            />
        )

        const rect = screen.getByTestId('konva-rect')
        expect(rect.getAttribute('data-fill')).toBe(fill)
        expect(rect.getAttribute('data-stroke')).toBe(stroke)
    })

    test('renders rect with correct corner radius', () => {
        render(
            <SnapPreview
                x={0}
                y={0}
                width={150}
                height={100}
                fill="rgba(100, 149, 237, 0.3)"
                stroke="rgba(100, 149, 237, 0.8)"
                cornerRadius={10}
            />
        )

        const rect = screen.getByTestId('konva-rect')
        expect(rect.getAttribute('data-corner-radius')).toBe('10')
    })
})
