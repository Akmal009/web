// Telegram Web App initialization
let tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// Global state
let currentPin = '';
let confirmPin = '';
let userPhone = '';
let currentLanguage = 'ru';
let otpTimer = null;
let sessionTimeout = null;

// Translations
const translations = {
    ru: {
        create_account: 'Создать аккаунт',
        phone_subtitle: 'Введите ваш номер телефона, чтобы начать использовать безопасные платежи',
        phone_number: 'Номер телефона',
        verification_info: 'Мы отправим вам код подтверждения для подтверждения вашего номера. Могут применяться стандартные тарифы на сообщения.',
        next: 'Далее',
        terms_text: 'Продолжая, вы соглашаетесь с нашими ',
        terms_service: 'Условиями использования',
        privacy_policy: 'Политикой конфиденциальности',
        enter_code: 'Введите код',
        code_sent: 'Мы отправили 6-значный код на ваш номер телефона. Пожалуйста, введите его ниже для подтверждения вашего аккаунта.',
        confirm: 'Подтвердить',
        code_expires: 'Код истекает через',
        no_code: 'Не получили код?',
        resend_code: 'Отправить повторно',
        create_pin: 'Создайте ваш PIN',
        pin_subtitle: 'Установите 4-значный PIN для быстрого и безопасного доступа к вашему аккаунту',
        continue: 'Продолжить',
        confirm_pin: 'Подтвердите ваш PIN',
        confirm_pin_subtitle: 'Пожалуйста, введите ваш PIN еще раз для подтверждения',
        secure_login: 'Безопасный вход',
        enter_pin: 'Введите ваш 4-значный PIN',
        use_touch_id: 'Использовать Touch ID',
        forgot_pin: 'Забыли PIN?',
        error: 'Ошибка',
        ok: 'ОК',
        pin_mismatch: 'PIN коды не совпадают. Попробуйте еще раз.',
        invalid_phone: 'Пожалуйста, введите действительный номер телефона',
        invalid_otp: 'Неверный код. Попробуйте еще раз.',
        wrong_pin: 'Неверный PIN. Попробуйте еще раз.'
    },
    uz: {
        create_account: 'Hisob yaratish',
        phone_subtitle: 'Xavfsiz to\'lovlarni boshlash uchun telefon raqamingizni kiriting',
        phone_number: 'Telefon raqami',
        verification_info: 'Raqamingizni tasdiqlash uchun tasdiqlash kodini yuboramiz. Standart xabar tariflari qo\'llanishi mumkin.',
        next: 'Keyingi',
        terms_text: 'Davom etish orqali siz bizning ',
        terms_service: 'Foydalanish shartlari',
        privacy_policy: 'Maxfiylik siyosati',
        enter_code: 'Kodni kiriting',
        code_sent: 'Telefon raqamingizga 6 raqamli kod yubordik. Hisobingizni tasdiqlash uchun uni quyida kiriting.',
        confirm: 'Tasdiqlash',
        code_expires: 'Kod muddati tugaydi',
        no_code: 'Kod kelmadimi?',
        resend_code: 'Qayta yuborish',
        create_pin: 'PIN kodni yarating',
        pin_subtitle: 'Hisobingizga tez va xavfsiz kirish uchun 4 raqamli PIN kodni o\'rnating',
        continue: 'Davom etish',
        confirm_pin: 'PIN kodni tasdiqlang',
        confirm_pin_subtitle: 'Tasdiqlash uchun PIN kodni yana kiriting',
        secure_login: 'Xavfsiz kirish',
        enter_pin: '4 raqamli PIN kodni kiriting',
        use_touch_id: 'Touch ID ishlatish',
        forgot_pin: 'PIN kodni unutdingizmi?',
        error: 'Xato',
        ok: 'OK',
        pin_mismatch: 'PIN kodlar mos kelmaydi. Qaytadan urinib ko\'ring.',
        invalid_phone: 'Iltimos, to\'g\'ri telefon raqamini kiriting',
        invalid_otp: 'Noto\'g\'ri kod. Qaytadan urinib ko\'ring.',
        wrong_pin: 'Noto\'g\'ri PIN. Qaytadan urinib ko\'ring.'
    },
    en: {
        create_account: 'Create Account',
        phone_subtitle: 'Enter your phone number to get started with secure payments',
        phone_number: 'Phone Number',
        verification_info: 'We\'ll send you a verification code to confirm your number. Standard message rates may apply.',
        next: 'Next',
        terms_text: 'By continuing, you agree to our ',
        terms_service: 'Terms of Service',
        privacy_policy: 'Privacy Policy',
        enter_code: 'Enter the code',
        code_sent: 'We\'ve sent a 6-digit code to your phone number. Please enter it below to verify your account.',
        confirm: 'Confirm',
        code_expires: 'Code expires in',
        no_code: 'Didn\'t receive the code?',
        resend_code: 'Resend Code',
        create_pin: 'Create your PIN',
        pin_subtitle: 'Set up a 4-digit PIN for quick and secure access to your account',
        continue: 'Continue',
        confirm_pin: 'Confirm your PIN',
        confirm_pin_subtitle: 'Please enter your PIN again to confirm',
        secure_login: 'Secure Login',
        enter_pin: 'Enter your 4-digit PIN',
        use_touch_id: 'Use Touch ID',
        forgot_pin: 'Forgot PIN?',
        error: 'Error',
        ok: 'OK',
        pin_mismatch: 'PIN codes don\'t match. Please try again.',
        invalid_phone: 'Please enter a valid phone number',
        invalid_otp: 'Invalid code. Please try again.',
        wrong_pin: 'Wrong PIN. Please try again.'
    },
    kz: {
        create_account: 'Есептік жазба құру',
        phone_subtitle: 'Қауіпсіз төлемдерді бастау үшін телефон нөміріңізді енгізіңіз',
        phone_number: 'Телефон нөмірі',
        verification_info: 'Нөміріңізді растау үшін растау кодын жібереміз. Стандартты хабарлама тарифтері қолданылуы мүмкін.',
        next: 'Келесі',
        terms_text: 'Жалғастыру арқылы сіз біздің ',
        terms_service: 'Қызмет көрсету шарттарымызбен',
        privacy_policy: 'Құпиялылық саясатымызбен',
        enter_code: 'Кодты енгізіңіз',
        code_sent: 'Телефон нөміріңізге 6 цифрлы код жібердік. Есептік жазбаңызды растау үшін оны төменде енгізіңіз.',
        confirm: 'Растау',
        code_expires: 'Код мерзімі бітеді',
        no_code: 'Код келмеді ме?',
        resend_code: 'Қайта жіберу',
        create_pin: 'PIN кодыңызды құрыңыз',
        pin_subtitle: 'Есептік жазбаңызға жылдам және қауіпсіз кіру үшін 4 цифрлы PIN код орнатыңыз',
        continue: 'Жалғастыру',
        confirm_pin: 'PIN кодыңызды растаңыз',
        confirm_pin_subtitle: 'Растау үшін PIN кодыңызды қайта енгізіңіз',
        secure_login: 'Қауіпсіз кіру',
        enter_pin: '4 цифрлы PIN кодыңызды енгізіңіз',
        use_touch_id: 'Touch ID пайдалану',
        forgot_pin: 'PIN кодты ұмыттыңыз ба?',
        error: 'Қате',
        ok: 'ОК',
        pin_mismatch: 'PIN кодтар сәйкес келмейді. Қайталап көріңіз.',
        invalid_phone: 'Дұрыс телефон нөмірін енгізіңіз',
        invalid_otp: 'Жарамсыз код. Қайталап көріңіз.',
        wrong_pin: 'Қате PIN. Қайталап көріңіз.'
    }
};

