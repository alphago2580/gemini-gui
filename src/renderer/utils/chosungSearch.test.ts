import { describe, it, expect } from 'vitest';
import {
  isHangulSyllable,
  isHangulJamo,
  getChosung,
  extractChosung,
  isChosungQuery,
  chosungMatch,
  chosungFilter,
} from './chosungSearch';

describe('chosungSearch', () => {
  describe('isHangulSyllable', () => {
    it('returns true for Korean syllables', () => {
      expect(isHangulSyllable('가')).toBe(true);
      expect(isHangulSyllable('힣')).toBe(true);
      expect(isHangulSyllable('설')).toBe(true);
      expect(isHangulSyllable('정')).toBe(true);
    });

    it('returns false for non-syllable characters', () => {
      expect(isHangulSyllable('ㄱ')).toBe(false);
      expect(isHangulSyllable('ㅎ')).toBe(false);
      expect(isHangulSyllable('A')).toBe(false);
      expect(isHangulSyllable('1')).toBe(false);
      expect(isHangulSyllable(' ')).toBe(false);
    });

    it('returns false for jamo vowels', () => {
      expect(isHangulSyllable('ㅏ')).toBe(false);
      expect(isHangulSyllable('ㅣ')).toBe(false);
    });
  });

  describe('isHangulJamo', () => {
    it('returns true for Korean consonant jamo', () => {
      expect(isHangulJamo('ㄱ')).toBe(true);
      expect(isHangulJamo('ㅎ')).toBe(true);
      expect(isHangulJamo('ㅅ')).toBe(true);
      expect(isHangulJamo('ㄲ')).toBe(true);
    });

    it('returns false for Korean syllables', () => {
      expect(isHangulJamo('가')).toBe(false);
      expect(isHangulJamo('설')).toBe(false);
    });

    it('returns false for non-Korean characters', () => {
      expect(isHangulJamo('A')).toBe(false);
      expect(isHangulJamo('1')).toBe(false);
      expect(isHangulJamo(' ')).toBe(false);
    });

    it('returns true for double consonants', () => {
      expect(isHangulJamo('ㄲ')).toBe(true);
      expect(isHangulJamo('ㄸ')).toBe(true);
      expect(isHangulJamo('ㅃ')).toBe(true);
      expect(isHangulJamo('ㅆ')).toBe(true);
      expect(isHangulJamo('ㅉ')).toBe(true);
    });
  });

  describe('getChosung', () => {
    it('extracts chosung from Korean syllables', () => {
      expect(getChosung('가')).toBe('ㄱ');
      expect(getChosung('나')).toBe('ㄴ');
      expect(getChosung('다')).toBe('ㄷ');
      expect(getChosung('라')).toBe('ㄹ');
      expect(getChosung('마')).toBe('ㅁ');
      expect(getChosung('바')).toBe('ㅂ');
      expect(getChosung('사')).toBe('ㅅ');
      expect(getChosung('아')).toBe('ㅇ');
      expect(getChosung('자')).toBe('ㅈ');
      expect(getChosung('차')).toBe('ㅊ');
      expect(getChosung('카')).toBe('ㅋ');
      expect(getChosung('타')).toBe('ㅌ');
      expect(getChosung('파')).toBe('ㅍ');
      expect(getChosung('하')).toBe('ㅎ');
    });

    it('handles syllables with different jungseong and jongseong', () => {
      expect(getChosung('설')).toBe('ㅅ');
      expect(getChosung('정')).toBe('ㅈ');
      expect(getChosung('대')).toBe('ㄷ');
      expect(getChosung('화')).toBe('ㅎ');
      expect(getChosung('검')).toBe('ㄱ');
      expect(getChosung('색')).toBe('ㅅ');
    });

    it('handles double-consonant chosung', () => {
      expect(getChosung('까')).toBe('ㄲ');
      expect(getChosung('따')).toBe('ㄸ');
      expect(getChosung('빠')).toBe('ㅃ');
      expect(getChosung('싸')).toBe('ㅆ');
      expect(getChosung('짜')).toBe('ㅉ');
    });

    it('returns non-syllable characters as-is', () => {
      expect(getChosung('A')).toBe('A');
      expect(getChosung('1')).toBe('1');
      expect(getChosung('ㄱ')).toBe('ㄱ');
      expect(getChosung(' ')).toBe(' ');
      expect(getChosung('!')).toBe('!');
    });
  });

  describe('extractChosung', () => {
    it('extracts chosung from Korean words', () => {
      expect(extractChosung('설정')).toBe('ㅅㅈ');
      expect(extractChosung('대화')).toBe('ㄷㅎ');
      expect(extractChosung('검색')).toBe('ㄱㅅ');
      expect(extractChosung('명령어')).toBe('ㅁㄹㅇ');
    });

    it('preserves spaces and non-Korean characters', () => {
      expect(extractChosung('대화 목록')).toBe('ㄷㅎ ㅁㄹ');
      expect(extractChosung('새 대화')).toBe('ㅅ ㄷㅎ');
    });

    it('handles mixed Korean and Latin characters', () => {
      expect(extractChosung('Hello 세계')).toBe('Hello ㅅㄱ');
      expect(extractChosung('PDF 내보내기')).toBe('PDF ㄴㅂㄴㄱ');
    });

    it('handles empty string', () => {
      expect(extractChosung('')).toBe('');
    });

    it('handles pure Latin text', () => {
      expect(extractChosung('Hello World')).toBe('Hello World');
    });

    it('handles jamo-only input', () => {
      expect(extractChosung('ㅅㅈ')).toBe('ㅅㅈ');
    });
  });

  describe('isChosungQuery', () => {
    it('returns true for jamo-only queries', () => {
      expect(isChosungQuery('ㅅㅈ')).toBe(true);
      expect(isChosungQuery('ㄷㅎ')).toBe(true);
      expect(isChosungQuery('ㄱ')).toBe(true);
      expect(isChosungQuery('ㅁㄹㅇ')).toBe(true);
    });

    it('returns true for jamo with spaces', () => {
      expect(isChosungQuery('ㅅ ㄷㅎ')).toBe(true);
      expect(isChosungQuery('ㄷㅎ ㅁㄹ')).toBe(true);
    });

    it('returns false for Korean syllables', () => {
      expect(isChosungQuery('설정')).toBe(false);
      expect(isChosungQuery('대화')).toBe(false);
    });

    it('returns false for mixed jamo and syllables', () => {
      expect(isChosungQuery('ㅅ정')).toBe(false);
    });

    it('returns false for Latin characters', () => {
      expect(isChosungQuery('abc')).toBe(false);
      expect(isChosungQuery('A')).toBe(false);
    });

    it('returns false for empty string', () => {
      expect(isChosungQuery('')).toBe(false);
    });

    it('returns false for numbers', () => {
      expect(isChosungQuery('123')).toBe(false);
    });

    it('returns true for double consonants', () => {
      expect(isChosungQuery('ㄲ')).toBe(true);
      expect(isChosungQuery('ㅆ')).toBe(true);
    });
  });

  describe('chosungMatch', () => {
    it('matches Korean text by chosung', () => {
      expect(chosungMatch('설정', 'ㅅㅈ')).toBe(true);
      expect(chosungMatch('대화', 'ㄷㅎ')).toBe(true);
      expect(chosungMatch('검색', 'ㄱㅅ')).toBe(true);
      expect(chosungMatch('명령어 팔레트', 'ㅁㄹㅇ')).toBe(true);
    });

    it('matches partial chosung at end of text', () => {
      expect(chosungMatch('새 대화', 'ㄷㅎ')).toBe(true);
      expect(chosungMatch('대화 삭제', 'ㅅㅈ')).toBe(true);
    });

    it('does not match when chosung differs', () => {
      expect(chosungMatch('설정', 'ㄷㅎ')).toBe(false);
      expect(chosungMatch('대화', 'ㅅㅈ')).toBe(false);
    });

    it('falls back to substring match for non-jamo queries', () => {
      expect(chosungMatch('설정', '설')).toBe(true);
      expect(chosungMatch('설정', '정')).toBe(true);
      expect(chosungMatch('Settings', 'set')).toBe(true);
      expect(chosungMatch('Settings', 'SET')).toBe(true);
    });

    it('returns true for empty query', () => {
      expect(chosungMatch('설정', '')).toBe(true);
      expect(chosungMatch('설정', '  ')).toBe(true);
    });

    it('handles mixed-language text with chosung query', () => {
      expect(chosungMatch('PDF 내보내기', 'ㄴㅂㄴㄱ')).toBe(true);
    });

    it('matches with spaces in query', () => {
      expect(chosungMatch('새 대화', 'ㅅ ㄷㅎ')).toBe(true);
    });

    it('case-insensitive for Latin text', () => {
      expect(chosungMatch('Hello World', 'hello')).toBe(true);
      expect(chosungMatch('Hello World', 'HELLO')).toBe(true);
      expect(chosungMatch('Hello World', 'world')).toBe(true);
    });

    it('handles single jamo query', () => {
      expect(chosungMatch('가나다', 'ㄱ')).toBe(true);
      expect(chosungMatch('가나다', 'ㄴ')).toBe(true);
      expect(chosungMatch('가나다', 'ㄷ')).toBe(true);
      expect(chosungMatch('가나다', 'ㅎ')).toBe(false);
    });
  });

  describe('chosungFilter', () => {
    const items = [
      { id: '1', label: '새 대화' },
      { id: '2', label: '설정' },
      { id: '3', label: '검색' },
      { id: '4', label: '대화 삭제' },
      { id: '5', label: '내보내기' },
    ];

    const getLabel = (item: { label: string }) => item.label;

    it('filters by chosung', () => {
      const result = chosungFilter(items, 'ㅅㅈ', getLabel);
      // "설정" = ㅅㅈ, "대화 삭제" contains ㅅㅈ
      expect(result).toHaveLength(2);
      expect(result.map(r => r.label)).toContain('설정');
      expect(result.map(r => r.label)).toContain('대화 삭제');
    });

    it('filters by substring', () => {
      const result = chosungFilter(items, '대화', getLabel);
      expect(result).toHaveLength(2);
      expect(result.map(r => r.label)).toEqual(['새 대화', '대화 삭제']);
    });

    it('returns all items for empty query', () => {
      const result = chosungFilter(items, '', getLabel);
      expect(result).toHaveLength(5);
    });

    it('returns all items for whitespace query', () => {
      const result = chosungFilter(items, '  ', getLabel);
      expect(result).toHaveLength(5);
    });

    it('returns empty array when nothing matches', () => {
      const result = chosungFilter(items, 'ㅎㅎㅎ', getLabel);
      expect(result).toHaveLength(0);
    });

    it('handles single-character chosung filter', () => {
      const result = chosungFilter(items, 'ㄱ', getLabel);
      // "검색" = ㄱㅅ, "내보내기" = ㄴㅂㄴㄱ (contains ㄱ)
      expect(result).toHaveLength(2);
      expect(result.map(r => r.label)).toContain('검색');
      expect(result.map(r => r.label)).toContain('내보내기');
    });

    it('works with string arrays via identity function', () => {
      const strings = ['설정', '검색', '대화'];
      const result = chosungFilter(strings, 'ㅅㅈ', s => s);
      expect(result).toEqual(['설정']);
    });

    it('preserves original item references', () => {
      const result = chosungFilter(items, 'ㅅㅈ', getLabel);
      expect(result[0]).toBe(items[1]);
    });
  });

  describe('edge cases', () => {
    it('handles last syllable in Unicode range (힣)', () => {
      expect(getChosung('힣')).toBe('ㅎ');
      expect(isHangulSyllable('힣')).toBe(true);
    });

    it('handles first syllable in Unicode range (가)', () => {
      expect(getChosung('가')).toBe('ㄱ');
      expect(isHangulSyllable('가')).toBe(true);
    });

    it('handles characters just outside hangul range', () => {
      const beforeHangul = String.fromCharCode(0xAC00 - 1);
      const afterHangul = String.fromCharCode(0xD7A3 + 1);
      expect(isHangulSyllable(beforeHangul)).toBe(false);
      expect(isHangulSyllable(afterHangul)).toBe(false);
    });

    it('handles characters at jamo boundaries', () => {
      const beforeJamo = String.fromCharCode(0x3131 - 1);
      const afterJamo = String.fromCharCode(0x314E + 1);
      expect(isHangulJamo(beforeJamo)).toBe(false);
      expect(isHangulJamo(afterJamo)).toBe(false);
    });

    it('chosungMatch with special characters in text', () => {
      expect(chosungMatch('(설정)', 'ㅅㅈ')).toBe(true);
      expect(chosungMatch('[대화] 목록', 'ㄷㅎ')).toBe(true);
    });

    it('chosungMatch with emoji in text', () => {
      expect(chosungMatch('🔍 검색', 'ㄱㅅ')).toBe(true);
    });

    it('extractChosung with numbers', () => {
      expect(extractChosung('제1장')).toBe('ㅈ1ㅈ');
    });

    it('chosungFilter with empty items array', () => {
      const result = chosungFilter([], 'ㅅㅈ', (s: string) => s);
      expect(result).toEqual([]);
    });
  });
});
