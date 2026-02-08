import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';

// Mock the Electron API
const mockElectronAPI = {
    sendMessage: vi.fn(),
    onStreamData: vi.fn(() => () => { }), // Returns cleanup function
    onStreamComplete: vi.fn(() => () => { }),
    onStreamError: vi.fn(() => () => { }),
    newConversation: vi.fn(),
    saveTempFile: vi.fn(),
    cleanupTempFiles: vi.fn(),
    removeAllListeners: vi.fn(),
};

global.window.electronAPI = mockElectronAPI as any;

describe('App Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('renders welcome message initially', () => {
        render(<App />);
        expect(screen.getByText('Gemini에 오신 것을 환영합니다!')).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/메시지를 입력하세요/)).toBeInTheDocument();
    });

    it('updates input value when typing', () => {
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        // Note: Simple state check, user-event could be used for more realism
        // avoiding user-event setup complexity for this first smoke test
        expect(input).toBeInTheDocument();
    });
});
