import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatFileSize, getFileIcon, generateConversationTitle, generateMessageId, exportToMarkdown, exportToHtml, ExportableMessage } from './format';

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

describe('exportToMarkdown', () => {
  let mockDateString: string;

  beforeEach(() => {
    // Fix the export date so tests are deterministic
    mockDateString = '2025/1/15 12:00:00';
    vi.spyOn(Date.prototype, 'toLocaleString').mockReturnValue(mockDateString);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const makeMessage = (role: 'user' | 'assistant', content: string): ExportableMessage => ({
    role,
    content,
    timestamp: new Date('2025-01-15T12:00:00Z'),
  });

  it('exports empty conversation', () => {
    const result = exportToMarkdown('Test Chat', []);
    expect(result).toContain('# Test Chat');
    expect(result).toContain('*Exported on');
    expect(result).toContain('---');
  });

  it('exports single user message', () => {
    const messages = [makeMessage('user', 'Hello!')];
    const result = exportToMarkdown('Chat', messages);
    expect(result).toContain('### User');
    expect(result).toContain('Hello!');
  });

  it('exports single assistant message', () => {
    const messages = [makeMessage('assistant', 'Hi there!')];
    const result = exportToMarkdown('Chat', messages);
    expect(result).toContain('### Gemini');
    expect(result).toContain('Hi there!');
  });

  it('exports a full conversation in order', () => {
    const messages = [
      makeMessage('user', 'What is 2+2?'),
      makeMessage('assistant', '2+2 equals 4.'),
      makeMessage('user', 'Thanks!'),
      makeMessage('assistant', "You're welcome!"),
    ];
    const result = exportToMarkdown('Math Chat', messages);
    expect(result).toContain('# Math Chat');

    const userIdx = result.indexOf('### User');
    const geminiIdx = result.indexOf('### Gemini');
    expect(userIdx).toBeLessThan(geminiIdx);

    expect(result).toContain('What is 2+2?');
    expect(result).toContain('2+2 equals 4.');
    expect(result).toContain('Thanks!');
    expect(result).toContain("You're welcome!");
  });

  it('preserves multiline content', () => {
    const messages = [makeMessage('assistant', 'Line 1\nLine 2\nLine 3')];
    const result = exportToMarkdown('Chat', messages);
    expect(result).toContain('Line 1\nLine 2\nLine 3');
  });

  it('includes timestamp for each message', () => {
    const messages = [makeMessage('user', 'Hello')];
    const result = exportToMarkdown('Chat', messages);
    // The mock returns the same string for toLocaleString
    expect(result).toContain(mockDateString);
  });

  it('includes title with special characters', () => {
    const result = exportToMarkdown('Chat about **markdown** & <HTML>', []);
    expect(result).toContain('# Chat about **markdown** & <HTML>');
  });

  it('returns a string ending with newline after last message', () => {
    const messages = [makeMessage('user', 'Hello')];
    const result = exportToMarkdown('Chat', messages);
    expect(result.endsWith('\n')).toBe(true);
  });
});

describe('exportToHtml', () => {
  let mockDateString: string;

  beforeEach(() => {
    mockDateString = '2025/1/15 12:00:00';
    vi.spyOn(Date.prototype, 'toLocaleString').mockReturnValue(mockDateString);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const makeMessage = (role: 'user' | 'assistant', content: string): ExportableMessage => ({
    role,
    content,
    timestamp: new Date('2025-01-15T12:00:00Z'),
  });

  it('returns valid HTML document', () => {
    const result = exportToHtml('Test Chat', []);
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('<html>');
    expect(result).toContain('</html>');
    expect(result).toContain('<meta charset="utf-8">');
  });

  it('includes title in heading and HTML title', () => {
    const result = exportToHtml('My Chat', []);
    expect(result).toContain('<title>My Chat</title>');
    expect(result).toContain('<h1>My Chat</h1>');
  });

  it('includes exported date', () => {
    const result = exportToHtml('Chat', []);
    expect(result).toContain('Exported on');
    expect(result).toContain(mockDateString);
  });

  it('renders user message with user class', () => {
    const messages = [makeMessage('user', 'Hello!')];
    const result = exportToHtml('Chat', messages);
    expect(result).toContain('class="message user"');
    expect(result).toContain('<strong>User</strong>');
    expect(result).toContain('Hello!');
  });

  it('renders assistant message with assistant class', () => {
    const messages = [makeMessage('assistant', 'Hi there!')];
    const result = exportToHtml('Chat', messages);
    expect(result).toContain('class="message assistant"');
    expect(result).toContain('<strong>Gemini</strong>');
    expect(result).toContain('Hi there!');
  });

  it('escapes HTML special characters in content', () => {
    const messages = [makeMessage('user', '<script>alert("xss")</script>')];
    const result = exportToHtml('Chat', messages);
    expect(result).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(result).not.toContain('<script>alert("xss")</script>');
  });

  it('escapes HTML special characters in title', () => {
    const result = exportToHtml('Chat about <HTML> & "stuff"', []);
    expect(result).toContain('Chat about &lt;HTML&gt; &amp; &quot;stuff&quot;');
  });

  it('renders multiple messages in order', () => {
    const messages = [
      makeMessage('user', 'Question'),
      makeMessage('assistant', 'Answer'),
    ];
    const result = exportToHtml('Chat', messages);
    const questionIdx = result.indexOf('Question');
    const answerIdx = result.indexOf('Answer');
    expect(questionIdx).toBeLessThan(answerIdx);
  });

  it('includes CSS styling', () => {
    const result = exportToHtml('Chat', []);
    expect(result).toContain('<style>');
    expect(result).toContain('.message');
    expect(result).toContain('.message.user');
    expect(result).toContain('.message.assistant');
  });

  it('includes timestamp for each message', () => {
    const messages = [makeMessage('user', 'Hello')];
    const result = exportToHtml('Chat', messages);
    expect(result).toContain('class="time"');
    expect(result).toContain(mockDateString);
  });
});

describe('generateMessageId', () => {
  it('returns a string starting with msg-', () => {
    const id = generateMessageId();
    expect(id).toMatch(/^msg-/);
  });

  it('generates unique IDs on successive calls', () => {
    const id1 = generateMessageId();
    const id2 = generateMessageId();
    expect(id1).not.toBe(id2);
  });

  it('includes timestamp in the ID', () => {
    const before = Date.now();
    const id = generateMessageId();
    const after = Date.now();
    // Extract timestamp part: msg-{timestamp}-{counter}
    const parts = id.split('-');
    const ts = parseInt(parts[1], 10);
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});
