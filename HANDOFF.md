# HANDOFF — Countdown
更新：2026-08-18／claude

## 目前目標
搶票倒數計時器靜態工具，供使用者設定活動時間並在關鍵時間點收到提醒。

## 狀態
- 已完成：全部核心功能＋R2 4 個 bug fix＋2 個新功能＋1 個 cleanup＋本輪自動化 e2e 測試（19 項）
- 進行中：無 WIP，工作區乾淨
- 驗收現況：`node --check script.js` 連跑兩次通過；`npx playwright test` 19/19 綠燈（連跑兩次穩定不 flaky）；
  手動測試清單維持在 test.html
- 部署：**已部署** GitHub Pages（main 分支根目錄，legacy build）。
  網址 https://miku4ocean.github.io/Countdown/

## 本輪完成項目（2026-08-18）
新增 Playwright e2e 測試（19 項，`tests/e2e/`），比照 timer-widget／twstock 慣例：
`package.json`／`@playwright/test` 只是測試層 devDependency，`index.html`/`script.js`/`styles.css`
本身仍零依賴、純靜態。用 `page.clock` 假時鐘控制時間，不需真的等待。

1. `countdown-precision.spec.js`（3 項）：60 秒後到期停止倒數、最後 10 秒逐秒不skip不卡頓、
   背景分頁節流（fastForward 跳過中間 tick 模擬節流 → visibilitychange 校正 → 驗證不偏移）——
   這是 R2「背景分頁節流防護」修復的迴歸測試
2. `cookie-persistence.spec.js`（3 項）：設定→reload 保留、活動名稱含 `;` 等特殊字元 round-trip
   （R2「Cookie 未編碼」修復的迴歸測試）、重新設定→Cookie 清空
3. `url-share.spec.js`（4 項）：送出後 URL 帶參數、開分享連結自動還原、中文活動名稱 round-trip、
   重新設定清除 URL 參數
4. `layout.spec.js`（4 項）：375/768/1440px 三尺寸皆無水平捲軸、手機版倒數文字字級 ≥14px 可讀
5. `edge-cases.spec.js`（4 項）：URL 帶過去時間立即顯示已到、目標時間精確等於現在的邊界、
   已儲存設定過期後 reload 正確顯示已到（R2「過期顯示錯誤」修復的迴歸測試）、重新設定 Cookie 立即清空
6. `notifications.spec.js`（1 項）：提醒觸發時呼叫瀏覽器 Notification，內容含活動名稱與剩餘時間，
   已觸發的提醒 checkbox 正確停用不重複觸發（用 addInitScript 置換 window.Notification 為可觀測假物件，
   不依賴真實瀏覽器通知系統）

**踩雷筆記**：`page.clock.install({time})` 之後假時鐘預設仍跟著真實時間走（只是起點被平移），
不會自動凍結；要用 `runFor`/`fastForward` 精準手動控制，必須緊接著呼叫
`page.clock.pauseAt(同一時間)` 把時鐘凍結住，否則斷言會在 5 秒 expect timeout 內隨真實時間漂移
（本輪一開始 3 個精度測試就是踩到這個，值持續往下掉直到 timeout）。

**本輪未發現新的真 bug**——針對 A~E 五個面向（精度／Cookie／URL分享／版面／邊界）逐項寫測試後，
R2 的 4 個既有修復（Cookie 編碼、背景節流、過期顯示、reminder radio 重置）在假時鐘下重新驗證皆成立，
沒有再挖到新的邏輯漏洞。

## 下一步（接手的人從這裡開始）
1. 可選：加 Open Graph meta（og:title/og:description/og:image）讓社群分享有預覽卡片
2. 可選：localStorage 替代 Cookie（避免 HTTP 請求帶 cookie，但需自行實作 TTL）
3. 可選：`loadFromURL()`／`loadSavedSettings()` 直接用 `.value = name` 寫回 input，會繞過
   `maxlength="25"` 的 UI 限制（例如手工拼的分享連結帶超長活動名稱）——非本輪範圍內的真 bug，
   只是次要邊界，值得留意但影響很小（純顯示，不影響倒數邏輯）

## 地雷（別踩）
- 瀏覽器通知需使用者授權，若在無 HTTPS 環境（除 localhost）可能無法觸發
- Cookie 儲存 30 天，清除 cookie 會遺失設定
- URL 分享連結在 file:// 協議下無法使用 history.replaceState
- 跑 `npx playwright test` 前記得 `npm install`（`node_modules/` 已 gitignore，不會被 commit）
- 假時鐘測試務必 `install` 後緊接 `pauseAt`，否則會在真實時間流逝下產生偽陽性/偽陰性（見上）

## 主辦權
單線／待分派
