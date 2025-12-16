
class ProfileManager {
    constructor() {
        this.db = window.db; // Используем нашу базу данных
        this.currentUser = this.db.getCurrentUser();
        this.currentProfile = this.db.getCurrentProfile();
        this.currentTab = 'about';
        
        if (!this.currentUser) {
            // Если пользователь не авторизован, перенаправляем на страницу входа
            window.location.href = 'auth.html';
            return;
        }
        
        this.init();
    }

    init() {
        this.loadProfileData();
        this.bindEvents();
        this.updateUI();
    }

    loadProfileData() {
        if (!this.currentProfile) {
            // Создаем профиль если его нет
            this.currentProfile = this.db.createProfile({
                userId: this.currentUser.id,
                name: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
                title: this.currentUser.userType === 'student' ? 'Студент' : 
                       this.currentUser.userType === 'employer' ? 'Работодатель' : 'Карьерный центр',
                location: '',
                about: '',
                skills: [],
                languages: [],
                education: [],
                experience: [],
                careerGoals: [],
                settings: {
                    visibility: 'employers',
                    notifications: {
                        email: true,
                        messages: true,
                        jobs: false,
                        views: true
                    },
                    emailFrequency: 'weekly'
                }
            });
        }

        // Обновление UI с данными пользователя
        document.getElementById('userName').textContent = this.currentProfile.name || 'Не указано';
        document.getElementById('userTitle').textContent = this.currentProfile.title || 'Не указано';
        document.getElementById('userLocation').textContent = this.currentProfile.location || 'Не указано';
        document.getElementById('aboutText').textContent = this.currentProfile.about || 'Расскажите о себе...';
        
        // Статистика
        if (this.currentProfile.stats) {
            document.getElementById('profileViews').textContent = this.currentProfile.stats.profileViews || 0;
            document.getElementById('connections').textContent = this.currentProfile.stats.connections || 0;
        }
        
        // Навыки
        this.updateSkillsList();
        
        // Языки
        this.updateLanguagesList();
        
        // Образование
        this.updateEducationList();
        
        // Опыт работы
        this.updateExperienceList();
        
        // Цели карьеры
        this.updateCareerGoals();
        
        // Настройки
        this.updateSettings();
        
        // Обновление аватара пользователя
        this.updateUserAvatar();
    }