// Utility functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

function showError(message) {
    document.getElementById('error-message').textContent = message;
    document.getElementById('error-modal').classList.remove('hidden');
}

function hideError() {
    document.getElementById('error-modal').classList.add('hidden');
}

function translatePage() {
    document.querySelectorAll('[data-translate]').forEach(element => {
        const key = element.getAttribute('data-translate');
        if (translations[currentLanguage] && translations[currentLanguage][key]) {
            element.textContent = translations[currentLanguage][key];
        }
    });
}

function formatPhoneNumber(value) {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format based on length
    if (digits.length <= 3) {
        return digits;
    } else if (digits.length <= 6) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else if (digits.length <= 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    } else {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
}

function validatePhoneNumber(phone) {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 10;
}

function startOtpTimer() {
    let timeLeft = 120; // 2 minutes
    const timerElement = document.getElementById('otp-timer');
    const resendBtn = document.getElementById('resend-btn');
    
    resendBtn.disabled = true;
    
    otpTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(otpTimer);
            resendBtn.disabled = false;
        }
        
        timeLeft--;
    }, 1000);
}

function resetSessionTimeout() {
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
    }
    
    sessionTimeout = setTimeout(() => {
        // Show login screen after 3 minutes of inactivity
        showScreen('login-pin');
        clearPinDisplay();
    }, 180000); // 3 minutes
}

