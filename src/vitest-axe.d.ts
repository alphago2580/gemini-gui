import type { AxeResults } from 'axe-core';

interface AxeMatchers {
  toHaveNoViolations(): void;
}

declare module '@vitest/expect' {
  interface Assertion<T> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
