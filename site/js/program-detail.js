// Основная функция для переключения вкладок
function showTab(tabId) {
    // Скрываем все вкладки
    const tabPanes = document.querySelectorAll('.tab-pane');
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
    });
    
    // Убираем активный класс у всех кнопок вкладок
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показываем выбранную вкладку
    const selectedTab = document.getElementById(tabId);
    if (selectedTab) {
        selectedTab.classList.add('active');
        
        // Активируем соответствующую кнопку
        const activeBtn = document.querySelector(`.tab-btn[onclick="showTab('${tabId}')"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        // Прокручиваем к вкладкам, если это не первая вкладка
        if (tabId !== 'general') {
            document.querySelector('.tabs-container').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
        
        // Загружаем контент вкладки, если он еще не загружен
        loadTabContent(tabId);
    }
}

// Функция для загрузки контента вкладки
async function loadTabContent(tabId) {
    const tabPane = document.getElementById(tabId);
    if (!tabPane || tabPane.dataset.loaded === 'true') return;
    
    try {
        // Получаем ID программы из URL
        const urlParams = new URLSearchParams(window.location.search);
        const programId = urlParams.get('id');
        
        if (!programId) return;
        
        // Загружаем данные для вкладки
        switch(tabId) {
            case 'documents':
                await loadProgramDocuments(programId);
                break;
            case 'curriculum':
                await loadProgramCurriculum(programId);
                break;
            case 'career':
                await loadProgramCareer(programId);
                break;
            case 'teachers':
                await loadProgramTeachers(programId);
                break;
        }
        
        tabPane.dataset.loaded = 'true';
    } catch (error) {
        console.error(`Ошибка загрузки вкладки ${tabId}:`, error);
        showErrorInTab(tabId, 'Не удалось загрузить данные');
    }
}

// Функция для показа документов по годам
function showDocumentsYear(year) {
    // Убираем активный класс у всех кнопок
    const yearTabs = document.querySelectorAll('.doc-tab');
    yearTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Скрываем все контейнеры документов
    const docContainers = ['2024', '2023', '2022'];
    docContainers.forEach(y => {
        const container = document.getElementById(`docs-${y}`);
        if (container) {
            container.classList.add('hidden');
        }
    });
    
    // Активируем выбранную кнопку
    const activeTab = document.querySelector(`.doc-tab[onclick="showDocumentsYear('${year}')"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Показываем выбранный контейнер
    const selectedContainer = document.getElementById(`docs-${year}`);
    if (selectedContainer) {
        selectedContainer.classList.remove('hidden');
    }
}

// Функция для фильтрации учебного плана по семестрам
function filterCurriculum(semester) {
    // Убираем активный класс у всех кнопок
    const semTabs = document.querySelectorAll('.doc-tab[onclick^="filterCurriculum"]');
    semTabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Активируем выбранную кнопку
    const activeTab = document.querySelector(`.doc-tab[onclick="filterCurriculum('${semester}')"]`);
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // Показываем/скрываем строки таблицы
    const tableRows = document.querySelectorAll('#curriculumTable tbody tr');
    tableRows.forEach(row => {
        if (semester === 'all' || row.getAttribute('data-semester') === semester) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Функция для загрузки данных программы
async function loadProgramData() {
    try {
        showLoading(true);
        
        const urlParams = new URLSearchParams(window.location.search);
        const programId = urlParams.get('id');
        const programCode = urlParams.get('code');
        
        if (!programId && !programCode) {
            await loadDemoData();
            return;
        }
        
        // Загружаем основной JSON с программами
        const response = await fetch('data/programs.json');
        const data = await response.json();
        
        // Ищем программу по ID или коду
        let program;
        if (programId) {
            program = data.programs.find(p => p.id == programId);
        } else if (programCode) {
            program = data.programs.find(p => p.code === programCode);
        }
        
        if (program) {
            updateProgramPage(program);
            
            // Загружаем дополнительные детали, если есть
            if (program.hasDetails) {
                await loadProgramDetails(program.id);
            }
        } else {
            console.error('Программа не найдена');
            await loadDemoData();
        }
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        await loadDemoData();
    } finally {
        showLoading(false);
    }
}

// Функция обновления страницы программы
function updateProgramPage(program) {
    // Обновляем заголовок страницы
    document.title = `${program.code} ${program.title} - ВГТУ`;
    
    // Обновляем хлебные крошки
    updateBreadcrumbs(program);
    
    // Обновляем основную информацию
    document.querySelector('.program-code').textContent = program.code;
    document.querySelector('.program-title h1').textContent = program.title;
    document.querySelector('.program-profile').textContent = program.profile || program.title;
    
    // Обновляем мета-информацию
    updateMetaInfo(program);
    
    // Обновляем вкладку "Общие сведения"
    updateGeneralTab(program);
    
    // Обновляем контакты в сайдбаре
    updateSidebarContacts(program);
    
    // Обновляем статистику
    updateStatistics(program);
}

// Обновление хлебных крошек
function updateBreadcrumbs(program) {
    const breadcrumbs = document.querySelector('.breadcrumbs li:last-child');
    if (breadcrumbs) {
        breadcrumbs.innerHTML = `<a href="${program.link || '#'}">${program.title} (${program.code})</a>`;
    }
}

// Обновление мета-информации
function updateMetaInfo(program) {
    const metaItems = document.querySelectorAll('.meta-item');
    
    if (metaItems.length >= 5) {
        // Факультет
        if (metaItems[0].querySelector('.meta-value')) {
            metaItems[0].querySelector('.meta-value').textContent = program.faculty || '—';
        }
        
        // Уровень образования
        if (metaItems[1].querySelector('.meta-value')) {
            metaItems[1].querySelector('.meta-value').textContent = 
                program.level === 'bachelor' ? 'Бакалавриат' : 
                program.level === 'master' ? 'Магистратура' : 
                program.level === 'specialist' ? 'Специалитет' : '—';
        }
        
        // Срок обучения
        if (metaItems[2].querySelector('.meta-value')) {
            metaItems[2].querySelector('.meta-value').textContent = 
                `${program.duration || '—'} (${program.form || '—'})`;
        }
        
        // Бюджетные места
        if (metaItems[3].querySelector('.meta-value')) {
            metaItems[3].querySelector('.meta-value').textContent = 
                `${program.budgetPlaces || '—'} (2024 год)`;
        }
        
        // Стоимость
        if (metaItems[4].querySelector('.meta-value')) {
            metaItems[4].querySelector('.meta-value').textContent = 
                program.price ? `${program.price.toLocaleString('ru-RU')} ₽/год` : 'Уточняйте';
        }
    }
}

// Обновление вкладки "Общие сведения"
function updateGeneralTab(program) {
    const generalTab = document.getElementById('general');
    if (!generalTab) return;
    
    // Описание
    const description = generalTab.querySelector('p');
    if (description && program.description) {
        description.textContent = program.description;
    }
    
    // Цель программы
    const goalSection = generalTab.querySelector('.info-section:nth-child(1) p');
    if (goalSection && program.details?.goal) {
        goalSection.textContent = program.details.goal;
    }
    
    // Задачи программы
    const tasksList = generalTab.querySelector('.info-section:nth-child(2) ul');
    if (tasksList && program.details?.tasks && Array.isArray(program.details.tasks)) {
        tasksList.innerHTML = program.details.tasks.map(task => 
            `<li>${task}</li>`
        ).join('');
    }
}

// Обновление контактов в сайдбаре
function updateSidebarContacts(program) {
    const contactList = document.querySelector('.contact-list');
    if (!contactList) return;
    
    if (program.details?.contacts && Array.isArray(program.details.contacts)) {
        contactList.innerHTML = program.details.contacts.map(contact => `
            <li>
                <div class="contact-name">${contact.name}</div>
                <div class="contact-role">${contact.role}</div>
                <div class="contact-info">
                    <i class="fas fa-phone"></i> ${contact.phone || '—'}
                </div>
                <div class="contact-info">
                    <i class="fas fa-envelope"></i> ${contact.email || '—'}
                </div>
            </li>
        `).join('');
    }
}

// Обновление статистики
function updateStatistics(program) {
    const statsGrid = document.querySelector('.stats-grid');
    if (!statsGrid) return;
    
    const stats = program.statistics || {
        employmentRate: 94,
        averageScore: 4.7,
        graduateCount: 1500,
        teacherCount: 15
    };
    
    const statItems = statsGrid.querySelectorAll('.stat-item');
    
    if (statItems.length >= 4) {
        statItems[0].querySelector('.stat-value').textContent = `${stats.employmentRate}%`;
        statItems[1].querySelector('.stat-value').textContent = program.budgetPlaces || '—';
        statItems[2].querySelector('.stat-value').textContent = stats.averageScore;
        statItems[3].querySelector('.stat-value').textContent = stats.teacherCount || 15;
    }
}

// Загрузка деталей программы
async function loadProgramDetails(programId) {
    try {
        const response = await fetch(`data/program-details/${programId}.json`);
        if (!response.ok) return null;
        
        const details = await response.json();
        
        // Обновляем страницу с деталями
        if (details.description) {
            const desc = document.querySelector('#general p');
            if (desc) desc.textContent = details.description;
        }
        
        if (details.contacts) {
            updateSidebarContacts({ details });
        }
        
        return details;
    } catch (error) {
        console.error('Ошибка загрузки деталей:', error);
        return null;
    }
}

// Загрузка документов программы
async function loadProgramDocuments(programId) {
    try {
        const response = await fetch(`data/program-documents/${programId}.json`);
        if (!response.ok) {
            showDemoDocuments();
            return;
        }
        
        const documents = await response.json();
        renderDocuments(documents);
    } catch (error) {
        console.error('Ошибка загрузки документов:', error);
        showDemoDocuments();
    }
}

// Показать демо-документы
function showDemoDocuments() {
    const docs2024 = document.getElementById('docs-2024');
    if (docs2024) {
        // Оставляем существующие демо-документы
        console.log('Используются демо-документы');
    }
}

// Загрузка учебного плана
async function loadProgramCurriculum(programId) {
    try {
        const response = await fetch(`data/program-curriculum/${programId}.json`);
        if (!response.ok) {
            console.log('Используется демо-учебный план');
            return;
        }
        
        const curriculum = await response.json();
        renderCurriculum(curriculum);
    } catch (error) {
        console.error('Ошибка загрузки учебного плана:', error);
    }
}

// Загрузка информации о карьере
async function loadProgramCareer(programId) {
    // Заглушка - можно добавить загрузку реальных данных
    console.log('Загрузка карьерных данных для программы', programId);
}

// Загрузка информации о преподавателях
async function loadProgramTeachers(programId) {
    // Заглушка - можно добавить загрузку реальных данных
    console.log('Загрузка данных преподавателей для программы', programId);
}

// Функция для демо-данных
async function loadDemoData() {
    const demoProgram = {
        id: 1,
        code: "07.03.01",
        title: "Архитектура",
        profile: "Архитектура",
        faculty: "Факультет архитектуры и градостроительства",
        level: "bachelor",
        form: "Очная",
        duration: "5 лет",
        budgetPlaces: 25,
        price: 150000,
        description: "Подготовка архитекторов для проектирования жилых, общественных и промышленных зданий...",
        details: {
            goal: "Подготовка архитекторов, способных решать комплексные задачи проектирования...",
            tasks: [
                "Формирование профессиональных компетенций в области архитектурного проектирования",
                "Развитие навыков работы с современными технологиями проектирования (BIM, CAD)"
            ],
            contacts: [
                {
                    name: "Иванов Петр Сергеевич",
                    role: "Декан факультета",
                    phone: "+7 (473) 255-35-11",
                    email: "dean@vgasu.vrn.ru"
                }
            ]
        },
        statistics: {
            employmentRate: 94,
            averageScore: 4.7,
            graduateCount: 1500,
            teacherCount: 15
        }
    };
    
    updateProgramPage(demoProgram);
}

// Показать ошибку во вкладке
function showErrorInTab(tabId, message) {
    const tab = document.getElementById(tabId);
    if (tab) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
        `;
        tab.appendChild(errorDiv);
    }
}

// Показать/скрыть загрузку
function showLoading(show) {
    const loading = document.getElementById('loading') || createLoadingElement();
    loading.style.display = show ? 'block' : 'none';
}

function createLoadingElement() {
    const loading = document.createElement('div');
    loading.id = 'loading';
    loading.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(255,255,255,0.8);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    loading.innerHTML = `
        <div class="spinner" style="
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid var(--primary-blue);
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
    `;
    
    // Добавляем анимацию
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(loading);
    return loading;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    // Загружаем данные программы
    await loadProgramData();
    
    // Инициализируем обработчики
    const favoriteBtn = document.getElementById('favoriteBtn');
    if (favoriteBtn) {
        favoriteBtn.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.style.color = '#ff6b6b';
                showNotification('Программа добавлена в избранное');
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.style.color = '';
                showNotification('Программа удалена из избранного');
            }
        });
    }
    
    const compareBtn = document.getElementById('compareBtn');
    if (compareBtn) {
        compareBtn.addEventListener('click', function() {
            showNotification('Программа добавлена к сравнению');
        });
    }
    
    // Если есть хэш в URL, показываем соответствующую вкладку
    if (window.location.hash) {
        const tabId = window.location.hash.substring(1);
        if (['general', 'documents', 'curriculum', 'career', 'teachers'].includes(tabId)) {
            setTimeout(() => showTab(tabId), 100);
        }
    }
    
    // Добавляем обработчики для ссылок "Скачать" и "Просмотр"
    document.querySelectorAll('.document-actions a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.querySelector('i').classList.contains('fa-download') ? 'скачивания' : 'просмотра';
            showNotification(`Начинается ${action} документа... (демо)`);
        });
    });
});

// Функция показа уведомлений (дублируется для независимости)
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? 'var(--primary-blue)' : '#ff9800'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        box-shadow: var(--box-shadow);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        font-family: inherit;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Добавляем стили для анимации
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}