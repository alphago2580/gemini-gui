import React, { useState, useMemo, useCallback } from 'react';
import Dialog from '../Dialog';
import Stepper from '../Stepper';
import type { TaskPriority } from '../../../main/tokenburner/types';
import './PlannerWizard.css';

export interface PlannerTaskInput {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dependencies: string[];
  estimatedDuration?: number;
}

interface PlanPhase {
  phase: number;
  tasks: PlannerTaskInput[];
  parallelizable: boolean;
}

interface ExecutionPlan {
  phases: PlanPhase[];
  totalTasks: number;
  estimatedDuration: number;
  criticalPath: string[];
}

export interface PlannerWizardProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (tasks: PlannerTaskInput[]) => void;
  existingTasks?: PlannerTaskInput[];
}

const WIZARD_STEPS = [
  { label: 'Add Tasks' },
  { label: 'Dependencies' },
  { label: 'Review Plan' },
];

let nextId = 1;
function generateId(): string {
  return `task-${nextId++}`;
}

// ── Plan-building utilities (pure, no main-process dependency) ──

function hasCycle(tasks: PlannerTaskInput[]): boolean {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const visited = new Set<string>();
  const inStack = new Set<string>();

  const dfs = (id: string): boolean => {
    if (inStack.has(id)) return true;
    if (visited.has(id)) return false;
    visited.add(id);
    inStack.add(id);
    const task = taskMap.get(id);
    if (task) {
      for (const depId of task.dependencies) {
        if (taskMap.has(depId) && dfs(depId)) return true;
      }
    }
    inStack.delete(id);
    return false;
  };

  for (const id of taskMap.keys()) {
    if (dfs(id)) return true;
  }
  return false;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
};

function buildPlan(tasks: PlannerTaskInput[]): ExecutionPlan {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const phases: PlanPhase[] = [];
  const done = new Set<string>();
  const remaining = new Set(taskMap.keys());
  let phaseNum = 1;

  while (remaining.size > 0) {
    const ready = [...remaining].filter((id) => {
      const task = taskMap.get(id)!;
      return task.dependencies.every((depId) => done.has(depId));
    });

    if (ready.length === 0) break;

    const phaseTasks = ready
      .map((id) => taskMap.get(id)!)
      .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);

    phases.push({
      phase: phaseNum++,
      tasks: phaseTasks,
      parallelizable: phaseTasks.length > 1,
    });

    for (const id of ready) {
      done.add(id);
      remaining.delete(id);
    }
  }

  const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
  const estimatedDuration = phases.reduce((sum, p) => {
    const maxInPhase = Math.max(...p.tasks.map((t) => t.estimatedDuration ?? 0), 0);
    return sum + maxInPhase;
  }, 0);

  const criticalPath = hasCycle(tasks) ? [] : computeCriticalPath(tasks);

  return { phases, totalTasks, estimatedDuration, criticalPath };
}

function computeCriticalPath(tasks: PlannerTaskInput[]): string[] {
  const taskMap = new Map(tasks.map((t) => [t.id, t]));
  const memo = new Map<string, number>();

  const longestPath = (id: string): number => {
    if (memo.has(id)) return memo.get(id)!;
    const task = taskMap.get(id);
    if (!task) return 0;
    const ownDuration = task.estimatedDuration ?? 0;
    let maxDep = 0;
    for (const depId of task.dependencies) {
      maxDep = Math.max(maxDep, longestPath(depId));
    }
    const total = ownDuration + maxDep;
    memo.set(id, total);
    return total;
  };

  const ids = [...taskMap.keys()];
  if (ids.length === 0) return [];

  let maxLen = 0;
  let endNode = ids[0];
  for (const id of ids) {
    const len = longestPath(id);
    if (len > maxLen) {
      maxLen = len;
      endNode = id;
    }
  }

  const path: string[] = [];
  const trace = (id: string): void => {
    const task = taskMap.get(id);
    if (!task) return;
    let bestDep = '';
    let bestLen = -1;
    for (const depId of task.dependencies) {
      const len = longestPath(depId);
      if (len > bestLen) {
        bestLen = len;
        bestDep = depId;
      }
    }
    if (bestDep && bestLen > 0) trace(bestDep);
    path.push(id);
  };
  trace(endNode);
  return path;
}

// ── Step sub-components ──

interface TaskInputStepProps {
  tasks: PlannerTaskInput[];
  onAdd: (task: PlannerTaskInput) => void;
  onRemove: (id: string) => void;
}

