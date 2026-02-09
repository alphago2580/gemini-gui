/**
 * Lightweight LaTeX math renderer.
 * Converts LaTeX math expressions to HTML strings using Unicode symbols.
 * No external dependencies — uses Unicode math characters for rendering.
 */

// Greek letter map (lowercase and uppercase)
const GREEK_LETTERS: Record<string, string> = {
  alpha: '\u03B1', beta: '\u03B2', gamma: '\u03B3', delta: '\u03B4',
  epsilon: '\u03B5', zeta: '\u03B6', eta: '\u03B7', theta: '\u03B8',
  iota: '\u03B9', kappa: '\u03BA', lambda: '\u03BB', mu: '\u03BC',
  nu: '\u03BD', xi: '\u03BE', omicron: '\u03BF', pi: '\u03C0',
  rho: '\u03C1', sigma: '\u03C3', tau: '\u03C4', upsilon: '\u03C5',
  phi: '\u03C6', chi: '\u03C7', psi: '\u03C8', omega: '\u03C9',
  Alpha: '\u0391', Beta: '\u0392', Gamma: '\u0393', Delta: '\u0394',
  Epsilon: '\u0395', Zeta: '\u0396', Eta: '\u0397', Theta: '\u0398',
  Iota: '\u0399', Kappa: '\u039A', Lambda: '\u039B', Mu: '\u039C',
  Nu: '\u039D', Xi: '\u039E', Omicron: '\u039F', Pi: '\u03A0',
  Rho: '\u03A1', Sigma: '\u03A3', Tau: '\u03A4', Upsilon: '\u03A5',
  Phi: '\u03A6', Chi: '\u03A7', Psi: '\u03A8', Omega: '\u03A9',
  varepsilon: '\u03B5', varphi: '\u03C6', varpi: '\u03D6',
  varrho: '\u03F1', varsigma: '\u03C2', vartheta: '\u03D1',
};

// Math symbols map
const MATH_SYMBOLS: Record<string, string> = {
  // Operators
  times: '\u00D7', div: '\u00F7', cdot: '\u22C5', pm: '\u00B1', mp: '\u2213',
  // Relations
  leq: '\u2264', le: '\u2264', geq: '\u2265', ge: '\u2265',
  neq: '\u2260', ne: '\u2260', approx: '\u2248', equiv: '\u2261',
  sim: '\u223C', propto: '\u221D', ll: '\u226A', gg: '\u226B',
  // Arrows
  to: '\u2192', rightarrow: '\u2192', leftarrow: '\u2190',
  Rightarrow: '\u21D2', Leftarrow: '\u21D0',
  leftrightarrow: '\u2194', Leftrightarrow: '\u21D4',
  uparrow: '\u2191', downarrow: '\u2193', mapsto: '\u21A6',
  // Big operators
  sum: '\u2211', prod: '\u220F', int: '\u222B', iint: '\u222C', iiint: '\u222D',
  oint: '\u222E', coprod: '\u2210', bigcup: '\u22C3', bigcap: '\u22C2',
  // Set theory
  in: '\u2208', notin: '\u2209', ni: '\u220B',
  subset: '\u2282', supset: '\u2283', subseteq: '\u2286', supseteq: '\u2287',
  cup: '\u222A', cap: '\u2229', emptyset: '\u2205', varnothing: '\u2205',
  // Logic
  forall: '\u2200', exists: '\u2203', nexists: '\u2204',
  land: '\u2227', lor: '\u2228', neg: '\u00AC', lnot: '\u00AC',
  implies: '\u21D2', iff: '\u21D4',
  // Misc
  infty: '\u221E', partial: '\u2202', nabla: '\u2207',
  hbar: '\u210F', ell: '\u2113', Re: '\u211C', Im: '\u2111',
  aleph: '\u2135', wp: '\u2118',
  // Dots
  ldots: '\u2026', cdots: '\u22EF', vdots: '\u22EE', ddots: '\u22F1',
  dots: '\u2026',
  // Brackets
  langle: '\u27E8', rangle: '\u27E9',
  lceil: '\u2308', rceil: '\u2309',
  lfloor: '\u230A', rfloor: '\u230B',
  // Typography
  quad: '\u2003', qquad: '\u2003\u2003',
  // Others
  star: '\u22C6', circ: '\u2218', bullet: '\u2022',
  dagger: '\u2020', ddagger: '\u2021',
  // Trig and functions are handled separately
};

