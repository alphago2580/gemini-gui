import type {
  HarnessEventType,
  HarnessEvent,
  HarnessConfig,
  TaskLike,
  AgentLike,
  QueueLike,
  GitOpsLike,
  TestGateLike,
} from './types';

export type {
  HarnessEventType,
  HarnessEvent,
  HarnessConfig,
  TaskLike,
  AgentLike,
  QueueLike,
  GitOpsLike,
  TestGateLike,
};

const DEFAULT_CONFIG: HarnessConfig = {
  maxRetries: 3,
  idleBackoffMs: 1000,
  maxIdleBackoffMs: 30000,
  mergeRetries: 3,
};

function makeEvent(type: HarnessEventType, extra?: Partial<HarnessEvent>): HarnessEvent {
  return { type, timestamp: Date.now(), ...extra };
}

export async function runHarnessLoop(
  agent: AgentLike,
  queue: QueueLike,
  gitOps: GitOpsLike,
  testGate: TestGateLike,
  config: Partial<HarnessConfig> = {},
  onEvent?: (event: HarnessEvent) => void,
  signal?: { stopped: boolean },
): Promise<void> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const emit = (event: HarnessEvent) => onEvent?.(event);

  let idleBackoff = cfg.idleBackoffMs;

  while (!signal?.stopped) {
    // 1. Try to claim a task
    const task = await queue.claim('agent');
    if (!task) {
      emit(makeEvent('idle', { message: `No tasks, backing off ${idleBackoff}ms` }));
      await sleep(idleBackoff);
      idleBackoff = Math.min(idleBackoff * 2, cfg.maxIdleBackoffMs);
      continue;
    }

    // Reset backoff on task found
    idleBackoff = cfg.idleBackoffMs;

    emit(makeEvent('claim', { taskId: task.id, message: task.title }));

    const branchName = `tokenburner/${task.id}`;
    let worktreePath: string;

    try {
      worktreePath = await gitOps.createWorktree('.', 'agent', branchName);
    } catch (err) {
      emit(makeEvent('error', { taskId: task.id, message: `Failed to create worktree: ${err}` }));
      await queue.fail(task.id, `Worktree creation failed: ${err}`);
      continue;
    }

    let taskCompleted = false;
    let retryCount = 0;

    try {
      // 2. Run agent on the task
      emit(makeEvent('agent-start', { taskId: task.id }));

      await runAgent(agent, task, worktreePath, task.description);

      emit(makeEvent('agent-complete', { taskId: task.id }));

      // 3. Test loop with retries
      while (retryCount <= cfg.maxRetries) {
        const testResult = await testGate.runTests(worktreePath, 'npm test');
        emit(makeEvent('test-result', {
          taskId: task.id,
          success: testResult.success,
          retryCount,
        }));

        if (testResult.success) {
          // 4. Check if there are commits to merge
          const hasCommits = await gitOps.hasNewCommits('.', branchName, 'master');
          if (hasCommits) {
            const mergeResult = await gitOps.mergeBranch('.', branchName, 'master', cfg.mergeRetries);
            emit(makeEvent('merge', {
              taskId: task.id,
              success: mergeResult.success,
              retryCount: mergeResult.retryCount,
            }));

            if (mergeResult.success) {
              await queue.complete(task.id);
              emit(makeEvent('complete', { taskId: task.id }));
              taskCompleted = true;
            } else {
              await queue.fail(task.id, `Merge failed after ${mergeResult.retryCount} retries`);
              emit(makeEvent('fail', {
                taskId: task.id,
                message: `Merge failed: conflicts in ${mergeResult.conflictFiles?.join(', ')}`,
              }));
              taskCompleted = true; // Mark as handled (failed)
            }
          } else {
            await queue.complete(task.id);
            emit(makeEvent('complete', { taskId: task.id }));
            taskCompleted = true;
          }
          break;
        }

        retryCount++;
        if (retryCount <= cfg.maxRetries) {
          emit(makeEvent('retry', { taskId: task.id, retryCount, message: 'Tests failed, retrying' }));
          // Re-run agent to fix test failures
          await runAgent(agent, task, worktreePath, `Tests failed. Fix the failures:\n${testResult.rawOutput}`);
        }
      }

      // If all retries exhausted
      if (!taskCompleted) {
        await queue.fail(task.id, `Tests failed after ${cfg.maxRetries} retries`);
        emit(makeEvent('fail', { taskId: task.id, message: `Max retries (${cfg.maxRetries}) exceeded` }));
      }
    } catch (err) {
      if (!taskCompleted) {
        await queue.fail(task.id, `Error: ${err}`);
        emit(makeEvent('error', { taskId: task.id, message: `${err}` }));
      }
    } finally {
      // Cleanup worktree
      try {
        await gitOps.removeWorktree(worktreePath!);
      } catch {
        // Best effort cleanup
      }
    }
  }
}

function runAgent(agent: AgentLike, task: TaskLike, worktreePath: string, prompt: string): Promise<void> {
  return new Promise((resolve, reject) => {
    agent.removeAllListeners('complete');
    agent.removeAllListeners('error');
    agent.removeAllListeners('timeout');

    agent.on('complete', () => resolve());
    agent.on('error', (err: unknown) => reject(err));
    agent.on('timeout', () => reject(new Error('Agent timed out')));

    agent.start(task, worktreePath, prompt).catch(reject);
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
