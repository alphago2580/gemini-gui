/**
 * Auto-detect programming language from code content using heuristic pattern matching.
 * Used when code blocks have no explicit language tag.
 */

interface LanguagePattern {
  /** Regex patterns that strongly indicate this language */
  strong: RegExp[];
  /** Regex patterns that weakly suggest this language */
  weak: RegExp[];
  /** Keywords unique or characteristic to this language */
  keywords: string[];
}

const LANGUAGE_PATTERNS: Record<string, LanguagePattern> = {
  typescript: {
    strong: [
      /\binterface\s+\w+\s*\{/,
      /\btype\s+\w+\s*=\s*/,
      /:\s*(string|number|boolean|void|never|unknown|any)\b/,
      /\w+\s*<\w+>/,
      /\bas\s+(string|number|boolean|any|unknown)\b/,
      /\benum\s+\w+/,
    ],
    weak: [
      /\bconst\s+\w+\s*:/,
      /\bexport\s+(interface|type|enum)\b/,
      /\bReadonly<|Partial<|Record<|Pick<|Omit</,
    ],
    keywords: ['interface', 'type', 'enum', 'readonly', 'as', 'implements', 'declare', 'namespace'],
  },
  javascript: {
    strong: [
      /\bconst\s+\w+\s*=\s*(require|function)/,
      /\bmodule\.exports\b/,
      /\bconsole\.(log|error|warn)\b/,
      /\bdocument\.(getElementById|querySelector)/,
      /=>\s*\{/,
    ],
    weak: [
      /\blet\s+\w+\s*=/,
      /\bconst\s+\w+\s*=/,
      /\bfunction\s+\w+\s*\(/,
      /\basync\s+function\b/,
      /\bawait\s+/,
    ],
    keywords: ['const', 'let', 'var', 'function', 'async', 'await', 'import', 'export', 'require'],
  },
  python: {
    strong: [
      /\bdef\s+\w+\s*\(/,
      /\bclass\s+\w+(\(.*\))?:/,
      /\bimport\s+\w+/,
      /\bfrom\s+\w+\s+import\b/,
      /\bif\s+__name__\s*==\s*['"]__main__['"]/,
      /\bprint\s*\(/,
    ],
    weak: [
      /\belif\b/,
      /\bself\.\w+/,
      /\bNone\b/,
      /\bTrue\b/,
      /\bFalse\b/,
      /:\s*$/m,
    ],
    keywords: ['def', 'elif', 'self', 'None', 'True', 'False', 'lambda', 'yield', 'nonlocal', 'global'],
  },
  java: {
    strong: [
      /\bpublic\s+(static\s+)?class\s+\w+/,
      /\bpublic\s+static\s+void\s+main\b/,
      /\bSystem\.out\.println\b/,
      /\bimport\s+java\./,
      /\bextends\s+\w+\s*(implements)?/,
    ],
    weak: [
      /\bprivate\s+(final\s+)?\w+\s+\w+/,
      /\bprotected\s+\w+/,
      /\b@Override\b/,
      /\bnew\s+\w+\s*\(/,
      /\bthrows\s+\w+/,
    ],
    keywords: ['public', 'private', 'protected', 'static', 'void', 'final', 'abstract', 'throws'],
  },
  rust: {
    strong: [
      /\bfn\s+\w+\s*\(/,
      /\blet\s+mut\s+\w+/,
      /\bimpl\s+\w+/,
      /\bpub\s+(fn|struct|enum|mod)\b/,
      /\bmatch\s+\w+\s*\{/,
      /->\s*(i32|u32|f64|bool|String|&str|Vec<|Option<|Result<)/,
    ],
    weak: [
      /\buse\s+std::/,
      /\bprintln!\s*\(/,
      /\bvec!\s*\[/,
      /\bunwrap\(\)/,
      /&self/,
    ],
    keywords: ['fn', 'mut', 'impl', 'pub', 'mod', 'crate', 'trait', 'struct', 'enum', 'match', 'unwrap'],
  },
  go: {
    strong: [
      /\bfunc\s+(\(\w+\s+\*?\w+\)\s+)?\w+\s*\(/,
      /\bpackage\s+\w+/,
      /\bimport\s+\(/,
      /\bfmt\.(Println|Printf|Sprintf)\b/,
      /:=\s*/,
    ],
    weak: [
      /\bgo\s+func\b/,
      /\bdefer\s+/,
      /\bchan\s+\w+/,
      /\bgoroutine\b/,
      /\binterface\s*\{\}/,
    ],
    keywords: ['func', 'package', 'defer', 'goroutine', 'chan', 'select', 'go'],
  },
  html: {
    strong: [
      /<!DOCTYPE\s+html>/i,
      /<html[\s>]/i,
      /<head[\s>]/i,
      /<body[\s>]/i,
      /<div[\s>]/i,
    ],
    weak: [
      /<\/\w+>/,
      /<\w+\s+class=/,
      /<\w+\s+id=/,
      /<script[\s>]/i,
      /<style[\s>]/i,
    ],
    keywords: [],
  },
  css: {
    strong: [
      /\.\w+\s*\{[^}]*\}/,
      /#\w+\s*\{/,
      /@media\s+/,
      /@keyframes\s+/,
      /\bbackground-color\s*:/,
    ],
    weak: [
      /\bmargin\s*:/,
      /\bpadding\s*:/,
      /\bdisplay\s*:\s*(flex|grid|block|inline|none)\b/,
      /\bfont-size\s*:/,
      /\bcolor\s*:/,
    ],
    keywords: [],
  },
  json: {
    strong: [
      /^\s*\{\s*"\w+":/m,
      /^\s*\[\s*\{/m,
    ],
    weak: [
      /"\w+"\s*:\s*"/,
      /"\w+"\s*:\s*\d/,
      /"\w+"\s*:\s*(true|false|null)/,
    ],
    keywords: [],
  },
  bash: {
    strong: [
      /^#!\s*\/bin\/(bash|sh|zsh)/m,
      /\bif\s+\[\s+/,
      /\bfi\b/,
      /\besac\b/,
      /\$\(\s*\w+/,
    ],
    weak: [
      /\becho\s+/,
      /\bexport\s+\w+=/,
      /\|\s*grep\b/,
      /\$\{\w+\}/,
      /\bsudo\s+/,
    ],
    keywords: ['fi', 'esac', 'done', 'then', 'elif'],
  },
  sql: {
    strong: [
      /\bSELECT\s+.+\s+FROM\b/i,
      /\bCREATE\s+TABLE\b/i,
      /\bINSERT\s+INTO\b/i,
      /\bALTER\s+TABLE\b/i,
      /\bDROP\s+TABLE\b/i,
    ],
    weak: [
      /\bWHERE\s+\w+\s*(=|>|<|LIKE|IN)\b/i,
      /\bJOIN\s+\w+\s+ON\b/i,
      /\bGROUP\s+BY\b/i,
      /\bORDER\s+BY\b/i,
      /\bLIMIT\s+\d+/i,
    ],
    keywords: ['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER'],
  },
  yaml: {
    strong: [
      /^\w+:\s*$/m,
      /^\s+-\s+\w+:/m,
      /^\w+:\s*\n\s+\w+:/m,
    ],
    weak: [
      /^---\s*$/m,
      /^\s+\w+:\s+\S+/m,
    ],
    keywords: [],
  },
};

/** Strong pattern match = 3 points, weak = 1 point, keyword = 1 point each */
const STRONG_WEIGHT = 3;
const WEAK_WEIGHT = 1;
const KEYWORD_WEIGHT = 1;

/**
 * Detect the programming language of a code snippet.
 * Returns the best-guess language string, or empty string if confidence is too low.
 *
 * @param code - The source code to analyze
 * @param minScore - Minimum score threshold to return a language (default: 3)
 * @returns Detected language identifier or empty string
 */
export function detectCodeLanguage(code: string, minScore: number = 3): string {
  if (!code || !code.trim()) return '';

  const scores: Record<string, number> = {};

  for (const [language, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    let score = 0;

    for (const pattern of patterns.strong) {
      if (pattern.test(code)) {
        score += STRONG_WEIGHT;
      }
    }

    for (const pattern of patterns.weak) {
      if (pattern.test(code)) {
        score += WEAK_WEIGHT;
      }
    }

    // Check keywords by splitting code into words
    if (patterns.keywords.length > 0) {
      const words = new Set(code.split(/\W+/));
      for (const keyword of patterns.keywords) {
        if (words.has(keyword)) {
          score += KEYWORD_WEIGHT;
        }
      }
    }

    if (score > 0) {
      scores[language] = score;
    }
  }

  // Find the language with the highest score
  let bestLanguage = '';
  let bestScore = 0;

  for (const [language, score] of Object.entries(scores)) {
    if (score > bestScore) {
      bestScore = score;
      bestLanguage = language;
    }
  }

  // Disambiguate: TypeScript is a superset of JavaScript, so if both score above threshold,
  // prefer TypeScript — any TS-specific pattern means the code is likely TS
  if (bestLanguage === 'javascript' && scores['typescript'] && scores['typescript'] >= minScore) {
    bestLanguage = 'typescript';
    bestScore = scores['typescript'];
  }

  return bestScore >= minScore ? bestLanguage : '';
}
