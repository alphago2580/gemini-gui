import React from 'react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  icon?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: string;
  maxItems?: number;
  collapsedLabel?: string;
}

const BreadcrumbInner: React.FC<BreadcrumbProps> = ({
  items,
  separator = '/',
  maxItems,
  collapsedLabel = '...',
}) => {
  const [expanded, setExpanded] = React.useState(false);

  if (items.length === 0) return null;

  const shouldCollapse = maxItems && maxItems > 1 && items.length > maxItems && !expanded;

  let displayItems: (BreadcrumbItem | 'collapsed')[];
  if (shouldCollapse) {
    const firstItem = items[0];
    const lastItems = items.slice(-(maxItems - 1));
    displayItems = [firstItem, 'collapsed' as const, ...lastItems];
  } else {
    displayItems = [...items];
  }

  return (
    <nav className="breadcrumb" aria-label="탐색 경로">
      <ol className="breadcrumb__list">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;

          if (item === 'collapsed') {
            return (
              <li key="collapsed" className="breadcrumb__item">
                <button
                  className="breadcrumb__collapsed-btn"
                  onClick={() => setExpanded(true)}
                  aria-label="숨겨진 경로 표시"
                  title="모두 표시"
                >
                  {collapsedLabel}
                </button>
                <span className="breadcrumb__separator" aria-hidden="true">
                  {separator}
                </span>
              </li>
            );
          }

          return (
            <li
              key={`${item.label}-${index}`}
              className="breadcrumb__item"
              aria-current={isLast ? 'page' : undefined}
            >
              {item.icon && (
                <span className="breadcrumb__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              {isLast || !item.onClick ? (
                <span
                  className={`breadcrumb__text ${isLast ? 'breadcrumb__text--current' : ''}`}
                >
                  {item.label}
                </span>
              ) : (
                <button
                  className="breadcrumb__link"
                  onClick={item.onClick}
                  aria-label={item.label}
                >
                  {item.label}
                </button>
              )}
              {!isLast && (
                <span className="breadcrumb__separator" aria-hidden="true">
                  {separator}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const Breadcrumb = React.memo(BreadcrumbInner);
export default Breadcrumb;