// Superscript/subscript character maps
const SUPERSCRIPTS: Record<string, string> = {
  '0': '\u2070', '1': '\u00B9', '2': '\u00B2', '3': '\u00B3',
  '4': '\u2074', '5': '\u2075', '6': '\u2076', '7': '\u2077',
  '8': '\u2078', '9': '\u2079', '+': '\u207A', '-': '\u207B',
  '=': '\u207C', '(': '\u207D', ')': '\u207E', 'n': '\u207F',
  'i': '\u2071',
};

const SUBSCRIPTS: Record<string, string> = {
  '0': '\u2080', '1': '\u2081', '2': '\u2082', '3': '\u2083',
  '4': '\u2084', '5': '\u2085', '6': '\u2086', '7': '\u2087',
  '8': '\u2088', '9': '\u2089', '+': '\u208A', '-': '\u208B',
  '=': '\u208C', '(': '\u208D', ')': '\u208E',
  'a': '\u2090', 'e': '\u2091', 'o': '\u2092',
  'i': '\u1D62', 'j': '\u2C7C', 'k': '\u2096',
  'n': '\u2099', 'p': '\u209A', 'r': '\u1D63', 's': '\u209B',
  't': '\u209C', 'x': '\u2093',
};

// Math functions that should be rendered upright (non-italic)
const MATH_FUNCTIONS = [
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'arcsin', 'arccos', 'arctan',
  'sinh', 'cosh', 'tanh',
  'log', 'ln', 'exp',
  'lim', 'sup', 'inf', 'max', 'min',
  'det', 'dim', 'ker', 'deg',
  'gcd', 'hom', 'arg', 'mod',
];

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toSuperscript(text: string): string {
  return text
    .split('')
    .map(ch => SUPERSCRIPTS[ch] || ch)
    .join('');
}

function toSubscript(text: string): string {
  return text
    .split('')
    .map(ch => SUBSCRIPTS[ch] || ch)
    .join('');
}

function extractBraceContent(latex: string, start: number): { content: string; end: number } {
  if (start >= latex.length || latex[start] !== '{') {
    // Single character argument (no braces)
    if (start < latex.length) {
      return { content: latex[start], end: start + 1 };
    }
    return { content: '', end: start };
  }
  let depth = 1;
  let i = start + 1;
  while (i < latex.length && depth > 0) {
    if (latex[i] === '{') depth++;
    else if (latex[i] === '}') depth--;
    i++;
  }
  return { content: latex.slice(start + 1, i - 1), end: i };
}

/**
 * Renders a LaTeX math expression to an HTML string.
 * Uses Unicode math symbols and basic HTML for layout.
 */
