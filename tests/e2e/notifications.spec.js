// 系統通知測試：提醒時間到 → 觸發瀏覽器通知，內容含正確剩餘時間與活動名稱。
// 用 addInitScript 在頁面載入「前」置換 window.Notification 為可觀測的假物件，
// 這樣不依賴真實瀏覽器通知系統（headless 下也無法真正彈出），但完整驗證
// script.js showReminderNotification() 呼叫時機與帶入內容是否正確。
const { test, expect } = require('@playwright/test');
const { localTime, toLocalInputValue } = require('./helpers');

async function stubGrantedNotification(page) {
  await page.addInitScript(() => {
    window.__notifications = [];
    class FakeNotification {
      constructor(title, options) {
        window.__notifications.push({ title, body: options && options.body });
      }
      close() {}
      static requestPermission() {
        return Promise.resolve('granted');
      }
    }
    Object.defineProperty(FakeNotification, 'permission', { value: 'granted' });
    window.Notification = FakeNotification;
  });
}

test('提醒時間到 → 呼叫瀏覽器通知且內容含活動名稱與剩餘時間', async ({ page }) => {
  await stubGrantedNotification(page);

  const target = localTime(2026, 3, 1, 9, 30, 0);
  const start = target - 65_000; // 提早 65 秒開始，讓「1分鐘前」提醒有機會觸發
  await page.clock.install({ time: start });
  await page.clock.pauseAt(start);
  await page.goto('/');

  await page.fill('#eventName', '搶票通知測試');
  await page.fill('#eventDateTime', toLocalInputValue(target));
  await page.click('#submitBtn');

  // 開啟提醒，勾選「1分鐘前」
  await page.locator('input[name="reminder"][value="enabled"]').check();
  await page.locator('#reminderTimes input[value="1"]').check();

  // 快轉 5 秒進入「還剩 60 秒＝1分鐘前」門檻
  await page.clock.runFor(5_000);

  const notifications = await page.evaluate(() => window.__notifications);
  expect(notifications.length).toBe(1);
  expect(notifications[0].title).toContain('搶票計時器');
  expect(notifications[0].body).toContain('搶票通知測試');

  // 已觸發的提醒 checkbox 應該被停用，避免重複觸發
  await expect(page.locator('#reminderTimes input[value="1"]')).toBeDisabled();
});
