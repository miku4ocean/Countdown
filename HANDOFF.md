# HANDOFF — Countdown
更新：2026-08-07／claude

## 目前目標
搶票倒數計時器靜態工具，供使用者設定活動時間並在關鍵時間點收到提醒。

## 狀態
- 已完成：全部核心功能＋本輪 4 個 bug fix＋2 個新功能＋1 個 cleanup
- 進行中：無 WIP，工作區乾淨
- 驗收現況：`node --check script.js` 連跑兩次通過；手動測試清單已更新至 test.html
- 部署：**已部署** GitHub Pages（main 分支根目錄，legacy build）。
  網址 https://miku4ocean.github.io/Countdown/
  本輪 9 個 commit 尚未 push，需使用者手動 `git push` 更新線上版。

## 本輪完成項目（2026-08-07）
1. fix: Cookie 值加 encodeURIComponent 編碼，防止活動名稱含 `;` 時破壞解析 (66078de)
2. fix: 背景分頁節流防護——去掉 5 秒窄視窗改 `<=`，加 Page Visibility API 恢復時重算 (40447ba)
3. fix: 重新載入時已過期活動顯示「開賣時間已到！」而非「尚未設定」 (aafaf22)
4. fix: 重新設定時提醒 radio 重置回「無提醒」並隱藏時間選項面板 (a18a908)
5. fix: test.html 標題文字統一為「搶票倒數計時器」 (eae9123)
6. chore: 移除未使用的 reminderTimeouts 死碼 (9d0e83b)
7. feat: URL 分享功能——query string 編碼活動、分享按鈕複製連結 (49af106)
8. feat: meta description 改善 SEO (f510059)
9. test: test.html 加入分享、特殊字元、過期活動測試項 (7cc1103)

## 下一步（接手的人從這裡開始）
1. `git push` 更新 GitHub Pages 線上版（需使用者執行）
2. 可選：加 Open Graph meta（og:title/og:description/og:image）讓社群分享有預覽卡片
3. 可選：localStorage 替代 Cookie（避免 HTTP 請求帶 cookie，但需自行實作 TTL）

## 地雷（別踩）
- 瀏覽器通知需使用者授權，若在無 HTTPS 環境（除 localhost）可能無法觸發
- Cookie 儲存 30 天，清除 cookie 會遺失設定
- URL 分享連結在 file:// 協議下無法使用 history.replaceState

## 主辦權
單線／待分派
