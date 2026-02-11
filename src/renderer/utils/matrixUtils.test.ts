import { describe, it, expect } from 'vitest';
import {
  createMatrix,
  identity,
  add,
  subtract,
  multiply,
  scalarMultiply,
  transpose,
  determinant,
  minor,
  cofactor,
  inverse,
  trace,
  isSquare,
  isSymmetric,
  isDiagonal,
  isIdentity,
  flatten,
  fromFlat,
  getRow,
  getColumn,
  equals,
  dimensions,
} from './matrixUtils';

describe('matrixUtils', () => {
  describe('createMatrix', () => {
    it('creates a matrix filled with zeros by default', () => {
      expect(createMatrix(2, 3)).toEqual([[0, 0, 0], [0, 0, 0]]);
    });

    it('creates a matrix filled with a custom value', () => {
      expect(createMatrix(2, 2, 5)).toEqual([[5, 5], [5, 5]]);
    });

    it('creates a 1x1 matrix', () => {
      expect(createMatrix(1, 1)).toEqual([[0]]);
    });
  });

  describe('identity', () => {
    it('creates a 2x2 identity matrix', () => {
      expect(identity(2)).toEqual([[1, 0], [0, 1]]);
    });

    it('creates a 3x3 identity matrix', () => {
      expect(identity(3)).toEqual([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
    });

    it('creates a 1x1 identity matrix', () => {
      expect(identity(1)).toEqual([[1]]);
    });
  });

  describe('add', () => {
    it('adds two matrices', () => {
      const a = [[1, 2], [3, 4]];
      const b = [[5, 6], [7, 8]];
      expect(add(a, b)).toEqual([[6, 8], [10, 12]]);
    });

    it('throws on dimension mismatch', () => {
      expect(() => add([[1]], [[1, 2]])).toThrow('same dimensions');
    });

    it('adds matrices with negative values', () => {
      const a = [[1, -2], [-3, 4]];
      const b = [[-1, 2], [3, -4]];
      expect(add(a, b)).toEqual([[0, 0], [0, 0]]);
    });
  });

  describe('subtract', () => {
    it('subtracts two matrices', () => {
      const a = [[5, 6], [7, 8]];
      const b = [[1, 2], [3, 4]];
      expect(subtract(a, b)).toEqual([[4, 4], [4, 4]]);
    });

    it('throws on dimension mismatch', () => {
      expect(() => subtract([[1, 2]], [[1]])).toThrow('same dimensions');
    });
  });

  describe('multiply', () => {
    it('multiplies two 2x2 matrices', () => {
      const a = [[1, 2], [3, 4]];
      const b = [[5, 6], [7, 8]];
      expect(multiply(a, b)).toEqual([[19, 22], [43, 50]]);
    });

    it('multiplies non-square matrices', () => {
      const a = [[1, 2, 3]];
      const b = [[4], [5], [6]];
      expect(multiply(a, b)).toEqual([[32]]);
    });

    it('throws on incompatible dimensions', () => {
      expect(() => multiply([[1, 2]], [[1, 2]])).toThrow('columns in A must equal');
    });

    it('identity multiplication returns original matrix', () => {
      const m = [[1, 2], [3, 4]];
      const id = identity(2);
      expect(multiply(m, id)).toEqual(m);
      expect(multiply(id, m)).toEqual(m);
    });
  });

  describe('scalarMultiply', () => {
    it('multiplies a matrix by a scalar', () => {
      expect(scalarMultiply([[1, 2], [3, 4]], 2)).toEqual([[2, 4], [6, 8]]);
    });

    it('multiplies by zero', () => {
      expect(scalarMultiply([[1, 2], [3, 4]], 0)).toEqual([[0, 0], [0, 0]]);
    });

    it('multiplies by negative scalar', () => {
      expect(scalarMultiply([[1, -2]], -3)).toEqual([[-3, 6]]);
    });
  });

  describe('transpose', () => {
    it('transposes a 2x3 matrix', () => {
      expect(transpose([[1, 2, 3], [4, 5, 6]])).toEqual([[1, 4], [2, 5], [3, 6]]);
    });

    it('transposes a square matrix', () => {
      expect(transpose([[1, 2], [3, 4]])).toEqual([[1, 3], [2, 4]]);
    });

    it('double transpose returns original', () => {
      const m = [[1, 2, 3], [4, 5, 6]];
      expect(transpose(transpose(m))).toEqual(m);
    });
  });

  describe('determinant', () => {
    it('computes determinant of 1x1 matrix', () => {
      expect(determinant([[5]])).toBe(5);
    });

    it('computes determinant of 2x2 matrix', () => {
      expect(determinant([[1, 2], [3, 4]])).toBe(-2);
    });

    it('computes determinant of 3x3 matrix', () => {
      expect(determinant([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).toBe(0);
    });

    it('computes determinant of identity matrix', () => {
      expect(determinant(identity(3))).toBe(1);
    });

    it('throws for non-square matrix', () => {
      expect(() => determinant([[1, 2, 3], [4, 5, 6]])).toThrow('square');
    });

    it('computes determinant of 3x3 non-singular matrix', () => {
      expect(determinant([[2, 1, 3], [0, 4, 1], [5, 2, 0]])).toBe(-59);
    });
  });

  describe('minor', () => {
    it('removes a row and column', () => {
      const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      expect(minor(m, 0, 0)).toEqual([[5, 6], [8, 9]]);
    });

    it('removes middle row and column', () => {
      const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      expect(minor(m, 1, 1)).toEqual([[1, 3], [7, 9]]);
    });
  });

  describe('cofactor', () => {
    it('computes cofactor matrix of 2x2', () => {
      const m = [[1, 2], [3, 4]];
      expect(cofactor(m)).toEqual([[4, -3], [-2, 1]]);
    });
  });

  describe('inverse', () => {
    it('inverts a 2x2 matrix', () => {
      const m = [[4, 7], [2, 6]];
      const inv = inverse(m);
      const product = multiply(m, inv);
      expect(equals(product, identity(2), 1e-10)).toBe(true);
    });

    it('throws for singular matrix', () => {
      expect(() => inverse([[1, 2], [2, 4]])).toThrow('singular');
    });

    it('inverts identity to identity', () => {
      expect(equals(inverse(identity(3)), identity(3), 1e-10)).toBe(true);
    });
  });

  describe('trace', () => {
    it('computes trace of square matrix', () => {
      expect(trace([[1, 2], [3, 4]])).toBe(5);
    });

    it('computes trace of identity', () => {
      expect(trace(identity(4))).toBe(4);
    });

    it('handles non-square matrix (uses min dimension)', () => {
      expect(trace([[1, 2, 3], [4, 5, 6]])).toBe(6);
    });
  });

  describe('isSquare', () => {
    it('returns true for square matrix', () => {
      expect(isSquare([[1, 2], [3, 4]])).toBe(true);
    });

    it('returns false for non-square matrix', () => {
      expect(isSquare([[1, 2, 3], [4, 5, 6]])).toBe(false);
    });
  });

  describe('isSymmetric', () => {
    it('returns true for symmetric matrix', () => {
      expect(isSymmetric([[1, 2, 3], [2, 5, 6], [3, 6, 9]])).toBe(true);
    });

    it('returns false for non-symmetric matrix', () => {
      expect(isSymmetric([[1, 2], [3, 4]])).toBe(false);
    });

    it('returns false for non-square matrix', () => {
      expect(isSymmetric([[1, 2, 3]])).toBe(false);
    });

    it('identity is symmetric', () => {
      expect(isSymmetric(identity(3))).toBe(true);
    });
  });

  describe('isDiagonal', () => {
    it('returns true for diagonal matrix', () => {
      expect(isDiagonal([[1, 0], [0, 2]])).toBe(true);
    });

    it('returns false for non-diagonal matrix', () => {
      expect(isDiagonal([[1, 2], [0, 3]])).toBe(false);
    });

    it('returns false for non-square matrix', () => {
      expect(isDiagonal([[1, 0, 0]])).toBe(false);
    });

    it('identity is diagonal', () => {
      expect(isDiagonal(identity(3))).toBe(true);
    });

    it('zero matrix is diagonal', () => {
      expect(isDiagonal(createMatrix(3, 3))).toBe(true);
    });
  });

  describe('isIdentity', () => {
    it('returns true for identity matrix', () => {
      expect(isIdentity(identity(3))).toBe(true);
    });

    it('returns false for non-identity diagonal', () => {
      expect(isIdentity([[2, 0], [0, 2]])).toBe(false);
    });

    it('returns false for non-square', () => {
      expect(isIdentity([[1, 0, 0]])).toBe(false);
    });

    it('returns false for non-diagonal', () => {
      expect(isIdentity([[1, 1], [0, 1]])).toBe(false);
    });
  });

  describe('flatten', () => {
    it('flattens a matrix to a 1D array', () => {
      expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    });

    it('flattens a single row', () => {
      expect(flatten([[1, 2, 3]])).toEqual([1, 2, 3]);
    });
  });

  describe('fromFlat', () => {
    it('creates a matrix from flat array', () => {
      expect(fromFlat([1, 2, 3, 4, 5, 6], 2, 3)).toEqual([[1, 2, 3], [4, 5, 6]]);
    });

    it('throws on invalid length', () => {
      expect(() => fromFlat([1, 2, 3], 2, 2)).toThrow('rows * cols');
    });

    it('round-trips with flatten', () => {
      const m = [[1, 2, 3], [4, 5, 6]];
      expect(fromFlat(flatten(m), 2, 3)).toEqual(m);
    });
  });

  describe('getRow', () => {
    it('returns a copy of the specified row', () => {
      const m = [[1, 2], [3, 4]];
      const row = getRow(m, 0);
      expect(row).toEqual([1, 2]);
      row[0] = 99;
      expect(m[0][0]).toBe(1); // original unchanged
    });
  });

  describe('getColumn', () => {
    it('returns the specified column', () => {
      const m = [[1, 2], [3, 4], [5, 6]];
      expect(getColumn(m, 1)).toEqual([2, 4, 6]);
    });
  });

  describe('equals', () => {
    it('returns true for identical matrices', () => {
      const m = [[1, 2], [3, 4]];
      expect(equals(m, [[1, 2], [3, 4]])).toBe(true);
    });

    it('returns false for different matrices', () => {
      expect(equals([[1, 2]], [[1, 3]])).toBe(false);
    });

    it('returns false for different dimensions', () => {
      expect(equals([[1, 2]], [[1], [2]])).toBe(false);
    });

    it('uses epsilon for approximate equality', () => {
      expect(equals([[1.0001]], [[1.0002]], 0.001)).toBe(true);
    });

    it('fails with tight epsilon', () => {
      expect(equals([[1.0001]], [[1.0002]], 0.00001)).toBe(false);
    });
  });

  describe('dimensions', () => {
    it('returns [rows, cols]', () => {
      expect(dimensions([[1, 2, 3], [4, 5, 6]])).toEqual([2, 3]);
    });

    it('returns [1, 1] for 1x1 matrix', () => {
      expect(dimensions([[0]])).toEqual([1, 1]);
    });
  });
});
