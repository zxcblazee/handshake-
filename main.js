//Чат-Бот
document.addEventListener('DOMContentLoaded', function() {
            const chatToggle = document.getElementById('chatToggle');
            const chatContainer = document.getElementById('chatContainer');
            const chatClose = document.getElementById('chatClose');
            const chatMessages = document.getElementById('chatMessages');
            const chatInput = document.getElementById('chatInput');
            const chatSend = document.getElementById('chatSend');
            const quickQuestions = document.getElementById('quickQuestions');
            
            chatToggle.addEventListener('click', function() {
                chatContainer.classList.toggle('open');
                if (chatContainer.classList.contains('open')) {
                    chatInput.focus();
                }
            });
            
            chatClose.addEventListener('click', function() {
                chatContainer.classList.remove('open');
            });
            
            const botResponses = {
                "Как создать профиль?": "Чтобы создать профиль на Handshake:\n\n1. Нажмите кнопку 'Регистрация' в правом верхнем углу\n2. Выберите тип аккаунта (студент, работодатель, карьерный центр)\n3. Заполните информацию о себе, добавив образование, навыки и опыт\n4. Загрузите резюме (опционально)\n5. Настройте параметры конфиденциальности\n6. Начните поиск возможностей!",
                
                "Как найти стажировку?": "Поиск стажировок на Handshake:\n\n• Используйте фильтры: по местоположению, отрасли, типу работы\n• Настройте оповещения о новых стажировках\n• Изучите компании из раздела 'Кто нанимает'\n• Посещайте виртуальные карьерные мероприятия\n• Связывайтесь напрямую с рекрутерами интересующих компаний",
                
                "Какие компании здесь есть?": "Handshake сотрудничает с 550,000+ работодателей, включая:\n\n• Крупные технологические компании (Яндекс, VK, Тинькофф)\n• Финансовые организации (Сбер, Газпромбанк)\n• Розничные сети (Ozon, Wildberries)\n• Стартапы и малый бизнес\n• Международные компании\n\nПолный список доступен в разделе 'Кто нанимает'",
                
                "Как подготовить резюме?": "Советы по резюме:\n\n1. Используйте четкую структуру\n2. Указывайте конкретные достижения (цифры, проценты)\n3. Адаптируйте резюме под каждую вакансию\n4. Проверьте грамматику и орфографию\n5. Добавьте ключевые слова из описания вакансии\n6. Сохраняйте в формате PDF\n\nВ разделе 'Карьерные советы' есть подробные руководства!"
            };
            

            function addMessage(text, isUser = false) {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${isUser ? 'message-user' : 'message-bot'}`;
                
                // Форматирование 
                const formattedText = text.replace(/\n/g, '<br>');
                messageDiv.innerHTML = formattedText;
                
                chatMessages.appendChild(messageDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }
            
            // набора текста 
            function simulateTyping(responseText) {
                const typingDiv = document.createElement('div');
                typingDiv.className = 'typing-indicator';
                typingDiv.innerHTML = `
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                `;
                
                chatMessages.appendChild(typingDiv);
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                setTimeout(() => {
                    typingDiv.remove();
                    addMessage(responseText, false);
                }, 1500);
            }
            
            function sendMessage() {
                const message = chatInput.value.trim();
                if (!message) return;
                
                addMessage(message, true);
                chatInput.value = '';
                chatSend.disabled = true;
                
                setTimeout(() => {
                    let response = "Спасибо за ваш вопрос! Я могу помочь с информацией о создании профиля, поиске стажировок, компаниях-партнерах и подготовке резюме. Можете уточнить ваш запрос?";
                    
                    // готовый ответ?
                    for (const [question, answer] of Object.entries(botResponses)) {
                        if (message.toLowerCase().includes(question.toLowerCase().replace('?', ''))) {
                            response = answer;
                            break;
                        }
                    }
                    
                    simulateTyping(response);
                    chatSend.disabled = false;
                }, 1000);
            }
            
            chatInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    sendMessage();
                }
            });
            
            chatSend.addEventListener('click', sendMessage);
            
            chatInput.addEventListener('input', function() {
                chatSend.disabled = !this.value.trim();
            });
            
            document.querySelectorAll('.quick-question').forEach(button => {
                button.addEventListener('click', function() {
                    const question = this.getAttribute('data-question');
                    chatInput.value = question;
                    sendMessage();
                });
            });
            
            // Закрытие чата 
            document.addEventListener('click', function(event) {
                if (!chatContainer.contains(event.target) && !chatToggle.contains(event.target)) {
                    chatContainer.classList.remove('open');
                }
            });
        });



//Анимки
document.addEventListener('DOMContentLoaded', function() {

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
    
    document.querySelectorAll('.feature-card, .step, .tip-card, .employer-logo').forEach(el => {
        observer.observe(el);
    });
    
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