import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import FileAttachment from './FileAttachment';

// Helper to create mock File objects
function createMockFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

describe('FileAttachment', () => {
  const defaultProps = {
    onFilesSelected: vi.fn(),
    attachedFiles: [] as File[],
    onRemoveFile: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders drop zone with label', () => {
    render(<FileAttachment {...defaultProps} />);
    expect(screen.getByText('파일 첨부 (클릭 또는 드래그)')).toBeInTheDocument();
  });

  it('does not show attached files section when no files', () => {
    const { container } = render(<FileAttachment {...defaultProps} />);
    expect(container.querySelector('.attached-files')).not.toBeInTheDocument();
  });

  it('shows attached files when files exist', () => {
    const files = [
      createMockFile('test.txt', 1024, 'text/plain'),
      createMockFile('image.png', 2048, 'image/png'),
    ];
    render(<FileAttachment {...defaultProps} attachedFiles={files} />);
    expect(screen.getByText('test.txt')).toBeInTheDocument();
    expect(screen.getByText('image.png')).toBeInTheDocument();
  });

  it('displays correct file size for bytes', () => {
    const files = [createMockFile('small.txt', 500, 'text/plain')];
    render(<FileAttachment {...defaultProps} attachedFiles={files} />);
    expect(screen.getByText('500 B')).toBeInTheDocument();
  });

  it('displays correct file size for KB', () => {
    const files = [createMockFile('medium.txt', 2560, 'text/plain')];
    render(<FileAttachment {...defaultProps} attachedFiles={files} />);
    expect(screen.getByText('2.5 KB')).toBeInTheDocument();
  });

  it('displays correct file size for MB', () => {
    const files = [createMockFile('large.txt', 1572864, 'text/plain')];
    render(<FileAttachment {...defaultProps} attachedFiles={files} />);
    expect(screen.getByText('1.5 MB')).toBeInTheDocument();
  });

  it('displays correct icon for image files', () => {
    const files = [createMockFile('photo.jpg', 1024, 'image/jpeg')];
    render(<FileAttachment {...defaultProps} attachedFiles={files} />);
    const icons = document.querySelectorAll('.file-icon');
    expect(icons[0].textContent).toContain('🖼️');
  });

  it('displays correct icon for PDF files', () => {
    const files = [createMockFile('doc.pdf', 1024, 'application/pdf')];
    render(<FileAttachment {...defaultProps} attachedFiles={files} />);
    const icons = document.querySelectorAll('.file-icon');
    expect(icons[0].textContent).toContain('📄');
  });

  it('displays correct icon for text files', () => {
    const files = [createMockFile('note.txt', 1024, 'text/plain')];
    render(<FileAttachment {...defaultProps} attachedFiles={files} />);
    const icons = document.querySelectorAll('.file-icon');
    expect(icons[0].textContent).toContain('📝');
  });

  it('displays correct icon for video files', () => {
    const files = [createMockFile('clip.mp4', 1024, 'video/mp4')];
    render(<FileAttachment {...defaultProps} attachedFiles={files} />);
    const icons = document.querySelectorAll('.file-icon');
    expect(icons[0].textContent).toContain('🎥');
  });

  it('displays correct icon for audio files', () => {
    const files = [createMockFile('song.mp3', 1024, 'audio/mpeg')];
    render(<FileAttachment {...defaultProps} attachedFiles={files} />);
    const icons = document.querySelectorAll('.file-icon');
    expect(icons[0].textContent).toContain('🎵');
  });

  it('displays default icon for unknown file types', () => {
    const files = [createMockFile('data.bin', 1024, 'application/octet-stream')];
    render(<FileAttachment {...defaultProps} attachedFiles={files} />);
    const icons = document.querySelectorAll('.file-icon');
    expect(icons[0].textContent).toContain('📎');
  });

  it('calls onRemoveFile with correct index when remove button clicked', () => {
    const files = [
      createMockFile('file1.txt', 100, 'text/plain'),
      createMockFile('file2.txt', 200, 'text/plain'),
    ];
    render(<FileAttachment {...defaultProps} attachedFiles={files} />);
    const removeButtons = screen.getAllByTitle('파일 제거');
    fireEvent.click(removeButtons[1]);
    expect(defaultProps.onRemoveFile).toHaveBeenCalledWith(1);
  });

  it('calls onFilesSelected when files are dropped', () => {
    render(<FileAttachment {...defaultProps} />);
    const dropZone = document.querySelector('.drop-zone')!;
    const file = createMockFile('dropped.txt', 100, 'text/plain');

    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(defaultProps.onFilesSelected).toHaveBeenCalledWith([file]);
  });

  it('adds dragging class on dragover', () => {
    render(<FileAttachment {...defaultProps} />);
    const dropZone = document.querySelector('.drop-zone')!;
    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('dragging');
  });

  it('removes dragging class on dragleave', () => {
    render(<FileAttachment {...defaultProps} />);
    const dropZone = document.querySelector('.drop-zone')!;
    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('dragging');
    fireEvent.dragLeave(dropZone);
    expect(dropZone).not.toHaveClass('dragging');
  });

  it('removes dragging class on drop', () => {
    render(<FileAttachment {...defaultProps} />);
    const dropZone = document.querySelector('.drop-zone')!;
    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('dragging');

    const file = createMockFile('test.txt', 100, 'text/plain');
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });
    expect(dropZone).not.toHaveClass('dragging');
  });

  it('shows drag text when dragging', () => {
    render(<FileAttachment {...defaultProps} />);
    const dropZone = document.querySelector('.drop-zone')!;
    fireEvent.dragOver(dropZone);
    expect(screen.getByText('파일을 여기에 놓으세요')).toBeInTheDocument();
  });

  it('renders file input with correct accept attribute', () => {
    render(<FileAttachment {...defaultProps} />);
    const input = document.querySelector('#file-input') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    expect(input.accept).toBe('image/*,.pdf,.txt,.doc,.docx');
    expect(input.multiple).toBe(true);
  });

  it('renders remove buttons with correct title', () => {
    const files = [createMockFile('file.txt', 100, 'text/plain')];
    render(<FileAttachment {...defaultProps} attachedFiles={files} />);
    expect(screen.getByTitle('파일 제거')).toBeInTheDocument();
  });

  // Accessibility tests
  describe('Accessibility', () => {
    it('has role="region" with aria-label on root', () => {
      render(<FileAttachment {...defaultProps} />);
      expect(screen.getByRole('region')).toHaveAttribute('aria-label', '파일 첨부');
    });

    it('attached files list has role="list"', () => {
      const files = [createMockFile('test.txt', 100, 'text/plain')];
      render(<FileAttachment {...defaultProps} attachedFiles={files} />);
      expect(screen.getByRole('list')).toHaveAttribute('aria-label', '첨부된 파일 목록');
    });

    it('file chips have role="listitem"', () => {
      const files = [
        createMockFile('a.txt', 100, 'text/plain'),
        createMockFile('b.pdf', 200, 'application/pdf'),
      ];
      render(<FileAttachment {...defaultProps} attachedFiles={files} />);
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(2);
    });

    it('remove button has descriptive aria-label with filename', () => {
      const files = [createMockFile('report.pdf', 500, 'application/pdf')];
      render(<FileAttachment {...defaultProps} attachedFiles={files} />);
      expect(screen.getByRole('button', { name: 'report.pdf 제거' })).toBeInTheDocument();
    });

    it('drop zone has aria-label', () => {
      const { container } = render(<FileAttachment {...defaultProps} />);
      const dropZone = container.querySelector('.drop-zone');
      expect(dropZone).toHaveAttribute('aria-label', '파일 드래그 앤 드롭 영역');
    });

    it('file input has aria-label', () => {
      render(<FileAttachment {...defaultProps} />);
      const input = document.querySelector('#file-input') as HTMLInputElement;
      expect(input).toHaveAttribute('aria-label', '파일 선택');
    });

    it('file icons are hidden from screen readers', () => {
      const files = [createMockFile('test.txt', 100, 'text/plain')];
      const { container } = render(<FileAttachment {...defaultProps} attachedFiles={files} />);
      const icons = container.querySelectorAll('.file-icon[aria-hidden="true"]');
      expect(icons.length).toBeGreaterThanOrEqual(1);
    });
  });
});
