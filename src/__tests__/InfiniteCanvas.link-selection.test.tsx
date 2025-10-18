import React from 'react'
import { render, screen } from '@testing-library/react'
import LinkComponent from '../components/Link'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('Link Component Selection and Context Menu', () => {
    test('link shows different styling when selected', () => {
        const { rerender } = render(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={false}
            />
        )

        // When not selected, arrow should be gray
        const arrows = screen.queryAllByTestId('konva-arrow')
        expect(arrows.length).toBe(1)
        expect(arrows[0].getAttribute('data-stroke')).toBe('#6b7280')
        expect(arrows[0].getAttribute('data-stroke-width')).toBe('2')

        // When selected, arrow should be blue and thicker
        rerender(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={true}
            />
        )

        expect(arrows[0].getAttribute('data-stroke')).toBe('#2196f3')
        expect(arrows[0].getAttribute('data-stroke-width')).toBe('3')
    })

    test('selected link shows style toggle button', () => {
        const onUpdateLinkStyle = jest.fn()

        render(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={true}
                linkStyle="free"
                onUpdateLinkStyle={onUpdateLinkStyle}
            />
        )

        // Look for style toggle button
        const allTexts = screen.queryAllByTestId('konva-text')
        const styleToggleButton = allTexts.find((text) =>
            text.getAttribute('data-text')?.includes('⇄')
        )

        // Style toggle button should be visible when link is selected
        expect(styleToggleButton).toBeTruthy()
        expect(styleToggleButton?.getAttribute('data-text')).toBe(
            'Free ⇄ Ortho'
        )
    })

    test('selected orthogonal link shows route around checkbox', () => {
        const onUpdateRouteAround = jest.fn()

        render(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={true}
                linkStyle="orthogonal"
                routeAround={false}
                onUpdateRouteAround={onUpdateRouteAround}
            />
        )

        // Look for route around checkbox
        const allTexts = screen.queryAllByTestId('konva-text')
        const routeAroundCheckbox = allTexts.find((text) =>
            text.getAttribute('data-text')?.includes('Route Around')
        )

        // Route around checkbox should be visible for orthogonal links
        expect(routeAroundCheckbox).toBeTruthy()
        expect(routeAroundCheckbox?.getAttribute('data-text')).toBe(
            '☐ Route Around'
        )
    })

    test('route around checkbox not shown for free style links', () => {
        const onUpdateRouteAround = jest.fn()

        render(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={true}
                linkStyle="free"
                routeAround={false}
                onUpdateRouteAround={onUpdateRouteAround}
            />
        )

        // Look for route around checkbox
        const allTexts = screen.queryAllByTestId('konva-text')
        const routeAroundCheckbox = allTexts.find((text) =>
            text.getAttribute('data-text')?.includes('Route Around')
        )

        // Route around checkbox should NOT be visible for free links
        expect(routeAroundCheckbox).toBeUndefined()
    })

    test('style toggle button has correct styling', () => {
        const onUpdateLinkStyle = jest.fn()

        render(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={true}
                linkStyle="free"
                onUpdateLinkStyle={onUpdateLinkStyle}
            />
        )

        // Find the style toggle button (purple rectangle)
        const rects = screen.queryAllByTestId('konva-rect')
        const styleToggleButton = rects.find(
            (rect) => rect.getAttribute('data-fill') === '#8b5cf6'
        )

        expect(styleToggleButton).toBeTruthy()
        expect(styleToggleButton?.getAttribute('data-width')).toBe('80')
        expect(styleToggleButton?.getAttribute('data-height')).toBe('24')
    })

    test('route around checkbox shows checked state correctly', () => {
        const onUpdateRouteAround = jest.fn()

        const { rerender } = render(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={true}
                linkStyle="orthogonal"
                routeAround={false}
                onUpdateRouteAround={onUpdateRouteAround}
            />
        )

        // Unchecked state
        let allTexts = screen.queryAllByTestId('konva-text')
        let checkbox = allTexts.find((text) =>
            text.getAttribute('data-text')?.includes('Route Around')
        )
        expect(checkbox?.getAttribute('data-text')).toBe('☐ Route Around')

        // Find unchecked button color (should be gray)
        let rects = screen.queryAllByTestId('konva-rect')
        let checkboxRect = rects.find(
            (rect) => rect.getAttribute('data-fill') === '#6b7280'
        )
        expect(checkboxRect).toBeTruthy()

        // Checked state
        rerender(
            <LinkComponent
                id="test-link"
                sourceX={0}
                sourceY={0}
                sourceWidth={200}
                sourceHeight={150}
                targetX={300}
                targetY={0}
                targetWidth={200}
                targetHeight={120}
                isSelected={true}
                linkStyle="orthogonal"
                routeAround={true}
                onUpdateRouteAround={onUpdateRouteAround}
            />
        )

        allTexts = screen.queryAllByTestId('konva-text')
        checkbox = allTexts.find((text) =>
            text.getAttribute('data-text')?.includes('Route Around')
        )
        expect(checkbox?.getAttribute('data-text')).toBe('☑ Route Around')

        // Find checked button color (should be green)
        rects = screen.queryAllByTestId('konva-rect')
        checkboxRect = rects.find(
            (rect) => rect.getAttribute('data-fill') === '#10b981'
        )
        expect(checkboxRect).toBeTruthy()
    })
})
