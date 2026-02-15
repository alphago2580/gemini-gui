import React, { useState, useCallback, useMemo } from 'react';
import './JsonViewer.css';

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface JsonViewerProps {
  data: JsonValue;
  defaultExpanded?: boolean;
  maxDepth?: number;
  rootName?: string;
  enableCopy?: boolean;
  onCopy?: (path: string, value: JsonValue) => void;
  indentSize?: number;
  className?: string;
}

const getType = (value: JsonValue): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const getPreview = (value: JsonValue): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return `{${keys.length}}`;
  }
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
};

const formatValue = (value: JsonValue): string => {
  if (value === null) return 'null';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
};

interface JsonNodeProps {
  name: string;
  value: JsonValue;
  depth: number;
  maxDepth: number;
  defaultExpanded: boolean;
  enableCopy: boolean;
  onCopy?: (path: string, value: JsonValue) => void;
  path: string;
  indentSize: number;
  isLast: boolean;
}

const JsonNode: React.FC<JsonNodeProps> = ({
  name,
  value,
  depth,
  maxDepth,
  defaultExpanded,
  enableCopy,
  onCopy,
  path,
  indentSize,
  isLast,
}) => {
  const [expanded, setExpanded] = useState(() => defaultExpanded && depth < maxDepth);
  const [copied, setCopied] = useState(false);

  const type = getType(value);
  const isExpandable = type === 'object' || type === 'array';

  const toggleExpand = useCallback(() => {
    if (isExpandable) {
      setExpanded(prev => !prev);
    }
  }, [isExpandable]);

  const handleCopy = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const text = JSON.stringify(value, null, 2);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      onCopy?.(path, value);
    });
  }, [value, path, onCopy]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand();
    }
  }, [toggleExpand]);

  const paddingLeft = depth * indentSize;

  if (!isExpandable) {
    return (
      <div
        className="json-viewer-leaf"
        style={{ paddingLeft: `${paddingLeft}px` }}
      >
        <span className="json-viewer-key">{name}</span>
        <span className="json-viewer-colon">: </span>
        <span className={`json-viewer-value json-viewer-value--${type}`}>
          {formatValue(value)}
        </span>
        {!isLast && <span className="json-viewer-comma">,</span>}
        {enableCopy && (
          <button
            className="json-viewer-copy-btn"
            onClick={handleCopy}
            aria-label={`${name} 복사`}
            title={copied ? '복사됨' : '복사'}
          >
            {copied ? '✓' : '⎘'}
          </button>
        )}
      </div>
    );
  }

  const isArray = type === 'array';
  const entries = isArray
    ? (value as JsonValue[]).map((v, i) => [String(i), v] as const)
    : Object.entries(value as Record<string, JsonValue>);
  const openBracket = isArray ? '[' : '{';
  const closeBracket = isArray ? ']' : '}';

  return (
    <div className="json-viewer-node" data-depth={depth}>
      <div
        className="json-viewer-row"
        style={{ paddingLeft: `${paddingLeft}px` }}
        onClick={toggleExpand}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-expanded={expanded}
        aria-label={`${name} ${getPreview(value)}`}
      >
        <span className={`json-viewer-chevron${expanded ? ' json-viewer-chevron--open' : ''}`} aria-hidden="true">
          ▶
        </span>
        <span className="json-viewer-key">{name}</span>
        <span className="json-viewer-colon">: </span>
        {!expanded && (
          <span className="json-viewer-preview">
            {getPreview(value)}
          </span>
        )}
        {expanded && (
          <span className="json-viewer-bracket">{openBracket}</span>
        )}
        {!expanded && !isLast && <span className="json-viewer-comma">,</span>}
        {enableCopy && (
          <button
            className="json-viewer-copy-btn"
            onClick={handleCopy}
            aria-label={`${name} 복사`}
            title={copied ? '복사됨' : '복사'}
          >
            {copied ? '✓' : '⎘'}
          </button>
        )}
      </div>
      {expanded && (
        <>
          <div className="json-viewer-children" role="group">
            {entries.map(([key, val], index) => (
              <JsonNode
                key={key}
                name={key}
                value={val}
                depth={depth + 1}
                maxDepth={maxDepth}
                defaultExpanded={defaultExpanded}
                enableCopy={enableCopy}
                onCopy={onCopy}
                path={`${path}.${key}`}
                indentSize={indentSize}
                isLast={index === entries.length - 1}
              />
            ))}
          </div>
          <div
            className="json-viewer-close-bracket"
            style={{ paddingLeft: `${paddingLeft}px` }}
          >
            {closeBracket}
            {!isLast && <span className="json-viewer-comma">,</span>}
          </div>
        </>
      )}
    </div>
  );
};

const JsonViewer: React.FC<JsonViewerProps> = ({
  data,
  defaultExpanded = true,
  maxDepth = 10,
  rootName = 'root',
  enableCopy = true,
  onCopy,
  indentSize = 16,
  className,
}) => {
  const classNames = useMemo(
    () => ['json-viewer', className].filter(Boolean).join(' '),
    [className]
  );

  return (
    <div className={classNames} role="tree" aria-label="JSON 뷰어">
      <JsonNode
        name={rootName}
        value={data}
        depth={0}
        maxDepth={maxDepth}
        defaultExpanded={defaultExpanded}
        enableCopy={enableCopy}
        onCopy={onCopy}
        path={rootName}
        indentSize={indentSize}
        isLast={true}
      />
    </div>
  );
};

export default React.memo(JsonViewer);