function clearPinDisplay() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach(dot => {
        dot.classList.remove('filled', 'error');
    });
}

function updatePinDisplay(pin, container = '.pin-display') {
    const dots = document.querySelectorAll(`${container} .pin-dot`);
    dots.forEach((dot, index) => {
        if (index < pin.length) {
            dot.classList.add('filled');
            dot.classList.remove('error');
        } else {
            dot.classList.remove('filled', 'error');
        }
    });
}

function showPinError() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach(dot => {
        dot.classList.add('error');
    });
    setTimeout(() => {
        dots.forEach(dot => {
            dot.classList.remove('error');
        });
    }, 500);
}

// Initialize the app
function initializeApp() {
    // Get language from Telegram user
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const telegramUser = tg.initDataUnsafe.user;
        currentLanguage = telegramUser.language_code || 'ru';
        
        // Map telegram language codes
        if (currentLanguage === 'uz') currentLanguage = 'uz';
        else if (currentLanguage === 'kk') currentLanguage = 'kz';
        else if (currentLanguage === 'en') currentLanguage = 'en';
        else currentLanguage = 'ru';
    }
    
    translatePage();
    
    // Check if user is already registered
    const userData = localStorage.getItem('minibank_user');
    if (userData) {
        const user = JSON.parse(userData);
        if (user.isRegistered) {
            showScreen('login-pin');
            return;
        }
    }
    
    showScreen('phone-registration');
}

// Phone Registration Screen
document.getElementById('phone-input').addEventListener('input', function(e) {
    const formatted = formatPhoneNumber(e.target.value);
    e.target.value = formatted;
    
    const nextBtn = document.getElementById('phone-next-btn');
    if (validatePhoneNumber(formatted)) {
        nextBtn.classList.remove('disabled');
    } else {
        nextBtn.classList.add('disabled');
    }
});

document.getElementById('phone-next-btn').addEventListener('click', function() {
    if (this.classList.contains('disabled')) return;
    
    const phone = document.getElementById('phone-input').value;
    if (!validatePhoneNumber(phone)) {
        showError(translations[currentLanguage].invalid_phone);
        return;
    }
    
    userPhone = phone;
    showScreen('otp-verification');
    startOtpTimer();
});

// OTP Verification Screen
document.getElementById('otp-back-btn').addEventListener('click', function() {
    if (otpTimer) clearInterval(otpTimer);
    showScreen('phone-registration');
});

// OTP Input handling
const otpInputs = document.querySelectorAll('.otp-input');
otpInputs.forEach((input, index) => {
    input.addEventListener('input', function(e) {
        const value = e.target.value;
        
        if (value && index < otpInputs.length - 1) {
            otpInputs[index + 1].focus();
        }
        
        if (value) {
            this.classList.add('filled');
        } else {
            this.classList.remove('filled');
        }
        
        // Check if all inputs are filled
        let otp = '';
        otpInputs.forEach(inp => otp += inp.value);
        
        const confirmBtn = document.getElementById('otp-confirm-btn');
        if (otp.length === 6) {
            confirmBtn.classList.remove('disabled');
        } else {
            confirmBtn.classList.add('disabled');
        }
    });
    
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && !this.value && index > 0) {
            otpInputs[index - 1].focus();
        }
    });
});

document.getElementById('otp-confirm-btn').addEventListener('click', function() {
    if (this.classList.contains('disabled')) return;
    
    let otp = '';
    otpInputs.forEach(inp => otp += inp.value);
    
    // For demo, accept 111111 as valid OTP
    if (otp === '111111') {
        if (otpTimer) clearInterval(otpTimer);
        showScreen('set-pin');
    } else {
        showError(translations[currentLanguage].invalid_otp);
        // Clear OTP inputs
        otpInputs.forEach(inp => {
            inp.value = '';
            inp.classList.remove('filled');
        });
        document.getElementById('otp-confirm-btn').classList.add('disabled');
    }
});

document.getElementById('resend-btn').addEventListener('click', function() {
    if (this.disabled) return;
    startOtpTimer();
});

