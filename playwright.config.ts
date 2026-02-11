import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  retries: 1,
  workers: 1, // Electron only allows one instance
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'test-results/html-report' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'retain-on-failure',
  },
  outputDir: 'test-results/',
});
