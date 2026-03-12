// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

const originalConsoleError = console.error;

beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation((...args) => {
        const [message] = args;
        const isReactActDeprecationWarning =
            typeof message === 'string' &&
            message.includes('ReactDOMTestUtils.act') &&
            message.includes('deprecated in favor of `React.act`');

        if (isReactActDeprecationWarning) {
            return;
        }

        originalConsoleError(...args);
    });
});

afterAll(() => {
    if (console.error.mockRestore) {
        console.error.mockRestore();
    }
});

Object.defineProperty(window, 'scrollTo', {
    writable: true,
    value: jest.fn(),
});
