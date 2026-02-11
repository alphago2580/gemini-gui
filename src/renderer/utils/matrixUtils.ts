export type Matrix = number[][];

export function createMatrix(rows: number, cols: number, fill: number = 0): Matrix {
  return Array.from({ length: rows }, () => Array(cols).fill(fill));
}

export function identity(size: number): Matrix {
  const m = createMatrix(size, size);
  for (let i = 0; i < size; i++) {
    m[i][i] = 1;
  }
  return m;
}

export function add(a: Matrix, b: Matrix): Matrix {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error('Matrices must have the same dimensions for addition');
  }
  return a.map((row, i) => row.map((val, j) => val + b[i][j]));
}

export function subtract(a: Matrix, b: Matrix): Matrix {
  if (a.length !== b.length || a[0].length !== b[0].length) {
    throw new Error('Matrices must have the same dimensions for subtraction');
  }
  return a.map((row, i) => row.map((val, j) => val - b[i][j]));
}

export function multiply(a: Matrix, b: Matrix): Matrix {
  if (a[0].length !== b.length) {
    throw new Error('Number of columns in A must equal number of rows in B');
  }
  const rows = a.length;
  const cols = b[0].length;
  const common = b.length;
  const result = createMatrix(rows, cols);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let k = 0; k < common; k++) {
        sum += a[i][k] * b[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

export function scalarMultiply(matrix: Matrix, scalar: number): Matrix {
  return matrix.map(row => row.map(val => val * scalar));
}

export function transpose(matrix: Matrix): Matrix {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = createMatrix(cols, rows);
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }
  return result;
}

export function determinant(matrix: Matrix): number {
  const n = matrix.length;
  if (n !== matrix[0].length) {
    throw new Error('Matrix must be square to compute determinant');
  }
  if (n === 1) return matrix[0][0];
  if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];

  let det = 0;
  for (let j = 0; j < n; j++) {
    det += (j % 2 === 0 ? 1 : -1) * matrix[0][j] * determinant(minor(matrix, 0, j));
  }
  return det;
}

export function minor(matrix: Matrix, row: number, col: number): Matrix {
  return matrix
    .filter((_, i) => i !== row)
    .map(r => r.filter((_, j) => j !== col));
}

export function cofactor(matrix: Matrix): Matrix {
  const n = matrix.length;
  return matrix.map((row, i) =>
    row.map((_, j) => {
      const sign = (i + j) % 2 === 0 ? 1 : -1;
      return sign * determinant(minor(matrix, i, j));
    })
  );
}

export function inverse(matrix: Matrix): Matrix {
  const det = determinant(matrix);
  if (det === 0) {
    throw new Error('Matrix is singular and cannot be inverted');
  }
  const cof = cofactor(matrix);
  const adj = transpose(cof);
  return scalarMultiply(adj, 1 / det);
}

export function trace(matrix: Matrix): number {
  const n = Math.min(matrix.length, matrix[0].length);
  let sum = 0;
  for (let i = 0; i < n; i++) {
    sum += matrix[i][i];
  }
  return sum;
}

export function isSquare(matrix: Matrix): boolean {
  return matrix.length === matrix[0].length;
}

export function isSymmetric(matrix: Matrix): boolean {
  if (!isSquare(matrix)) return false;
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (matrix[i][j] !== matrix[j][i]) return false;
    }
  }
  return true;
}

export function isDiagonal(matrix: Matrix): boolean {
  if (!isSquare(matrix)) return false;
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && matrix[i][j] !== 0) return false;
    }
  }
  return true;
}

export function isIdentity(matrix: Matrix): boolean {
  if (!isSquare(matrix)) return false;
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j && matrix[i][j] !== 1) return false;
      if (i !== j && matrix[i][j] !== 0) return false;
    }
  }
  return true;
}

export function flatten(matrix: Matrix): number[] {
  return matrix.reduce((acc, row) => [...acc, ...row], []);
}

export function fromFlat(flat: number[], rows: number, cols: number): Matrix {
  if (flat.length !== rows * cols) {
    throw new Error('Flat array length must equal rows * cols');
  }
  const result: Matrix = [];
  for (let i = 0; i < rows; i++) {
    result.push(flat.slice(i * cols, (i + 1) * cols));
  }
  return result;
}

export function getRow(matrix: Matrix, row: number): number[] {
  return [...matrix[row]];
}

export function getColumn(matrix: Matrix, col: number): number[] {
  return matrix.map(row => row[col]);
}

export function equals(a: Matrix, b: Matrix, epsilon: number = 0): boolean {
  if (a.length !== b.length || a[0].length !== b[0].length) return false;
  return a.every((row, i) =>
    row.every((val, j) => Math.abs(val - b[i][j]) <= epsilon)
  );
}

export function dimensions(matrix: Matrix): [number, number] {
  return [matrix.length, matrix[0].length];
}
