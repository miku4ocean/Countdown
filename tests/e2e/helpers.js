// 共用測試工具：本機時區的日期格式化、與 script.js 完全相同的倒數字串計算。
// 目的：測試斷言用同一套公式產生期望值，不寫死秒數，換機器/換時區也不會偽陽性。

function pad(n) {
  return String(n).padStart(2, '0');
}

// 將 epoch ms 轉成 <input type="datetime-local"> 需要的本機時間字串（分鐘精度，無秒）。
function toLocalInputValue(ms) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 以本機時區的年月日時分秒建構 epoch ms（月份 1-12，符合直覺）。
function localTime(y, mo, d, h, mi, s = 0, ms = 0) {
  return new Date(y, mo - 1, d, h, mi, s, ms).getTime();
}

// 複製 script.js updateCountdown() 的文字組合公式（含前綴文案），供斷言使用。
function expectedCountdownText(remainMs) {
  const days = Math.floor(remainMs / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainMs % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainMs % (1000 * 60)) / 1000);
  return `距離票券開賣還有 ${days}天${hours}小時${minutes}分鐘${seconds}秒`;
}

module.exports = { pad, toLocalInputValue, localTime, expectedCountdownText };
