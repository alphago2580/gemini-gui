import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStepWizard } from './useStepWizard';

describe('useStepWizard', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 5 }));
    expect(result.current.currentStep).toBe(0);
    expect(result.current.totalSteps).toBe(5);
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.canGoPrev).toBe(false);
    expect(result.current.canGoNext).toBe(true);
  });

  it('initializes with custom initial step', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 5, initialStep: 2 }));
    expect(result.current.currentStep).toBe(2);
    expect(result.current.isFirst).toBe(false);
    expect(result.current.isLast).toBe(false);
    expect(result.current.progress).toBe(50);
  });

  it('clamps initial step to valid range', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 3, initialStep: 10 }));
    expect(result.current.currentStep).toBe(2);
  });

  it('clamps negative initial step', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 3, initialStep: -5 }));
    expect(result.current.currentStep).toBe(0);
  });

  it('throws when totalSteps < 1', () => {
    expect(() => {
      renderHook(() => useStepWizard({ totalSteps: 0 }));
    }).toThrow('totalSteps must be at least 1');
  });

  it('navigates to next step', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 3 }));
    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(1);
    expect(result.current.isFirst).toBe(false);
  });

  it('does not go past last step', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 3, initialStep: 2 }));
    expect(result.current.isLast).toBe(true);
    expect(result.current.canGoNext).toBe(false);
    act(() => result.current.nextStep());
    expect(result.current.currentStep).toBe(2);
  });

  it('navigates to previous step', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 3, initialStep: 2 }));
    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe(1);
  });

  it('does not go before first step', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 3 }));
    expect(result.current.canGoPrev).toBe(false);
    act(() => result.current.prevStep());
    expect(result.current.currentStep).toBe(0);
  });

  it('goes to specific step', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 5 }));
    act(() => result.current.goToStep(3));
    expect(result.current.currentStep).toBe(3);
    expect(result.current.progress).toBe(75);
  });

  it('ignores invalid step in goToStep', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 3 }));
    act(() => result.current.goToStep(-1));
    expect(result.current.currentStep).toBe(0);
    act(() => result.current.goToStep(5));
    expect(result.current.currentStep).toBe(0);
  });

  it('resets to initial step and clears completed', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 5, initialStep: 1 }));
    act(() => {
      result.current.markCompleted(0);
      result.current.nextStep();
    });
    act(() => result.current.reset());
    expect(result.current.currentStep).toBe(1);
    expect(result.current.completedSteps.size).toBe(0);
  });

  it('marks step as completed', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 3 }));
    act(() => result.current.markCompleted(0));
    expect(result.current.isStepCompleted(0)).toBe(true);
    expect(result.current.isStepCompleted(1)).toBe(false);
  });

  it('marks step as incomplete', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 3 }));
    act(() => result.current.markCompleted(1));
    expect(result.current.isStepCompleted(1)).toBe(true);
    act(() => result.current.markIncomplete(1));
    expect(result.current.isStepCompleted(1)).toBe(false);
  });

  it('ignores marking invalid step as completed', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 3 }));
    act(() => result.current.markCompleted(-1));
    act(() => result.current.markCompleted(5));
    expect(result.current.completedSteps.size).toBe(0);
  });

  it('calculates progress correctly', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 4 }));
    expect(result.current.progress).toBeCloseTo(0);
    act(() => result.current.nextStep());
    expect(result.current.progress).toBeCloseTo(33.33, 1);
    act(() => result.current.nextStep());
    expect(result.current.progress).toBeCloseTo(66.67, 1);
    act(() => result.current.nextStep());
    expect(result.current.progress).toBeCloseTo(100);
  });

  it('handles single step wizard', () => {
    const { result } = renderHook(() => useStepWizard({ totalSteps: 1 }));
    expect(result.current.isFirst).toBe(true);
    expect(result.current.isLast).toBe(true);
    expect(result.current.progress).toBe(100);
    expect(result.current.canGoNext).toBe(false);
    expect(result.current.canGoPrev).toBe(false);
  });

  describe('linear mode', () => {
    it('blocks next if current step not completed', () => {
      const { result } = renderHook(() => useStepWizard({ totalSteps: 3, linear: true }));
      expect(result.current.canGoNext).toBe(false);
      act(() => result.current.nextStep());
      expect(result.current.currentStep).toBe(0);
    });

    it('allows next after marking current step completed', () => {
      const { result } = renderHook(() => useStepWizard({ totalSteps: 3, linear: true }));
      act(() => result.current.markCompleted(0));
      expect(result.current.canGoNext).toBe(true);
      act(() => result.current.nextStep());
      expect(result.current.currentStep).toBe(1);
    });

    it('blocks goToStep to non-adjacent future step', () => {
      const { result } = renderHook(() => useStepWizard({ totalSteps: 5, linear: true }));
      act(() => result.current.markCompleted(0));
      act(() => result.current.goToStep(3));
      expect(result.current.currentStep).toBe(0);
    });

    it('allows going back to previous steps in linear mode', () => {
      const { result } = renderHook(() => useStepWizard({ totalSteps: 3, linear: true }));
      act(() => result.current.markCompleted(0));
      act(() => result.current.nextStep());
      act(() => result.current.prevStep());
      expect(result.current.currentStep).toBe(0);
    });

    it('blocks goToStep to next if current not completed', () => {
      const { result } = renderHook(() => useStepWizard({ totalSteps: 3, linear: true }));
      act(() => result.current.goToStep(1));
      expect(result.current.currentStep).toBe(0);
    });
  });
});
