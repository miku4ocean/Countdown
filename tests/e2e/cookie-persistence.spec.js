// Cookie 持久化測試：設定 → reload → 設定應保留。
// 目標時間用「現在+1天」的真實時間（不裝假時鐘），避免與精度測試的假時鐘互相干擾，
// 也讓 reload 後的行為單純只驗證持久化本身，不糾結於倒數是否剛好到期的邊界。
const { test, expect } = require('@playwright/test');
const { toLocalInputValue } = require('./helpers');

function futureInputValue(hoursFromNow = 24) {
  return toLocalInputValue(Date.now() + hoursFromNow * 60 * 60 * 1000);
}

test.describe('Cookie 持久化', () => {
  test('設定目標時間 → reload → 設定保留', async ({ page }) => {
    const name = '演唱會門票';
    const time = futureInputValue();

    await page.goto('/');
    await page.fill('#eventName', name);
    await page.fill('#eventDateTime', time);
    await page.click('#submitBtn');

    await expect(page.locator('#eventName')).toHaveValue(name);

    await page.reload();

    await expect(page.locator('#eventName')).toHaveValue(name);
    await expect(page.locator('#eventDateTime')).toHaveValue(time);
    // reload 後應該自動恢復倒數，而不是停在「請先設定活動時間」
    await expect(page.locator('#countdownDisplay')).not.toContainText('請先設定活動時間');
  });

  test('R2 回歸：活動名稱含分號等特殊字元 → Cookie 存取正確不破壞', async ({ page }) => {
    const name = '演唱會;VIP場,加場！＃特別版';
    const time = futureInputValue();

    await page.goto('/');
    await page.fill('#eventName', name);
    await page.fill('#eventDateTime', time);
    await page.click('#submitBtn');

    await page.reload();

    await expect(page.locator('#eventName')).toHaveValue(name);
    await expect(page.locator('#eventDateTime')).toHaveValue(time);
  });

  test('清除設定 → Cookie 清空，reload 後欄位回到預設', async ({ page }) => {
    const name = '演唱會門票';
    const time = futureInputValue();

    await page.goto('/');
    await page.fill('#eventName', name);
    await page.fill('#eventDateTime', time);
    await page.click('#submitBtn');

    await page.click('#resetBtn');

    const cookieAfterReset = await page.evaluate(() => document.cookie.includes('eventSettings='));
    expect(cookieAfterReset).toBe(false);

    await page.reload();

    await expect(page.locator('#eventName')).toHaveValue('');
    await expect(page.locator('#eventDateTime')).toHaveValue('');
    await expect(page.locator('#countdownDisplay')).toContainText('請先設定活動時間');
  });
});