    updateUserAvatar() {
        const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${this.currentUser.email || 'user'}`;
        document.querySelectorAll('.user-avatar img, #userAvatar').forEach(img => {
            img.src = avatarUrl;
        });
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
                this.db.logout();
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

        // Добавление опыта работы
        document.getElementById('addExperienceBtn').addEventListener('click', () => {
            this.openAddExperienceModal();
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
        
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabName + 'Tab');
        });
    }

    openEditModal(section) {
        const modal = document.getElementById('editModal');
        const title = document.getElementById('modalTitle');
        const field = document.getElementById('editField');
        
        switch(section) {
            case 'about':
                title.textContent = 'Редактирование "О себе"';
                field.value = this.currentProfile.about || '';
                field.dataset.section = 'about';
                break;
            case 'goals':
                title.textContent = 'Редактирование целей карьеры';
                field.value = (this.currentProfile.careerGoals || []).join('\n');
                field.dataset.section = 'goals';
                break;
            case 'profile':
                title.textContent = 'Редактирование профиля';
                field.value = `${this.currentProfile.name}\n${this.currentProfile.title}\n${this.currentProfile.location}`;
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
        this.showModalForm('education', 'Добавить образование');
    }

    openAddLanguageModal() {
        this.showModalForm('language', 'Добавить язык');
    }

    openAddExperienceModal() {
        this.showModalForm('experience', 'Добавить опыт работы');
    }

    openAddProjectModal() {
        this.showModalForm('project', 'Добавить проект');
    }

    openAddPortfolioModal() {
        alert('Добавление работы в портфолио будет реализовано в следующем обновлении');
    }

    showModalForm(type, title) {
        const modal = document.getElementById('editModal');
        const modalTitle = document.getElementById('modalTitle');
        const field = document.getElementById('editField');
        
        modalTitle.textContent = title;
        field.value = '';
        field.dataset.section = `add_${type}`;
        field.placeholder = this.getPlaceholderForType(type);
        
        modal.classList.add('show');
    }

    getPlaceholderForType(type) {
        switch(type) {
            case 'education': return 'Вуз\nСпециальность\nГоды обучения (напр. 2021-2025)';
            case 'language': return 'Язык\nУровень (напр. B2, Родной)';
            case 'experience': return 'Должность\nКомпания\nОписание\nПериод работы';
            case 'project': return 'Название проекта\nОписание\nТехнологии';
            default: return 'Введите информацию...';
        }
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
            this.showNotification('Поле не может быть пустым', 'error');
            return;
        }

        switch(section) {
            case 'about':
                this.currentProfile.about = value;
                document.getElementById('aboutText').textContent = value;
                break;
            case 'goals':
                this.currentProfile.careerGoals = value.split('\n').filter(g => g.trim());
                this.updateCareerGoals();
                break;
            case 'profile':
                const lines = value.split('\n');
                this.currentProfile.name = lines[0] || this.currentProfile.name;
                this.currentProfile.title = lines[1] || this.currentProfile.title;
                this.currentProfile.location = lines[2] || this.currentProfile.location;
                
                document.getElementById('userName').textContent = this.currentProfile.name;
                document.getElementById('userTitle').textContent = this.currentProfile.title;
                document.getElementById('userLocation').textContent = this.currentProfile.location;
                break;
            case 'add_education':
                const eduLines = value.split('\n');
                const educationItem = {
                    institution: eduLines[0] || '',
                    degree: eduLines[1] || '',
                    period: eduLines[2] || ''
                };
                
                if (!this.currentProfile.education) {
                    this.currentProfile.education = [];
                }
                this.currentProfile.education.push(educationItem);
                this.updateEducationList();
                break;
            case 'add_language':
                const langLines = value.split('\n');
                const languageItem = {
                    name: langLines[0] || '',
                    level: langLines[1] || ''
                };
                
                if (!this.currentProfile.languages) {
                    this.currentProfile.languages = [];
                }
                this.currentProfile.languages.push(languageItem);
                this.updateLanguagesList();
                break;
            case 'add_experience':
                const expLines = value.split('\n');
                const experienceItem = {
                    position: expLines[0] || '',
                    company: expLines[1] || '',
                    period: expLines[2] || '',
                    description: expLines[3] || ''
                };
                
                if (!this.currentProfile.experience) {
                    this.currentProfile.experience = [];
                }
                this.currentProfile.experience.push(experienceItem);
                this.updateExperienceList();
                break;
        }

        // Сохраняем изменения в базе данных
        this.db.updateProfile(this.currentUser.id, this.currentProfile);
        
        this.showNotification('Изменения сохранены успешно!', 'success');
        this.closeAllModals();
    }

    addSkill() {
        const skillInput = document.getElementById('newSkill');
        const skill = skillInput.value.trim();

        if (!skill) {
            this.showNotification('Введите название навыка', 'error');
            return;
        }

        if (!this.currentProfile.skills) {
            this.currentProfile.skills = [];
        }

        if (this.currentProfile.skills.includes(skill)) {
            this.showNotification('Этот навык уже добавлен', 'warning');
            return;
        }

        this.currentProfile.skills.push(skill);
        this.updateSkillsList();
        
        // Сохраняем в базе данных
        this.db.updateProfile(this.currentUser.id, { skills: this.currentProfile.skills });
        
        skillInput.value = '';
        this.closeAllModals();
        this.showNotification('Навык добавлен успешно!', 'success');
    }

    removeSkill(skillName) {
        this.currentProfile.skills = (this.currentProfile.skills || []).filter(s => s !== skillName);
        this.updateSkillsList();
        
        // Сохраняем в базе данных
        this.db.updateProfile(this.currentUser.id, { skills: this.currentProfile.skills });
        
        this.showNotification('Навык удален', 'info');
    }

    updateSkillsList() {
        const skillsList = document.getElementById('skillsList');
        skillsList.innerHTML = '';

        (this.currentProfile.skills || []).forEach(skill => {
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

        (this.currentProfile.languages || []).forEach(lang => {
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

        (this.currentProfile.education || []).forEach(edu => {
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

    updateExperienceList() {
        const experienceList = document.getElementById('experienceList');
        experienceList.innerHTML = '';

        const experiences = this.currentProfile.experience || [];
        
        if (experiences.length === 0) {
            experienceList.innerHTML = '<p class="empty-state">Опыт работы пока не добавлен</p>';
            return;
        }

        experiences.forEach(exp => {
            const expCard = document.createElement('div');
            expCard.className = 'experience-card';
            expCard.innerHTML = `
                <h4>${exp.position}</h4>
                <p class="company">${exp.company}</p>
                <p class="period">${exp.period}</p>
                <p>${exp.description}</p>
            `;
            experienceList.appendChild(expCard);
        });
    }

    updateCareerGoals() {
        const goalsList = document.getElementById('careerGoals');
        goalsList.innerHTML = '';

        (this.currentProfile.careerGoals || []).forEach(goal => {
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
        if (this.currentProfile.settings) {
            // Видимость профиля
            document.getElementById('profileVisibility').value = this.currentProfile.settings.visibility || 'employers';
            
            // Частота рассылок
            document.getElementById('emailFrequency').value = this.currentProfile.settings.emailFrequency || 'weekly';
        }
    }

    saveSettings() {
        this.currentProfile.settings = {
            visibility: document.getElementById('profileVisibility').value,
            emailFrequency: document.getElementById('emailFrequency').value
        };

        // Сохраняем в базе данных
        this.db.updateProfile(this.currentUser.id, { settings: this.currentProfile.settings });
        
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

        // Проверяем текущий пароль
        if (this.currentUser.password !== currentPassword) {
            this.showNotification('Текущий пароль неверен', 'error');
            return;
        }

        // Обновляем пароль
        this.db.updateUser(this.currentUser.id, { password: newPassword });
        
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
            this.showNotification('Пожалуйста, выберите изображение', 'error');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Размер файла не должен превышать 5MB', 'error');
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
        if (confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
            // В реальном приложении здесь был бы запрос к серверу
            this.db.logout();
            
            // Очистка данных пользователя
            const data = this.db.getData();
            data.users = data.users.filter(user => user.id !== this.currentUser.id);
            data.profiles = data.profiles.filter(profile => profile.userId !== this.currentUser.id);
            this.db.saveData(data);
            
            this.showNotification('Аккаунт успешно удален', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }

    showFullStats() {
        // Увеличиваем счетчик просмотров
        if (!this.currentProfile.stats) {
            this.currentProfile.stats = { profileViews: 0, connections: 0, applications: 0, interviews: 0 };
        }
        this.currentProfile.stats.profileViews++;
        
        // Обновляем UI
        document.getElementById('profileViews').textContent = this.currentProfile.stats.profileViews;
        
        // Сохраняем в базу данных
        this.db.updateProfile(this.currentUser.id, { 
            stats: this.currentProfile.stats 
        });
        
        // Показываем детальную статистику
        const statsHtml = `
            <h3>Детальная статистика</h3>
            <p>Просмотры профиля: ${this.currentProfile.stats.profileViews}</p>
            <p>Контакты: ${this.currentProfile.stats.connections}</p>
            <p>Отклики на вакансии: ${this.currentProfile.stats.applications || 0}</p>
            <p>Собеседования: ${this.currentProfile.stats.interviews || 0}</p>
        `;
        
        alert(statsHtml);
    }

    showNotification(message, type = 'info') {
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
        // Обновляем счетчик просмотров при каждом посещении
        if (!this.currentProfile.stats) {
            this.currentProfile.stats = { profileViews: 0, connections: 0, applications: 0, interviews: 0 };
        }
        this.currentProfile.stats.profileViews++;
        
        document.getElementById('profileViews').textContent = this.currentProfile.stats.profileViews;
        
        // Сохраняем в базу данных
        this.db.updateProfile(this.currentUser.id, { 
            stats: this.currentProfile.stats 
        });
        
        // Обновляем имя пользователя в хедере
        const userNameElement = document.querySelector('.user-avatar');
        if (userNameElement) {
            userNameElement.title = this.currentUser.firstName;
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Загружаем базу данных если не загружена
    if (typeof db === 'undefined') {
        const script = document.createElement('script');
        script.src = 'database.js';
        script.onload = function() {
            new ProfileManager();
        };
        document.head.appendChild(script);
    } else {
        new ProfileManager();
    }
});
