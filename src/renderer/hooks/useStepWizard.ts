import { useState, useCallback, useMemo } from 'react';

export interface StepWizardOptions {
  totalSteps: number;
  initialStep?: number;
  linear?: boolean;
}

export interface StepWizardReturn {
  currentStep: number;
  totalSteps: number;
  isFirst: boolean;
  isLast: boolean;
  progress: number;
  canGoNext: boolean;
  canGoPrev: boolean;
  goToStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  reset: () => void;
  completedSteps: Set<number>;
  markCompleted: (step: number) => void;
  markIncomplete: (step: number) => void;
  isStepCompleted: (step: number) => boolean;
}

export function useStepWizard(options: StepWizardOptions): StepWizardReturn {
  const { totalSteps, initialStep = 0, linear = false } = options;

  if (totalSteps < 1) {
    throw new Error('totalSteps must be at least 1');
  }

  const clampedInitial = Math.max(0, Math.min(initialStep, totalSteps - 1));
  const [currentStep, setCurrentStep] = useState(clampedInitial);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const isFirst = currentStep === 0;
  const isLast = currentStep === totalSteps - 1;
  const progress = totalSteps === 1 ? 100 : (currentStep / (totalSteps - 1)) * 100;

  const canGoPrev = !isFirst;
  const canGoNext = useMemo(() => {
    if (isLast) return false;
    if (linear) return completedSteps.has(currentStep);
    return true;
  }, [isLast, linear, completedSteps, currentStep]);

  const goToStep = useCallback((step: number) => {
    if (step < 0 || step >= totalSteps) return;
    if (linear && step > currentStep + 1) return;
    if (linear && step > currentStep && !completedSteps.has(currentStep)) return;
    setCurrentStep(step);
  }, [totalSteps, linear, currentStep, completedSteps]);

  const nextStep = useCallback(() => {
    if (!isLast) {
      if (linear && !completedSteps.has(currentStep)) return;
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    }
  }, [isLast, linear, completedSteps, currentStep, totalSteps]);

  const prevStep = useCallback(() => {
    if (!isFirst) {
      setCurrentStep(prev => Math.max(prev - 1, 0));
    }
  }, [isFirst]);

  const reset = useCallback(() => {
    setCurrentStep(clampedInitial);
    setCompletedSteps(new Set());
  }, [clampedInitial]);

  const markCompleted = useCallback((step: number) => {
    if (step < 0 || step >= totalSteps) return;
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.add(step);
      return next;
    });
  }, [totalSteps]);

  const markIncomplete = useCallback((step: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev);
      next.delete(step);
      return next;
    });
  }, []);

  const isStepCompleted = useCallback((step: number) => {
    return completedSteps.has(step);
  }, [completedSteps]);

  return {
    currentStep,
    totalSteps,
    isFirst,
    isLast,
    progress,
    canGoNext,
    canGoPrev,
    goToStep,
    nextStep,
    prevStep,
    reset,
    completedSteps,
    markCompleted,
    markIncomplete,
    isStepCompleted,
  };
}
