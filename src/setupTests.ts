// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

jest.mock('react-dom/test-utils', () => {
    const actual = jest.requireActual<typeof import('react-dom/test-utils')>(
        'react-dom/test-utils'
    )
    const react = jest.requireActual<typeof import('react')>('react')

    return {
        ...actual,
        act: react.act,
    }
})
