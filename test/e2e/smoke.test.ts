import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test.describe('E2E Smoke Test', () => {
    let electronApp;

    test.beforeAll(async () => {
        // Launch Electron app
        // Point to the built main process
        // Set GEMINI_CLI_PATH to the mock script
        const electronPath = require('electron');
        electronApp = await electron.launch({
            executablePath: electronPath,
            args: [path.join(__dirname, '../../dist/main/index.js')],
            env: {
                ...process.env,
                GEMINI_CLI_PATH: path.join(__dirname, '../../test/mocks/gemini-mock.js'),
                NODE_ENV: 'production', // Avoid dev tools opening
            },
        });
    });

    test.afterAll(async () => {
        if (electronApp) {
            await electronApp.close();
        }
    });

    test('App launches and responds to hello', async () => {
        const window = await electronApp.firstWindow();

        // Check title or initial content
        // Note: title might be document title "Gemini GUI"
        // Wait for welcome message
        await window.waitForSelector('text=Gemini에 오신 것을 환영합니다!');

        // Type in the input area
        await window.fill('textarea.input-field', 'Hello from E2E');

        // Click send
        await window.click('button.send-button');

        // Expect the mock response to appear
        // The mock responds: [Mock] You said: "Hello from E2E"
        // We wait for part of it
        await window.waitForSelector('text=[Mock] You said:');

        const content = await window.textContent('.message.assistant .message-content');
        expect(content).toContain('[Mock] You said: "Hello from E2E"');
    });
});
