import React from 'react'
import { render, screen, act } from '@testing-library/react'
import InfiniteCanvas from '../components/InfiniteCanvas'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('InfiniteCanvas Delete State Integration', () => {
    test('shows delete button on selected state', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create a state
        await act(async () => {
            if (ref.current) {
                ref.current.createState()
            }
        })

        // Verify state was created with delete button (✕)
        const texts = screen.queryAllByTestId('konva-text')
        const deleteButton = texts.find(
            (text) => text.getAttribute('data-text') === '✕'
        )
        expect(deleteButton).toBeTruthy()
    })

    test('creates and displays state on canvas', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Initially no state elements (only grid)
        const initialGroups = screen.queryAllByTestId('konva-group')
        const initialStateGroups = initialGroups.filter(
            (g) => g.getAttribute('draggable') === 'true'
        )
        expect(initialStateGroups.length).toBe(0)

        // Create a state
        await act(async () => {
            if (ref.current) {
                ref.current.createState()
            }
        })

        // Verify state appears with description
        const texts = screen.queryAllByTestId('konva-text')
        const descriptionText = texts.find(
            (text) => text.getAttribute('data-text') === 'New State'
        )
        expect(descriptionText).toBeTruthy()
    })

    test('state has correct default properties', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create a state
        await act(async () => {
            if (ref.current) {
                ref.current.createState()
            }
        })

        // Verify default priority
        const texts = screen.queryAllByTestId('konva-text')
        const priorityText = texts.find((text) =>
            text.getAttribute('data-text')?.includes('Medium')
        )
        expect(priorityText).toBeTruthy()
    })
})
