import React, { useState, useRef, useEffect, useCallback } from 'react';
import './EventLog.css';

export interface EventLogEntry {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  taskId?: string;
  agentId?: string;
  success?: boolean;
  retryCount?: number;
}

export interface EventLogProps {
  events: EventLogEntry[];
  maxVisible?: number;
}

export function formatTimestamp(epochMs: number): string {
  const d = new Date(epochMs);
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  const s = String(d.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

type BadgeVariant = 'success' | 'error' | 'warning' | 'muted';

function getBadgeVariant(type: string, success?: boolean): BadgeVariant {
  switch (type) {
    case 'complete':
    case 'agent-complete':
      return 'success';
    case 'merge':
      return success === false ? 'error' : 'success';
    case 'fail':
    case 'error':
      return 'error';
    case 'idle':
      return 'muted';
    case 'claim':
    case 'agent-start':
    case 'retry':
    case 'test-result':
      return 'warning';
    default:
      return 'muted';
  }
}

const ALL_EVENT_TYPES = [
  'claim', 'test-result', 'merge', 'complete', 'fail',
  'idle', 'error', 'agent-start', 'agent-complete', 'retry',
];

const EventLogEntryRow: React.FC<{ entry: EventLogEntry }> = React.memo(({ entry }) => {
  const variant = getBadgeVariant(entry.type, entry.success);

  return (
    <div className="event-log-entry">
      <span className="event-log-time">{formatTimestamp(entry.timestamp)}</span>
      <span className={`event-log-badge event-log-badge--${variant}`}>{entry.type}</span>
      <span className="event-log-message">{entry.message}</span>
      {entry.taskId && <span className="event-log-chip">{entry.taskId}</span>}
      {entry.agentId && <span className="event-log-chip">{entry.agentId}</span>}
    </div>
  );
});

EventLogEntryRow.displayName = 'EventLogEntryRow';

const EventLog: React.FC<EventLogProps> = ({ events, maxVisible = 200 }) => {
  const [hiddenTypes, setHiddenTypes] = useState<Set<string>>(new Set());
  const listRef = useRef<HTMLDivElement>(null);
  const isSticky = useRef(true);

  const toggleType = useCallback((type: string) => {
    setHiddenTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const filteredEvents = events.filter((e) => !hiddenTypes.has(e.type));
  const visibleEvents = filteredEvents.slice(-maxVisible);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const threshold = 30;
    isSticky.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  useEffect(() => {
    if (isSticky.current && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [events.length]);

  const activeTypes = new Set(events.map((e) => e.type));
  const filterTypes = ALL_EVENT_TYPES.filter((t) => activeTypes.has(t));

  return (
    <div className="event-log" role="region" aria-label="Event Log">
      <h3 className="event-log-title">Event Log</h3>

      {filterTypes.length > 0 && (
        <div className="event-log-filters">
          {filterTypes.map((type) => (
            <button
              key={type}
              className={`event-log-filter-btn${hiddenTypes.has(type) ? ' event-log-filter-btn--off' : ''}`}
              onClick={() => toggleType(type)}
              aria-pressed={!hiddenTypes.has(type)}
            >
              {type}
            </button>
          ))}
        </div>
      )}

      <div className="event-log-list" ref={listRef} onScroll={handleScroll}>
        {visibleEvents.length === 0 ? (
          <div className="event-log-empty">No events</div>
        ) : (
          visibleEvents.map((entry) => (
            <EventLogEntryRow key={entry.id} entry={entry} />
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(EventLog);
