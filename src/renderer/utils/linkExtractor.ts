export interface ExtractedLink {
  url: string;
  text: string;
  messageIndex: number;
  role: 'user' | 'assistant';
}

const MD_LINK_RE = /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g;
const BARE_URL_RE = /(?<!\[(?:[^\]]*)\]\()(?<!\()(https?:\/\/[^\s<>")\]]+)/g;

export function extractLinks(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): ExtractedLink[] {
  const results: ExtractedLink[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    let match: RegExpExecArray | null;
    MD_LINK_RE.lastIndex = 0;
    while ((match = MD_LINK_RE.exec(msg.content)) !== null) {
      const url = match[2];
      const key = `${i}:${url}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          url,
          text: match[1] || url,
          messageIndex: i,
          role: msg.role,
        });
      }
    }

    BARE_URL_RE.lastIndex = 0;
    while ((match = BARE_URL_RE.exec(msg.content)) !== null) {
      const url = match[0];
      const key = `${i}:${url}`;
      if (!seen.has(key)) {
        seen.add(key);
        results.push({
          url,
          text: url,
          messageIndex: i,
          role: msg.role,
        });
      }
    }
  }

  return results;
}
