import { useState, useCallback, useRef } from 'react';

export type ValidatorFn<T> = (value: T, allValues: Record<string, unknown>) => string | null;

export interface FieldConfig<T = unknown> {
  initialValue: T;
  validators?: ValidatorFn<T>[];
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export interface FieldState<T = unknown> {
  value: T;
  error: string | null;
  touched: boolean;
  dirty: boolean;
}

export interface FormValidationResult<F extends Record<string, FieldConfig<any>>> {
  fields: { [K in keyof F]: FieldState<F[K] extends FieldConfig<infer T> ? T : unknown> };
  values: { [K in keyof F]: F[K] extends FieldConfig<infer T> ? T : unknown };
  errors: { [K in keyof F]: string | null };
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  setValue: <K extends keyof F>(name: K, value: F[K] extends FieldConfig<infer T> ? T : unknown) => void;
  setError: (name: keyof F, error: string | null) => void;
  handleBlur: (name: keyof F) => void;
  validate: () => boolean;
  validateField: (name: keyof F) => string | null;
  reset: () => void;
  resetField: (name: keyof F) => void;
}

function buildInitialFields<F extends Record<string, FieldConfig<any>>>(
  config: F
): Record<string, FieldState> {
  const fields: Record<string, FieldState> = {};
  for (const key of Object.keys(config)) {
    fields[key] = {
      value: config[key].initialValue,
      error: null,
      touched: false,
      dirty: false,
    };
  }
  return fields;
}

function runValidators<T>(
  validators: ValidatorFn<T>[] | undefined,
  value: T,
  allValues: Record<string, unknown>
): string | null {
  if (!validators || validators.length === 0) return null;
  for (const validator of validators) {
    const error = validator(value, allValues);
    if (error) return error;
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useFormValidation<F extends Record<string, FieldConfig<any>>>(
  config: F
): FormValidationResult<F> {
  const configRef = useRef(config);
  configRef.current = config;

  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>(() =>
    buildInitialFields(config)
  );

  const getValues = useCallback(
    (states: Record<string, FieldState>): Record<string, unknown> => {
      const vals: Record<string, unknown> = {};
      for (const key of Object.keys(states)) {
        vals[key] = states[key].value;
      }
      return vals;
    },
    []
  );

  const setValue = useCallback(
    (name: string | number | symbol, value: unknown) => {
      const key = String(name);
      setFieldStates((prev) => {
        const cfg = configRef.current[key];
        const newField: FieldState = {
          ...prev[key],
          value,
          dirty: true,
        };

        if (cfg?.validateOnChange !== false) {
          const allValues = getValues({ ...prev, [key]: newField });
          newField.error = runValidators(cfg?.validators as ValidatorFn<unknown>[] | undefined, value, allValues);
        }

        return { ...prev, [key]: newField };
      });
    },
    [getValues]
  );

  const setError = useCallback((name: string | number | symbol, error: string | null) => {
    const key = String(name);
    setFieldStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], error },
    }));
  }, []);

  const handleBlur = useCallback(
    (name: string | number | symbol) => {
      const key = String(name);
      setFieldStates((prev) => {
        const cfg = configRef.current[key];
        const field = prev[key];
        const newField: FieldState = { ...field, touched: true };

        if (cfg?.validateOnBlur !== false) {
          const allValues = getValues(prev);
          newField.error = runValidators(
            cfg?.validators as ValidatorFn<unknown>[] | undefined,
            field.value,
            allValues
          );
        }

        return { ...prev, [key]: newField };
      });
    },
    [getValues]
  );

  const validateField = useCallback(
    (name: string | number | symbol): string | null => {
      const key = String(name);
      const cfg = configRef.current[key];
      const allValues = getValues(fieldStates);
      const error = runValidators(
        cfg?.validators as ValidatorFn<unknown>[] | undefined,
        fieldStates[key].value,
        allValues
      );
      setFieldStates((prev) => ({
        ...prev,
        [key]: { ...prev[key], error, touched: true },
      }));
      return error;
    },
    [fieldStates, getValues]
  );

  const validate = useCallback((): boolean => {
    const allValues = getValues(fieldStates);
    let valid = true;
    const updates: Record<string, FieldState> = {};

    for (const key of Object.keys(configRef.current)) {
      const cfg = configRef.current[key];
      const error = runValidators(
        cfg?.validators as ValidatorFn<unknown>[] | undefined,
        fieldStates[key].value,
        allValues
      );
      if (error) valid = false;
      updates[key] = { ...fieldStates[key], error, touched: true };
    }

    setFieldStates(updates);
    return valid;
  }, [fieldStates, getValues]);

  const reset = useCallback(() => {
    setFieldStates(buildInitialFields(configRef.current));
  }, []);

  const resetField = useCallback((name: string | number | symbol) => {
    const key = String(name);
    const cfg = configRef.current[key];
    setFieldStates((prev) => ({
      ...prev,
      [key]: {
        value: cfg?.initialValue,
        error: null,
        touched: false,
        dirty: false,
      },
    }));
  }, []);

  // Derive computed values
  const values: Record<string, unknown> = {};
  const errors: Record<string, string | null> = {};
  let isValid = true;
  let isDirty = false;
  let isTouched = false;

  for (const key of Object.keys(fieldStates)) {
    values[key] = fieldStates[key].value;
    errors[key] = fieldStates[key].error;
    if (fieldStates[key].error) isValid = false;
    if (fieldStates[key].dirty) isDirty = true;
    if (fieldStates[key].touched) isTouched = true;
  }

  return {
    fields: fieldStates,
    values,
    errors,
    isValid,
    isDirty,
    isTouched,
    setValue,
    setError,
    handleBlur,
    validate,
    validateField,
    reset,
    resetField,
  } as FormValidationResult<F>;
}

// Common validators
export const required = (message = 'This field is required'): ValidatorFn<unknown> =>
  (value) => {
    if (value === null || value === undefined || value === '') return message;
    return null;
  };

export const minLength = (min: number, message?: string): ValidatorFn<string> =>
  (value) => {
    if (typeof value === 'string' && value.length < min) {
      return message || `Minimum ${min} characters required`;
    }
    return null;
  };

export const maxLength = (max: number, message?: string): ValidatorFn<string> =>
  (value) => {
    if (typeof value === 'string' && value.length > max) {
      return message || `Maximum ${max} characters allowed`;
    }
    return null;
  };

export const pattern = (regex: RegExp, message = 'Invalid format'): ValidatorFn<string> =>
  (value) => {
    if (typeof value === 'string' && value.length > 0 && !regex.test(value)) {
      return message;
    }
    return null;
  };

export const minValue = (min: number, message?: string): ValidatorFn<number> =>
  (value) => {
    if (typeof value === 'number' && value < min) {
      return message || `Minimum value is ${min}`;
    }
    return null;
  };

export const maxValue = (max: number, message?: string): ValidatorFn<number> =>
  (value) => {
    if (typeof value === 'number' && value > max) {
      return message || `Maximum value is ${max}`;
    }
    return null;
  };
