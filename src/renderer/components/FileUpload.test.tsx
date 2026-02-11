import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FileUpload from './FileUpload';
import type { FileUploadFile } from './FileUpload';

const mockOnFilesSelected = vi.fn();
const mockOnRemove = vi.fn();

function createMockFile(name: string, size: number, type = 'text/plain'): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

beforeEach(() => {
  mockOnFilesSelected.mockReset();
  mockOnRemove.mockReset();
});

function renderUpload(props: Partial<React.ComponentProps<typeof FileUpload>> = {}) {
  return render(
    <FileUpload onFilesSelected={mockOnFilesSelected} {...props} />
  );
}

describe('FileUpload', () => {
  // --- Rendering ---

  it('renders dropzone by default', () => {
    const { container } = renderUpload();
    expect(container.querySelector('.file-upload-dropzone')).toBeInTheDocument();
  });

  it('renders default label for dropzone', () => {
    renderUpload();
    expect(screen.getByText('파일을 끌어다 놓거나 클릭하여 선택')).toBeInTheDocument();
  });

  it('renders custom label', () => {
    renderUpload({ label: '이미지를 선택하세요' });
    expect(screen.getByText('이미지를 선택하세요')).toBeInTheDocument();
  });

  it('renders hint when provided', () => {
    renderUpload({ hint: 'PNG, JPG 최대 5MB' });
    expect(screen.getByText('PNG, JPG 최대 5MB')).toBeInTheDocument();
  });

  it('renders icon for dropzone variant', () => {
    const { container } = renderUpload();
    expect(container.querySelector('.file-upload-icon')).toBeInTheDocument();
  });

  // --- Variants ---

  it('renders button variant', () => {
    const { container } = renderUpload({ variant: 'button' });
    expect(container.querySelector('.file-upload-button')).toBeInTheDocument();
  });

  it('renders compact variant', () => {
    const { container } = renderUpload({ variant: 'compact' });
    expect(container.querySelector('.file-upload-compact')).toBeInTheDocument();
  });

  it('renders compact default label', () => {
    renderUpload({ variant: 'compact' });
    expect(screen.getByText('파일 선택')).toBeInTheDocument();
  });

  // --- File selection ---

  it('calls onFilesSelected when files are selected via input', () => {
    renderUpload();
    const input = screen.getByTestId('file-input');
    const file = createMockFile('test.txt', 100);
    fireEvent.change(input, { target: { files: [file] } });
    expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
  });

  it('opens file dialog on click', () => {
    renderUpload();
    const zone = screen.getByRole('button', { name: '파일 업로드' });
    const input = screen.getByTestId('file-input');
    const clickSpy = vi.spyOn(input, 'click');
    fireEvent.click(zone);
    expect(clickSpy).toHaveBeenCalled();
  });

  it('opens file dialog on Enter key', () => {
    renderUpload();
    const zone = screen.getByRole('button', { name: '파일 업로드' });
    const input = screen.getByTestId('file-input');
    const clickSpy = vi.spyOn(input, 'click');
    fireEvent.keyDown(zone, { key: 'Enter' });
    expect(clickSpy).toHaveBeenCalled();
  });

  it('opens file dialog on Space key', () => {
    renderUpload();
    const zone = screen.getByRole('button', { name: '파일 업로드' });
    const input = screen.getByTestId('file-input');
    const clickSpy = vi.spyOn(input, 'click');
    fireEvent.keyDown(zone, { key: ' ' });
    expect(clickSpy).toHaveBeenCalled();
  });

  // --- Drag and drop ---

  it('applies dragging class on drag enter', () => {
    const { container } = renderUpload();
    const zone = screen.getByRole('button', { name: '파일 업로드' });
    fireEvent.dragEnter(zone, { dataTransfer: { files: [] } });
    expect(container.querySelector('.file-upload-dragging')).toBeInTheDocument();
  });

  it('removes dragging class on drag leave', () => {
    const { container } = renderUpload();
    const zone = screen.getByRole('button', { name: '파일 업로드' });
    fireEvent.dragEnter(zone, { dataTransfer: { files: [] } });
    fireEvent.dragLeave(zone, { dataTransfer: { files: [] } });
    expect(container.querySelector('.file-upload-dragging')).not.toBeInTheDocument();
  });

  it('calls onFilesSelected on drop', () => {
    renderUpload();
    const zone = screen.getByRole('button', { name: '파일 업로드' });
    const file = createMockFile('test.txt', 100);
    fireEvent.drop(zone, { dataTransfer: { files: [file] } });
    expect(mockOnFilesSelected).toHaveBeenCalledWith([file]);
  });

  // --- Validation ---

  it('shows error for oversized files', () => {
    renderUpload({ maxSize: 1024 });
    const input = screen.getByTestId('file-input');
    const bigFile = createMockFile('big.txt', 2048);
    fireEvent.change(input, { target: { files: [bigFile] } });
    expect(screen.getByRole('alert')).toHaveTextContent('파일 크기가');
  });

  it('filters out oversized files', () => {
    renderUpload({ maxSize: 1024 });
    const input = screen.getByTestId('file-input');
    const small = createMockFile('small.txt', 512);
    const big = createMockFile('big.txt', 2048);
    fireEvent.change(input, { target: { files: [small, big] } });
    expect(mockOnFilesSelected).toHaveBeenCalledWith([small]);
  });

  it('shows error when max files exceeded', () => {
    const existing: FileUploadFile[] = [
      { file: createMockFile('a.txt', 100), id: '1' },
      { file: createMockFile('b.txt', 100), id: '2' },
    ];
    renderUpload({ maxFiles: 3, files: existing });
    const input = screen.getByTestId('file-input');
    const f1 = createMockFile('c.txt', 100);
    const f2 = createMockFile('d.txt', 100);
    fireEvent.change(input, { target: { files: [f1, f2] } });
    expect(screen.getByRole('alert')).toHaveTextContent('최대 3개');
  });

  // --- File list ---

  it('shows file list', () => {
    const files: FileUploadFile[] = [
      { file: createMockFile('doc.pdf', 1500), id: '1' },
    ];
    renderUpload({ files });
    expect(screen.getByText('doc.pdf')).toBeInTheDocument();
    expect(screen.getByText('1.5 KB')).toBeInTheDocument();
  });

  it('hides file list when showFileList=false', () => {
    const files: FileUploadFile[] = [
      { file: createMockFile('doc.pdf', 1500), id: '1' },
    ];
    renderUpload({ files, showFileList: false });
    expect(screen.queryByText('doc.pdf')).not.toBeInTheDocument();
  });

  it('shows progress bar for file with progress', () => {
    const files: FileUploadFile[] = [
      { file: createMockFile('doc.pdf', 1500), id: '1', progress: 50 },
    ];
    renderUpload({ files });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '50');
  });

  it('does not show progress bar when progress is 100', () => {
    const files: FileUploadFile[] = [
      { file: createMockFile('doc.pdf', 1500), id: '1', progress: 100 },
    ];
    renderUpload({ files });
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('shows file error', () => {
    const files: FileUploadFile[] = [
      { file: createMockFile('doc.pdf', 1500), id: '1', error: '업로드 실패' },
    ];
    renderUpload({ files });
    expect(screen.getByText('업로드 실패')).toBeInTheDocument();
  });

  it('shows remove button when onRemove provided', () => {
    const files: FileUploadFile[] = [
      { file: createMockFile('doc.pdf', 1500), id: '1' },
    ];
    renderUpload({ files, onRemove: mockOnRemove });
    expect(screen.getByRole('button', { name: 'doc.pdf 제거' })).toBeInTheDocument();
  });

  it('calls onRemove when remove button clicked', () => {
    const files: FileUploadFile[] = [
      { file: createMockFile('doc.pdf', 1500), id: '1' },
    ];
    renderUpload({ files, onRemove: mockOnRemove });
    fireEvent.click(screen.getByRole('button', { name: 'doc.pdf 제거' }));
    expect(mockOnRemove).toHaveBeenCalledWith('1');
  });

  it('does not show remove button without onRemove', () => {
    const files: FileUploadFile[] = [
      { file: createMockFile('doc.pdf', 1500), id: '1' },
    ];
    renderUpload({ files });
    expect(screen.queryByRole('button', { name: 'doc.pdf 제거' })).not.toBeInTheDocument();
  });

  // --- Disabled ---

  it('applies disabled class', () => {
    const { container } = renderUpload({ disabled: true });
    expect(container.querySelector('.file-upload-disabled')).toBeInTheDocument();
  });

  it('does not open dialog when disabled', () => {
    renderUpload({ disabled: true });
    const zone = screen.getByRole('button');
    expect(zone).toHaveAttribute('aria-disabled', 'true');
  });

  it('does not respond to drag when disabled', () => {
    const { container } = renderUpload({ disabled: true });
    const zone = screen.getByRole('button');
    fireEvent.dragEnter(zone, { dataTransfer: { files: [] } });
    expect(container.querySelector('.file-upload-dragging')).not.toBeInTheDocument();
  });

  // --- Accessibility ---

  it('has default aria-label', () => {
    renderUpload();
    expect(screen.getByRole('button', { name: '파일 업로드' })).toBeInTheDocument();
  });

  it('accepts custom aria-label', () => {
    renderUpload({ ariaLabel: '이미지 업로드' });
    expect(screen.getByRole('button', { name: '이미지 업로드' })).toBeInTheDocument();
  });

  it('file input is aria-hidden', () => {
    renderUpload();
    expect(screen.getByTestId('file-input')).toHaveAttribute('aria-hidden', 'true');
  });

  it('file list has aria-label', () => {
    const files: FileUploadFile[] = [
      { file: createMockFile('doc.pdf', 1500), id: '1' },
    ];
    renderUpload({ files });
    expect(screen.getByRole('list', { name: '업로드된 파일' })).toBeInTheDocument();
  });

  // --- Custom className ---

  it('applies custom className', () => {
    const { container } = renderUpload({ className: 'my-upload' });
    expect(container.querySelector('.file-upload.my-upload')).toBeInTheDocument();
  });

  // --- Accept and multiple ---

  it('passes accept to input', () => {
    renderUpload({ accept: '.png,.jpg' });
    expect(screen.getByTestId('file-input')).toHaveAttribute('accept', '.png,.jpg');
  });

  it('passes multiple to input', () => {
    renderUpload({ multiple: true });
    expect(screen.getByTestId('file-input')).toHaveAttribute('multiple');
  });
});
