# Countdown — 薄索引
跨平台規則正本：`~/.agents/institution/`（先讀 core/PRINCIPLES.md，照其指示附版本標記）。

## 專案專屬
- Build/test 指令：直接用瀏覽器開啟 `index.html`；手動測試頁面：`test.html`；
  自動化 e2e 測試：`npm install && npx playwright test`（`tests/e2e/`，涵蓋倒數精度／Cookie／URL分享／版面／邊界情況，用 `page.clock` 假時鐘，不需真的等待）
- 架構一句話：純靜態網頁（HTML+CSS+Vanilla JS），搶票倒數計時器，含雙主題、Cookie 儲存、瀏覽器通知，無依賴。
- 本專案禁區：不要引入後端或 npm 依賴，保持純靜態可離線運作——`package.json`／`@playwright/test`
  僅為測試層 devDependency（比照 timer-widget／twstock 等同系列專案慣例），不得讓 `index.html`／`script.js`／`styles.css` 依賴任何 npm 套件或建置流程。
