export interface Token {
  type: 'keyword' | 'string' | 'comment' | 'number' | 'punctuation' | 'function' | 'text';
  value: string;
}

const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do',
  'switch', 'case', 'break', 'continue', 'new', 'this', 'class', 'extends', 'import',
  'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'finally', 'throw',
  'typeof', 'instanceof', 'in', 'of', 'true', 'false', 'null', 'undefined', 'void',
  'interface', 'type', 'enum', 'implements', 'readonly', 'as', 'is',
]);

const PYTHON_KEYWORDS = new Set([
  'def', 'class', 'if', 'elif', 'else', 'for', 'while', 'return', 'import', 'from',
  'as', 'try', 'except', 'finally', 'raise', 'with', 'yield', 'lambda', 'pass',
  'break', 'continue', 'and', 'or', 'not', 'in', 'is', 'True', 'False', 'None',
  'async', 'await', 'global', 'nonlocal',
]);

const BASH_KEYWORDS = new Set([
  'if', 'then', 'else', 'elif', 'fi', 'for', 'do', 'done', 'while', 'until',
  'case', 'esac', 'function', 'return', 'exit', 'echo', 'export', 'local',
  'readonly', 'shift', 'source', 'cd', 'ls', 'rm', 'cp', 'mv', 'mkdir', 'grep',
  'sed', 'awk', 'cat', 'chmod', 'sudo', 'apt', 'npm', 'git', 'docker',
]);

function getKeywords(language: string): Set<string> {
  switch (language) {
    case 'javascript':
    case 'js':
    case 'typescript':
    case 'ts':
    case 'jsx':
    case 'tsx':
      return JS_KEYWORDS;
    case 'python':
    case 'py':
      return PYTHON_KEYWORDS;
    case 'bash':
    case 'sh':
    case 'shell':
    case 'zsh':
      return BASH_KEYWORDS;
    default:
      return JS_KEYWORDS;
  }
}

function isJsonLike(lang: string): boolean {
  return lang === 'json' || lang === 'jsonc';
}

function isCssLike(lang: string): boolean {
  return lang === 'css' || lang === 'scss' || lang === 'less';
}

export function tokenize(code: string, language: string): Token[] {
  const lang = language.toLowerCase();
  const tokens: Token[] = [];
  let i = 0;

  const keywords = getKeywords(lang);
  const isJson = isJsonLike(lang);
  const isCss = isCssLike(lang);

  // Comment styles
  const hasLineComment = !isJson && !isCss;
  const hasPythonComment = lang === 'python' || lang === 'py';
  const hasBashComment = lang === 'bash' || lang === 'sh' || lang === 'shell' || lang === 'zsh';
  const hasBlockComment = !hasPythonComment && !hasBashComment;

  while (i < code.length) {
    const ch = code[i];

    // Single-line comment: // (JS/TS) or # (Python/Bash)
    if (hasLineComment && !hasPythonComment && !hasBashComment && ch === '/' && code[i + 1] === '/') {
      const start = i;
      while (i < code.length && code[i] !== '\n') i++;
      tokens.push({ type: 'comment', value: code.slice(start, i) });
      continue;
    }

    if ((hasPythonComment || hasBashComment) && ch === '#') {
      const start = i;
      while (i < code.length && code[i] !== '\n') i++;
      tokens.push({ type: 'comment', value: code.slice(start, i) });
      continue;
    }

    // Block comment: /* ... */
    if (hasBlockComment && ch === '/' && code[i + 1] === '*') {
      const start = i;
      i += 2;
      while (i < code.length && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2; // skip */
      tokens.push({ type: 'comment', value: code.slice(start, i) });
      continue;
    }

    // Strings: single, double, backtick
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      const start = i;
      i++;
      while (i < code.length && code[i] !== quote) {
        if (code[i] === '\\') i++; // skip escaped char
        i++;
      }
      if (i < code.length) i++; // skip closing quote
      tokens.push({ type: 'string', value: code.slice(start, i) });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(ch) || (ch === '.' && i + 1 < code.length && /[0-9]/.test(code[i + 1]))) {
      const start = i;
      // Hex: 0x...
      if (ch === '0' && i + 1 < code.length && (code[i + 1] === 'x' || code[i + 1] === 'X')) {
        i += 2;
        while (i < code.length && /[0-9a-fA-F]/.test(code[i])) i++;
      } else {
        while (i < code.length && /[0-9.]/.test(code[i])) i++;
      }
      tokens.push({ type: 'number', value: code.slice(start, i) });
      continue;
    }

    // Words (identifiers / keywords)
    if (/[a-zA-Z_$]/.test(ch)) {
      const start = i;
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) i++;
      const word = code.slice(start, i);

      if (!isJson && !isCss && keywords.has(word)) {
        tokens.push({ type: 'keyword', value: word });
      } else if (!isJson && !isCss && i < code.length && code[i] === '(') {
        tokens.push({ type: 'function', value: word });
      } else {
        tokens.push({ type: 'text', value: word });
      }
      continue;
    }

    // Punctuation
    if (/[{}()\[\];:,.<>+\-*/%=!&|^~?@]/.test(ch)) {
      tokens.push({ type: 'punctuation', value: ch });
      i++;
      continue;
    }

    // Whitespace and other
    const start = i;
    while (i < code.length && !/[a-zA-Z0-9_$"'`{}()\[\];:,.<>+\-*/%=!&|^~?@#/]/.test(code[i])) {
      i++;
    }
    if (i > start) {
      tokens.push({ type: 'text', value: code.slice(start, i) });
    } else {
      // Fallback: advance by one character to avoid infinite loop
      tokens.push({ type: 'text', value: code[i] });
      i++;
    }
  }

  return tokens;
}
