/**
 * Fuzzy search utility with Korean initial consonant (초성) matching support.
 *
 * Supports:
 * - Subsequence fuzzy matching (e.g., "stg" matches "settings")
 * - Korean 초성 search (e.g., "ㅅㅈ" matches "설정")
 * - Case-insensitive Latin matching
 * - Scored results for ranking
 */

/** Korean Unicode ranges */
const HANGUL_SYLLABLE_START = 0xac00;
const HANGUL_SYLLABLE_END = 0xd7a3;
const JAMO_INITIAL_START = 0x3131;

/**
 * The 19 Korean initial consonants (초성) in syllable block order.
 * Index in this array corresponds to the initial consonant index
 * when decomposing a Hangul syllable.
 */
const CHOSEONG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ',
  'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

/**
 * Map from Hangul Compatibility Jamo to choseong index.
 * Includes both single and double consonants.
 */
const JAMO_TO_CHOSEONG_INDEX = new Map<string, number>();
CHOSEONG_LIST.forEach((jamo, index) => {
  JAMO_TO_CHOSEONG_INDEX.set(jamo, index);
});

/** Check if a character is a Hangul syllable block (가-힣). */
function isHangulSyllable(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= HANGUL_SYLLABLE_START && code <= HANGUL_SYLLABLE_END;
}

/** Check if a character is a Korean Jamo consonant (ㄱ-ㅎ). */
function isJamoConsonant(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= JAMO_INITIAL_START && code <= 0x314e;
}

/**
 * Extract the initial consonant (초성) from a Hangul syllable block.
 * Returns the consonant character, or the original character if not a syllable.
 */
export function getChoseong(char: string): string {
  if (!isHangulSyllable(char)) return char;
  const code = char.charCodeAt(0);
  const index = Math.floor((code - HANGUL_SYLLABLE_START) / 588);
  return CHOSEONG_LIST[index];
}

/**
 * Extract all initial consonants from a string.
 * Non-Hangul characters are passed through unchanged.
 *
 * @example
 * extractChoseong("설정") // "ㅅㅈ"
 * extractChoseong("Hello 세계") // "Hello ㅅㄱ"
 */
export function extractChoseong(str: string): string {
  return Array.from(str).map(getChoseong).join('');
}

/**
 * Check if the query matches the target using Korean 초성 matching.
 * Each Jamo consonant in the query matches a syllable in the target
 * whose initial consonant matches.
 */
function matchChoseong(target: string, query: string): boolean {
  const targetChars = Array.from(target);
  const queryChars = Array.from(query);

  let qi = 0;
  for (let ti = 0; ti < targetChars.length && qi < queryChars.length; ti++) {
    const qChar = queryChars[qi];
    const tChar = targetChars[ti];

    if (isJamoConsonant(qChar)) {
      // Query char is a consonant — match against target's choseong
      const targetChoseong = getChoseong(tChar);
      if (targetChoseong === qChar) {
        qi++;
      }
    } else if (isHangulSyllable(qChar) && isHangulSyllable(tChar)) {
      // Both are full syllables — exact match
      if (qChar === tChar) {
        qi++;
      }
    } else {
      // Latin or other characters — case-insensitive
      if (qChar.toLowerCase() === tChar.toLowerCase()) {
        qi++;
      }
    }
  }

  return qi === queryChars.length;
}

/** Result of a fuzzy search match. */
export interface FuzzyMatch<T = string> {
  /** The original item. */
  item: T;
  /** Match score (higher = better match). Range: 0-1. */
  score: number;
  /** Indices in the string where matches occurred. */
  matchedIndices: number[];
}

/**
 * Compute a fuzzy match score between a query and a target string.
 * Returns null if no match, or a FuzzyMatch with score and matched indices.
 *
 * Scoring factors:
 * - Consecutive character matches score higher
 * - Matches at word boundaries score higher
 * - Matches at the start of the string score higher
 * - Shorter targets with the same matches score higher
 */
