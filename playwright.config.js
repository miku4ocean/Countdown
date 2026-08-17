// Playwright 設定——僅供測試層使用，不影響前端程式碼與純靜態部署。
// 依 AGENTS.md 禁區：不引入後端或 npm 執行期依賴；@playwright/test 僅為 devDependency，
// 測試用的 http.server 也只是本機驗證手段，不影響 GitHub Pages 上的純靜態部署。
const { defineConfig, devices } = require('@playwright/test');

const PORT = process.env.COUNTDOWN_E2E_PORT || 8137;

module.exports = defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: `python3 -m http.server ${PORT}`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
