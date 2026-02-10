import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TabBar from './TabBar';
import type { Tab } from './TabBar';

describe('TabBar', () => {
    const mockOnSelectTab = vi.fn();
    const mockOnCloseTab = vi.fn();
    const mockOnNewTab = vi.fn();

    const defaultTabs: Tab[] = [
        { id: '1', title: '대화 1' },
        { id: '2', title: '두 번째 대화' },
        { id: '3', title: '세 번째 대화' },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders nothing when tabs is empty', () => {
        const { container } = render(
            <TabBar
                tabs={[]}
                activeTabId={null}
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        expect(container.querySelector('.tab-bar')).toBeNull();
    });

    it('renders tabs with their titles', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        expect(screen.getByText('대화 1')).toBeInTheDocument();
        expect(screen.getByText('두 번째 대화')).toBeInTheDocument();
        expect(screen.getByText('세 번째 대화')).toBeInTheDocument();
    });

    it('marks active tab with active class and aria-selected', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="2"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        const tabs = screen.getAllByRole('tab');
        expect(tabs[0]).not.toHaveClass('active');
        expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
        expect(tabs[1]).toHaveClass('active');
        expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
        expect(tabs[2]).not.toHaveClass('active');
    });

    it('calls onSelectTab when a tab is clicked', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        fireEvent.click(screen.getByText('두 번째 대화'));
        expect(mockOnSelectTab).toHaveBeenCalledWith('2');
    });

    it('calls onSelectTab when Enter is pressed on a tab', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        const tabs = screen.getAllByRole('tab');
        fireEvent.keyDown(tabs[2], { key: 'Enter' });
        expect(mockOnSelectTab).toHaveBeenCalledWith('3');
    });

    it('calls onSelectTab when Space is pressed on a tab', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        const tabs = screen.getAllByRole('tab');
        fireEvent.keyDown(tabs[1], { key: ' ' });
        expect(mockOnSelectTab).toHaveBeenCalledWith('2');
    });

    it('calls onCloseTab when close button is clicked', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        const closeButtons = screen.getAllByTitle('탭 닫기');
        fireEvent.click(closeButtons[1]);
        expect(mockOnCloseTab).toHaveBeenCalledWith('2');
    });

    it('does not call onSelectTab when close button is clicked (stopPropagation)', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        const closeButtons = screen.getAllByTitle('탭 닫기');
        fireEvent.click(closeButtons[0]);
        expect(mockOnCloseTab).toHaveBeenCalledWith('1');
        expect(mockOnSelectTab).not.toHaveBeenCalled();
    });

    it('calls onNewTab when new tab button is clicked', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        fireEvent.click(screen.getByLabelText('새 탭'));
        expect(mockOnNewTab).toHaveBeenCalled();
    });

    it('has proper tablist role', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        expect(screen.getByRole('tablist')).toBeInTheDocument();
    });

    it('sets tabIndex 0 on active tab and -1 on inactive tabs', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="2"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        const tabs = screen.getAllByRole('tab');
        expect(tabs[0]).toHaveAttribute('tabindex', '-1');
        expect(tabs[1]).toHaveAttribute('tabindex', '0');
        expect(tabs[2]).toHaveAttribute('tabindex', '-1');
    });

    it('close buttons have accessible labels with tab title', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        expect(screen.getByLabelText('탭 닫기: 대화 1')).toBeInTheDocument();
        expect(screen.getByLabelText('탭 닫기: 두 번째 대화')).toBeInTheDocument();
        expect(screen.getByLabelText('탭 닫기: 세 번째 대화')).toBeInTheDocument();
    });

    it('tabs have accessible labels with tab title', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        expect(screen.getByLabelText('탭: 대화 1')).toBeInTheDocument();
        expect(screen.getByLabelText('탭: 두 번째 대화')).toBeInTheDocument();
    });

    it('does not call onSelectTab on non-Enter/Space keyDown', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        const tabs = screen.getAllByRole('tab');
        fireEvent.keyDown(tabs[0], { key: 'Tab' });
        fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
        expect(mockOnSelectTab).not.toHaveBeenCalled();
    });

    it('renders single tab correctly', () => {
        const singleTab: Tab[] = [{ id: 'only', title: '유일한 탭' }];
        render(
            <TabBar
                tabs={singleTab}
                activeTabId="only"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        expect(screen.getAllByRole('tab')).toHaveLength(1);
        expect(screen.getByText('유일한 탭')).toBeInTheDocument();
    });

    it('renders tab-title span inside each tab', () => {
        const { container } = render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        const titleSpans = container.querySelectorAll('.tab-title');
        expect(titleSpans).toHaveLength(3);
        expect(titleSpans[0].textContent).toBe('대화 1');
    });

    it('new tab button has title attribute', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        const newTabBtn = screen.getByLabelText('새 탭');
        expect(newTabBtn).toHaveAttribute('title', '새 탭 (Ctrl+N)');
    });

    it('new tab button has + text content', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        const newTabBtn = screen.getByLabelText('새 탭');
        expect(newTabBtn.textContent).toBe('+');
    });

    it('close button renders × character', () => {
        render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        const closeButtons = screen.getAllByTitle('탭 닫기');
        expect(closeButtons[0].textContent).toBe('×');
    });

    it('renders tab-bar and tab-list CSS classes', () => {
        const { container } = render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        expect(container.querySelector('.tab-bar')).toBeInTheDocument();
        expect(container.querySelector('.tab-list')).toBeInTheDocument();
    });

    it('all tabs have tab-item class', () => {
        const { container } = render(
            <TabBar
                tabs={defaultTabs}
                activeTabId="1"
                onSelectTab={mockOnSelectTab}
                onCloseTab={mockOnCloseTab}
                onNewTab={mockOnNewTab}
            />
        );
        const tabItems = container.querySelectorAll('.tab-item');
        expect(tabItems).toHaveLength(3);
    });
});
