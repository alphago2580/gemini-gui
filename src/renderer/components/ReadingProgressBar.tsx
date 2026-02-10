import React from 'react';
import './ReadingProgressBar.css';

interface ReadingProgressBarProps {
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
      aria-label={`읽기 진행률 ${progress}%`}
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
