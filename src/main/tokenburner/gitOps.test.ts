import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GitOps, MergeResult, Commit } from './gitOps';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

function git(args: string, cwd: string): string {
  return execSync(`git ${args}`, { cwd, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
}

function initRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gitops-test-'));
  git('init', dir);
  git('config user.email "test@test.com"', dir);
  git('config user.name "Test"', dir);
  // Create initial commit so we have a valid HEAD
  fs.writeFileSync(path.join(dir, 'README.md'), '# test\n');
  git('add .', dir);
  git('commit -m "init"', dir);
  return dir;
}

describe('GitOps', () => {
  let gitOps: GitOps;
  let repoDir: string;

  beforeEach(() => {
    repoDir = initRepo();
    gitOps = new GitOps();
  });

  afterEach(() => {
    // Clean up worktrees before removing repo
    try {
      git('worktree prune', repoDir);
    } catch { /* ignore */ }
    fs.rmSync(repoDir, { recursive: true, force: true });
  });

  describe('init', () => {
    it('should create .tokenburner directory', async () => {
      await gitOps.init(repoDir);
      expect(fs.existsSync(path.join(repoDir, '.tokenburner'))).toBe(true);
    });

    it('should be idempotent', async () => {
      await gitOps.init(repoDir);
      await gitOps.init(repoDir);
      expect(fs.existsSync(path.join(repoDir, '.tokenburner'))).toBe(true);
    });
  });

  describe('createWorktree', () => {
    it('should create worktree at expected path', async () => {
      await gitOps.init(repoDir);
      const worktreePath = await gitOps.createWorktree(repoDir, 'agent-1', 'feature/test');
      expect(fs.existsSync(worktreePath)).toBe(true);
      // Worktree should contain the repo files
      expect(fs.existsSync(path.join(worktreePath, 'README.md'))).toBe(true);
    });

    it('should create feature branch', async () => {
      await gitOps.init(repoDir);
      await gitOps.createWorktree(repoDir, 'agent-1', 'feature/test');
      const branches = git('branch', repoDir);
      expect(branches).toContain('feature/test');
    });

    it('should place worktree under .tokenburner/worktrees', async () => {
      await gitOps.init(repoDir);
      const worktreePath = await gitOps.createWorktree(repoDir, 'agent-1', 'feature/test');
      expect(worktreePath).toContain('.tokenburner');
      expect(worktreePath).toContain('agent-1');
    });
  });

  describe('removeWorktree', () => {
    it('should remove worktree directory', async () => {
      await gitOps.init(repoDir);
      const wt = await gitOps.createWorktree(repoDir, 'agent-1', 'feature/remove-test');
      expect(fs.existsSync(wt)).toBe(true);
      await gitOps.removeWorktree(wt);
      expect(fs.existsSync(wt)).toBe(false);
    });

    it('should handle already-removed worktree gracefully', async () => {
      await gitOps.init(repoDir);
      const wt = await gitOps.createWorktree(repoDir, 'agent-1', 'feature/double-remove');
      await gitOps.removeWorktree(wt);
      // Should not throw
      await gitOps.removeWorktree(wt);
    });
  });

  describe('mergeBranch', () => {
    it('should fast-forward merge when possible', async () => {
      // Create branch with a commit
      git('checkout -b feature/ff-test', repoDir);
      fs.writeFileSync(path.join(repoDir, 'new-file.txt'), 'hello\n');
      git('add .', repoDir);
      git('commit -m "add new file"', repoDir);
      git('checkout master', repoDir);

      const result = await gitOps.mergeBranch(repoDir, 'feature/ff-test', 'master');
      expect(result.success).toBe(true);
      expect(result.retryCount).toBe(0);
      // Verify the file exists on master now
      expect(fs.existsSync(path.join(repoDir, 'new-file.txt'))).toBe(true);
    });

    it('should handle merge conflicts with rebase retry', async () => {
      // Create diverged branches
      git('checkout -b feature/conflict-test', repoDir);
      fs.writeFileSync(path.join(repoDir, 'conflict.txt'), 'branch version\n');
      git('add .', repoDir);
      git('commit -m "branch change"', repoDir);

      git('checkout master', repoDir);
      fs.writeFileSync(path.join(repoDir, 'other-file.txt'), 'master version\n');
      git('add .', repoDir);
      git('commit -m "master change"', repoDir);

      // This merge isn't a ff but should succeed via rebase
      const result = await gitOps.mergeBranch(repoDir, 'feature/conflict-test', 'master', 3);
      expect(result.success).toBe(true);
      expect(result.retryCount).toBeGreaterThan(0);
    });

    it('should return failure after max retries', async () => {
      // Create actual conflicting content on same file
      fs.writeFileSync(path.join(repoDir, 'conflict.txt'), 'original\n');
      git('add .', repoDir);
      git('commit -m "add conflict file"', repoDir);

      git('checkout -b feature/bad', repoDir);
      fs.writeFileSync(path.join(repoDir, 'conflict.txt'), 'branch version\n');
      git('add .', repoDir);
      git('commit -m "branch conflict"', repoDir);

      git('checkout master', repoDir);
      fs.writeFileSync(path.join(repoDir, 'conflict.txt'), 'master version\n');
      git('add .', repoDir);
      git('commit -m "master conflict"', repoDir);

      const result = await gitOps.mergeBranch(repoDir, 'feature/bad', 'master', 1);
      expect(result.success).toBe(false);
      expect(result.conflictFiles).toBeDefined();
    });
  });

  describe('getCommits', () => {
    it('should return recent commits', async () => {
      // The init commit already exists
      const commits = await gitOps.getCommits(repoDir, 'master', 5);
      expect(commits.length).toBeGreaterThan(0);
      expect(commits[0]).toHaveProperty('hash');
      expect(commits[0]).toHaveProperty('message');
      expect(commits[0]).toHaveProperty('author');
      expect(commits[0]).toHaveProperty('date');
    });

    it('should respect count limit', async () => {
      // Add more commits
      for (let i = 0; i < 5; i++) {
        fs.writeFileSync(path.join(repoDir, `file${i}.txt`), `content ${i}\n`);
        git('add .', repoDir);
        git(`commit -m "commit ${i}"`, repoDir);
      }

      const commits = await gitOps.getCommits(repoDir, 'master', 3);
      expect(commits.length).toBe(3);
    });

    it('should return empty array for invalid branch', async () => {
      const commits = await gitOps.getCommits(repoDir, 'nonexistent-branch', 5);
      expect(commits).toEqual([]);
    });
  });

  describe('hasNewCommits', () => {
    it('should return true when branch is ahead', async () => {
      git('checkout -b feature/ahead', repoDir);
      fs.writeFileSync(path.join(repoDir, 'ahead.txt'), 'ahead\n');
      git('add .', repoDir);
      git('commit -m "ahead commit"', repoDir);
      git('checkout master', repoDir);

      const ahead = await gitOps.hasNewCommits(repoDir, 'feature/ahead', 'master');
      expect(ahead).toBe(true);
    });

    it('should return false when branch equals main', async () => {
      const ahead = await gitOps.hasNewCommits(repoDir, 'master', 'master');
      expect(ahead).toBe(false);
    });

    it('should return false for invalid branches', async () => {
      const ahead = await gitOps.hasNewCommits(repoDir, 'nonexistent', 'master');
      expect(ahead).toBe(false);
    });
  });

  describe('cleanup', () => {
    it('should remove stale worktrees', async () => {
      await gitOps.init(repoDir);
      const wt = await gitOps.createWorktree(repoDir, 'agent-1', 'feature/old');
      expect(fs.existsSync(wt)).toBe(true);

      await gitOps.cleanup(repoDir, 'tokenburner');
      // Worktree should be removed
      expect(fs.existsSync(wt)).toBe(false);
    });

    it('should not affect worktrees outside prefix', async () => {
      await gitOps.init(repoDir);
      // Create a worktree outside the prefix
      const outsidePath = path.join(repoDir, 'outside-wt');
      git(`worktree add -b feature/outside "${outsidePath}"`, repoDir);
      expect(fs.existsSync(outsidePath)).toBe(true);

      await gitOps.cleanup(repoDir, 'tokenburner');
      // The outside worktree should still exist
      expect(fs.existsSync(outsidePath)).toBe(true);

      // Clean up
      git(`worktree remove "${outsidePath}" --force`, repoDir);
    });
  });
});
