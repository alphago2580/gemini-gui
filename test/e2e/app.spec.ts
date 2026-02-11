import { test, expect, _electron as electron, type ElectronApplication, type Page } from '@playwright/test';
import path from 'path';

/**
 * Comprehensive E2E tests for Gemini GUI Electron app.
 * Tests UI components, interactions, keyboard shortcuts, and message flow.
 */

let electronApp: ElectronApplication;
let window: Page;

const MAIN_ENTRY = path.join(__dirname, '../../dist/main/index.js');
const MOCK_CLI = path.join(__dirname, '../mocks/gemini-mock.js');

test.beforeAll(async () => {
  const electronPath = require('electron') as string;
  electronApp = await electron.launch({
    executablePath: electronPath,
    args: [MAIN_ENTRY],
    env: {
      ...process.env,
      GEMINI_CLI_PATH: MOCK_CLI,
      NODE_ENV: 'production', // Avoid dev tools auto-opening
      DISPLAY: process.env.DISPLAY || ':0',
    },
  });
  window = await electronApp.firstWindow();
  // Wait for the app to fully render
  await window.waitForLoadState('domcontentloaded');
  await window.waitForTimeout(1000); // Give React time to render
});

test.afterAll(async () => {
  if (electronApp) {
    await electronApp.close();
  }
});

// ─── Test 1: App launches without crashing ───

test.describe('App Launch', () => {
  test('app launches and window is visible', async () => {
    expect(window).toBeTruthy();
    const title = await window.title();
    expect(title).toBe('Gemini GUI');
  });

  test('main window has expected dimensions', async () => {
    const windowState = await electronApp.evaluate(async ({ BrowserWindow }) => {
      const win = BrowserWindow.getAllWindows()[0];
      const bounds = win.getBounds();
      return { width: bounds.width, height: bounds.height, visible: win.isVisible() };
    });
    expect(windowState.visible).toBe(true);
    expect(windowState.width).toBeGreaterThan(400);
    expect(windowState.height).toBeGreaterThan(300);
  });
});

// ─── Test 2: Welcome screen ───

test.describe('Welcome Screen', () => {
  test('welcome title is displayed', async () => {
    const welcome = window.locator('.welcome-title');
    await expect(welcome).toBeVisible();
    await expect(welcome).toContainText('Gemini에 오신 것을 환영합니다');
  });

  test('suggestion cards are visible', async () => {
    const suggestions = window.locator('.welcome-suggestion-card');
    const count = await suggestions.count();
    expect(count).toBeGreaterThanOrEqual(4); // At least 4 suggestion cards
  });

  test('clicking a suggestion populates the input', async () => {
    const firstSuggestion = window.locator('.welcome-suggestion-card').first();
    await firstSuggestion.click();
    const input = window.locator('#message-input');
    const value = await input.inputValue();
    expect(value.length).toBeGreaterThan(0);
    // Clear it for subsequent tests
    await input.fill('');
  });
});

// ─── Test 3: Chat input field ───

test.describe('Chat Input', () => {
  test('input field is visible and enabled', async () => {
    const input = window.locator('#message-input');
    await expect(input).toBeVisible();
    await expect(input).toBeEnabled();
  });

  test('can type in the input field', async () => {
    const input = window.locator('#message-input');
    await input.fill('');
    await input.type('Hello, Gemini!');
    const value = await input.inputValue();
    expect(value).toBe('Hello, Gemini!');
    await input.fill(''); // Clean up
  });

  test('send button is disabled when input is empty', async () => {
    const input = window.locator('#message-input');
    await input.fill('');
    const sendBtn = window.locator('button.send-button');
    await expect(sendBtn).toBeDisabled();
  });

  test('send button is enabled when input has text', async () => {
    const input = window.locator('#message-input');
    await input.fill('Test message');
    const sendBtn = window.locator('button.send-button');
    await expect(sendBtn).toBeEnabled();
    await input.fill(''); // Clean up
  });
});

// ─── Test 4: Sidebar ───

test.describe('Sidebar', () => {
  test('sidebar navigation is present', async () => {
    const sidebar = window.locator('nav.sidebar');
    await expect(sidebar).toBeVisible();
  });

  test('new chat button is visible', async () => {
    const newChatBtn = window.locator('.new-chat-btn');
    await expect(newChatBtn).toBeVisible();
  });

  test('settings button is in sidebar footer', async () => {
    const settingsBtn = window.locator('.settings-btn');
    await expect(settingsBtn).toBeVisible();
  });

  test('conversations list area is present', async () => {
    const convList = window.locator('.conversations-list');
    await expect(convList).toBeVisible();
  });

  test('sidebar search input is present', async () => {
    const search = window.locator('#sidebar-search');
    await expect(search).toBeVisible();
  });
});

