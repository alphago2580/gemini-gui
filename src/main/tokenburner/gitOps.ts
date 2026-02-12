import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface Commit {
  hash: string;
  message: string;
  author: string;
  date: string;
}

export interface MergeResult {
  success: boolean;
  retryCount: number;
  conflictFiles?: string[];
  error?: string;
}

export interface ExecOptions {
  cwd: string;
  timeout?: number;
}

function execGit(args: string, opts: ExecOptions): string {
  return execSync(`git ${args}`, {
    cwd: opts.cwd,
    timeout: opts.timeout ?? 30000,
    encoding: 'utf-8',
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim();
}

export class GitOps {
  async init(repoDir: string): Promise<void> {
    const tbDir = path.join(repoDir, '.tokenburner');
    if (!fs.existsSync(tbDir)) {
      fs.mkdirSync(tbDir, { recursive: true });
    }
  }

  async createWorktree(repoDir: string, agentId: string, branch: string): Promise<string> {
    const worktreePath = path.join(repoDir, '.tokenburner', 'worktrees', agentId);

    if (fs.existsSync(worktreePath)) {
      // Clean up stale worktree first
      try {
        execGit(`worktree remove "${worktreePath}" --force`, { cwd: repoDir });
      } catch {
        // Ignore — may not be registered as a worktree
        fs.rmSync(worktreePath, { recursive: true, force: true });
      }
    }

    // Create new branch from HEAD and set up worktree
    try {
      execGit(`branch -D "${branch}"`, { cwd: repoDir });
    } catch {
      // Branch doesn't exist yet — that's fine
    }

    execGit(`worktree add -b "${branch}" "${worktreePath}"`, { cwd: repoDir });

    return worktreePath;
  }

  async removeWorktree(worktreePath: string): Promise<void> {
    // Find the main repo by traversing up from worktree
    // git worktree list --porcelain gives us the main repo
    try {
      const repoDir = execGit('rev-parse --git-common-dir', { cwd: worktreePath });
      const mainRepo = path.resolve(worktreePath, repoDir, '..');
      execGit(`worktree remove "${worktreePath}" --force`, { cwd: mainRepo });
    } catch {
      // Fallback: just remove the directory
      if (fs.existsSync(worktreePath)) {
        fs.rmSync(worktreePath, { recursive: true, force: true });
      }
    }
  }

  async mergeBranch(
    repoDir: string,
    sourceBranch: string,
    targetBranch: string,
    maxRetries: number = 3
  ): Promise<MergeResult> {
    let retryCount = 0;

    while (retryCount <= maxRetries) {
      try {
        // Checkout target branch
        execGit(`checkout "${targetBranch}"`, { cwd: repoDir });

        // Try fast-forward merge first
        execGit(`merge "${sourceBranch}" --ff-only`, { cwd: repoDir });

        return { success: true, retryCount };
      } catch {
        // Fast-forward failed, try rebase approach
        try {
          execGit('merge --abort', { cwd: repoDir });
        } catch {
          // No merge to abort
        }

        if (retryCount < maxRetries) {
          try {
            // Rebase source branch onto target
            execGit(`checkout "${sourceBranch}"`, { cwd: repoDir });
            execGit(`rebase "${targetBranch}"`, { cwd: repoDir });

            // Try merge again
            execGit(`checkout "${targetBranch}"`, { cwd: repoDir });
            execGit(`merge "${sourceBranch}" --ff-only`, { cwd: repoDir });

            return { success: true, retryCount: retryCount + 1 };
          } catch {
            // Rebase also failed — abort and retry
            try {
              execGit('rebase --abort', { cwd: repoDir });
            } catch {
              // No rebase to abort
            }
            try {
              execGit(`checkout "${targetBranch}"`, { cwd: repoDir });
            } catch {
              // Already on target
            }
          }
        }

        retryCount++;
      }
    }

    // Get conflict info
    let conflictFiles: string[] = [];
    try {
      const diffOutput = execGit(`diff --name-only "${targetBranch}"..."${sourceBranch}"`, { cwd: repoDir });
      conflictFiles = diffOutput.split('\n').filter(Boolean);
    } catch {
      // Ignore
    }

    return {
      success: false,
      retryCount,
      conflictFiles,
      error: `Merge failed after ${maxRetries} retries`,
    };
  }

  async getCommits(repoDir: string, branch: string, count: number = 10): Promise<Commit[]> {
    try {
      const log = execGit(
        `log "${branch}" -${count} --format=%H%n%s%n%an%n%aI%n---`,
        { cwd: repoDir }
      );

      if (!log) return [];

      const entries = log.split('---\n').filter(Boolean);
      return entries.map((entry) => {
        const lines = entry.trim().split('\n');
        return {
          hash: lines[0] || '',
          message: lines[1] || '',
          author: lines[2] || '',
          date: lines[3] || '',
        };
      });
    } catch {
      return [];
    }
  }

  async hasNewCommits(repoDir: string, branch: string, baseBranch: string): Promise<boolean> {
    try {
      const count = execGit(
        `rev-list --count "${baseBranch}".."${branch}"`,
        { cwd: repoDir }
      );
      return parseInt(count, 10) > 0;
    } catch {
      return false;
    }
  }

  async cleanup(repoDir: string, prefix: string): Promise<void> {
    try {
      const output = execGit('worktree list --porcelain', { cwd: repoDir });
      const lines = output.split('\n');

      for (const line of lines) {
        if (line.startsWith('worktree ')) {
          const wtPath = line.replace('worktree ', '');
          if (wtPath.includes(prefix)) {
            try {
              execGit(`worktree remove "${wtPath}" --force`, { cwd: repoDir });
            } catch {
              // Ignore individual removal failures
            }
          }
        }
      }
    } catch {
      // Ignore
    }

    // Also prune any stale worktree references
    try {
      execGit('worktree prune', { cwd: repoDir });
    } catch {
      // Ignore
    }
  }
}
