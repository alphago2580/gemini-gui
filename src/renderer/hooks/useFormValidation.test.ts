import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useFormValidation,
  required,
  minLength,
  maxLength,
  pattern,
  minValue,
  maxValue,
} from './useFormValidation';

describe('useFormValidation', () => {
  const basicConfig = {
    name: { initialValue: '', validators: [required()], validateOnChange: true, validateOnBlur: true },
    email: { initialValue: '', validators: [required(), pattern(/@/, 'Invalid email')], validateOnChange: true, validateOnBlur: true },
  };

  it('should initialize with field initial values', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    expect(result.current.values.name).toBe('');
    expect(result.current.values.email).toBe('');
  });

  it('should initialize fields as untouched and not dirty', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    expect(result.current.fields.name.touched).toBe(false);
    expect(result.current.fields.name.dirty).toBe(false);
    expect(result.current.isTouched).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });

  it('should initialize with no errors', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    expect(result.current.errors.name).toBeNull();
    expect(result.current.errors.email).toBeNull();
    expect(result.current.isValid).toBe(true);
  });

  it('should update value on setValue', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    act(() => {
      result.current.setValue('name', 'John');
    });
    expect(result.current.values.name).toBe('John');
  });

  it('should mark field as dirty on setValue', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    act(() => {
      result.current.setValue('name', 'John');
    });
    expect(result.current.fields.name.dirty).toBe(true);
    expect(result.current.isDirty).toBe(true);
  });

  it('should validate on change by default and clear error when valid', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    act(() => {
      result.current.setValue('name', '');
    });
    expect(result.current.errors.name).toBe('This field is required');
    act(() => {
      result.current.setValue('name', 'John');
    });
    expect(result.current.errors.name).toBeNull();
  });

  it('should mark field as touched on blur', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    act(() => {
      result.current.handleBlur('name');
    });
    expect(result.current.fields.name.touched).toBe(true);
    expect(result.current.isTouched).toBe(true);
  });

  it('should validate on blur', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    act(() => {
      result.current.handleBlur('email');
    });
    expect(result.current.errors.email).toBe('This field is required');
  });

  it('should validate all fields at once', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    let valid: boolean;
    act(() => {
      valid = result.current.validate();
    });
    expect(valid!).toBe(false);
    expect(result.current.errors.name).toBe('This field is required');
    expect(result.current.errors.email).toBe('This field is required');
  });

  it('should return true from validate when all fields are valid', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    act(() => {
      result.current.setValue('name', 'John');
      result.current.setValue('email', 'john@example.com');
    });
    let valid: boolean;
    act(() => {
      valid = result.current.validate();
    });
    expect(valid!).toBe(true);
    expect(result.current.isValid).toBe(true);
  });

  it('should validate a single field with validateField', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    let error: string | null;
    act(() => {
      error = result.current.validateField('name');
    });
    expect(error!).toBe('This field is required');
    expect(result.current.fields.name.touched).toBe(true);
  });

  it('should reset all fields to initial state', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    act(() => {
      result.current.setValue('name', 'John');
      result.current.handleBlur('name');
    });
    expect(result.current.isDirty).toBe(true);
    expect(result.current.isTouched).toBe(true);
    act(() => {
      result.current.reset();
    });
    expect(result.current.values.name).toBe('');
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isTouched).toBe(false);
    expect(result.current.errors.name).toBeNull();
  });

  it('should reset a single field with resetField', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    act(() => {
      result.current.setValue('name', 'John');
      result.current.setValue('email', 'john@test.com');
    });
    act(() => {
      result.current.resetField('name');
    });
    expect(result.current.values.name).toBe('');
    expect(result.current.fields.name.dirty).toBe(false);
    expect(result.current.values.email).toBe('john@test.com');
  });

  it('should set manual error with setError', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    act(() => {
      result.current.setError('name', 'Custom error');
    });
    expect(result.current.errors.name).toBe('Custom error');
    expect(result.current.isValid).toBe(false);
  });

  it('should clear manual error with setError(null)', () => {
    const { result } = renderHook(() => useFormValidation(basicConfig));
    act(() => {
      result.current.setError('name', 'Custom error');
    });
    act(() => {
      result.current.setError('name', null);
    });
    expect(result.current.errors.name).toBeNull();
  });

  it('should chain multiple validators (first error wins)', () => {
    const config = {
      password: {
        initialValue: '',
        validators: [required('Password required'), minLength(8, 'Too short')],
        validateOnChange: true,
        validateOnBlur: true,
      },
    };
    const { result } = renderHook(() => useFormValidation(config));
    act(() => {
      result.current.setValue('password', '');
    });
    expect(result.current.errors.password).toBe('Password required');
    act(() => {
      result.current.setValue('password', 'abc');
    });
    expect(result.current.errors.password).toBe('Too short');
    act(() => {
      result.current.setValue('password', 'abcdefgh');
    });
    expect(result.current.errors.password).toBeNull();
  });

  it('should handle number fields with minValue/maxValue validators', () => {
    const config = {
      age: {
        initialValue: 0,
        validators: [minValue(1, 'Must be positive'), maxValue(150, 'Too high')],
        validateOnChange: true,
        validateOnBlur: true,
      },
    };
    const { result } = renderHook(() => useFormValidation(config));
    act(() => {
      result.current.setValue('age', 0);
    });
    expect(result.current.errors.age).toBe('Must be positive');
    act(() => {
      result.current.setValue('age', 200);
    });
    expect(result.current.errors.age).toBe('Too high');
    act(() => {
      result.current.setValue('age', 25);
    });
    expect(result.current.errors.age).toBeNull();
  });

  it('should handle fields with no validators', () => {
    const config = {
      nickname: { initialValue: 'default' },
    };
    const { result } = renderHook(() => useFormValidation(config));
    act(() => {
      result.current.setValue('nickname', 'test');
    });
    expect(result.current.errors.nickname).toBeNull();
    expect(result.current.isValid).toBe(true);
  });
});

