import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  lighten,
  darken,
  luminance,
  contrastRatio,
  mix,
  getContrastText,
  rgbToCss,
  rgbaToCss,
} from './colorUtils';

describe('hexToRgb', () => {
  it('parses 6-digit hex', () => {
    expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('parses 3-digit hex', () => {
    expect(hexToRgb('#fff')).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('parses without hash prefix', () => {
    expect(hexToRgb('00ff00')).toEqual({ r: 0, g: 255, b: 0 });
  });

  it('returns null for invalid hex', () => {
    expect(hexToRgb('#xyz')).toBeNull();
    expect(hexToRgb('#12')).toBeNull();
    expect(hexToRgb('')).toBeNull();
  });

  it('parses black correctly', () => {
    expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
  });
});

describe('rgbToHex', () => {
  it('converts RGB to hex string', () => {
    expect(rgbToHex({ r: 255, g: 0, b: 0 })).toBe('#ff0000');
  });

  it('pads single-digit hex values', () => {
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
  });

  it('clamps values to 0-255', () => {
    expect(rgbToHex({ r: 300, g: -10, b: 128 })).toBe('#ff0080');
  });

  it('rounds fractional values', () => {
    expect(rgbToHex({ r: 127.6, g: 0, b: 255 })).toBe('#8000ff');
  });
});

describe('rgbToHsl', () => {
  it('converts red to HSL', () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 0 });
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('converts white to HSL', () => {
    const hsl = rgbToHsl({ r: 255, g: 255, b: 255 });
    expect(hsl.h).toBe(0);
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBe(100);
  });

  it('converts gray to HSL', () => {
    const hsl = rgbToHsl({ r: 128, g: 128, b: 128 });
    expect(hsl.s).toBe(0);
    expect(hsl.l).toBeCloseTo(50, 0);
  });

  it('converts green to HSL', () => {
    const hsl = rgbToHsl({ r: 0, g: 255, b: 0 });
    expect(hsl.h).toBe(120);
    expect(hsl.s).toBe(100);
  });

  it('converts blue to HSL', () => {
    const hsl = rgbToHsl({ r: 0, g: 0, b: 255 });
    expect(hsl.h).toBe(240);
    expect(hsl.s).toBe(100);
  });
});

describe('hslToRgb', () => {
  it('converts red HSL to RGB', () => {
    const rgb = hslToRgb({ h: 0, s: 100, l: 50 });
    expect(rgb.r).toBe(255);
    expect(rgb.g).toBe(0);
    expect(rgb.b).toBe(0);
  });

  it('converts gray HSL to RGB', () => {
    const rgb = hslToRgb({ h: 0, s: 0, l: 50 });
    expect(rgb.r).toBe(128);
    expect(rgb.g).toBe(128);
    expect(rgb.b).toBe(128);
  });

  it('roundtrips with rgbToHsl', () => {
    const original = { r: 100, g: 150, b: 200 };
    const hsl = rgbToHsl(original);
    const result = hslToRgb(hsl);
    expect(Math.abs(result.r - original.r)).toBeLessThanOrEqual(1);
    expect(Math.abs(result.g - original.g)).toBeLessThanOrEqual(1);
    expect(Math.abs(result.b - original.b)).toBeLessThanOrEqual(1);
  });
});

describe('lighten', () => {
  it('lightens a dark color', () => {
    const result = lighten('#333333', 20);
    const rgb = hexToRgb(result)!;
    const originalRgb = hexToRgb('#333333')!;
    expect(rgbToHsl(rgb).l).toBeGreaterThan(rgbToHsl(originalRgb).l);
  });

  it('does not exceed white', () => {
    const result = lighten('#cccccc', 90);
    const rgb = hexToRgb(result)!;
    expect(rgbToHsl(rgb).l).toBeLessThanOrEqual(100);
  });

  it('returns original for invalid hex', () => {
    expect(lighten('invalid', 20)).toBe('invalid');
  });
});

describe('darken', () => {
  it('darkens a light color', () => {
    const result = darken('#cccccc', 20);
    const rgb = hexToRgb(result)!;
    const originalRgb = hexToRgb('#cccccc')!;
    expect(rgbToHsl(rgb).l).toBeLessThan(rgbToHsl(originalRgb).l);
  });

  it('does not go below black', () => {
    const result = darken('#333333', 90);
    const rgb = hexToRgb(result)!;
    expect(rgbToHsl(rgb).l).toBeGreaterThanOrEqual(0);
  });

  it('returns original for invalid hex', () => {
    expect(darken('invalid', 20)).toBe('invalid');
  });
});

describe('luminance', () => {
  it('returns 1 for white', () => {
    expect(luminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 2);
  });

  it('returns 0 for black', () => {
    expect(luminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });

  it('returns intermediate value for gray', () => {
    const lum = luminance({ r: 128, g: 128, b: 128 });
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(1);
  });
});

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    const ratio = contrastRatio({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 });
    expect(ratio).toBeCloseTo(21, 0);
  });

  it('returns 1 for same colors', () => {
    const ratio = contrastRatio({ r: 128, g: 128, b: 128 }, { r: 128, g: 128, b: 128 });
    expect(ratio).toBe(1);
  });

  it('is commutative', () => {
    const a = { r: 100, g: 50, b: 200 };
    const b = { r: 200, g: 200, b: 50 };
    expect(contrastRatio(a, b)).toBe(contrastRatio(b, a));
  });
});

