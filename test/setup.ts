import '@testing-library/jest-dom';

// Global mocks if needed
(window as unknown as Record<string, unknown>).require = (window as unknown as Record<string, unknown>).require || function () {
    return {
        ipcRenderer: {
            on: () => { },
            send: () => { },
            invoke: () => Promise.resolve(),
        }
    };
};

// Mock scrollIntoView which is not implemented in JSDOM
HTMLElement.prototype.scrollIntoView = function () { };
