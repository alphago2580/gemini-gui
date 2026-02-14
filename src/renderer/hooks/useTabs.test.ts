import { renderHook, act } from '@testing-library/react';
import { useTabs } from './useTabs';
import type { Conversation } from '../../preload/types';

describe('useTabs', () => {
    const mockOnSelectConversation = vi.fn();
    const mockOnNewChat = vi.fn();

    const conversations: Conversation[] = [
        { id: '1', title: '대화 1', timestamp: new Date(), messages: [] },
        { id: '2', title: '대화 2', timestamp: new Date(), messages: [] },
        { id: '3', title: '대화 3', timestamp: new Date(), messages: [] },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('initializes with empty tabs', () => {
        const { result } = renderHook(() =>
            useTabs(null, mockOnSelectConversation, mockOnNewChat, conversations)
        );
        expect(result.current.tabs).toEqual([]);
    });

    it('builds tabs from stored open tab IDs', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );
        expect(result.current.tabs).toEqual([
            { id: '1', title: '대화 1' },
            { id: '2', title: '대화 2' },
        ]);
    });

    it('filters out tab IDs that have no matching conversation', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', 'nonexistent', '3']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );
        expect(result.current.tabs).toEqual([
            { id: '1', title: '대화 1' },
            { id: '3', title: '대화 3' },
        ]);
    });

    it('ensureTabOpen adds a tab if not already open', () => {
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.ensureTabOpen('2');
        });

        expect(result.current.tabs).toEqual([
            { id: '2', title: '대화 2' },
        ]);
    });

    it('ensureTabOpen does not duplicate existing tab', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.ensureTabOpen('1');
        });

        expect(result.current.tabs).toEqual([
            { id: '1', title: '대화 1' },
        ]);
    });

    it('selectTab opens the tab and selects the conversation', () => {
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.selectTab('2');
        });

        expect(mockOnSelectConversation).toHaveBeenCalledWith('2');
        expect(result.current.tabs).toContainEqual({ id: '2', title: '대화 2' });
    });

    it('closeTab removes the tab', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.closeTab('2');
        });

        expect(result.current.openTabIds).toEqual(['1', '3']);
    });

    it('closeTab switches to adjacent tab when closing active tab', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
        const { result } = renderHook(() =>
            useTabs('2', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.closeTab('2');
        });

        act(() => {
            vi.runAllTimers();
        });

        expect(mockOnSelectConversation).toHaveBeenCalledWith('3');
    });

    it('closeTab calls onNewChat when closing the last tab', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.closeTab('1');
        });

        act(() => {
            vi.runAllTimers();
        });

        expect(mockOnNewChat).toHaveBeenCalled();
    });

    it('nextTab navigates to the next tab', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.nextTab();
        });

        expect(mockOnSelectConversation).toHaveBeenCalledWith('2');
    });

    it('nextTab wraps around to first tab from last', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
        const { result } = renderHook(() =>
            useTabs('3', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.nextTab();
        });

        expect(mockOnSelectConversation).toHaveBeenCalledWith('1');
    });

    it('prevTab navigates to the previous tab', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
        const { result } = renderHook(() =>
            useTabs('3', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.prevTab();
        });

        expect(mockOnSelectConversation).toHaveBeenCalledWith('2');
    });

    it('prevTab wraps around to last tab from first', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.prevTab();
        });

        expect(mockOnSelectConversation).toHaveBeenCalledWith('3');
    });

    it('nextTab does nothing with single tab', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.nextTab();
        });

        expect(mockOnSelectConversation).not.toHaveBeenCalled();
    });

    it('cleanupTabs removes tabs for deleted conversations', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.cleanupTabs(['1', '3']);
        });

        expect(result.current.openTabIds).toEqual(['1', '3']);
    });

    it('persists open tabs to localStorage', () => {
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.ensureTabOpen('1');
        });
        act(() => {
            result.current.ensureTabOpen('2');
        });

        const stored = JSON.parse(localStorage.getItem('gemini-open-tabs') || '[]');
        expect(stored).toEqual(['1', '2']);
    });

    it('newTab calls onNewChat', () => {
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.newTab();
        });

        expect(mockOnNewChat).toHaveBeenCalled();
    });

    it('prevTab does nothing with single tab', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.prevTab();
        });

        expect(mockOnSelectConversation).not.toHaveBeenCalled();
    });

    it('nextTab does nothing when currentConversationId is null', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2']));
        const { result } = renderHook(() =>
            useTabs(null, mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.nextTab();
        });

        expect(mockOnSelectConversation).not.toHaveBeenCalled();
    });

    it('prevTab does nothing when currentConversationId is null', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2']));
        const { result } = renderHook(() =>
            useTabs(null, mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.prevTab();
        });

        expect(mockOnSelectConversation).not.toHaveBeenCalled();
    });

    it('closeTab does not switch when closing non-active tab', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.closeTab('3');
        });

        act(() => {
            vi.runAllTimers();
        });

        // Should not switch since we closed a non-active tab
        expect(mockOnSelectConversation).not.toHaveBeenCalled();
        expect(mockOnNewChat).not.toHaveBeenCalled();
        expect(result.current.openTabIds).toEqual(['1', '2']);
    });

    it('closeTab active first tab switches to next tab', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.closeTab('1');
        });

        act(() => {
            vi.runAllTimers();
        });

        expect(mockOnSelectConversation).toHaveBeenCalledWith('2');
    });

    it('closeTab active last tab switches to previous tab', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
        const { result } = renderHook(() =>
            useTabs('3', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.closeTab('3');
        });

        act(() => {
            vi.runAllTimers();
        });

        // index 2 was last, updated=[1,2], min(2, 1) = 1, so updated[1] = '2'
        expect(mockOnSelectConversation).toHaveBeenCalledWith('2');
    });

    it('cleanupTabs removes all tabs when no conversation IDs provided', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.cleanupTabs([]);
        });

        expect(result.current.openTabIds).toEqual([]);
    });

    it('ensureTabOpen called multiple times with different IDs', () => {
        const { result } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.ensureTabOpen('1');
        });
        act(() => {
            result.current.ensureTabOpen('2');
        });
        act(() => {
            result.current.ensureTabOpen('3');
        });

        expect(result.current.openTabIds).toEqual(['1', '2', '3']);
    });

    it('cleans up closeTab timer on unmount', () => {
        localStorage.setItem('gemini-open-tabs', JSON.stringify(['1']));
        const { result, unmount } = renderHook(() =>
            useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
        );

        act(() => {
            result.current.closeTab('1');
        });

        // Unmount before timer fires
        unmount();

        act(() => {
            vi.runAllTimers();
        });

        // onNewChat should NOT have been called since the hook was unmounted
        expect(mockOnNewChat).not.toHaveBeenCalled();
    });

    describe('reorderTabs', () => {
        it('reorders tabs to match new order', () => {
            localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
            const { result } = renderHook(() =>
                useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
            );

            act(() => {
                result.current.reorderTabs([
                    { id: '3', title: '대화 3' },
                    { id: '1', title: '대화 1' },
                    { id: '2', title: '대화 2' },
                ]);
            });

            expect(result.current.openTabIds).toEqual(['3', '1', '2']);
        });

        it('persists reordered tabs to localStorage', () => {
            localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
            const { result } = renderHook(() =>
                useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
            );

            act(() => {
                result.current.reorderTabs([
                    { id: '2', title: '대화 2' },
                    { id: '3', title: '대화 3' },
                    { id: '1', title: '대화 1' },
                ]);
            });

            const stored = JSON.parse(localStorage.getItem('gemini-open-tabs') || '[]');
            expect(stored).toEqual(['2', '3', '1']);
        });

        it('updates tab objects after reorder', () => {
            localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2', '3']));
            const { result } = renderHook(() =>
                useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
            );

            act(() => {
                result.current.reorderTabs([
                    { id: '3', title: '대화 3' },
                    { id: '2', title: '대화 2' },
                    { id: '1', title: '대화 1' },
                ]);
            });

            expect(result.current.tabs).toEqual([
                { id: '3', title: '대화 3' },
                { id: '2', title: '대화 2' },
                { id: '1', title: '대화 1' },
            ]);
        });

        it('handles reorder with single tab', () => {
            localStorage.setItem('gemini-open-tabs', JSON.stringify(['1']));
            const { result } = renderHook(() =>
                useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
            );

            act(() => {
                result.current.reorderTabs([{ id: '1', title: '대화 1' }]);
            });

            expect(result.current.openTabIds).toEqual(['1']);
        });

        it('handles reorder to empty array', () => {
            localStorage.setItem('gemini-open-tabs', JSON.stringify(['1', '2']));
            const { result } = renderHook(() =>
                useTabs('1', mockOnSelectConversation, mockOnNewChat, conversations)
            );

            act(() => {
                result.current.reorderTabs([]);
            });

            expect(result.current.openTabIds).toEqual([]);
        });
    });
});
