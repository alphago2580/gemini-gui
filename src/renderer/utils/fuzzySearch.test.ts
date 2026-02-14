import {
  getChoseong,
  extractChoseong,
  fuzzyMatch,
  fuzzySearch,
  fuzzySearchBy,
} from './fuzzySearch';

describe('getChoseong', () => {
  it('extracts initial consonant from Hangul syllable', () => {
    expect(getChoseong('가')).toBe('ㄱ');
    expect(getChoseong('나')).toBe('ㄴ');
    expect(getChoseong('다')).toBe('ㄷ');
    expect(getChoseong('설')).toBe('ㅅ');
    expect(getChoseong('정')).toBe('ㅈ');
    expect(getChoseong('한')).toBe('ㅎ');
  });

  it('returns original character for non-Hangul', () => {
    expect(getChoseong('a')).toBe('a');
    expect(getChoseong('Z')).toBe('Z');
    expect(getChoseong('1')).toBe('1');
    expect(getChoseong(' ')).toBe(' ');
  });

  it('returns original character for Jamo consonants', () => {
    expect(getChoseong('ㄱ')).toBe('ㄱ');
    expect(getChoseong('ㅎ')).toBe('ㅎ');
  });

  it('handles double consonant syllables', () => {
    expect(getChoseong('까')).toBe('ㄲ');
    expect(getChoseong('빠')).toBe('ㅃ');
    expect(getChoseong('싸')).toBe('ㅆ');
  });
});

describe('extractChoseong', () => {
  it('extracts all initial consonants from Korean text', () => {
    expect(extractChoseong('설정')).toBe('ㅅㅈ');
    expect(extractChoseong('대화')).toBe('ㄷㅎ');
    expect(extractChoseong('새 대화')).toBe('ㅅ ㄷㅎ');
    expect(extractChoseong('검색')).toBe('ㄱㅅ');
  });

  it('passes through non-Korean characters', () => {
    expect(extractChoseong('Hello')).toBe('Hello');
    expect(extractChoseong('Hello 세계')).toBe('Hello ㅅㄱ');
  });

  it('handles empty string', () => {
    expect(extractChoseong('')).toBe('');
  });
});

describe('fuzzyMatch', () => {
  describe('Latin fuzzy matching', () => {
    it('matches exact string', () => {
      const result = fuzzyMatch('settings', 'settings');
      expect(result).not.toBeNull();
      expect(result!.score).toBeGreaterThan(0.5);
    });

    it('matches subsequence', () => {
      const result = fuzzyMatch('settings', 'stg');
      expect(result).not.toBeNull();
      expect(result!.matchedIndices).toEqual([0, 2, 6]);
    });

    it('is case-insensitive', () => {
      const result = fuzzyMatch('Settings', 'set');
      expect(result).not.toBeNull();
      expect(result!.matchedIndices).toEqual([0, 1, 2]);
    });

    it('returns null for non-matching query', () => {
      expect(fuzzyMatch('settings', 'xyz')).toBeNull();
    });

    it('matches empty query', () => {
      const result = fuzzyMatch('anything', '');
      expect(result).not.toBeNull();
      expect(result!.score).toBe(1);
    });

    it('returns null for empty target with non-empty query', () => {
      expect(fuzzyMatch('', 'a')).toBeNull();
    });

    it('returns match with score for empty query and empty target', () => {
      const result = fuzzyMatch('', '');
      expect(result).not.toBeNull();
    });
  });

  describe('Korean 초성 matching', () => {
    it('matches Korean text with 초성 query', () => {
      const result = fuzzyMatch('설정', 'ㅅㅈ');
      expect(result).not.toBeNull();
      expect(result!.matchedIndices).toEqual([0, 1]);
    });

    it('matches single 초성', () => {
      const result = fuzzyMatch('설정', 'ㅅ');
      expect(result).not.toBeNull();
      expect(result!.matchedIndices).toEqual([0]);
    });

    it('matches 초성 with spaces in target', () => {
      const result = fuzzyMatch('새 대화', 'ㅅㄷ');
      expect(result).not.toBeNull();
    });

    it('returns null for non-matching 초성', () => {
      expect(fuzzyMatch('설정', 'ㄱㅈ')).toBeNull();
    });

    it('matches longer Korean strings', () => {
      const result = fuzzyMatch('키보드 단축키', 'ㅋㅂㄷ');
      expect(result).not.toBeNull();
      expect(result!.matchedIndices).toEqual([0, 1, 2]);
    });

    it('handles double consonant 초성', () => {
      const result = fuzzyMatch('빠른', 'ㅃ');
      expect(result).not.toBeNull();
      expect(result!.matchedIndices).toEqual([0]);
    });
  });

  describe('scoring', () => {
    it('scores consecutive matches higher', () => {
      const consecutive = fuzzyMatch('abcdef', 'abc');
      const scattered = fuzzyMatch('axbxcx', 'abc');
      expect(consecutive).not.toBeNull();
      expect(scattered).not.toBeNull();
      expect(consecutive!.score).toBeGreaterThan(scattered!.score);
    });

    it('scores start-of-string matches higher', () => {
      const startMatch = fuzzyMatch('abc', 'a');
      const midMatch = fuzzyMatch('xax', 'a');
      expect(startMatch).not.toBeNull();
      expect(midMatch).not.toBeNull();
      expect(startMatch!.score).toBeGreaterThan(midMatch!.score);
    });

    it('scores shorter targets higher', () => {
      const shortTarget = fuzzyMatch('set', 'se');
      const longTarget = fuzzyMatch('settings panel', 'se');
      expect(shortTarget).not.toBeNull();
      expect(longTarget).not.toBeNull();
      expect(shortTarget!.score).toBeGreaterThan(longTarget!.score);
    });
  });
});

