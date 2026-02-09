export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  if (type.startsWith('text/')) return '📝';
  if (type.startsWith('video/')) return '🎥';
  if (type.startsWith('audio/')) return '🎵';
  return '📎';
}

export function generateConversationTitle(firstMessage: string, maxLength = 50): string {
  return firstMessage.length > maxLength
    ? firstMessage.substring(0, maxLength) + '...'
    : firstMessage;
}

export interface ExportableMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function exportToMarkdown(title: string, messages: ExportableMessage[]): string {
  const lines: string[] = [];
  lines.push(`# ${title}`);
  lines.push('');
  lines.push(`*Exported on ${new Date().toLocaleString()}*`);
  lines.push('');
  lines.push('---');
  lines.push('');

  for (const message of messages) {
    const roleName = message.role === 'user' ? 'User' : 'Gemini';
    const time = message.timestamp.toLocaleString();
    lines.push(`### ${roleName} — ${time}`);
    lines.push('');
    lines.push(message.content);
    lines.push('');
  }

  return lines.join('\n');
}
