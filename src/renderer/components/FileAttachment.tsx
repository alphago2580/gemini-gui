import React, { useState } from 'react';
import './FileAttachment.css';

interface FileAttachmentProps {
  onFilesSelected: (files: File[]) => void;
  attachedFiles: File[];
  onRemoveFile: (index: number) => void;
}

const FileAttachment: React.FC<FileAttachmentProps> = ({
  onFilesSelected,
  attachedFiles,
  onRemoveFile
}) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onFilesSelected(files);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (file: File): string => {
    if (file.type.startsWith('image/')) return '🖼️';
    if (file.type === 'application/pdf') return '📄';
    if (file.type.startsWith('text/')) return '📝';
    if (file.type.startsWith('video/')) return '🎥';
    if (file.type.startsWith('audio/')) return '🎵';
    return '📎';
  };

  return (
    <div className="file-attachment">
      {attachedFiles.length > 0 && (
        <div className="attached-files">
          {attachedFiles.map((file, index) => (
            <div key={index} className="file-chip">
              <span className="file-icon">{getFileIcon(file)}</span>
              <span className="file-name">{file.name}</span>
              <span className="file-size">{formatFileSize(file.size)}</span>
              <button
                className="remove-file"
                onClick={() => onRemoveFile(index)}
                title="파일 제거"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div
        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-input"
          multiple
          onChange={handleFileInput}
          accept="image/*,.pdf,.txt,.doc,.docx"
          style={{ display: 'none' }}
        />
        <label htmlFor="file-input" className="file-input-label">
          <span className="icon">📎</span>
          <span className="text">
            {isDragging ? '파일을 여기에 놓으세요' : '파일 첨부 (클릭 또는 드래그)'}
          </span>
        </label>
      </div>
    </div>
  );
};

export default FileAttachment;
