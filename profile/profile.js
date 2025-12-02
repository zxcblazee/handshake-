
class ProfileManager {
    constructor() {
        this.currentUser = this.loadUserData();
        this.currentTab = 'about';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadProfileData();
        this.updateUI();
    }

    loadUserData() {
        // Загрузка данных пользователя из localStorage или API
        const savedData = localStorage.getItem('handshake_user_profile');
        if (savedData) {
            return JSON.parse(savedData);
        }

        // Данные по умолчанию
        return {
            name: "Иван Иванов",
            title: "Студент, МГУ им. Ломоносова",
            location: "Москва, Россия",
            profileViews: 128,
            connections: 47,
            about: "Студент 3-го курса факультета вычислительной математики и кибернетики. Увлекаюсь веб-разработкой, машинным обучением и анализом данных. Ищу стажировку в IT-компании для применения знаний на практике и профессионального роста.",
            skills: ["JavaScript", "Python", "React", "UI/UX Дизайн", "Английский язык"],
            languages: [
                { name: "Русский", level: "Родной" },
                { name: "Английский", level: "B2" }
            ],
            education: [
                {
                    institution: "МГУ им. Ломоносова",
                    degree: "Бакалавр информатики",
                    period: "2021 - 2025"
                }
            ],
            careerGoals: [
                "Найти стажировку frontend-разработчика",
                "Выучить TypeScript и Redux",
                "Построить профессиональную сеть контактов"
            ],
            experience: [
                {
                    title: "Frontend-разработчик (стажировка)",
                    company: "ООО 'Технологии Будущего'",
                    description: "Разработка пользовательского интерфейса для внутренней системы управления. Работа с React, Redux, TypeScript.",
                    period: "Лето 2023"
                },
                {
                    title: "Фриланс-разработчик",
                    company: "Самостоятельная занятость",
                    description: "Создание веб-сайтов и приложений для малого бизнеса. Работа с клиентами, проектирование, разработка и поддержка.",
                    period: "2022 - наст. время"
                }
            ],
            settings: {
                visibility: "employers",
                notifications: {
                    email: true,
                    messages: true,
                    jobs: false,
                    views: true
                },
                emailFrequency: "weekly"
            }
        };
    }

    saveUserData() {
        localStorage.setItem('handshake_user_profile', JSON.stringify(this.currentUser));
    }

    loadProfileData() {
        // Обновление UI с данными пользователя
        document.getElementById('userName').textContent = this.currentUser.name;
        document.getElementById('userTitle').textContent = this.currentUser.title;
        document.getElementById('userLocation').textContent = this.currentUser.location;
        document.getElementById('profileViews').textContent = this.currentUser.profileViews;
        document.getElementById('connections').textContent = this.currentUser.connections;
        document.getElementById('aboutText').textContent = this.currentUser.about;
        
        // Навыки
        this.updateSkillsList();
        
        // Языки
        this.updateLanguagesList();
        
        // Образование
        this.updateEducationList();
        
        // Цели карьеры
        this.updateCareerGoals();
        
        // Настройки
        this.updateSettings();
    }

