export interface SearchResult {
  conversationId: string;
  conversationTitle: string;
  messageIndex: number;
  role: 'user' | 'assistant';
  content: string;
  matchStart: number;
  matchEnd: number;
}

export function searchMessages(
  conversations: Array<{
    id: string;
    title: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  }>,
  query: string
): SearchResult[] {
  if (!query.trim()) return [];

  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];

  for (const conv of conversations) {
    for (let i = 0; i < conv.messages.length; i++) {
      const msg = conv.messages[i];
      const lowerContent = msg.content.toLowerCase();
      const matchStart = lowerContent.indexOf(lowerQuery);

      if (matchStart !== -1) {
        results.push({
          conversationId: conv.id,
          conversationTitle: conv.title,
          messageIndex: i,
          role: msg.role,
          content: msg.content,
          matchStart,
          matchEnd: matchStart + query.length,
        });
      }
    }
  }

  return results;
}

export function getMatchContext(content: string, matchStart: number, matchEnd: number, contextLength: number = 40): string {
  const start = Math.max(0, matchStart - contextLength);
  const end = Math.min(content.length, matchEnd + contextLength);

  let result = content.substring(start, end);
  if (start > 0) result = '...' + result;
  if (end < content.length) result = result + '...';

  return result;
}
