import { describe, it, expect, vi } from 'vitest';
import { TestGate, TestResult, TypeCheckResult } from './testGate';
import type { ExecException } from 'child_process';

type ExecCallback = (error: ExecException | null, stdout: string, stderr: string) => void;

function createMockExec(
  handler: (command: string, options: Record<string, unknown>, callback: ExecCallback) => void
) {
  return vi.fn(handler) as unknown as typeof import('child_process').exec;
}

function makeVitestJsonOutput(opts: { passed: number; failed?: Array<{ name: string; error: string }> }): string {
  const assertions: Array<Record<string, unknown>> = [];
  for (let i = 0; i < opts.passed; i++) {
    assertions.push({ status: 'passed', fullName: `test-${i}`, title: `test-${i}`, failureMessages: [] });
  }
  for (const f of opts.failed || []) {
    assertions.push({ status: 'failed', fullName: f.name, title: f.name, failureMessages: [f.error] });
  }
  return JSON.stringify({
    testResults: [{ assertionResults: assertions }],
  });
}

describe('TestGate', () => {
  describe('runTests', () => {
    it('should parse successful vitest JSON output', async () => {
      const jsonOutput = makeVitestJsonOutput({ passed: 5 });
      const mockExec = createMockExec((_cmd, _opts, cb) => {
        cb(null, jsonOutput, '');
      });
      const gate = new TestGate(mockExec);

      const result = await gate.runTests('/tmp/repo', 'npm test -- --reporter=json');

      expect(result.success).toBe(true);
      expect(result.totalTests).toBe(5);
      expect(result.passed).toBe(5);
      expect(result.failed).toBe(0);
      expect(result.failedTests).toHaveLength(0);
    });

    it('should parse failed test output with details', async () => {
      const jsonOutput = makeVitestJsonOutput({
        passed: 2,
        failed: [
          { name: 'Button > should render', error: 'Expected true to be false' },
          { name: 'Input > should focus', error: 'Element not found' },
        ],
      });
      const mockExec = createMockExec((_cmd, _opts, cb) => {
        const err = new Error('Command failed') as ExecException;
        err.code = 1;
        cb(err, jsonOutput, '');
      });
      const gate = new TestGate(mockExec);

      const result = await gate.runTests('/tmp/repo', 'npm test -- --reporter=json');

      expect(result.success).toBe(false);
      expect(result.totalTests).toBe(4);
      expect(result.passed).toBe(2);
      expect(result.failed).toBe(2);
      expect(result.failedTests).toHaveLength(2);
      expect(result.failedTests[0]).toHaveProperty('name', 'Button > should render');
      expect(result.failedTests[0]).toHaveProperty('error', 'Expected true to be false');
      expect(result.failedTests[1]).toHaveProperty('name', 'Input > should focus');
    });

    it('should handle timeout', async () => {
      const mockExec = createMockExec((_cmd, _opts, cb) => {
        const err = new Error('Command timed out') as ExecException & { killed: boolean };
        err.killed = true;
        cb(err, '', '');
      });
      const gate = new TestGate(mockExec);

      const result = await gate.runTests('/tmp/repo', 'sleep 999', 1);

      expect(result.success).toBe(false);
      expect(result.rawOutput).toContain('timeout');
    });

    it('should handle missing test command', async () => {
      const mockExec = createMockExec((_cmd, _opts, cb) => {
        const err = new Error('Command not found: nonexistent-command') as ExecException;
        err.code = 127;
        cb(err, '', 'nonexistent-command: command not found');
      });
      const gate = new TestGate(mockExec);

      const result = await gate.runTests('/tmp/repo', 'nonexistent-command');

      expect(result.success).toBe(false);
    });

    it('should pass cwd and timeout options to exec', async () => {
      const mockExec = createMockExec((_cmd, opts, cb) => {
        expect(opts.cwd).toBe('/my/project');
        expect(opts.timeout).toBe(30_000);
        cb(null, makeVitestJsonOutput({ passed: 1 }), '');
      });
      const gate = new TestGate(mockExec);

      await gate.runTests('/my/project', 'npm test', 30);

      expect(mockExec).toHaveBeenCalledTimes(1);
    });
  });

  describe('runScopedTests', () => {
    it('should run only tests matching changed files', async () => {
      let capturedCommand = '';
      const mockExec = createMockExec((cmd, _opts, cb) => {
        capturedCommand = cmd;
        cb(null, makeVitestJsonOutput({ passed: 1 }), '');
      });
      const gate = new TestGate(mockExec);
      const files = ['src/components/Button.tsx'];

      const result = await gate.runScopedTests('/tmp/repo', 'npx vitest run', files);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(capturedCommand).toContain('Button.test.ts');
    });

    it('should return success with zero tests when no files match', async () => {
      const mockExec = createMockExec(() => {
        throw new Error('Should not be called');
      });
      const gate = new TestGate(mockExec);

      const result = await gate.runScopedTests('/tmp/repo', 'npx vitest run', ['README.md']);

      expect(result.success).toBe(true);
      expect(result.totalTests).toBe(0);
      expect(result.rawOutput).toContain('No matching test files');
    });

    it('should handle multiple changed files', async () => {
      let capturedCommand = '';
      const mockExec = createMockExec((cmd, _opts, cb) => {
        capturedCommand = cmd;
        cb(null, makeVitestJsonOutput({ passed: 3 }), '');
      });
      const gate = new TestGate(mockExec);
      const files = ['src/components/Button.tsx', 'src/hooks/useTheme.ts'];

      const result = await gate.runScopedTests('/tmp/repo', 'npx vitest run', files);

      expect(result.success).toBe(true);
      expect(capturedCommand).toContain('Button.test.ts');
      expect(capturedCommand).toContain('useTheme.test.ts');
    });
  });

  describe('runTypeCheck', () => {
    it('should return success for clean TypeScript', async () => {
      const mockExec = createMockExec((_cmd, _opts, cb) => {
        cb(null, '', '');
      });
      const gate = new TestGate(mockExec);

      const result = await gate.runTypeCheck('/tmp/repo');

      expect(result.success).toBe(true);
      expect(result.errorCount).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for broken TypeScript', async () => {
      const tscOutput = [
        "src/App.tsx(10,5): error TS2304: Cannot find name 'foo'.",
        "src/utils/helper.ts(3,12): error TS2322: Type 'string' is not assignable to type 'number'.",
      ].join('\n');
      const mockExec = createMockExec((_cmd, _opts, cb) => {
        const err = new Error('tsc failed') as ExecException;
        err.code = 2;
        cb(err, tscOutput, '');
      });
      const gate = new TestGate(mockExec);

      const result = await gate.runTypeCheck('/tmp/repo');

      expect(result.success).toBe(false);
      expect(result.errorCount).toBe(2);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0]).toHaveProperty('file', 'src/App.tsx');
      expect(result.errors[0]).toHaveProperty('message', "Cannot find name 'foo'.");
      expect(result.errors[1]).toHaveProperty('file', 'src/utils/helper.ts');
    });

    it('should parse alternative tsc error format', async () => {
      const tscOutput = "src/index.ts:5:3 - error TS2551: Property 'naem' does not exist on type.\n";
      const mockExec = createMockExec((_cmd, _opts, cb) => {
        const err = new Error('tsc failed') as ExecException;
        err.code = 2;
        cb(err, tscOutput, '');
      });
      const gate = new TestGate(mockExec);

      const result = await gate.runTypeCheck('/tmp/repo');

      expect(result.success).toBe(false);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].file).toBe('src/index.ts');
      expect(result.errors[0].message).toContain("'naem'");
    });

    it('should use default tsc command when none provided', async () => {
      let capturedCommand = '';
      const mockExec = createMockExec((cmd, _opts, cb) => {
        capturedCommand = cmd;
        cb(null, '', '');
      });
      const gate = new TestGate(mockExec);

      await gate.runTypeCheck('/tmp/repo');

      expect(capturedCommand).toBe('npx tsc --noEmit');
    });
  });
});
