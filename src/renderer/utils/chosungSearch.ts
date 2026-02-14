/**
 * Korean chosung (initial consonant) fuzzy search utility.
 * Enables matching Korean text by typing only the initial consonants,
 * e.g., "ㅅㅈ" matches "설정", "ㄷㅎ" matches "대화".
 */

/** The 19 Korean initial consonants (chosung) in Unicode order. */
const CHOSUNG_LIST = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const;

/** Start of the Korean syllable block range (가). */
const HANGUL_START = 0xAC00;

/** End of the Korean syllable block range (힣). */
const HANGUL_END = 0xD7A3;

/** Start of the Korean jamo (consonant letter) range (ㄱ). */
const JAMO_START = 0x3131;

/** End of the Korean jamo (consonant letter) range (ㅎ). */
const JAMO_END = 0x314E;

/** Number of jungseong × jongseong combinations per chosung. */
const SYLLABLE_BLOCK = 588; // 21 * 28

/**
 * Check if a character is a Korean syllable (가-힣).
 */
export function isHangulSyllable(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= HANGUL_START && code <= HANGUL_END;
}

/**
 * Check if a character is a Korean jamo consonant (ㄱ-ㅎ).
 */
export function isHangulJamo(char: string): boolean {
  const code = char.charCodeAt(0);
  return code >= JAMO_START && code <= JAMO_END;
}

/**
 * Extract the chosung (initial consonant) from a Korean syllable.
 * Returns the chosung character, or the original character if not a syllable.
 */
export function getChosung(char: string): string {
  if (!isHangulSyllable(char)) return char;
  const index = Math.floor((char.charCodeAt(0) - HANGUL_START) / SYLLABLE_BLOCK);
  return CHOSUNG_LIST[index];
}

/**
 * Extract chosung sequence from a string.
 * Korean syllables are replaced with their initial consonants;
 * non-Korean characters are kept as-is.
 *
 * @example
 * extractChosung('설정') // 'ㅅㅈ'
 * extractChosung('대화 목록') // 'ㄷㅎ ㅁㄹ'
 * extractChosung('Hello') // 'Hello'
 */
export function extractChosung(text: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += getChosung(text[i]);
  }
  return result;
}

/**
 * Check if a query is composed entirely of Korean jamo consonants.
 */
export function isChosungQuery(query: string): boolean {
  if (query.length === 0) return false;
  for (let i = 0; i < query.length; i++) {
    const char = query[i];
    if (char === ' ') continue; // allow spaces
    if (!isHangulJamo(char)) return false;
  }
  return true;
}

/**
 * Perform fuzzy search that supports Korean chosung matching.
 *
 * When the query consists entirely of Korean jamo consonants (e.g., "ㅅㅈ"),
 * it matches against the chosung sequence of the target text.
 * Otherwise, falls back to standard case-insensitive substring matching.
 *
 * @param text - The text to search in
 * @param query - The search query
 * @returns Whether the text matches the query
 *
 * @example
 * chosungMatch('설정', 'ㅅㅈ') // true
 * chosungMatch('대화', 'ㄷㅎ') // true
 * chosungMatch('설정', '설') // true (standard substring match)
 * chosungMatch('Settings', 'set') // true (case-insensitive)
 */
export function chosungMatch(text: string, query: string): boolean {
  if (!query.trim()) return true;

  const trimmedQuery = query.trim();

  // If the query is all chosung jamo, match against extracted chosung
  if (isChosungQuery(trimmedQuery)) {
    const textChosung = extractChosung(text);
    return textChosung.includes(trimmedQuery);
  }

  // Standard case-insensitive substring match
  return text.toLowerCase().includes(trimmedQuery.toLowerCase());
}

/**
 * Filter an array of items using chosung-aware fuzzy search.
 *
 * @param items - Array of items to filter
 * @param query - The search query
 * @param getLabel - Function to extract the searchable label from an item
 * @returns Filtered array of matching items
 */
export function chosungFilter<T>(
  items: T[],
  query: string,
  getLabel: (item: T) => string,
): T[] {
  if (!query.trim()) return items;
  return items.filter(item => chosungMatch(getLabel(item), query));
}
