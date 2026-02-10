import React, { useMemo, useCallback } from 'react';
import './Pagination.css';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showFirstLast?: boolean;
  disabled?: boolean;
}

function generatePageRange(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): (number | 'ellipsis')[] {
  if (totalPages <= 1) return [1];

  const range: (number | 'ellipsis')[] = [];
  const leftSibling = Math.max(2, currentPage - siblingCount);
  const rightSibling = Math.min(totalPages - 1, currentPage + siblingCount);

  range.push(1);

  if (leftSibling > 2) {
    range.push('ellipsis');
  }

  for (let i = leftSibling; i <= rightSibling; i++) {
    if (i !== 1 && i !== totalPages) {
      range.push(i);
    }
  }

  if (rightSibling < totalPages - 1) {
    range.push('ellipsis');
  }

  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
}

const PaginationInner: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showFirstLast = true,
  disabled = false,
}) => {
  const pages = useMemo(
    () => generatePageRange(currentPage, totalPages, siblingCount),
    [currentPage, totalPages, siblingCount]
  );

  const handlePrevious = useCallback(() => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  }, [currentPage, onPageChange]);

  const handleNext = useCallback(() => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  }, [currentPage, totalPages, onPageChange]);

  const handleFirst = useCallback(() => {
    onPageChange(1);
  }, [onPageChange]);

  const handleLast = useCallback(() => {
    onPageChange(totalPages);
  }, [totalPages, onPageChange]);

  if (totalPages <= 0) return null;

  return (
    <nav className="pagination" aria-label="페이지 탐색">
      <ul className="pagination__list">
        {showFirstLast && (
          <li className="pagination__item">
            <button
              className="pagination__btn pagination__btn--nav"
              onClick={handleFirst}
              disabled={disabled || currentPage === 1}
              aria-label="첫 페이지"
              title="첫 페이지"
            >
              &#171;
            </button>
          </li>
        )}
        <li className="pagination__item">
          <button
            className="pagination__btn pagination__btn--nav"
            onClick={handlePrevious}
            disabled={disabled || currentPage === 1}
            aria-label="이전 페이지"
            title="이전 페이지"
          >
            &#8249;
          </button>
        </li>

        {pages.map((page, index) => {
          if (page === 'ellipsis') {
            return (
              <li key={`ellipsis-${index}`} className="pagination__item">
                <span className="pagination__ellipsis" aria-hidden="true">
                  &hellip;
                </span>
              </li>
            );
          }

          const isActive = page === currentPage;
          return (
            <li key={page} className="pagination__item">
              <button
                className={`pagination__btn ${isActive ? 'pagination__btn--active' : ''}`}
                onClick={() => onPageChange(page)}
                disabled={disabled}
                aria-label={`${page} 페이지`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            </li>
          );
        })}

        <li className="pagination__item">
          <button
            className="pagination__btn pagination__btn--nav"
            onClick={handleNext}
            disabled={disabled || currentPage === totalPages}
            aria-label="다음 페이지"
            title="다음 페이지"
          >
            &#8250;
          </button>
        </li>
        {showFirstLast && (
          <li className="pagination__item">
            <button
              className="pagination__btn pagination__btn--nav"
              onClick={handleLast}
              disabled={disabled || currentPage === totalPages}
              aria-label="마지막 페이지"
              title="마지막 페이지"
            >
              &#187;
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
};

const Pagination = React.memo(PaginationInner);
export default Pagination;
export { generatePageRange };
