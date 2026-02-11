import { test, expect, _electron as electron, type ElectronApplication, type Page } from '@playwright/test';
import path from 'path';

test.describe('E2E Smoke Test', () => {
    let electronApp: ElectronApplication;
    let window: Page;

    test.beforeAll(async () => {
        const electronPath = require('electron') as string;
        electronApp = await electron.launch({
            executablePath: electronPath,
            args: [path.join(__dirname, '../../dist/main/index.js')],
            env: {
                ...process.env,
                GEMINI_CLI_PATH: path.join(__dirname, '../mocks/gemini-mock.js'),
                NODE_ENV: 'production',
                DISPLAY: process.env.DISPLAY || ':0',
            },
        });
        window = await electronApp.firstWindow();
        await window.waitForLoadState('domcontentloaded');
        await window.waitForTimeout(1000);
    });

    test.afterAll(async () => {
        if (electronApp) {
            await electronApp.close();
        }
    });

    test('App launches and responds to hello', async () => {
        // Wait for welcome message
        await expect(window.locator('.welcome-title')).toContainText('Gemini에 오신 것을 환영합니다');

        // Type in the input area
        await window.fill('#message-input', 'Hello from E2E');

        // Click send
        await window.click('button.send-button');

        // User message should appear
        await expect(window.locator('text=Hello from E2E')).toBeVisible({ timeout: 5000 });

        // The mock responds: [Mock] You said: "Hello from E2E"
        await expect(window.locator('text=[Mock] You said:')).toBeVisible({ timeout: 15000 });
    });
});
