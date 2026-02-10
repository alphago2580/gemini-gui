import React, { useState, useCallback } from 'react';
import './Accordion.css';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  multiple?: boolean;
  defaultExpanded?: string[];
}

const Accordion: React.FC<AccordionProps> = ({
  items,
  multiple = false,
  defaultExpanded = [],
}) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(defaultExpanded)
  );

  const toggleItem = useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (!multiple) {
          next.clear();
        }
        next.add(id);
      }
      return next;
    });
  }, [multiple]);

  return (
    <div className="accordion" role="presentation">
      {items.map(item => {
        const isExpanded = expandedIds.has(item.id);
        const headerId = `accordion-header-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className={`accordion-item${isExpanded ? ' accordion-item--expanded' : ''}${item.disabled ? ' accordion-item--disabled' : ''}`}
          >
            <button
              id={headerId}
              className="accordion-header"
              onClick={() => !item.disabled && toggleItem(item.id)}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              aria-disabled={item.disabled || undefined}
              disabled={item.disabled}
              type="button"
            >
              <span className="accordion-title">{item.title}</span>
              <span className="accordion-icon" aria-hidden="true">
                {isExpanded ? '▾' : '▸'}
              </span>
            </button>
            <div
              id={panelId}
              className="accordion-panel"
              role="region"
              aria-labelledby={headerId}
              hidden={!isExpanded}
            >
              <div className="accordion-content">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Accordion);
