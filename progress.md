# Countdown — 專案進度報告

## A. 專案名稱
Countdown（搶票倒數計時器 / Countdown Timer）

## B. 專案路徑
`/Users/leonalin/Code/Countdown`

## C. 專案簡介
一個純前端靜態網頁工具，讓使用者輸入活動名稱與開賣時間後，即時倒數計時（精準到秒），並可在自訂的時間點透過瀏覽器通知提醒使用者。全站僅由 `index.html` + `styles.css` + `script.js` 三個檔案構成，無伺服器、無資料庫、無外部套件依賴（AGENTS.md 明訂「禁區：不要引入後端或 npm 依賴，保持純靜態可離線運作」）。

## D. 專案開發目的
依 HANDOFF.md 記載：「搶票倒數計時器靜態工具，供使用者設定活動時間並在關鍵時間點收到提醒。」目標場景是門票、限量商品、課程報名等有明確「開賣／開搶時間」的活動（README 列舉：演唱會門票、限量商品開搶、體育賽事票務、遊戲道具限時販售、課程報名倒數）。

## E. 解決使用者痛點
- 搶票／搶購常因記錯確切開賣時間、時區換算失誤而錯過黃金時機
- 需要在多個時間點（如 1 小時前、5 分鐘前）被主動提醒，避免因分心而錯過，光靠使用者自行盯著時鐘不可靠
- 使用者不想為了一次性需求安裝 App 或註冊帳號，希望開個網頁就能用、關掉分頁下次回來設定還在

## F. 專案功能細項介紹
- 活動設定表單：活動名稱（限 25 字）、活動時間（`datetime-local`），送出前驗證「名稱必填」「時間必填」「時間須為未來」（三種情況皆以 `alert` 阻擋，見 `script.js` `submitEventInfo()`）
- 精準倒數計時：送出後以 `setInterval` 每秒重算天／時／分／秒並更新畫面；時間到達時顯示「開賣時間已到！」（紅字加粗）
- 多時間點提醒：可勾選 1 小時／30 分鐘／5 分鐘／1 分鐘前，倒數進入誤差 5 秒視窗內觸發一次；優先用瀏覽器原生 `Notification` API 推播，未授權時退回 `alert`
- 雙主題切換：明亮風格（白底黑字）／低調風格（黑底白字），即時套用且透過 Cookie 記住選擇
- 自動儲存與還原：活動設定與主題以 Cookie（效期 30 天）保存；重新整理頁面會自動讀回設定，若活動時間仍在未來則自動接續倒數
- 重新設定：清空表單、停止計時器、清除提醒觸發紀錄、刪除已儲存的 Cookie
- 響應式設計：於 768px／480px／320px 三個斷點調整字級與版面（`styles.css` media queries）

## G. 專案規格及 RPD
**技術棧**：HTML5 + CSS3 + Vanilla JavaScript，無框架、無建置工具、無 `package.json`（AGENTS.md 確認）。

**執行方式（無固定埠）**：
- 直接用瀏覽器開啟 `index.html`（README 建議之最簡方式）
- 或本機起靜態伺服器：`python3 -m http.server 8000`，瀏覽器開 `http://localhost:8000`
- 線上版本：`https://miku4ocean.github.io/Countdown/`（GitHub Pages）——**2026-07-25 已查證為活著且同步最新**：`curl -L` 實測 HTTP 200，回傳內容為本專案頁面（title「搶票倒數計時器」，且含 favicon data URI 修復版，即最新 commit `277290d` 的內容）；`gh api repos/miku4ocean/Countdown/pages` 回報 status: built、來源 main 分支根目錄、https_enforced: true。HANDOFF.md 先前「本輪未對外部署」敘述已據此更正。

