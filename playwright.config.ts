import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
    testDir: './test/e2e',
    timeout: 30000,
    retries: 0,
    workers: 1, // Electron allows only one instance usually
    use: {
        trace: 'on-first-retry',
        header: false,
        content: false,
    },
    outputDir: 'test-results/',
});
