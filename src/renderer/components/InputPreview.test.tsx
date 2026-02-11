import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import InputPreview from './InputPreview';

describe('InputPreview', () => {
  it('renders nothing when not visible', () => {
    const { container } = render(<InputPreview content="hello" isVisible={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when content is empty', () => {
    const { container } = render(<InputPreview content="" isVisible={true} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when content is whitespace only', () => {
    const { container } = render(<InputPreview content="   " isVisible={true} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders preview when visible with content', () => {
    render(<InputPreview content="Hello **world**" isVisible={true} />);
    expect(screen.getByLabelText('입력 미리보기')).toBeInTheDocument();
    expect(screen.getByText('미리보기')).toBeInTheDocument();
  });

  it('renders markdown content', () => {
    const { container } = render(<InputPreview content="**bold text**" isVisible={true} />);
    const bold = container.querySelector('strong');
    expect(bold).not.toBeNull();
    expect(bold!.textContent).toBe('bold text');
  });

  it('renders code blocks', () => {
    const { container } = render(
      <InputPreview content={'```js\nconsole.log("hi");\n```'} isVisible={true} />
    );
    expect(container.querySelector('pre')).not.toBeNull();
  });

  it('has input-preview CSS class on root element', () => {
    const { container } = render(<InputPreview content="test" isVisible={true} />);
    expect(container.querySelector('.input-preview')).not.toBeNull();
  });

  it('has input-preview-label child element', () => {
    const { container } = render(<InputPreview content="test" isVisible={true} />);
    expect(container.querySelector('.input-preview-label')).not.toBeNull();
  });

  it('has input-preview-content child element', () => {
    const { container } = render(<InputPreview content="test" isVisible={true} />);
    expect(container.querySelector('.input-preview-content')).not.toBeNull();
  });

  it('renders nothing for tab-only whitespace', () => {
    const { container } = render(<InputPreview content={'\t\t'} isVisible={true} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing for newline-only content', () => {
    const { container } = render(<InputPreview content={'\n\n'} isVisible={true} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders inline formatting like italic', () => {
    const { container } = render(<InputPreview content="*italic text*" isVisible={true} />);
    const em = container.querySelector('em');
    expect(em).not.toBeNull();
    expect(em!.textContent).toBe('italic text');
  });

  it('renders lists in preview', () => {
    const { container } = render(
      <InputPreview content={'- item one\n- item two'} isVisible={true} />
    );
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(2);
  });

  it('hides when isVisible changes from true to false', () => {
    const { container, rerender } = render(<InputPreview content="hello" isVisible={true} />);
    expect(container.querySelector('.input-preview')).not.toBeNull();

    rerender(<InputPreview content="hello" isVisible={false} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders when content changes from empty to non-empty while visible', () => {
    const { container, rerender } = render(<InputPreview content="" isVisible={true} />);
    expect(container.innerHTML).toBe('');

    rerender(<InputPreview content="new content" isVisible={true} />);
    expect(container.querySelector('.input-preview')).not.toBeNull();
  });
});