describe('fuzzySearch', () => {
  it('searches and ranks string array', () => {
    const items = ['settings', 'search', 'save', 'delete'];
    const results = fuzzySearch(items, 'se');
    expect(results.length).toBe(3); // "settings", "search", and "save" (s..e)
    expect(results.map(r => r.item)).toContain('settings');
    expect(results.map(r => r.item)).toContain('search');
    expect(results.map(r => r.item)).toContain('save');
  });

  it('returns all items for empty query', () => {
    const items = ['a', 'b', 'c'];
    const results = fuzzySearch(items, '');
    expect(results.length).toBe(3);
  });

  it('returns empty array when nothing matches', () => {
    const items = ['apple', 'banana', 'cherry'];
    const results = fuzzySearch(items, 'xyz');
    expect(results.length).toBe(0);
  });

  it('sorts by score descending', () => {
    const items = ['abcdef', 'abc', 'axbxcx'];
    const results = fuzzySearch(items, 'abc');
    // "abc" should score highest (exact), then "abcdef" (consecutive start)
    expect(results[0].item).toBe('abc');
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });

  it('supports Korean 초성 search', () => {
    const items = ['설정', '새 대화', '검색', '저장'];
    const results = fuzzySearch(items, 'ㅅ');
    // "설정" and "새 대화" start with ㅅ
    expect(results.map(r => r.item)).toContain('설정');
    expect(results.map(r => r.item)).toContain('새 대화');
  });

  it('matches specific 초성 combinations', () => {
    const items = ['설정', '새 대화', '검색', '저장'];
    const results = fuzzySearch(items, 'ㅅㅈ');
    expect(results.length).toBe(1);
    expect(results[0].item).toBe('설정');
  });
});

describe('fuzzySearchBy', () => {
  interface Command {
    id: string;
    label: string;
  }

  const commands: Command[] = [
    { id: 'settings', label: '설정' },
    { id: 'new-chat', label: '새 대화' },
    { id: 'search', label: '검색' },
    { id: 'clear', label: '지우기' },
  ];

  it('searches by extracted key', () => {
    const results = fuzzySearchBy(commands, 'ㅅㅈ', c => c.label);
    expect(results.length).toBe(1);
    expect(results[0].item.id).toBe('settings');
  });

  it('returns all items for empty query', () => {
    const results = fuzzySearchBy(commands, '', c => c.label);
    expect(results.length).toBe(4);
  });

  it('searches by id field', () => {
    const results = fuzzySearchBy(commands, 'set', c => c.id);
    expect(results.length).toBe(1);
    expect(results[0].item.id).toBe('settings');
  });

  it('returns empty array when nothing matches', () => {
    const results = fuzzySearchBy(commands, 'ㅃㅃ', c => c.label);
    expect(results.length).toBe(0);
  });

  it('sorts results by score', () => {
    const results = fuzzySearchBy(commands, 'ㅅ', c => c.label);
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeLessThanOrEqual(results[i - 1].score);
    }
  });
});
