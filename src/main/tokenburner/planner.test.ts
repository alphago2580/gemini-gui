import { describe, it, expect, beforeEach } from 'vitest';
import { Planner, PlannerTask } from './planner';

function makeTask(overrides: Partial<PlannerTask> = {}): PlannerTask {
  return {
    id: 't1',
    title: 'Task 1',
    description: 'Description 1',
    priority: 'normal',
    dependencies: [],
    ...overrides,
  };
}

describe('Planner', () => {
  let planner: Planner;

  beforeEach(() => {
    planner = new Planner();
  });

  describe('addTask / getTask', () => {
    it('should add and retrieve a task', () => {
      planner.addTask(makeTask({ id: 't1', title: 'Build feature' }));
      const task = planner.getTask('t1');
      expect(task).toBeDefined();
      expect(task!.title).toBe('Build feature');
    });

    it('should return undefined for unknown task', () => {
      expect(planner.getTask('nonexistent')).toBeUndefined();
    });

    it('should return a copy, not the original', () => {
      planner.addTask(makeTask({ id: 't1' }));
      const task = planner.getTask('t1');
      task!.title = 'MODIFIED';
      expect(planner.getTask('t1')!.title).toBe('Task 1');
    });
  });

  describe('removeTask', () => {
    it('should remove an existing task', () => {
      planner.addTask(makeTask({ id: 't1' }));
      const removed = planner.removeTask('t1');
      expect(removed).toBe(true);
      expect(planner.getTask('t1')).toBeUndefined();
    });

    it('should return false for unknown task', () => {
      expect(planner.removeTask('nonexistent')).toBe(false);
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks', () => {
      planner.addTask(makeTask({ id: 't1' }));
      planner.addTask(makeTask({ id: 't2' }));
      planner.addTask(makeTask({ id: 't3' }));
      expect(planner.getAllTasks()).toHaveLength(3);
    });

    it('should return empty array when no tasks', () => {
      expect(planner.getAllTasks()).toHaveLength(0);
    });
  });

  describe('getReadyTasks', () => {
    it('should return tasks with no dependencies', () => {
      planner.addTask(makeTask({ id: 't1', dependencies: [] }));
      planner.addTask(makeTask({ id: 't2', dependencies: ['t1'] }));
      const ready = planner.getReadyTasks();
      expect(ready).toHaveLength(1);
      expect(ready[0].id).toBe('t1');
    });

    it('should return tasks whose dependencies are completed', () => {
      planner.addTask(makeTask({ id: 't1', dependencies: [] }));
      planner.addTask(makeTask({ id: 't2', dependencies: ['t1'] }));
      const ready = planner.getReadyTasks(new Set(['t1']));
      expect(ready).toHaveLength(1);
      expect(ready[0].id).toBe('t2');
    });

    it('should exclude already completed tasks', () => {
      planner.addTask(makeTask({ id: 't1', dependencies: [] }));
      const ready = planner.getReadyTasks(new Set(['t1']));
      expect(ready).toHaveLength(0);
    });

    it('should sort by priority', () => {
      planner.addTask(makeTask({ id: 't1', priority: 'low' }));
      planner.addTask(makeTask({ id: 't2', priority: 'critical' }));
      planner.addTask(makeTask({ id: 't3', priority: 'high' }));
      const ready = planner.getReadyTasks();
      expect(ready[0].id).toBe('t2');
      expect(ready[1].id).toBe('t3');
      expect(ready[2].id).toBe('t1');
    });
  });

  describe('buildPlan', () => {
    it('should create phases based on dependencies', () => {
      planner.addTask(makeTask({ id: 't1', dependencies: [] }));
      planner.addTask(makeTask({ id: 't2', dependencies: [] }));
      planner.addTask(makeTask({ id: 't3', dependencies: ['t1', 't2'] }));
      const plan = planner.buildPlan();
      expect(plan.phases).toHaveLength(2);
      expect(plan.phases[0].tasks).toHaveLength(2);
      expect(plan.phases[1].tasks).toHaveLength(1);
      expect(plan.phases[1].tasks[0].id).toBe('t3');
    });

    it('should mark phases with multiple tasks as parallelizable', () => {
      planner.addTask(makeTask({ id: 't1', dependencies: [] }));
      planner.addTask(makeTask({ id: 't2', dependencies: [] }));
      const plan = planner.buildPlan();
      expect(plan.phases[0].parallelizable).toBe(true);
    });

    it('should mark single-task phases as not parallelizable', () => {
      planner.addTask(makeTask({ id: 't1', dependencies: [] }));
      const plan = planner.buildPlan();
      expect(plan.phases[0].parallelizable).toBe(false);
    });

    it('should calculate total tasks', () => {
      planner.addTask(makeTask({ id: 't1' }));
      planner.addTask(makeTask({ id: 't2' }));
      planner.addTask(makeTask({ id: 't3' }));
      const plan = planner.buildPlan();
      expect(plan.totalTasks).toBe(3);
    });

    it('should estimate total duration from critical path', () => {
      planner.addTask(makeTask({ id: 't1', estimatedDuration: 60, dependencies: [] }));
      planner.addTask(makeTask({ id: 't2', estimatedDuration: 30, dependencies: [] }));
      planner.addTask(makeTask({ id: 't3', estimatedDuration: 45, dependencies: ['t1', 't2'] }));
      const plan = planner.buildPlan();
      // Phase 1: max(60, 30) = 60, Phase 2: 45 → total = 105
      expect(plan.estimatedDuration).toBe(105);
    });

    it('should skip already completed tasks', () => {
      planner.addTask(makeTask({ id: 't1', dependencies: [] }));
      planner.addTask(makeTask({ id: 't2', dependencies: ['t1'] }));
      const plan = planner.buildPlan(new Set(['t1']));
      expect(plan.totalTasks).toBe(1);
      expect(plan.phases[0].tasks[0].id).toBe('t2');
    });

    it('should return empty plan when all completed', () => {
      planner.addTask(makeTask({ id: 't1' }));
      const plan = planner.buildPlan(new Set(['t1']));
      expect(plan.totalTasks).toBe(0);
      expect(plan.phases).toHaveLength(0);
    });

    it('should return empty plan when no tasks', () => {
      const plan = planner.buildPlan();
      expect(plan.totalTasks).toBe(0);
      expect(plan.phases).toHaveLength(0);
    });
  });

  describe('hasCycle', () => {
    it('should return false for acyclic graph', () => {
      planner.addTask(makeTask({ id: 't1', dependencies: [] }));
      planner.addTask(makeTask({ id: 't2', dependencies: ['t1'] }));
      planner.addTask(makeTask({ id: 't3', dependencies: ['t2'] }));
      expect(planner.hasCycle()).toBe(false);
    });

    it('should return true for cyclic dependencies', () => {
      planner.addTask(makeTask({ id: 't1', dependencies: ['t3'] }));
      planner.addTask(makeTask({ id: 't2', dependencies: ['t1'] }));
      planner.addTask(makeTask({ id: 't3', dependencies: ['t2'] }));
      expect(planner.hasCycle()).toBe(true);
    });

    it('should return false for empty planner', () => {
      expect(planner.hasCycle()).toBe(false);
    });

    it('should return true for self-referencing task', () => {
      planner.addTask(makeTask({ id: 't1', dependencies: ['t1'] }));
      expect(planner.hasCycle()).toBe(true);
    });
  });

  describe('criticalPath', () => {
    it('should identify the longest path', () => {
      planner.addTask(makeTask({ id: 't1', estimatedDuration: 10, dependencies: [] }));
      planner.addTask(makeTask({ id: 't2', estimatedDuration: 50, dependencies: ['t1'] }));
      planner.addTask(makeTask({ id: 't3', estimatedDuration: 5, dependencies: ['t1'] }));
      const plan = planner.buildPlan();
      expect(plan.criticalPath).toContain('t1');
      expect(plan.criticalPath).toContain('t2');
      expect(plan.criticalPath).not.toContain('t3');
    });

    it('should return empty for no tasks', () => {
      const plan = planner.buildPlan();
      expect(plan.criticalPath).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should remove all tasks', () => {
      planner.addTask(makeTask({ id: 't1' }));
      planner.addTask(makeTask({ id: 't2' }));
      planner.clear();
      expect(planner.getAllTasks()).toHaveLength(0);
    });
  });
});
