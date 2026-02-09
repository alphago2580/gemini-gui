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

let messageIdCounter = 0;

export function generateMessageId(): string {
  return `msg-${Date.now()}-${messageIdCounter++}`;
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

export function exportToHtml(title: string, messages: ExportableMessage[]): string {
  const escapedTitle = escapeHtml(title);
  const messageBlocks = messages.map(message => {
    const roleName = message.role === 'user' ? 'User' : 'Gemini';
    const roleClass = message.role === 'user' ? 'user' : 'assistant';
    const time = message.timestamp.toLocaleString();
    const content = escapeHtml(message.content);
    return `<div class="message ${roleClass}">
      <div class="message-header"><strong>${roleName}</strong> <span class="time">${time}</span></div>
      <div class="message-content"><pre>${content}</pre></div>
    </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>${escapedTitle}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #1a1a1a; }
  h1 { border-bottom: 2px solid #e0e0e0; padding-bottom: 8px; font-size: 24px; }
  .meta { color: #666; font-size: 14px; margin-bottom: 24px; }
  .message { margin-bottom: 16px; padding: 12px 16px; border-radius: 8px; }
  .message.user { background: #e3f2fd; }
  .message.assistant { background: #f5f5f5; }
  .message-header { margin-bottom: 8px; font-size: 13px; }
  .message-header strong { font-size: 14px; }
  .time { color: #888; margin-left: 8px; }
  .message-content pre { white-space: pre-wrap; word-wrap: break-word; font-family: inherit; margin: 0; font-size: 14px; line-height: 1.6; }
</style>
</head>
<body>
<h1>${escapedTitle}</h1>
<p class="meta">Exported on ${escapeHtml(new Date().toLocaleString())}</p>
${messageBlocks}
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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
