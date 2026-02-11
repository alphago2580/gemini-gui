import {
  isString,
  isNumber,
  isBoolean,
  isNil,
  isNonNil,
  isPlainObject,
  isArray,
  isFunction,
  isDate,
  isRegExp,
  isPromiseLike,
  isError,
  isMap,
  isSet,
  isNonEmptyString,
  isNonEmptyArray,
  isFiniteNumber,
  isInteger,
  isPositive,
  isNegative,
  hasProperty,
  hasProperties,
  assertType,
} from './typeGuardUtils';

describe('typeGuardUtils', () => {
  describe('isString', () => {
    it('returns true for strings', () => {
      expect(isString('hello')).toBe(true);
      expect(isString('')).toBe(true);
    });

    it('returns false for non-strings', () => {
      expect(isString(42)).toBe(false);
      expect(isString(null)).toBe(false);
      expect(isString(undefined)).toBe(false);
      expect(isString(true)).toBe(false);
    });
  });

  describe('isNumber', () => {
    it('returns true for numbers', () => {
      expect(isNumber(42)).toBe(true);
      expect(isNumber(0)).toBe(true);
      expect(isNumber(-1.5)).toBe(true);
      expect(isNumber(Infinity)).toBe(true);
    });

    it('returns false for NaN', () => {
      expect(isNumber(NaN)).toBe(false);
    });

    it('returns false for non-numbers', () => {
      expect(isNumber('42')).toBe(false);
      expect(isNumber(null)).toBe(false);
    });
  });

  describe('isBoolean', () => {
    it('returns true for booleans', () => {
      expect(isBoolean(true)).toBe(true);
      expect(isBoolean(false)).toBe(true);
    });

    it('returns false for non-booleans', () => {
      expect(isBoolean(0)).toBe(false);
      expect(isBoolean('true')).toBe(false);
      expect(isBoolean(null)).toBe(false);
    });
  });

  describe('isNil', () => {
    it('returns true for null and undefined', () => {
      expect(isNil(null)).toBe(true);
      expect(isNil(undefined)).toBe(true);
    });

    it('returns false for other values', () => {
      expect(isNil(0)).toBe(false);
      expect(isNil('')).toBe(false);
      expect(isNil(false)).toBe(false);
    });
  });

  describe('isNonNil', () => {
    it('returns true for non-nil values', () => {
      expect(isNonNil(0)).toBe(true);
      expect(isNonNil('')).toBe(true);
      expect(isNonNil(false)).toBe(true);
      expect(isNonNil({})).toBe(true);
    });

    it('returns false for null and undefined', () => {
      expect(isNonNil(null)).toBe(false);
      expect(isNonNil(undefined)).toBe(false);
    });
  });

  describe('isPlainObject', () => {
    it('returns true for plain objects', () => {
      expect(isPlainObject({})).toBe(true);
      expect(isPlainObject({ a: 1 })).toBe(true);
      expect(isPlainObject(Object.create(null))).toBe(true);
    });

    it('returns false for non-plain objects', () => {
      expect(isPlainObject([])).toBe(false);
      expect(isPlainObject(null)).toBe(false);
      expect(isPlainObject(new Date())).toBe(false);
      expect(isPlainObject(new Map())).toBe(false);
      expect(isPlainObject('string')).toBe(false);
    });
  });

  describe('isArray', () => {
    it('returns true for arrays', () => {
      expect(isArray([])).toBe(true);
      expect(isArray([1, 2, 3])).toBe(true);
    });

    it('returns false for non-arrays', () => {
      expect(isArray({})).toBe(false);
      expect(isArray('hello')).toBe(false);
      expect(isArray(null)).toBe(false);
    });
  });

  describe('isFunction', () => {
    it('returns true for functions', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(function named() {})).toBe(true);
      expect(isFunction(Math.max)).toBe(true);
    });

    it('returns false for non-functions', () => {
      expect(isFunction({})).toBe(false);
      expect(isFunction(42)).toBe(false);
      expect(isFunction(null)).toBe(false);
    });
  });

  describe('isDate', () => {
    it('returns true for valid dates', () => {
      expect(isDate(new Date())).toBe(true);
      expect(isDate(new Date('2024-01-01'))).toBe(true);
    });

    it('returns false for invalid dates', () => {
      expect(isDate(new Date('invalid'))).toBe(false);
    });

    it('returns false for non-dates', () => {
      expect(isDate('2024-01-01')).toBe(false);
      expect(isDate(1234567890)).toBe(false);
      expect(isDate(null)).toBe(false);
    });
  });

  describe('isRegExp', () => {
    it('returns true for RegExp', () => {
      expect(isRegExp(/abc/)).toBe(true);
      expect(isRegExp(new RegExp('abc'))).toBe(true);
    });

    it('returns false for non-RegExp', () => {
      expect(isRegExp('/abc/')).toBe(false);
      expect(isRegExp(null)).toBe(false);
    });
  });

  describe('isPromiseLike', () => {
    it('returns true for promises', () => {
      expect(isPromiseLike(Promise.resolve())).toBe(true);
    });

    it('returns true for thenables', () => {
      expect(isPromiseLike({ then: () => {} })).toBe(true);
    });

    it('returns false for non-thenables', () => {
      expect(isPromiseLike({})).toBe(false);
      expect(isPromiseLike(null)).toBe(false);
      expect(isPromiseLike(42)).toBe(false);
    });
  });

  describe('isError', () => {
    it('returns true for errors', () => {
      expect(isError(new Error())).toBe(true);
      expect(isError(new TypeError())).toBe(true);
      expect(isError(new RangeError())).toBe(true);
    });

    it('returns false for non-errors', () => {
      expect(isError({ message: 'error' })).toBe(false);
      expect(isError('error')).toBe(false);
      expect(isError(null)).toBe(false);
    });
  });

  describe('isMap', () => {
    it('returns true for Map', () => {
      expect(isMap(new Map())).toBe(true);
    });

    it('returns false for non-Map', () => {
      expect(isMap({})).toBe(false);
      expect(isMap(new Set())).toBe(false);
    });
  });

  describe('isSet', () => {
    it('returns true for Set', () => {
      expect(isSet(new Set())).toBe(true);
    });

    it('returns false for non-Set', () => {
      expect(isSet([])).toBe(false);
      expect(isSet(new Map())).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('returns true for non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString(' ')).toBe(true);
    });

    it('returns false for empty string', () => {
      expect(isNonEmptyString('')).toBe(false);
    });

    it('returns false for non-strings', () => {
      expect(isNonEmptyString(42)).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
    });
  });

  describe('isNonEmptyArray', () => {
    it('returns true for non-empty arrays', () => {
      expect(isNonEmptyArray([1])).toBe(true);
      expect(isNonEmptyArray([1, 2, 3])).toBe(true);
    });

    it('returns false for empty array', () => {
      expect(isNonEmptyArray([])).toBe(false);
    });

    it('returns false for non-arrays', () => {
      expect(isNonEmptyArray('hello')).toBe(false);
      expect(isNonEmptyArray(null)).toBe(false);
    });
  });

  describe('isFiniteNumber', () => {
    it('returns true for finite numbers', () => {
      expect(isFiniteNumber(42)).toBe(true);
      expect(isFiniteNumber(0)).toBe(true);
      expect(isFiniteNumber(-3.14)).toBe(true);
    });

    it('returns false for Infinity and NaN', () => {
      expect(isFiniteNumber(Infinity)).toBe(false);
      expect(isFiniteNumber(-Infinity)).toBe(false);
      expect(isFiniteNumber(NaN)).toBe(false);
    });

    it('returns false for non-numbers', () => {
      expect(isFiniteNumber('42')).toBe(false);
    });
  });

  describe('isInteger', () => {
    it('returns true for integers', () => {
      expect(isInteger(42)).toBe(true);
      expect(isInteger(0)).toBe(true);
      expect(isInteger(-10)).toBe(true);
    });

    it('returns false for floats', () => {
      expect(isInteger(3.14)).toBe(false);
    });

    it('returns false for non-numbers', () => {
      expect(isInteger('42')).toBe(false);
    });
  });

  describe('isPositive', () => {
    it('returns true for positive numbers', () => {
      expect(isPositive(1)).toBe(true);
      expect(isPositive(0.001)).toBe(true);
    });

    it('returns false for zero and negative', () => {
      expect(isPositive(0)).toBe(false);
      expect(isPositive(-1)).toBe(false);
    });

    it('returns false for non-numbers', () => {
      expect(isPositive('1')).toBe(false);
    });
  });

  describe('isNegative', () => {
    it('returns true for negative numbers', () => {
      expect(isNegative(-1)).toBe(true);
      expect(isNegative(-0.001)).toBe(true);
    });

    it('returns false for zero and positive', () => {
      expect(isNegative(0)).toBe(false);
      expect(isNegative(1)).toBe(false);
    });
  });

  describe('hasProperty', () => {
    it('returns true when object has the property', () => {
      expect(hasProperty({ name: 'test' }, 'name')).toBe(true);
    });

    it('returns true for inherited properties', () => {
      const obj = Object.create({ inherited: true });
      expect(hasProperty(obj, 'inherited')).toBe(true);
    });

    it('returns false for missing property', () => {
      expect(hasProperty({ a: 1 }, 'b')).toBe(false);
    });

    it('returns false for non-objects', () => {
      expect(hasProperty(null, 'key')).toBe(false);
      expect(hasProperty(42, 'key')).toBe(false);
      expect(hasProperty('str', 'key')).toBe(false);
    });
  });

  describe('hasProperties', () => {
    it('returns true when object has all properties', () => {
      expect(hasProperties({ a: 1, b: 2, c: 3 }, ['a', 'b'])).toBe(true);
    });

    it('returns false when missing any property', () => {
      expect(hasProperties({ a: 1 }, ['a', 'b'])).toBe(false);
    });

    it('returns false for non-objects', () => {
      expect(hasProperties(null, ['a'])).toBe(false);
    });

    it('returns true for empty keys', () => {
      expect(hasProperties({}, [])).toBe(true);
    });
  });

  describe('assertType', () => {
    it('does not throw for valid type', () => {
      expect(() => assertType('hello', isString)).not.toThrow();
    });

    it('throws TypeError for invalid type', () => {
      expect(() => assertType(42, isString)).toThrow(TypeError);
    });

    it('throws with custom message', () => {
      expect(() => assertType(42, isString, 'Expected string')).toThrow(
        'Expected string'
      );
    });

    it('throws default message when no custom message', () => {
      expect(() => assertType(42, isString)).toThrow('Type assertion failed');
    });
  });
});
