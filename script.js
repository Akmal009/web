// Telegram Mini App подключение
let tg = window.Telegram.WebApp;
tg.expand(); // растягивает на весь экран
tg.ready();  // сообщает Telegram, что WebApp загружен

// Получение initData
let initDataUnsafe = tg.initDataUnsafe;
let userId = initDataUnsafe?.user?.id;

if (!userId) {
    alert("Ошибка: Telegram user ID не найден. Попробуйте снова открыть Mini App.");
    throw new Error("Telegram user ID not available");
}

// Пример: сохраняем user_id глобально
window.userId = userId;

// Пример: отправка user_id при запросе
async function registerUserOnBackend() {
    try {
        await fetch("/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: userId,
                username: initDataUnsafe.user.username,
                first_name: initDataUnsafe.user.first_name,
                last_name: initDataUnsafe.user.last_name,
                language_code: initDataUnsafe.user.language_code
            })
        });
    } catch (err) {
        console.error("Ошибка регистрации:", err);
    }
}

registerUserOnBackend(); // авто-регистрация при входе

// History functionality
let currentFilter = 'all';

function showHistoryScreen() {
    updateBalanceSummary();
    displayTransactionHistory();
    showScreen('historyScreen');
}

function updateBalanceSummary() {
    let totalBalance = 0;
    let monthlyChange = 0;
    
    // Calculate total balance from all cards
    userCards.forEach(card => {
        totalBalance += card.balance;
    });
    
    // Calculate monthly change from transactions
    const currentMonth = new Date().getMonth();
    userTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        if (transactionDate.getMonth() === currentMonth) {
            monthlyChange += transaction.amount;
        }
    });
    
    document.getElementById('totalBalance').textContent = formatCurrency(totalBalance) + ' UZS';
    
    const monthlyChangeEl = document.getElementById('monthlyChange');
    monthlyChangeEl.textContent = (monthlyChange >= 0 ? '+' : '') + formatCurrency(Math.abs(monthlyChange)) + ' UZS';
    monthlyChangeEl.className = 'balance-change ' + (monthlyChange >= 0 ? 'positive' : 'negative');
}

function filterTransactions(type) {
    currentFilter = type;
    
    // Update filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayTransactionHistory();
}

function displayTransactionHistory() {
    const historyList = document.getElementById('historyList');
    historyList.innerHTML = '';
    
    let filteredTransactions = userTransactions;
    
    // Apply filter
    if (currentFilter === 'income') {
        filteredTransactions = userTransactions.filter(t => t.amount > 0);
    } else if (currentFilter === 'outcome') {
        filteredTransactions = userTransactions.filter(t => t.amount < 0);
    }
    
    if (filteredTransactions.length === 0) {
        historyList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <div class="empty-title">No transactions</div>
                <div class="empty-subtitle">Your transaction history will appear here</div>
            </div>
        `;
        return;
    }
    
    filteredTransactions.forEach(transaction => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.onclick = () => showTransactionDetail(transaction);
        
        const transactionType = transaction.amount > 0 ? 'income' : (transaction.type === 'transfer' ? 'transfer' : 'outcome');
        const icon = getTransactionIcon(transactionType);
        
        historyItem.innerHTML = `
            <div class="history-icon ${transactionType}">
                ${icon}
            </div>
            <div class="history-details">
                <div class="history-title">${transaction.name}</div>
                <div class="history-date">${formatDate(transaction.date)}</div>
            </div>
            <div class="history-amount-container">
                <div class="history-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                    ${transaction.amount > 0 ? '+' : ''}${formatCurrency(Math.abs(transaction.amount))} UZS
                </div>
                <div class="history-status">${transaction.status || 'Completed'}</div>
            </div>
        `;
        
        historyList.appendChild(historyItem);
    });
}

function getTransactionIcon(type) {
    switch (type) {
        case 'income':
            return '📥';
        case 'outcome':
            return '📤';
        case 'transfer':
            return '💸';
        default:
            return '💳';
    }
}

function showTransactionDetail(transaction) {
    // Update modal content
    document.getElementById('detailAmount').textContent = 
        (transaction.amount > 0 ? '+' : '') + formatCurrency(Math.abs(transaction.amount)) + ' UZS';
    document.getElementById('detailAmount').className = 
        'transaction-amount-detail ' + (transaction.amount > 0 ? 'positive' : 'negative');
    
    document.getElementById('detailId').textContent = transaction.transactionId || transaction.id;
    document.getElementById('detailDate').textContent = new Date(transaction.date).toLocaleString();
    document.getElementById('detailFrom').textContent = selectedFromCard ? maskCardNumber(selectedFromCard.number) : 'Your Card';
    document.getElementById('detailTo').textContent = transaction.name;
    document.getElementById('detailFee').textContent = formatCurrency(transaction.fee || 0) + ' UZS';
    
    document.getElementById('transactionDetailModal').classList.add('active');
}

function downloadTransactionReceipt() {
    showNotification('Receipt downloaded successfully', 'success');
    closeModal('transactionDetailModal');
}

// Profile functionality
function showProfileScreen() {
    updateProfileInfo();
    updateThemeDisplay();
    updateLanguageDisplay();
    showScreen('profileScreen');
}

function updateProfileInfo() {
    if (currentUser) {
        const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
        document.getElementById('profileName').textContent = fullName || 'User';
        document.getElementById('profilePhone').textContent = currentUser.phoneNumber || '+998 XX XXX XX XX';
        
        // Update profile photo
        const profilePhotoImg = document.getElementById('profilePhotoImg');
        if (currentUser.photoUrl) {
            profilePhotoImg.src = currentUser.photoUrl;
            profilePhotoImg.style.display = 'block';
        } else {
            profilePhotoImg.style.display = 'none';
            // Show initials instead
            const profilePhoto = document.getElementById('profilePhoto');
            profilePhoto.textContent = fullName.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
        }
    }
}

function updateThemeDisplay() {
    const isDark = document.body.classList.contains('dark');
    document.getElementById('currentTheme').textContent = isDark ? 'Dark' : 'Light';
}

function updateLanguageDisplay() {
    const langNames = {
        'ru': 'Русский',
        'uz': "O'zbek",
        'en': 'English',
        'kk': 'Қазақша'
    };
    
    const currentLang = currentUser?.languageCode || 'en';
    document.getElementById('currentLanguage').textContent = langNames[currentLang] || 'English';
    
    // Update language selector
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('selected');
    });
    
    const selectedLangOption = document.querySelector(`[onclick="changeLanguage('${currentLang}')"]`);
    if (selectedLangOption) {
        selectedLangOption.parentElement.classList.add('selected');
    }
}

function showLanguageSelector() {
    updateLanguageDisplay();
    document.getElementById('languageSelectorModal').classList.add('active');
}

function changeLanguage(langCode) {
    if (currentUser) {
        currentUser.languageCode = langCode;
        saveUserData();
        
        // Update displays
        updateLanguageDisplay();
        updateGreeting();
        
        showNotification('Language updated successfully', 'success');
        closeModal('languageSelectorModal');
        
        // Send update to Telegram bot if available
        if (window.Telegram && window.Telegram.WebApp) {
            // In a real implementation, you would send this to your backend
            console.log('Language updated:', langCode);
        }
    }
}

function toggleAppTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('minibank_theme', isDark ? 'dark' : 'light');
    updateThemeDisplay();
    showNotification(`Switched to ${isDark ? 'dark' : 'light'} theme`, 'success');
}

function confirmLogout() {
    document.getElementById('logoutConfirmModal').classList.add('active');
}

function performLogout() {
    // Clear user session data
    if (currentUser) {
        currentUser.isVerified = false;
        currentUser.pin = null;
        saveUserData();
    }
    
    // Clear cards and transactions
    userCards = [];
    userTransactions = [];
    selectedFromCard = null;
    transferData = {};
    
    // Reset UI state
    currentScreen = 'phoneRegistration';
    
    closeModal('logoutConfirmModal');
    showNotification('Logged out successfully', 'success');
    
    // Redirect to registration
    setTimeout(() => {
        showScreen('phoneRegistration');
    }, 1000);
}

// Update navigation function to include new screens
function switchTab(tab) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    
    // Handle tab switching logic
    switch(tab) {
        case 'home':
            showScreen('homeScreen');
            break;
        case 'transfers':
            sendMoney();
            break;
        case 'history':
            showHistoryScreen();
            break;
        case 'profile':
            showProfileScreen();
            break;
    }
}

// Add empty state styles
const additionalStyles = `
.empty-state {
    text-align: center;
    padding: 60px 20px;
    color: #86868b;
}

.empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
}

.empty-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #1d1d1f;
}

