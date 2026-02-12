import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';
import PlannerWizard, { PlannerTaskInput } from './PlannerWizard';

function addTask(title: string, priority = 'Normal', duration?: string) {
  const titleInput = screen.getByPlaceholderText('Task title');
  fireEvent.change(titleInput, { target: { value: title } });
  if (priority !== 'Normal') {
    const sel = screen.getByLabelText('Priority');
    fireEvent.change(sel, { target: { value: priority.toLowerCase() } });
  }
  if (duration) {
    const durInput = screen.getByLabelText('Estimated duration');
    fireEvent.change(durInput, { target: { value: duration } });
  }
  fireEvent.click(screen.getByText('Add'));
}

function goNext() {
  fireEvent.click(screen.getByText('Next'));
}

function goBack() {
  fireEvent.click(screen.getByText('Back'));
}

describe('PlannerWizard', () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
  };

  // ── Rendering ──

  describe('rendering', () => {
    it('renders nothing when open=false', () => {
      const { container } = render(
        <PlannerWizard open={false} onClose={vi.fn()} onSubmit={vi.fn()} />,
      );
      expect(container.querySelector('.dialog')).not.toBeInTheDocument();
    });

    it('renders dialog with stepper when open=true', () => {
      render(<PlannerWizard {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('list', { name: /단계 표시/ })).toBeInTheDocument();
    });

    it('shows 3 steps in stepper', () => {
      render(<PlannerWizard {...defaultProps} />);
      expect(screen.getByText('Add Tasks')).toBeInTheDocument();
      expect(screen.getByText('Dependencies')).toBeInTheDocument();
      expect(screen.getByText('Review Plan')).toBeInTheDocument();
    });

    it('starts on step 1 (Add Tasks)', () => {
      render(<PlannerWizard {...defaultProps} />);
      expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
      expect(screen.getByText('No tasks added yet')).toBeInTheDocument();
    });
  });

  // ── Step 1: Add Tasks ──

  describe('step 1 — add tasks', () => {
    it('can fill in and add a task', () => {
      render(<PlannerWizard {...defaultProps} />);
      addTask('Build Button');
      expect(screen.getByText('Build Button')).toBeInTheDocument();
    });

    it('shows added tasks in list', () => {
      render(<PlannerWizard {...defaultProps} />);
      addTask('Task A');
      addTask('Task B');
      expect(screen.getByText('Task A')).toBeInTheDocument();
      expect(screen.getByText('Task B')).toBeInTheDocument();
    });

    it('can remove a task from list', () => {
      render(<PlannerWizard {...defaultProps} />);
      addTask('To Remove');
      expect(screen.getByText('To Remove')).toBeInTheDocument();
      fireEvent.click(screen.getByText('Remove'));
      expect(screen.queryByText('To Remove')).not.toBeInTheDocument();
    });

    it('Next button disabled when no tasks added', () => {
      render(<PlannerWizard {...defaultProps} />);
      const nextBtn = screen.getByText('Next');
      expect(nextBtn).toBeDisabled();
    });

    it('Next button enabled after adding a task', () => {
      render(<PlannerWizard {...defaultProps} />);
      addTask('Something');
      const nextBtn = screen.getByText('Next');
      expect(nextBtn).not.toBeDisabled();
    });

    it('priority selector works', () => {
      render(<PlannerWizard {...defaultProps} />);
      addTask('Critical Task', 'Critical');
      expect(screen.getByText('critical')).toBeInTheDocument();
    });

    it('estimated duration input accepts numbers', () => {
      render(<PlannerWizard {...defaultProps} />);
      addTask('Timed Task', 'Normal', '30');
      expect(screen.getByText('30m')).toBeInTheDocument();
    });
  });

  // ── Step 2: Dependencies ──

  describe('step 2 — dependencies', () => {
    function setupStep2(taskCount = 2) {
      render(<PlannerWizard {...defaultProps} />);
      for (let i = 1; i <= taskCount; i++) {
        addTask(`Task ${i}`);
      }
      goNext();
    }

    it('shows all tasks for dependency selection', () => {
      setupStep2(3);
      // Each task name appears as both a section title and as checkbox labels in other sections
      expect(screen.getAllByText('Task 1').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Task 2').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('Task 3').length).toBeGreaterThanOrEqual(1);
    });

    it('can select dependencies for a task', () => {
      setupStep2(2);
      // Task 1 section should show checkbox for Task 2
      const sections = document.querySelectorAll('.pw-dep-section');
      const firstSection = sections[0];
      const checkbox = within(firstSection as HTMLElement).getByRole('checkbox');
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });

    it('shows cycle detection warning when circular dependency created', () => {
      setupStep2(2);
      // Make Task 1 depend on Task 2
      const sections = document.querySelectorAll('.pw-dep-section');
      const firstCheckbox = within(sections[0] as HTMLElement).getByRole('checkbox');
      fireEvent.click(firstCheckbox);
      // Make Task 2 depend on Task 1 (cycle)
      const secondCheckbox = within(sections[1] as HTMLElement).getByRole('checkbox');
      fireEvent.click(secondCheckbox);
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Circular dependency/)).toBeInTheDocument();
    });

    it('Next disabled when cycle exists', () => {
      setupStep2(2);
      const sections = document.querySelectorAll('.pw-dep-section');
      const firstCheckbox = within(sections[0] as HTMLElement).getByRole('checkbox');
      fireEvent.click(firstCheckbox);
      const secondCheckbox = within(sections[1] as HTMLElement).getByRole('checkbox');
      fireEvent.click(secondCheckbox);
      expect(screen.getByText('Next')).toBeDisabled();
    });

    it('can navigate back to step 1', () => {
      setupStep2();
      goBack();
      expect(screen.getByPlaceholderText('Task title')).toBeInTheDocument();
    });

    it('shows message for single task', () => {
      render(<PlannerWizard {...defaultProps} />);
      addTask('Solo');
      goNext();
      expect(screen.getByText(/at least 2 tasks/)).toBeInTheDocument();
    });
  });

  // ── Step 3: Review ──

  describe('step 3 — review', () => {
    function setupStep3() {
      render(<PlannerWizard {...defaultProps} />);
      addTask('Task A', 'Normal', '10');
      addTask('Task B', 'High', '20');
      goNext();
      // Set Task B depends on Task A
      const sections = document.querySelectorAll('.pw-dep-section');
      // Second section is Task B, checkbox for Task A
      const checkbox = within(sections[1] as HTMLElement).getByRole('checkbox');
      fireEvent.click(checkbox);
      goNext();
    }

    it('displays execution phases', () => {
      setupStep3();
      expect(screen.getByText('Phase 1')).toBeInTheDocument();
      expect(screen.getByText('Phase 2')).toBeInTheDocument();
    });

    it('shows phase parallelization indicator', () => {
      render(<PlannerWizard {...defaultProps} />);
      addTask('A', 'Normal', '5');
      addTask('B', 'Normal', '5');
      addTask('C', 'Normal', '5');
      goNext(); // step 2 — no deps, so all go in one parallel phase
      goNext(); // step 3
      expect(screen.getByText('Parallel')).toBeInTheDocument();
    });

    it('displays estimated total duration', () => {
      setupStep3();
      // Phase 1: Task A (10m), Phase 2: Task B (20m) → total 30m
      expect(screen.getByText('30m')).toBeInTheDocument();
    });

    it('highlights critical path tasks', () => {
      setupStep3();
      const badges = document.querySelectorAll('.pw-critical-path-badge');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('Submit calls onSubmit with all tasks', () => {
      const onSubmit = vi.fn();
      render(<PlannerWizard open={true} onClose={vi.fn()} onSubmit={onSubmit} />);
      addTask('Only Task');
      goNext();
      goNext();
      fireEvent.click(screen.getByText('Submit'));
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit.mock.calls[0][0]).toHaveLength(1);
      expect(onSubmit.mock.calls[0][0][0].title).toBe('Only Task');
    });

    it('can navigate back to step 2', () => {
      setupStep3();
      goBack();
      // Should see dependency sections again
      expect(document.querySelector('.pw-dep-section')).toBeInTheDocument();
    });
  });

  // ── Navigation ──

  describe('navigation', () => {
    it('stepper reflects current active step', () => {
      render(<PlannerWizard {...defaultProps} />);
      // Step 1 should be active
      const list = screen.getByRole('list', { name: /단계 표시/ });
      const items = within(list).getAllByRole('listitem');
      expect(items[0].getAttribute('aria-current')).toBe('step');
    });

    it('completed steps show checkmark', () => {
      render(<PlannerWizard {...defaultProps} />);
      addTask('Foo');
      goNext();
      // Step 1 is now completed — stepper shows ✓
      const list = screen.getByRole('list', { name: /단계 표시/ });
      const items = within(list).getAllByRole('listitem');
      expect(items[0].textContent).toContain('✓');
    });

    it('close button calls onClose', () => {
      const onClose = vi.fn();
      render(<PlannerWizard open={true} onClose={onClose} onSubmit={vi.fn()} />);
      fireEvent.click(screen.getByLabelText('닫기'));
      expect(onClose).toHaveBeenCalled();
    });
  });

  // ── Edge Cases ──

  describe('edge cases', () => {
    it('works with existingTasks prop (edit mode)', () => {
      const existing: PlannerTaskInput[] = [
        { id: 'e1', title: 'Existing One', description: '', priority: 'high', dependencies: [] },
        { id: 'e2', title: 'Existing Two', description: '', priority: 'low', dependencies: [] },
      ];
      render(<PlannerWizard {...defaultProps} existingTasks={existing} />);
      expect(screen.getByText('Existing One')).toBeInTheDocument();
      expect(screen.getByText('Existing Two')).toBeInTheDocument();
    });

    it('empty description is allowed', () => {
      render(<PlannerWizard {...defaultProps} />);
      addTask('No Desc');
      expect(screen.getByText('No Desc')).toBeInTheDocument();
    });

    it('long task titles are truncated in display', () => {
      render(<PlannerWizard {...defaultProps} />);
      const longTitle = 'A'.repeat(200);
      addTask(longTitle);
      const titleEl = document.querySelector('.pw-task-item-title');
      expect(titleEl).toBeInTheDocument();
      // The CSS handles truncation via text-overflow: ellipsis
      expect(titleEl!.textContent).toBe(longTitle);
      expect(titleEl!.getAttribute('title')).toBe(longTitle);
    });

    it('does not add task with empty title', () => {
      render(<PlannerWizard {...defaultProps} />);
      const addBtn = screen.getByText('Add');
      expect(addBtn).toBeDisabled();
      expect(screen.getByText('No tasks added yet')).toBeInTheDocument();
    });
  });
});
