import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import React from 'react';

// Mock the Electron API
const mockElectronAPI = {
    sendMessage: vi.fn().mockResolvedValue({ success: true }),
    onStreamData: vi.fn(),
    onStreamComplete: vi.fn(),
    onStreamError: vi.fn(),
    newConversation: vi.fn(),
    saveTempFile: vi.fn(),
    cleanupTempFiles: vi.fn(),
    removeAllListeners: vi.fn(),
    stopGemini: vi.fn(),
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

    it('renders app header', () => {
        render(<App />);
        expect(screen.getByText('Gemini GUI', { selector: 'h1' })).toBeInTheDocument();
        expect(screen.getByText('Powered by Gemini CLI')).toBeInTheDocument();
    });

    it('renders sidebar', () => {
        render(<App />);
        expect(screen.getByText('새 대화')).toBeInTheDocument();
        expect(screen.getByText('설정')).toBeInTheDocument();
        expect(screen.getByText('대화 기록')).toBeInTheDocument();
    });

    it('renders input area with correct placeholder', () => {
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        expect(input).toBeInTheDocument();
        expect(input.tagName).toBe('TEXTAREA');
    });

    it('renders send button', () => {
        render(<App />);
        expect(screen.getByText('전송')).toBeInTheDocument();
    });

    it('send button is disabled when input is empty', () => {
        render(<App />);
        const sendButton = screen.getByText('전송');
        expect(sendButton).toBeDisabled();
    });

    it('send button is enabled when input has text', async () => {
        const user = userEvent.setup();
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        await user.type(input, 'Hello');
        const sendButton = screen.getByText('전송');
        expect(sendButton).not.toBeDisabled();
    });

    it('clears input after sending message', async () => {
        const user = userEvent.setup();
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/) as HTMLTextAreaElement;
        await user.type(input, 'Hello Gemini');
        const sendButton = screen.getByText('전송');
        await user.click(sendButton);
        expect(input.value).toBe('');
    });

    it('displays user message after sending', async () => {
        const user = userEvent.setup();
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        await user.type(input, 'Hello Gemini');
        await user.click(screen.getByText('전송'));
        expect(screen.getByText('Hello Gemini')).toBeInTheDocument();
        expect(screen.getByText('사용자')).toBeInTheDocument();
    });

    it('removes welcome message after sending first message', async () => {
        const user = userEvent.setup();
        render(<App />);
        expect(screen.getByText('Gemini에 오신 것을 환영합니다!')).toBeInTheDocument();
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        await user.type(input, 'Hello');
        await user.click(screen.getByText('전송'));
        expect(screen.queryByText('Gemini에 오신 것을 환영합니다!')).not.toBeInTheDocument();
    });

    it('shows loading state after sending', async () => {
        const user = userEvent.setup();
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        await user.type(input, 'Hello');
        await user.click(screen.getByText('전송'));
        expect(screen.getByText('전송 중...')).toBeInTheDocument();
    });

    it('disables input while loading', async () => {
        const user = userEvent.setup();
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        await user.type(input, 'Hello');
        await user.click(screen.getByText('전송'));
        expect(input).toBeDisabled();
    });

    it('calls electronAPI.sendMessage when sending', async () => {
        const user = userEvent.setup();
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        await user.type(input, 'Test message');
        await user.click(screen.getByText('전송'));
        expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Test message');
    });

    it('does not send empty messages', async () => {
        const user = userEvent.setup();
        render(<App />);
        await user.click(screen.getByText('전송'));
        expect(mockElectronAPI.sendMessage).not.toHaveBeenCalled();
    });

    it('opens settings modal when settings button is clicked', async () => {
        const user = userEvent.setup();
        render(<App />);
        await user.click(screen.getByText('설정'));
        expect(screen.getByText('모델 선택')).toBeInTheDocument();
    });

    it('closes settings modal', async () => {
        const user = userEvent.setup();
        render(<App />);
        await user.click(screen.getByText('설정'));
        expect(screen.getByText('모델 선택')).toBeInTheDocument();
        await user.click(screen.getByText('취소'));
        expect(screen.queryByText('모델 선택')).not.toBeInTheDocument();
    });

    it('creates new conversation when new chat is clicked', async () => {
        const user = userEvent.setup();
        render(<App />);
        await user.click(screen.getByText('새 대화'));
        expect(mockElectronAPI.newConversation).toHaveBeenCalled();
    });

    it('renders file attachment area', () => {
        render(<App />);
        expect(screen.getByText('파일 첨부 (클릭 또는 드래그)')).toBeInTheDocument();
    });

    it('persists conversations to localStorage', async () => {
        const user = userEvent.setup();
        render(<App />);
        await user.click(screen.getByText('새 대화'));

        const stored = localStorage.getItem('gemini-conversations');
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored!);
        expect(Array.isArray(parsed)).toBe(true);
        expect(parsed.length).toBeGreaterThan(0);
    });

    it('persists settings to localStorage', async () => {
        const user = userEvent.setup();
        render(<App />);

        const stored = localStorage.getItem('gemini-settings');
        expect(stored).not.toBeNull();
        const parsed = JSON.parse(stored!);
        expect(parsed.model).toBe('auto');
        expect(parsed.temperature).toBe(1);
        expect(parsed.maxTokens).toBe(2048);
        expect(parsed.theme).toBe('dark');
    });

    it('restores conversations from localStorage', () => {
        const savedConversations = [
            {
                id: '123',
                title: '저장된 대화',
                timestamp: new Date().toISOString(),
                messages: [
                    { role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
                ],
            },
        ];
        localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
        localStorage.setItem('gemini-current-conversation', '123');

        render(<App />);
        expect(screen.getByText('저장된 대화')).toBeInTheDocument();
        expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    it('registers stream event listeners on mount', () => {
        render(<App />);
        expect(mockElectronAPI.onStreamData).toHaveBeenCalled();
        expect(mockElectronAPI.onStreamComplete).toHaveBeenCalled();
        expect(mockElectronAPI.onStreamError).toHaveBeenCalled();
    });

    it('cleans up listeners on unmount', () => {
        const { unmount } = render(<App />);
        unmount();
        expect(mockElectronAPI.removeAllListeners).toHaveBeenCalled();
        expect(mockElectronAPI.cleanupTempFiles).toHaveBeenCalled();
    });

    it('handles send error gracefully', async () => {
        mockElectronAPI.sendMessage.mockRejectedValueOnce({ error: '연결 실패' });
        const user = userEvent.setup();
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        await user.type(input, 'Hello');
        await user.click(screen.getByText('전송'));
        await waitFor(() => {
            expect(screen.getByText(/오류 발생: 연결 실패/)).toBeInTheDocument();
        });
    });

    // Accessibility tests
    describe('Accessibility', () => {
        it('has role="application" on root element', () => {
            const { container } = render(<App />);
            expect(container.querySelector('[role="application"]')).toBeInTheDocument();
        });

        it('uses <main> element for main content', () => {
            const { container } = render(<App />);
            expect(container.querySelector('main')).toBeInTheDocument();
        });

        it('messages area has role="log" and aria-label', () => {
            render(<App />);
            const messagesArea = screen.getByRole('log');
            expect(messagesArea).toHaveAttribute('aria-label', '대화 메시지');
            expect(messagesArea).toHaveAttribute('aria-live', 'polite');
        });

        it('input container has role="form"', () => {
            render(<App />);
            expect(screen.getByRole('form')).toHaveAttribute('aria-label', '메시지 입력');
        });

        it('textarea has id and associated label', () => {
            render(<App />);
            const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/);
            expect(textarea).toHaveAttribute('id', 'message-input');
            expect(textarea).toHaveAttribute('aria-label', '메시지 입력');
        });

        it('send button has appropriate aria-label', () => {
            render(<App />);
            expect(screen.getByRole('button', { name: '메시지 전송' })).toBeInTheDocument();
        });

        it('loading indicator has role="status"', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            const loadingEl = screen.getByRole('status');
            expect(loadingEl).toHaveAttribute('aria-label', '응답 생성 중');
        });

        it('message bubbles have role="article"', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            const articles = screen.getAllByRole('article');
            expect(articles.length).toBeGreaterThan(0);
            expect(articles[0]).toHaveAttribute('aria-label', '사용자 메시지');
        });
    });
});
