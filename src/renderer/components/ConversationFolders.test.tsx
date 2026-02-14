import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ConversationFolders from './ConversationFolders';
import type { ConversationFolder } from '../../preload/types';

const mockFolders: ConversationFolder[] = [
  { id: 'folder-1', name: '프로젝트', color: '#4A90D9', createdAt: new Date('2024-01-01') },
  { id: 'folder-2', name: '아이디어', color: '#E67E22', createdAt: new Date('2024-01-02') },
];

const defaultProps = {
  folders: mockFolders,
  selectedFolderId: null as string | null,
  onSelectFolder: vi.fn(),
  onCreateFolder: vi.fn(),
  onRenameFolder: vi.fn(),
  onDeleteFolder: vi.fn(),
  folderConversationCounts: { 'folder-1': 3, 'folder-2': 1 },
  uncategorizedCount: 2,
  totalCount: 6,
};

describe('ConversationFolders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders section title and create button', () => {
    render(<ConversationFolders {...defaultProps} />);
    expect(screen.getByText('폴더')).toBeInTheDocument();
    expect(screen.getByLabelText('새 폴더 만들기')).toBeInTheDocument();
  });

  it('renders "All conversations" item with total count', () => {
    render(<ConversationFolders {...defaultProps} />);
    expect(screen.getByText('전체 대화')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  it('renders folder items with names and counts', () => {
    render(<ConversationFolders {...defaultProps} />);
    expect(screen.getByText('프로젝트')).toBeInTheDocument();
    expect(screen.getByText('아이디어')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders uncategorized section when folders exist', () => {
    render(<ConversationFolders {...defaultProps} />);
    expect(screen.getByText('미분류')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('does not render uncategorized when no folders exist', () => {
    render(<ConversationFolders {...defaultProps} folders={[]} />);
    expect(screen.queryByText('미분류')).not.toBeInTheDocument();
  });

  it('marks "All conversations" as active when selectedFolderId is null', () => {
    render(<ConversationFolders {...defaultProps} selectedFolderId={null} />);
    const allItem = screen.getByText('전체 대화').closest('[role="option"]');
    expect(allItem).toHaveAttribute('aria-selected', 'true');
  });

  it('marks selected folder as active', () => {
    render(<ConversationFolders {...defaultProps} selectedFolderId="folder-1" />);
    const folderItem = screen.getByText('프로젝트').closest('[role="option"]');
    expect(folderItem).toHaveAttribute('aria-selected', 'true');
  });

  it('marks uncategorized as active when selectedFolderId is __uncategorized__', () => {
    render(<ConversationFolders {...defaultProps} selectedFolderId="__uncategorized__" />);
    const uncatItem = screen.getByText('미분류').closest('[role="option"]');
    expect(uncatItem).toHaveAttribute('aria-selected', 'true');
  });

  it('calls onSelectFolder with null when "All conversations" is clicked', () => {
    render(<ConversationFolders {...defaultProps} />);
    fireEvent.click(screen.getByText('전체 대화'));
    expect(defaultProps.onSelectFolder).toHaveBeenCalledWith(null);
  });

  it('calls onSelectFolder with folder id when folder is clicked', () => {
    render(<ConversationFolders {...defaultProps} />);
    fireEvent.click(screen.getByText('프로젝트'));
    expect(defaultProps.onSelectFolder).toHaveBeenCalledWith('folder-1');
  });

  it('calls onSelectFolder with __uncategorized__ when uncategorized is clicked', () => {
    render(<ConversationFolders {...defaultProps} />);
    fireEvent.click(screen.getByText('미분류'));
    expect(defaultProps.onSelectFolder).toHaveBeenCalledWith('__uncategorized__');
  });

  it('shows create input when create button is clicked', () => {
    render(<ConversationFolders {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('새 폴더 만들기'));
    expect(screen.getByPlaceholderText('폴더 이름...')).toBeInTheDocument();
  });

  it('creates folder on Enter key in create input', () => {
    render(<ConversationFolders {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('새 폴더 만들기'));
    const input = screen.getByPlaceholderText('폴더 이름...');
    fireEvent.change(input, { target: { value: '새 폴더' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onCreateFolder).toHaveBeenCalledWith('새 폴더');
  });

  it('dismisses create input on Escape key', () => {
    render(<ConversationFolders {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('새 폴더 만들기'));
    const input = screen.getByPlaceholderText('폴더 이름...');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByPlaceholderText('폴더 이름...')).not.toBeInTheDocument();
    expect(defaultProps.onCreateFolder).not.toHaveBeenCalled();
  });

  it('does not create folder with empty name', () => {
    render(<ConversationFolders {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('새 폴더 만들기'));
    const input = screen.getByPlaceholderText('폴더 이름...');
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onCreateFolder).not.toHaveBeenCalled();
  });

  it('creates folder on blur with non-empty name', () => {
    render(<ConversationFolders {...defaultProps} />);
    fireEvent.click(screen.getByLabelText('새 폴더 만들기'));
    const input = screen.getByPlaceholderText('폴더 이름...');
    fireEvent.change(input, { target: { value: '블러 폴더' } });
    fireEvent.blur(input);
    expect(defaultProps.onCreateFolder).toHaveBeenCalledWith('블러 폴더');
  });

  it('calls onDeleteFolder when delete button is clicked', () => {
    render(<ConversationFolders {...defaultProps} />);
    const deleteButtons = screen.getAllByLabelText('폴더 삭제');
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onDeleteFolder).toHaveBeenCalledWith('folder-1');
  });

  it('enters rename mode when rename button is clicked', () => {
    render(<ConversationFolders {...defaultProps} />);
    const renameButtons = screen.getAllByLabelText('폴더 이름 변경');
    fireEvent.click(renameButtons[0]);
    expect(screen.getByDisplayValue('프로젝트')).toBeInTheDocument();
  });

  it('renames folder on Enter key', () => {
    render(<ConversationFolders {...defaultProps} />);
    const renameButtons = screen.getAllByLabelText('폴더 이름 변경');
    fireEvent.click(renameButtons[0]);
    const input = screen.getByDisplayValue('프로젝트');
    fireEvent.change(input, { target: { value: '새 이름' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(defaultProps.onRenameFolder).toHaveBeenCalledWith('folder-1', '새 이름');
  });

  it('cancels rename on Escape key', () => {
    render(<ConversationFolders {...defaultProps} />);
    const renameButtons = screen.getAllByLabelText('폴더 이름 변경');
    fireEvent.click(renameButtons[0]);
    const input = screen.getByDisplayValue('프로젝트');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(defaultProps.onRenameFolder).not.toHaveBeenCalled();
    expect(screen.getByText('프로젝트')).toBeInTheDocument();
  });

  it('renames folder on blur', () => {
    render(<ConversationFolders {...defaultProps} />);
    const renameButtons = screen.getAllByLabelText('폴더 이름 변경');
    fireEvent.click(renameButtons[0]);
    const input = screen.getByDisplayValue('프로젝트');
    fireEvent.change(input, { target: { value: '블러 이름' } });
    fireEvent.blur(input);
    expect(defaultProps.onRenameFolder).toHaveBeenCalledWith('folder-1', '블러 이름');
  });

  it('supports keyboard navigation with Enter and Space on folder items', () => {
    render(<ConversationFolders {...defaultProps} />);
    const folderItem = screen.getByText('프로젝트').closest('[role="option"]')!;
    fireEvent.keyDown(folderItem, { key: 'Enter' });
    expect(defaultProps.onSelectFolder).toHaveBeenCalledWith('folder-1');

    vi.clearAllMocks();
    fireEvent.keyDown(folderItem, { key: ' ' });
    expect(defaultProps.onSelectFolder).toHaveBeenCalledWith('folder-1');
  });

  it('supports keyboard navigation on "All conversations"', () => {
    render(<ConversationFolders {...defaultProps} />);
    const allItem = screen.getByText('전체 대화').closest('[role="option"]')!;
    fireEvent.keyDown(allItem, { key: 'Enter' });
    expect(defaultProps.onSelectFolder).toHaveBeenCalledWith(null);
  });

  it('renders folder color dots', () => {
    const { container } = render(<ConversationFolders {...defaultProps} />);
    const dots = container.querySelectorAll('.folder-color-dot');
    expect(dots).toHaveLength(2);
    expect((dots[0] as HTMLElement).style.backgroundColor).toBe('rgb(74, 144, 217)');
    expect((dots[1] as HTMLElement).style.backgroundColor).toBe('rgb(230, 126, 34)');
  });

  it('has correct ARIA attributes', () => {
    render(<ConversationFolders {...defaultProps} />);
    const listbox = screen.getByRole('listbox');
    expect(listbox).toHaveAttribute('aria-label', '폴더');
    const options = screen.getAllByRole('option');
    expect(options.length).toBeGreaterThanOrEqual(3); // All + 2 folders + uncategorized
  });

  it('renders with zero folder conversation counts', () => {
    render(
      <ConversationFolders
        {...defaultProps}
        folderConversationCounts={{ 'folder-1': 0, 'folder-2': 0 }}
        uncategorizedCount={6}
      />
    );
    const zeros = screen.getAllByText('0');
    expect(zeros).toHaveLength(2);
  });
});
