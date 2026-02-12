import React, { useState } from 'react';
import './TaskQueuePanel.css';

export type TaskStatus = 'pending' | 'active' | 'complete' | 'failed';
export type TaskPriority = 'critical' | 'high' | 'normal' | 'low';

export interface TaskItem {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee?: string;
  failReason?: string;
}

export interface TaskQueuePanelProps {
  tasks: TaskItem[];
  onAddTask?: (title: string, priority: TaskPriority) => void;
}

type FilterTab = 'all' | TaskStatus;

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'Active' },
  { key: 'complete', label: 'Complete' },
  { key: 'failed', label: 'Failed' },
];

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: 'red',
  high: 'orange',
  normal: 'blue',
  low: 'gray',
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  complete: 'Complete',
  failed: 'Failed',
};

const TaskQueuePanel: React.FC<TaskQueuePanelProps> = ({ tasks, onAddTask }) => {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<TaskPriority>('normal');

  const filteredTasks = activeTab === 'all'
    ? tasks
    : tasks.filter((t) => t.status === activeTab);

  const handleSubmit = () => {
    if (newTitle.trim() && onAddTask) {
      onAddTask(newTitle.trim(), newPriority);
      setNewTitle('');
      setNewPriority('normal');
      setShowAddForm(false);
    }
  };

  return (
    <div className="task-queue-panel" role="region" aria-label="Task Queue">
      <div className="task-queue-header">
        <h3 className="task-queue-title">Task Queue</h3>
        {onAddTask && (
          <button
            className="task-queue-add-btn"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : 'Add Task'}
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="task-queue-form">
          <input
            className="task-queue-input"
            type="text"
            placeholder="Task title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
          <select
            className="task-queue-select"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
            aria-label="Priority"
          >
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="normal">Normal</option>
            <option value="low">Low</option>
          </select>
          <button className="task-queue-submit-btn" onClick={handleSubmit}>
            Add
          </button>
        </div>
      )}

      <div className="task-queue-tabs" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`task-queue-tab${activeTab === tab.key ? ' task-queue-tab--active' : ''}`}
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="task-queue-list">
        {filteredTasks.length === 0 ? (
          <div className="task-queue-empty">No tasks</div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="task-queue-item" data-status={task.status}>
              <span
                className={`task-priority-dot task-priority-dot--${PRIORITY_COLORS[task.priority]}`}
                aria-label={task.priority}
              />
              <span className="task-title">{task.title}</span>
              <span className={`task-status-badge task-status-badge--${task.status}`}>
                {STATUS_LABELS[task.status]}
              </span>
              {task.assignee && (
                <span className="task-assignee">{task.assignee}</span>
              )}
              {task.failReason && (
                <span className="task-fail-reason" title={task.failReason}>
                  {task.failReason}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(TaskQueuePanel);
