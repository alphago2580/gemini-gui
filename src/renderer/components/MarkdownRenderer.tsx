import React, { useState, useCallback, useMemo } from 'react';
import SearchHighlight from './SearchHighlight';
import './MarkdownRenderer.css';
import { tokenize } from '../utils/syntaxHighlight';
import { renderMathToHtml } from '../utils/mathRenderer';
import { detectCodeLanguage } from '../utils/detectCodeLanguage';
import * as S from '../constants/strings';

export interface MarkdownRendererProps {
  content: string;
  /** Optional search query to highlight matches in text */
  searchQuery?: string;
  /** Index of the active match within this message (0-based) */
  searchActiveMatchIndex?: number;
}

interface ParsedBlock {
  type: 'code-block' | 'paragraph' | 'math-block';
  content: string;
  language?: string;
}

function parseBlocks(text: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const codeMatch = line.match(/^```(\w*)/);

    if (codeMatch) {
      const language = codeMatch[1] || '';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].match(/^```\s*$/)) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: 'code-block',
        content: codeLines.join('\n'),
        language,
      });
      i++; // skip closing ```
    } else if (line.trim().startsWith('$$')) {
      // Block math: $$ on its own line
      const mathLines: string[] = [];
      const firstLineContent = line.trim().slice(2);
      if (firstLineContent.endsWith('$$')) {
        // Single-line block math: $$ ... $$
        blocks.push({
          type: 'math-block',
          content: firstLineContent.slice(0, -2).trim(),
        });
        i++;
      } else {
        if (firstLineContent) mathLines.push(firstLineContent);
        i++;
        while (i < lines.length && !lines[i].trim().endsWith('$$')) {
          mathLines.push(lines[i]);
          i++;
        }
        if (i < lines.length) {
          const lastLine = lines[i].trim();
          const lastContent = lastLine.slice(0, -2);
          if (lastContent) mathLines.push(lastContent);
          i++; // skip closing $$
        }
        blocks.push({
          type: 'math-block',
          content: mathLines.join('\n').trim(),
        });
      }
    } else {
      // Collect consecutive non-code, non-math lines into a paragraph block
      const paraLines: string[] = [];
      while (i < lines.length && !lines[i].match(/^```/) && !lines[i].trim().startsWith('$$')) {
        paraLines.push(lines[i]);
        i++;
      }
      const content = paraLines.join('\n');
      if (content.trim()) {
        blocks.push({ type: 'paragraph', content });
      }
    }
  }

  return blocks;
}

interface SearchContext {
  query: string;
  activeMatchIndex?: number;
}

function renderTextWithHighlight(text: string, searchCtx: SearchContext | null, key: number): React.ReactNode {
  if (!searchCtx || !searchCtx.query) {
    return text;
  }
  return (
    <SearchHighlight
      key={`sh-${key}`}
      text={text}
      query={searchCtx.query}
      activeMatchIndex={searchCtx.activeMatchIndex}
    />
  );
}

function renderInlineMarkdown(text: string, searchCtx: SearchContext | null = null): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Match: inline math, inline code, bold, italic, links
  // Order matters: bold before italic (** before *), inline math before others
  const regex = /(\$[^\s$][^$]*?\$)|(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    // Add plain text before this match
    if (match.index > lastIndex) {
      nodes.push(renderTextWithHighlight(text.slice(lastIndex, match.index), searchCtx, key++));
    }

    const full = match[0];
    if (match[1]) {
      // Inline math: $...$
      const mathContent = full.slice(1, -1);
      const html = renderMathToHtml(mathContent);
      nodes.push(
        <span
          key={key++}
          className="math-inline"
          aria-label={`${S.MATH_FORMULA_PREFIX} ${mathContent}`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } else if (match[2]) {
      // Inline code: `code`
      nodes.push(
        <code key={key++} className="md-inline-code">
          {full.slice(1, -1)}
        </code>
      );
    } else if (match[3]) {
      // Bold: **text**
      nodes.push(
        <strong key={key++}>{full.slice(2, -2)}</strong>
      );
    } else if (match[4]) {
      // Italic: *text*
      nodes.push(
        <em key={key++}>{full.slice(1, -1)}</em>
      );
    } else if (match[5]) {
      // Link: [text](url)
      const linkMatch = full.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        nodes.push(
          <a key={key++} className="md-link" href={linkMatch[2]} target="_blank" rel="noopener noreferrer">
            {linkMatch[1]}
          </a>
        );
      }
    }

    lastIndex = match.index + full.length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    nodes.push(renderTextWithHighlight(text.slice(lastIndex), searchCtx, key++));
  }

  return nodes;
}

function renderParagraphContent(text: string, searchCtx: SearchContext | null = null): React.ReactNode[] {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: { content: string; ordered: boolean; index: number }[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    const ordered = listItems[0].ordered;
    const Tag = ordered ? 'ol' : 'ul';
    elements.push(
      <Tag key={key++} className="md-list">
        {listItems.map((item, idx) => (
          <li key={idx} className="md-list-item">
            {renderInlineMarkdown(item.content, searchCtx)}
          </li>
        ))}
      </Tag>
    );
    listItems = [];
  };

  const flushTable = (tableLines: string[]) => {
    if (tableLines.length < 2) return; // Need at least header + separator

    const parseRow = (line: string): string[] =>
      line.split('|').slice(1, -1).map(cell => cell.trim());

    const headers = parseRow(tableLines[0]);
    // Check for separator row (e.g., |---|---|)
    const separatorLine = tableLines[1];
    const isSeparator = /^\|[\s:]*-+[\s:]*(\|[\s:]*-+[\s:]*)*\|?\s*$/.test(separatorLine);
    if (!isSeparator) return;

    // Parse alignment from separator
    const separatorCells = parseRow(separatorLine);
    const alignments = separatorCells.map(cell => {
      const trimmed = cell.trim();
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center';
      if (trimmed.endsWith(':')) return 'right';
      return 'left';
    });

    const bodyRows = tableLines.slice(2).map(parseRow);

    elements.push(
      <table key={key++} className="md-table">
        <thead>
          <tr>
            {headers.map((header, hi) => (
              <th key={hi} style={{ textAlign: alignments[hi] || 'left' }}>
                {renderInlineMarkdown(header, searchCtx)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr key={ri}>
              {headers.map((_, ci) => (
                <td key={ci} style={{ textAlign: alignments[ci] || 'left' }}>
                  {renderInlineMarkdown(row[ci] || '', searchCtx)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Table: | ... | ... |
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      flushList();
      const tableLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
        tableLines.push(lines[i]);
        i++;
      }
      i--; // Back up since the for loop will increment
      flushTable(tableLines);
      continue;
    }

    // Headers: # ## ### #### ##### ######
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      flushList();
      const level = headerMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      elements.push(
        <HeadingTag key={key++} className={`md-heading md-h${level}`}>
          {renderInlineMarkdown(headerMatch[2], searchCtx)}
        </HeadingTag>
      );
      continue;
    }

    // Horizontal rule: --- or *** or ___
    if (line.match(/^(\*{3,}|-{3,}|_{3,})\s*$/)) {
      flushList();
      elements.push(<hr key={key++} className="md-hr" />);
      continue;
    }

    // Unordered list: - item or * item
    const ulMatch = line.match(/^[\s]*[-*]\s+(.+)$/);
    if (ulMatch) {
      if (listItems.length > 0 && listItems[0].ordered) {
        flushList();
      }
      listItems.push({ content: ulMatch[1], ordered: false, index: listItems.length });
      continue;
    }

    // Ordered list: 1. item
    const olMatch = line.match(/^[\s]*\d+\.\s+(.+)$/);
    if (olMatch) {
      if (listItems.length > 0 && !listItems[0].ordered) {
        flushList();
      }
      listItems.push({ content: olMatch[1], ordered: true, index: listItems.length });
      continue;
    }

    // Blockquote: > text
    const bqMatch = line.match(/^>\s?(.*)$/);
    if (bqMatch) {
      flushList();
      elements.push(
        <blockquote key={key++} className="md-blockquote">
          {renderInlineMarkdown(bqMatch[1], searchCtx)}
        </blockquote>
      );
      continue;
    }

    // Empty line
    if (line.trim() === '') {
      flushList();
      continue;
    }

    // Regular text
    flushList();
    elements.push(
      <p key={key++} className="md-paragraph">
        {renderInlineMarkdown(line, searchCtx)}
      </p>
    );
  }

  flushList();
  return elements;
}

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: do nothing if clipboard API is unavailable
    }
  }, [text]);

  return (
    <button
      className="md-copy-btn"
      onClick={handleCopy}
      aria-label={copied ? S.COPY_BUTTON_COPIED : S.COPY_BUTTON_LABEL}
      title={copied ? S.COPY_FEEDBACK_TITLE : S.COPY_BUTTON_LABEL}
    >
      {copied ? S.COPY_BUTTON_CHECK : S.COPY_BUTTON_TEXT}
    </button>
  );
};

const MarkdownRendererInner: React.FC<MarkdownRendererProps> = ({ content, searchQuery, searchActiveMatchIndex }) => {
  const blocks = useMemo(() => parseBlocks(content), [content]);
  const searchCtx: SearchContext | null = searchQuery ? { query: searchQuery, activeMatchIndex: searchActiveMatchIndex } : null;

  return (
    <div className="md-rendered">
      {blocks.map((block, index) => {
        if (block.type === 'code-block') {
          const language = block.language || detectCodeLanguage(block.content);
          const isDetected = !block.language && language !== '';
          const tokens = language
            ? tokenize(block.content, language)
            : null;
          const lineCount = block.content.split('\n').length;
          const showLineNumbers = lineCount >= 2;
          return (
            <pre key={index} className="md-code-block">
              <div className="md-code-header">
                {language && (
                  <span className={`md-code-lang${isDetected ? ' md-code-lang-detected' : ''}`}>
                    {language}
                  </span>
                )}
                <CopyButton text={block.content} />
              </div>
              <div className="md-code-body">
                {showLineNumbers && (
                  <div className="md-line-numbers" aria-hidden="true">
                    {Array.from({ length: lineCount }, (_, i) => (
                      <span key={i} className="md-line-number">{i + 1}</span>
                    ))}
                  </div>
                )}
                <code>
                  {tokens
                    ? tokens.map((token, ti) =>
                        token.type === 'text'
                          ? token.value
                          : <span key={ti} className={`sh-${token.type}`}>{token.value}</span>
                      )
                    : block.content
                  }
                </code>
              </div>
            </pre>
          );
        }
        if (block.type === 'math-block') {
          const html = renderMathToHtml(block.content);
          return (
            <div
              key={index}
              className="math-block"
              role="math"
              aria-label={`${S.MATH_FORMULA_PREFIX} ${block.content}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return (
          <div key={index} className="md-block">
            {renderParagraphContent(block.content, searchCtx)}
          </div>
        );
      })}
    </div>
  );
};

const MarkdownRenderer = React.memo(MarkdownRendererInner);

export default MarkdownRenderer;
