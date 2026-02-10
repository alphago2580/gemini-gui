import * as fs from 'fs';
import * as path from 'path';

export interface WindowState {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
}

const DEFAULT_STATE: WindowState = { width: 1200, height: 800, isMaximized: false };

export function loadWindowState(statePath: string): WindowState {
  try {
    if (fs.existsSync(statePath)) {
      const data = fs.readFileSync(statePath, 'utf-8');
      const state = JSON.parse(data) as Partial<WindowState>;
      return {
        x: typeof state.x === 'number' ? state.x : undefined,
        y: typeof state.y === 'number' ? state.y : undefined,
        width: typeof state.width === 'number' && state.width > 0 ? state.width : DEFAULT_STATE.width,
        height: typeof state.height === 'number' && state.height > 0 ? state.height : DEFAULT_STATE.height,
        isMaximized: typeof state.isMaximized === 'boolean' ? state.isMaximized : false,
      };
    }
  } catch {
    // ignore corrupt state file
  }
  return { ...DEFAULT_STATE };
}

export function saveWindowState(statePath: string, state: WindowState): void {
  try {
    const dir = path.dirname(statePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(statePath, JSON.stringify(state), 'utf-8');
  } catch {
    // ignore write errors
  }
}
