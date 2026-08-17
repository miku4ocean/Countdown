// 倒數精度測試：用 page.clock 假時鐘驗證倒數邏輯，不依賴真實時間流逝。
// 注意（沿用 timer-widget 專案的踩雷教訓）：page.clock.fastForward() 是「跳過」語意，
// 不保證觸發中間每一次 setInterval callback；要驗證逐秒跳動要用 runFor()，
// 要模擬背景分頁節流（中間 tick 被跳過）才用 fastForward()。
const { test, expect } = require('@playwright/test');
const { localTime, toLocalInputValue, expectedCountdownText } = require('./helpers');

async function setupCountdown(page, targetMs, startMs, eventName = '測試活動') {
  await page.clock.install({ time: startMs });
  // install() 後假時鐘預設仍會跟著真實時間走（只是起點被平移），
  // 要能用 runFor/fastForward 手動精準控制，必須先 pauseAt 凍結在起點。
  await page.clock.pauseAt(startMs);
  await page.goto('/');
  await page.fill('#eventName', eventName);
  await page.fill('#eventDateTime', toLocalInputValue(targetMs));
  await page.click('#submitBtn');
}

test.describe('倒數精度', () => {
  test('60 秒後開賣 → 快轉到期 → 顯示「開賣時間已到！」且停止', async ({ page }) => {
    const target = localTime(2026, 3, 1, 9, 5, 0);
    const start = target - 60_000;
    await setupCountdown(page, target, start);

    await expect(page.locator('#countdownDisplay')).toHaveText(expectedCountdownText(60_000));

    await page.clock.runFor(60_000);
    await expect(page.locator('#countdownDisplay')).toContainText('開賣時間已到！');

    // 到期後不應該繼續倒數變成負值或又跳回文字
    await page.clock.runFor(5_000);
    await expect(page.locator('#countdownDisplay')).toContainText('開賣時間已到！');
  });

  test('最後 10 秒逐秒跳動：不skip、不卡頓', async ({ page }) => {
    const target = localTime(2026, 3, 1, 9, 10, 0);
    const start = target - 65_000; // 提早 65 秒開始倒數
    await setupCountdown(page, target, start);

    // 先快轉到剩 10 秒
    await page.clock.runFor(55_000);
    await expect(page.locator('#countdownDisplay')).toHaveText(expectedCountdownText(10_000));

    // 逐秒往下數：10 → 1，每一秒都要精確顯示，不能跳過任何一秒
    for (let remain = 9; remain >= 1; remain--) {
      await page.clock.runFor(1_000);
      await expect(page.locator('#countdownDisplay')).toHaveText(expectedCountdownText(remain * 1000));
    }

    // 最後一秒歸零 → 顯示已到期
    await page.clock.runFor(1_000);
    await expect(page.locator('#countdownDisplay')).toContainText('開賣時間已到！');
  });

  test('背景分頁節流：切到背景快轉（跳過中間 tick）→ 切回前景 → 倒數立即校正不偏移', async ({ page }) => {
    const target = localTime(2026, 3, 1, 9, 20, 0);
    const start = target - 200_000; // 200 秒後開賣
    await setupCountdown(page, target, start);

    await expect(page.locator('#countdownDisplay')).toHaveText(expectedCountdownText(200_000));

    // 前景先正常跳動 30 秒
    await page.clock.runFor(30_000);
    await expect(page.locator('#countdownDisplay')).toHaveText(expectedCountdownText(170_000));

    // 模擬分頁進入背景（document.hidden = true），接著用 fastForward 跳過中間 tick，
    // 重現真實瀏覽器背景分頁節流 setInterval 的情境。
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: true, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await page.clock.fastForward(90_000);

    // 切回前景：document.hidden = false 並觸發 visibilitychange，
    // R2 修的邏輯應該立即用目前時間重新計算，不能停留在背景跳動前的舊值、也不能偏移。
    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { value: false, configurable: true });
      document.dispatchEvent(new Event('visibilitychange'));
    });

    // 累計經過 30s(前景) + 90s(背景跳過) = 120s，剩餘應為 200-120=80 秒，且是即時校正後的精確值
    await expect(page.locator('#countdownDisplay')).toHaveText(expectedCountdownText(80_000));
  });
});
