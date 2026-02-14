import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CollapsibleCodeBlock from './CollapsibleCodeBlock';

function makeCode(lines: number): string {
  return Array.from({ length: lines }, (_, i) => `line ${i + 1}`).join('\n');
}

describe('CollapsibleCodeBlock', () => {
  it('renders children directly when code is short', () => {
    const code = makeCode(5);
    render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    expect(screen.getByText(/line 1/)).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders children directly when code equals maxLines', () => {
    const code = makeCode(15);
    render(
      <CollapsibleCodeBlock code={code} maxLines={15}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows toggle button when code exceeds maxLines', () => {
    const code = makeCode(20);
    render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const toggle = screen.getByRole('button');
    expect(toggle).toBeInTheDocument();
    expect(toggle).toHaveTextContent('더 보기');
  });

  it('starts collapsed by default', () => {
    const code = makeCode(20);
    const { container } = render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const content = container.querySelector('.collapsible-code-block__content');
    expect(content).toHaveClass('collapsible-code-block__content--collapsed');
  });

  it('starts expanded when defaultCollapsed is false', () => {
    const code = makeCode(20);
    const { container } = render(
      <CollapsibleCodeBlock code={code} defaultCollapsed={false}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const content = container.querySelector('.collapsible-code-block__content');
    expect(content).not.toHaveClass('collapsible-code-block__content--collapsed');
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveTextContent('접기');
  });

  it('expands when toggle is clicked', () => {
    const code = makeCode(20);
    const { container } = render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const toggle = screen.getByRole('button');
    fireEvent.click(toggle);

    const content = container.querySelector('.collapsible-code-block__content');
    expect(content).not.toHaveClass('collapsible-code-block__content--collapsed');
    expect(toggle).toHaveTextContent('접기');
  });

  it('collapses again when toggle is clicked twice', () => {
    const code = makeCode(20);
    const { container } = render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const toggle = screen.getByRole('button');
    fireEvent.click(toggle); // expand
    fireEvent.click(toggle); // collapse

    const content = container.querySelector('.collapsible-code-block__content');
    expect(content).toHaveClass('collapsible-code-block__content--collapsed');
    expect(toggle).toHaveTextContent('더 보기');
  });

  it('shows hidden line count when collapsed', () => {
    const code = makeCode(25);
    render(
      <CollapsibleCodeBlock code={code} maxLines={15}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    expect(screen.getByText('10줄 숨김')).toBeInTheDocument();
  });

  it('hides line count when expanded', () => {
    const code = makeCode(25);
    render(
      <CollapsibleCodeBlock code={code} maxLines={15}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const toggle = screen.getByRole('button');
    fireEvent.click(toggle);
    expect(screen.queryByText('10줄 숨김')).toBeNull();
  });

  it('uses custom maxLines threshold', () => {
    const code = makeCode(10);
    render(
      <CollapsibleCodeBlock code={code} maxLines={5}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const toggle = screen.getByRole('button');
    expect(toggle).toBeInTheDocument();
    expect(screen.getByText('5줄 숨김')).toBeInTheDocument();
  });

  it('does not collapse when code is within custom maxLines', () => {
    const code = makeCode(10);
    render(
      <CollapsibleCodeBlock code={code} maxLines={10}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('has correct aria-expanded attribute when collapsed', () => {
    const code = makeCode(20);
    render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('has correct aria-expanded attribute when expanded', () => {
    const code = makeCode(20);
    render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const toggle = screen.getByRole('button');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('has correct aria-label when collapsed', () => {
    const code = makeCode(20);
    render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const toggle = screen.getByRole('button');
    expect(toggle).toHaveAttribute('aria-label', '코드 블록 펼치기');
  });

  it('has correct aria-label when expanded', () => {
    const code = makeCode(20);
    render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const toggle = screen.getByRole('button');
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-label', '코드 블록 접기');
  });

  it('shows fade gradient when collapsed', () => {
    const code = makeCode(20);
    const { container } = render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const fade = container.querySelector('.collapsible-code-block__fade');
    expect(fade).toBeInTheDocument();
    expect(fade).toHaveAttribute('aria-hidden', 'true');
  });

  it('hides fade gradient when expanded', () => {
    const code = makeCode(20);
    const { container } = render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const toggle = screen.getByRole('button');
    fireEvent.click(toggle);
    const fade = container.querySelector('.collapsible-code-block__fade');
    expect(fade).toBeNull();
  });

  it('sets maxHeight style when collapsed', () => {
    const code = makeCode(20);
    const { container } = render(
      <CollapsibleCodeBlock code={code} maxLines={10}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const content = container.querySelector('.collapsible-code-block__content') as HTMLElement;
    expect(content.style.maxHeight).toBe('15em');
  });

  it('removes maxHeight style when expanded', () => {
    const code = makeCode(20);
    const { container } = render(
      <CollapsibleCodeBlock code={code} maxLines={10}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const toggle = screen.getByRole('button');
    fireEvent.click(toggle);
    const content = container.querySelector('.collapsible-code-block__content') as HTMLElement;
    expect(content.style.maxHeight).toBe('');
  });

  it('sets data-language attribute when language is provided', () => {
    const code = makeCode(20);
    const { container } = render(
      <CollapsibleCodeBlock code={code} language="typescript">
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const block = container.querySelector('.collapsible-code-block');
    expect(block).toHaveAttribute('data-language', 'typescript');
  });

  it('does not set data-language attribute when language is empty', () => {
    const code = makeCode(5);
    const { container } = render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    const block = container.querySelector('.collapsible-code-block');
    expect(block).not.toHaveAttribute('data-language');
  });

  it('renders children content correctly', () => {
    const code = makeCode(5);
    render(
      <CollapsibleCodeBlock code={code}>
        <code data-testid="inner-code">{code}</code>
      </CollapsibleCodeBlock>
    );
    expect(screen.getByTestId('inner-code')).toBeInTheDocument();
  });

  it('handles single line code without collapsing', () => {
    const code = 'console.log("hello")';
    render(
      <CollapsibleCodeBlock code={code}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('console.log("hello")')).toBeInTheDocument();
  });

  it('handles empty code string', () => {
    render(
      <CollapsibleCodeBlock code="">
        <code></code>
      </CollapsibleCodeBlock>
    );
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('calculates correct hidden lines with maxLines=1', () => {
    const code = makeCode(5);
    render(
      <CollapsibleCodeBlock code={code} maxLines={1}>
        <code>{code}</code>
      </CollapsibleCodeBlock>
    );
    expect(screen.getByText('4줄 숨김')).toBeInTheDocument();
  });
});
