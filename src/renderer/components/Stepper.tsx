import React from 'react';
import './Stepper.css';

export interface StepItem {
  label: string;
  description?: string;
  icon?: string;
}

export interface StepperProps {
  steps: StepItem[];
  activeStep: number;
  orientation?: 'horizontal' | 'vertical';
  onStepClick?: (index: number) => void;
}

const StepperInner: React.FC<StepperProps> = ({
  steps,
  activeStep,
  orientation = 'horizontal',
  onStepClick,
}) => {
  if (steps.length === 0) return null;

  return (
    <div
      className={`stepper stepper--${orientation}`}
      role="list"
      aria-label="단계 표시"
    >
      {steps.map((step, index) => {
        const isCompleted = index < activeStep;
        const isActive = index === activeStep;
        const isLast = index === steps.length - 1;

        let statusClass = 'stepper__step--pending';
        if (isCompleted) statusClass = 'stepper__step--completed';
        else if (isActive) statusClass = 'stepper__step--active';

        const stepNumber = index + 1;

        return (
          <div
            key={`${step.label}-${index}`}
            className={`stepper__step ${statusClass}`}
            role="listitem"
            aria-current={isActive ? 'step' : undefined}
          >
            <div className="stepper__indicator-area">
              {onStepClick ? (
                <button
                  className="stepper__circle stepper__circle--clickable"
                  onClick={() => onStepClick(index)}
                  aria-label={`${stepNumber}단계: ${step.label}`}
                  title={step.label}
                >
                  {isCompleted ? '✓' : (step.icon ?? stepNumber)}
                </button>
              ) : (
                <div
                  className="stepper__circle"
                  aria-hidden="true"
                >
                  {isCompleted ? '✓' : (step.icon ?? stepNumber)}
                </div>
              )}
              {!isLast && <div className="stepper__connector" />}
            </div>
            <div className="stepper__label-area">
              <span className="stepper__label">{step.label}</span>
              {step.description && (
                <span className="stepper__description">{step.description}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Stepper = React.memo(StepperInner);
export default Stepper;
