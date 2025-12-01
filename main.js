function handleAuthRedirect() {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'signup') {
        if (window.location.pathname.includes('auth/auth.html')) {
            const authManager = new AuthManager();
            authManager.switchTab('register');
        }
    }
}
function updateAuthLinks() {
    // Обновляем ссылки в шапке
    const loginBtn = document.querySelector('.btn-login');
    const signupBtn = document.querySelector('.btn-signup');
    const heroSignupBtn = document.querySelector('.btn-hero.btn-primary');
    
    if (loginBtn) loginBtn.href = 'auth/auth.html';
    if (signupBtn) signupBtn.href = 'auth/auth.html?action=signup';
    if (heroSignupBtn) heroSignupBtn.href = 'auth/auth.html?action=signup';
}
// Чат поддержки 
function createChatWidget() {
    const chatWidget = document.createElement('div');
    chatWidget.className = 'chat-widget';
    chatWidget.innerHTML = `
        <div class="chat-header">
            <span>💬 Поддержка Handshake</span>
            <button class="chat-toggle">−</button>
        </div>
        <div class="chat-body">
            <div class="chat-messages">
                <div class="message bot-message">
                    <div class="message-avatar">🤖</div>
                    <div class="message-text">Привет! Я виртуальный помощник Handshake. Чем могу помочь?</div>
                </div>
            </div>
            <div class="chat-input">
                <input type="text" placeholder="Напишите ваш вопрос..." maxlength="500">
                <button class="send-btn">➤</button>
            </div>
        </div>
    `;

    document.body.appendChild(chatWidget);

    // Функции чата
    let isChatMinimized = false;

    const toggleBtn = chatWidget.querySelector('.chat-toggle');
    const sendBtn = chatWidget.querySelector('.send-btn');
    const chatInput = chatWidget.querySelector('input');
    const chatMessages = chatWidget.querySelector('.chat-messages');

    // Переключение состояния чата
    toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleChat();
    });

    // Развертывание чата при клике на заголовок
    chatWidget.querySelector('.chat-header').addEventListener('click', (e) => {
        if (e.target === toggleBtn) return;
        if (isChatMinimized) {
            toggleChat();
        }
    });

    // Отправка сообщения
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    function toggleChat() {
        isChatMinimized = !isChatMinimized;
        chatWidget.classList.toggle('minimized');
        toggleBtn.textContent = isChatMinimized ? '+' : '−';
        
        // Авто-скролл при разворачивании
        if (!isChatMinimized) {
            setTimeout(() => {
                scrollToBottom();
            }, 100);
        }
    }

    function sendMessage() {
        const message = chatInput.value.trim();
        
        if (message) {
            // Добавляем сообщение пользователя
            addMessage(message, 'user');
            chatInput.value = '';
            
            // Имитация ответа бота
            setTimeout(() => {
                const botResponse = getBotResponse(message);
                addMessage(botResponse, 'bot');
            }, 1000);
        }
    }

    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-text">${escapeHtml(text)}</div>
                <div class="message-avatar">👤</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-text">${escapeHtml(text)}</div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
    }

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function getBotResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        
        
        if (lowerMessage.includes('привет') || lowerMessage.includes('здравств')) {
            return 'Привет! Рад вас видеть! Как я могу помочь с поиском работы или стажировки?';
        } else if (lowerMessage.includes('работа') || lowerMessage.includes('ваканс')) {
            return 'Для поиска работы перейдите в раздел "Для студентов" и используйте наш поиск вакансий. Тысячи компаний ждут вас!';
        } else if (lowerMessage.includes('стажировк')) {
            return 'Стажировки можно найти в том же разделе, что и вакансии. Рекомендую настроить фильтры по вашему направлению.';
        } else if (lowerMessage.includes('резюме') || lowerMessage.includes('cv')) {
            return 'В разделе "Карьерные советы" есть подробные инструкции по созданию эффективного резюме.';
        } else if (lowerMessage.includes('собеседован')) {
            return 'Подготовиться к собеседованию помогут материалы в разделе "Карьерные советы". Там есть примеры вопросов и ответов.';
        } else if (lowerMessage.includes('регистрац') || lowerMessage.includes('аккаунт')) {
            return 'Для регистрации нажмите кнопку "Регистрация" в правом верхнем углу сайта. Это займет всего несколько минут!';
        } else if (lowerMessage.includes('спасибо') || lowerMessage.includes('благодар')) {
            return 'Пожалуйста! Всегда рад помочь. Если есть еще вопросы - обращайтесь!';
        } else if (lowerMessage.includes('пока') || lowerMessage.includes('до свидан')) {
            return 'До свидания! Удачи в поиске работы. Возвращайтесь, если понадобится помощь!';
        } else {
            return 'Спасибо за вопрос! Для более детальной помощи рекомендую обратиться в наш центр поддержки через раздел "Свяжитесь с нами" в футере сайта.';
        }
    }

    chatInput.focus();
}

// Создаем чат после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    createChatWidget();
    updateAuthLinks();
    handleAuthRedirect();
    console.log('Handshake loaded! 🚀');
});

document.addEventListener('DOMContentLoaded', function() {
    // Плавный скролл для навигационных ссылок
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if(this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#start') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Анимация появления элементов при скролле
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Наблюдаем за карточками
    document.querySelectorAll('.feature-card, .step, .tip-card, .employer-logo').forEach(el => {
        observer.observe(el);
    });
    
    // Добавляем класс для анимации
    const style = document.createElement('style');
    style.textContent = `
        .feature-card, .step, .tip-card, .employer-logo {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .feature-card.animate-in, .step.animate-in, .tip-card.animate-in, .employer-logo.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);
});