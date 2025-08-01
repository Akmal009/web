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

// Transfers and transactions
function sendMoney() {
    // This will be implemented in next stages
    showNotification('Send Money feature will be available soon', 'info');
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
            // Already on home screen
            break;
        case 'transfers':
            showNotification('Transfers feature will be available soon', 'info');
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
            if (value.length >= 2) {
                value = `(${value.substring(0, 2)}) ${value.substring(2, 5)}-${value.substring(5, 9)}`;
            }
            e.target.value = value;
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