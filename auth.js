class AuthManager {
    constructor() {
        this.currentTab = 'login';
        this.handleUrlParams();
        this.init();
    }

    handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const action = urlParams.get('action');
        
        if (action === 'signup') {
            this.currentTab = 'register';
        }
    }

    init() {
        this.bindEvents();
        this.checkExistingAuth();
    }

    bindEvents() {
        // Переключение между вкладками
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Переключение через ссылку
        document.getElementById('switchToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab('register');
        });

        // Обработка форм
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            this.handleLogin(e);
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            this.handleRegister(e);
        });

        // Проверка силы пароля
        document.getElementById('registerPassword').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });

        // Социальные кнопки
        document.querySelectorAll('.btn-social').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleSocialAuth(e.target.classList.contains('btn-google') ? 'google' : 'linkedin');
            });
        });

        // Кнопка продолжения после успешной регистрации
        document.getElementById('continueBtn').addEventListener('click', () => {
            this.redirectToDashboard();
        });
    }

     switchTab(tab) {
        this.currentTab = tab;
        
        // Обновляем URL без перезагрузки страницы
        const newUrl = new URL(window.location);
        if (tab === 'register') {
            newUrl.searchParams.set('action', 'signup');
        } else {
            newUrl.searchParams.delete('action');
        }
        window.history.replaceState({}, '', newUrl);
        // Обновляем активные кнопки
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        // Обновляем активные формы
        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}Form`);
        });

        // Обновляем текст переключения
        const switchText = document.getElementById('switchText');
        const switchLink = document.getElementById('switchToRegister');
        
        if (tab === 'login') {
            switchText.innerHTML = 'Еще нет аккаунта? <a href="#" id="switchToRegister">Зарегистрироваться</a>';
        } else {
            switchText.innerHTML = 'Уже есть аккаунт? <a href="#" id="switchToRegister">Войти</a>';
        }

        // Перепривязываем событие
        document.getElementById('switchToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab(tab === 'login' ? 'register' : 'login');
        });

        // Очищаем ошибки
        this.clearErrors();
    }

    clearErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        document.querySelectorAll('.input-error').forEach(el => {
            el.classList.remove('input-error');
        });
    }

    showError(inputId, message) {
        const input = document.getElementById(inputId);
        const errorElement = document.getElementById(`${inputId}Error`);
        
        input.classList.add('input-error');
        errorElement.textContent = message;
    }

    showSuccess(inputId) {
        const input = document.getElementById(inputId);
        input.classList.remove('input-error');
        input.classList.add('input-success');
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        let strength = 0;
        let feedback = '';

        if (password.length >= 8) strength++;
        if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
        if (password.match(/\d/)) strength++;
        if (password.match(/[^a-zA-Z\d]/)) strength++;

        switch(strength) {
            case 0:
            case 1:
                feedback = 'Слабый';
                strengthBar.className = 'strength-bar strength-weak';
                break;
            case 2:
                feedback = 'Средний';
                strengthBar.className = 'strength-bar strength-medium';
                break;
            case 3:
                feedback = 'Сильный';
                strengthBar.className = 'strength-bar strength-strong';
                break;
            case 4:
                feedback = 'Очень сильный';
                strengthBar.className = 'strength-bar strength-very-strong';
                break;
        }

        strengthText.textContent = `Надежность пароля: ${feedback}`;
        return strength;
    }

    async handleLogin(e) {
        e.preventDefault();
        this.clearErrors();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        let isValid = true;

        // Валидация email
        if (!email) {
            this.showError('loginEmail', 'Email обязателен');
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.showError('loginEmail', 'Введите корректный email');
            isValid = false;
        }

        // Валидация пароля
        if (!password) {
            this.showError('loginPassword', 'Пароль обязателен');
            isValid = false;
        } else if (password.length < 6) {
            this.showError('loginPassword', 'Пароль должен содержать минимум 6 символов');
            isValid = false;
        }

        if (!isValid) return;

        // Имитация запроса к серверу
        try {
            await this.mockApiCall('login', { email, password, rememberMe });
            this.saveAuthData({ email, rememberMe });
            this.redirectToDashboard();
        } catch (error) {
            this.showError('loginPassword', 'Неверный email или пароль');
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        this.clearErrors();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('registerEmail').value;
        const userType = document.getElementById('userType').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        let isValid = true;

        // Валидация имени
        if (!firstName) {
            this.showError('firstName', 'Имя обязательно');
            isValid = false;
        }

        // Валидация фамилии
        if (!lastName) {
            this.showError('lastName', 'Фамилия обязательна');
            isValid = false;
        }

        // Валидация email
        if (!email) {
            this.showError('registerEmail', 'Email обязателен');
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.showError('registerEmail', 'Введите корректный email');
            isValid = false;
        }

        // Валидация типа пользователя
        if (!userType) {
            this.showError('userType', 'Выберите тип аккаунта');
            isValid = false;
        }

        // Валидация пароля
        const passwordStrength = this.checkPasswordStrength(password);
        if (!password) {
            this.showError('registerPassword', 'Пароль обязателен');
            isValid = false;
        } else if (password.length < 8) {
            this.showError('registerPassword', 'Пароль должен содержать минимум 8 символов');
            isValid = false;
        } else if (passwordStrength < 2) {
            this.showError('registerPassword', 'Пароль слишком слабый');
            isValid = false;
        }

        // Подтверждение пароля
        if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Пароли не совпадают');
            isValid = false;
        }

        // Согласие с условиями
        if (!agreeTerms) {
            this.showError('agreeTerms', 'Необходимо согласие с условиями');
            isValid = false;
        }

        if (!isValid) return;

        // Имитация запроса к серверу
        try {
            await this.mockApiCall('register', {
                firstName,
                lastName,
                email,
                userType,
                password
            });
            
            this.showSuccessMessage();
        } catch (error) {
            this.showError('registerEmail', 'Пользователь с таким email уже существует');
        }
    }

    async mockApiCall(endpoint, data) {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Имитация проверки существующего пользователя
        if (endpoint === 'register') {
            const users = JSON.parse(localStorage.getItem('handshake_users') || '[]');
            const userExists = users.some(user => user.email === data.email);
            
            if (userExists) {
                throw new Error('User already exists');
            }

            // Сохраняем пользователя
            users.push({
                ...data,
                id: Date.now(),
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('handshake_users', JSON.stringify(users));
        }

        // Для входа проверяем существование пользователя
        if (endpoint === 'login') {
            const users = JSON.parse(localStorage.getItem('handshake_users') || '[]');
            const user = users.find(u => u.email === data.email && u.password === data.password);
            
            if (!user) {
                throw new Error('Invalid credentials');
            }
        }

        return { success: true, message: 'Operation successful' };
    }

    saveAuthData(authData) {
        if (authData.rememberMe) {
            localStorage.setItem('handshake_auth', JSON.stringify(authData));
        } else {
            sessionStorage.setItem('handshake_auth', JSON.stringify(authData));
        }
    }

    checkExistingAuth() {
        const authData = localStorage.getItem('handshake_auth') || sessionStorage.getItem('handshake_auth');
        if (authData) {
            const { email } = JSON.parse(authData);
            document.getElementById('loginEmail').value = email;
            document.getElementById('rememberMe').checked = true;
        }
    }

    showSuccessMessage() {
        document.getElementById('successMessage').classList.remove('hidden');
    }

    redirectToDashboard() {
        // В реальном приложении здесь был бы redirect на главную страницу
        alert('Успешный вход! Перенаправление на главную страницу...');
        window.location.href = 'main.html'; // Возврат на главную страницу
    }

    handleSocialAuth(provider) {
        // Имитация социальной авторизации
        alert(`Авторизация через ${provider} будет реализована в будущем`);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});