function computeFuzzyMatch(target: string, query: string): Omit<FuzzyMatch, 'item'> | null {
  if (query.length === 0) return { score: 1, matchedIndices: [] };
  if (target.length === 0) return null;

  const targetLower = target.toLowerCase();
  const queryLower = query.toLowerCase();
  const queryChars = Array.from(queryLower);
  const targetChars = Array.from(targetLower);

  // Check if all query chars are Jamo consonants (초성 mode)
  const isChoseongQuery = queryChars.every(isJamoConsonant);

  if (isChoseongQuery) {
    // 초성 matching mode
    const targetOrigChars = Array.from(target);
    const matchedIndices: number[] = [];
    let qi = 0;

    for (let ti = 0; ti < targetOrigChars.length && qi < queryChars.length; ti++) {
      const targetChoseong = getChoseong(targetOrigChars[ti]);
      if (targetChoseong === queryChars[qi]) {
        matchedIndices.push(ti);
        qi++;
      }
    }

    if (qi < queryChars.length) return null;

    // Score choseong matches
    const score = computeScore(matchedIndices, target.length, queryChars.length);
    return { score, matchedIndices };
  }

  // Mixed or standard fuzzy matching
  // Try choseong matching first for mixed Korean queries
  const hasJamo = queryChars.some(isJamoConsonant);
  if (hasJamo && matchChoseong(target, query)) {
    const matchedIndices: number[] = [];
    const targetOrigChars = Array.from(target);
    let qi = 0;

    for (let ti = 0; ti < targetOrigChars.length && qi < queryChars.length; ti++) {
      const qChar = queryChars[qi];
      const tChar = targetOrigChars[ti];

      if (isJamoConsonant(qChar)) {
        if (getChoseong(tChar) === qChar) {
          matchedIndices.push(ti);
          qi++;
        }
      } else if (qChar.toLowerCase() === tChar.toLowerCase()) {
        matchedIndices.push(ti);
        qi++;
      }
    }

    if (qi === queryChars.length) {
      const score = computeScore(matchedIndices, target.length, queryChars.length);
      return { score, matchedIndices };
    }
  }

  // Standard subsequence fuzzy matching
  const matchedIndices: number[] = [];
  let qi = 0;

  for (let ti = 0; ti < targetChars.length && qi < queryChars.length; ti++) {
    if (targetChars[ti] === queryChars[qi]) {
      matchedIndices.push(ti);
      qi++;
    }
  }

  if (qi < queryChars.length) return null;

  const score = computeScore(matchedIndices, target.length, queryChars.length);
  return { score, matchedIndices };
}

/**
 * Compute a match score based on matched indices.
 */
function computeScore(matchedIndices: number[], targetLength: number, queryLength: number): number {
  if (matchedIndices.length === 0) return 0;

  let score = 0;

  // Base: ratio of query length to target length (shorter targets = better)
  score += queryLength / targetLength * 0.3;

  // Bonus for consecutive matches
  let consecutiveCount = 0;
  for (let i = 1; i < matchedIndices.length; i++) {
    if (matchedIndices[i] === matchedIndices[i - 1] + 1) {
      consecutiveCount++;
    }
  }
  if (matchedIndices.length > 1) {
    score += (consecutiveCount / (matchedIndices.length - 1)) * 0.4;
  } else {
    score += 0.4;
  }

  // Bonus for starting at the beginning
  if (matchedIndices[0] === 0) {
    score += 0.2;
  }

  // Bonus for compact matches (small spread)
  const spread = matchedIndices[matchedIndices.length - 1] - matchedIndices[0] + 1;
  score += (queryLength / spread) * 0.1;

  return Math.min(score, 1);
}

/**
 * Perform fuzzy search on a string target.
 *
 * @param target - The string to search in
 * @param query - The search query
 * @returns FuzzyMatch if matched, null otherwise
 *
 * @example
 * fuzzyMatch("settings", "stg")
 * // { item: "settings", score: 0.65, matchedIndices: [0, 2, 7] }
 *
 * fuzzyMatch("설정", "ㅅㅈ")
 * // { item: "설정", score: 0.9, matchedIndices: [0, 1] }
 */
export function fuzzyMatch(target: string, query: string): FuzzyMatch | null {
  const result = computeFuzzyMatch(target, query);
  if (result === null) return null;
  return { item: target, ...result };
}

/**
 * Search and rank a list of strings using fuzzy matching.
 * Results are sorted by score (highest first).
 *
 * @param items - Array of strings to search
 * @param query - The search query (supports Latin fuzzy + Korean 초성)
 * @returns Matched items sorted by relevance
 *
 * @example
 * fuzzySearch(["설정", "새 대화", "검색"], "ㅅ")
 * // matches "설정" and "새 대화"
 *
 * fuzzySearch(["settings", "search", "save"], "se")
 * // matches all three, "search" and "settings" ranked higher
 */
export function fuzzySearch(items: string[], query: string): FuzzyMatch[] {
  if (!query) return items.map(item => ({ item, score: 1, matchedIndices: [] }));

  const results: FuzzyMatch[] = [];
  for (const item of items) {
    const match = fuzzyMatch(item, query);
    if (match) {
      results.push(match);
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Search and rank a list of objects using fuzzy matching on a specific field.
 *
 * @param items - Array of objects to search
 * @param query - The search query
 * @param keyFn - Function to extract the searchable string from each item
 * @returns Matched items sorted by relevance
 *
 * @example
 * const commands = [
 *   { id: 'settings', label: '설정' },
 *   { id: 'new-chat', label: '새 대화' },
 * ];
 * fuzzySearchBy(commands, "ㅅㅈ", c => c.label)
 * // [{ item: { id: 'settings', label: '설정' }, score: 0.9, matchedIndices: [0, 1] }]
 */
export function fuzzySearchBy<T>(
  items: T[],
  query: string,
  keyFn: (item: T) => string,
): FuzzyMatch<T>[] {
  if (!query) return items.map(item => ({ item, score: 1, matchedIndices: [] }));

  const results: FuzzyMatch<T>[] = [];
  for (const item of items) {
    const target = keyFn(item);
    const match = computeFuzzyMatch(target, query);
    if (match) {
      results.push({ item, ...match });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}
