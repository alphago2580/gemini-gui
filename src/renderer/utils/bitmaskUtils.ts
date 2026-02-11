export function hasFlag(value: number, flag: number): boolean {
  return (value & flag) === flag;
}

export function addFlag(value: number, flag: number): number {
  return value | flag;
}

export function removeFlag(value: number, flag: number): number {
  return value & ~flag;
}

export function toggleFlag(value: number, flag: number): number {
  return value ^ flag;
}

export function setFlag(value: number, flag: number, enabled: boolean): number {
  return enabled ? addFlag(value, flag) : removeFlag(value, flag);
}

export function getFlags(value: number, allFlags: number[]): number[] {
  return allFlags.filter(flag => hasFlag(value, flag));
}

export function countSetBits(value: number): number {
  let count = 0;
  let n = value;
  while (n) {
    count += n & 1;
    n >>>= 1;
  }
  return count;
}

export function createBitmask(...flags: number[]): number {
  return flags.reduce((mask, flag) => mask | flag, 0);
}

export function bitmaskToString(value: number, bits: number = 8): string {
  return value.toString(2).padStart(bits, '0');
}

export function fromBitmaskString(str: string): number {
  return parseInt(str, 2);
}

export function hasAnyFlag(value: number, flags: number): boolean {
  return (value & flags) !== 0;
}

export function hasAllFlags(value: number, flags: number): boolean {
  return (value & flags) === flags;
}

export function lowestSetBit(value: number): number {
  if (value === 0) return 0;
  return value & -value;
}

export function highestSetBit(value: number): number {
  if (value === 0) return 0;
  let n = value;
  n |= n >> 1;
  n |= n >> 2;
  n |= n >> 4;
  n |= n >> 8;
  n |= n >> 16;
  return n - (n >> 1);
}
