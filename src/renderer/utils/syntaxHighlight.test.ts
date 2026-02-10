import { describe, it, expect } from 'vitest';
import { tokenize, Token } from './syntaxHighlight';

function tokenTypes(tokens: Token[]): string[] {
  return tokens.map(t => t.type);
}

function tokenValues(tokens: Token[]): string[] {
  return tokens.map(t => t.value);
}

describe('syntaxHighlight', () => {
  describe('tokenize', () => {
    it('tokenizes JavaScript keywords', () => {
      const tokens = tokenize('const x = 5', 'javascript');
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'const' });
    });

    it('tokenizes strings with double quotes', () => {
      const tokens = tokenize('"hello world"', 'js');
      expect(tokens[0]).toEqual({ type: 'string', value: '"hello world"' });
    });

    it('tokenizes strings with single quotes', () => {
      const tokens = tokenize("'hello'", 'js');
      expect(tokens[0]).toEqual({ type: 'string', value: "'hello'" });
    });

    it('tokenizes template literals', () => {
      const tokens = tokenize('`hello ${name}`', 'js');
      expect(tokens[0].type).toBe('string');
      expect(tokens[0].value).toContain('hello');
    });

    it('tokenizes numbers', () => {
      const tokens = tokenize('42', 'js');
      expect(tokens[0]).toEqual({ type: 'number', value: '42' });
    });

    it('tokenizes hex numbers', () => {
      const tokens = tokenize('0xFF', 'js');
      expect(tokens[0]).toEqual({ type: 'number', value: '0xFF' });
    });

    it('tokenizes decimal numbers', () => {
      const tokens = tokenize('3.14', 'js');
      expect(tokens[0]).toEqual({ type: 'number', value: '3.14' });
    });

    it('tokenizes single-line comments in JS', () => {
      const tokens = tokenize('// a comment', 'js');
      expect(tokens[0]).toEqual({ type: 'comment', value: '// a comment' });
    });

    it('tokenizes block comments', () => {
      const tokens = tokenize('/* block */', 'js');
      expect(tokens[0]).toEqual({ type: 'comment', value: '/* block */' });
    });

    it('tokenizes function calls', () => {
      const tokens = tokenize('foo()', 'js');
      expect(tokens[0]).toEqual({ type: 'function', value: 'foo' });
    });

    it('tokenizes punctuation', () => {
      const tokens = tokenize('{}()', 'js');
      const types = tokenTypes(tokens);
      expect(types).toEqual(['punctuation', 'punctuation', 'punctuation', 'punctuation']);
    });

    it('handles complete JS code', () => {
      const code = 'const sum = (a, b) => a + b;';
      const tokens = tokenize(code, 'javascript');
      const values = tokenValues(tokens);
      expect(values.join('')).toBe(code);
    });

    it('handles Python keywords', () => {
      const tokens = tokenize('def foo():', 'python');
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'def' });
    });

    it('handles Python comments', () => {
      const tokens = tokenize('# comment', 'python');
      expect(tokens[0]).toEqual({ type: 'comment', value: '# comment' });
    });

    it('handles TypeScript', () => {
      const tokens = tokenize('interface Foo {}', 'ts');
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'interface' });
    });

    it('handles Bash keywords', () => {
      const tokens = tokenize('if [ -f file ]; then', 'bash');
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'if' });
    });

    it('handles Bash comments', () => {
      const tokens = tokenize('# bash comment', 'bash');
      expect(tokens[0]).toEqual({ type: 'comment', value: '# bash comment' });
    });

    it('handles JSON (no keywords)', () => {
      const tokens = tokenize('{ "key": 123 }', 'json');
      // JSON should not have keyword tokens
      const keywordTokens = tokens.filter(t => t.type === 'keyword');
      expect(keywordTokens).toHaveLength(0);
      // Should have string and number
      const stringTokens = tokens.filter(t => t.type === 'string');
      expect(stringTokens).toHaveLength(1);
      const numberTokens = tokens.filter(t => t.type === 'number');
      expect(numberTokens).toHaveLength(1);
    });

    it('handles escaped strings', () => {
      const tokens = tokenize('"hello \\"world\\""', 'js');
      expect(tokens[0].type).toBe('string');
    });

    it('preserves original code when joined', () => {
      const code = 'function greet(name) {\n  return `Hello, ${name}!`;\n}';
      const tokens = tokenize(code, 'javascript');
      const reconstructed = tokenValues(tokens).join('');
      expect(reconstructed).toBe(code);
    });

    it('handles empty input', () => {
      const tokens = tokenize('', 'js');
      expect(tokens).toHaveLength(0);
    });

    it('handles unknown language with JS fallback', () => {
      const tokens = tokenize('const x = 1', 'unknown');
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'const' });
    });

    it('handles CSS language (no keywords, no line comments)', () => {
      const tokens = tokenize('.class { color: red; }', 'css');
      const keywordTokens = tokens.filter(t => t.type === 'keyword');
      expect(keywordTokens).toHaveLength(0);
    });

    it('handles SCSS language same as CSS', () => {
      const tokens = tokenize('$var: 10px;', 'scss');
      const keywordTokens = tokens.filter(t => t.type === 'keyword');
      expect(keywordTokens).toHaveLength(0);
    });

    it('handles block comments in CSS', () => {
      const tokens = tokenize('/* comment */ .x {}', 'css');
      const comments = tokens.filter(t => t.type === 'comment');
      expect(comments).toHaveLength(1);
      expect(comments[0].value).toBe('/* comment */');
    });

    it('handles jsonc the same as json', () => {
      const tokens = tokenize('{ "key": true }', 'jsonc');
      const keywordTokens = tokens.filter(t => t.type === 'keyword');
      expect(keywordTokens).toHaveLength(0);
    });

    it('handles shell alias for bash', () => {
      const tokens = tokenize('echo hello', 'shell');
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'echo' });
    });

    it('handles zsh alias for bash', () => {
      const tokens = tokenize('export PATH', 'zsh');
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'export' });
    });

    it('tokenizes decimal starting with dot', () => {
      const tokens = tokenize('.5', 'js');
      expect(tokens[0]).toEqual({ type: 'number', value: '.5' });
    });

    it('handles py alias for Python', () => {
      const tokens = tokenize('def main():', 'py');
      expect(tokens[0]).toEqual({ type: 'keyword', value: 'def' });
    });

    it('handles tsx and jsx aliases', () => {
      const tsxTokens = tokenize('const x = 1', 'tsx');
      expect(tsxTokens[0]).toEqual({ type: 'keyword', value: 'const' });
      const jsxTokens = tokenize('const y = 2', 'jsx');
      expect(jsxTokens[0]).toEqual({ type: 'keyword', value: 'const' });
    });

    it('handles LESS language same as CSS', () => {
      const tokens = tokenize('@var: 10px;', 'less');
      const keywordTokens = tokens.filter(t => t.type === 'keyword');
      expect(keywordTokens).toHaveLength(0);
    });
  });
});
