import { exec } from 'child_process';

export interface FailedTest {
  name: string;
  error: string;
}

export interface TestResult {
  success: boolean;
  totalTests: number;
  passed: number;
  failed: number;
  failedTests: FailedTest[];
  rawOutput: string;
}

export interface TypeCheckError {
  file: string;
  message: string;
}

export interface TypeCheckResult {
  success: boolean;
  errorCount: number;
  errors: TypeCheckError[];
}

type ExecFn = typeof exec;

export class TestGate {
  private execFn: ExecFn;

  constructor(execFn?: ExecFn) {
    this.execFn = execFn || exec;
  }

  runTests(cwd: string, command: string, timeoutSeconds: number = 120): Promise<TestResult> {
    return new Promise((resolve) => {
      const timeoutMs = timeoutSeconds * 1000;

      this.execFn(command, { cwd, timeout: timeoutMs }, (error, stdout, stderr) => {
        const rawOutput = (stdout || '') + (stderr || '');

        if (error && 'killed' in error && error.killed) {
          resolve({
            success: false,
            totalTests: 0,
            passed: 0,
            failed: 0,
            failedTests: [],
            rawOutput: `timeout: test command exceeded ${timeoutSeconds}s`,
          });
          return;
        }

        const parsed = this.parseVitestJson(rawOutput);
        resolve(parsed);
      });
    });
  }

  runScopedTests(cwd: string, command: string, changedFiles: string[], timeoutSeconds: number = 120): Promise<TestResult> {
    const testPatterns = changedFiles
      .map((f) => this.sourceToTestPattern(f))
      .filter(Boolean);

    if (testPatterns.length === 0) {
      return Promise.resolve({
        success: true,
        totalTests: 0,
        passed: 0,
        failed: 0,
        failedTests: [],
        rawOutput: 'No matching test files for changed sources',
      });
    }

    const scopedCommand = `${command} ${testPatterns.join(' ')}`;
    return this.runTests(cwd, scopedCommand, timeoutSeconds);
  }

  runTypeCheck(cwd: string, tscCommand: string = 'npx tsc --noEmit'): Promise<TypeCheckResult> {
    return new Promise((resolve) => {
      this.execFn(tscCommand, { cwd, timeout: 60_000 }, (error, stdout, stderr) => {
        const rawOutput = (stdout || '') + (stderr || '');

        if (!error) {
          resolve({ success: true, errorCount: 0, errors: [] });
          return;
        }

        const errors = this.parseTscErrors(rawOutput);
        resolve({
          success: false,
          errorCount: errors.length,
          errors,
        });
      });
    });
  }

  private parseVitestJson(rawOutput: string): TestResult {
    // Try to find JSON in the output (vitest --reporter=json outputs JSON)
    const jsonMatch = rawOutput.match(/\{[\s\S]*"testResults"[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[0]);
        return this.extractFromVitestJson(data, rawOutput);
      } catch {
        // Fall through to line-based parsing
      }
    }

    // Fallback: parse based on exit code / output patterns
    return this.parseVitestText(rawOutput);
  }

  private extractFromVitestJson(data: Record<string, unknown>, rawOutput: string): TestResult {
    const testResults = data.testResults as Array<Record<string, unknown>> | undefined;
    if (!testResults) {
      return this.parseVitestText(rawOutput);
    }

    let totalTests = 0;
    let passed = 0;
    let failed = 0;
    const failedTests: FailedTest[] = [];

    for (const suite of testResults) {
      const assertions = suite.assertionResults as Array<Record<string, unknown>> | undefined;
      if (!assertions) continue;

      for (const test of assertions) {
        totalTests++;
        if (test.status === 'passed') {
          passed++;
        } else if (test.status === 'failed') {
          failed++;
          const messages = test.failureMessages as string[] | undefined;
          failedTests.push({
            name: (test.fullName || test.title || 'unknown') as string,
            error: messages?.[0] || 'Unknown error',
          });
        }
      }
    }

    return {
      success: failed === 0 && totalTests > 0,
      totalTests,
      passed,
      failed,
      failedTests,
      rawOutput,
    };
  }

  private parseVitestText(rawOutput: string): TestResult {
    if (!rawOutput.trim()) {
      return {
        success: false,
        totalTests: 0,
        passed: 0,
        failed: 0,
        failedTests: [],
        rawOutput: rawOutput || 'No output from test command',
      };
    }

    // Look for common vitest summary patterns like "Tests  3 passed (3)"
    const passedMatch = rawOutput.match(/(\d+)\s+passed/);
    const failedMatch = rawOutput.match(/(\d+)\s+failed/);

    const passedCount = passedMatch ? parseInt(passedMatch[1], 10) : 0;
    const failedCount = failedMatch ? parseInt(failedMatch[1], 10) : 0;
    const total = passedCount + failedCount;

    // Extract failed test names if possible
    const failedTests: FailedTest[] = [];
    const failurePattern = /FAIL\s+(.+?)(?:\n|$)[\s\S]*?(?:Error|AssertionError):\s*(.+?)(?:\n|$)/g;
    let match: RegExpExecArray | null;
    while ((match = failurePattern.exec(rawOutput)) !== null) {
      failedTests.push({ name: match[1].trim(), error: match[2].trim() });
    }

    // If we found failed count but no parsed failures, add generic ones
    if (failedCount > 0 && failedTests.length === 0) {
      failedTests.push({ name: 'unknown', error: 'Test failed (see rawOutput)' });
    }

    return {
      success: failedCount === 0 && total > 0,
      totalTests: total,
      passed: passedCount,
      failed: failedCount,
      failedTests,
      rawOutput,
    };
  }

  private parseTscErrors(rawOutput: string): TypeCheckError[] {
    const errors: TypeCheckError[] = [];
    // tsc error format: "src/file.ts(10,5): error TS2304: Cannot find name 'x'."
    const errorPattern = /^(.+?)\((\d+),(\d+)\):\s*error\s+TS\d+:\s*(.+)$/gm;
    let match: RegExpExecArray | null;
    while ((match = errorPattern.exec(rawOutput)) !== null) {
      errors.push({
        file: match[1],
        message: match[4].trim(),
      });
    }

    // Also handle the format without parens: "src/file.ts:10:5 - error TS2304: ..."
    const altPattern = /^(.+?):(\d+):(\d+)\s*-\s*error\s+TS\d+:\s*(.+)$/gm;
    while ((match = altPattern.exec(rawOutput)) !== null) {
      errors.push({
        file: match[1],
        message: match[4].trim(),
      });
    }

    return errors;
  }

  private sourceToTestPattern(filePath: string): string | null {
    // Convert source files to test file patterns
    // e.g., "src/components/Button.tsx" -> "src/components/Button.test.tsx"
    const testExtensions = ['.test.ts', '.test.tsx', '.spec.ts', '.spec.tsx'];
    const ext = filePath.match(/\.(tsx?|jsx?)$/)?.[0];
    if (!ext) return null;

    const basePath = filePath.replace(/\.(tsx?|jsx?)$/, '');

    // Return glob-like pattern that vitest can filter with
    return testExtensions
      .map((testExt) => `${basePath}${testExt}`)
      .join(' ');
  }
}
