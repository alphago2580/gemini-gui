import React, { useState, useCallback, useRef } from 'react';
import './FileUpload.css';

export interface FileUploadFile {
  file: File;
  id: string;
  progress?: number;
  error?: string;
}

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  variant?: 'dropzone' | 'button' | 'compact';
  label?: string;
  hint?: string;
  showFileList?: boolean;
  files?: FileUploadFile[];
  onRemove?: (id: string) => void;
  className?: string;
  ariaLabel?: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelected,
  accept,
  multiple = false,
  maxSize,
  maxFiles,
  disabled = false,
  variant = 'dropzone',
  label,
  hint,
  showFileList = true,
  files = [],
  onRemove,
  className,
  ariaLabel = '파일 업로드',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFiles = useCallback((fileList: File[]): File[] => {
    setError(null);
    let valid = fileList;

    if (maxSize) {
      const oversized = valid.filter(f => f.size > maxSize);
      if (oversized.length > 0) {
        setError(`파일 크기가 ${formatSize(maxSize)}를 초과합니다`);
        valid = valid.filter(f => f.size <= maxSize);
      }
    }

    if (maxFiles) {
      const totalCount = files.length + valid.length;
      if (totalCount > maxFiles) {
        setError(`최대 ${maxFiles}개 파일만 업로드할 수 있습니다`);
        valid = valid.slice(0, Math.max(0, maxFiles - files.length));
      }
    }

    return valid;
  }, [maxSize, maxFiles, files.length]);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || disabled) return;
    const arr = Array.from(fileList);
    const valid = validateFiles(arr);
    if (valid.length > 0) {
      onFilesSelected(valid);
    }
  }, [disabled, validateFiles, onFilesSelected]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }, [handleFiles]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click();
    }
  }, [disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      inputRef.current?.click();
    }
  }, [disabled]);

  const defaultLabel = variant === 'compact'
    ? '파일 선택'
    : '파일을 끌어다 놓거나 클릭하여 선택';

  const containerClass = [
    'file-upload',
    `file-upload-${variant}`,
    isDragging && 'file-upload-dragging',
    disabled && 'file-upload-disabled',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      <div
        className="file-upload-zone"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={ariaLabel}
        aria-disabled={disabled}
      >
        {variant === 'dropzone' && (
          <span className="file-upload-icon" aria-hidden="true">📎</span>
        )}
        <span className="file-upload-label">{label ?? defaultLabel}</span>
        {hint && <span className="file-upload-hint">{hint}</span>}
      </div>

      <input
        ref={inputRef}
        type="file"
        className="file-upload-input"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        tabIndex={-1}
        aria-hidden="true"
        data-testid="file-input"
      />

      {error && (
        <div className="file-upload-error" role="alert">{error}</div>
      )}

      {showFileList && files.length > 0 && (
        <ul className="file-upload-list" role="list" aria-label="업로드된 파일">
          {files.map(f => (
            <li key={f.id} className="file-upload-item">
              <span className="file-upload-name" title={f.file.name}>
                {f.file.name}
              </span>
              <span className="file-upload-size">{formatSize(f.file.size)}</span>
              {f.progress !== undefined && f.progress < 100 && (
                <div className="file-upload-progress">
                  <div
                    className="file-upload-progress-bar"
                    style={{ width: `${f.progress}%` }}
                    role="progressbar"
                    aria-valuenow={f.progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${f.file.name} 업로드 진행률`}
                  />
                </div>
              )}
              {f.error && (
                <span className="file-upload-item-error">{f.error}</span>
              )}
              {onRemove && (
                <button
                  className="file-upload-remove"
                  onClick={(e) => { e.stopPropagation(); onRemove(f.id); }}
                  aria-label={`${f.file.name} 제거`}
                  type="button"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default React.memo(FileUpload);