describe('validators', () => {
  it('required: passes non-empty string', () => {
    expect(required()('hello', {})).toBeNull();
  });

  it('required: fails null', () => {
    expect(required()(null, {})).toBe('This field is required');
  });

  it('required: fails undefined', () => {
    expect(required()(undefined, {})).toBe('This field is required');
  });

  it('required: fails empty string', () => {
    expect(required()('', {})).toBe('This field is required');
  });

  it('required: custom message', () => {
    expect(required('Enter name')('', {})).toBe('Enter name');
  });

  it('minLength: passes valid string', () => {
    expect(minLength(3)('abc', {})).toBeNull();
  });

  it('minLength: fails short string', () => {
    expect(minLength(3)('ab', {})).toBe('Minimum 3 characters required');
  });

  it('minLength: custom message', () => {
    expect(minLength(3, 'Too short')('ab', {})).toBe('Too short');
  });

  it('maxLength: passes valid string', () => {
    expect(maxLength(5)('abc', {})).toBeNull();
  });

  it('maxLength: fails long string', () => {
    expect(maxLength(5)('abcdef', {})).toBe('Maximum 5 characters allowed');
  });

  it('pattern: passes matching string', () => {
    expect(pattern(/@/)('a@b', {})).toBeNull();
  });

  it('pattern: fails non-matching string', () => {
    expect(pattern(/@/, 'Need @')('abc', {})).toBe('Need @');
  });

  it('pattern: skips empty string', () => {
    expect(pattern(/@/)('', {})).toBeNull();
  });

  it('minValue: passes valid number', () => {
    expect(minValue(5)(10, {})).toBeNull();
  });

  it('minValue: fails low number', () => {
    expect(minValue(5)(3, {})).toBe('Minimum value is 5');
  });

  it('maxValue: passes valid number', () => {
    expect(maxValue(100)(50, {})).toBeNull();
  });

  it('maxValue: fails high number', () => {
    expect(maxValue(100)(200, {})).toBe('Maximum value is 100');
  });
});
