import React, { useMemo, useCallback } from 'react';
import './WordCloud.css';
import * as S from '../constants/strings';

export interface WordCloudItem {
  text: string;
  value: number;
  color?: string;
}

export type WordCloudSize = 'small' | 'medium' | 'large';

export interface WordCloudProps {
  /** Word items with text and frequency/weight value */
  items: WordCloudItem[];
  /** Size preset */
  size?: WordCloudSize;
  /** Custom width in px (overrides size preset) */
  width?: number;
  /** Custom height in px (overrides size preset) */
  height?: number;
  /** Minimum font size in px */
  minFontSize?: number;
  /** Maximum font size in px */
  maxFontSize?: number;
  /** Maximum number of words to display */
  maxWords?: number;
  /** Callback when a word is clicked */
  onWordClick?: (item: WordCloudItem) => void;
  /** Whether to animate words on render */
  animated?: boolean;
  /** Accessible label */
  ariaLabel?: string;
  /** Custom CSS class */
  className?: string;
}

const SIZE_PRESETS: Record<WordCloudSize, { width: number; height: number }> = {
  small: { width: 200, height: 150 },
  medium: { width: 400, height: 250 },
  large: { width: 600, height: 350 },
};

const DEFAULT_COLORS = [
  '#4a90d9',
  '#e74c3c',
  '#2ecc71',
  '#f39c12',
  '#9b59b6',
  '#1abc9c',
  '#e67e22',
  '#3498db',
  '#e91e63',
  '#00bcd4',
];

interface PlacedWord {
  text: string;
  value: number;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  rotate: number;
}

/**
 * Simple deterministic seeded RNG for consistent layout.
 */
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

/**
 * Estimate word dimensions based on font size and text length.
 */
function estimateWordSize(
  text: string,
  fontSize: number,
  rotated: boolean,
): { w: number; h: number } {
  const charWidth = fontSize * 0.6;
  const textWidth = text.length * charWidth;
  const textHeight = fontSize * 1.2;
  return rotated
    ? { w: textHeight, h: textWidth }
    : { w: textWidth, h: textHeight };
}

/**
 * Check if two rectangles overlap with a small padding.
 */
function overlaps(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
  padding: number = 4,
): boolean {
  return !(
    a.x + a.w + padding <= b.x ||
    b.x + b.w + padding <= a.x ||
    a.y + a.h + padding <= b.y ||
    b.y + b.h + padding <= a.y
  );
}

/**
 * Place words using a spiral layout algorithm.
 */
function layoutWords(
  items: WordCloudItem[],
  containerWidth: number,
  containerHeight: number,
  minFontSize: number,
  maxFontSize: number,
  maxWords: number,
): PlacedWord[] {
  const sorted = [...items]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, maxWords);

  if (sorted.length === 0) return [];

  const minValue = Math.min(...sorted.map((w) => w.value));
  const maxValue = Math.max(...sorted.map((w) => w.value));
  const valueRange = maxValue - minValue || 1;

  const rand = seededRandom(42);
  const placed: { x: number; y: number; w: number; h: number }[] = [];
  const result: PlacedWord[] = [];
  const cx = containerWidth / 2;
  const cy = containerHeight / 2;

  for (let i = 0; i < sorted.length; i++) {
    const item = sorted[i];
    const t = (item.value - minValue) / valueRange;
    const fontSize = Math.round(minFontSize + t * (maxFontSize - minFontSize));
    const color =
      item.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length];
    const rotate = rand() < 0.2 ? -90 : 0;
    const size = estimateWordSize(item.text, fontSize, rotate !== 0);

    let wordPlaced = false;

    // Spiral outward from center to find a non-overlapping position
    for (let step = 0; step < 500 && !wordPlaced; step++) {
      const angle = step * 0.3;
      const radius = step * 1.5;
      const tryX = cx + radius * Math.cos(angle) - size.w / 2;
      const tryY = cy + radius * Math.sin(angle) - size.h / 2;

      // Bounds check
      if (
        tryX < 0 ||
        tryY < 0 ||
        tryX + size.w > containerWidth ||
        tryY + size.h > containerHeight
      ) {
        continue;
      }

      const rect = { x: tryX, y: tryY, w: size.w, h: size.h };
      const hasOverlap = placed.some((p) => overlaps(rect, p));

      if (!hasOverlap) {
        placed.push(rect);
        result.push({
          text: item.text,
          value: item.value,
          fontSize,
          color,
          x: tryX,
          y: tryY,
          rotate,
        });
        wordPlaced = true;
      }
    }
  }

  return result;
}

const WordCloud: React.FC<WordCloudProps> = ({
  items,
  size = 'medium',
  width: customWidth,
  height: customHeight,
  minFontSize = 12,
  maxFontSize = 48,
  maxWords = 50,
  onWordClick,
  animated = false,
  ariaLabel,
  className,
}) => {
  const preset = SIZE_PRESETS[size];
  const width = customWidth ?? preset.width;
  const height = customHeight ?? preset.height;

  const placedWords = useMemo(
    () => layoutWords(items, width, height, minFontSize, maxFontSize, maxWords),
    [items, width, height, minFontSize, maxFontSize, maxWords],
  );

  const handleWordClick = useCallback(
    (item: WordCloudItem) => {
      if (onWordClick) {
        onWordClick(item);
      }
    },
    [onWordClick],
  );

  const containerClass = [
    'word-cloud',
    `word-cloud--${size}`,
    animated ? 'word-cloud--animated' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClass}
      role="img"
      aria-label={ariaLabel ?? S.WORD_CLOUD_ARIA}
    >
      <svg
        className="word-cloud-svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
      >
        {placedWords.map((word, i) => (
          <text
            key={i}
            className={`word-cloud-word${onWordClick ? ' word-cloud-word--clickable' : ''}`}
            x={word.x + (word.rotate === 0 ? 0 : estimateWordSize(word.text, word.fontSize, true).w)}
            y={word.y + word.fontSize}
            fontSize={word.fontSize}
            fill={word.color}
            transform={
              word.rotate !== 0
                ? `rotate(${word.rotate}, ${word.x + estimateWordSize(word.text, word.fontSize, true).w}, ${word.y + word.fontSize})`
                : undefined
            }
            style={{ animationDelay: animated ? `${i * 50}ms` : undefined }}
            onClick={() =>
              handleWordClick({
                text: word.text,
                value: word.value,
                color: word.color,
              })
            }
            role={onWordClick ? 'button' : undefined}
            tabIndex={onWordClick ? 0 : undefined}
            onKeyDown={
              onWordClick
                ? (e: React.KeyboardEvent) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleWordClick({
                        text: word.text,
                        value: word.value,
                        color: word.color,
                      });
                    }
                  }
                : undefined
            }
          >
            {word.text}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default React.memo(WordCloud);