const TaskInputStep: React.FC<TaskInputStepProps> = ({ tasks, onAdd, onRemove }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [duration, setDuration] = useState('');

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd({
      id: generateId(),
      title: title.trim(),
      description: description.trim(),
      priority,
      dependencies: [],
      estimatedDuration: duration ? Number(duration) : undefined,
    });
    setTitle('');
    setDescription('');
    setPriority('normal');
    setDuration('');
  };

  return (
    <div>
      <div className="pw-task-form">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
          aria-label="Priority"
        >
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="normal">Normal</option>
          <option value="low">Low</option>
        </select>
        <input
          type="number"
          placeholder="Duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          min={0}
          aria-label="Estimated duration"
        />
        <button className="pw-add-btn" onClick={handleAdd} disabled={!title.trim()}>
          Add
        </button>
      </div>
      {tasks.length === 0 ? (
        <div className="pw-empty">No tasks added yet</div>
      ) : (
        <div className="pw-task-list">
          {tasks.map((task) => (
            <div key={task.id} className="pw-task-item">
              <span className="pw-task-item-title" title={task.title}>{task.title}</span>
              <span className={`pw-task-item-priority pw-task-item-priority--${task.priority}`}>
                {task.priority}
              </span>
              {task.estimatedDuration != null && (
                <span className="pw-task-item-duration">{task.estimatedDuration}m</span>
              )}
              <button className="pw-remove-btn" onClick={() => onRemove(task.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface DependencyStepProps {
  tasks: PlannerTaskInput[];
  onUpdateDeps: (taskId: string, deps: string[]) => void;
  hasCycleError: boolean;
}

const DependencyStep: React.FC<DependencyStepProps> = ({ tasks, onUpdateDeps, hasCycleError }) => {
  return (
    <div>
      {tasks.length <= 1 ? (
        <div className="pw-empty">Add at least 2 tasks to define dependencies</div>
      ) : (
        tasks.map((task) => {
          const others = tasks.filter((t) => t.id !== task.id);
          return (
            <div key={task.id} className="pw-dep-section">
              <div className="pw-dep-task-title">{task.title}</div>
              <div className="pw-dep-options">
                {others.map((other) => (
                  <label key={other.id} className="pw-dep-option">
                    <input
                      type="checkbox"
                      checked={task.dependencies.includes(other.id)}
                      onChange={(e) => {
                        const newDeps = e.target.checked
                          ? [...task.dependencies, other.id]
                          : task.dependencies.filter((d) => d !== other.id);
                        onUpdateDeps(task.id, newDeps);
                      }}
                    />
                    {other.title}
                  </label>
                ))}
              </div>
            </div>
          );
        })
      )}
      {hasCycleError && (
        <div className="pw-cycle-warning" role="alert">
          Circular dependency detected! Please remove a dependency to continue.
        </div>
      )}
    </div>
  );
};

interface ReviewStepProps {
  plan: ExecutionPlan;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ plan }) => {
  const criticalSet = new Set(plan.criticalPath);

  return (
    <div>
      <div className="pw-review-summary">
        <div className="pw-review-stat">
          <span className="pw-review-stat-label">Total Tasks</span>
          <span className="pw-review-stat-value">{plan.totalTasks}</span>
        </div>
        <div className="pw-review-stat">
          <span className="pw-review-stat-label">Phases</span>
          <span className="pw-review-stat-value">{plan.phases.length}</span>
        </div>
        <div className="pw-review-stat">
          <span className="pw-review-stat-label">Est. Duration</span>
          <span className="pw-review-stat-value">{plan.estimatedDuration}m</span>
        </div>
      </div>
      {plan.phases.map((phase) => (
        <div key={phase.phase} className="pw-phase">
          <div className="pw-phase-header">
            <span className="pw-phase-label">Phase {phase.phase}</span>
            {phase.parallelizable && (
              <span className="pw-phase-parallel">Parallel</span>
            )}
          </div>
          <div className="pw-phase-tasks">
            {phase.tasks.map((task) => {
              const isCritical = criticalSet.has(task.id);
              return (
                <div
                  key={task.id}
                  className={`pw-phase-task${isCritical ? ' pw-phase-task--critical-path' : ''}`}
                >
                  <span>{task.title}</span>
                  {isCritical && <span className="pw-critical-path-badge">Critical Path</span>}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Main wizard ──

const PlannerWizard: React.FC<PlannerWizardProps> = ({ open, onClose, onSubmit, existingTasks }) => {
  const [step, setStep] = useState(0);
  const [tasks, setTasks] = useState<PlannerTaskInput[]>(existingTasks ?? []);

  const handleAddTask = useCallback((task: PlannerTaskInput) => {
    setTasks((prev) => [...prev, task]);
  }, []);

  const handleRemoveTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleUpdateDeps = useCallback((taskId: string, deps: string[]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, dependencies: deps } : t)),
    );
  }, []);

  const cycleExists = useMemo(() => hasCycle(tasks), [tasks]);
  const plan = useMemo(() => buildPlan(tasks), [tasks]);

  const canGoNext = step === 0 ? tasks.length > 0 : step === 1 ? !cycleExists : true;

  const handleNext = () => {
    if (step < 2 && canGoNext) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = () => {
    onSubmit(tasks);
  };

  const footer = (
    <div className="pw-footer">
      {step > 0 && (
        <button className="pw-btn pw-btn--secondary" onClick={handleBack}>
          Back
        </button>
      )}
      {step < 2 ? (
        <button className="pw-btn pw-btn--primary" onClick={handleNext} disabled={!canGoNext}>
          Next
        </button>
      ) : (
        <button className="pw-btn pw-btn--primary" onClick={handleSubmit}>
          Submit
        </button>
      )}
    </div>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Plan Tasks"
      size="large"
      footer={footer}
      ariaLabel="Task Planning Wizard"
    >
      <div className="pw-stepper-wrap">
        <Stepper steps={WIZARD_STEPS} activeStep={step} />
      </div>
      {step === 0 && (
        <TaskInputStep tasks={tasks} onAdd={handleAddTask} onRemove={handleRemoveTask} />
      )}
      {step === 1 && (
        <DependencyStep
          tasks={tasks}
          onUpdateDeps={handleUpdateDeps}
          hasCycleError={cycleExists}
        />
      )}
      {step === 2 && <ReviewStep plan={plan} />}
    </Dialog>
  );
};

export default React.memo(PlannerWizard);
