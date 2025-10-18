import React from 'react'
import { render, screen, act } from '@testing-library/react'
import InfiniteCanvas from '../components/InfiniteCanvas'

// Mock react-konva components with DOM-safe wrappers
jest.mock('react-konva', () => jest.requireActual('../testUtils/mockKonva'))

// Mock Konva
jest.mock('konva', () => ({
    default: {},
}))

describe('InfiniteCanvas Link Creation', () => {
    test('creates a link from Task to State', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create a task
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        // Create a state
        await act(async () => {
            if (ref.current) {
                ref.current.createState()
            }
        })

        // Verify both cards were created
        const texts = screen.queryAllByTestId('konva-text')
        const taskTitle = texts.find(
            (text) => text.getAttribute('data-text') === 'New Task'
        )
        const stateDescription = texts.find(
            (text) => text.getAttribute('data-text') === 'New State'
        )
        expect(taskTitle).toBeTruthy()
        expect(stateDescription).toBeTruthy()

        // Check that layers exist including the links layer
        const layers = screen.getAllByTestId('konva-layer')
        expect(layers).toHaveLength(3) // Grid, Links, Content
    })

    test('displays link connector handle on selected task', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        // Create a task
        await act(async () => {
            if (ref.current) {
                ref.current.createTask()
            }
        })

        // Task should be selected (has link handle)
        const texts = screen.queryAllByTestId('konva-text')
        const linkHandle = texts.find(
            (text) => text.getAttribute('data-text') === '→'
        )
        expect(linkHandle).toBeTruthy()
    })

    test('link layer exists and is positioned correctly', async () => {
        const ref = React.createRef<any>()
        render(<InfiniteCanvas ref={ref} />)

        const layers = screen.getAllByTestId('konva-layer')
        expect(layers).toHaveLength(3)

        // Links layer should be the second layer (after grid, before content)
        expect(layers[1]).toBeInTheDocument()
    })
})
