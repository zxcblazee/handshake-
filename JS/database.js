
class Database {
    constructor() {
        this.dbName = 'handshake_db';
        this.init();
    }

    init() {
        // Инициализация базы данных
        if (!localStorage.getItem(this.dbName)) {
            const initialData = {
                users: [],
                profiles: [],
                jobs: [],
                messages: []
            };
            localStorage.setItem(this.dbName, JSON.stringify(initialData));
        }
    }

    // Получить все данные
    getData() {
        return JSON.parse(localStorage.getItem(this.dbName) || '{}');
    }

    // Сохранить все данные
    saveData(data) {
        localStorage.setItem(this.dbName, JSON.stringify(data));
    }

    // ПОЛЬЗОВАТЕЛИ
    createUser(userData) {
        const data = this.getData();
        const user = {
            id: Date.now(),
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        data.users.push(user);
        this.saveData(data);
        return user;
    }

    getUserById(id) {
        const data = this.getData();
        return data.users.find(user => user.id === id);
    }

    getUserByEmail(email) {
        const data = this.getData();
        return data.users.find(user => user.email === email);
    }

    updateUser(id, updates) {
        const data = this.getData();
        const index = data.users.findIndex(user => user.id === id);
        if (index !== -1) {
            data.users[index] = {
                ...data.users[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveData(data);
            return data.users[index];
        }
        return null;
    }

    // ПРОФИЛИ
    createProfile(profileData) {
        const data = this.getData();
        const profile = {
            id: Date.now(),
            userId: profileData.userId,
            ...profileData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            stats: {
                profileViews: 0,
                connections: 0,
                applications: 0,
                interviews: 0
            }
        };
        
        data.profiles.push(profile);
        this.saveData(data);
        return profile;
    }

    getProfileByUserId(userId) {
        const data = this.getData();
        return data.profiles.find(profile => profile.userId === userId);
    }

    getProfileById(id) {
        const data = this.getData();
        return data.profiles.find(profile => profile.id === id);
    }

    updateProfile(userId, updates) {
        const data = this.getData();
        const index = data.profiles.findIndex(profile => profile.userId === userId);
        if (index !== -1) {
            data.profiles[index] = {
                ...data.profiles[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.saveData(data);
            return data.profiles[index];
        }
        return null;
    }

    // СЕССИИ
    createSession(userId) {
        const session = {
            userId,
            token: this.generateToken(),
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 дней
        };
        localStorage.setItem('handshake_session', JSON.stringify(session));
        return session;
    }

    getCurrentSession() {
        const session = localStorage.getItem('handshake_session');
        return session ? JSON.parse(session) : null;
    }

    getCurrentUser() {
        const session = this.getCurrentSession();
        if (session && new Date(session.expiresAt) > new Date()) {
            return this.getUserById(session.userId);
        }
        return null;
    }

    getCurrentProfile() {
        const user = this.getCurrentUser();
        if (user) {
            return this.getProfileByUserId(user.id);
        }
        return null;
    }

    logout() {
        localStorage.removeItem('handshake_session');
        localStorage.removeItem('handshake_auth');
    }

    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    generateToken() {
        return 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
    }

    // Инициализация тестовых данных
    seedTestData() {
        const data = this.getData();
        
        if (data.users.length === 0) {
            // Тестовый пользователь
            const testUser = this.createUser({
                email: 'test@example.com',
                password: 'Test123!',
                firstName: 'Иван',
                lastName: 'Иванов',
                userType: 'student',
                verified: true
            });

            // Тестовый профиль
            this.createProfile({
                userId: testUser.id,
                name: 'Иван Иванов',
                title: 'Студент, МГУ им. Ломоносова',
                location: 'Москва, Россия',
                about: 'Студент 3-го курса факультета вычислительной математики и кибернетики. Ищу стажировку в IT-компании.',
                skills: ['JavaScript', 'Python', 'React', 'UI/UX Дизайн'],
                languages: [
                    { name: 'Русский', level: 'Родной' },
                    { name: 'Английский', level: 'B2' }
                ],
                education: [{
                    institution: 'МГУ им. Ломоносова',
                    degree: 'Бакалавр информатики',
                    period: '2021 - 2025'
                }],
                experience: [],
                careerGoals: [
                    'Найти стажировку frontend-разработчика',
                    'Выучить TypeScript и Redux',
                    'Построить профессиональную сеть контактов'
                ]
            });
        }

        // Тестовые вакансии
        if (data.jobs.length === 0) {
            data.jobs = [
                {
                    id: 1,
                    title: 'Frontend-разработчик (стажировка)',
                    company: 'Яндекс',
                    location: 'Москва',
                    salary: 'от 50 000 ₽',
                    description: 'Ищем начинающего frontend-разработчика для работы над интересными проектами.',
                    requirements: ['HTML/CSS', 'JavaScript', 'React'],
                    type: 'internship',
                    postedAt: '2024-01-15'
                },
                {
                    id: 2,
                    title: 'Python разработчик',
                    company: 'Сбер',
                    location: 'Москва',
                    salary: 'от 120 000 ₽',
                    description: 'Разработка backend-сервисов для банковских продуктов.',
                    requirements: ['Python', 'Django', 'PostgreSQL'],
                    type: 'full-time',
                    postedAt: '2024-01-10'
                }
            ];
            this.saveData(data);
        }
    }
}

// Создаем глобальный экземпляр базы данных
window.db = new Database();
