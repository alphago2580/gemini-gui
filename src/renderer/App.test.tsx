import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import React from 'react';
import type { StreamData } from '../preload/types';

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
    exportMarkdown: vi.fn().mockResolvedValue({ success: true, path: '/tmp/test.md' }),
    exportPdf: vi.fn().mockResolvedValue({ success: true, path: '/tmp/test.pdf' }),
    onMenuAction: vi.fn(),
    showNotification: vi.fn().mockResolvedValue({ success: true }),
    isWindowFocused: vi.fn().mockResolvedValue(true),
    setWindowTitle: vi.fn().mockResolvedValue(undefined),
};

global.window.electronAPI = mockElectronAPI as unknown as typeof window.electronAPI;

/**
 * Helper to capture stream callbacks that mockElectronAPI registers.
 * Returns an object with nullable callback refs for streamData and streamComplete.
 */
function setupStreamCallbacks() {
    const callbacks = {
        streamData: null as ((data: StreamData) => void) | null,
        streamComplete: null as (() => void) | null,
    };
    mockElectronAPI.onStreamData.mockImplementation((cb: (data: StreamData) => void) => {
        callbacks.streamData = cb;
    });
    mockElectronAPI.onStreamComplete.mockImplementation((cb: () => void) => {
        callbacks.streamComplete = cb;
    });
    return callbacks;
}

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
        expect(screen.getByText('모델: 자동 (Auto)')).toBeInTheDocument();
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

    it('shows stop button after sending', async () => {
        const user = userEvent.setup();
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        await user.type(input, 'Hello');
        await user.click(screen.getByText('전송'));
        expect(screen.getByText('중지')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '응답 생성 중지' })).toBeInTheDocument();
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
        expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Test message', undefined, undefined);
    });

    it('sends message with Ctrl+Enter', async () => {
        const user = userEvent.setup();
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        await user.type(input, 'Ctrl Enter test');
        fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
        await waitFor(() => {
            expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Ctrl Enter test', undefined, undefined);
        });
    });

    it('does not send on Shift+Enter (newline)', async () => {
        const user = userEvent.setup();
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        await user.type(input, 'Should not send');
        fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
        expect(mockElectronAPI.sendMessage).not.toHaveBeenCalled();
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
        expect(screen.getAllByText('저장된 대화').length).toBeGreaterThanOrEqual(1);
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

    it('shows toast notification on send error', async () => {
        mockElectronAPI.sendMessage.mockRejectedValueOnce({ error: '타임아웃' });
        const user = userEvent.setup();
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        await user.type(input, 'Hello');
        await user.click(screen.getByText('전송'));
        await waitFor(() => {
            expect(screen.getByRole('alert')).toBeInTheDocument();
            expect(screen.getByText(/메시지 전송 실패: 타임아웃/)).toBeInTheDocument();
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

    // Export conversation tests
    describe('Export Conversation', () => {
        it('does not show export button when no messages', () => {
            render(<App />);
            expect(screen.queryByText('Export')).not.toBeInTheDocument();
        });

        it('shows export button when there are messages', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            expect(screen.getByText('Export')).toBeInTheDocument();
        });

        it('export button has correct aria-label', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            expect(screen.getByRole('button', { name: '대화 내보내기' })).toBeInTheDocument();
        });

        it('calls exportMarkdown when export button is clicked', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            await user.click(screen.getByText('Export'));
            await waitFor(() => {
                expect(mockElectronAPI.exportMarkdown).toHaveBeenCalled();
            });
        });

        it('passes markdown content and filename to exportMarkdown', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            await user.click(screen.getByText('Export'));
            await waitFor(() => {
                const [content, fileName] = mockElectronAPI.exportMarkdown.mock.calls[0];
                expect(content).toContain('Hello');
                expect(content).toContain('### User');
                expect(fileName).toMatch(/\.md$/);
            });
        });
    });

    // Export PDF tests
    describe('Export PDF', () => {
        it('does not show PDF button when no messages', () => {
            render(<App />);
            expect(screen.queryByText('PDF')).not.toBeInTheDocument();
        });

        it('shows PDF button when there are messages', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            expect(screen.getByText('PDF')).toBeInTheDocument();
        });

        it('PDF button has correct aria-label', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            expect(screen.getByRole('button', { name: 'PDF로 내보내기' })).toBeInTheDocument();
        });

        it('calls exportPdf when PDF button is clicked', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            await user.click(screen.getByText('PDF'));
            await waitFor(() => {
                expect(mockElectronAPI.exportPdf).toHaveBeenCalled();
            });
        });

        it('passes HTML content and .pdf filename to exportPdf', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            await user.click(screen.getByText('PDF'));
            await waitFor(() => {
                const [content, fileName] = mockElectronAPI.exportPdf.mock.calls[0];
                expect(content).toContain('<!DOCTYPE html>');
                expect(content).toContain('Hello');
                expect(fileName).toMatch(/\.pdf$/);
            });
        });
    });

    // Delete message tests
    describe('Delete Message', () => {
        it('shows delete button on messages', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            expect(screen.getByRole('button', { name: '메시지 삭제' })).toBeInTheDocument();
        });

        it('removes message when delete button is clicked', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Test message to delete');
            await user.click(screen.getByText('전송'));
            expect(screen.getByText('Test message to delete')).toBeInTheDocument();

            await user.click(screen.getByRole('button', { name: '메시지 삭제' }));
            expect(screen.queryByText('Test message to delete')).not.toBeInTheDocument();
        });
    });

    // Ctrl+F search focus test
    describe('Search Focus', () => {
        it('opens inline search on Ctrl+F', async () => {
            render(<App />);
            expect(screen.queryByPlaceholderText('대화 내 검색...')).not.toBeInTheDocument();

            fireEvent.keyDown(document, { key: 'f', ctrlKey: true });
            expect(screen.getByPlaceholderText('대화 내 검색...')).toBeInTheDocument();
        });
    });

    // Clear conversation tests
    describe('Clear Conversation', () => {
        it('does not show clear button when no messages', () => {
            render(<App />);
            expect(screen.queryByText('Clear')).not.toBeInTheDocument();
        });

        it('shows clear button when there are messages', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            expect(screen.getByText('Clear')).toBeInTheDocument();
        });

        it('clears all messages when clear button is clicked', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Message to clear');
            await user.click(screen.getByText('전송'));
            expect(screen.getByText('Message to clear')).toBeInTheDocument();

            await user.click(screen.getByText('Clear'));
            expect(screen.queryByText('Message to clear')).not.toBeInTheDocument();
            expect(screen.getByText('Gemini에 오신 것을 환영합니다!')).toBeInTheDocument();
        });

        it('clear button has correct aria-label', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            expect(screen.getByRole('button', { name: '대화 지우기' })).toBeInTheDocument();
        });
    });

    // Sidebar collapse tests
    describe('Sidebar Collapse', () => {
        it('renders collapse toggle button', () => {
            render(<App />);
            expect(screen.getByRole('button', { name: '사이드바 접기' })).toBeInTheDocument();
        });

        it('collapses sidebar on Ctrl+B', () => {
            render(<App />);
            expect(screen.getByText('대화 기록')).toBeInTheDocument();

            fireEvent.keyDown(document, { key: 'b', ctrlKey: true });
            expect(screen.queryByText('대화 기록')).not.toBeInTheDocument();
        });

        it('expands sidebar on second Ctrl+B', () => {
            render(<App />);
            fireEvent.keyDown(document, { key: 'b', ctrlKey: true });
            expect(screen.queryByText('대화 기록')).not.toBeInTheDocument();

            fireEvent.keyDown(document, { key: 'b', ctrlKey: true });
            expect(screen.getByText('대화 기록')).toBeInTheDocument();
        });

        it('collapses sidebar when collapse button is clicked', () => {
            render(<App />);
            fireEvent.click(screen.getByRole('button', { name: '사이드바 접기' }));
            expect(screen.queryByText('대화 기록')).not.toBeInTheDocument();
            expect(screen.getByRole('button', { name: '사이드바 펼치기' })).toBeInTheDocument();
        });

        it('persists collapse state to localStorage', () => {
            render(<App />);
            fireEvent.click(screen.getByRole('button', { name: '사이드바 접기' }));
            expect(JSON.parse(localStorage.getItem('gemini-sidebar-collapsed') || 'false')).toBe(true);
        });
    });

    // High contrast mode tests
    describe('High Contrast', () => {
        it('sets data-high-contrast attribute on document', () => {
            render(<App />);
            expect(document.documentElement.getAttribute('data-high-contrast')).toBe('false');
        });

        it('enables high contrast via settings toggle', async () => {
            const user = userEvent.setup();
            render(<App />);
            // Open settings
            fireEvent.keyDown(document, { key: ',', ctrlKey: true });
            // Click high contrast toggle
            const toggle = screen.getByRole('switch', { name: '고대비 모드' });
            await user.click(toggle);
            expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');
        });

        it('persists high contrast state to localStorage', async () => {
            const user = userEvent.setup();
            render(<App />);
            fireEvent.keyDown(document, { key: ',', ctrlKey: true });
            const toggle = screen.getByRole('switch', { name: '고대비 모드' });
            await user.click(toggle);
            expect(JSON.parse(localStorage.getItem('gemini-high-contrast') || 'false')).toBe(true);
        });
    });

    // Command palette integration tests
    describe('Command Palette', () => {
        it('opens command palette with Ctrl+Shift+P', () => {
            render(<App />);
            expect(screen.queryByRole('dialog', { name: '명령 팔레트' })).not.toBeInTheDocument();

            fireEvent.keyDown(document, { key: 'p', ctrlKey: true, shiftKey: true });
            expect(screen.getByRole('dialog', { name: '명령 팔레트' })).toBeInTheDocument();
        });

        it('closes command palette with Escape', () => {
            render(<App />);
            fireEvent.keyDown(document, { key: 'p', ctrlKey: true, shiftKey: true });
            expect(screen.getByRole('dialog', { name: '명령 팔레트' })).toBeInTheDocument();

            fireEvent.keyDown(screen.getByPlaceholderText('명령어 검색...'), { key: 'Escape' });
            expect(screen.queryByRole('dialog', { name: '명령 팔레트' })).not.toBeInTheDocument();
        });

        it('shows all commands in palette', () => {
            render(<App />);
            fireEvent.keyDown(document, { key: 'p', ctrlKey: true, shiftKey: true });

            const palette = screen.getByRole('dialog', { name: '명령 팔레트' });
            expect(palette).toBeInTheDocument();
            // Check the listbox has all commands
            const options = screen.getAllByRole('option');
            expect(options.length).toBeGreaterThanOrEqual(5);
        });

        it('executes new chat command from palette', async () => {
            const user = userEvent.setup();
            render(<App />);
            fireEvent.keyDown(document, { key: 'p', ctrlKey: true, shiftKey: true });

            // Use the option role to target the palette item specifically
            const newChatOption = screen.getByRole('option', { name: /새 대화/ });
            await user.click(newChatOption);
            expect(mockElectronAPI.newConversation).toHaveBeenCalled();
            // Palette should close after executing
            expect(screen.queryByRole('dialog', { name: '명령 팔레트' })).not.toBeInTheDocument();
        });

        it('opens settings from palette', async () => {
            const user = userEvent.setup();
            render(<App />);
            fireEvent.keyDown(document, { key: 'p', ctrlKey: true, shiftKey: true });

            const settingsOption = screen.getByRole('option', { name: /설정 열기/ });
            await user.click(settingsOption);
            // Settings should be open
            expect(screen.getByText('모델 선택')).toBeInTheDocument();
            // Palette should close
            expect(screen.queryByRole('dialog', { name: '명령 팔레트' })).not.toBeInTheDocument();
        });

        it('toggles command palette off with second Ctrl+Shift+P', () => {
            render(<App />);
            fireEvent.keyDown(document, { key: 'p', ctrlKey: true, shiftKey: true });
            expect(screen.getByRole('dialog', { name: '명령 팔레트' })).toBeInTheDocument();

            fireEvent.keyDown(document, { key: 'p', ctrlKey: true, shiftKey: true });
            expect(screen.queryByRole('dialog', { name: '명령 팔레트' })).not.toBeInTheDocument();
        });
    });

    // Typing indicator tests
    describe('Typing Indicator', () => {
        it('shows typing indicator with "생각하는 중..." when loading', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            expect(screen.getByText('생각하는 중...')).toBeInTheDocument();
        });

        it('shows typing indicator with role="status" during loading', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            const statusEl = screen.getByRole('status');
            expect(statusEl).toHaveAttribute('aria-label', '응답 생성 중');
        });

        it('shows three animated dots in typing indicator', async () => {
            const user = userEvent.setup();
            const { container } = render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            const dots = container.querySelectorAll('.typing-dots span');
            expect(dots.length).toBe(3);
        });

        it('applies streaming-cursor class when streaming data arrives', async () => {
            const callbacks = setupStreamCallbacks();

            const user = userEvent.setup();
            const { container } = render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            // Simulate streaming data arriving
            await act(() => {
                if (callbacks.streamData) {
                    callbacks.streamData({
                        type: 'message',
                        role: 'assistant',
                        content: 'Hi',
                        delta: true,
                    });
                }
            });

            const streamingContent = container.querySelector('.streaming-cursor');
            expect(streamingContent).toBeInTheDocument();
        });

        it('shows "입력 중..." when streaming', async () => {
            const callbacks = setupStreamCallbacks();

            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            // Simulate streaming
            await act(() => {
                if (callbacks.streamData) {
                    callbacks.streamData({
                        type: 'message',
                        role: 'assistant',
                        content: 'Response',
                        delta: true,
                    });
                }
            });

            expect(screen.getByText('입력 중...')).toBeInTheDocument();
        });
    });

    // Paste image tests
    describe('Paste Image from Clipboard', () => {
        function createPasteEvent(files: File[]) {
            const items = files.map(file => ({
                kind: 'file' as const,
                type: file.type,
                getAsFile: () => file,
                getAsString: vi.fn(),
                webkitGetAsEntry: vi.fn(),
            }));

            return {
                clipboardData: {
                    items,
                    files,
                    getData: vi.fn(),
                    setData: vi.fn(),
                    clearData: vi.fn(),
                    types: [],
                },
                preventDefault: vi.fn(),
            };
        }

        it('attaches pasted image to file list', () => {
            render(<App />);
            const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/);
            const imageFile = new File(['fake-image'], 'screenshot.png', { type: 'image/png' });
            const pasteEvent = createPasteEvent([imageFile]);

            fireEvent.paste(textarea, pasteEvent);

            expect(screen.getByText('screenshot.png')).toBeInTheDocument();
        });

        it('attaches jpeg image from paste', () => {
            render(<App />);
            const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/);
            const imageFile = new File(['fake-image'], 'photo.jpg', { type: 'image/jpeg' });
            const pasteEvent = createPasteEvent([imageFile]);

            fireEvent.paste(textarea, pasteEvent);

            expect(screen.getByText('photo.jpg')).toBeInTheDocument();
        });

        it('does not attach non-image files from paste', () => {
            render(<App />);
            const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/);

            const pasteEvent = {
                clipboardData: {
                    items: [{
                        kind: 'string' as const,
                        type: 'text/plain',
                        getAsFile: () => null,
                        getAsString: vi.fn(),
                        webkitGetAsEntry: vi.fn(),
                    }],
                    files: [],
                    getData: vi.fn(),
                    setData: vi.fn(),
                    clearData: vi.fn(),
                    types: [],
                },
            };

            fireEvent.paste(textarea, pasteEvent);
            // No file chips should appear in the file attachment area
            expect(screen.queryByText(/\.png$/)).not.toBeInTheDocument();
            expect(screen.queryByText(/\.jpg$/)).not.toBeInTheDocument();
        });

        it('handles multiple pasted images', () => {
            render(<App />);
            const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/);
            const image1 = new File(['img1'], 'img1.png', { type: 'image/png' });
            const image2 = new File(['img2'], 'img2.jpg', { type: 'image/jpeg' });
            const pasteEvent = createPasteEvent([image1, image2]);

            fireEvent.paste(textarea, pasteEvent);

            expect(screen.getByText('img1.png')).toBeInTheDocument();
            expect(screen.getByText('img2.jpg')).toBeInTheDocument();
        });
    });

    // Message edit tests
    describe('Edit Message', () => {
        it('shows edit button on user messages', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Editable message');
            await user.click(screen.getByText('전송'));
            expect(screen.getByRole('button', { name: '메시지 수정' })).toBeInTheDocument();
        });

        it('enters edit mode when edit button is clicked', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Original message');
            await user.click(screen.getByText('전송'));

            await user.click(screen.getByRole('button', { name: '메시지 수정' }));
            expect(screen.getByLabelText('메시지 수정 입력')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '수정 저장' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '수정 취소' })).toBeInTheDocument();
        });

        it('populates edit textarea with original content', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Original message');
            await user.click(screen.getByText('전송'));

            await user.click(screen.getByRole('button', { name: '메시지 수정' }));
            const editInput = screen.getByLabelText('메시지 수정 입력') as HTMLTextAreaElement;
            expect(editInput.value).toBe('Original message');
        });

        it('saves edited message content', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Before edit');
            await user.click(screen.getByText('전송'));

            await user.click(screen.getByRole('button', { name: '메시지 수정' }));
            const editInput = screen.getByLabelText('메시지 수정 입력');
            await user.clear(editInput);
            await user.type(editInput, 'After edit');
            await user.click(screen.getByRole('button', { name: '수정 저장' }));

            // Should exit edit mode
            expect(screen.queryByLabelText('메시지 수정 입력')).not.toBeInTheDocument();
            // The message content should be updated (check within article element)
            await waitFor(() => {
                const articles = screen.getAllByRole('article');
                const userArticle = articles.find(a => a.getAttribute('aria-label') === '사용자 메시지');
                expect(userArticle).toBeTruthy();
                expect(userArticle!.textContent).toContain('After edit');
            });
        });

        it('cancels edit and keeps original content', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Keep this');
            await user.click(screen.getByText('전송'));

            await user.click(screen.getByRole('button', { name: '메시지 수정' }));
            const editInput = screen.getByLabelText('메시지 수정 입력');
            await user.clear(editInput);
            await user.type(editInput, 'Changed');
            await user.click(screen.getByRole('button', { name: '수정 취소' }));

            expect(screen.getByText('Keep this')).toBeInTheDocument();
            expect(screen.queryByText('Changed')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('메시지 수정 입력')).not.toBeInTheDocument();
        });
    });

    describe('Prompt Templates', () => {
        it('renders prompt templates trigger button', () => {
            render(<App />);
            expect(screen.getByRole('button', { name: '프롬프트 템플릿' })).toBeInTheDocument();
        });

        it('opens template dropdown and shows default templates', async () => {
            const user = userEvent.setup();
            render(<App />);
            await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
            const listbox = screen.getByRole('listbox', { name: '프롬프트 템플릿' });
            expect(listbox).toBeInTheDocument();
            expect(screen.getByText('번역 (한→영)')).toBeInTheDocument();
            expect(within(listbox).getByText('코드 리뷰')).toBeInTheDocument();
            expect(screen.getByText('요약')).toBeInTheDocument();
        });

        it('inserts template content into input when selected', async () => {
            const user = userEvent.setup();
            render(<App />);
            await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
            await user.click(screen.getByRole('option', { name: '번역 (한→영)' }));
            const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/) as HTMLTextAreaElement;
            expect(textarea.value).toContain('번역');
        });

        it('appends template content to existing input', async () => {
            const user = userEvent.setup();
            render(<App />);
            const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/) as HTMLTextAreaElement;
            await user.type(textarea, 'Hello ');
            await user.click(screen.getByRole('button', { name: '프롬프트 템플릿' }));
            await user.click(screen.getByRole('option', { name: '요약' }));
            expect(textarea.value).toContain('Hello ');
            expect(textarea.value).toContain('요약');
        });

        it('template trigger button is in input row', () => {
            render(<App />);
            const trigger = screen.getByRole('button', { name: '프롬프트 템플릿' });
            expect(trigger.closest('.input-row')).toBeTruthy();
        });
    });

    describe('System Prompt', () => {
        it('sends system prompt with message when configured', async () => {
            // Set system prompt in settings localStorage
            const settingsWithPrompt = {
                model: 'auto',
                temperature: 1,
                maxTokens: 2048,
                theme: 'dark',
                systemPrompt: 'You are a helpful tutor'
            };
            localStorage.setItem('gemini-settings', JSON.stringify(settingsWithPrompt));

            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Hello', 'You are a helpful tutor', undefined);
        });

        it('sends undefined system prompt when not configured', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Hello', undefined, undefined);
        });

        it('opens settings and shows system prompt editor', async () => {
            const user = userEvent.setup();
            render(<App />);
            fireEvent.keyDown(document, { key: ',', ctrlKey: true });
            expect(screen.getByLabelText('시스템 프롬프트')).toBeInTheDocument();
        });
    });

    describe('Token Usage Display', () => {
        it('does not show token usage initially', () => {
            render(<App />);
            expect(screen.queryByRole('status', { name: '토큰 사용량' })).not.toBeInTheDocument();
        });

        it('shows token usage after receiving result stats', async () => {
            const callbacks = setupStreamCallbacks();

            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            // Simulate streaming message
            await act(() => {
                if (callbacks.streamData) {
                    callbacks.streamData({
                        type: 'message',
                        role: 'assistant',
                        content: 'Hi there',
                        delta: true,
                    });
                }
            });

            // Simulate result with token stats
            await act(() => {
                if (callbacks.streamData) {
                    callbacks.streamData({
                        type: 'result',
                        stats: { inputTokens: 10, outputTokens: 5, totalTokens: 15 },
                    });
                }
            });

            // Simulate stream complete
            await act(() => {
                if (callbacks.streamComplete) {
                    callbacks.streamComplete();
                }
            });

            const tokenDisplay = screen.getByRole('status', { name: '토큰 사용량' });
            expect(tokenDisplay).toBeInTheDocument();
            expect(tokenDisplay).toHaveTextContent('10');
            expect(tokenDisplay).toHaveTextContent('5');
            expect(tokenDisplay).toHaveTextContent('15');
        });

        it('hides token usage while loading', async () => {
            const callbacks = setupStreamCallbacks();

            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'First');
            await user.click(screen.getByText('전송'));

            // Complete first exchange with stats
            await act(() => {
                if (callbacks.streamData) {
                    callbacks.streamData({
                        type: 'message',
                        role: 'assistant',
                        content: 'Response',
                        delta: true,
                    });
                    callbacks.streamData({
                        type: 'result',
                        stats: { inputTokens: 20, outputTokens: 10, totalTokens: 30 },
                    });
                }
            });
            await act(() => {
                if (callbacks.streamComplete) {
                    callbacks.streamComplete();
                }
            });

            expect(screen.getByRole('status', { name: '토큰 사용량' })).toBeInTheDocument();

            // Now send another message — token usage should be hidden during loading
            const input2 = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input2, 'Second');
            await user.click(screen.getByText('전송'));

            expect(screen.queryByRole('status', { name: '토큰 사용량' })).not.toBeInTheDocument();
        });

        it('handles snake_case token stats from CLI', async () => {
            const callbacks = setupStreamCallbacks();

            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            await act(() => {
                if (callbacks.streamData) {
                    callbacks.streamData({
                        type: 'message',
                        role: 'assistant',
                        content: 'Hi',
                        delta: true,
                    });
                    callbacks.streamData({
                        type: 'result',
                        stats: { input_tokens: 25, output_tokens: 15, total_tokens: 40 },
                    });
                }
            });
            await act(() => {
                if (callbacks.streamComplete) {
                    callbacks.streamComplete();
                }
            });

            const tokenDisplay = screen.getByRole('status', { name: '토큰 사용량' });
            expect(tokenDisplay).toHaveTextContent('25');
            expect(tokenDisplay).toHaveTextContent('15');
            expect(tokenDisplay).toHaveTextContent('40');
        });

        it('does not show token usage when stats have zero tokens', async () => {
            const callbacks = setupStreamCallbacks();

            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            await act(() => {
                if (callbacks.streamData) {
                    callbacks.streamData({
                        type: 'message',
                        role: 'assistant',
                        content: 'Hi',
                        delta: true,
                    });
                    callbacks.streamData({
                        type: 'result',
                        stats: { someOtherField: 'value' },
                    });
                }
            });
            await act(() => {
                if (callbacks.streamComplete) {
                    callbacks.streamComplete();
                }
            });

            expect(screen.queryByRole('status', { name: '토큰 사용량' })).not.toBeInTheDocument();
        });
    });

    describe('Delete Conversation', () => {
        it('shows delete buttons on conversation items in sidebar', async () => {
            const user = userEvent.setup();
            render(<App />);
            // Create a conversation with a message
            await user.click(screen.getByText('새 대화'));
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            // Delete button should be present on the conversation item
            expect(screen.getByRole('button', { name: /대화 삭제:/ })).toBeInTheDocument();
        });

        it('removes conversation from sidebar when delete is clicked', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Create first conversation
            vi.spyOn(Date, 'now').mockReturnValueOnce(1000);
            await user.click(screen.getByText('새 대화'));

            // Create second conversation
            vi.spyOn(Date, 'now').mockReturnValueOnce(2000);
            await user.click(screen.getByText('새 대화'));

            const convItems = screen.getAllByRole('listitem');
            const realConvItems = convItems.filter(item => item.classList.contains('conversation-item'));
            expect(realConvItems).toHaveLength(2);

            // Delete the first one (not currently selected)
            const deleteButtons = screen.getAllByRole('button', { name: /대화 삭제:/ });
            await user.click(deleteButtons[1]); // second in DOM = older conversation

            const remainingItems = screen.getAllByRole('listitem').filter(item => item.classList.contains('conversation-item'));
            expect(remainingItems).toHaveLength(1);
        });

        it('clears messages when deleting the current conversation', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Create conversation and add message
            await user.click(screen.getByText('새 대화'));
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Test message for deletion');
            await user.click(screen.getByText('전송'));

            // Verify message appears in message area (article)
            const articles = screen.getAllByRole('article');
            expect(articles.some(a => a.textContent?.includes('Test message for deletion'))).toBe(true);

            // Delete the current conversation
            const deleteBtn = screen.getByRole('button', { name: /대화 삭제:/ });
            await user.click(deleteBtn);

            // Messages should be cleared and welcome message should appear
            expect(screen.queryByRole('article')).not.toBeInTheDocument();
            expect(screen.getByText('Gemini에 오신 것을 환영합니다!')).toBeInTheDocument();
        });
    });

    describe('Native Menu Actions', () => {
        it('registers onMenuAction listener on mount', () => {
            render(<App />);
            expect(mockElectronAPI.onMenuAction).toHaveBeenCalledWith(expect.any(Function));
        });

        it('opens settings when menu sends settings action', async () => {
            let menuCallback: ((action: string) => void) | null = null;
            mockElectronAPI.onMenuAction.mockImplementation((cb: (action: string) => void) => {
                menuCallback = cb;
            });

            render(<App />);
            expect(menuCallback).not.toBeNull();

            await act(() => {
                menuCallback!('settings');
            });

            expect(screen.getByRole('dialog')).toBeInTheDocument();
        });

        it('opens command palette when menu sends command-palette action', async () => {
            let menuCallback: ((action: string) => void) | null = null;
            mockElectronAPI.onMenuAction.mockImplementation((cb: (action: string) => void) => {
                menuCallback = cb;
            });

            render(<App />);

            await act(() => {
                menuCallback!('command-palette');
            });

            expect(screen.getByRole('dialog', { name: '명령 팔레트' })).toBeInTheDocument();
        });
    });

    describe('Model Selection', () => {
        it('shows default model name in header', () => {
            render(<App />);
            expect(screen.getByText('모델: 자동 (Auto)')).toBeInTheDocument();
        });

        it('shows selected model name in header after settings change', async () => {
            const settingsWithModel = {
                model: 'gemini-2.5-pro',
                temperature: 1,
                maxTokens: 2048,
                theme: 'dark',
                systemPrompt: ''
            };
            localStorage.setItem('gemini-settings', JSON.stringify(settingsWithModel));

            render(<App />);
            expect(screen.getByText('모델: Gemini 2.5 Pro')).toBeInTheDocument();
        });

        it('sends model with message when non-auto model is selected', async () => {
            const settingsWithModel = {
                model: 'gemini-2.5-flash',
                temperature: 1,
                maxTokens: 2048,
                theme: 'dark',
                systemPrompt: ''
            };
            localStorage.setItem('gemini-settings', JSON.stringify(settingsWithModel));

            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Hello', undefined, 'gemini-2.5-flash');
        });

        it('sends undefined model when auto is selected', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));
            expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Hello', undefined, undefined);
        });

        it('updates model via settings and sends with new model', async () => {
            const user = userEvent.setup();
            render(<App />);

            // Open settings
            fireEvent.keyDown(document, { key: ',', ctrlKey: true });

            // Change model
            const modelSelect = screen.getByLabelText('모델 선택');
            fireEvent.change(modelSelect, { target: { value: 'gemini-2.0-flash' } });

            // Save settings
            await user.click(screen.getByText('저장'));

            // Send a message
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Test');
            await user.click(screen.getByText('전송'));
            expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Test', undefined, 'gemini-2.0-flash');
        });

        it('displays model selection in settings with all options', async () => {
            render(<App />);
            fireEvent.keyDown(document, { key: ',', ctrlKey: true });
            expect(screen.getByLabelText('모델 선택')).toBeInTheDocument();
            expect(screen.getByText('Gemini 2.5 Pro')).toBeInTheDocument();
            expect(screen.getByText('Gemini 2.5 Flash')).toBeInTheDocument();
        });
    });

    describe('Tab Bar', () => {
        it('shows tab bar when a conversation exists', async () => {
            render(<App />);
            // Create a new conversation by sending a message
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await userEvent.type(input, 'Hello');
            fireEvent.click(screen.getByLabelText('메시지 전송'));

            await waitFor(() => {
                expect(screen.getByRole('tablist')).toBeInTheDocument();
            });
        });

        it('creates a tab when new conversation is started', async () => {
            render(<App />);
            fireEvent.click(screen.getByLabelText('새 대화 시작'));

            await waitFor(() => {
                const tabs = screen.getAllByRole('tab');
                expect(tabs.length).toBeGreaterThanOrEqual(1);
            });
        });

        it('shows tab for restored conversation from localStorage', () => {
            const savedConversations = [
                {
                    id: '100',
                    title: '탭 테스트 대화',
                    timestamp: new Date().toISOString(),
                    messages: [
                        { role: 'user', content: 'Test msg', timestamp: new Date().toISOString() },
                    ],
                },
            ];
            localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
            localStorage.setItem('gemini-current-conversation', '100');

            render(<App />);
            const tablist = screen.getByRole('tablist');
            expect(tablist).toBeInTheDocument();
            // Tab should exist with the conversation title
            expect(screen.getAllByText('탭 테스트 대화').length).toBeGreaterThanOrEqual(1);
        });

        it('switches conversation when tab is clicked', async () => {
            const savedConversations = [
                {
                    id: '200',
                    title: '첫 번째 탭',
                    timestamp: new Date().toISOString(),
                    messages: [
                        { role: 'user', content: 'First msg', timestamp: new Date().toISOString() },
                    ],
                },
                {
                    id: '201',
                    title: '두 번째 탭',
                    timestamp: new Date().toISOString(),
                    messages: [
                        { role: 'user', content: 'Second msg', timestamp: new Date().toISOString() },
                    ],
                },
            ];
            localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
            localStorage.setItem('gemini-current-conversation', '200');
            localStorage.setItem('gemini-open-tabs', JSON.stringify(['200', '201']));

            render(<App />);

            // Wait for tabs to render
            await waitFor(() => {
                const tabs = screen.getAllByRole('tab');
                expect(tabs.length).toBe(2);
            });

            // Click second tab
            const tabs = screen.getAllByRole('tab');
            const secondTab = tabs.find(t => t.getAttribute('aria-label') === '탭: 두 번째 탭');
            expect(secondTab).toBeTruthy();
            fireEvent.click(secondTab!);

            // Should display second conversation's message
            await waitFor(() => {
                expect(screen.getByText('Second msg')).toBeInTheDocument();
            });
        });

        it('new tab button creates a new conversation', async () => {
            const savedConversations = [
                {
                    id: '300',
                    title: '기존 대화',
                    timestamp: new Date().toISOString(),
                    messages: [
                        { role: 'user', content: 'Existing', timestamp: new Date().toISOString() },
                    ],
                },
            ];
            localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
            localStorage.setItem('gemini-current-conversation', '300');
            localStorage.setItem('gemini-open-tabs', JSON.stringify(['300']));

            render(<App />);
            fireEvent.click(screen.getByLabelText('새 탭'));

            await waitFor(() => {
                const tabs = screen.getAllByRole('tab');
                expect(tabs.length).toBeGreaterThanOrEqual(2);
            });
        });

        it('Ctrl+Tab switches to next tab', async () => {
            const savedConversations = [
                {
                    id: '400',
                    title: '탭 A',
                    timestamp: new Date().toISOString(),
                    messages: [
                        { role: 'user', content: 'Msg A', timestamp: new Date().toISOString() },
                    ],
                },
                {
                    id: '401',
                    title: '탭 B',
                    timestamp: new Date().toISOString(),
                    messages: [
                        { role: 'user', content: 'Msg B', timestamp: new Date().toISOString() },
                    ],
                },
            ];
            localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
            localStorage.setItem('gemini-current-conversation', '400');
            localStorage.setItem('gemini-open-tabs', JSON.stringify(['400', '401']));

            render(<App />);
            await waitFor(() => {
                expect(screen.getByText('Msg A')).toBeInTheDocument();
            });

            fireEvent.keyDown(document, { key: 'Tab', ctrlKey: true });
            await waitFor(() => {
                expect(screen.getByText('Msg B')).toBeInTheDocument();
            });
        });

        it('Ctrl+Shift+Tab switches to previous tab', async () => {
            const savedConversations = [
                {
                    id: '500',
                    title: '탭 X',
                    timestamp: new Date().toISOString(),
                    messages: [
                        { role: 'user', content: 'Msg X', timestamp: new Date().toISOString() },
                    ],
                },
                {
                    id: '501',
                    title: '탭 Y',
                    timestamp: new Date().toISOString(),
                    messages: [
                        { role: 'user', content: 'Msg Y', timestamp: new Date().toISOString() },
                    ],
                },
            ];
            localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
            localStorage.setItem('gemini-current-conversation', '501');
            localStorage.setItem('gemini-open-tabs', JSON.stringify(['500', '501']));

            render(<App />);
            await waitFor(() => {
                expect(screen.getByText('Msg Y')).toBeInTheDocument();
            });

            fireEvent.keyDown(document, { key: 'Tab', ctrlKey: true, shiftKey: true });
            await waitFor(() => {
                expect(screen.getByText('Msg X')).toBeInTheDocument();
            });
        });
    });

    describe('Close Confirmation', () => {
        it('prevents close during loading via beforeunload', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            const event = new Event('beforeunload', { cancelable: true });
            window.dispatchEvent(event);

            expect(event.defaultPrevented).toBe(true);
        });

        it('does not prevent close when not loading', () => {
            render(<App />);

            const event = new Event('beforeunload', { cancelable: true });
            window.dispatchEvent(event);

            expect(event.defaultPrevented).toBe(false);
        });
    });

    describe('Regenerate Response', () => {
        it('shows regenerate button after assistant response completes', async () => {
            const callbacks = setupStreamCallbacks();

            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            // Simulate assistant response
            await act(() => {
                if (callbacks.streamData) {
                    callbacks.streamData({
                        type: 'message',
                        role: 'assistant',
                        content: 'Hi there',
                        delta: true,
                    });
                }
            });
            await act(() => {
                if (callbacks.streamComplete) {
                    callbacks.streamComplete();
                }
            });

            expect(screen.getByRole('button', { name: '응답 재생성' })).toBeInTheDocument();
        });

        it('does not show regenerate button during loading', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            expect(screen.queryByRole('button', { name: '응답 재생성' })).not.toBeInTheDocument();
        });

        it('sets input to last user message when regenerate is clicked', async () => {
            const callbacks = setupStreamCallbacks();

            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Regenerate this');
            await user.click(screen.getByText('전송'));

            await act(() => {
                if (callbacks.streamData) {
                    callbacks.streamData({
                        type: 'message',
                        role: 'assistant',
                        content: 'Old response',
                        delta: true,
                    });
                }
            });
            await act(() => {
                if (callbacks.streamComplete) {
                    callbacks.streamComplete();
                }
            });

            await user.click(screen.getByRole('button', { name: '응답 재생성' }));

            const textarea = screen.getByPlaceholderText(/메시지를 입력하세요/) as HTMLTextAreaElement;
            expect(textarea.value).toBe('Regenerate this');
        });
    });

    describe('Window Title Sync', () => {
        it('sets window title to app name when no conversation', () => {
            render(<App />);
            expect(mockElectronAPI.setWindowTitle).toHaveBeenCalledWith('Gemini GUI');
        });

        it('sets window title with conversation title when conversation is active', async () => {
            const savedConversations = [
                {
                    id: '900',
                    title: '테스트 대화',
                    timestamp: new Date().toISOString(),
                    messages: [
                        { role: 'user', content: 'Hello', timestamp: new Date().toISOString() },
                    ],
                },
            ];
            localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
            localStorage.setItem('gemini-current-conversation', '900');

            render(<App />);
            await waitFor(() => {
                expect(mockElectronAPI.setWindowTitle).toHaveBeenCalledWith('테스트 대화 — Gemini GUI');
            });
        });
    });

    describe('Stop Generation', () => {
        it('shows stop button during loading', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            expect(screen.getByText('중지')).toBeInTheDocument();
            expect(screen.queryByText('전송')).not.toBeInTheDocument();
        });

        it('calls stopGemini when stop button is clicked', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            await user.click(screen.getByText('중지'));
            expect(mockElectronAPI.stopGemini).toHaveBeenCalled();
        });

        it('returns to send button after stopping generation', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            expect(screen.getByText('중지')).toBeInTheDocument();
            await user.click(screen.getByText('중지'));

            await waitFor(() => {
                expect(screen.getByText('전송')).toBeInTheDocument();
                expect(screen.queryByText('중지')).not.toBeInTheDocument();
            });
        });

        it('stop button has correct aria-label', async () => {
            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            expect(screen.getByRole('button', { name: '응답 생성 중지' })).toBeInTheDocument();
        });
    });

    describe('Native Notifications', () => {
        it('sends notification when stream completes and window is not focused', async () => {
            mockElectronAPI.isWindowFocused.mockResolvedValue(false);
            const callbacks = setupStreamCallbacks();

            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            // Simulate assistant response
            await act(() => {
                if (callbacks.streamData) {
                    callbacks.streamData({
                        type: 'message',
                        role: 'assistant',
                        content: 'Response',
                        delta: true,
                    });
                }
            });

            // Simulate stream complete
            await act(() => {
                if (callbacks.streamComplete) {
                    callbacks.streamComplete();
                }
            });

            await waitFor(() => {
                expect(mockElectronAPI.isWindowFocused).toHaveBeenCalled();
                expect(mockElectronAPI.showNotification).toHaveBeenCalledWith('Gemini GUI', '응답이 완료되었습니다.');
            });
        });

        it('does not send notification when window is focused', async () => {
            mockElectronAPI.isWindowFocused.mockResolvedValue(true);
            const callbacks = setupStreamCallbacks();

            const user = userEvent.setup();
            render(<App />);
            const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
            await user.type(input, 'Hello');
            await user.click(screen.getByText('전송'));

            await act(() => {
                if (callbacks.streamData) {
                    callbacks.streamData({
                        type: 'message',
                        role: 'assistant',
                        content: 'Response',
                        delta: true,
                    });
                }
            });

            await act(() => {
                if (callbacks.streamComplete) {
                    callbacks.streamComplete();
                }
            });

            await waitFor(() => {
                expect(mockElectronAPI.isWindowFocused).toHaveBeenCalled();
            });
            expect(mockElectronAPI.showNotification).not.toHaveBeenCalled();
        });
    });

    describe('Conversation Fork', () => {
        it('renders fork button on messages', async () => {
            const savedConversations = [
                {
                    id: '600',
                    title: 'Fork Test',
                    timestamp: new Date().toISOString(),
                    messages: [
                        { role: 'user', content: 'First message', timestamp: new Date().toISOString() },
                        { role: 'assistant', content: 'Response', timestamp: new Date().toISOString() },
                    ],
                },
            ];
            localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
            localStorage.setItem('gemini-current-conversation', '600');

            render(<App />);
            await waitFor(() => {
                expect(screen.getByText('First message')).toBeInTheDocument();
            });

            const forkButtons = screen.getAllByLabelText('여기서 분기');
            expect(forkButtons.length).toBe(2);
        });

        it('creates a new forked conversation when fork button is clicked', async () => {
            const savedConversations = [
                {
                    id: '700',
                    title: 'Original Chat',
                    timestamp: new Date().toISOString(),
                    messages: [
                        { role: 'user', content: 'Hello fork', timestamp: new Date().toISOString() },
                        { role: 'assistant', content: 'Fork response', timestamp: new Date().toISOString() },
                        { role: 'user', content: 'Third msg', timestamp: new Date().toISOString() },
                    ],
                },
            ];
            localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
            localStorage.setItem('gemini-current-conversation', '700');

            render(<App />);
            await waitFor(() => {
                expect(screen.getByText('Hello fork')).toBeInTheDocument();
            });

            // Fork from the first message (index 0)
            const forkButtons = screen.getAllByLabelText('여기서 분기');
            fireEvent.click(forkButtons[0]);

            // After forking from index 0, only the first message should be in the forked conversation
            await waitFor(() => {
                // The forked conversation should have only 1 message
                expect(screen.getByText('Hello fork')).toBeInTheDocument();
                expect(screen.queryByText('Fork response')).not.toBeInTheDocument();
                expect(screen.queryByText('Third msg')).not.toBeInTheDocument();
            });
        });

        it('shows forked conversation in sidebar with (분기) suffix', async () => {
            const savedConversations = [
                {
                    id: '800',
                    title: 'Branch Test',
                    timestamp: new Date().toISOString(),
                    messages: [
                        { role: 'user', content: 'Branch content', timestamp: new Date().toISOString() },
                        { role: 'assistant', content: 'Branch reply', timestamp: new Date().toISOString() },
                    ],
                },
            ];
            localStorage.setItem('gemini-conversations', JSON.stringify(savedConversations));
            localStorage.setItem('gemini-current-conversation', '800');

            render(<App />);
            await waitFor(() => {
                expect(screen.getByText('Branch content')).toBeInTheDocument();
            });

            const forkButtons = screen.getAllByLabelText('여기서 분기');
            fireEvent.click(forkButtons[1]); // Fork from second message

            await waitFor(() => {
                const sidebarItems = screen.getAllByRole('listitem');
                const hasForkLabel = sidebarItems.some(item => item.textContent?.includes('(분기)'));
                expect(hasForkLabel).toBe(true);
            });
        });
    });
});
