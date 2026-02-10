import React from 'react';
import './ReadingProgressBar.css';
import * as S from '../constants/strings';

export interface ReadingProgressBarProps {
  progress: number;
  isVisible: boolean;
}

const ReadingProgressBarInner: React.FC<ReadingProgressBarProps> = ({ progress, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div
      className="reading-progress-bar"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${S.READING_PROGRESS_LABEL} ${progress}%`}
    >
      <div
        className="reading-progress-fill"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

const ReadingProgressBar = React.memo(ReadingProgressBarInner);
export default ReadingProgressBar;
