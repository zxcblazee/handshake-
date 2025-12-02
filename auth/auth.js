
class AuthManager {
    constructor() {
        this.currentTab = 'login';
        this.db = window.db; // Используем нашу базу данных
        this.db.seedTestData(); // Инициализируем тестовые данные
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
        this.updateHeaderAuthButtons(); // Обновляем кнопки в хедере
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
            this.redirectToProfile();
        });

        // Кнопка "Забыли пароль"
        document.querySelector('.forgot-password').addEventListener('click', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });
    }

    switchTab(tab) {
        this.currentTab = tab;
        
        const newUrl = new URL(window.location);
        if (tab === 'register') {
            newUrl.searchParams.set('action', 'signup');
        } else {
            newUrl.searchParams.delete('action');
        }
        window.history.replaceState({}, '', newUrl);
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });

        document.querySelectorAll('.auth-form').forEach(form => {
            form.classList.toggle('active', form.id === `${tab}Form`);
        });

        const switchText = document.getElementById('switchText');
        const switchLink = document.getElementById('switchToRegister');
        
        if (tab === 'login') {
            switchText.innerHTML = 'Еще нет аккаунта? <a href="#" id="switchToRegister">Зарегистрироваться</a>';
        } else {
            switchText.innerHTML = 'Уже есть аккаунт? <a href="#" id="switchToRegister">Войти</a>';
        }

        document.getElementById('switchToRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchTab(tab === 'login' ? 'register' : 'login');
        });

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

    if (!email) {
        this.showError('loginEmail', 'Email обязателен');
        isValid = false;
    } else if (!this.validateEmail(email)) {
        this.showError('loginEmail', 'Введите корректный email');
        isValid = false;
    }

    if (!password) {
        this.showError('loginPassword', 'Пароль обязателен');
        isValid = false;
    } else if (password.length < 6) {
        this.showError('loginPassword', 'Пароль должен содержать минимум 6 символов');
        isValid = false;
    }

    if (!isValid) return;

    try {
        const user = this.db.getUserByEmail(email);
        
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        if (user.password !== password) {
            throw new Error('Неверный пароль');
        }

        this.db.createSession(user.id);
        
        if (rememberMe) {
            localStorage.setItem('handshake_remember', JSON.stringify({ email }));
        } else {
            localStorage.removeItem('handshake_remember');
        }

        this.showNotification('Успешный вход!', 'success');
        
        // ИСПРАВЛЕНО: перенаправление на главную страницу
        setTimeout(() => {
            window.location.href = 'index.html'; // ИСПРАВЛЕН ПУТЬ
        }, 1500);

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

        if (!firstName) {
            this.showError('firstName', 'Имя обязательно');
            isValid = false;
        }

        if (!lastName) {
            this.showError('lastName', 'Фамилия обязательна');
            isValid = false;
        }

        if (!email) {
            this.showError('registerEmail', 'Email обязателен');
            isValid = false;
        } else if (!this.validateEmail(email)) {
            this.showError('registerEmail', 'Введите корректный email');
            isValid = false;
        }

        if (!userType) {
            this.showError('userType', 'Выберите тип аккаунта');
            isValid = false;
        }

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

        if (password !== confirmPassword) {
            this.showError('confirmPassword', 'Пароли не совпадают');
            isValid = false;
        }

        if (!agreeTerms) {
            this.showError('agreeTerms', 'Необходимо согласие с условиями');
            isValid = false;
        }

        if (!isValid) return;

        try {
            // Проверка существующего пользователя
            const existingUser = this.db.getUserByEmail(email);
            if (existingUser) {
                throw new Error('Пользователь с таким email уже существует');
            }

            // Создание пользователя
            const user = this.db.createUser({
                email,
                password,
                firstName,
                lastName,
                userType,
                verified: false
            });

            // Создание профиля пользователя
            const profile = this.db.createProfile({
                userId: user.id,
                name: `${firstName} ${lastName}`,
                title: userType === 'student' ? 'Студент' : 
                       userType === 'employer' ? 'Работодатель' : 'Карьерный центр',
                location: '',
                about: '',
                skills: [],
                languages: [],
                education: [],
                experience: [],
                careerGoals: []
            });

            // Автоматический вход после регистрации
            this.db.createSession(user.id);
            
            this.showSuccessMessage();
            
            // Обновляем кнопки на главной странице
            this.updateHeaderAuthButtons();

        } catch (error) {
            this.showError('registerEmail', error.message || 'Ошибка при регистрации');
        }
    }

    checkExistingAuth() {
        const rememberData = localStorage.getItem('handshake_remember');
        if (rememberData) {
            const { email } = JSON.parse(rememberData);
            document.getElementById('loginEmail').value = email;
            document.getElementById('rememberMe').checked = true;
        }
    }

    showSuccessMessage() {
        document.getElementById('successMessage').classList.remove('hidden');
    }

    redirectToProfile() {
        window.location.href = 'profile.html';
    }

    handleSocialAuth(provider) {
        this.showNotification(`Авторизация через ${provider} будет реализована в будущем`, 'info');
    }

    handleForgotPassword() {
        const email = prompt('Введите ваш email для восстановления пароля:');
        if (email && this.validateEmail(email)) {
            // В реальном приложении здесь была бы отправка email
            this.showNotification('Инструкции по восстановлению отправлены на email', 'success');
        } else if (email) {
            this.showNotification('Введите корректный email', 'error');
        }
    }

    updateHeaderAuthButtons() {
        // Эта функция обновит кнопки на главной странице
        // Она будет вызвана из main.js после загрузки страницы
        const currentUser = this.db.getCurrentUser();
        const authButtons = document.querySelector('.auth-buttons');
        
        if (authButtons) {
            if (currentUser) {
                authButtons.innerHTML = `
                    <a href="profile.html" class="btn btn-login">
                        <i class="fas fa-user"></i> Профиль
                    </a>
                    <a href="#" class="btn btn-signup" id="logoutBtnMain">
                        Выйти
                    </a>
                `;
                
                document.getElementById('logoutBtnMain').addEventListener('click', (e) => {
                    e.preventDefault();
                    this.db.logout();
                    window.location.href = 'index.html';
                });
            } else {
                authButtons.innerHTML = `
                    <a href="auth/auth.html" class="btn btn-login">Войти</a>
                    <a href="auth/auth.html" class="btn btn-signup">Регистрация</a>
                `;
            }
        }
    }

    showNotification(message, type = 'info') {
        // Создание уведомления
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close"><i class="fas fa-times"></i></button>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 15px;
            z-index: 3000;
            animation: slideInRight 0.3s ease;
            max-width: 400px;
        `;
        
        document.body.appendChild(notification);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});
