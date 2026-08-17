// 版面測試：三個尺寸下不應出現水平捲軸，手機版倒數數字要可讀。
const { test, expect } = require('@playwright/test');

const viewports = [
  { name: '手機 375px', width: 375, height: 667, isMobile: true },
  { name: '平板 768px', width: 768, height: 1024, isMobile: false },
  { name: '桌面 1440px', width: 1440, height: 900, isMobile: false },
];

for (const vp of viewports) {
  test(`${vp.name}：無水平捲軸`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto('/');

    const hasHorizontalScroll = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(hasHorizontalScroll).toBe(false);
  });
}

test('手機版（375px）倒數數字可讀：字級不過小、容器不溢出', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');
  await page.fill('#eventName', '演唱會門票');
  await page.fill('#eventDateTime', '2099-01-01T00:00');
  await page.click('#submitBtn');

  const countdownText = page.locator('#countdownDisplay');
  await expect(countdownText).toBeVisible();

  const fontSizePx = await countdownText.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(fontSizePx).toBeGreaterThanOrEqual(14);

  const box = await countdownText.boundingBox();
  expect(box.width).toBeLessThanOrEqual(375);
});
