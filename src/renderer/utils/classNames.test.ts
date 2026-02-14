import { describe, it, expect } from 'vitest';
import { classNames } from './classNames';

describe('classNames', () => {
  it('returns empty string for no arguments', () => {
    expect(classNames()).toBe('');
  });

  it('joins string arguments', () => {
    expect(classNames('foo', 'bar')).toBe('foo bar');
  });

  it('handles single string', () => {
    expect(classNames('foo')).toBe('foo');
  });

  it('ignores falsy values', () => {
    expect(classNames('foo', null, undefined, false, '', 0, 'bar')).toBe('foo bar');
  });

  it('handles number arguments', () => {
    expect(classNames('foo', 42)).toBe('foo 42');
  });

  it('handles object with truthy values', () => {
    expect(classNames({ active: true, disabled: false, selected: true })).toBe('active selected');
  });

  it('handles object with all falsy values', () => {
    expect(classNames({ a: false, b: null, c: undefined })).toBe('');
  });

  it('handles mixed strings and objects', () => {
    expect(classNames('btn', { 'btn--active': true, 'btn--disabled': false })).toBe('btn btn--active');
  });

  it('handles arrays', () => {
    expect(classNames(['foo', 'bar'])).toBe('foo bar');
  });

  it('handles nested arrays', () => {
    expect(classNames(['foo', ['bar', 'baz']])).toBe('foo bar baz');
  });

  it('handles arrays with falsy values', () => {
    expect(classNames(['foo', null, 'bar', false])).toBe('foo bar');
  });

  it('handles mixed strings, arrays, and objects', () => {
    expect(
      classNames('base', ['mod1', 'mod2'], { active: true, hidden: false })
    ).toBe('base mod1 mod2 active');
  });

  it('handles all falsy arguments', () => {
    expect(classNames(null, undefined, false, '')).toBe('');
  });

  it('handles real-world component pattern', () => {
    const size = 'medium' as string;
    const shape = 'circle' as string;
    const isClickable = true;
    expect(
      classNames('avatar', `avatar--${size}`, `avatar--${shape}`, { 'avatar--clickable': isClickable })
    ).toBe('avatar avatar--medium avatar--circle avatar--clickable');
  });

  it('handles conditional class with ternary', () => {
    const isActive = true;
    expect(classNames('tab', isActive && 'tab--active')).toBe('tab tab--active');
  });

  it('handles conditional class with false ternary', () => {
    const isActive = false;
    expect(classNames('tab', isActive && 'tab--active')).toBe('tab');
  });
});
