# HANDOFF — Countdown
更新：2026-07-25／claude

## 目前目標
搶票倒數計時器靜態工具，供使用者設定活動時間並在關鍵時間點收到提醒。

## 狀態
- 已完成：標題修正（bf5c9cb，2025-08-27）；含測試頁面 test.html 與測試報告
- 進行中：無 WIP，工作區乾淨
- 驗收現況：已實測確認（Playwright headless 跑完整流程：DOM id 對應、倒數計算、
  主題切換、提醒開關、重設，全部正常；node --check script.js 通過；無硬編碼金鑰）
  唯一發現的問題（favicon.ico 404 造成 console 錯誤）已修復，改為內嵌 data URI icon
- 部署：**已部署** GitHub Pages（main 分支根目錄，legacy build）。
  網址 https://miku4ocean.github.io/Countdown/ 經 2026-07-25 實測 HTTP 200，
  頁面內容為本專案（含 favicon data URI 修復版）；`gh api repos/miku4ocean/Countdown/pages`
  回報 status: built、https_enforced: true。先前「本輪未對外部署」敘述已過時，據此更正。

## 下一步（接手的人從這裡開始）
1. ~~可選：把 test.html 檢核清單第 76 行文字（「時間已到！」）對齊實際程式顯示的
   「開賣時間已到！」，目前只是文件用字不完全一致，不影響功能~~ (完成：1e7ec18，2026-07-27)

## 地雷（別踩）
- 瀏覽器通知需使用者授權，若在無 HTTPS 環境（除 localhost）可能無法觸發
- Cookie 儲存 30 天，清除 cookie 會遺失設定

## 主辦權
單線／待分派
