import { describe, it, expect } from 'vitest';
import {
  hasFlag,
  addFlag,
  removeFlag,
  toggleFlag,
  setFlag,
  getFlags,
  countSetBits,
  createBitmask,
  bitmaskToString,
  fromBitmaskString,
  hasAnyFlag,
  hasAllFlags,
  lowestSetBit,
  highestSetBit,
} from './bitmaskUtils';

const READ = 0b001;
const WRITE = 0b010;
const EXEC = 0b100;

describe('bitmaskUtils', () => {
  describe('hasFlag', () => {
    it('returns true when flag is set', () => {
      expect(hasFlag(0b111, READ)).toBe(true);
      expect(hasFlag(0b111, WRITE)).toBe(true);
      expect(hasFlag(0b111, EXEC)).toBe(true);
    });

    it('returns false when flag is not set', () => {
      expect(hasFlag(0b001, WRITE)).toBe(false);
      expect(hasFlag(0b000, READ)).toBe(false);
    });
  });

  describe('addFlag', () => {
    it('adds a flag', () => {
      expect(addFlag(0b000, READ)).toBe(0b001);
      expect(addFlag(0b001, WRITE)).toBe(0b011);
    });

    it('is idempotent', () => {
      expect(addFlag(0b001, READ)).toBe(0b001);
    });
  });

  describe('removeFlag', () => {
    it('removes a flag', () => {
      expect(removeFlag(0b111, WRITE)).toBe(0b101);
    });

    it('is idempotent', () => {
      expect(removeFlag(0b101, WRITE)).toBe(0b101);
    });
  });

  describe('toggleFlag', () => {
    it('toggles flag on', () => {
      expect(toggleFlag(0b000, READ)).toBe(0b001);
    });

    it('toggles flag off', () => {
      expect(toggleFlag(0b001, READ)).toBe(0b000);
    });
  });

  describe('setFlag', () => {
    it('sets flag when enabled', () => {
      expect(setFlag(0b000, WRITE, true)).toBe(0b010);
    });

    it('clears flag when disabled', () => {
      expect(setFlag(0b010, WRITE, false)).toBe(0b000);
    });
  });

  describe('getFlags', () => {
    it('returns active flags', () => {
      expect(getFlags(0b101, [READ, WRITE, EXEC])).toEqual([READ, EXEC]);
    });

    it('returns empty for zero', () => {
      expect(getFlags(0, [READ, WRITE, EXEC])).toEqual([]);
    });

    it('returns all flags when all set', () => {
      expect(getFlags(0b111, [READ, WRITE, EXEC])).toEqual([READ, WRITE, EXEC]);
    });
  });

  describe('countSetBits', () => {
    it('counts bits correctly', () => {
      expect(countSetBits(0)).toBe(0);
      expect(countSetBits(1)).toBe(1);
      expect(countSetBits(0b111)).toBe(3);
      expect(countSetBits(0b1010)).toBe(2);
      expect(countSetBits(255)).toBe(8);
    });
  });

  describe('createBitmask', () => {
    it('creates mask from flags', () => {
      expect(createBitmask(READ, WRITE)).toBe(0b011);
      expect(createBitmask(READ, WRITE, EXEC)).toBe(0b111);
    });

    it('returns 0 for no flags', () => {
      expect(createBitmask()).toBe(0);
    });
  });

  describe('bitmaskToString', () => {
    it('converts to binary string', () => {
      expect(bitmaskToString(0b111, 8)).toBe('00000111');
      expect(bitmaskToString(0b001, 4)).toBe('0001');
    });

    it('defaults to 8 bits', () => {
      expect(bitmaskToString(5)).toBe('00000101');
    });
  });

  describe('fromBitmaskString', () => {
    it('parses binary string', () => {
      expect(fromBitmaskString('00000111')).toBe(7);
      expect(fromBitmaskString('0001')).toBe(1);
    });
  });

  describe('hasAnyFlag', () => {
    it('returns true if any flag matches', () => {
      expect(hasAnyFlag(0b001, 0b011)).toBe(true);
    });

    it('returns false if no flags match', () => {
      expect(hasAnyFlag(0b100, 0b011)).toBe(false);
    });
  });

  describe('hasAllFlags', () => {
    it('returns true if all flags present', () => {
      expect(hasAllFlags(0b111, 0b011)).toBe(true);
    });

    it('returns false if some flags missing', () => {
      expect(hasAllFlags(0b001, 0b011)).toBe(false);
    });
  });

  describe('lowestSetBit', () => {
    it('returns lowest set bit', () => {
      expect(lowestSetBit(0b1100)).toBe(0b0100);
      expect(lowestSetBit(0b1010)).toBe(0b0010);
      expect(lowestSetBit(1)).toBe(1);
    });

    it('returns 0 for zero', () => {
      expect(lowestSetBit(0)).toBe(0);
    });
  });

  describe('highestSetBit', () => {
    it('returns highest set bit', () => {
      expect(highestSetBit(0b1100)).toBe(0b1000);
      expect(highestSetBit(0b0110)).toBe(0b0100);
      expect(highestSetBit(1)).toBe(1);
    });

    it('returns 0 for zero', () => {
      expect(highestSetBit(0)).toBe(0);
    });
  });
});
