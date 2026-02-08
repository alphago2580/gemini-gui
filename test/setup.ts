import '@testing-library/jest-dom';

// Global mocks if needed
(window as any).require = (window as any).require || function () {
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
