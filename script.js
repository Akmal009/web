// Telegram Web App initialization
let tg = window.Telegram?.WebApp;
if (tg) {
    tg.ready();
    tg.expand();
}

// Global state
let currentPin = '';
let confirmPin = '';
let firstPin = '';
let userPhone = '';
let currentLanguage = 'ru';
let selectedCountry = 'uz';
let selectedCountryCode = '+998';
let otpTimer = null;
let sessionTimeout = null;

// Country data
const countries = {
    uz: { code: '+998', flag: '🇺🇿', mask: '00 000 00 00' },
    kz: { code: '+7', flag: '🇰🇿', mask: '000 000 00 00' },
    ru: { code: '+7', flag: '🇷🇺', mask: '000 000 00 00' },
    us: { code: '+1', flag: '🇺🇸', mask: '000 000 0000' }
};

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
        wrong_pin: 'Неверный PIN. Попробуйте еще раз.',
        uzbekistan: 'Узбекистан',
        kazakhstan: 'Казахстан',
        russia: 'Россия',
        usa: 'США'
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
        wrong_pin: 'Noto\'g\'ri PIN. Qaytadan urinib ko\'ring.',
        uzbekistan: 'O\'zbekiston',
        kazakhstan: 'Qozog\'iston',
        russia: 'Rossiya',
        usa: 'AQSH'
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
        wrong_pin: 'Wrong PIN. Please try again.',
        uzbekistan: 'Uzbekistan',
        kazakhstan: 'Kazakhstan',
        russia: 'Russia',
        usa: 'USA'
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
        wrong_pin: 'Қате PIN. Қайталап көріңіз.',
        uzbekistan: 'Өзбекстан',
        kazakhstan: 'Қазақстан',
        russia: 'Ресей',
        usa: 'АҚШ'
    }
};

// Utility functions
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
    
    // Setup keypad when PIN screens are shown
    if (['set-pin', 'confirm-pin', 'login-pin'].includes(screenId)) {
        setTimeout(() => setupPinKeypad(screenId), 100);
    }
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

function formatPhoneNumber(value, countryCode) {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format based on country
    switch(countryCode) {
        case '+998': // Uzbekistan
            if (digits.length <= 2) return digits;
            if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
            if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
            return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7, 9)}`;
        
        case '+7': // Kazakhstan/Russia
            if (digits.length <= 3) return digits;
            if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
            if (digits.length <= 8) return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
            return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 8)} ${digits.slice(8, 10)}`;
        
        case '+1': // USA
            if (digits.length <= 3) return digits;
            if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
            return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
        
        default:
            return digits;
    }
}

function validatePhoneNumber(phone, countryCode) {
    const digits = phone.replace(/\D/g, '');
    
    switch(countryCode) {
        case '+998': return digits.length === 9; // Uzbekistan
        case '+7': return digits.length === 10;   // Kazakhstan/Russia
        case '+1': return digits.length === 10;   // USA
        default: return digits.length >= 9;
    }
}

function updateCountrySelector(countryKey) {
    selectedCountry = countryKey;
    selectedCountryCode = countries[countryKey].code;
    
    const selectedFlag = document.getElementById('selected-flag');
    const selectedCode = document.getElementById('selected-code');
    const phoneInput = document.getElementById('phone-input');
    
    selectedFlag.textContent = countries[countryKey].flag;
    selectedCode.textContent = countries[countryKey].code;
    phoneInput.placeholder = countries[countryKey].mask;
    phoneInput.value = ''; // Clear input when country changes
    
    // Update next button state
    const nextBtn = document.getElementById('phone-next-btn');
    nextBtn.classList.add('disabled');
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
        
        // Set default country based on language
        if (currentLanguage === 'uz') selectedCountry = 'uz';
        else if (currentLanguage === 'kz') selectedCountry = 'kz';
        else if (currentLanguage === 'ru') selectedCountry = 'ru';
        else selectedCountry = 'us';
    }
    
    // Initialize country selector
    updateCountrySelector(selectedCountry);
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
{   const userData = localStorage.getItem('minibank_user');
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
document.getElementById('country-selector').addEventListener('click', function() {
    const dropdown = document.getElementById('country-dropdown');
    const selector = this;
    
    dropdown.classList.toggle('hidden');
    selector.classList.toggle('active');
});

// Country dropdown selection
document.getElementById('country-dropdown').addEventListener('click', function(e) {
    const option = e.target.closest('.country-option');
    if (option) {
        const countryKey = option.getAttribute('data-country');
        updateCountrySelector(countryKey);
        
        // Hide dropdown
        this.classList.add('hidden');
        document.getElementById('country-selector').classList.remove('active');
    }
});

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
    const selector = document.getElementById('country-selector');
    const dropdown = document.getElementById('country-dropdown');
    
    if (!selector.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
        selector.classList.remove('active');
    }
});