// Set PIN Screen
document.getElementById('pin-back-btn').addEventListener('click', function() {
    showScreen('otp-verification');
});

// PIN Keypad handling
function setupPinKeypad(screenPrefix) {
    const keypadButtons = document.querySelectorAll(`#${screenPrefix} .key-btn`);
    const deleteBtn = document.getElementById(`${screenPrefix}-delete`);
    const continueBtn = document.getElementById(`${screenPrefix}-continue-btn`) || 
                       document.getElementById(`${screenPrefix}-btn`);
    
    keypadButtons.forEach(btn => {
        if (!btn.classList.contains('empty') && !btn.classList.contains('delete-btn')) {
            btn.addEventListener('click', function() {
                const key = this.getAttribute('data-key');
                if (key && currentPin.length < 4) {
                    currentPin += key;
                    updatePinDisplay(currentPin, `#${screenPrefix} .pin-display`);
                    
                    if (currentPin.length === 4 && continueBtn) {
                        continueBtn.classList.remove('disabled');
                    }
                }
            });
        }
    });
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (currentPin.length > 0) {
                currentPin = currentPin.slice(0, -1);
                updatePinDisplay(currentPin, `#${screenPrefix} .pin-display`);
                
                if (continueBtn) {
                    continueBtn.classList.add('disabled');
                }
            }
        });
    }
}

// Setup PIN screens
setupPinKeypad('set-pin');

document.getElementById('pin-continue-btn').addEventListener('click', function() {
    if (this.classList.contains('disabled') || currentPin.length !== 4) return;
    
    // Store the first PIN for confirmation
    confirmPin = currentPin;
    currentPin = '';
    clearPinDisplay();
    showScreen('confirm-pin');
});

// Confirm PIN Screen
document.getElementById('confirm-pin-back-btn').addEventListener('click', function() {
    currentPin = '';
    confirmPin = '';
    clearPinDisplay();
    showScreen('set-pin');
});

setupPinKeypad('confirm-pin');

document.getElementById('confirm-pin-btn').addEventListener('click', function() {
    if (this.classList.contains('disabled') || currentPin.length !== 4) return;
    
    if (currentPin === confirmPin) {
        // Save user data
        const userData = {
            phone: userPhone,
            pin: currentPin,
            isRegistered: true,
            language: currentLanguage,
            registeredAt: new Date().toISOString()
        };
        
        // In a real app, this would be sent to the server
        localStorage.setItem('minibank_user', JSON.stringify(userData));
        
        currentPin = '';
        confirmPin = '';
        clearPinDisplay();
        
        // Go to login screen to test the PIN
        showScreen('login-pin');
    } else {
        showError(translations[currentLanguage].pin_mismatch);
        showPinError();
        currentPin = '';
        clearPinDisplay();
        document.getElementById('confirm-pin-btn').classList.add('disabled');
    }
});

// Login PIN Screen
setupPinKeypad('login-pin');

document.getElementById('login-pin').addEventListener('click', function() {
    // Auto-focus for PIN entry, reset session timeout
    resetSessionTimeout();
});

// Handle login PIN verification
document.addEventListener('click', function(e) {
    if (e.target.closest('#login-pin .key-btn') && !e.target.classList.contains('empty')) {
        const key = e.target.getAttribute('data-key');
        if (key && currentPin.length < 4) {
            currentPin += key;
            updatePinDisplay(currentPin, '#login-pin .pin-display');
            
            if (currentPin.length === 4) {
                // Verify PIN
                const userData = JSON.parse(localStorage.getItem('minibank_user') || '{}');
                
                setTimeout(() => {
                    if (currentPin === userData.pin) {
                        // Successful login
                        currentPin = '';
                        clearPinDisplay();
                        
                        // Here you would navigate to the main app
                        // For now, we'll show a success message
                        alert(translations[currentLanguage].ok + '! ' + 'Login successful');
                        
                        // Reset session timeout
                        resetSessionTimeout();
                        
                        // In the next phases, this would go to the home screen
                    } else {
                        // Wrong PIN
                        showError(translations[currentLanguage].wrong_pin);
                        showPinError();
                        currentPin = '';
                        clearPinDisplay();
                    }
                }, 500); // Small delay for better UX
            }
        }
    }
});

// Delete button for login PIN
document.getElementById('login-pin-delete').addEventListener('click', function() {
    if (currentPin.length > 0) {
        currentPin = currentPin.slice(0, -1);
        updatePinDisplay(currentPin, '#login-pin .pin-display');
    }
});

