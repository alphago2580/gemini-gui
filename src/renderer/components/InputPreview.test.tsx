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
});
