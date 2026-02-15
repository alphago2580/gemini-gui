import * as path from 'path';
import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';

// Define Interface for PTY to allow mocking
export interface IPtyProcess {
    on(event: 'data', listener: (data: string) => void): void;
    on(event: 'exit', listener: (code: number) => void): void;
    on(event: string, listener: (...args: unknown[]) => void): void;
    write(data: string): void;
    kill(): void;
    resize(cols: number, rows: number): void;
}

export interface PtyModule {
    spawn(file: string, args: string[], options: Record<string, unknown>): IPtyProcess;
}

let pty: PtyModule | undefined;
try {
    pty = require('node-pty');
} catch {
    console.warn('node-pty not found. Interactive mode might not work.');
}

export class GeminiProcess extends EventEmitter {
    private process: IPtyProcess | ChildProcess | null = null;
    private buffer: string = '';
    private isPtyAvailable: boolean;
    private ptyModule: PtyModule | undefined;

    constructor(ptyModule?: PtyModule) {
        super();
        this.ptyModule = ptyModule || pty;
        this.isPtyAvailable = !!this.ptyModule;
    }

    public start(cliPath: string, cwd: string, env: NodeJS.ProcessEnv = process.env, systemPrompt?: string, model?: string) {
        if (this.process) return;

        // Use passed CLI path or default
        const executable = 'node';
        const args = [
            cliPath,
            '--output-format', 'stream-json',
            '--yolo' // Skip confirmations
        ];

        if (systemPrompt) {
            args.push('--system-instruction', systemPrompt);
        }

        if (model && model !== 'auto') {
            args.push('--model', model);
        }

        console.log(`[GeminiProcess] Starting at ${cliPath}`);

        if (this.isPtyAvailable) {
            this.startPty(executable, args, cwd, env);
        } else {
            console.warn('[GeminiProcess] node-pty not found. Falling back to standard child_process.');
            this.startSpawn(executable, args, cwd, env);
        }
    }

    private startSpawn(exe: string, args: string[], cwd: string, env: NodeJS.ProcessEnv) {
        try {
            // Use pipe for stdio to capture output
            const proc = spawn(exe, args, {
                cwd: cwd,
                env: env,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            this.process = proc;
            console.log('[GeminiProcess] Spawned via child_process');

            // Handle stdout
            proc.stdout?.setEncoding('utf8');
            proc.stdout?.on('data', (data: string) => {
                this.handleData(data);
            });

            // Handle stderr
            proc.stderr?.setEncoding('utf8');
            proc.stderr?.on('data', (data: string) => {
                console.error('[CLI Stderr]', data);
            });

            proc.on('exit', (code: number) => {
                this.emit('exit', code);
                this.process = null;
            });

            proc.on('error', (err: Error) => {
                this.emit('error', err);
            });

        } catch (err) {
            this.emit('error', err);
        }
    }

    private startPty(exe: string, args: string[], cwd: string, env: NodeJS.ProcessEnv) {
        try {
            this.process = this.ptyModule!.spawn(exe, args, {
                name: 'xterm-color',
                cols: 80,
                rows: 30,
                cwd: cwd,
                env: env
            });

            console.log('[GeminiProcess] PTY spawned');

            this.process.on('data', (data: string) => {
                this.handleData(data);
            });

            this.process.on('exit', (code: number) => {
                this.emit('exit', code);
                this.process = null;
            });

        } catch (err) {
            this.emit('error', err);
        }
    }

    private handleData(chunk: string) {
        // PTY echoes input, we might need to filter it or just accept it.
        // The CLI output format is stream-json, so we look for valid JSON lines.

        this.buffer += chunk;

        // Split by newline
        const lines = this.buffer.split(/\r?\n/);
        this.buffer = lines.pop() || ''; // Keep last incomplete line

        lines.forEach(line => {
            const trimmed = line.trim();
            if (!trimmed) return;

            try {
                // Only parse lines that look like JSON objects
                if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
                    const json = JSON.parse(trimmed);
                    this.emit('json', json);
                } else {
                    // Non-JSON output (prompts, echoes) — ignored
                }
            } catch (e) {
                // Not a JSON line, process logic (like interactive questions) might go here
            }
        });
    }

    public send(message: string) {
        if (!this.process) {
            throw new Error('Process not started');
        }

        // Check if it's a PTY or standard child_process
        if (this.isPtyAvailable) {
            // PTY input needs newline or carriage return
            (this.process as IPtyProcess).write(message + '\r');
        } else {
            // Standard process
            (this.process as ChildProcess).stdin?.write(message + '\n');
        }
    }

    public stop() {
        if (this.process) {
            this.process.kill();
            this.process = null;
        }
    }
}
