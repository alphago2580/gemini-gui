import {
  validate,
  createValidator,
  assertValid,
  isValid,
  type Schema,
} from './schemaValidationUtils';

describe('schemaValidationUtils', () => {
  describe('type validation', () => {
    it('validates string type', () => {
      const result = validate('hello', { type: 'string' });
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects wrong type', () => {
      const result = validate(42, { type: 'string' });
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('Expected type string');
    });

    it('validates number type', () => {
      expect(validate(3.14, { type: 'number' }).valid).toBe(true);
    });

    it('validates boolean type', () => {
      expect(validate(true, { type: 'boolean' }).valid).toBe(true);
    });

    it('validates null type', () => {
      expect(validate(null, { type: 'null' }).valid).toBe(true);
    });

    it('validates array type', () => {
      expect(validate([1, 2], { type: 'array' }).valid).toBe(true);
    });

    it('validates object type', () => {
      expect(validate({ a: 1 }, { type: 'object' }).valid).toBe(true);
    });

    it('validates union types', () => {
      const schema: Schema = { type: ['string', 'number'] };
      expect(validate('hi', schema).valid).toBe(true);
      expect(validate(42, schema).valid).toBe(true);
      expect(validate(true, schema).valid).toBe(false);
    });

    it('passes when no type specified', () => {
      expect(validate('anything', {}).valid).toBe(true);
    });
  });

  describe('string validation', () => {
    it('validates minLength', () => {
      expect(validate('abc', { type: 'string', minLength: 2 }).valid).toBe(true);
      expect(validate('a', { type: 'string', minLength: 2 }).valid).toBe(false);
    });

    it('validates maxLength', () => {
      expect(validate('ab', { type: 'string', maxLength: 3 }).valid).toBe(true);
      expect(validate('abcd', { type: 'string', maxLength: 3 }).valid).toBe(false);
    });

    it('validates pattern', () => {
      expect(validate('abc123', { type: 'string', pattern: '^[a-z]+\\d+$' }).valid).toBe(true);
      expect(validate('ABC', { type: 'string', pattern: '^[a-z]+$' }).valid).toBe(false);
    });

    it('validates email format', () => {
      expect(validate('user@example.com', { type: 'string', format: 'email' }).valid).toBe(true);
      expect(validate('not-email', { type: 'string', format: 'email' }).valid).toBe(false);
    });

    it('validates url format', () => {
      expect(validate('https://example.com', { type: 'string', format: 'url' }).valid).toBe(true);
      expect(validate('not a url', { type: 'string', format: 'url' }).valid).toBe(false);
    });

    it('validates uuid format', () => {
      expect(validate('550e8400-e29b-41d4-a716-446655440000', { type: 'string', format: 'uuid' }).valid).toBe(true);
      expect(validate('not-a-uuid', { type: 'string', format: 'uuid' }).valid).toBe(false);
    });

    it('validates iso-date format', () => {
      expect(validate('2024-01-15', { type: 'string', format: 'iso-date' }).valid).toBe(true);
      expect(validate('2024-01-15T10:30:00Z', { type: 'string', format: 'iso-date' }).valid).toBe(true);
      expect(validate('not a date', { type: 'string', format: 'iso-date' }).valid).toBe(false);
    });
  });

  describe('number validation', () => {
    it('validates minimum', () => {
      expect(validate(5, { type: 'number', minimum: 0 }).valid).toBe(true);
      expect(validate(-1, { type: 'number', minimum: 0 }).valid).toBe(false);
    });

    it('validates maximum', () => {
      expect(validate(5, { type: 'number', maximum: 10 }).valid).toBe(true);
      expect(validate(11, { type: 'number', maximum: 10 }).valid).toBe(false);
    });

    it('validates integer', () => {
      expect(validate(5, { type: 'number', integer: true }).valid).toBe(true);
      expect(validate(5.5, { type: 'number', integer: true }).valid).toBe(false);
    });

    it('validates range', () => {
      const schema: Schema = { type: 'number', minimum: 1, maximum: 100 };
      expect(validate(50, schema).valid).toBe(true);
      expect(validate(0, schema).valid).toBe(false);
      expect(validate(101, schema).valid).toBe(false);
    });
  });

  describe('enum and const', () => {
    it('validates enum values', () => {
      const schema: Schema = { enum: ['red', 'green', 'blue'] };
      expect(validate('red', schema).valid).toBe(true);
      expect(validate('yellow', schema).valid).toBe(false);
    });

    it('validates const value', () => {
      expect(validate(42, { const: 42 }).valid).toBe(true);
      expect(validate(43, { const: 42 }).valid).toBe(false);
    });

    it('enum error shows allowed values', () => {
      const result = validate('x', { enum: ['a', 'b'] });
      expect(result.errors[0].message).toContain('"a"');
      expect(result.errors[0].message).toContain('"b"');
    });
  });

  describe('object validation', () => {
    it('validates required properties', () => {
      const schema: Schema = {
        type: 'object',
        required: ['name', 'age'],
        properties: {
          name: { type: 'string' },
          age: { type: 'number' },
        },
      };
      expect(validate({ name: 'Alice', age: 30 }, schema).valid).toBe(true);
      expect(validate({ name: 'Alice' }, schema).valid).toBe(false);
    });

    it('validates property schemas', () => {
      const schema: Schema = {
        type: 'object',
        properties: {
          count: { type: 'number', minimum: 0 },
        },
      };
      expect(validate({ count: 5 }, schema).valid).toBe(true);
      expect(validate({ count: -1 }, schema).valid).toBe(false);
    });

    it('rejects additional properties when not allowed', () => {
      const schema: Schema = {
        type: 'object',
        properties: { name: { type: 'string' } },
        additionalProperties: false,
      };
      expect(validate({ name: 'Alice' }, schema).valid).toBe(true);
      expect(validate({ name: 'Alice', extra: true }, schema).valid).toBe(false);
    });

    it('allows additional properties by default', () => {
      const schema: Schema = {
        type: 'object',
        properties: { name: { type: 'string' } },
      };
      expect(validate({ name: 'Alice', extra: true }, schema).valid).toBe(true);
    });

    it('reports correct path for nested errors', () => {
      const schema: Schema = {
        type: 'object',
        properties: {
          address: {
            type: 'object',
            properties: {
              zip: { type: 'string', pattern: '^\\d{5}$' },
            },
          },
        },
      };
      const result = validate({ address: { zip: 'abc' } }, schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].path).toBe('address.zip');
    });

    it('skips absent optional properties', () => {
      const schema: Schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          bio: { type: 'string' },
        },
      };
      expect(validate({ name: 'Bob' }, schema).valid).toBe(true);
    });
  });

  describe('array validation', () => {
    it('validates minItems', () => {
      expect(validate([1, 2], { type: 'array', minItems: 1 }).valid).toBe(true);
      expect(validate([], { type: 'array', minItems: 1 }).valid).toBe(false);
    });

    it('validates maxItems', () => {
      expect(validate([1], { type: 'array', maxItems: 3 }).valid).toBe(true);
      expect(validate([1, 2, 3, 4], { type: 'array', maxItems: 3 }).valid).toBe(false);
    });

    it('validates uniqueItems', () => {
      expect(validate([1, 2, 3], { type: 'array', uniqueItems: true }).valid).toBe(true);
      expect(validate([1, 2, 2], { type: 'array', uniqueItems: true }).valid).toBe(false);
    });

    it('validates item schemas', () => {
      const schema: Schema = {
        type: 'array',
        items: { type: 'number', minimum: 0 },
      };
      expect(validate([1, 2, 3], schema).valid).toBe(true);
      expect(validate([1, -1, 3], schema).valid).toBe(false);
    });

    it('reports correct path for item errors', () => {
      const schema: Schema = {
        type: 'array',
        items: { type: 'string' },
      };
      const result = validate(['a', 42, 'c'], schema);
      expect(result.errors[0].path).toBe('[1]');
    });
  });

  describe('custom validate', () => {
    it('accepts with true return', () => {
      const schema: Schema = {
        type: 'number',
        validate: (v) => (v as number) % 2 === 0,
      };
      expect(validate(4, schema).valid).toBe(true);
      expect(validate(3, schema).valid).toBe(false);
    });

    it('uses string return as error message', () => {
      const schema: Schema = {
        validate: (v) => (typeof v === 'string' && v.startsWith('$')) || 'Must start with $',
      };
      const result = validate('hello', schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toBe('Must start with $');
    });
  });

  describe('createValidator', () => {
    it('creates a reusable validator', () => {
      const validateUser = createValidator({
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', minLength: 1 },
          email: { type: 'string', format: 'email' },
        },
      });

      expect(validateUser({ name: 'Alice', email: 'alice@test.com' }).valid).toBe(true);
      expect(validateUser({ email: 'alice@test.com' }).valid).toBe(false);
      expect(validateUser({ name: 'Alice', email: 'bad' }).valid).toBe(false);
    });
  });

  describe('assertValid', () => {
    it('does not throw for valid data', () => {
      expect(() => assertValid('hello', { type: 'string' })).not.toThrow();
    });

    it('throws for invalid data', () => {
      expect(() => assertValid(42, { type: 'string' })).toThrow('Validation failed');
    });

    it('includes path in error message', () => {
      const schema: Schema = {
        type: 'object',
        properties: { age: { type: 'number' } },
      };
      expect(() => assertValid({ age: 'old' }, schema)).toThrow('age:');
    });
  });

  describe('isValid', () => {
    it('returns true for valid data', () => {
      expect(isValid(42, { type: 'number' })).toBe(true);
    });

    it('returns false for invalid data', () => {
      expect(isValid('hello', { type: 'number' })).toBe(false);
    });
  });

  describe('complex schemas', () => {
    it('validates a user profile schema', () => {
      const userSchema: Schema = {
        type: 'object',
        required: ['id', 'name', 'email', 'roles'],
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', minLength: 1, maxLength: 100 },
          email: { type: 'string', format: 'email' },
          age: { type: 'number', minimum: 0, maximum: 150, integer: true },
          roles: { type: 'array', minItems: 1, items: { type: 'string', enum: ['admin', 'user', 'moderator'] } },
        },
        additionalProperties: false,
      };

      const validUser = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Alice',
        email: 'alice@example.com',
        age: 30,
        roles: ['admin', 'user'],
      };
      expect(validate(validUser, userSchema).valid).toBe(true);

      const invalidUser = {
        id: 'bad-id',
        name: '',
        email: 'not-email',
        age: -5,
        roles: [],
        extra: true,
      };
      const result = validate(invalidUser, userSchema);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });

    it('validates deeply nested objects', () => {
      const schema: Schema = {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'object',
                properties: {
                  value: { type: 'number', minimum: 0 },
                },
              },
            },
          },
        },
      };

      expect(validate({ level1: { level2: { value: 5 } } }, schema).valid).toBe(true);
      const result = validate({ level1: { level2: { value: -1 } } }, schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].path).toBe('level1.level2.value');
    });

    it('validates array of objects', () => {
      const schema: Schema = {
        type: 'array',
        items: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string' },
            score: { type: 'number', minimum: 0, maximum: 100 },
          },
        },
      };

      expect(validate([{ name: 'A', score: 90 }], schema).valid).toBe(true);
      const result = validate([{ name: 'A' }, { score: 50 }], schema);
      expect(result.valid).toBe(false);
      expect(result.errors[0].path).toContain('[1]');
    });

    it('collects multiple errors', () => {
      const schema: Schema = {
        type: 'object',
        required: ['a', 'b', 'c'],
      };
      const result = validate({}, schema);
      expect(result.errors).toHaveLength(3);
    });
  });
});
