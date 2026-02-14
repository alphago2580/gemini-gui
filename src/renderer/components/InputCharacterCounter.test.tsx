import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import InputCharacterCounter, { estimateTokens } from './InputCharacterCounter';

describe('InputCharacterCounter', () => {
  describe('visibility', () => {
    it('renders nothing when not visible', () => {
      const { container } = render(
        <InputCharacterCounter text="hello" isVisible={false} />
      );
      expect(container.innerHTML).toBe('');
    });

    it('renders nothing when text is empty', () => {
      const { container } = render(
        <InputCharacterCounter text="" isVisible={true} />
      );
      expect(container.innerHTML).toBe('');
    });

    it('renders when visible with non-empty text', () => {
      render(<InputCharacterCounter text="hello" isVisible={true} />);
      expect(screen.getByLabelText('입력 통계')).toBeInTheDocument();
    });

    it('hides when isVisible changes from true to false', () => {
      const { container, rerender } = render(
        <InputCharacterCounter text="hello" isVisible={true} />
      );
      expect(container.querySelector('.input-char-counter')).not.toBeNull();

      rerender(<InputCharacterCounter text="hello" isVisible={false} />);
      expect(container.innerHTML).toBe('');
    });

    it('shows when text changes from empty to non-empty while visible', () => {
      const { container, rerender } = render(
        <InputCharacterCounter text="" isVisible={true} />
      );
      expect(container.innerHTML).toBe('');

      rerender(<InputCharacterCounter text="hello" isVisible={true} />);
      expect(container.querySelector('.input-char-counter')).not.toBeNull();
    });
  });

  describe('character count', () => {
    it('displays correct character count for English text', () => {
      render(<InputCharacterCounter text="hello" isVisible={true} />);
      expect(screen.getByText('5자')).toBeInTheDocument();
    });

    it('displays correct character count for Korean text', () => {
      render(<InputCharacterCounter text="안녕하세요" isVisible={true} />);
      expect(screen.getByText('5자')).toBeInTheDocument();
    });

    it('counts spaces as characters', () => {
      render(<InputCharacterCounter text="hi there" isVisible={true} />);
      expect(screen.getByText('8자')).toBeInTheDocument();
    });

    it('counts newlines as characters', () => {
      const text = `line1
line2`;
      render(<InputCharacterCounter text={text} isVisible={true} />);
      expect(screen.getByText('11자')).toBeInTheDocument();
    });
  });

  describe('word count', () => {
    it('displays correct word count for single word', () => {
      render(<InputCharacterCounter text="hello" isVisible={true} />);
      expect(screen.getByText('1단어')).toBeInTheDocument();
    });

    it('displays correct word count for multiple words', () => {
      render(<InputCharacterCounter text="hello world foo" isVisible={true} />);
      expect(screen.getByText('3단어')).toBeInTheDocument();
    });

    it('handles multiple spaces between words', () => {
      render(<InputCharacterCounter text="hello   world" isVisible={true} />);
      expect(screen.getByText('2단어')).toBeInTheDocument();
    });
  });

  describe('token estimate', () => {
    it('displays token estimate with ~ prefix', () => {
      render(<InputCharacterCounter text="hello" isVisible={true} />);
      const tokenEl = screen.getByText(/토큰$/);
      expect(tokenEl.textContent).toMatch(/^~\d+토큰$/);
    });

    it('estimates English tokens at ~4 chars per token', () => {
      // 20 English chars => ~5 tokens
      render(<InputCharacterCounter text="abcdefghijklmnopqrst" isVisible={true} />);
      expect(screen.getByText('~5토큰')).toBeInTheDocument();
    });

    it('estimates Korean tokens at ~2 chars per token', () => {
      // 4 Korean chars => ~2 tokens
      render(<InputCharacterCounter text="한글테스" isVisible={true} />);
      expect(screen.getByText('~2토큰')).toBeInTheDocument();
    });
  });

  describe('max characters limit', () => {
    it('shows limit indicator when maxCharacters is set', () => {
      render(
        <InputCharacterCounter text="hello" isVisible={true} maxCharacters={100} />
      );
      expect(screen.getByText('5/100')).toBeInTheDocument();
    });

    it('does not show limit indicator when maxCharacters is not set', () => {
      const { container } = render(
        <InputCharacterCounter text="hello" isVisible={true} />
      );
      expect(container.querySelector('.input-char-counter__limit')).toBeNull();
    });

    it('adds over class when exceeding limit', () => {
      const { container } = render(
        <InputCharacterCounter text="hello world" isVisible={true} maxCharacters={5} />
      );
      expect(container.querySelector('.input-char-counter--over')).not.toBeNull();
    });

    it('does not add over class when within limit', () => {
      const { container } = render(
        <InputCharacterCounter text="hi" isVisible={true} maxCharacters={100} />
      );
      expect(container.querySelector('.input-char-counter--over')).toBeNull();
    });

    it('adds over class to limit element when exceeding', () => {
      const { container } = render(
        <InputCharacterCounter text="hello world" isVisible={true} maxCharacters={5} />
      );
      expect(container.querySelector('.input-char-counter__limit--over')).not.toBeNull();
    });

    it('does not add over class to limit when at exact limit', () => {
      const { container } = render(
        <InputCharacterCounter text="hello" isVisible={true} maxCharacters={5} />
      );
      expect(container.querySelector('.input-char-counter--over')).toBeNull();
    });
  });

  describe('accessibility', () => {
    it('has aria-label', () => {
      render(<InputCharacterCounter text="hello" isVisible={true} />);
      expect(screen.getByLabelText('입력 통계')).toBeInTheDocument();
    });

    it('has aria-live polite for screen reader updates', () => {
      render(<InputCharacterCounter text="hello" isVisible={true} />);
      const el = screen.getByLabelText('입력 통계');
      expect(el.getAttribute('aria-live')).toBe('polite');
    });

    it('has aria-hidden separators', () => {
      const { container } = render(
        <InputCharacterCounter text="hello" isVisible={true} />
      );
      const separators = container.querySelectorAll('[aria-hidden="true"]');
      expect(separators.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('CSS classes', () => {
    it('has input-char-counter root class', () => {
      const { container } = render(
        <InputCharacterCounter text="hello" isVisible={true} />
      );
      expect(container.querySelector('.input-char-counter')).not.toBeNull();
    });

    it('has input-char-counter__item for each stat', () => {
      const { container } = render(
        <InputCharacterCounter text="hello" isVisible={true} />
      );
      const items = container.querySelectorAll('.input-char-counter__item');
      expect(items.length).toBe(3); // chars, words, tokens
    });

    it('has input-char-counter__separator between items', () => {
      const { container } = render(
        <InputCharacterCounter text="hello" isVisible={true} />
      );
      const separators = container.querySelectorAll('.input-char-counter__separator');
      expect(separators.length).toBe(2); // between chars-words, words-tokens
    });

    it('has 4 items and 3 separators when maxCharacters is set', () => {
      const { container } = render(
        <InputCharacterCounter text="hello" isVisible={true} maxCharacters={100} />
      );
      expect(container.querySelectorAll('.input-char-counter__item').length).toBe(4);
      expect(container.querySelectorAll('.input-char-counter__separator').length).toBe(3);
    });
  });

  describe('updates on text change', () => {
    it('updates counts when text changes', () => {
      const { rerender } = render(
        <InputCharacterCounter text="hi" isVisible={true} />
      );
      expect(screen.getByText('2자')).toBeInTheDocument();
      expect(screen.getByText('1단어')).toBeInTheDocument();

      rerender(<InputCharacterCounter text="hello world" isVisible={true} />);
      expect(screen.getByText('11자')).toBeInTheDocument();
      expect(screen.getByText('2단어')).toBeInTheDocument();
    });
  });
});

describe('estimateTokens', () => {
  it('returns 0 for empty string', () => {
    expect(estimateTokens('')).toBe(0);
  });

  it('estimates English text at ~4 chars per token', () => {
    expect(estimateTokens('abcdefgh')).toBe(2); // 8 / 4 = 2
  });

  it('estimates Korean text at ~2 chars per token', () => {
    expect(estimateTokens('가나다라')).toBe(2); // 4 / 2 = 2
  });

  it('handles mixed English and Korean', () => {
    // "hello가나" = 5 English chars + 2 Korean chars
    // 5/4 + 2/2 = 1.25 + 1 = 2.25 => ceil => 3
    expect(estimateTokens('hello가나')).toBe(3);
  });

  it('rounds up partial tokens', () => {
    expect(estimateTokens('abc')).toBe(1); // 3/4 = 0.75 => ceil => 1
  });

  it('handles single character', () => {
    expect(estimateTokens('a')).toBe(1);
  });
});
