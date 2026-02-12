import { EventEmitter } from 'events';
import { spawn, ChildProcess } from 'child_process';

export type AgentStatus = 'idle' | 'working' | 'stopped';

export interface AgentConfig {
  timeoutMs: number;
  cliCommand: string;
  cliArgs?: string[];
  env?: NodeJS.ProcessEnv;
}

export interface AgentTask {
  id: string;
  title: string;
  description: string;
}

export class Agent extends EventEmitter {
  public status: AgentStatus = 'idle';
  public currentTask: AgentTask | null = null;
  public startedAt: number = 0;

  private process: ChildProcess | null = null;
  private timeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly id: string;
  private readonly model: string;
  private readonly config: AgentConfig;

  constructor(id: string, model: string, config: AgentConfig) {
    super();
    this.id = id;
    this.model = model;
    this.config = config;
  }

  getId(): string {
    return this.id;
  }

  getModel(): string {
    return this.model;
  }

  isRunning(): boolean {
    return this.process !== null && this.status === 'working';
  }

  elapsed(): number {
    if (this.startedAt === 0) return 0;
    return (Date.now() - this.startedAt) / 1000;
  }

  async start(task: AgentTask, worktreePath: string, prompt: string): Promise<void> {
    if (this.process) {
      throw new Error('Agent is already running');
    }

    this.currentTask = task;
    this.status = 'working';
    this.startedAt = Date.now();

    const args = [...(this.config.cliArgs || []), '--worktree', worktreePath, '--prompt', prompt];

    try {
      this.process = spawn(this.config.cliCommand, args, {
        cwd: worktreePath,
        env: this.config.env || process.env,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      this.process.stdout?.setEncoding('utf8');
      this.process.stdout?.on('data', (data: string) => {
        this.emit('output', data);
      });

      this.process.stderr?.setEncoding('utf8');
      this.process.stderr?.on('data', (data: string) => {
        this.emit('output', data);
      });

      this.process.on('exit', (code: number | null) => {
        this.clearTimeout();
        this.process = null;
        this.status = 'idle';
        this.emit('complete', { code, task, elapsed: this.elapsed() });
      });

      this.process.on('error', (err: Error) => {
        this.clearTimeout();
        this.process = null;
        this.status = 'idle';
        this.emit('error', err);
      });

      // Set timeout if configured
      if (this.config.timeoutMs > 0) {
        this.timeoutTimer = setTimeout(() => {
          if (this.isRunning()) {
            this.emit('timeout', { task, elapsed: this.elapsed() });
            this.killProcess();
          }
        }, this.config.timeoutMs);
      }
    } catch (err) {
      this.status = 'idle';
      this.process = null;
      throw err;
    }
  }

  async stop(): Promise<void> {
    this.clearTimeout();
    this.killProcess();
    this.status = 'idle';
    this.currentTask = null;
  }

  private killProcess(): void {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
  }

  private clearTimeout(): void {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer);
      this.timeoutTimer = null;
    }
  }
}
