import React, { useMemo } from 'react';
import './TextDiff.css';
import { diffLines } from '../utils/diffUtils';
import type { LineDiffEntry } from '../utils/diffUtils';
import * as S from '../constants/strings';

export type TextDiffViewMode = 'unified' | 'split';

export interface TextDiffProps {
  oldText: string;
  newText: string;
  oldLabel?: string;
  newLabel?: string;
  viewMode?: TextDiffViewMode;
  showLineNumbers?: boolean;
}

interface DiffStats {
  added: number;
  removed: number;
}

function computeStats(entries: LineDiffEntry[]): DiffStats {
  let added = 0;
  let removed = 0;
  for (const entry of entries) {
    if (entry.type === 'added') added++;
    if (entry.type === 'removed') removed++;
  }
  return { added, removed };
}

function computeSplitLines(entries: LineDiffEntry[]): { left: (LineDiffEntry | null)[]; right: (LineDiffEntry | null)[] } {
  const left: (LineDiffEntry | null)[] = [];
  const right: (LineDiffEntry | null)[] = [];

  let i = 0;
  while (i < entries.length) {
    const entry = entries[i];

    if (entry.type === 'unchanged') {
      left.push(entry);
      right.push(entry);
      i++;
    } else if (entry.type === 'removed') {
      // Collect consecutive removed, then matching added
      const removedGroup: LineDiffEntry[] = [];
      while (i < entries.length && entries[i].type === 'removed') {
        removedGroup.push(entries[i]);
        i++;
      }
      const addedGroup: LineDiffEntry[] = [];
      while (i < entries.length && entries[i].type === 'added') {
        addedGroup.push(entries[i]);
        i++;
      }

      const maxLen = Math.max(removedGroup.length, addedGroup.length);
      for (let j = 0; j < maxLen; j++) {
        left.push(j < removedGroup.length ? removedGroup[j] : null);
        right.push(j < addedGroup.length ? addedGroup[j] : null);
      }
    } else if (entry.type === 'added') {
      left.push(null);
      right.push(entry);
      i++;
    }
  }

  return { left, right };
}

const TextDiff: React.FC<TextDiffProps> = ({
  oldText,
  newText,
  oldLabel,
  newLabel,
  viewMode = 'unified',
  showLineNumbers = true,
}) => {
  const diffEntries = useMemo(() => diffLines(oldText, newText), [oldText, newText]);
  const stats = useMemo(() => computeStats(diffEntries), [diffEntries]);
  const splitLines = useMemo(
    () => viewMode === 'split' ? computeSplitLines(diffEntries) : null,
    [diffEntries, viewMode]
  );

  const resolvedOldLabel = oldLabel ?? S.TEXT_DIFF_OLD_LABEL;
  const resolvedNewLabel = newLabel ?? S.TEXT_DIFF_NEW_LABEL;

  if (oldText === newText) {
    return (
      <div className="text-diff text-diff--empty" role="region" aria-label={S.TEXT_DIFF_LABEL}>
        <div className="text-diff-header">
          <span className="text-diff-stats">{S.TEXT_DIFF_STATS(0, 0)}</span>
        </div>
        <div className="text-diff-body text-diff-body--unified">
          {oldText.split('\n').map((line, i) => (
            <div key={i} className="text-diff-line text-diff-line--unchanged">
              {showLineNumbers && <span className="text-diff-line-number">{i + 1}</span>}
              <span className="text-diff-line-content">{line || '\u00A0'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (viewMode === 'split' && splitLines) {
    return (
      <div className="text-diff text-diff--split" role="region" aria-label={S.TEXT_DIFF_LABEL}>
        <div className="text-diff-header">
          <span className="text-diff-stats">{S.TEXT_DIFF_STATS(stats.added, stats.removed)}</span>
        </div>
        <div className="text-diff-body text-diff-body--split">
          <div className="text-diff-split-pane">
            <div className="text-diff-pane-header">{resolvedOldLabel}</div>
            {splitLines.left.map((entry, i) => (
              <div
                key={i}
                className={`text-diff-line ${entry ? `text-diff-line--${entry.type}` : 'text-diff-line--empty-slot'}`}
                aria-label={entry ? getLineAriaLabel(entry) : undefined}
              >
                {showLineNumbers && (
                  <span className="text-diff-line-number">{entry ? entry.lineNumber : ''}</span>
                )}
                <span className="text-diff-line-content">{entry ? (entry.line || '\u00A0') : '\u00A0'}</span>
              </div>
            ))}
          </div>
          <div className="text-diff-split-pane">
            <div className="text-diff-pane-header">{resolvedNewLabel}</div>
            {splitLines.right.map((entry, i) => (
              <div
                key={i}
                className={`text-diff-line ${entry ? `text-diff-line--${entry.type}` : 'text-diff-line--empty-slot'}`}
                aria-label={entry ? getLineAriaLabel(entry) : undefined}
              >
                {showLineNumbers && (
                  <span className="text-diff-line-number">{entry ? entry.lineNumber : ''}</span>
                )}
                <span className="text-diff-line-content">{entry ? (entry.line || '\u00A0') : '\u00A0'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Unified view (default)
  let oldLineNum = 0;
  let newLineNum = 0;

  return (
    <div className="text-diff text-diff--unified" role="region" aria-label={S.TEXT_DIFF_LABEL}>
      <div className="text-diff-header">
        <span className="text-diff-stats">{S.TEXT_DIFF_STATS(stats.added, stats.removed)}</span>
      </div>
      <div className="text-diff-body text-diff-body--unified">
        {diffEntries.map((entry, i) => {
          let leftNum = '';
          let rightNum = '';

          if (entry.type === 'removed') {
            oldLineNum++;
            leftNum = String(oldLineNum);
          } else if (entry.type === 'added') {
            newLineNum++;
            rightNum = String(newLineNum);
          } else {
            oldLineNum++;
            newLineNum++;
            leftNum = String(oldLineNum);
            rightNum = String(newLineNum);
          }

          return (
            <div
              key={i}
              className={`text-diff-line text-diff-line--${entry.type}`}
              aria-label={getLineAriaLabel(entry)}
            >
              {showLineNumbers && (
                <>
                  <span className="text-diff-line-number text-diff-line-number--old">{leftNum}</span>
                  <span className="text-diff-line-number text-diff-line-number--new">{rightNum}</span>
                </>
              )}
              <span className="text-diff-line-prefix">
                {entry.type === 'added' ? '+' : entry.type === 'removed' ? '-' : ' '}
              </span>
              <span className="text-diff-line-content">{entry.line || '\u00A0'}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function getLineAriaLabel(entry: LineDiffEntry): string {
  switch (entry.type) {
    case 'added': return `${S.TEXT_DIFF_ADDED_PREFIX}: ${entry.line}`;
    case 'removed': return `${S.TEXT_DIFF_REMOVED_PREFIX}: ${entry.line}`;
    default: return `${S.TEXT_DIFF_UNCHANGED_PREFIX}: ${entry.line}`;
  }
}

export default React.memo(TextDiff);
