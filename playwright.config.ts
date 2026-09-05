import { defineConfig } from '@playwright/test';

const deployedBaseURL = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 8_000 },
  reporter: 'list',
  use: {
    baseURL: deployedBaseURL || 'http://127.0.0.1:4173',
    viewport: { width: 390, height: 844 },
    browserName: 'chromium',
    ...(process.platform === 'win32' ? { channel: 'chrome' } : {}),
    headless: true,
    locale: 'pt-BR',
    screenshot: 'off',
    trace: 'off',
    video: 'off',
  },
  webServer: deployedBaseURL
    ? undefined
    : {
        command: 'node scripts/serve-web.mjs',
        url: 'http://127.0.0.1:4173',
        reuseExistingServer: true,
        timeout: 30_000,
      },
});
