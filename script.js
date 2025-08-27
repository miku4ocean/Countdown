// 全域變數
let countdownInterval = null;
let reminderTimeouts = [];

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 應用程式初始化
function initializeApp() {
    // 設定預設主題
    document.body.setAttribute('data-theme', 'light');
    
    // 綁定事件監聽器
    bindEventListeners();
    
    // 載入儲存的設定
    loadSavedSettings();
}

// 綁定所有事件監聽器
function bindEventListeners() {
    // 表單按鈕
    document.getElementById('submitBtn').addEventListener('click', submitEventInfo);
    document.getElementById('resetBtn').addEventListener('click', resetForm);
    
    // 主題切換
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.addEventListener('change', changeTheme);
    });
    
    // 提醒設定
    const reminderRadios = document.querySelectorAll('input[name="reminder"]');
    reminderRadios.forEach(radio => {
        radio.addEventListener('change', toggleReminderOptions);
    });
}

// 提交活動資訊
function submitEventInfo() {
    const eventName = document.getElementById('eventName').value.trim();
    const eventDateTime = document.getElementById('eventDateTime').value;
    
    // 表單驗證
    if (!eventName) {
        alert('請輸入活動名稱');
        return;
    }
    
    if (!eventDateTime) {
        alert('請選擇活動時間');
        return;
    }
    
    const eventDate = new Date(eventDateTime);
    const now = new Date();
    
    if (eventDate <= now) {
        alert('活動時間必須是未來時間');
        return;
    }
    
    // 儲存設定並開始計時
    saveEventSettings(eventName, eventDateTime);
    startCountdown(eventDate);
    showCountdownSection();
}

// 開始倒數計時
function startCountdown(eventDate) {
    // 清除現有的計時器
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    // 更新顯示活動時間
    updateEventTimeDisplay(eventDate);
    
    // 設定計時器
    countdownInterval = setInterval(() => {
        updateCountdown(eventDate);
    }, 1000);
    
    // 立即執行一次更新
    updateCountdown(eventDate);
}

// 更新倒數計時顯示
function updateCountdown(eventDate) {
    const now = new Date();
    const timeDiff = eventDate - now;
    
    if (timeDiff <= 0) {
        // 活動時間已到
        clearInterval(countdownInterval);
        document.getElementById('countdownDisplay').innerHTML = 
            '距離票券開賣還有 <span style="color: #ff0000; font-weight: bold;">時間已到！</span>';
        return;
    }
    
    // 計算剩餘時間
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    // 更新當前時間顯示
    updateCurrentTimeDisplay();
    
    // 更新倒數計時顯示
    const countdownText = `${days}天${hours}小時${minutes}分鐘${seconds}秒`;
    document.getElementById('countdownDisplay').innerHTML = 
        `距離票券開賣還有 <span>${countdownText}</span>`;
    
    // 檢查提醒
    checkReminders(timeDiff);
}

// 更新活動時間顯示
function updateEventTimeDisplay(eventDate) {
    const formattedDate = formatDateTime(eventDate);
    document.getElementById('eventTimeDisplay').innerHTML = 
        `活動時間為 <span>${formattedDate}</span>`;
}

// 更新當前時間顯示
function updateCurrentTimeDisplay() {
    const now = new Date();
    const formattedDate = formatDateTime(now);
    document.getElementById('currentTimeDisplay').innerHTML = 
        `現在時間為 <span>${formattedDate}</span>`;
}

