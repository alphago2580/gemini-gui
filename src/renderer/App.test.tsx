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
    exportMarkdown: vi.fn().mockResolvedValue({ success: true, path: '/tmp/test.md' }),
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

    it('sends message with Ctrl+Enter', async () => {
        const user = userEvent.setup();
        render(<App />);
        const input = screen.getByPlaceholderText(/메시지를 입력하세요/);
        await user.type(input, 'Ctrl Enter test');
        fireEvent.keyDown(input, { key: 'Enter', ctrlKey: true });
        await waitFor(() => {
            expect(mockElectronAPI.sendMessage).toHaveBeenCalledWith('Ctrl Enter test');
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
        it('focuses sidebar search on Ctrl+F', async () => {
            render(<App />);
            const searchInput = screen.getByPlaceholderText('대화 검색...');
            expect(document.activeElement).not.toBe(searchInput);

            fireEvent.keyDown(document, { key: 'f', ctrlKey: true });
            expect(document.activeElement).toBe(searchInput);
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
});