**資料流**：
1. 使用者於表單輸入活動名稱／時間 → `submitEventInfo()` 驗證
2. 驗證通過 → `saveEventSettings()` 寫入 Cookie（`eventSettings`）＋ `startCountdown()` 啟動 `setInterval`（每秒）
3. `updateCountdown()` 計算 `timeDiff` → 更新畫面文字 → `checkReminders()` 檢查是否落入任一提醒時間視窗
4. 命中提醒視窗 → `showReminderNotification()` 呼叫瀏覽器 `Notification` API（無授權則 `alert`）
5. 使用者重新整理頁面 → `loadSavedSettings()` 讀 Cookie 還原表單／主題，若活動時間未過則自動重新 `startCountdown()`
6. 全程無任何資料送出到伺服器，一切狀態只存在瀏覽器本機（Cookie）與記憶體中

**測試**：專案自帶 `test.html`（iframe 內嵌 `index.html` ＋ 人工檢核清單）與 `測試報告.md`（記載 2025-08-27 測試：功能完整性 95/100、跨瀏覽器相容性、響應式設計、程式碼品質檢查皆通過）。HANDOFF.md 記載近期另有 Playwright headless 全流程驗證（DOM id 對應、倒數計算、主題切換、提醒開關、重設）與 `node --check script.js` 語法檢查，均通過。

## H. 目前已完成項目
- 核心倒數計時、表單驗證、雙主題切換、Cookie 儲存與還原、多時間點提醒、重設功能，皆已實作並在 `script.js`/`index.html`/`styles.css` 中可見
- 標題文字修正為「搶票倒數計時器」（commit `bf5c9cb`）
- favicon 404 問題修復，改為內嵌 SVG data URI（commit `277290d`），HANDOFF.md 記載已驗證消除 console 錯誤
- `CLAUDE.md` 瘦身為薄索引、細節併入 `AGENTS.md`（commit `3508214`）
- 響應式設計三斷點（768/480/320px）已完成並列入測試報告
- 功能測試與程式碼品質檢查已完成並留有書面測試報告（`測試報告.md`）與使用手冊（`使用說明手冊.md`）

## I. 尚待完成項目
- ~~GitHub Pages 部署狀態待確認~~ **已於 2026-07-25 查證完畢**：網址實測 HTTP 200、內容為本專案最新版（查證方法：`curl -L` 看狀態碼與頁面內容＋`gh api repos/miku4ocean/Countdown/pages` 看 Pages 設定），HANDOFF.md 與本檔已同步更正，此項結案
- **文件用字不一致（小）**：`test.html` 第 76 行檢核項目寫「時間已到！」，但程式實際顯示為「開賣時間已到！」，HANDOFF.md 已列為已知但不影響功能的差異，待有人手動修正 `test.html` 文字
- **通知授權在非 HTTPS 環境的限制**：HANDOFF.md 列為地雷——瀏覽器 `Notification` API 需使用者授權，若部署環境非 HTTPS（localhost 除外）可能無法觸發授權請求，需留意最終部署網域是否為 HTTPS

## J. 系統優化或增加功能建議
以下為依現有程式與文件推導出的建議，非專案文件明文要求：
- **分享連結**：目前設定只存在單一使用者的 Cookie 裡，無法分享給朋友一起倒數；可考慮把活動名稱／時間編碼進 URL query string，讓使用者能複製連結分享（仍可保持零後端）
- **背景分頁節流風險**：提醒判斷用「誤差 5 秒視窗」比對 `setInterval` 累積的 `timeDiff`，若分頁長時間在背景執行，瀏覽器可能降頻或暫停計時器，導致提醒視窗被跳過；建議搭配 Page Visibility API，在分頁重新可見時立即重新核對是否已錯過提醒
- **儲存機制**：目前用 Cookie（30 天固定效期），可評估改用 `localStorage`（同樣純本機、不隨 HTTP 請求傳送，但需自行實作 TTL 邏輯以維持「30 天後失效」的行為）
- **測試自動化**：`test.html` 目前是人工檢核清單＋iframe 展示，可評估加入輕量、零依賴的斷言腳本（純 JS，不引入測試框架），讓表單驗證與倒數計算等純函式邏輯可重複自動驗證，降低每次修改後的人工回歸測試成本
