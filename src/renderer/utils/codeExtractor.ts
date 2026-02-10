export interface ExtractedCode {
  language: string;
  content: string;
  messageIndex: number;
  role: 'user' | 'assistant';
}

export function extractCodeBlocks(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>,
): ExtractedCode[] {
  const results: ExtractedCode[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const lines = msg.content.split('\n');
    let j = 0;

    while (j < lines.length) {
      const codeMatch = lines[j].match(/^```(\w*)/);
      if (codeMatch) {
        const language = codeMatch[1] || '';
        const codeLines: string[] = [];
        j++;
        while (j < lines.length && !lines[j].match(/^```\s*$/)) {
          codeLines.push(lines[j]);
          j++;
        }
        j++; // skip closing ```
        const content = codeLines.join('\n');
        if (content.trim()) {
          results.push({ language, content, messageIndex: i, role: msg.role });
        }
      } else {
        j++;
      }
    }
  }

  return results;
}

export function groupByLanguage(codes: ExtractedCode[]): Map<string, ExtractedCode[]> {
  const map = new Map<string, ExtractedCode[]>();
  for (const code of codes) {
    const lang = code.language || 'plain';
    const list = map.get(lang) || [];
    list.push(code);
    map.set(lang, list);
  }
  return map;
}
