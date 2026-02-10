/**
 * Input validation utility functions.
 */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidUrl(value: string): boolean {
  return URL_REGEX.test(value.trim());
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

export function hasMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function hasMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

export function isNumeric(value: string): boolean {
  if (value.trim() === '') return false;
  return !isNaN(Number(value));
}

export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateAll(value: string, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }
  return {
    isValid: errors.length === 0,
    errors,
  };
}