// 格式化日期時間
function formatDateTime(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}:${month}:${day} ${hours}:${minutes}`;
}

// 顯示倒數計時區塊
function showCountdownSection() {
    document.getElementById('countdownSection').style.display = 'block';
}

// 重設表單
function resetForm() {
    // 清除表單
    document.getElementById('eventName').value = '';
    document.getElementById('eventDateTime').value = '';
    
    // 隱藏倒數計時區塊
    document.getElementById('countdownSection').style.display = 'none';
    
    // 停止計時器
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    // 清除提醒
    clearReminders();
    
    // 清除儲存的設定
    clearSavedSettings();
}

// 切換主題
function changeTheme(event) {
    const theme = event.target.value;
    document.body.setAttribute('data-theme', theme);
    saveThemeSetting(theme);
}

// 切換提醒選項
function toggleReminderOptions(event) {
    const reminderTimes = document.getElementById('reminderTimes');
    if (event.target.value === 'enabled') {
        reminderTimes.style.display = 'block';
    } else {
        reminderTimes.style.display = 'none';
        // 清除所有提醒核取方塊
        const checkboxes = reminderTimes.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => checkbox.checked = false);
    }
}

// Cookie 相關函數
function saveEventSettings(eventName, eventDateTime) {
    const settings = {
        eventName: eventName,
        eventDateTime: eventDateTime,
        timestamp: new Date().getTime()
    };
    setCookie('eventSettings', JSON.stringify(settings), 30);
}

function saveThemeSetting(theme) {
    setCookie('theme', theme, 30);
}

function loadSavedSettings() {
    // 載入主題設定
    const savedTheme = getCookie('theme');
    if (savedTheme) {
        document.body.setAttribute('data-theme', savedTheme);
        document.querySelector(`input[name="theme"][value="${savedTheme}"]`).checked = true;
    }
    
    // 載入活動設定
    const eventSettings = getCookie('eventSettings');
    if (eventSettings) {
        try {
            const settings = JSON.parse(eventSettings);
            document.getElementById('eventName').value = settings.eventName;
            document.getElementById('eventDateTime').value = settings.eventDateTime;
            
            // 如果活動時間還沒過，自動開始計時
            const eventDate = new Date(settings.eventDateTime);
            if (eventDate > new Date()) {
                startCountdown(eventDate);
                showCountdownSection();
            }
        } catch (e) {
            console.error('載入設定時發生錯誤:', e);
        }
    }
}

function clearSavedSettings() {
    deleteCookie('eventSettings');
}

// Cookie 工具函數
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

// 提醒功能
let triggeredReminders = new Set(); // 記錄已觸發的提醒

function checkReminders(timeDiff) {
    const reminderRadio = document.querySelector('input[name="reminder"]:checked');
    if (reminderRadio && reminderRadio.value === 'enabled') {
        const selectedTimes = document.querySelectorAll('#reminderTimes input[type="checkbox"]:checked');
        
        selectedTimes.forEach(checkbox => {
            const reminderMinutes = parseInt(checkbox.value);
            const reminderTime = reminderMinutes * 60 * 1000; // 轉換為毫秒
            
            // 檢查是否接近提醒時間（誤差範圍3秒）且尚未觸發
            if (timeDiff <= reminderTime && timeDiff > (reminderTime - 3000)) {
                const reminderId = `remind_${reminderMinutes}`;
                if (!triggeredReminders.has(reminderId)) {
                    showReminderNotification(timeDiff);
                    triggeredReminders.add(reminderId);
                    // 取消勾選已觸發的提醒
                    checkbox.checked = false;
                }
            }
        });
    }
}

function showReminderNotification(timeDiff) {
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    const timeText = `${days}天${hours}小時${minutes}分鐘${seconds}秒`;
    const message = `距離開賣，還剩下 ${timeText} 時間。`;
    
    // 使用瀏覽器通知（如果支援）
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('搶票計時器提醒', {
            body: message,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>'
        });
    } else {
        // fallback 使用 alert
        alert(message);
    }
}

function clearReminders() {
    reminderTimeouts.forEach(timeout => clearTimeout(timeout));
    reminderTimeouts = [];
    triggeredReminders.clear(); // 清除已觸發提醒的記錄
}

// 請求通知權限
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

// 頁面載入時請求通知權限
window.addEventListener('load', requestNotificationPermission);