export function renderMathToHtml(latex: string): string {
  let result = '';
  let i = 0;

  while (i < latex.length) {
    const ch = latex[i];

    // Backslash commands
    if (ch === '\\') {
      // Extract command name
      let cmd = '';
      let j = i + 1;
      if (j < latex.length && /[a-zA-Z]/.test(latex[j])) {
        while (j < latex.length && /[a-zA-Z]/.test(latex[j])) {
          cmd += latex[j];
          j++;
        }
      } else if (j < latex.length) {
        // Single-char commands like \\ , \{ , \}
        cmd = latex[j];
        j++;
      }

      // Handle special commands
      if (cmd === 'frac') {
        const num = extractBraceContent(latex, j);
        const den = extractBraceContent(latex, num.end);
        const numHtml = renderMathToHtml(num.content);
        const denHtml = renderMathToHtml(den.content);
        result += `<span class="math-frac"><span class="math-frac-num">${numHtml}</span><span class="math-frac-den">${denHtml}</span></span>`;
        i = den.end;
        continue;
      }

      if (cmd === 'sqrt') {
        const arg = extractBraceContent(latex, j);
        const argHtml = renderMathToHtml(arg.content);
        result += `<span class="math-sqrt">\u221A<span class="math-sqrt-content">${argHtml}</span></span>`;
        i = arg.end;
        continue;
      }

      if (cmd === 'text' || cmd === 'mathrm' || cmd === 'textrm') {
        const arg = extractBraceContent(latex, j);
        result += `<span class="math-text">${escapeHtml(arg.content)}</span>`;
        i = arg.end;
        continue;
      }

      if (cmd === 'mathbf' || cmd === 'textbf' || cmd === 'bf') {
        const arg = extractBraceContent(latex, j);
        const argHtml = renderMathToHtml(arg.content);
        result += `<span class="math-bold">${argHtml}</span>`;
        i = arg.end;
        continue;
      }

      if (cmd === 'overline' || cmd === 'bar') {
        const arg = extractBraceContent(latex, j);
        const argHtml = renderMathToHtml(arg.content);
        result += `<span class="math-overline">${argHtml}</span>`;
        i = arg.end;
        continue;
      }

      if (cmd === 'hat') {
        const arg = extractBraceContent(latex, j);
        const argHtml = renderMathToHtml(arg.content);
        result += `${argHtml}\u0302`;
        i = arg.end;
        continue;
      }

      if (cmd === 'vec') {
        const arg = extractBraceContent(latex, j);
        const argHtml = renderMathToHtml(arg.content);
        result += `${argHtml}\u20D7`;
        i = arg.end;
        continue;
      }

      if (cmd === 'left' || cmd === 'right') {
        // Skip \left and \right, just render the delimiter
        i = j;
        continue;
      }

      if (cmd === '\\') {
        result += '<br/>';
        i = j;
        continue;
      }

      if (cmd === ' ' || cmd === ',') {
        result += cmd === ',' ? '\u2009' : '\u2003';
        i = j;
        continue;
      }

      if (cmd === '{') {
        result += '{';
        i = j;
        continue;
      }

      if (cmd === '}') {
        result += '}';
        i = j;
        continue;
      }

      // Check Greek letters
      if (GREEK_LETTERS[cmd]) {
        result += GREEK_LETTERS[cmd];
        i = j;
        continue;
      }

      // Check math symbols
      if (MATH_SYMBOLS[cmd]) {
        result += MATH_SYMBOLS[cmd];
        i = j;
        continue;
      }

      // Check math functions (sin, cos, etc.)
      if (MATH_FUNCTIONS.includes(cmd)) {
        result += `<span class="math-func">${cmd}</span>`;
        i = j;
        continue;
      }

      // Unknown command — render as-is
      result += escapeHtml('\\' + cmd);
      i = j;
      continue;
    }

    // Superscript
    if (ch === '^') {
      const arg = extractBraceContent(latex, i + 1);
      const argText = arg.content;
      // Try Unicode superscripts for simple cases
      const allMappable = argText.split('').every(c => c in SUPERSCRIPTS);
      if (allMappable && argText.length > 0) {
        result += toSuperscript(argText);
      } else {
        const argHtml = renderMathToHtml(argText);
        result += `<sup class="math-sup">${argHtml}</sup>`;
      }
      i = arg.end;
      continue;
    }

    // Subscript
    if (ch === '_') {
      const arg = extractBraceContent(latex, i + 1);
      const argText = arg.content;
      // Try Unicode subscripts for simple cases
      const allMappable = argText.split('').every(c => c in SUBSCRIPTS);
      if (allMappable && argText.length > 0) {
        result += toSubscript(argText);
      } else {
        const argHtml = renderMathToHtml(argText);
        result += `<sub class="math-sub">${argHtml}</sub>`;
      }
      i = arg.end;
      continue;
    }

    // Braces group
    if (ch === '{') {
      const arg = extractBraceContent(latex, i);
      result += renderMathToHtml(arg.content);
      i = arg.end;
      continue;
    }

    // Tilde (space in math mode)
    if (ch === '~') {
      result += '\u00A0';
      i++;
      continue;
    }

    // Normal character
    result += escapeHtml(ch);
    i++;
  }

  return result;
}

/**
 * Check if a string contains LaTeX math delimiters.
 */
export function containsMath(text: string): boolean {
  return /\$\$[\s\S]+?\$\$|\$[^\s$][^$]*?\$/.test(text);
}

/**
 * Split text into segments of plain text and math expressions.
 */
export interface MathSegment {
  type: 'text' | 'inline-math' | 'block-math';
  content: string;
}

export function parseMathSegments(text: string): MathSegment[] {
  const segments: MathSegment[] = [];
  // Match block math ($$...$$) and inline math ($...$)
  // Block math first to avoid matching $$ as two inline $
  const regex = /(\$\$[\s\S]+?\$\$)|(\$[^\s$][^$]*?\$)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Add preceding text
    if (match.index > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      // Block math: $$...$$
      segments.push({ type: 'block-math', content: match[1].slice(2, -2).trim() });
    } else if (match[2]) {
      // Inline math: $...$
      segments.push({ type: 'inline-math', content: match[2].slice(1, -1) });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add trailing text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}