body.dark .empty-title {
    color: #fff;
}

.empty-subtitle {
    font-size: 14px;
    color: #86868b;
}

/* Additional responsive styles */
@media (max-width: 480px) {
    .profile-header {
        padding: 16px;
        gap: 16px;
    }
    
    .profile-photo {
        width: 60px;
        height: 60px;
        border-radius: 30px;
        font-size: 24px;
    }
    
    .profile-name {
        font-size: 20px;
    }
    
    .balance-card {
        padding: 16px;
        gap: 16px;
    }
    
    .balance-value {
        font-size: 20px;
    }
    
    .balance-change {
        font-size: 18px;
    }
}

/* Enhanced animations */
@keyframes slideInFromRight {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes slideInFromLeft {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
}

.history-item {
    animation: slideInFromRight 0.3s ease;
    animation-fill-mode: both;
}

.history-item:nth-child(1) { animation-delay: 0.1s; }
.history-item:nth-child(2) { animation-delay: 0.2s; }
.history-item:nth-child(3) { animation-delay: 0.3s; }
.history-item:nth-child(4) { animation-delay: 0.4s; }
.history-item:nth-child(5) { animation-delay: 0.5s; }

.menu-item {
    animation: slideInFromLeft 0.3s ease;
    animation-fill-mode: both;
}

.menu-section:nth-child(1) .menu-item { animation-delay: 0.1s; }
.menu-section:nth-child(2) .menu-item { animation-delay: 0.2s; }
.menu-section:nth-child(3) .menu-item { animation-delay: 0.3s; }
.menu-section:nth-child(4) .menu-item { animation-delay: 0.4s; }

/* Success states */
.success-animation {
    animation: successPulse 0.6s ease;
}

@keyframes successPulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

/* Loading states for async operations */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.loading-content {
    background: white;
    border-radius: 16px;
    padding: 32px;
    text-align: center;
    min-width: 200px;
}

body.dark .loading-content {
    background: #2c2c2e;
}

.loading-spinner-small {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #007AFF;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 16px auto;
}

.loading-text {
    font-size: 16px;
    color: #86868b;
    font-weight: 500;
}
`;

// Add the additional styles to the document
const styleElement = document.createElement('style');
styleElement.textContent = additionalStyles;
document.head.appendChild(styleElement);

// Enhanced notification system with different types
function showNotification(message, type = 'info', duration = 3000) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Add icon based on type
    const icons = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    notification.innerHTML = `
        <span class="notification-icon">${icons[type] || icons.info}</span>
        <span class="notification-text">${message}</span>
    `;
    
    // Enhanced styling
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'error' ? '#FF3B30' : 
                   type === 'success' ? '#30D158' : 
                   type === 'warning' ? '#FF9500' : '#007AFF',
        color: 'white',
        padding: '16px 24px',
        borderRadius: '12px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '10000',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
        maxWidth: '320px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        animation: 'slideDown 0.3s ease',
        backdropFilter: 'blur(10px)'
    });
    
    document.body.appendChild(notification);
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideUp 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, duration);
}

// Enhanced loading overlay
function showLoading(text = 'Loading...') {
    hideLoading(); // Remove any existing loading
    
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner-small"></div>
            <div class="loading-text">${text}</div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// Enhanced card validation with more card types
function getCardInfo(cardNumber) {
    const firstDigit = cardNumber[0];
    const firstTwo = cardNumber.substring(0, 2);
    const firstFour = cardNumber.substring(0, 4);
    const firstSix = cardNumber.substring(0, 6);
    
    let type = 'Unknown';
    let bank = 'Unknown Bank';
    
    // Visa
    if (firstDigit === '4') {
        type = 'Visa';
        bank = 'International Bank';
    }
    // Mastercard
    else if ((firstTwo >= '51' && firstTwo <= '55') || (firstSix >= '222100' && firstSix <= '272099')) {
        type = 'Mastercard';
        bank = 'International Bank';
    }
    // American Express
    else if (['34', '37'].includes(firstTwo)) {
        type = 'American Express';
        bank = 'International Bank';
    }
    // Uzcard
    else if (firstFour === '8600') {
        type = 'Uzcard';
        bank = 'Uzcard Bank';
    }
    // Humo
    else if (firstFour === '9860') {
        type = 'Humo';
        bank = 'Humo Bank';
    }
    // UnionPay
    else if (firstTwo === '62') {
        type = 'UnionPay';
        bank = 'International Bank';
    }
    
    return { type, bank };
}

// Enhanced date formatting with localization
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const langCode = currentUser?.languageCode || 'en';
    
    const translations = {
        'en': { today: 'Today', yesterday: 'Yesterday' },
        'ru': { today: 'Сегодня', yesterday: 'Вчера' },
        'uz': { today: 'Bugun', yesterday: 'Kecha' },
        'kk': { today: 'Бүгін', yesterday: 'Кеше' }
    };
    
    if (diffDays === 0) {
        return translations[langCode].today + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (diffDays === 1) {
        return translations[langCode].yesterday;
    } else if (diffDays < 7) {
        return date.toLocaleDateString(langCode, { weekday: 'long' });
    } else {
        return date.toLocaleDateString(langCode, { 
            month: 'short', 
            day: 'numeric',
            year: diffDays > 365 ? 'numeric' : undefined
        });
    }
}

// Performance optimization - debounce function for input handlers
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to expensive operations
const debouncedRecipientInput = debounce(getRecipientInfo, 500);
const debouncedFeeCalculation = debounce(calculateFee, 300);
        // Global variables
let currentUser = null;
let currentScreen = 'phoneRegistration';
let currentPin = '';
let confirmPin = '';
let loginPin = '';
let otpTimer = 120;
let otpInterval = null;
let sessionTimeout = null;
let userCards = [];
let userTransactions = [];

// Translations
const translations = {
    'ru': {
        'good_morning': 'Доброе утро',
        'good_afternoon': 'Добрый день',
        'good_evening': 'Добрый вечер',
        'good_night': 'Доброй ночи',
        'phone_required': 'Необходимо ввести номер телефона',
        'invalid_phone': 'Неверный формат номера телефона',
        'otp_sent': 'Код отправлен на ваш номер',
        'invalid_otp': 'Неверный код подтверждения',
        'pin_mismatch': 'ПИН-коды не совпадают',
        'invalid_pin': 'Неверный ПИН-код',
        'pin_created': 'ПИН-код успешно создан',
        'login_success': 'Вход выполнен успешно',
        'card_added': 'Карта успешно добавлена'
    },
    'en': {
        'good_morning': 'Good morning',
        'good_afternoon': 'Good afternoon',
        'good_evening': 'Good evening',
        'good_night': 'Good night',
        'phone_required': 'Phone number is required',
        'invalid_phone': 'Invalid phone number format',
        'otp_sent': 'Code sent to your phone',
        'invalid_otp': 'Invalid verification code',
        'pin_mismatch': 'PIN codes do not match',
        'invalid_pin': 'Invalid PIN code',
        'pin_created': 'PIN code created successfully',
        'login_success': 'Login successful',
        'card_added': 'Card added successfully'
    }
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initTelegramWebApp();
    loadUserData();
    checkUserSession();
    updateGreeting();
    loadExchangeRates();
    
    // Set up input formatting
    setupInputFormatting();
    
    // Check if user is already registered
    if (currentUser && currentUser.isVerified) {
        showScreen('loginScreen');
    }
});

// Telegram WebApp integration
function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        // Get user data from Telegram
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const telegramUser = tg.initDataUnsafe.user;
            currentUser = {
                id: telegramUser.id,
                firstName: telegramUser.first_name,
                lastName: telegramUser.last_name,
                username: telegramUser.username,
                photoUrl: telegramUser.photo_url,
                languageCode: telegramUser.language_code || 'en'
            };
            
            // Update profile picture
            if (currentUser.photoUrl) {
                document.getElementById('profileImage').src = currentUser.photoUrl;
            }
            
            // Update user name
            document.getElementById('userName').textContent = 
                `${currentUser.firstName} ${currentUser.lastName || ''}`.trim();
        }
    }
}

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    currentScreen = screenId;
    
    // Reset session timeout for security screens
    if (screenId === 'homeScreen') {
        resetSessionTimeout();
    }
}

function goBack(screenId) {
    showScreen(screenId);
}

// Phone registration
function sendOTP() {
    const phoneNumber = document.getElementById('phoneNumber').value;
    
    if (!phoneNumber) {
        showNotification(translations[currentUser?.languageCode || 'en']['phone_required'], 'error');
        return;
    }
    
    if (!validatePhoneNumber(phoneNumber)) {
        showNotification(translations[currentUser?.languageCode || 'en']['invalid_phone'], 'error');
        return;
    }
    
    // Save phone number
    if (currentUser) {
        currentUser.phoneNumber = '+998' + phoneNumber;
        saveUserData();
    }
    
    // Start OTP timer
    startOTPTimer();
    
    showNotification(translations[currentUser?.languageCode || 'en']['otp_sent'], 'success');
    showScreen('otpVerification');
}

function validatePhoneNumber(phone) {
    // Simple validation for Uzbek phone numbers
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length >= 9;
}

// OTP verification
function handleOTPInput(input, index) {
    const value = input.value;
    
    if (value && /^\d$/.test(value)) {
        input.classList.add('filled');
        
        // Move to next input
        if (index < 5) {
            const nextInput = input.parentNode.children[index + 1];
            nextInput.focus();
        }
        
        // Check if all inputs are filled
        checkOTPComplete();
    } else {
        input.classList.remove('filled');
        input.value = '';
    }
}

function checkOTPComplete() {
    const inputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(inputs).map(input => input.value).join('');
    
    if (otp.length === 6) {
        document.getElementById('confirmOTP').disabled = false;
    } else {
        document.getElementById('confirmOTP').disabled = true;
    }
}

function verifyOTP() {
    const inputs = document.querySelectorAll('.otp-input');
    const otp = Array.from(inputs).map(input => input.value).join('');
    
    // For demo purposes, accept 111111 as valid OTP
    if (otp === '111111') {
        clearInterval(otpInterval);
        showNotification('OTP verified successfully', 'success');
        showScreen('setPinScreen');
    } else {
        showNotification(translations[currentUser?.languageCode || 'en']['invalid_otp'], 'error');
        // Clear inputs
        inputs.forEach(input => {
            input.value = '';
            input.classList.remove('filled');
        });
        inputs[0].focus();
    }
}

function startOTPTimer() {
    otpTimer = 120;
    document.getElementById('resendSection').style.display = 'none';
    
    otpInterval = setInterval(() => {
        const minutes = Math.floor(otpTimer / 60);
        const seconds = otpTimer % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        otpTimer--;
        
        if (otpTimer < 0) {
            clearInterval(otpInterval);
            document.getElementById('resendSection').style.display = 'block';
        }
    }, 1000);
}

function resendCode() {
    startOTPTimer();
    showNotification('New code sent', 'success');
}

// PIN management
function enterPin(digit) {
    if (currentPin.length < 4) {
        currentPin += digit;
        updatePinDots('pinDot', currentPin.length);
        
        if (currentPin.length === 4) {
            document.getElementById('continuePin').disabled = false;
        }
    }
}

function deletePin() {
    if (currentPin.length > 0) {
        currentPin = currentPin.slice(0, -1);
        updatePinDots('pinDot', currentPin.length);
        document.getElementById('continuePin').disabled = currentPin.length !== 4;
    }
}

function updatePinDots(prefix, filledCount) {
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById(prefix + i);
        if (i <= filledCount) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    }
}

function confirmPin() {
    if (confirmPin === '') {
        // First PIN entry
        confirmPin = currentPin;
        currentPin = '';
        updatePinDots('pinDot', 0);
        document.getElementById('continuePin').disabled = true;
        
        // Update UI to show "confirm PIN"
        document.querySelector('#setPinScreen .title').textContent = 'Confirm your PIN';
        document.querySelector('#setPinScreen .subtitle').textContent = 'Please enter your PIN again to confirm';
        
        showNotification('Please confirm your PIN', 'info');
    } else {
        // PIN confirmation
        if (currentPin === confirmPin) {
            // Save PIN
            if (currentUser) {
                currentUser.pin = currentPin;
                currentUser.isVerified = true;
                saveUserData();
            }
            
            showNotification(translations[currentUser?.languageCode || 'en']['pin_created'], 'success');
            showScreen('loginScreen');
        } else {
            showNotification(translations[currentUser?.languageCode || 'en']['pin_mismatch'], 'error');
            
            // Reset PIN process
            currentPin = '';
            confirmPin = '';
            updatePinDots('pinDot', 0);
            document.getElementById('continuePin').disabled = true;
            
            // Reset UI
            document.querySelector('#setPinScreen .title').textContent = 'Create your PIN';
            document.querySelector('#setPinScreen .subtitle').textContent = 'Set up a 4-digit PIN for quick and secure access to your account';
        }
    }
}

// Login PIN
function enterLoginPin(digit) {
    if (loginPin.length < 4) {
        loginPin += digit;
        updatePinDots('loginPinDot', loginPin.length);
        
        if (loginPin.length === 4) {
            setTimeout(verifyLoginPin, 300);
        }
    }
}

function deleteLoginPin() {
    if (loginPin.length > 0) {
        loginPin = loginPin.slice(0, -1);
        updatePinDots('loginPinDot', loginPin.length);
    }
}

function verifyLoginPin() {
    if (currentUser && loginPin === currentUser.pin) {
        showNotification(translations[currentUser.languageCode || 'en']['login_success'], 'success');
        loginPin = '';
        updatePinDots('loginPinDot', 0);
        loadUserCards();
        loadUserTransactions();
        showScreen('homeScreen');
    } else {
        showNotification(translations[currentUser?.languageCode || 'en']['invalid_pin'], 'error');
        loginPin = '';
        updatePinDots('loginPinDot', 0);
        
        // Add shake animation
        const pinDots = document.querySelector('#loginScreen .pin-dots');
        pinDots.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            pinDots.style.animation = '';
        }, 500);
    }
}

function useBiometric() {
    // Simulate biometric authentication
    showNotification('Biometric authentication successful', 'success');
    loadUserCards();
    loadUserTransactions();
    showScreen('homeScreen');
}

function forgotPin() {
    if (confirm('Reset PIN? This will require phone verification again.')) {
        currentUser.isVerified = false;
        currentUser.pin = null;
        saveUserData();
        showScreen('phoneRegistration');
    }
}

// Session management
function resetSessionTimeout() {
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
    }
    
    sessionTimeout = setTimeout(() => {
        showNotification('Session expired for security', 'warning');
        showScreen('loginScreen');
    }, 180000); // 3 minutes
}

// User data management
function loadUserData() {
    const userData = localStorage.getItem('minibank_user');
    if (userData) {
        const savedUser = JSON.parse(userData);
        if (currentUser) {
            Object.assign(currentUser, savedUser);
        } else {
            currentUser = savedUser;
        }
    }
}

function saveUserData() {
    if (currentUser) {
        localStorage.setItem('minibank_user', JSON.stringify(currentUser));
    }
}

function checkUserSession() {
    if (currentUser && currentUser.isVerified) {
        // User is registered, show login screen
        showScreen('loginScreen');
    } else {
        // New user, show registration
        showScreen('phoneRegistration');
    }
}

// Card management
function addCard() {
    document.getElementById('addCardModal').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function saveCard() {
    const cardNumber = document.getElementById('cardNumber').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const cardholderName = document.getElementById('cardholderName').value;
    
    if (!cardNumber || !expiryDate || !cardholderName) {
        showNotification('Please fill all fields', 'error');
        return;
    }
    
    // Validate card number
    const cleanCardNumber = cardNumber.replace(/\s/g, '');
    if (cleanCardNumber.length < 16) {
        showNotification('Invalid card number', 'error');
        return;
    }
    
    // Determine card type and bank
    const cardInfo = getCardInfo(cleanCardNumber);
    
    // Create new card
    const newCard = {
        id: Date.now(),
        number: formatCardNumber(cleanCardNumber),
        holder: cardholderName,
        expiry: expiryDate,
        bank: cardInfo.bank,
        type: cardInfo.type,
        balance: 150000, // Demo balance
        isActive: true
    };
    
    userCards.push(newCard);
    saveUserCards();
    displayCards();
    closeModal('addCardModal');
    
    showNotification(translations[currentUser?.languageCode || 'en']['card_added'], 'success');
    
    // Clear form
    document.getElementById('cardNumber').value = '';
    document.getElementById('expiryDate').value = '';
    document.getElementById('cardholderName').value = '';
}

function getCardInfo(cardNumber) {
    // Simple card type detection
    const firstDigit = cardNumber[0];
    const firstTwo = cardNumber.substring(0, 2);
    const firstFour = cardNumber.substring(0, 4);
    
    let type = 'Unknown';
    let bank = 'Unknown Bank';
    
    // Visa
    if (firstDigit === '4') {
        type = 'Visa';
    }
    // Mastercard
    else if (firstTwo >= '51' && firstTwo <= '55') {
        type = 'Mastercard';
    }
    // Uzcard
    else if (firstFour === '8600') {
        type = 'Uzcard';
        bank = 'Local Bank';
    }
    // Humo
    else if (firstFour === '9860') {
        type = 'Humo';
        bank = 'Local Bank';
    }
    
    return { type, bank };
}

function formatCardNumber(cardNumber) {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function loadUserCards() {
    const cardsData = localStorage.getItem('minibank_cards_' + currentUser.id);
    if (cardsData) {
        userCards = JSON.parse(cardsData);
        displayCards();
    }
}

function saveUserCards() {
    localStorage.setItem('minibank_cards_' + currentUser.id, JSON.stringify(userCards));
}

function displayCards() {
    const container = document.getElementById('cardsContainer');
    
    // Clear existing cards (except add button)
    const existingCards = container.querySelectorAll('.card');
    existingCards.forEach(card => card.remove());
    
    // Add cards
    userCards.forEach(card => {
        const cardElement = createCardElement(card);
        container.insertBefore(cardElement, container.firstChild);
    });
}

function createCardElement(card) {
    const cardDiv = document.createElement('div');
    cardDiv.className = 'card';
    cardDiv.innerHTML = `
        <div class="card-number">${maskCardNumber(card.number)}</div>
        <div class="card-holder">${card.holder}</div>
        <div class="card-balance">${formatCurrency(card.balance)} UZS</div>
    `;
    return cardDiv;
}

function maskCardNumber(cardNumber) {
    const parts = cardNumber.split(' ');
    if (parts.length === 4) {
        return `${parts[0]} **** **** ${parts[3]}`;
    }
    return cardNumber;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US').format(amount);
}

// Transfer functionality
let selectedFromCard = null;
let transferData = {};
let confirmTransferPin = '';

// Send money function
function sendMoney() {
    if (userCards.length === 0) {
        showNotification('Please add a card first', 'error');
        return;
    }
    
    // Reset transfer data
    transferData = {};
    selectedFromCard = null;
    document.getElementById('recipientCard').value = '';
    document.getElementById('transferAmount').value = '';
    document.getElementById('recipientInfo').style.display = 'none';
    document.getElementById('feeInfo').style.display = 'none';
    document.getElementById('continueTransfer').disabled = true;
    
    // Update from card selector to show first card
    if (userCards.length > 0) {
        selectCard(userCards[0]);
    }
    
    showScreen('transferScreen');
}

function selectFromCard() {
    if (userCards.length === 0) {
        showNotification('No cards available', 'error');
        return;
    }
    
    // Populate cards list
    const cardsList = document.getElementById('cardsList');
    cardsList.innerHTML = '';
    
    userCards.forEach(card => {
        const cardOption = document.createElement('div');
        cardOption.className = `card-option ${selectedFromCard && selectedFromCard.id === card.id ? 'selected' : ''}`;
        cardOption.onclick = () => selectCard(card);
        
        cardOption.innerHTML = `
            <div class="card-option-icon">${card.type.substring(0, 4)}</div>
            <div class="card-option-details">
                <div class="card-option-number">${maskCardNumber(card.number)}</div>
                <div class="card-option-balance">${formatCurrency(card.balance)} UZS</div>
            </div>
        `;
        
        cardsList.appendChild(cardOption);
    });
    
    document.getElementById('selectCardModal').classList.add('active');
}

function selectCard(card) {
    selectedFromCard = card;
    transferData.fromCard = card;
    
    // Update UI
    document.getElementById('fromCardName').textContent = maskCardNumber(card.number);
    document.getElementById('fromCardBalance').textContent = `Balance: ${formatCurrency(card.balance)} UZS`;
    
    closeModal('selectCardModal');
    checkTransferForm();
}

function handleRecipientInput(input) {
    const value = input.value.replace(/\s/g, '');
    
    // Format card number
    let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    input.value = formattedValue;
    
    if (value.length >= 6) {
        // Show recipient info
        getRecipientInfo(value);
    } else {
        document.getElementById('recipientInfo').style.display = 'none';
        transferData.toCard = null;
        checkTransferForm();
    }
}

function getRecipientInfo(cardNumber) {
    // Simulate API call to get recipient info
    setTimeout(() => {
        const cardInfo = getCardInfo(cardNumber);
        const recipientNames = ['John Smith', 'Sarah Johnson', 'Mike Wilson', 'Emma Davis', 'Alex Brown'];
        const recipientName = recipientNames[Math.abs(hashCode(cardNumber)) % recipientNames.length];
        
        transferData.toCard = {
            number: cardNumber,
            holder: recipientName,
            bank: cardInfo.bank,
            type: cardInfo.type
        };
        
        // Update UI
        document.getElementById('recipientName').textContent = recipientName;
        document.getElementById('recipientBank').textContent = `${cardInfo.bank} • ${cardInfo.type}`;
        document.getElementById('recipientAvatar').textContent = recipientName.split(' ').map(n => n[0]).join('');
        document.getElementById('recipientInfo').style.display = 'flex';
        
        checkTransferForm();
    }, 500);
}

function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

function calculateFee() {
    const amount = parseFloat(document.getElementById('transferAmount').value) || 0;
    
    if (amount > 0) {
        const fee = Math.max(amount * 0.01, 1000); // 1% fee, minimum 1000 UZS
        const total = amount + fee;
        
        transferData.amount = amount;
        transferData.fee = fee;
        transferData.total = total;
        
        // Update UI
        document.getElementById('transferAmountDisplay').textContent = formatCurrency(amount) + ' UZS';
        document.getElementById('feeAmount').textContent = formatCurrency(fee) + ' UZS';
        document.getElementById('totalAmount').textContent = formatCurrency(total) + ' UZS';
        document.getElementById('feeInfo').style.display = 'block';
        
        // Check if user has sufficient balance
        if (selectedFromCard && selectedFromCard.balance < total) {
            showNotification('Insufficient balance', 'error');
            document.getElementById('continueTransfer').disabled = true;
            return;
        }
    } else {
        document.getElementById('feeInfo').style.display = 'none';
        transferData.amount = 0;
        transferData.fee = 0;
        transferData.total = 0;
    }
    
    checkTransferForm();
}

function checkTransferForm() {
    const hasFromCard = selectedFromCard !== null;
    const hasToCard = transferData.toCard !== null;
    const hasAmount = transferData.amount > 0;
    const hasSufficientBalance = selectedFromCard && transferData.total <= selectedFromCard.balance;
    
    document.getElementById('continueTransfer').disabled = !(hasFromCard && hasToCard && hasAmount && hasSufficientBalance);
}

function reviewTransfer() {
    if (!selectedFromCard || !transferData.toCard || !transferData.amount) {
        showNotification('Please complete all fields', 'error');
        return;
    }
    
    // Update confirmation screen
    document.getElementById('confirmAmount').textContent = formatCurrency(transferData.amount) + ' UZS';
    
    // Update from card info
    const fromCardEl = document.getElementById('confirmFromCard');
    fromCardEl.innerHTML = `
        <span class="card-number">${maskCardNumber(selectedFromCard.number)}</span>
        <span class="card-type">Available</span>
        <span class="balance">${formatCurrency(selectedFromCard.balance)} UZS</span>
    `;
    
    // Update recipient info
    const recipientEl = document.getElementById('confirmRecipient');
    recipientEl.innerHTML = `
        <div class="recipient-avatar-small">${transferData.toCard.holder.split(' ').map(n => n[0]).join('')}</div>
        <div class="recipient-info-small">
            <div class="recipient-name-small">${transferData.toCard.holder}</div>
            <div class="recipient-email">${maskCardNumber(transferData.toCard.number)}</div>
        </div>
        <div class="verified-badge">✓</div>
    `;
    
    // Update transaction details
    document.getElementById('confirmTransferAmount').textContent = formatCurrency(transferData.amount) + ' UZS';
    document.getElementById('confirmFee').textContent = formatCurrency(transferData.fee) + ' UZS';
    document.getElementById('confirmTotal').textContent = formatCurrency(transferData.total) + ' UZS';
    
    showScreen('transferConfirm');
}

function confirmWithPin() {
    confirmTransferPin = '';
    updatePinDots('confirmPinDot', 0);
    document.getElementById('pinConfirmModal').classList.add('active');
}

function enterConfirmPin(digit) {
    if (confirmTransferPin.length < 4) {
        confirmTransferPin += digit;
        updatePinDots('confirmPinDot', confirmTransferPin.length);
        
        if (confirmTransferPin.length === 4) {
            setTimeout(verifyTransferPin, 300);
        }
    }
}

function deleteConfirmPin() {
    if (confirmTransferPin.length > 0) {
        confirmTransferPin = confirmTransferPin.slice(0, -1);
        updatePinDots('confirmPinDot', confirmTransferPin.length);
    }
}

function verifyTransferPin() {
    if (currentUser && confirmTransferPin === currentUser.pin) {
        closeModal('pinConfirmModal');
        processTransfer();
    } else {
        showNotification(translations[currentUser?.languageCode || 'en']['invalid_pin'], 'error');
        confirmTransferPin = '';
        updatePinDots('confirmPinDot', 0);
        
        // Add shake animation
        const pinDots = document.querySelector('#pinConfirmModal .pin-dots');
        pinDots.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            pinDots.style.animation = '';
        }, 500);
    }
}

function processTransfer() {
    // Generate transaction ID
    const transactionId = 'TXN' + Date.now().toString().slice(-8);
    
    // Update processing screen
    document.getElementById('processingAmount').textContent = formatCurrency(transferData.amount) + ' UZS';
    document.getElementById('processingRecipient').textContent = transferData.toCard.holder;
    document.getElementById('processingId').textContent = transactionId;
    
    showScreen('transferProcessing');
    
    // Simulate processing steps
    const steps = [
        'Initializing transfer...',
        'Verifying recipient...',
        'Processing payment...',
        'Updating balances...',
        'Transfer completed!'
    ];
    
    let currentStep = 0;
    const progressBar = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    const interval = setInterval(() => {
        currentStep++;
        const progress = (currentStep / steps.length) * 100;
        
        progressBar.style.width = progress + '%';
        progressText.textContent = steps[currentStep - 1] || 'Completed!';
        
        if (currentStep >= steps.length) {
            clearInterval(interval);
            setTimeout(() => {
                completeTransfer(transactionId);
            }, 1000);
        }
    }, 1000);
}

function completeTransfer(transactionId) {
    // Update user's card balance
    selectedFromCard.balance -= transferData.total;
    saveUserCards();
    
    // Add transaction to history
    const transaction = {
        id: Date.now(),
        transactionId: transactionId,
        name: transferData.toCard.holder,
        amount: -transferData.amount,
        fee: transferData.fee,
        date: new Date().toISOString(),
        type: 'transfer',
        status: 'completed'
    };
    
    userTransactions.unshift(transaction);
    saveUserTransactions();
    
    // Update success screen
    document.getElementById('successAmount').textContent = formatCurrency(transferData.amount) + ' UZS';
    document.getElementById('successAvatar').textContent = transferData.toCard.holder.split(' ').map(n => n[0]).join('');
    document.getElementById('successRecipientName').textContent = transferData.toCard.holder;
    document.getElementById('successRecipientId').textContent = maskCardNumber(transferData.toCard.number);
    document.getElementById('successFee').textContent = formatCurrency(transferData.fee) + ' UZS';
    document.getElementById('successTax').textContent = '0 UZS';
    document.getElementById('successTransactionId').textContent = transactionId;
    
    showScreen('transferComplete');
    
    // Update home screen data
    displayCards();
    displayRecentTransfers();
}

function downloadReceipt() {
    // Simulate receipt download
    showNotification('Receipt downloaded successfully', 'success');
    
    // In a real app, this would generate and download a PDF receipt
    const receiptData = {
        transactionId: document.getElementById('successTransactionId').textContent,
        amount: transferData.amount,
        fee: transferData.fee,
        recipient: transferData.toCard.holder,
        date: new Date().toLocaleString(),
        fromCard: maskCardNumber(selectedFromCard.number),
        toCard: maskCardNumber(transferData.toCard.number)
    };
    
    console.log('Receipt data:', receiptData);
}

function sendAgain() {
    // Pre-fill the transfer form with the same recipient
    document.getElementById('recipientCard').value = formatCardNumber(transferData.toCard.number);
    document.getElementById('transferAmount').value = '';
    
    // Trigger recipient lookup
    handleRecipientInput(document.getElementById('recipientCard'));
    
    showScreen('transferScreen');
}

function goHome() {
    showScreen('homeScreen');
    
    // Reset transfer data
    transferData = {};
    selectedFromCard = null;
    confirmTransferPin = '';
}

function loadUserTransactions() {
    const transactionsData = localStorage.getItem('minibank_transactions_' + currentUser.id);
    if (transactionsData) {
        userTransactions = JSON.parse(transactionsData);
        displayRecentTransfers();
    } else {
        // Add demo transactions
        userTransactions = [
            {
                id: 1,
                name: 'Sarah Wilson',
                amount: -2500,
                date: new Date(Date.now() - 86400000).toISOString(),
                type: 'transfer'
            },
            {
                id: 2,
                name: 'Mike Chen',
                amount: 1850,
                date: new Date(Date.now() - 172800000).toISOString(),
                type: 'receive'
            },
            {
                id: 3,
                name: 'Emma Davis',
                amount: -580,
                date: new Date(Date.now() - 259200000).toISOString(),
                type: 'transfer'
            }
        ];
        saveUserTransactions();
        displayRecentTransfers();
    }
}

function saveUserTransactions() {
    localStorage.setItem('minibank_transactions_' + currentUser.id, JSON.stringify(userTransactions));
}

function displayRecentTransfers() {
    const container = document.getElementById('transfersList');
    container.innerHTML = '';
    
    // Show last 3 transactions
    const recentTransactions = userTransactions.slice(0, 3);
    
    recentTransactions.forEach(transaction => {
        const transferDiv = document.createElement('div');
        transferDiv.className = 'transfer-item';
        transferDiv.innerHTML = `
            <div class="transfer-avatar">${transaction.name.charAt(0)}</div>
            <div class="transfer-info">
                <div class="transfer-name">${transaction.name}</div>
                <div class="transfer-date">${formatDate(transaction.date)}</div>
            </div>
            <div class="transfer-amount ${transaction.amount > 0 ? 'positive' : 'negative'}">
                ${transaction.amount > 0 ? '+' : ''}${formatCurrency(Math.abs(transaction.amount))} UZS
            </div>
        `;
        container.appendChild(transferDiv);
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
        return 'Today ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else {
        return date.toLocaleDateString();
    }
}

// Exchange rates
function loadExchangeRates() {
    // Demo exchange rates - in real app, fetch from API
    const rates = [
        { pair: 'RUB/UZS', value: 130.25 },
        { pair: 'USD/RUB', value: 92.15 },
        { pair: 'USD/UZS', value: 12000.00 }
    ];
    
    displayExchangeRates(rates);
}

function displayExchangeRates(rates) {
    const container = document.getElementById('ratesList');
    container.innerHTML = '';
    
    rates.forEach(rate => {
        const rateDiv = document.createElement('div');
        rateDiv.className = 'rate-item';
        rateDiv.innerHTML = `
            <div class="rate-pair">${rate.pair}</div>
            <div class="rate-value">${formatCurrency(rate.value)}</div>
        `;
        container.appendChild(rateDiv);
    });
}

// Navigation
function switchTab(tab) {
    // Update navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
    
    // Handle tab switching logic
    switch(tab) {
        case 'home':
            showScreen('homeScreen');
            break;
        case 'transfers':
            sendMoney();
            break;
        case 'history':
            showNotification('History feature will be available soon', 'info');
            break;
        case 'profile':
            showNotification('Profile feature will be available soon', 'info');
            break;
    }
}

function showAllCards() {
    showNotification('View all cards feature will be available soon', 'info');
}

function showAllHistory() {
    showNotification('Full history feature will be available soon', 'info');
}

// Utility functions
function updateGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting = 'Good morning';
    
    const lang = currentUser?.languageCode || 'en';
    
    if (hour >= 5 && hour < 12) {
        greeting = translations[lang]['good_morning'] || 'Good morning';
    } else if (hour >= 12 && hour < 17) {
        greeting = translations[lang]['good_afternoon'] || 'Good afternoon';
    } else if (hour >= 17 && hour < 22) {
        greeting = translations[lang]['good_evening'] || 'Good evening';
    } else {
        greeting = translations[lang]['good_night'] || 'Good night';
    }
    
    const greetingElement = document.getElementById('greetingText');
    if (greetingElement) {
        greetingElement.textContent = greeting;
    }
}

function setupInputFormatting() {
    // Phone number formatting
    const phoneInput = document.getElementById('phoneNumber');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            let formattedValue = '';
            
            if (value.length > 0) {
                if (value.length <= 2) {
                    formattedValue = `(${value}`;
                } else if (value.length <= 5) {
                    formattedValue = `(${value.substring(0, 2)}) ${value.substring(2)}`;
                } else {
                    formattedValue = `(${value.substring(0, 2)}) ${value.substring(2, 5)}-${value.substring(5, 9)}`;
                }
            }
            
            e.target.value = formattedValue;
        });
        
        // Handle backspace properly
        phoneInput.addEventListener('keydown', function(e) {
            if (e.key === 'Backspace') {
                const value = e.target.value;
                const cursorPos = e.target.selectionStart;
                
                // If cursor is at a formatting character, move it back
                if (cursorPos > 0 && ['(', ')', ' ', '-'].includes(value[cursorPos - 1])) {
                    setTimeout(() => {
                        e.target.setSelectionRange(cursorPos - 1, cursorPos - 1);
                    }, 0);
                }
            }
        });
    }
    
    // Card number formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
            e.target.value = value;
            
            // Show card info if valid
            if (value.replace(/\s/g, '').length >= 6) {
                const cardInfo = getCardInfo(value.replace(/\s/g, ''));
                document.getElementById('bankName').textContent = cardInfo.bank;
                document.getElementById('cardType').textContent = cardInfo.type;
                document.getElementById('cardInfo').style.display = 'block';
            } else {
                document.getElementById('cardInfo').style.display = 'none';
            }
        });
    }
    
    // Expiry date formatting
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = `${value.substring(0, 2)}/${value.substring(2, 4)}`;
            }
            e.target.value = value;
        });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: type === 'error' ? '#FF3B30' : type === 'success' ? '#30D158' : type === 'warning' ? '#FF9500' : '#007AFF',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        zIndex: '9999',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        maxWidth: '320px',
        textAlign: 'center',
        animation: 'slideDown 0.3s ease'
    });
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    
    @keyframes slideUp {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
    
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Dark theme toggle
function toggleTheme() {
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('minibank_theme', isDark ? 'dark' : 'light');
}

// Load theme preference
const savedTheme = localStorage.getItem('minibank_theme');
if (savedTheme === 'dark') {
    document.body.classList.add('dark');
}

// Prevent context menu on long press (mobile)
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    return false;
});

// Handle orientation change
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        window.scrollTo(0, 0);
    }, 100);
});

// Auto-save user activity
setInterval(() => {
    if (currentUser) {
        currentUser.lastActivity = new Date().toISOString();
        saveUserData();
    }
}, 30000); // Save every 30 seconds
