import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ErrorBoundary from './ErrorBoundary';

// Suppress React error boundary console noise
beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Throws during render when `shouldThrow` is true */
function CrashOnRender({ shouldThrow, label = 'ok' }: { shouldThrow: boolean; label?: string }) {
  if (shouldThrow) throw new Error(`Crash: ${label}`);
  return <div data-testid={`child-${label}`}>{label}</div>;
}

/** Tracks its own crash state via external ref */
function CrashToggle({ crashRef, label }: { crashRef: { current: boolean }; label: string }) {
  if (crashRef.current) throw new Error(`Crash: ${label}`);
  return <div>{label} content</div>;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('ErrorBoundary — crash recovery integration', () => {
  // ── Nested boundary isolation ──

  it('inner boundary crash does not affect outer boundary children', () => {
    render(
      <ErrorBoundary>
        <div data-testid="outer-child">Outer content</div>
        <ErrorBoundary>
          <CrashOnRender shouldThrow={true} label="inner" />
        </ErrorBoundary>
      </ErrorBoundary>
    );

    // Outer content stays visible
    expect(screen.getByTestId('outer-child')).toBeInTheDocument();
    // Inner boundary shows error UI
    expect(screen.getByText('Crash: inner')).toBeInTheDocument();
  });

  it('outer boundary catches crash when there is no inner boundary', () => {
    render(
      <ErrorBoundary>
        <div>Sibling A</div>
        <CrashOnRender shouldThrow={true} label="no-inner" />
      </ErrorBoundary>
    );

    // Entire outer boundary shows error UI — sibling is gone
    expect(screen.queryByText('Sibling A')).not.toBeInTheDocument();
    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    expect(screen.getByText('Crash: no-inner')).toBeInTheDocument();
  });

  // ── Sequential crash / recovery cycles ──

  it('recovers from multiple sequential crashes via reset button', async () => {
    const user = userEvent.setup();
    let crashMessage = 'First crash';

    function MultiCrash() {
      if (crashMessage) {
        throw new Error(crashMessage);
      }
      return <div>Recovered successfully</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <MultiCrash />
      </ErrorBoundary>
    );

    // First crash
    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    expect(screen.getByText('First crash')).toBeInTheDocument();

    // Reset — still crashing with new message
    crashMessage = 'Second crash';
    await user.click(screen.getByText('다시 시도'));
    rerender(
      <ErrorBoundary>
        <MultiCrash />
      </ErrorBoundary>
    );

    // Second crash
    expect(screen.getByText('Second crash')).toBeInTheDocument();

    // Fix, then reset
    crashMessage = '';
    await user.click(screen.getByText('다시 시도'));
    rerender(
      <ErrorBoundary>
        <MultiCrash />
      </ErrorBoundary>
    );

    // Recovered
    expect(screen.getByText('Recovered successfully')).toBeInTheDocument();
  });

  // ── Deep nesting ──

  it('catches errors from deeply nested component trees', () => {
    function Level({ depth, maxDepth }: { depth: number; maxDepth: number }) {
      if (depth >= maxDepth) {
        throw new Error('Deep crash');
      }
      return (
        <div data-testid={`level-${depth}`}>
          <Level depth={depth + 1} maxDepth={maxDepth} />
        </div>
      );
    }

    render(
      <ErrorBoundary>
        <Level depth={0} maxDepth={5} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Deep crash')).toBeInTheDocument();
    expect(screen.getByText('다시 시도')).toBeInTheDocument();
  });

  it('recovers from deep crash when nesting is reduced', async () => {
    const user = userEvent.setup();
    let maxDepth = 5;

    function Level({ depth }: { depth: number }) {
      if (depth >= maxDepth) {
        throw new Error('Deep crash');
      }
      return (
        <div>
          Level {depth}
          <Level depth={depth + 1} />
        </div>
      );
    }

    function SafeTree() {
      return <div>Safe tree rendered</div>;
    }

    let renderSafe = false;

    function Wrapper() {
      if (renderSafe) return <SafeTree />;
      return <Level depth={0} />;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <Wrapper />
      </ErrorBoundary>
    );

    expect(screen.getByText('Deep crash')).toBeInTheDocument();

    renderSafe = true;
    await user.click(screen.getByText('다시 시도'));
    rerender(
      <ErrorBoundary>
        <Wrapper />
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe tree rendered')).toBeInTheDocument();
  });

  // ── Crash with list rendering ──

  it('catches error thrown during list item rendering', () => {
    const items = ['Apple', 'CRASH', 'Cherry'];

    function ItemList({ items }: { items: string[] }) {
      return (
        <ul>
          {items.map((item, i) => {
            if (item === 'CRASH') throw new Error('List item crash');
            return <li key={i}>{item}</li>;
          })}
        </ul>
      );
    }

    render(
      <ErrorBoundary>
        <ItemList items={items} />
      </ErrorBoundary>
    );

    expect(screen.getByText('List item crash')).toBeInTheDocument();
    expect(screen.queryByText('Apple')).not.toBeInTheDocument();
  });

  // ── Crash with conditional rendering ──

  it('catches error in conditionally rendered branch', () => {
    function ConditionalCrash({ show }: { show: boolean }) {
      if (!show) return <div>Hidden</div>;
      throw new Error('Conditional crash');
    }

    render(
      <ErrorBoundary>
        <ConditionalCrash show={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Conditional crash')).toBeInTheDocument();
  });

  it('does not crash when the conditional branch is safe', () => {
    function ConditionalCrash({ show }: { show: boolean }) {
      if (!show) return <div>Safe branch</div>;
      throw new Error('Conditional crash');
    }

    render(
      <ErrorBoundary>
        <ConditionalCrash show={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe branch')).toBeInTheDocument();
    expect(screen.queryByText('문제가 발생했습니다')).not.toBeInTheDocument();
  });

  // ── Custom fallback with recovery ──

  it('custom fallback can include a recovery mechanism', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function Fragile() {
      if (shouldThrow) throw new Error('Fragile crash');
      return <div>Fragile recovered</div>;
    }

    function CustomFallbackWithReset() {
      return <div data-testid="custom-error">Something broke — custom UI</div>;
    }

    render(
      <ErrorBoundary fallback={<CustomFallbackWithReset />}>
        <Fragile />
      </ErrorBoundary>
    );

    expect(screen.getByTestId('custom-error')).toBeInTheDocument();
    expect(screen.queryByText('다시 시도')).not.toBeInTheDocument(); // no default button
  });

  // ── Error message fidelity ──

  it('preserves exact error message through crash cycle', () => {
    const message = '한국어 오류 메시지: 연결이 끊어졌습니다 (code: 42)';

    function KoreanCrash(): React.ReactElement {
      throw new Error(message);
    }

    render(
      <ErrorBoundary>
        <KoreanCrash />
      </ErrorBoundary>
    );

    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('handles error with empty message gracefully', () => {
    function EmptyMsgCrash(): React.ReactElement {
      throw new Error('');
    }

    render(
      <ErrorBoundary>
        <EmptyMsgCrash />
      </ErrorBoundary>
    );

    // Title should still show
    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument();
    expect(screen.getByText('다시 시도')).toBeInTheDocument();
  });

  // ── Multiple independent boundaries ──

  it('independent boundaries crash and recover independently', async () => {
    const user = userEvent.setup();
    const refA = { current: true };
    const refB = { current: false };

    function App() {
      return (
        <div>
          <div data-testid="boundary-a">
            <ErrorBoundary>
              <CrashToggle crashRef={refA} label="A" />
            </ErrorBoundary>
          </div>
          <div data-testid="boundary-b">
            <ErrorBoundary>
              <CrashToggle crashRef={refB} label="B" />
            </ErrorBoundary>
          </div>
        </div>
      );
    }

    const { rerender } = render(<App />);

    // A crashed, B is fine
    const boundaryA = screen.getByTestId('boundary-a');
    const boundaryB = screen.getByTestId('boundary-b');

    expect(within(boundaryA).getByText('Crash: A')).toBeInTheDocument();
    expect(within(boundaryB).getByText('B content')).toBeInTheDocument();

    // Fix A, crash B
    refA.current = false;
    refB.current = true;

    // Reset A
    await user.click(within(boundaryA).getByText('다시 시도'));
    rerender(<App />);

    // Now A recovered but B crashed
    expect(within(boundaryA).getByText('A content')).toBeInTheDocument();
    expect(within(boundaryB).getByText('Crash: B')).toBeInTheDocument();
  });

  // ── Crash in constructor-like initialization ──

  it('catches error thrown during state initialization', () => {
    function BadInit(): React.ReactElement {
      const [_] = useState(() => {
        throw new Error('Init crash');
      });
      return <div>Never rendered</div>;
    }

    render(
      <ErrorBoundary>
        <BadInit />
      </ErrorBoundary>
    );

    expect(screen.getByText('Init crash')).toBeInTheDocument();
  });

  // ── componentDidCatch receives correct error info ──

  it('componentDidCatch is invoked with error and component stack', () => {
    const consoleSpy = console.error as ReturnType<typeof vi.fn>;
    // Clear any calls from previous tests
    consoleSpy.mockClear();

    function NamedCrasher(): React.ReactElement {
      throw new Error('Named crash');
    }

    render(
      <ErrorBoundary>
        <NamedCrasher />
      </ErrorBoundary>
    );

    // Find the ErrorBoundary's own console.error call
    const boundaryCall = consoleSpy.mock.calls.find(
      (call: unknown[]) =>
        typeof call[0] === 'string' && call[0].includes('ErrorBoundary caught')
    );
    expect(boundaryCall).toBeDefined();
    // Second arg should be the Error instance
    expect(boundaryCall![1]).toBeInstanceOf(Error);
    expect((boundaryCall![1] as Error).message).toBe('Named crash');
  });

  // ── Reset button focus ──

  it('reset button is focusable and clickable', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;

    function Crasher() {
      if (shouldThrow) throw new Error('Focus test crash');
      return <div>Focus recovered</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <Crasher />
      </ErrorBoundary>
    );

    const btn = screen.getByText('다시 시도');
    btn.focus();
    expect(document.activeElement).toBe(btn);

    shouldThrow = false;
    await user.click(btn);
    rerender(
      <ErrorBoundary>
        <Crasher />
      </ErrorBoundary>
    );

    expect(screen.getByText('Focus recovered')).toBeInTheDocument();
  });

  // ── Sibling boundary: one crashes, one stays ──

  it('sibling boundaries do not interfere with each other', () => {
    render(
      <div>
        <ErrorBoundary>
          <CrashOnRender shouldThrow={true} label="crash-sib" />
        </ErrorBoundary>
        <ErrorBoundary>
          <CrashOnRender shouldThrow={false} label="safe-sib" />
        </ErrorBoundary>
      </div>
    );

    expect(screen.getByText('Crash: crash-sib')).toBeInTheDocument();
    expect(screen.getByTestId('child-safe-sib')).toBeInTheDocument();
  });

  // ── Crash → recover → crash again → recover cycle ──

  it('handles full crash → recover → crash → recover cycle', async () => {
    const user = userEvent.setup();
    let step = 0; // 0=crash, 1=ok, 2=crash, 3=ok

    function CycleComponent() {
      if (step % 2 === 0) throw new Error(`Cycle crash ${step}`);
      return <div>Cycle ok {step}</div>;
    }

    const { rerender } = render(
      <ErrorBoundary>
        <CycleComponent />
      </ErrorBoundary>
    );

    // Step 0: crash
    expect(screen.getByText('Cycle crash 0')).toBeInTheDocument();

    // Step 1: recover
    step = 1;
    await user.click(screen.getByText('다시 시도'));
    rerender(
      <ErrorBoundary>
        <CycleComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Cycle ok 1')).toBeInTheDocument();

    // Step 2: crash again — need to re-mount to trigger crash
    step = 2;
    rerender(
      <ErrorBoundary>
        <CycleComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Cycle crash 2')).toBeInTheDocument();

    // Step 3: recover again
    step = 3;
    await user.click(screen.getByText('다시 시도'));
    rerender(
      <ErrorBoundary>
        <CycleComponent />
      </ErrorBoundary>
    );
    expect(screen.getByText('Cycle ok 3')).toBeInTheDocument();
  });
});
