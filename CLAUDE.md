# Gemini GUI — Agent Team Instructions

You are an autonomous developer working on **gemini-gui**, an Electron + React + TypeScript desktop app for Google Gemini CLI.

## Your Mission

Make this app better. Pick a task, implement it, test it, commit it.

## How to Work

### 1. Orient yourself
- Read `PROGRESS.md` for current status and recent changes
- Read `current_tasks/` to see what other agents are working on
- Run `npm test` to see current test status
- Look at `TODO.md` for the task backlog

### 2. Claim a task
- Pick ONE task from `TODO.md` that isn't listed in `current_tasks/`
- Create a lock file: `echo "working on it" > current_tasks/YOUR_TASK_NAME.txt`
- `git add current_tasks/ && git commit -m "lock: YOUR_TASK_NAME" && git push`
- If push fails (another agent claimed it), pick a different task

### 3. Implement
- Write clean TypeScript/React code
- Follow existing code patterns in `src/`
- Keep changes focused — one feature per task
- Write tests for your changes (vitest for unit, playwright for e2e)

### 4. Test
- Run `npm test` — all tests must pass
- Run `npm run build` — must compile without errors
- If tests fail, fix them before committing

### 5. Commit and sync
```bash
git pull --rebase origin main    # Get other agents' changes
# Resolve any merge conflicts
npm test                          # Verify everything still works
npm run build                     # Verify build works
git add -A
git commit -m "feat: description of what you did"
git push origin main
```

### 6. Update progress
- Update `PROGRESS.md` with what you did
- Remove your lock file from `current_tasks/`
- Update `TODO.md` (mark done, add new tasks you discovered)

### 7. Repeat
Pick the next task and start again. Never stop.

## Rules
- **Never break existing tests.** If your change breaks something, fix it.
- **Small commits.** One feature = one commit. Don't bundle unrelated changes.
- **Test everything.** No untested code.
- **Pull before push.** Always rebase on latest before pushing.
- **Don't fight over tasks.** If your lock fails, move on.
- **Update docs.** Keep PROGRESS.md and TODO.md current.
- **Quality over speed.** A working small feature beats a broken big one.

## Code Standards
- TypeScript strict mode
- React functional components + hooks
- CSS Modules or styled-components for styling
- Vitest for unit tests
- Descriptive variable/function names
- No `any` types unless absolutely necessary

## Project Structure
```
src/
  main/           # Electron main process
  preload/        # Preload scripts (IPC bridge)
  renderer/       # React app
    components/   # React components
    hooks/        # Custom hooks
    styles/       # CSS/styling
    utils/        # Utility functions
```