// Biometric login (placeholder)
document.getElementById('use-biometric').addEventListener('click', function() {
    // In a real app, this would trigger biometric authentication
    alert('Biometric authentication not available in demo');
});

// Forgot PIN
document.getElementById('forgot-pin').addEventListener('click', function() {
    // Reset user data and go back to phone registration
    localStorage.removeItem('minibank_user');
    currentPin = '';
    confirmPin = '';
    userPhone = '';
    clearPinDisplay();
    
    // Clear phone input
    document.getElementById('phone-input').value = '';
    document.getElementById('phone-next-btn').classList.add('disabled');
    
    showScreen('phone-registration');
});

// Error modal
document.getElementById('error-ok-btn').addEventListener('click', hideError);

// Theme switching (for future use)
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('minibank_theme', document.body.classList.contains('dark-theme') ? 'dark' : 'light');
}

// Load saved theme
function loadTheme() {
    const savedTheme = localStorage.getItem('minibank_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
}

// Activity tracking for session timeout
let activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

activityEvents.forEach(event => {
    document.addEventListener(event, () => {
        const currentScreen = document.querySelector('.screen:not(.hidden)');
        // Only reset timeout if we're not on login or registration screens
        if (currentScreen && !['phone-registration', 'otp-verification', 'set-pin', 'confirm-pin', 'login-pin'].includes(currentScreen.id)) {
            resetSessionTimeout();
        }
    }, true);
});

// Telegram Web App specific functions
if (tg) {
    // Handle theme changes from Telegram
    tg.onEvent('themeChanged', function() {
        if (tg.colorScheme === 'dark') {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }
    });
    
    // Set initial theme based on Telegram
    if (tg.colorScheme === 'dark') {
        document.body.classList.add('dark-theme');
    }
    
    // Handle main button (if needed in future phases)
    tg.MainButton.hide();
    
    // Handle back button
    tg.BackButton.hide();
}

// Auto-format and validate phone number on paste
document.getElementById('phone-input').addEventListener('paste', function(e) {
    setTimeout(() => {
        const formatted = formatPhoneNumber(e.target.value);
        e.target.value = formatted;
        
        const nextBtn = document.getElementById('phone-next-btn');
        if (validatePhoneNumber(formatted)) {
            nextBtn.classList.remove('disabled');
        } else {
            nextBtn.classList.add('disabled');
        }
    }, 0);
});

// Prevent form submission on enter
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        
        // Handle enter on different screens
        const currentScreen = document.querySelector('.screen:not(.hidden)');
        if (!currentScreen) return;
        
        switch (currentScreen.id) {
            case 'phone-registration':
                const phoneBtn = document.getElementById('phone-next-btn');
                if (!phoneBtn.classList.contains('disabled')) {
                    phoneBtn.click();
                }
                break;
                
            case 'otp-verification':
                const otpBtn = document.getElementById('otp-confirm-btn');
                if (!otpBtn.classList.contains('disabled')) {
                    otpBtn.click();
                }
                break;
                
            case 'set-pin':
                const pinBtn = document.getElementById('pin-continue-btn');
                if (!pinBtn.classList.contains('disabled')) {
                    pinBtn.click();
                }
                break;
                
            case 'confirm-pin':
                const confirmBtn = document.getElementById('confirm-pin-btn');
                if (!confirmBtn.classList.contains('disabled')) {
                    confirmBtn.click();
                }
                break;
        }
    }
});

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    initializeApp();
    
    // Add some haptic feedback for Telegram
    if (tg && tg.HapticFeedback) {
        document.addEventListener('click', function(e) {
            if (e.target.matches('.key-btn:not(.empty), .primary-btn:not(.disabled)')) {
                tg.HapticFeedback.impactOccurred('light');
            }
        });
    }
});

// Handle visibility change (when user switches tabs/apps)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // User switched away, start session timeout
        const currentScreen = document.querySelector('.screen:not(.hidden)');
        if (currentScreen && !['phone-registration', 'otp-verification', 'set-pin', 'confirm-pin', 'login-pin'].includes(currentScreen.id)) {
            resetSessionTimeout();
        }
    }
});

// Export functions for potential future use
window.miniBankApp = {
    showScreen,
    showError,
    hideError,
    translatePage,
    toggleTheme,
    resetSessionTimeout
};
