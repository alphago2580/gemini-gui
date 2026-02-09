import { describe, it, expect } from 'vitest';
import { formatFileSize, getFileIcon, generateConversationTitle } from './format';

describe('formatFileSize', () => {
  it('formats bytes', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(1)).toBe('1 B');
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(1023)).toBe('1023 B');
  });

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(2560)).toBe('2.5 KB');
    expect(formatFileSize(10240)).toBe('10.0 KB');
    expect(formatFileSize(1048575)).toBe('1024.0 KB');
  });

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1.0 MB');
    expect(formatFileSize(1572864)).toBe('1.5 MB');
    expect(formatFileSize(10485760)).toBe('10.0 MB');
    expect(formatFileSize(104857600)).toBe('100.0 MB');
  });
});

describe('getFileIcon', () => {
  it('returns image icon for image types', () => {
    expect(getFileIcon('image/png')).toBe('🖼️');
    expect(getFileIcon('image/jpeg')).toBe('🖼️');
    expect(getFileIcon('image/gif')).toBe('🖼️');
    expect(getFileIcon('image/webp')).toBe('🖼️');
  });

  it('returns PDF icon for PDF type', () => {
    expect(getFileIcon('application/pdf')).toBe('📄');
  });

  it('returns text icon for text types', () => {
    expect(getFileIcon('text/plain')).toBe('📝');
    expect(getFileIcon('text/html')).toBe('📝');
    expect(getFileIcon('text/csv')).toBe('📝');
  });

  it('returns video icon for video types', () => {
    expect(getFileIcon('video/mp4')).toBe('🎥');
    expect(getFileIcon('video/webm')).toBe('🎥');
  });

  it('returns audio icon for audio types', () => {
    expect(getFileIcon('audio/mpeg')).toBe('🎵');
    expect(getFileIcon('audio/wav')).toBe('🎵');
  });

  it('returns default icon for unknown types', () => {
    expect(getFileIcon('application/octet-stream')).toBe('📎');
    expect(getFileIcon('application/zip')).toBe('📎');
    expect(getFileIcon('')).toBe('📎');
  });
});

describe('generateConversationTitle', () => {
  it('returns full message when shorter than max length', () => {
    expect(generateConversationTitle('Hello')).toBe('Hello');
    expect(generateConversationTitle('Short message')).toBe('Short message');
  });

  it('truncates message when longer than max length', () => {
    const longMessage = 'A'.repeat(60);
    const result = generateConversationTitle(longMessage);
    expect(result).toBe('A'.repeat(50) + '...');
    expect(result.length).toBe(53);
  });

  it('handles exactly max length message', () => {
    const exactMessage = 'A'.repeat(50);
    expect(generateConversationTitle(exactMessage)).toBe(exactMessage);
  });

  it('handles empty string', () => {
    expect(generateConversationTitle('')).toBe('');
  });

  it('uses custom max length', () => {
    const message = 'Hello World';
    expect(generateConversationTitle(message, 5)).toBe('Hello...');
    expect(generateConversationTitle(message, 100)).toBe('Hello World');
  });
});