// ─── Test 5: Settings panel ───

test.describe('Settings Panel', () => {
  test('settings opens when clicking settings button', async () => {
    const settingsBtn = window.locator('.settings-btn');
    await settingsBtn.click();

    const settingsModal = window.locator('.settings-modal');
    await expect(settingsModal).toBeVisible();

    // Verify settings header
    const header = window.locator('.settings-header h2');
    await expect(header).toBeVisible();
  });

  test('settings has theme selector', async () => {
    const themeSelector = window.locator('.theme-selector');
    await expect(themeSelector).toBeVisible();

    // Check theme buttons
    const themeButtons = window.locator('.theme-option');
    const count = await themeButtons.count();
    expect(count).toBe(3); // light, dark, system
  });

  test('settings has system prompt input', async () => {
    const systemPrompt = window.locator('#system-prompt');
    await expect(systemPrompt).toBeVisible();
  });

  test('settings closes when clicking cancel', async () => {
    const cancelBtn = window.locator('.cancel-btn');
    await cancelBtn.click();

    const settingsModal = window.locator('.settings-modal');
    await expect(settingsModal).not.toBeVisible();
  });

  test('settings closes when clicking overlay', async () => {
    // Open settings
    const settingsBtn = window.locator('.settings-btn');
    await settingsBtn.click();
    await expect(window.locator('.settings-modal')).toBeVisible();

    // Click overlay
    const overlay = window.locator('.settings-overlay');
    await overlay.click({ position: { x: 10, y: 10 } });

    await expect(window.locator('.settings-modal')).not.toBeVisible();
  });
});

// ─── Test 6: Send message and verify chat flow ───

test.describe('Message Flow', () => {
  test('send a message and verify it appears in chat', async () => {
    const input = window.locator('#message-input');
    await input.fill('Hello from E2E test');

    const sendBtn = window.locator('button.send-button');
    await sendBtn.click();

    // Wait for user message to appear in the chat
    // The message log has role="log"
    const messageLog = window.locator('[role="log"]');
    await expect(messageLog).toBeVisible();

    // User message should appear
    await expect(window.locator('text=Hello from E2E test')).toBeVisible({ timeout: 5000 });
  });

  test('mock CLI response appears', async () => {
    // Wait for the mock response
    // The mock CLI responds with: [Mock] You said: "Hello from E2E test"
    await expect(window.locator('text=[Mock] You said:')).toBeVisible({ timeout: 15000 });
  });

  test('header actions appear after messages exist', async () => {
    // After messages are sent, header actions should be visible
    const headerActions = window.locator('.header-actions');
    await expect(headerActions).toBeVisible();

    // Clear button
    const clearBtn = window.locator('.header-action-btn').first();
    await expect(clearBtn).toBeVisible();
  });

  test('regenerate button appears after assistant response', async () => {
    const regenBtn = window.locator('.regenerate-btn');
    await expect(regenBtn).toBeVisible();
  });
});

// ─── Test 7: Tab bar ───

