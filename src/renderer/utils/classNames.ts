/**
 * Conditional CSS class name builder.
 * Combines class names from strings, arrays, and objects.
 */

type ClassValue = string | number | boolean | undefined | null | ClassRecord | ClassValue[];
type ClassRecord = Record<string, boolean | undefined | null>;

export function classNames(...args: ClassValue[]): string {
  const classes: string[] = [];

  for (const arg of args) {
    if (!arg) continue;

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(String(arg));
    } else if (Array.isArray(arg)) {
      const inner = classNames(...arg);
      if (inner) classes.push(inner);
    } else if (typeof arg === 'object') {
      for (const key of Object.keys(arg)) {
        if ((arg as ClassRecord)[key]) {
          classes.push(key);
        }
      }
    }
  }

  return classes.join(' ');
}
