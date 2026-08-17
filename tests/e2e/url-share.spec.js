// URL 分享功能測試：設定 → 產生分享 URL → 開分享 URL → 設定正確還原，含中文 round-trip。
const { test, expect } = require('@playwright/test');
const { toLocalInputValue } = require('./helpers');

function futureInputValue(hoursFromNow = 24) {
  return toLocalInputValue(Date.now() + hoursFromNow * 60 * 60 * 1000);
}

test.describe('URL 分享', () => {
  test('送出後網址列帶 name/time 參數，分享按鈕出現', async ({ page }) => {
    const name = '演唱會門票';
    const time = futureInputValue();

    await page.goto('/');
    await page.fill('#eventName', name);
    await page.fill('#eventDateTime', time);
    await page.click('#submitBtn');

    await expect(page.locator('#shareBtn')).toBeVisible();

    const url = new URL(page.url());
    expect(url.searchParams.get('name')).toBe(name);
    expect(url.searchParams.get('time')).toBe(time);
  });

  test('開啟分享 URL → 自動還原設定並開始倒數', async ({ page }) => {
    const name = '演唱會門票';
    const time = futureInputValue();

    const shareUrl = `/?name=${encodeURIComponent(name)}&time=${encodeURIComponent(time)}`;
    await page.goto(shareUrl);

    await expect(page.locator('#eventName')).toHaveValue(name);
    await expect(page.locator('#eventDateTime')).toHaveValue(time);
    await expect(page.locator('#shareBtn')).toBeVisible();
    await expect(page.locator('#countdownDisplay')).not.toContainText('請先設定活動時間');
  });

  test('含中文活動名稱的分享連結 round-trip 正確', async ({ page }) => {
    const name = '演唱會門票（開賣）！＃搶票 加場';
    const time = futureInputValue();

    await page.goto('/');
    await page.fill('#eventName', name);
    await page.fill('#eventDateTime', time);
    await page.click('#submitBtn');

    const urlAfterSubmit = new URL(page.url());
    expect(urlAfterSubmit.searchParams.get('name')).toBe(name);

    // 用組出來的分享連結開新頁面，確認中文與標點正確 round-trip
    await page.goto(urlAfterSubmit.pathname + urlAfterSubmit.search);
    await expect(page.locator('#eventName')).toHaveValue(name);
  });

  test('重新設定後清除 URL 參數與分享按鈕', async ({ page }) => {
    const name = '演唱會門票';
    const time = futureInputValue();

    await page.goto('/');
    await page.fill('#eventName', name);
    await page.fill('#eventDateTime', time);
    await page.click('#submitBtn');
    await expect(page.locator('#shareBtn')).toBeVisible();

    await page.click('#resetBtn');

    await expect(page.locator('#shareBtn')).toBeHidden();
    const url = new URL(page.url());
    expect(url.search).toBe('');
  });
});