test.describe('Tab Bar', () => {
  test('tab bar is visible with at least one tab', async () => {
    const tabBar = window.locator('.tab-bar');
    await expect(tabBar).toBeVisible();

    const tabs = window.locator('.tab-item');
    const count = await tabs.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('new tab button exists', async () => {
    const newTabBtn = window.locator('.new-tab-btn');
    await expect(newTabBtn).toBeVisible();
  });

  test('can create a new tab', async () => {
    const tabsBefore = await window.locator('.tab-item').count();

    const newTabBtn = window.locator('.new-tab-btn');
    await newTabBtn.click();

    // Wait for the new tab to appear
    await window.waitForTimeout(500);
    const tabsAfter = await window.locator('.tab-item').count();
    expect(tabsAfter).toBe(tabsBefore + 1);
  });

  test('can switch between tabs', async () => {
    const tabs = window.locator('.tab-item');
    const count = await tabs.count();
    if (count >= 2) {
      // Click the first tab
      await tabs.first().click();
      await expect(tabs.first()).toHaveClass(/active/);

      // Click the last tab
      await tabs.last().click();
      await expect(tabs.last()).toHaveClass(/active/);
    }
  });

  test('can close a tab', async () => {
    const tabsBefore = await window.locator('.tab-item').count();
    if (tabsBefore >= 2) {
      // Close the last tab
      const closeBtn = window.locator('.tab-close-btn').last();
      await closeBtn.click();
      await window.waitForTimeout(500);
      const tabsAfter = await window.locator('.tab-item').count();
      expect(tabsAfter).toBe(tabsBefore - 1);
    }
  });
});

// ─── Test 8: Keyboard shortcuts ───

test.describe('Keyboard Shortcuts', () => {
  test('Ctrl+B toggles sidebar', async () => {
    const sidebar = window.locator('nav.sidebar');
    const wasCollapsed = await sidebar.evaluate(el => el.classList.contains('collapsed'));

    await window.keyboard.press('Control+b');
    await window.waitForTimeout(300);

    const isCollapsed = await sidebar.evaluate(el => el.classList.contains('collapsed'));
    expect(isCollapsed).toBe(!wasCollapsed);

    // Toggle back
    await window.keyboard.press('Control+b');
    await window.waitForTimeout(300);
    const isRestoredToOriginal = await sidebar.evaluate(el => el.classList.contains('collapsed'));
    expect(isRestoredToOriginal).toBe(wasCollapsed);
  });

  test('Ctrl+K or Ctrl+Shift+P opens command palette', async () => {
    await window.keyboard.press('Control+Shift+p');
    await window.waitForTimeout(300);

    const palette = window.locator('.command-palette');
    await expect(palette).toBeVisible();

    // Close it
    await window.keyboard.press('Escape');
    await window.waitForTimeout(300);
    await expect(palette).not.toBeVisible();
  });
});

// ─── Test 9: Command Palette ───

test.describe('Command Palette', () => {
  test('command palette shows commands', async () => {
    await window.keyboard.press('Control+Shift+p');
    await window.waitForTimeout(300);

    const palette = window.locator('.command-palette');
    await expect(palette).toBeVisible();

    // Should have command items
    const items = window.locator('.command-palette-item');
    const count = await items.count();
    expect(count).toBeGreaterThan(0);

    await window.keyboard.press('Escape');
  });

  test('command palette can search/filter commands', async () => {
    await window.keyboard.press('Control+Shift+p');
    await window.waitForTimeout(300);

    const paletteInput = window.locator('.command-palette-input');
    await paletteInput.fill('설정');

    const items = window.locator('.command-palette-item');
    const count = await items.count();
    expect(count).toBeGreaterThanOrEqual(1);

    await window.keyboard.press('Escape');
  });
});

// ─── Test 10: Formatting toolbar ───

test.describe('Formatting Toolbar', () => {
  test('formatting toolbar is visible in input area', async () => {
    const toolbar = window.locator('.formatting-toolbar');
    await expect(toolbar).toBeVisible();
  });
});

// ─── Test 11: SpeedDial ───

test.describe('SpeedDial', () => {
  test('speed dial button is visible', async () => {
    const speedDial = window.locator('.speed-dial');
    await expect(speedDial).toBeVisible();
  });
});

// ─── Test 12: Session indicator ───

test.describe('Session Indicator', () => {
  test('session indicator is present in header', async () => {
    const indicator = window.locator('.session-indicator');
    await expect(indicator).toBeVisible();
  });
});

// ─── Test 13: Breadcrumb navigation ───

test.describe('Breadcrumb', () => {
  test('breadcrumb is visible in header', async () => {
    const breadcrumb = window.locator('.breadcrumb');
    await expect(breadcrumb).toBeVisible();
  });
});

// ─── Test 14: Input preview toggle ───

test.describe('Input Preview', () => {
  test('preview toggle switch is present', async () => {
    // The switch for input preview is in the input container
    const switches = window.locator('.input-container .switch');
    const count = await switches.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

// ─── Test 15: View mode segmented control ───

test.describe('View Mode', () => {
  test('segmented control for view mode is visible', async () => {
    const segmented = window.locator('.segmented-control');
    await expect(segmented.first()).toBeVisible();
  });
});

// ─── Test 16: File attachment ───

test.describe('File Attachment', () => {
  test('file attachment area exists', async () => {
    const fileAttachment = window.locator('.file-attachment');
    await expect(fileAttachment).toBeVisible();
  });
});

// ─── Test 17: New chat via sidebar ───

test.describe('New Chat', () => {
  test('clicking new chat button resets the view', async () => {
    const newChatBtn = window.locator('.new-chat-btn');
    await newChatBtn.click();
    await window.waitForTimeout(500);

    // Welcome screen should reappear
    const welcome = window.locator('.welcome-screen');
    await expect(welcome).toBeVisible();
  });
});

// ─── Test 18: Screenshot capture ───

test.describe('Visual Verification', () => {
  test('take a screenshot of the app', async () => {
    const screenshot = await window.screenshot();
    expect(screenshot).toBeTruthy();
    expect(screenshot.byteLength).toBeGreaterThan(0);
  });
});