describe('mix', () => {
  it('returns first color at 0%', () => {
    expect(mix('#ff0000', '#0000ff', 0)).toBe('#ff0000');
  });

  it('returns second color at 100%', () => {
    expect(mix('#ff0000', '#0000ff', 100)).toBe('#0000ff');
  });

  it('returns midpoint at 50%', () => {
    const result = mix('#000000', '#ffffff', 50);
    const rgb = hexToRgb(result)!;
    expect(rgb.r).toBe(128);
    expect(rgb.g).toBe(128);
    expect(rgb.b).toBe(128);
  });

  it('returns first color for invalid second', () => {
    expect(mix('#ff0000', 'invalid', 50)).toBe('#ff0000');
  });
});

describe('getContrastText', () => {
  it('returns black for white background', () => {
    expect(getContrastText('#ffffff')).toBe('#000000');
  });

  it('returns white for black background', () => {
    expect(getContrastText('#000000')).toBe('#ffffff');
  });

  it('returns white for dark blue background', () => {
    expect(getContrastText('#003366')).toBe('#ffffff');
  });

  it('returns black for light yellow background', () => {
    expect(getContrastText('#ffff00')).toBe('#000000');
  });

  it('returns black for invalid color', () => {
    expect(getContrastText('invalid')).toBe('#000000');
  });
});

describe('rgbToCss', () => {
  it('formats as rgb() string', () => {
    expect(rgbToCss({ r: 255, g: 128, b: 0 })).toBe('rgb(255, 128, 0)');
  });

  it('rounds fractional values', () => {
    expect(rgbToCss({ r: 127.6, g: 0.4, b: 255 })).toBe('rgb(128, 0, 255)');
  });
});

describe('rgbaToCss', () => {
  it('formats as rgba() string', () => {
    expect(rgbaToCss({ r: 255, g: 0, b: 0 }, 0.5)).toBe('rgba(255, 0, 0, 0.5)');
  });

  it('handles full opacity', () => {
    expect(rgbaToCss({ r: 0, g: 0, b: 0 }, 1)).toBe('rgba(0, 0, 0, 1)');
  });

  it('handles zero alpha', () => {
    expect(rgbaToCss({ r: 255, g: 255, b: 255 }, 0)).toBe('rgba(255, 255, 255, 0)');
  });
});

