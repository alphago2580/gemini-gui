import React from 'react';
import './MarkdownRenderer.css';
import { tokenize } from '../utils/syntaxHighlight';
import { renderMathToHtml, parseMathSegments } from '../utils/mathRenderer';

interface MarkdownRendererProps {
  content: string;
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

function renderInlineMarkdown(text: string): React.ReactNode[] {
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
      nodes.push(text.slice(lastIndex, match.index));
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
          aria-label={`수식: ${mathContent}`}
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
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderParagraphContent(text: string): React.ReactNode[] {
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
            {renderInlineMarkdown(item.content)}
          </li>
        ))}
      </Tag>
    );
    listItems = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers: # ## ### #### ##### ######
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      flushList();
      const level = headerMatch[1].length as 1 | 2 | 3 | 4 | 5 | 6;
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      elements.push(
        <HeadingTag key={key++} className={`md-heading md-h${level}`}>
          {renderInlineMarkdown(headerMatch[2])}
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
          {renderInlineMarkdown(bqMatch[1])}
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
        {renderInlineMarkdown(line)}
      </p>
    );
  }

  flushList();
  return elements;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const blocks = parseBlocks(content);

  return (
    <div className="md-rendered">
      {blocks.map((block, index) => {
        if (block.type === 'code-block') {
          const tokens = block.language
            ? tokenize(block.content, block.language)
            : null;
          return (
            <pre key={index} className="md-code-block">
              {block.language && (
                <span className="md-code-lang">{block.language}</span>
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
              aria-label={`수식: ${block.content}`}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }
        return (
          <div key={index} className="md-block">
            {renderParagraphContent(block.content)}
          </div>
        );
      })}
    </div>
  );
};

export default MarkdownRenderer;
