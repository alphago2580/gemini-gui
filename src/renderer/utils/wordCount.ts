export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  lines: number;
  sentences: number;
  paragraphs: number;
}

export function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export function countLines(text: string): number {
  if (text === '') return 0;
  return text.split('\n').length;
}

export function countSentences(text: string): number {
  if (!text.trim()) return 0;
  const sentences = text.match(/[.!?。！？]+/g);
  return sentences ? sentences.length : 0;
}

export function countParagraphs(text: string): number {
  if (!text.trim()) return 0;
  return text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
}

export function getTextStats(text: string): TextStats {
  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words: countWords(text),
    lines: countLines(text),
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
  };
}

export function estimateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = countWords(text);
  return Math.max(1, Math.ceil(words / wordsPerMinute));
}