    bindEvents() {
        // Переключение вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Меню пользователя
        document.getElementById('userMenuToggle').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('userDropdown').classList.toggle('show');
        });

        // Закрытие меню при клике вне его
        document.addEventListener('click', () => {
            document.getElementById('userDropdown').classList.remove('show');
        });

        // Выход из аккаунта
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите выйти?')) {
                localStorage.removeItem('handshake_auth');
                window.location.href = 'index.html';
            }
        });

        // Редактирование профиля
        document.getElementById('editProfileBtn').addEventListener('click', () => {
            this.openEditModal('profile');
        });

        // Поделиться профилем
        document.getElementById('shareProfileBtn').addEventListener('click', () => {
            this.shareProfile();
        });

        // Добавление навыков
        document.getElementById('addSkillBtn').addEventListener('click', () => {
            this.openAddSkillModal();
        });

        // Удаление навыков
        document.querySelectorAll('.skill-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const skill = e.target.closest('.skill-tag');
                const skillName = skill.textContent.trim().replace('×', '');
                this.removeSkill(skillName);
            });
        });

        // Редактирование разделов
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.target.closest('.btn-edit').dataset.edit;
                this.openEditModal(section);
            });
        });

        // Добавление образования
        document.getElementById('addEducationBtn').addEventListener('click', () => {
            this.openAddEducationModal();
        });

        // Добавление языка
        document.getElementById('addLanguageBtn').addEventListener('click', () => {
            this.openAddLanguageModal();
        });

        // Модальные окна
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.closeAllModals();
        });

        document.getElementById('cancelEditBtn').addEventListener('click', () => {
            this.closeAllModals();
        });

        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        document.querySelectorAll('.cancel-add, .cancel-upload').forEach(btn => {
            btn.addEventListener('click', () => {
                this.closeAllModals();
            });
        });

        // Форма редактирования
        document.getElementById('editForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveEdit();
        });

        // Форма добавления навыка
        document.getElementById('saveSkillBtn').addEventListener('click', () => {
            this.addSkill();
        });

        // Загрузка аватара
        document.getElementById('uploadAvatarBtn').addEventListener('click', () => {
            this.openAvatarUploadModal();
        });

        document.getElementById('browseAvatarBtn').addEventListener('click', () => {
            document.getElementById('avatarFile').click();
        });

        document.getElementById('avatarFile').addEventListener('change', (e) => {
            this.handleAvatarSelect(e.target.files[0]);
        });

        document.getElementById('saveAvatarBtn').addEventListener('click', () => {
            this.saveAvatar();
        });

        // Drag & drop для аватара
        const dropArea = document.getElementById('avatarDropArea');
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('dragover');
            });
        });

        dropArea.addEventListener('drop', (e) => {
            const file = e.dataTransfer.files[0];
            if (file && file.type.startsWith('image/')) {
                this.handleAvatarSelect(file);
            }
        });

        // Формы настроек
        document.getElementById('settingsForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveSettings();
        });

        document.getElementById('securityForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changePassword();
        });

        // Удаление аккаунта
        document.getElementById('deleteAccountBtn').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
                this.deleteAccount();
            }
        });

        // Кнопки добавления
        document.getElementById('addCertificateBtn').addEventListener('click', () => {
            alert('Добавление сертификата будет реализовано в следующем обновлении');
        });

        document.getElementById('addExperienceBtn').addEventListener('click', () => {
            this.openAddExperienceModal();
        });

        document.getElementById('addProjectBtn').addEventListener('click', () => {
            this.openAddProjectModal();
        });

        document.getElementById('addPortfolioBtn').addEventListener('click', () => {
            this.openAddPortfolioModal();
        });

        // Просмотр полной статистики
        document.getElementById('viewFullStatsBtn').addEventListener('click', () => {
            this.showFullStats();
        });

        // Проверка силы пароля
        document.getElementById('newPassword').addEventListener('input', (e) => {
            this.checkPasswordStrength(e.target.value);
        });
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Обновление активной кнопки
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Показать активный контент
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName + 'Tab');
        });
    }

    openEditModal(section) {
        const modal = document.getElementById('editModal');
        const title = document.getElementById('modalTitle');
        const field = document.getElementById('editField');
        
        // Установка заголовка и значения
        switch(section) {
            case 'about':
                title.textContent = 'Редактирование "О себе"';
                field.value = this.currentUser.about;
                field.dataset.section = 'about';
                break;
            case 'goals':
                title.textContent = 'Редактирование целей карьеры';
                field.value = this.currentUser.careerGoals.join('\n');
                field.dataset.section = 'goals';
                break;
            case 'profile':
                title.textContent = 'Редактирование профиля';
                field.value = `${this.currentUser.name}\n${this.currentUser.title}\n${this.currentUser.location}`;
                field.dataset.section = 'profile';
                break;
        }
        
        modal.classList.add('show');
    }

    openAddSkillModal() {
        document.getElementById('addSkillModal').classList.add('show');
        document.getElementById('newSkill').focus();
    }

    openAvatarUploadModal() {
        document.getElementById('uploadAvatarModal').classList.add('show');
    }

    openAddEducationModal() {
        alert('Добавление образования будет реализовано в следующем обновлении');
    }

    openAddLanguageModal() {
        alert('Добавление языка будет реализовано в следующем обновлении');
    }

    openAddExperienceModal() {
        alert('Добавление опыта работы будет реализовано в следующем обновлении');
    }

    openAddProjectModal() {
        alert('Добавление проекта будет реализовано в следующем обновлении');
    }

    openAddPortfolioModal() {
        alert('Добавление работы в портфолио будет реализовано в следующем обновлении');
    }

    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
        document.getElementById('avatarPreview').classList.remove('show');
        document.getElementById('saveAvatarBtn').disabled = true;
        document.getElementById('avatarFile').value = '';
    }

    saveEdit() {
        const field = document.getElementById('editField');
        const section = field.dataset.section;
        const value = field.value.trim();

        if (!value) {
            alert('Поле не может быть пустым');
            return;
        }

        switch(section) {
            case 'about':
                this.currentUser.about = value;
                document.getElementById('aboutText').textContent = value;
                break;
            case 'goals':
                this.currentUser.careerGoals = value.split('\n').filter(g => g.trim());
                this.updateCareerGoals();
                break;
            case 'profile':
                const lines = value.split('\n');
                this.currentUser.name = lines[0] || this.currentUser.name;
                this.currentUser.title = lines[1] || this.currentUser.title;
                this.currentUser.location = lines[2] || this.currentUser.location;
                
                document.getElementById('userName').textContent = this.currentUser.name;
                document.getElementById('userTitle').textContent = this.currentUser.title;
                document.getElementById('userLocation').textContent = this.currentUser.location;
                break;
        }

        this.saveUserData();
        this.showNotification('Изменения сохранены успешно!', 'success');
        this.closeAllModals();
    }

    addSkill() {
        const skillInput = document.getElementById('newSkill');
        const skill = skillInput.value.trim();

        if (!skill) {
            alert('Введите название навыка');
            return;
        }

        if (this.currentUser.skills.includes(skill)) {
            alert('Этот навык уже добавлен');
            return;
        }

        this.currentUser.skills.push(skill);
        this.updateSkillsList();
        this.saveUserData();
        
        skillInput.value = '';
        this.closeAllModals();
        this.showNotification('Навык добавлен успешно!', 'success');
    }

    removeSkill(skillName) {
        this.currentUser.skills = this.currentUser.skills.filter(s => s !== skillName);
        this.updateSkillsList();
        this.saveUserData();
        this.showNotification('Навык удален', 'info');
    }

    updateSkillsList() {
        const skillsList = document.getElementById('skillsList');
        skillsList.innerHTML = '';

        this.currentUser.skills.forEach(skill => {
            const skillTag = document.createElement('span');
            skillTag.className = 'skill-tag';
            skillTag.innerHTML = `
                ${skill}
                <button class="skill-remove"><i class="fas fa-times"></i></button>
            `;
            
            skillTag.querySelector('.skill-remove').addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeSkill(skill);
            });
            
            skillsList.appendChild(skillTag);
        });
    }

    updateLanguagesList() {
        const languagesList = document.getElementById('languagesList');
        languagesList.innerHTML = '';

        this.currentUser.languages.forEach(lang => {
            const langItem = document.createElement('div');
            langItem.className = 'language-item';
            langItem.innerHTML = `
                <span>${lang.name}</span>
                <span class="language-level">${lang.level}</span>
            `;
            languagesList.appendChild(langItem);
        });
    }

    updateEducationList() {
        const educationList = document.getElementById('educationList');
        educationList.innerHTML = '';

        this.currentUser.education.forEach(edu => {
            const eduCard = document.createElement('div');
            eduCard.className = 'education-card';
            eduCard.innerHTML = `
                <h4>${edu.institution}</h4>
                <p>${edu.degree}</p>
                <span class="date">${edu.period}</span>
            `;
            educationList.appendChild(eduCard);
        });
    }

    updateCareerGoals() {
        const goalsList = document.getElementById('careerGoals');
        goalsList.innerHTML = '';

        this.currentUser.careerGoals.forEach(goal => {
            const goalItem = document.createElement('div');
            goalItem.className = 'goal-item';
            goalItem.innerHTML = `
                <i class="fas fa-bullseye"></i>
                <span>${goal}</span>
            `;
            goalsList.appendChild(goalItem);
        });
    }

    updateSettings() {
        // Видимость профиля
        document.getElementById('visibility').value = this.currentUser.settings.visibility;
        
        // Уведомления
        document.getElementById('notifEmail').checked = this.currentUser.settings.notifications.email;
        document.getElementById('notifMessages').checked = this.currentUser.settings.notifications.messages;
        document.getElementById('notifJobs').checked = this.currentUser.settings.notifications.jobs;
        document.getElementById('notifViews').checked = this.currentUser.settings.notifications.views;
        
        // Частота рассылок
        document.getElementById('emailFrequency').value = this.currentUser.settings.emailFrequency;
    }

    saveSettings() {
        this.currentUser.settings = {
            visibility: document.getElementById('visibility').value,
            notifications: {
                email: document.getElementById('notifEmail').checked,
                messages: document.getElementById('notifMessages').checked,
                jobs: document.getElementById('notifJobs').checked,
                views: document.getElementById('notifViews').checked
            },
            emailFrequency: document.getElementById('emailFrequency').value
        };

        this.saveUserData();
        this.showNotification('Настройки сохранены успешно!', 'success');
    }

    changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmNewPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showNotification('Заполните все поля', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('Пароли не совпадают', 'error');
            return;
        }

        if (newPassword.length < 8) {
            this.showNotification('Пароль должен содержать минимум 8 символов', 'error');
            return;
        }

        // В реальном приложении здесь был бы запрос к серверу
        this.showNotification('Пароль успешно изменен!', 'success');
        
        // Очистка полей
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmNewPassword').value = '';
    }

    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('#securityForm .strength-bar');
        const strengthText = document.querySelector('#securityForm .strength-text');
        
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

    handleAvatarSelect(file) {
        if (!file || !file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Размер файла не должен превышать 5MB');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const preview = document.getElementById('avatarPreview');
            const img = preview.querySelector('img');
            img.src = e.target.result;
            preview.classList.add('show');
            document.getElementById('saveAvatarBtn').disabled = false;
        };
        reader.readAsDataURL(file);
    }

    saveAvatar() {
        const img = document.getElementById('avatarPreview').querySelector('img');
        const userAvatar = document.getElementById('userAvatar');
        const headerAvatar = document.querySelector('.user-avatar img');
        
        // Обновление аватаров
        userAvatar.src = img.src;
        headerAvatar.src = img.src;
        
        // В реальном приложении здесь была бы загрузка на сервер
        this.showNotification('Аватар успешно обновлен!', 'success');
        this.closeAllModals();
    }

    shareProfile() {
        const profileUrl = window.location.href;
        
        if (navigator.share) {
            navigator.share({
                title: 'Мой профиль на Handshake',
                text: 'Посмотрите мой профиль на Handshake',
                url: profileUrl
            });
        } else {
            navigator.clipboard.writeText(profileUrl).then(() => {
                this.showNotification('Ссылка скопирована в буфер обмена!', 'success');
            });
        }
    }

    deleteAccount() {
        // В реальном приложении здесь был бы запрос к серверу
        localStorage.removeItem('handshake_user_profile');
        localStorage.removeItem('handshake_auth');
        
        this.showNotification('Аккаунт успешно удален', 'info');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }

    showFullStats() {
        alert('Подробная статистика будет доступна в следующем обновлении');
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
        
        // Стили для уведомления
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
        
        // Кнопка закрытия
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
        
        // Автоматическое закрытие
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
        
        // Добавление CSS анимаций
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    padding: 0;
                    font-size: 1rem;
                }
            `;
            document.head.appendChild(style);
        }
    }

    updateUI() {
        // Увеличение счетчика просмотров при каждом посещении
        this.currentUser.profileViews++;
        document.getElementById('profileViews').textContent = this.currentUser.profileViews;
        this.saveUserData();
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    new ProfileManager();
});
