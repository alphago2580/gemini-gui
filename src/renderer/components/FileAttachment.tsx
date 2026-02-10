import React, { useState } from 'react';
import './FileAttachment.css';
import { formatFileSize, getFileIcon } from '../utils/format';
import * as S from '../constants/strings';

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

  return (
    <div className="file-attachment" role="region" aria-label={S.ARIA_FILE_ATTACHMENT}>
      {attachedFiles.length > 0 && (
        <div className="attached-files" role="list" aria-label={S.ARIA_ATTACHED_FILES}>
          {attachedFiles.map((file, index) => (
            <div key={index} className="file-chip" role="listitem">
              <span className="file-icon" aria-hidden="true">{getFileIcon(file.type)}</span>
              <span className="file-name">{file.name}</span>
              <span className="file-size">{formatFileSize(file.size)}</span>
              <button
                className="remove-file"
                onClick={() => onRemoveFile(index)}
                aria-label={`${file.name} ${S.FILE_REMOVE_SUFFIX}`}
                title={S.FILE_REMOVE_TITLE}
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
        aria-label={S.ARIA_DROP_ZONE}
      >
        <input
          type="file"
          id="file-input"
          multiple
          onChange={handleFileInput}
          accept="image/*,.pdf,.txt,.doc,.docx"
          style={{ display: 'none' }}
          aria-label={S.ARIA_FILE_SELECT}
        />
        <label htmlFor="file-input" className="file-input-label">
          <span className="icon" aria-hidden="true">📎</span>
          <span className="text">
            {isDragging ? S.DROP_ZONE_DRAGGING : S.DROP_ZONE_DEFAULT}
          </span>
        </label>
      </div>
    </div>
  );
};

export default React.memo(FileAttachment);
