import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadWindowState, saveWindowState } from './windowState';

describe('windowState', () => {
  let tempDir: string;
  let statePath: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'gemini-gui-test-'));
    statePath = path.join(tempDir, 'window-state.json');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  describe('loadWindowState', () => {
    it('returns defaults when file does not exist', () => {
      const state = loadWindowState(statePath);
      expect(state).toEqual({ width: 1200, height: 800, isMaximized: false });
    });

    it('loads saved state from file', () => {
      const saved = { x: 100, y: 200, width: 1000, height: 600, isMaximized: false };
      fs.writeFileSync(statePath, JSON.stringify(saved), 'utf-8');

      const state = loadWindowState(statePath);
      expect(state).toEqual(saved);
    });

    it('loads maximized state', () => {
      const saved = { x: 0, y: 0, width: 1920, height: 1080, isMaximized: true };
      fs.writeFileSync(statePath, JSON.stringify(saved), 'utf-8');

      const state = loadWindowState(statePath);
      expect(state.isMaximized).toBe(true);
    });

    it('returns defaults for corrupt JSON', () => {
      fs.writeFileSync(statePath, 'not json', 'utf-8');

      const state = loadWindowState(statePath);
      expect(state).toEqual({ width: 1200, height: 800, isMaximized: false });
    });

    it('uses default width/height when values are invalid', () => {
      const saved = { x: 50, y: 50, width: -100, height: 0, isMaximized: false };
      fs.writeFileSync(statePath, JSON.stringify(saved), 'utf-8');

      const state = loadWindowState(statePath);
      expect(state.width).toBe(1200);
      expect(state.height).toBe(800);
      expect(state.x).toBe(50);
    });

    it('ignores non-number x/y values', () => {
      const saved = { x: 'abc', y: null, width: 800, height: 600, isMaximized: false };
      fs.writeFileSync(statePath, JSON.stringify(saved), 'utf-8');

      const state = loadWindowState(statePath);
      expect(state.x).toBeUndefined();
      expect(state.y).toBeUndefined();
      expect(state.width).toBe(800);
    });
  });

  describe('saveWindowState', () => {
    it('saves state to file', () => {
      const state = { x: 100, y: 200, width: 1000, height: 600, isMaximized: false };
      saveWindowState(statePath, state);

      const data = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      expect(data).toEqual(state);
    });

    it('overwrites existing state', () => {
      saveWindowState(statePath, { x: 0, y: 0, width: 800, height: 600, isMaximized: false });
      saveWindowState(statePath, { x: 100, y: 100, width: 1200, height: 800, isMaximized: true });

      const data = JSON.parse(fs.readFileSync(statePath, 'utf-8'));
      expect(data.x).toBe(100);
      expect(data.isMaximized).toBe(true);
    });

    it('creates parent directory if missing', () => {
      const nestedPath = path.join(tempDir, 'sub', 'dir', 'state.json');
      saveWindowState(nestedPath, { width: 1200, height: 800, isMaximized: false });

      expect(fs.existsSync(nestedPath)).toBe(true);
    });

    it('roundtrips with loadWindowState', () => {
      const original = { x: 42, y: 84, width: 1600, height: 900, isMaximized: true };
      saveWindowState(statePath, original);

      const loaded = loadWindowState(statePath);
      expect(loaded).toEqual(original);
    });
  });
});
