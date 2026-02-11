/**
 * Lightweight JSON schema validation utilities.
 * Validates data against schema definitions without external dependencies.
 */

export type SchemaType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';

export interface Schema {
  type?: SchemaType | SchemaType[];
  /** For strings: minimum length */
  minLength?: number;
  /** For strings: maximum length */
  maxLength?: number;
  /** For strings: regex pattern */
  pattern?: string;
  /** For strings: format validation */
  format?: 'email' | 'url' | 'uuid' | 'iso-date';
  /** For numbers: minimum value */
  minimum?: number;
  /** For numbers: maximum value */
  maximum?: number;
  /** For numbers: must be integer */
  integer?: boolean;
  /** For objects: property schemas */
  properties?: Record<string, Schema>;
  /** For objects: required property names */
  required?: string[];
  /** For objects: allow additional properties */
  additionalProperties?: boolean;
  /** For arrays: schema for items */
  items?: Schema;
  /** For arrays: minimum items */
  minItems?: number;
  /** For arrays: maximum items */
  maxItems?: number;
  /** For arrays: all items must be unique */
  uniqueItems?: boolean;
  /** Enum: value must be one of these */
  enum?: unknown[];
  /** Const: value must be exactly this */
  const?: unknown;
  /** Custom validation function */
  validate?: (value: unknown) => boolean | string;
}

export interface ValidationError {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

function getType(value: unknown): SchemaType {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean' || t === 'object') return t;
  return 'string'; // fallback
}

function matchesType(value: unknown, type: SchemaType | SchemaType[]): boolean {
  const actualType = getType(value);
  if (Array.isArray(type)) {
    return type.includes(actualType);
  }
  return actualType === type;
}

const FORMAT_VALIDATORS: Record<string, (value: string) => boolean> = {
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  url: (v) => {
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  },
  uuid: (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
  'iso-date': (v) => !Number.isNaN(Date.parse(v)) && /^\d{4}-\d{2}-\d{2}/.test(v),
};

function validateInternal(value: unknown, schema: Schema, path: string, errors: ValidationError[]): void {
  // Type check
  if (schema.type !== undefined) {
    if (!matchesType(value, schema.type)) {
      const expected = Array.isArray(schema.type) ? schema.type.join(' | ') : schema.type;
      errors.push({ path, message: `Expected type ${expected}, got ${getType(value)}` });
      return;
    }
  }

  // Const check
  if (schema.const !== undefined) {
    if (value !== schema.const) {
      errors.push({ path, message: `Expected constant ${JSON.stringify(schema.const)}` });
    }
  }

  // Enum check
  if (schema.enum !== undefined) {
    if (!schema.enum.includes(value)) {
      errors.push({ path, message: `Value must be one of: ${schema.enum.map((e) => JSON.stringify(e)).join(', ')}` });
    }
  }

  // String validations
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength) {
      errors.push({ path, message: `String length ${value.length} is less than minimum ${schema.minLength}` });
    }
    if (schema.maxLength !== undefined && value.length > schema.maxLength) {
      errors.push({ path, message: `String length ${value.length} exceeds maximum ${schema.maxLength}` });
    }
    if (schema.pattern !== undefined) {
      const regex = new RegExp(schema.pattern);
      if (!regex.test(value)) {
        errors.push({ path, message: `String does not match pattern ${schema.pattern}` });
      }
    }
    if (schema.format !== undefined) {
      const validator = FORMAT_VALIDATORS[schema.format];
      if (validator && !validator(value)) {
        errors.push({ path, message: `String does not match format "${schema.format}"` });
      }
    }
  }

  // Number validations
  if (typeof value === 'number') {
    if (schema.integer && !Number.isInteger(value)) {
      errors.push({ path, message: `Expected integer, got ${value}` });
    }
    if (schema.minimum !== undefined && value < schema.minimum) {
      errors.push({ path, message: `Value ${value} is less than minimum ${schema.minimum}` });
    }
    if (schema.maximum !== undefined && value > schema.maximum) {
      errors.push({ path, message: `Value ${value} exceeds maximum ${schema.maximum}` });
    }
  }

  // Object validations
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const obj = value as Record<string, unknown>;

    if (schema.required) {
      for (const key of schema.required) {
        if (!(key in obj)) {
          errors.push({ path: path ? `${path}.${key}` : key, message: `Required property "${key}" is missing` });
        }
      }
    }

    if (schema.properties) {
      for (const [key, propSchema] of Object.entries(schema.properties)) {
        if (key in obj) {
          validateInternal(obj[key], propSchema, path ? `${path}.${key}` : key, errors);
        }
      }
    }

    if (schema.additionalProperties === false && schema.properties) {
      const allowed = new Set(Object.keys(schema.properties));
      for (const key of Object.keys(obj)) {
        if (!allowed.has(key)) {
          errors.push({ path: path ? `${path}.${key}` : key, message: `Additional property "${key}" is not allowed` });
        }
      }
    }
  }

  // Array validations
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) {
      errors.push({ path, message: `Array length ${value.length} is less than minimum ${schema.minItems}` });
    }
    if (schema.maxItems !== undefined && value.length > schema.maxItems) {
      errors.push({ path, message: `Array length ${value.length} exceeds maximum ${schema.maxItems}` });
    }
    if (schema.uniqueItems) {
      const seen = new Set();
      for (let i = 0; i < value.length; i++) {
        const serialized = JSON.stringify(value[i]);
        if (seen.has(serialized)) {
          errors.push({ path: `${path}[${i}]`, message: `Duplicate item at index ${i}` });
        }
        seen.add(serialized);
      }
    }
    if (schema.items) {
      for (let i = 0; i < value.length; i++) {
        validateInternal(value[i], schema.items, `${path}[${i}]`, errors);
      }
    }
  }

  // Custom validate
  if (schema.validate) {
    const result = schema.validate(value);
    if (result !== true) {
      const msg = typeof result === 'string' ? result : 'Custom validation failed';
      errors.push({ path, message: msg });
    }
  }
}

/** Validate a value against a schema. */
export function validate(value: unknown, schema: Schema): ValidationResult {
  const errors: ValidationError[] = [];
  validateInternal(value, schema, '', errors);
  return { valid: errors.length === 0, errors };
}

/** Create a reusable validator function from a schema. */
export function createValidator(schema: Schema): (value: unknown) => ValidationResult {
  return (value: unknown) => validate(value, schema);
}

/** Validate and throw if invalid. */
export function assertValid(value: unknown, schema: Schema): void {
  const result = validate(value, schema);
  if (!result.valid) {
    const messages = result.errors.map((e) =>
      e.path ? `${e.path}: ${e.message}` : e.message
    );
    throw new Error(`Validation failed:\n${messages.join('\n')}`);
  }
}

/** Check if a value matches a schema (returns boolean only). */
export function isValid(value: unknown, schema: Schema): boolean {
  return validate(value, schema).valid;
}
