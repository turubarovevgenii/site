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

// ========== ФУНКЦИИ ДЛЯ УЧЕБНОГО ПЛАНА ==========

// Функция для рендеринга таблицы учебного плана
function renderCurriculumTable(curriculumData) {
    console.log('Рендеринг таблицы с', curriculumData.length, 'элементами');
    
    // 1. Скрываем спиннер загрузки
    const loadingElement = document.getElementById('curriculumLoading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    // 2. Показываем контейнер таблицы
    const tableContainer = document.querySelector('.curriculum-table-container');
    if (tableContainer) {
        tableContainer.style.display = 'block';
    }
    
    // 3. Находим тело таблицы
    const tableBody = document.getElementById('curriculumTableBody');
    if (!tableBody) {
        console.error('Не найдено тело таблицы (curriculumTableBody)');
        return;
    }
    
    // 4. Очищаем таблицу перед заполнением
    tableBody.innerHTML = '';
    
    // 5. Заполняем таблицу данными
    curriculumData.forEach((item, index) => {
        const assessmentClass = getAssessmentClass(item['Формы пром. атт.']);
        const typeClass = getDisciplineTypeClass(item['Индекс']);
        const typeName = getDisciplineTypeName(item['Индекс']);
        const blockType = typeClass.replace('discipline-type ', '');
        
        // Форматируем семестры для отображения
        const semesters = item['Семестры'] || '';
        const formattedSemesters = formatSemestersDisplay(semesters);
        
        const row = document.createElement('tr');
        row.className = 'curriculum-row';
        row.setAttribute('data-block', blockType);
        row.setAttribute('data-semesters', semesters);
        
        row.innerHTML = `
            <td>
                <span class="discipline-code">${item['Индекс'] || '—'}</span>
            </td>
            <td>
                <strong>${item['Наименование'] || '—'}</strong>
            </td>
            <td>
                <span class="exam-type ${assessmentClass}">
                    ${item['Формы пром. атт.'] || '—'}
                </span>
            </td>
            <td>
                <span class="semester-badge">${formattedSemesters}</span>
            </td>
            <td>
                <span class="discipline-type ${typeClass}">${typeName}</span>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    console.log('Таблица успешно заполнена, строк:', curriculumData.length);
    
    // 6. Добавляем информацию о количестве дисциплин
    addCurriculumStats(curriculumData.length);
    
    // 7. Инициализируем фильтры
    initCurriculumFilters();
}

// Вспомогательная функция для форматирования отображения семестров
function formatSemestersDisplay(semesters) {
    if (!semesters) return '—';
    
    const semArray = semesters.split(',').map(s => s.trim());
    
    // Если много семестров подряд, показываем как диапазон
    if (semArray.length > 3) {
        // Проверяем, идут ли семестры по порядку
        const sorted = [...semArray].sort((a, b) => a - b);
        let isSequential = true;
        
        for (let i = 1; i < sorted.length; i++) {
            if (parseInt(sorted[i]) !== parseInt(sorted[i-1]) + 1) {
                isSequential = false;
                break;
            }
        }
        
        if (isSequential) {
            return `${sorted[0]}-${sorted[sorted.length - 1]}`;
        }
    }
    
    return semesters;
}

// Добавляем статистику
function addCurriculumStats(count) {
    const curriculumSection = document.getElementById('curriculum');
    if (!curriculumSection) return;
    
    // Удаляем старую статистику, если есть
    const oldStats = curriculumSection.querySelector('.curriculum-stats');
    if (oldStats) {
        oldStats.remove();
    }
    
    const statsDiv = document.createElement('div');
    statsDiv.className = 'curriculum-stats';
    statsDiv.style.cssText = 'margin-top: 1rem; padding: 1rem; background-color: #f8f9fa; border-radius: 8px; font-size: 0.9rem;';
    
    // Подсчитываем количество по типам
    const baseCount = document.querySelectorAll('.curriculum-row[data-block="base"]').length;
    const variableCount = document.querySelectorAll('.curriculum-row[data-block="variable"]').length;
    const practiceCount = document.querySelectorAll('.curriculum-row[data-block="practice"]').length;
    const finalCount = document.querySelectorAll('.curriculum-row[data-block="final"]').length;
    
    statsDiv.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;">
            <div style="text-align: center;">
                <div style="font-size: 1.2rem; font-weight: bold; color: #28a745;">${count}</div>
                <div style="font-size: 0.8rem;">Всего дисциплин</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 1.2rem; font-weight: bold; color: #28a745;">${baseCount}</div>
                <div style="font-size: 0.8rem;">Базовая часть</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 1.2rem; font-weight: bold; color: #0056b3;">${variableCount}</div>
                <div style="font-size: 0.8rem;">Вариативная часть</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 1.2rem; font-weight: bold; color: #ffc107;">${practiceCount}</div>
                <div style="font-size: 0.8rem;">Практики</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 1.2rem; font-weight: bold; color: #6c757d;">${finalCount}</div>
                <div style="font-size: 0.8rem;">ГИА/ФТД</div>
            </div>
        </div>
    `;
    
    curriculumSection.appendChild(statsDiv);
}

// ========== ИСПРАВЛЕННЫЕ ФУНКЦИИ ФИЛЬТРАЦИИ ==========

// Глобальные переменные для хранения состояния фильтров
let currentBlockFilter = 'all';
let currentSemesterFilter = 'all';

// Инициализация фильтров
function initCurriculumFilters() {
    console.log('Инициализация фильтров учебного плана');
    
    // Функция фильтрации по блоку
    window.filterCurriculumByBlock = function(block) {
        currentBlockFilter = block;
        
        // Обновляем активную кнопку
        const buttons = document.querySelectorAll('.curriculum-filter-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        applyCombinedFilters();
    };
    
    // Функция фильтрации по семестрам
    window.filterCurriculumBySemester = function(semester) {
        currentSemesterFilter = semester;
        
        // Обновляем активную кнопку
        const buttons = document.querySelectorAll('.semester-filter-btn');
        buttons.forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        applyCombinedFilters();
    };
    
    function applyCombinedFilters() {
        const rows = document.querySelectorAll('.curriculum-row');
        let visibleCount = 0;
        
        console.log(`Применяем фильтры: блок=${currentBlockFilter}, семестр=${currentSemesterFilter}`);
        
        rows.forEach(row => {
            const blockType = row.getAttribute('data-block');
            const semesters = row.getAttribute('data-semesters');
            
            // Проверяем фильтр по блоку
            const blockMatch = currentBlockFilter === 'all' || blockType === currentBlockFilter;
            
            // Проверяем фильтр по семестру
            let semesterMatch = false;
            if (currentSemesterFilter === 'all') {
                semesterMatch = true;
            } else if (semesters) {
                const semArray = semesters.split(',').map(s => s.trim());
                semesterMatch = semArray.includes(currentSemesterFilter);
            }
            
            // Показываем строку, если она соответствует ВСЕМ активным фильтрам
            if (blockMatch && semesterMatch) {
                row.style.display = '';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });
        
        console.log(`Показано ${visibleCount} строк из ${rows.length}`);
        
        // Обновляем статистику
        updateVisibleStats(visibleCount);
        
        // Обновляем индикатор фильтров
        updateFilterStatus(visibleCount);
    }
    
    // Обновляем статистику видимых строк
    function updateVisibleStats(count) {
        const statsDiv = document.querySelector('.curriculum-stats');
        if (statsDiv) {
            const totalElement = statsDiv.querySelector('div:first-child .stat-value');
            if (totalElement) {
                totalElement.textContent = count;
                totalElement.style.color = count > 0 ? '#28a745' : '#dc3545';
            }
        }
    }
    
    // Обновляем статус фильтров
    function updateFilterStatus(visibleCount) {
        const filterStatus = document.getElementById('filterStatus');
        const filterText = document.getElementById('activeFiltersText');
        
        if (!filterStatus || !filterText) return;
        
        // Определяем названия фильтров
        const blockNames = {
            'all': 'Все дисциплины',
            'base': 'Базовая часть',
            'variable': 'Вариативная часть',
            'practice': 'Практики',
            'final': 'ГИА и ФТД'
        };
        
        const semesterNames = {
            'all': 'Все семестры',
            '1': '1 семестр',
            '2': '2 семестр',
            '3': '3 семестр',
            '4': '4 семестр',
            '5': '5 семестр',
            '6': '6 семестр',
            '7': '7 семестр',
            '8': '8 семестр',
            '9': '9 семестр'
        };
        
        const blockName = blockNames[currentBlockFilter] || currentBlockFilter;
        const semesterName = semesterNames[currentSemesterFilter] || currentSemesterFilter + ' семестр';
        
        // Показываем индикатор только если есть активные фильтры
        if (currentBlockFilter !== 'all' || currentSemesterFilter !== 'all') {
            filterStatus.style.display = 'block';
            filterText.innerHTML = `
                <span style="color: #007bff;">${blockName}</span>
                <span style="margin: 0 5px;">и</span>
                <span style="color: #28a745;">${semesterName}</span>
                <span style="margin-left: 10px; font-weight: bold; color: ${visibleCount > 0 ? '#28a745' : '#dc3545'}">
                    (показано: ${visibleCount})
                </span>
            `;
        } else {
            filterStatus.style.display = 'none';
        }
    }
    
    // Инициализируем отображение
    applyCombinedFilters();
}

// Функция для статических данных (если JSON не загрузился)
function renderStaticCurriculum() {
    console.log('Используем статические данные учебного плана');
    
    const staticData = [
        { 
            "Индекс": "Б1.О.01", 
            "Наименование": "Иностранный язык", 
            "Формы пром. атт.": "Экзамен", 
            "Семестры": "1,2,3,4" 
        },
        { 
            "Индекс": "Б1.О.02", 
            "Наименование": "История России", 
            "Формы пром. атт.": "Экзамен", 
            "Семестры": "1,2" 
        },
        { 
            "Индекс": "Б1.О.03", 
            "Наименование": "Философия", 
            "Формы пром. атт.": "Зачёт", 
            "Семестры": "3" 
        },
        { 
            "Индекс": "Б1.О.04", 
            "Наименование": "Физическая культура и спорт", 
            "Формы пром. атт.": "Зачёт", 
            "Семестры": "1,2,3,4,5,6,7,8,9" 
        },
        { 
            "Индекс": "Б1.О.05", 
            "Наименование": "Безопасность жизнедеятельности", 
            "Формы пром. атт.": "Зачёт", 
            "Семестры": "5" 
        }
    ];
    
    renderCurriculumTable(staticData);
}

// Вспомогательные функции для определения классов
function getAssessmentClass(assessmentType) {
    const type = assessmentType ? assessmentType.toLowerCase() : '';
    if (type.includes('экзамен')) return 'exam-type exam';
    if (type.includes('зачёт с оценкой')) return 'exam-type graded-credit';
    if (type.includes('курсовой проект')) return 'exam-type project';
    if (type.includes('курсовая работа')) return 'exam-type course-work';
    if (type.includes('зачёт')) return 'exam-type credit';
    return 'exam-type other';
}

function getDisciplineTypeClass(code) {
    if (!code) return 'discipline-type other';
    if (code.startsWith('Б1.О')) return 'discipline-type base';
    if (code.startsWith('Б1.В')) return 'discipline-type variable';
    if (code.startsWith('Б2.')) return 'discipline-type practice';
    if (code.startsWith('Б3.')) return 'discipline-type final';
    if (code.startsWith('ФТД')) return 'discipline-type final';
    return 'discipline-type other';
}

function getDisciplineTypeName(code) {
    if (!code) return 'Другое';
    if (code.startsWith('Б1.О')) return 'Базовая';
    if (code.startsWith('Б1.В')) return 'Вариативная';
    if (code.startsWith('Б2.')) return 'Практика';
    if (code.startsWith('Б3.')) return 'ГИА';
    if (code.startsWith('ФТД')) return 'ФТД';
    return 'Другое';
}

// Загрузка учебного плана
async function loadProgramCurriculum(programId) {
    try {
        console.log(`Загрузка учебного плана для программы ID: ${programId}`);
        
        // Используем фиксированный файл для демо
        const response = await fetch('./js/curriculum-1.json');
        
        if (!response.ok) {
            console.warn('Файл учебного плана не найден, используем статические данные');
            return;
        }
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new TypeError("Получен не JSON файл учебного плана!");
        }
        
        const curriculumData = await response.json();
        console.log('Загруженные данные учебного плана:', curriculumData);
        
        // Проверяем структуру данных
        if (!Array.isArray(curriculumData)) {
            console.error('Некорректная структура данных учебного плана:', curriculumData);
            return;
        }
        
        // Проверяем наличие обязательных полей
        if (curriculumData.length > 0) {
            const firstItem = curriculumData[0];
            const requiredFields = ['Индекс', 'Наименование', 'Формы пром. атт.', 'Семестры'];
            const missingFields = requiredFields.filter(field => !firstItem.hasOwnProperty(field));
            
            if (missingFields.length > 0) {
                console.error('Отсутствуют обязательные поля в данных:', missingFields);
                return;
            }
        }
        
        // Рендерим таблицу
        renderCurriculumTable(curriculumData);
        
    } catch (error) {
        console.error('Ошибка загрузки учебного плана:', error);
        // В случае ошибки показываем статические данные
        renderStaticCurriculum();
    }
}

// Функция для загрузки данных программы
async function loadProgramData() {
    try {
        showLoading(true);
        
        const urlParams = new URLSearchParams(window.location.search);
        const programId = urlParams.get('id');
        const programCode = urlParams.get('code');
        
        // Если нет параметров, используем демо-данные
        if (!programId && !programCode) {
            console.log('Нет ID или кода программы, загружаем демо-данные');
            await loadDemoData();
            return;
        }
        
        // Пробуем загрузить данные из JSON
        let programData = null;
        
        try {
            const response = await fetch('./js/cchgeu_programs.json');
            
            if (!response.ok) {

                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new TypeError("Получен не JSON!");
            }
            
            const data = await response.json();
            console.log('Загруженные данные:', data);
            
            // Проверяем структуру данных
            if (!data || !data.programs || !Array.isArray(data.programs)) {
                throw new Error('Неверная структура данных JSON');
            }
            
            // Ищем программу
            if (programId) {
                programData = data.programs.find(p => parseInt(p.id) === parseInt(programId));
                console.log(`Поиск программы с ID ${programId}:`, programData);
            } else if (programCode) {
                programData = data.programs.find(p => p.code === programCode);
                console.log(`Поиск программы с кодом ${programCode}:`, programData);
            }
            
        } catch (fetchError) {
            console.error('Ошибка загрузки JSON:', fetchError);
            console.log('Используем демо-данные из-за ошибки загрузки');
        }
        
        // Если нашли программу - обновляем страницу
        if (programData) {
            console.log('Найдена программа:', programData);
            updateProgramPage(programData);
            
            // Загружаем дополнительные детали, если есть
            if (programData.hasDetails && programData.id) {
                await loadProgramDetails(programData.id);
            }
        } else {
            console.log('Программа не найдена в JSON, загружаем демо-данные');
            await loadDemoData();
        }
        
    } catch (error) {
        console.error('Критическая ошибка в loadProgramData:', error);
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
