// 邊界情況測試：目標時間已過期／剛好等於現在／清除設定後 Cookie 清空。
// 過去時間無法透過表單送出（submitEventInfo 會 alert 擋下），所以用 URL 分享路徑
// （loadFromURL）與 Cookie 路徑（loadSavedSettings）觸發，這兩個都是實際會發生的入口：
// 使用者收到別人分享的舊連結、或活動時間到了但使用者一直沒關頁面重新整理。
const { test, expect } = require('@playwright/test');
const { localTime, toLocalInputValue } = require('./helpers');

test.describe('邊界情況', () => {
  test('URL 帶入已過去的時間 → 立即顯示「開賣時間已到！」，不繼續倒數', async ({ page }) => {
    const pastTime = '2020-01-01T00:00';
    await page.goto(`/?name=${encodeURIComponent('過期活動')}&time=${encodeURIComponent(pastTime)}`);

    await expect(page.locator('#countdownDisplay')).toContainText('開賣時間已到！');

    // 等待超過一個 tick，確認不會被 setInterval 覆寫回奇怪的負數倒數文字
    await page.waitForTimeout(1200);
    await expect(page.locator('#countdownDisplay')).toContainText('開賣時間已到！');
  });

  test('目標時間剛好等於現在 → 正確顯示已到', async ({ page }) => {
    const target = localTime(2026, 3, 1, 9, 0, 0);
    await page.clock.install({ time: target });
    await page.clock.pauseAt(target);
    await page.goto(`/?name=${encodeURIComponent('準時活動')}&time=${encodeURIComponent(toLocalInputValue(target))}`);

    await expect(page.locator('#countdownDisplay')).toContainText('開賣時間已到！');
  });

  test('重新整理已過期的已儲存設定 → 顯示已到而非「尚未設定」', async ({ page }) => {
    // 走 Cookie 路徑：用一個尚未過期的時間先送出以寫入 Cookie，
    // 之後把假時鐘跳到目標之後再 reload，模擬「使用者一直沒關頁面、活動時間到了」。
    const target = localTime(2026, 3, 1, 9, 0, 0);
    const start = target - 60_000;
    await page.clock.install({ time: start });
    await page.clock.pauseAt(start);
    await page.goto('/');
    await page.fill('#eventName', '快到期活動');
    await page.fill('#eventDateTime', toLocalInputValue(target));
    await page.click('#submitBtn');

    await page.clock.setFixedTime(target + 5_000);
    await page.reload();

    await expect(page.locator('#eventTimeDisplay')).not.toContainText('尚未設定');
    await expect(page.locator('#countdownDisplay')).toContainText('開賣時間已到！');
  });

  test('清除設定 → Cookie 立即清空（不需 reload 就能確認）', async ({ page }) => {
    await page.goto('/');
    await page.fill('#eventName', '測試活動');
    await page.fill('#eventDateTime', '2099-01-01T00:00');
    await page.click('#submitBtn');

    const cookieBefore = await page.evaluate(() => document.cookie.includes('eventSettings='));
    expect(cookieBefore).toBe(true);

    await page.click('#resetBtn');

    const cookieAfter = await page.evaluate(() => document.cookie);
    expect(cookieAfter.includes('eventSettings=')).toBe(false);
  });
});