document.getElementById('phone-input').addEventListener('input', function(e) {
    const formatted = formatPhoneNumber(e.target.value, selectedCountryCode);
    e.target.value = formatted;
    
    const nextBtn = document.getElementById('phone-next-btn');
    if (validatePhoneNumber(formatted, selectedCountryCode)) {
        nextBtn.classList.remove('disabled');
    } else {
        nextBtn.classList.add('disabled');
    }
});

document.getElementById('phone-next-btn').addEventListener('click', function() {
    if (this.classList.contains('disabled')) return;
    
    const phone = document.getElementById('phone-input').value;
    if (!validatePhoneNumber(phone, selectedCountryCode)) {
        showError(translations[currentLanguage].invalid_phone);
        return;
    }
    
    userPhone = selectedCountryCode + phone.replace(/\D/g, '');
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
function setupPinKeypad(screenId) {
    const screen = document.getElementById(screenId);
    const keypadButtons = screen.querySelectorAll('.key-btn:not(.empty):not(.delete-btn)');
    const deleteBtn = screen.querySelector('.delete-btn');
    const continueBtn = screen.querySelector('.primary-btn');
    
    let screenPin = '';
    
    // Clear any existing event listeners by cloning elements
    keypadButtons.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const key = this.getAttribute('data-key');
            if (key && screenPin.length < 4) {
                screenPin += key;
                updatePinDisplay(screenPin, `#${screenId} .pin-display`);
                
                if (screenPin.length === 4 && continueBtn) {
                    continueBtn.classList.remove('disabled');
                }
            }
        });
    });
    
    if (deleteBtn) {
        const newDeleteBtn = deleteBtn.cloneNode(true);
        deleteBtn.parentNode.replaceChild(newDeleteBtn, deleteBtn);
        
        newDeleteBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            if (screenPin.length > 0) {
                screenPin = screenPin.slice(0, -1);
                updatePinDisplay(screenPin, `#${screenId} .pin-display`);
                
                if (continueBtn) {
                    continueBtn.classList.add('disabled');
                }
            }
        });
    }
    
    // Handle continue button
    if (continueBtn) {
        const newContinueBtn = continueBtn.cloneNode(true);
        continueBtn.parentNode.replaceChild(newContinueBtn, continueBtn);
        
        newContinueBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            if (this.classList.contains('disabled') || screenPin.length !== 4) return;
            
            if (screenId === 'set-pin') {
                firstPin = screenPin;
                screenPin = '';
                clearPinDisplay();
                showScreen('confirm-pin');
                setupPinKeypad('confirm-pin');
                
            } else if (screenId === 'confirm-pin') {
                if (screenPin === firstPin) {
                    // Save user data
                    const userData = {
                        phone: userPhone,
                        pin: screenPin,
                        isRegistered: true,
                        language: currentLanguage,
                        registeredAt: new Date().toISOString()
                    };
                    
                    localStorage.setItem('minibank_user', JSON.stringify(userData));
                    
                    screenPin = '';
                    firstPin = '';
                    clearPinDisplay();
                    showScreen('login-pin');
                    setupPinKeypad('login-pin');
                } else {
                    showError(translations[currentLanguage].pin_mismatch);
                    showPinError();
                    screenPin = '';
                    clearPinDisplay();
                    this.classList.add('disabled');
                }
            }
        });
    }
    
    // For login screen, handle automatic verification
    if (screenId === 'login-pin') {
        const originalHandler = function() {
            if (screenPin.length === 4) {
                const userData = JSON.parse(localStorage.getItem('minibank_user') || '{}');
                
                setTimeout(() => {
                    if (screenPin === userData.pin) {
                        screenPin = '';
                        clearPinDisplay();
                        alert(translations[currentLanguage].ok + '! Login successful');
                        resetSessionTimeout();
                    } else {
                        showError(translations[currentLanguage].wrong_pin);
                        showPinError();
                        screenPin = '';
                        clearPinDisplay();
                    }
                }, 500);
            }
        };
        
        // Override keypad behavior for login
        keypadButtons.forEach(btn => {
            btn.addEventListener('click', originalHandler);
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
document.getElementById('login-pin').addEventListener('click', function() {
    // Auto-focus for PIN entry, reset session timeout
    resetSessionTimeout();
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
    firstPin = '';
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
};}
