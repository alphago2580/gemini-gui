import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import WordCloud from './WordCloud';
import type { WordCloudItem } from './WordCloud';

describe('WordCloud', () => {
  const sampleItems: WordCloudItem[] = [
    { text: 'React', value: 80 },
    { text: 'TypeScript', value: 60 },
    { text: 'JavaScript', value: 40 },
    { text: 'CSS', value: 30 },
    { text: 'HTML', value: 20 },
  ];

  // --- Rendering ---

  it('renders SVG container', () => {
    const { container } = render(<WordCloud items={sampleItems} />);
    const svg = container.querySelector('.word-cloud-svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders words as text elements', () => {
    const { container } = render(<WordCloud items={sampleItems} />);
    const words = container.querySelectorAll('.word-cloud-word');
    expect(words.length).toBeGreaterThan(0);
    expect(words.length).toBeLessThanOrEqual(sampleItems.length);
  });

  it('renders no text elements when items is empty', () => {
    const { container } = render(<WordCloud items={[]} />);
    const words = container.querySelectorAll('.word-cloud-word');
    expect(words).toHaveLength(0);
  });

  it('renders no text elements when all values are zero', () => {
    const items: WordCloudItem[] = [
      { text: 'Zero', value: 0 },
      { text: 'Also Zero', value: 0 },
    ];
    const { container } = render(<WordCloud items={items} />);
    const words = container.querySelectorAll('.word-cloud-word');
    expect(words).toHaveLength(0);
  });

  it('filters out items with non-positive values', () => {
    const items: WordCloudItem[] = [
      { text: 'Good', value: 50 },
      { text: 'Bad', value: -10 },
      { text: 'Zero', value: 0 },
    ];
    const { container } = render(<WordCloud items={items} />);
    const words = container.querySelectorAll('.word-cloud-word');
    expect(words).toHaveLength(1);
    expect(words[0].textContent).toBe('Good');
  });

  it('displays word text content', () => {
    render(<WordCloud items={sampleItems} />);
    expect(screen.getByText('React')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  // --- Accessibility ---

  it('has role="img" for accessibility', () => {
    render(<WordCloud items={sampleItems} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('has default aria-label', () => {
    render(<WordCloud items={sampleItems} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '워드 클라우드');
  });

  it('supports custom aria-label', () => {
    render(<WordCloud items={sampleItems} ariaLabel="태그 클라우드" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '태그 클라우드');
  });

  it('has aria-label on empty cloud', () => {
    render(<WordCloud items={[]} />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label', '워드 클라우드');
  });

  // --- Size ---

  it('uses medium size preset by default', () => {
    const { container } = render(<WordCloud items={sampleItems} />);
    const svg = container.querySelector('.word-cloud-svg');
    expect(svg).toHaveAttribute('width', '400');
    expect(svg).toHaveAttribute('height', '250');
  });

  it('applies small size preset', () => {
    const { container } = render(<WordCloud items={sampleItems} size="small" />);
    const svg = container.querySelector('.word-cloud-svg');
    expect(svg).toHaveAttribute('width', '200');
    expect(svg).toHaveAttribute('height', '150');
  });

  it('applies large size preset', () => {
    const { container } = render(<WordCloud items={sampleItems} size="large" />);
    const svg = container.querySelector('.word-cloud-svg');
    expect(svg).toHaveAttribute('width', '600');
    expect(svg).toHaveAttribute('height', '350');
  });

  it('custom width/height overrides size preset', () => {
    const { container } = render(
      <WordCloud items={sampleItems} size="small" width={500} height={300} />,
    );
    const svg = container.querySelector('.word-cloud-svg');
    expect(svg).toHaveAttribute('width', '500');
    expect(svg).toHaveAttribute('height', '300');
  });

  it('applies size CSS class', () => {
    const { container } = render(<WordCloud items={sampleItems} size="large" />);
    expect(container.querySelector('.word-cloud--large')).toBeInTheDocument();
  });

  // --- Font sizing ---

  it('gives higher-value words larger font sizes', () => {
    const items: WordCloudItem[] = [
      { text: 'Big', value: 100 },
      { text: 'Small', value: 10 },
    ];
    const { container } = render(<WordCloud items={items} />);
    const words = container.querySelectorAll('.word-cloud-word');
    const bigWord = Array.from(words).find((w) => w.textContent === 'Big');
    const smallWord = Array.from(words).find((w) => w.textContent === 'Small');
    if (bigWord && smallWord) {
      const bigSize = parseInt(bigWord.getAttribute('font-size') ?? '0', 10);
      const smallSize = parseInt(smallWord.getAttribute('font-size') ?? '0', 10);
      expect(bigSize).toBeGreaterThan(smallSize);
    }
  });

  it('respects custom minFontSize and maxFontSize', () => {
    const items: WordCloudItem[] = [
      { text: 'Max', value: 100 },
      { text: 'Min', value: 1 },
    ];
    const { container } = render(
      <WordCloud items={items} minFontSize={8} maxFontSize={32} />,
    );
    const words = container.querySelectorAll('.word-cloud-word');
    const maxWord = Array.from(words).find((w) => w.textContent === 'Max');
    const minWord = Array.from(words).find((w) => w.textContent === 'Min');
    if (maxWord && minWord) {
      expect(maxWord.getAttribute('font-size')).toBe('32');
      expect(minWord.getAttribute('font-size')).toBe('8');
    }
  });

  // --- maxWords ---

  it('respects maxWords limit', () => {
    const manyItems: WordCloudItem[] = Array.from({ length: 20 }, (_, i) => ({
      text: `Word${i}`,
      value: 20 - i,
    }));
    const { container } = render(<WordCloud items={manyItems} maxWords={5} />);
    const words = container.querySelectorAll('.word-cloud-word');
    expect(words.length).toBeLessThanOrEqual(5);
  });

  // --- Colors ---

  it('uses custom colors from items', () => {
    const items: WordCloudItem[] = [
      { text: 'Red', value: 50, color: '#ff0000' },
      { text: 'Blue', value: 30, color: '#0000ff' },
    ];
    const { container } = render(<WordCloud items={items} />);
    const words = container.querySelectorAll('.word-cloud-word');
    const redWord = Array.from(words).find((w) => w.textContent === 'Red');
    const blueWord = Array.from(words).find((w) => w.textContent === 'Blue');
    expect(redWord).toHaveAttribute('fill', '#ff0000');
    expect(blueWord).toHaveAttribute('fill', '#0000ff');
  });

  it('uses default colors when no custom color is specified', () => {
    const items: WordCloudItem[] = [
      { text: 'A', value: 50 },
      { text: 'B', value: 30 },
    ];
    const { container } = render(<WordCloud items={items} />);
    const words = container.querySelectorAll('.word-cloud-word');
    // Default colors are applied via fill attribute
    words.forEach((word) => {
      const fill = word.getAttribute('fill');
      expect(fill).toBeTruthy();
      expect(fill).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  // --- Click handler ---

  it('calls onWordClick when a word is clicked', () => {
    const handleClick = vi.fn();
    const items: WordCloudItem[] = [{ text: 'Clickable', value: 50 }];
    render(<WordCloud items={items} onWordClick={handleClick} />);
    const word = screen.getByText('Clickable');
    fireEvent.click(word);
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Clickable', value: 50 }),
    );
  });

  it('adds role="button" when onWordClick is provided', () => {
    const items: WordCloudItem[] = [{ text: 'Btn', value: 50 }];
    render(<WordCloud items={items} onWordClick={() => {}} />);
    const word = screen.getByText('Btn');
    expect(word).toHaveAttribute('role', 'button');
  });

  it('does not add role="button" when no onWordClick', () => {
    const items: WordCloudItem[] = [{ text: 'NoBtn', value: 50 }];
    render(<WordCloud items={items} />);
    const word = screen.getByText('NoBtn');
    expect(word).not.toHaveAttribute('role');
  });

  it('adds clickable CSS class when onWordClick is provided', () => {
    const items: WordCloudItem[] = [{ text: 'Click', value: 50 }];
    const { container } = render(
      <WordCloud items={items} onWordClick={() => {}} />,
    );
    expect(
      container.querySelector('.word-cloud-word--clickable'),
    ).toBeInTheDocument();
  });

  it('supports keyboard activation with Enter', () => {
    const handleClick = vi.fn();
    const items: WordCloudItem[] = [{ text: 'KeyWord', value: 50 }];
    render(<WordCloud items={items} onWordClick={handleClick} />);
    const word = screen.getByText('KeyWord');
    fireEvent.keyDown(word, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard activation with Space', () => {
    const handleClick = vi.fn();
    const items: WordCloudItem[] = [{ text: 'SpaceWord', value: 50 }];
    render(<WordCloud items={items} onWordClick={handleClick} />);
    const word = screen.getByText('SpaceWord');
    fireEvent.keyDown(word, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // --- Animation ---

  it('does not apply animated class by default', () => {
    const { container } = render(<WordCloud items={sampleItems} />);
    expect(container.querySelector('.word-cloud--animated')).not.toBeInTheDocument();
  });

  it('applies animated class when animated is true', () => {
    const { container } = render(<WordCloud items={sampleItems} animated />);
    expect(container.querySelector('.word-cloud--animated')).toBeInTheDocument();
  });

  // --- Custom className ---

  it('applies custom className', () => {
    const { container } = render(
      <WordCloud items={sampleItems} className="my-cloud" />,
    );
    expect(container.querySelector('.my-cloud')).toBeInTheDocument();
  });

  // --- SVG structure ---

  it('has correct viewBox matching dimensions', () => {
    const { container } = render(
      <WordCloud items={sampleItems} width={300} height={200} />,
    );
    const svg = container.querySelector('.word-cloud-svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 300 200');
  });

  // --- Container structure ---

  it('has word-cloud container class', () => {
    const { container } = render(<WordCloud items={sampleItems} />);
    expect(container.querySelector('.word-cloud')).toBeInTheDocument();
  });

  it('has word-cloud-svg class on SVG element', () => {
    const { container } = render(<WordCloud items={sampleItems} />);
    expect(container.querySelector('.word-cloud-svg')).toBeInTheDocument();
  });

  // --- Deterministic layout ---

  it('produces consistent layout across renders', () => {
    const items: WordCloudItem[] = [
      { text: 'Alpha', value: 100 },
      { text: 'Beta', value: 50 },
    ];
    const { container: c1 } = render(<WordCloud items={items} />);
    const { container: c2 } = render(<WordCloud items={items} />);
    const words1 = c1.querySelectorAll('.word-cloud-word');
    const words2 = c2.querySelectorAll('.word-cloud-word');
    expect(words1.length).toBe(words2.length);
    for (let i = 0; i < words1.length; i++) {
      expect(words1[i].getAttribute('x')).toBe(words2[i].getAttribute('x'));
      expect(words1[i].getAttribute('y')).toBe(words2[i].getAttribute('y'));
    }
  });

  // --- Single item ---

  it('renders a single item correctly', () => {
    const items: WordCloudItem[] = [{ text: 'Solo', value: 42 }];
    const { container } = render(<WordCloud items={items} />);
    const words = container.querySelectorAll('.word-cloud-word');
    expect(words).toHaveLength(1);
    expect(words[0].textContent).toBe('Solo');
  });
});
