import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Stepper from './Stepper';
import type { StepItem } from './Stepper';

describe('Stepper', () => {
  const sampleSteps: StepItem[] = [
    { label: '계정 생성' },
    { label: '프로필 설정' },
    { label: '완료' },
  ];

  // --- Rendering ---

  it('renders nothing when steps is empty', () => {
    const { container } = render(<Stepper steps={[]} activeStep={0} />);
    expect(container.querySelector('.stepper')).toBeNull();
  });

  it('renders all step labels', () => {
    render(<Stepper steps={sampleSteps} activeStep={0} />);
    expect(screen.getByText('계정 생성')).toBeInTheDocument();
    expect(screen.getByText('프로필 설정')).toBeInTheDocument();
    expect(screen.getByText('완료')).toBeInTheDocument();
  });

  it('renders step numbers in circles', () => {
    const { container } = render(<Stepper steps={sampleSteps} activeStep={0} />);
    const circles = container.querySelectorAll('.stepper__circle');
    expect(circles[0].textContent).toBe('1');
    expect(circles[1].textContent).toBe('2');
    expect(circles[2].textContent).toBe('3');
  });

  it('renders descriptions when provided', () => {
    const steps: StepItem[] = [
      { label: '1단계', description: '세부 설명' },
      { label: '2단계' },
    ];
    render(<Stepper steps={steps} activeStep={0} />);
    expect(screen.getByText('세부 설명')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<Stepper steps={sampleSteps} activeStep={0} />);
    expect(container.querySelector('.stepper__description')).toBeNull();
  });

  // --- Step states ---

  it('marks active step with active class', () => {
    const { container } = render(<Stepper steps={sampleSteps} activeStep={1} />);
    const items = container.querySelectorAll('.stepper__step');
    expect(items[1]).toHaveClass('stepper__step--active');
  });

  it('marks completed steps with completed class', () => {
    const { container } = render(<Stepper steps={sampleSteps} activeStep={2} />);
    const items = container.querySelectorAll('.stepper__step');
    expect(items[0]).toHaveClass('stepper__step--completed');
    expect(items[1]).toHaveClass('stepper__step--completed');
  });

  it('marks pending steps with pending class', () => {
    const { container } = render(<Stepper steps={sampleSteps} activeStep={0} />);
    const items = container.querySelectorAll('.stepper__step');
    expect(items[1]).toHaveClass('stepper__step--pending');
    expect(items[2]).toHaveClass('stepper__step--pending');
  });

  it('shows checkmark for completed steps', () => {
    const { container } = render(<Stepper steps={sampleSteps} activeStep={2} />);
    const circles = container.querySelectorAll('.stepper__circle');
    expect(circles[0].textContent).toContain('✓');
    expect(circles[1].textContent).toContain('✓');
  });

  // --- Icons ---

  it('renders custom icon instead of number', () => {
    const steps: StepItem[] = [
      { label: '첫째', icon: '★' },
      { label: '둘째' },
    ];
    const { container } = render(<Stepper steps={steps} activeStep={1} />);
    const circles = container.querySelectorAll('.stepper__circle');
    expect(circles[0].textContent).toContain('✓'); // completed shows checkmark
    expect(circles[1].textContent).toBe('2');
  });

  it('renders icon for active/pending step', () => {
    const steps: StepItem[] = [
      { label: '첫째', icon: '★' },
      { label: '둘째' },
    ];
    const { container } = render(<Stepper steps={steps} activeStep={0} />);
    const circles = container.querySelectorAll('.stepper__circle');
    expect(circles[0].textContent).toBe('★');
  });

  // --- Orientation ---

  it('renders horizontal by default', () => {
    const { container } = render(<Stepper steps={sampleSteps} activeStep={0} />);
    expect(container.querySelector('.stepper--horizontal')).toBeTruthy();
  });

  it('renders vertical when specified', () => {
    const { container } = render(
      <Stepper steps={sampleSteps} activeStep={0} orientation="vertical" />
    );
    expect(container.querySelector('.stepper--vertical')).toBeTruthy();
  });

  // --- Connectors ---

  it('renders connectors between steps (not after last)', () => {
    const { container } = render(<Stepper steps={sampleSteps} activeStep={0} />);
    const connectors = container.querySelectorAll('.stepper__connector');
    expect(connectors).toHaveLength(2);
  });

  // --- Click handler ---

  it('renders circles as buttons when onStepClick is provided', () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={sampleSteps} activeStep={0} onStepClick={onStepClick} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('calls onStepClick with step index when clicked', () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={sampleSteps} activeStep={0} onStepClick={onStepClick} />);
    fireEvent.click(screen.getByLabelText('2단계: 프로필 설정'));
    expect(onStepClick).toHaveBeenCalledWith(1);
  });

  it('renders circles as divs when onStepClick is not provided', () => {
    render(<Stepper steps={sampleSteps} activeStep={0} />);
    expect(screen.queryAllByRole('button')).toHaveLength(0);
  });

  // --- Accessibility ---

  it('has role="list"', () => {
    render(<Stepper steps={sampleSteps} activeStep={0} />);
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('has aria-label', () => {
    render(<Stepper steps={sampleSteps} activeStep={0} />);
    expect(screen.getByRole('list')).toHaveAttribute('aria-label', '단계 표시');
  });

  it('items have role="listitem"', () => {
    render(<Stepper steps={sampleSteps} activeStep={0} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('marks active step with aria-current="step"', () => {
    const { container } = render(<Stepper steps={sampleSteps} activeStep={1} />);
    const items = container.querySelectorAll('[role="listitem"]');
    expect(items[1]).toHaveAttribute('aria-current', 'step');
    expect(items[0]).not.toHaveAttribute('aria-current');
    expect(items[2]).not.toHaveAttribute('aria-current');
  });

  it('clickable circles have descriptive aria-label', () => {
    const onStepClick = vi.fn();
    render(<Stepper steps={sampleSteps} activeStep={0} onStepClick={onStepClick} />);
    expect(screen.getByLabelText('1단계: 계정 생성')).toBeInTheDocument();
    expect(screen.getByLabelText('3단계: 완료')).toBeInTheDocument();
  });
});