describe('hexToRgb edge cases', () => {
  it('parses uppercase hex', () => {
    expect(hexToRgb('#FF00FF')).toEqual({ r: 255, g: 0, b: 255 });
  });

  it('parses mixed case hex', () => {
    expect(hexToRgb('#aAbBcC')).toEqual({ r: 170, g: 187, b: 204 });
  });

  it('returns null for 4-digit hex', () => {
    expect(hexToRgb('#1234')).toBeNull();
  });

  it('returns null for 5-digit hex', () => {
    expect(hexToRgb('#12345')).toBeNull();
  });
});

describe('rgbToHsl edge cases', () => {
  it('converts cyan (max === g)', () => {
    const hsl = rgbToHsl({ r: 0, g: 255, b: 255 });
    expect(hsl.h).toBe(180);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('converts magenta (max === r, g < b)', () => {
    const hsl = rgbToHsl({ r: 255, g: 0, b: 255 });
    expect(hsl.h).toBe(300);
    expect(hsl.s).toBe(100);
    expect(hsl.l).toBe(50);
  });

  it('converts dark color with lightness below 0.5', () => {
    const hsl = rgbToHsl({ r: 50, g: 25, b: 75 });
    expect(hsl.l).toBeLessThan(50);
    expect(hsl.s).toBeGreaterThan(0);
  });
});

describe('hslToRgb edge cases', () => {
  it('converts green HSL to RGB', () => {
    const rgb = hslToRgb({ h: 120, s: 100, l: 50 });
    expect(rgb.r).toBe(0);
    expect(rgb.g).toBe(255);
    expect(rgb.b).toBe(0);
  });

  it('converts blue HSL to RGB', () => {
    const rgb = hslToRgb({ h: 240, s: 100, l: 50 });
    expect(rgb.r).toBe(0);
    expect(rgb.g).toBe(0);
    expect(rgb.b).toBe(255);
  });

  it('converts white HSL to RGB', () => {
    const rgb = hslToRgb({ h: 0, s: 0, l: 100 });
    expect(rgb.r).toBe(255);
    expect(rgb.g).toBe(255);
    expect(rgb.b).toBe(255);
  });

  it('converts black HSL to RGB', () => {
    const rgb = hslToRgb({ h: 0, s: 0, l: 0 });
    expect(rgb.r).toBe(0);
    expect(rgb.g).toBe(0);
    expect(rgb.b).toBe(0);
  });
});

describe('lighten edge cases', () => {
  it('lighten by 0 keeps color unchanged', () => {
    const original = '#808080';
    const result = lighten(original, 0);
    expect(result).toBe(original);
  });
});

describe('darken edge cases', () => {
  it('darken by 0 keeps color unchanged', () => {
    const original = '#808080';
    const result = darken(original, 0);
    expect(result).toBe(original);
  });
});

describe('luminance edge cases', () => {
  it('pure red has lower luminance than pure green', () => {
    const redLum = luminance({ r: 255, g: 0, b: 0 });
    const greenLum = luminance({ r: 0, g: 255, b: 0 });
    expect(greenLum).toBeGreaterThan(redLum);
  });

  it('values at sRGB threshold boundary (10)', () => {
    const lum = luminance({ r: 10, g: 10, b: 10 });
    expect(lum).toBeGreaterThan(0);
    expect(lum).toBeLessThan(0.01);
  });
});

describe('contrastRatio edge cases', () => {
  it('ratio is always >= 1', () => {
    const ratio = contrastRatio({ r: 100, g: 100, b: 100 }, { r: 110, g: 110, b: 110 });
    expect(ratio).toBeGreaterThanOrEqual(1);
  });
});

describe('mix edge cases', () => {
  it('returns first color for invalid first arg', () => {
    expect(mix('invalid', '#0000ff', 50)).toBe('invalid');
  });

  it('uses default weight of 50', () => {
    const result = mix('#000000', '#ffffff');
    const rgb = hexToRgb(result)!;
    expect(rgb.r).toBe(128);
  });
});

describe('getContrastText edge cases', () => {
  it('returns white for mid-dark gray', () => {
    expect(getContrastText('#404040')).toBe('#ffffff');
  });

  it('returns black for mid-light gray', () => {
    expect(getContrastText('#c0c0c0')).toBe('#000000');
  });
});
