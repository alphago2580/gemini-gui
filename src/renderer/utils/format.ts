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
