// JavaScript для интерактивности главной страницы с JSON данными

class ProgramsManager {
    constructor() {
        this.programs = [];
        this.filteredPrograms = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.filters = {
            faculty: '',
            level: '',
            code: '',
            name: '',
            form: ''
        };
        this.isInitialized = false;
    }

    // Нормализация уровня образования
    normalizeLevel(level) {
        if (!level) return 'bachelor';
        
        const lvl = level.toString().toLowerCase();
        if (lvl.includes('бакалавр') || lvl.includes('bachelor')) return 'bachelor';
        if (lvl.includes('магистр') || lvl.includes('master')) return 'master';
        if (lvl.includes('специалитет')) return 'specialist';
        if (lvl.includes('аспирант') || lvl.includes('postgraduate')) return 'postgraduate';
        if (lvl.includes('среднее профессиональное') || lvl.includes('колледж') || lvl.includes('secondary')) return 'secondary';
        return 'bachelor';
    }
// Функция для объединения данных из двух источников с подстановкой прочерков
mergeProgramsData(mainData, extendedData) {
    // Создаем Map для быстрого поиска программ по коду и названию
    const mainProgramsMap = new Map();
    
    // Индексируем основные программы по коду и названию
    mainData.forEach(program => {
        const key = `${program.code}_${program.title}`;
        mainProgramsMap.set(key, program);
    });
    
    const mergedPrograms = [];
    const processedCodes = new Set();
    
    // Обрабатываем расширенные данные (все программы)
    extendedData.forEach(extProgram => {
        // Извлекаем основное название и профиль из full_name
        const fullName = extProgram.full_name || extProgram.name;
        let title, profile;
        
        if (fullName.includes('Профиль')) {
            const parts = fullName.split('Профиль');
            title = parts[0].replace(extProgram.code, '').trim();
            profile = parts[1].trim().replace(/["«»]/g, '');
        } else if (fullName.includes('Специализация')) {
            const parts = fullName.split('Специализация');
            title = parts[0].replace(extProgram.code, '').trim();
            profile = parts[1].trim().replace(/["«»]/g, '');
        } else {
            title = fullName.replace(extProgram.code, '').trim();
            profile = fullName.replace(extProgram.code, '').trim();
        }
        
        // Формируем ключ для поиска в основных данных
        const searchKey = `${extProgram.code}_${title}`;
        const mainProgram = mainProgramsMap.get(searchKey);
        
        // Создаем объединенную программу
        const mergedProgram = {
            // Базовые данные из расширенного источника
            id: extProgram.id || extProgram.number,
            code: extProgram.code,
            title: title,
            profile: profile,
            full_name: fullName,
            
            // Данные из основного источника или значения по умолчанию
            education_level: extProgram.education_level || extProgram.category || '—',
            level: this.normalizeLevel(extProgram.education_level || extProgram.category),
            faculty: extProgram.faculty || '—',
            form: (mainProgram && mainProgram.form) || '—',
            duration: (mainProgram && mainProgram.duration) || '—',
            budgetPlaces: (mainProgram && mainProgram.budgetPlaces) || 0,
            price: (mainProgram && mainProgram.price) || 0,
            description: (mainProgram && mainProgram.description) || 'Подробная информация о программе будет доступна позже.',
            
            // Ссылка
            link: extProgram.link || (mainProgram && mainProgram.link) || '#',
            
            // Флаги
            hasDetails: !!mainProgram,
            updated: (mainProgram && mainProgram.updated) || '2024-01-15',
            
            // Добавляем source для отладки
            source: mainProgram ? 'merged' : 'extended_only'
        };
        
        mergedPrograms.push(mergedProgram);
        processedCodes.add(extProgram.code);
    });
    
    // Добавляем программы из основного источника, которых нет в расширенном
    mainData.forEach(mainProgram => {
        const alreadyIncluded = mergedPrograms.some(p => 
            p.code === mainProgram.code && p.title === mainProgram.title
        );
        
        if (!alreadyIncluded) {
            mergedPrograms.push({
                ...mainProgram,
                faculty: mainProgram.faculty || '—',
                form: mainProgram.form || '—',
                duration: mainProgram.duration || '—',
                budgetPlaces: mainProgram.budgetPlaces || 0,
                price: mainProgram.price || 0,
                description: mainProgram.description || 'Подробная информация о программе будет доступна позже.',
                link: mainProgram.link || '#',
                source: 'main_only'
            });
        }
    });
    
    console.log(`✅ Объединено программ: ${mergedPrograms.length}`);
    console.log(`📊 Статистика: ${mergedPrograms.filter(p => p.hasDetails).length} с деталями, ${mergedPrograms.filter(p => !p.hasDetails).length} без деталей`);
    
    return mergedPrograms;
}
    // Нормализация данных программ
   // Обновленный метод normalizeProgramsData для работы с объединенными данными
normalizeProgramsData(programs) {
    return programs.map(program => ({
        ...program,
        // Убеждаемся, что все поля заполнены
        level: program.level || this.normalizeLevel(program.education_level),
        formattedPrice: program.price && program.price > 0 ? 
            `${program.price.toLocaleString('ru-RU')} ₽/год` : 
            'Уточняйте',
        
        // Создаем URL для детальной страницы
        detailUrl: program.link && !program.link.includes('cchgeu.ru') 
            ? program.link 
            : `program-detail.html?id=${program.id}&code=${program.code}&title=${encodeURIComponent(program.title)}`,
        
        // Текст для поиска
        searchText: [
            program.code,
            program.title,
            program.profile || '',
            program.faculty || '',
            program.full_name || ''
        ].join(' ').toLowerCase(),
        
        // Устанавливаем значения по умолчанию для пустых полей
        budgetPlaces: program.budgetPlaces || 0,
        price: program.price || 0,
        duration: program.duration || '—',
        form: program.form || '—',
        faculty: program.faculty || '—',
        description: program.description || 'Информация о программе находится в стадии обновления.'
    }));
}

    // Обновление счетчика программ
    updateProgramsCount(count) {
        const counter = document.getElementById('programsCount');
        if (counter) {
            counter.textContent = count;
        }
    }

   // Заполнение фильтра факультетов
populateFacultyFilter() {
    const facultySelect = document.getElementById('facultyFilter');
    if (!facultySelect) return;
    
    const currentValue = facultySelect.value;
    facultySelect.innerHTML = '<option value="">Все факультеты</option>';
    
    // ДОБАВЛЯЕМ ВСЕ НОВЫЕ ФАКУЛЬТЕТЫ
    const allFaculties = [
        'Подготовка научно-педагогических кадров в аспирантуре',
        'Строительно-политехнический колледж',
        'Факультет информационных технологий и компьютерной безопасности',
        'Факультет инженерных систем и сооружений',
        'Факультет экономики, менеджмента и инновационных технологий',
        'Факультет радиотехники и электроники',
        'Дорожно-транспортный факультет',
        'Факультет машиностроения и аэрокосмической техники',
        'Строительный факультет',
        'Факультет энергетики и систем управления',
        'Факультет архитектуры и градостроительства',
        'Гуманитарный факультет'
    ];
    
    // Добавляем факультеты из данных + все перечисленные
    const dataFaculties = [...new Set(this.programs.map(p => p.faculty).filter(f => f))];
    const allUniqueFaculties = [...new Set([...allFaculties, ...dataFaculties])].sort();
    
    allUniqueFaculties.forEach(faculty => {
        const option = document.createElement('option');
        option.value = faculty;
        option.textContent = faculty;
        facultySelect.appendChild(option);
    });
    
    if (currentValue) {
        facultySelect.value = currentValue;
    }
}

    // Инициализация
    async init() {
        if (this.isInitialized) return;
        
        try {
            await this.loadProgramsData();
            this.setupEventListeners();
            this.render();
            this.isInitialized = true;
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Не удалось загрузить данные программ');
        }
    }

    // Загрузка данных из JSON
   async loadProgramsData(ignoreCache = false) {
    showLoading(true);
    
    try {
        const cachedData = localStorage.getItem('programsDataCache');
        const cacheTime = localStorage.getItem('programsCacheTime');
        
            let mainData = [];
            let extendedData = [];
            
            
            // Загружаем расширенный файл со всеми программами
            try {
                const extendedResponse = await fetch('js/cchgeu_programs.json');
                if (extendedResponse.ok) {
                    extendedData = await extendedResponse.json();
                    console.log(`✅ Загружено ${extendedData.length} программ из расширенного файла`);
                }
            } catch (error) {
                console.warn('⚠️ Расширенный файл cchgeu_programs.json не доступен:', error);
            }
            
            // Объединяем данные
            if (extendedData.length > 0) {
                this.programs = this.normalizeProgramsData(
                    this.mergeProgramsData(mainData, extendedData)
                );
            } else if (mainData.length > 0) {
                this.programs = this.normalizeProgramsData(mainData);
            } else {
                throw new Error('Нет доступных данных о программах');
            }
            
        
        this.filteredPrograms = [...this.programs];
        this.populateFacultyFilter();
        this.updateProgramsCount(this.filteredPrograms.length);
        
    } catch (error) {
        console.error('❌ Ошибка загрузки данных:', error);
        // Резервный вариант
        if (typeof programsData !== 'undefined') {
            this.programs = this.normalizeProgramsData(programsData);
            this.filteredPrograms = [...this.programs];
            this.populateFacultyFilter();
            this.updateProgramsCount(this.filteredPrograms.length);
        }
    } finally {
        showLoading(false);
    }
}


// Вспомогательная функция для безопасного отображения данных в renderPrograms
renderPrograms(programs) {
    const programsGrid = document.getElementById('programsGrid');
    
    if (!programsGrid) return;
    
    if (programs.length === 0) {
        programsGrid.innerHTML = this.getNoResultsHTML();
        return;
    }
    
    let programsHTML = '';
    
    programs.forEach(program => {
        // Безопасное получение данных
        const getSafeValue = (value, defaultValue = '—') => {
            return value && value !== 'undefined' && value !== 'null' && value !== '0' ? value : defaultValue;
        };
        
        const levelClass = `level-${program.level || 'bachelor'}`;
        const levelText = program.level === 'bachelor' ? 'Бакалавриат' : 
             program.level === 'master' ? 'Магистратура' : 
             program.level === 'specialist' ? 'Специалитет' : 
             program.level === 'postgraduate' ? 'Аспирантура' : 
             program.level === 'secondary' ? 'Среднее профессиональное' : '—';
        
        programsHTML += `
            <article class="program-card">
                <div class="program-header">
                    <div class="program-code">${getSafeValue(program.code, '—')}</div>
                    <div class="program-meta">
                        <span class="program-level ${levelClass}">${getSafeValue(levelText)}</span>
                        <span class="program-form">${getSafeValue(program.form)}</span>
                    </div>
                </div>
                
                <div class="program-body">
                    <h3 class="program-title">${getSafeValue(program.title, 'Название не указано')}</h3>
                    <p class="program-profile">${getSafeValue(program.profile, '—')}</p>
                    
                    <div class="program-faculty">
                        <i class="fas fa-university"></i>
                        ${getSafeValue(program.faculty)}
                    </div>
                    
                    <div class="program-details">
                        <div class="detail-item">
                            <span class="detail-label">Срок обучения</span>
                            <span class="detail-value">${getSafeValue(program.duration)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Бюджетных мест</span>
                            <span class="detail-value">${program.budgetPlaces > 0 ? program.budgetPlaces : '—'}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Стоимость</span>
                            <span class="detail-value">${getSafeValue(program.formattedPrice)}</span>
                        </div>
                        <div class="detail-item">
                            <span class="detail-label">Форма</span>
                            <span class="detail-value">${getSafeValue(program.form)}</span>
                        </div>
                    </div>
                    
                    <p class="program-description">${getSafeValue(program.description?.substring(0, 150), 'Описание программы временно недоступно.')}</p>
                </div>
                
                <div class="program-footer">
                    <a href="${getSafeValue(program.detailUrl, '#')}" 
                       class="btn btn-primary btn-small" 
                       ${program.link?.includes('http') ? 'target="_blank"' : ''}>
                        Подробнее
                    </a>
                    <div class="program-actions">
                        <button class="btn-icon btn-compare" aria-label="Добавить к сравнению">
                            <i class="fas fa-balance-scale"></i>
                        </button>
                        <button class="btn-icon btn-favorite" aria-label="Добавить в избранное">
                            <i class="far fa-star"></i>
                        </button>
                    </div>
                </div>
            </article>
        `;
    });
    
    programsGrid.innerHTML = programsHTML;
}

    // Настройка обработчиков событий
    setupEventListeners() {
        // Фильтры по уровню образования
        document.querySelectorAll('.filter-option[data-level]').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-option').forEach(opt => 
                    opt.classList.remove('active')
                );
                e.currentTarget.classList.add('active');
                this.filters.level = e.currentTarget.getAttribute('data-level');
                this.applyFilters();
            });
        });
        
        // Кнопка сброса фильтров
        document.getElementById('resetFilters').addEventListener('click', () => {
            this.resetFilters();
        });
        
        // Кнопка поиска
        document.getElementById('searchButton').addEventListener('click', () => {
            this.applyFilters();
        });
        
        // Реальный поиск при вводе
        document.getElementById('nameFilter').addEventListener('input', () => {
            this.debounceFilter();
        });
        
        document.getElementById('codeFilter').addEventListener('input', () => {
            this.debounceFilter();
        });
        
        // Изменение сортировки
        document.getElementById('sortSelect').addEventListener('change', () => {
            this.applyFilters();
        });
        
        // Изменение факультета
        document.getElementById('facultyFilter').addEventListener('change', () => {
            this.applyFilters();
        });
        
        // Смена вида (сетка/список)
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', this.handleViewChange.bind(this));
        });
        
        // Добавление в избранное
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-favorite')) {
                this.handleFavoriteClick(e);
            }
        });
        
        // Добавление к сравнению
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-compare')) {
                this.handleCompareClick(e);
            }
        });
    }

    // Применение фильтров
    applyFilters() {
        this.filters.faculty = document.getElementById('facultyFilter').value.toLowerCase();
        this.filters.code = document.getElementById('codeFilter').value.toLowerCase();
        this.filters.name = document.getElementById('nameFilter').value.toLowerCase();
        const sortBy = document.getElementById('sortSelect').value;
        
        let filtered = this.programs.filter(program => {
            if (this.filters.faculty && !program.faculty.toLowerCase().includes(this.filters.faculty)) {
                return false;
            }
            
            if (this.filters.level && program.level !== this.filters.level) {
                return false;
            }
            
            if (this.filters.code && !program.code.toLowerCase().includes(this.filters.code)) {
                return false;
            }
            
            if (this.filters.name) {
                const searchTerm = this.filters.name.toLowerCase();
                if (!program.searchText.includes(searchTerm)) {
                    return false;
                }
            }
            
            return true;
        });
        
        filtered = this.sortPrograms(filtered, sortBy);
        
        this.filteredPrograms = filtered;
        this.currentPage = 1;
        this.render();
        this.updateProgramsCount(filtered.length);
    }

    // Сортировка программ
    sortPrograms(programs, sortBy) {
        return [...programs].sort((a, b) => {
            switch(sortBy) {
                case 'name-asc':
                    return a.title.localeCompare(b.title);
                case 'name-desc':
                    return b.title.localeCompare(a.title);
                case 'code-asc':
                    return a.code.localeCompare(b.code);
                case 'budget-desc':
                    return (b.budgetPlaces || 0) - (a.budgetPlaces || 0);
                case 'price-asc':
                    return (a.price || 0) - (b.price || 0);
                case 'price-desc':
                    return (b.price || 0) - (a.price || 0);
                default:
                    return 0;
            }
        });
    }

    // Дебаунс для фильтрации
    debounceFilter() {
        clearTimeout(this.filterTimeout);
        this.filterTimeout = setTimeout(() => {
            this.applyFilters();
        }, 500);
    }

    // Сброс фильтров
    resetFilters() {
        document.querySelectorAll('.filter-select').forEach(select => {
            select.value = '';
        });
        
        document.querySelectorAll('.filter-input').forEach(input => {
            input.value = '';
        });
        
        document.querySelectorAll('.filter-option').forEach(opt => {
            opt.classList.remove('active');
            if (opt.getAttribute('data-level') === '') {
                opt.classList.add('active');
            }
        });
        
        document.getElementById('sortSelect').value = 'name-asc';
        
        this.filters = {
            faculty: '',
            level: '',
            code: '',
            name: '',
            form: ''
        };
        
        this.filteredPrograms = [...this.programs];
        this.currentPage = 1;
        this.render();
        this.updateProgramsCount(this.filteredPrograms.length);
    }

    // Рендеринг страницы
    render() {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const programsToShow = this.filteredPrograms.slice(startIndex, endIndex);
        
        this.renderPrograms(programsToShow);
        this.updatePagination();
    }

    // Рендеринг программ
    renderPrograms(programs) {
        const programsGrid = document.getElementById('programsGrid');
        
        if (!programsGrid) return;
        
        if (programs.length === 0) {
            programsGrid.innerHTML = this.getNoResultsHTML();
            return;
        }
        
        let programsHTML = '';
        
        programs.forEach(program => {
            const levelClass = `level-${program.level}`;
            const levelText = program.level === 'bachelor' ? 'Бакалавриат' : 
                 program.level === 'master' ? 'Магистратура' : 
                 program.level === 'specialist' ? 'Специалитет' : 
                 program.level === 'postgraduate' ? 'Аспирантура' : 
                 program.level === 'secondary' ? 'Среднее профессиональное' : '—';
            
            programsHTML += `
                <article class="program-card">
                    <div class="program-header">
                        <div class="program-code">${program.code}</div>
                        <div class="program-meta">
                            <span class="program-level ${levelClass}">${levelText}</span>
                            <span class="program-form">${program.form}</span>
                        </div>
                    </div>
                    
                    <div class="program-body">
                        <h3 class="program-title">${program.title}</h3>
                        <p class="program-profile">${program.profile}</p>
                        
                        <div class="program-faculty">
                            <i class="fas fa-university"></i>
                            ${program.faculty}
                        </div>
                        
                        <div class="program-details">
                            <div class="detail-item">
                                <span class="detail-label">Срок обучения</span>
                                <span class="detail-value">${program.duration}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Бюджетных мест</span>
                                <span class="detail-value">${program.budgetPlaces || '—'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Стоимость</span>
                                <span class="detail-value">${program.formattedPrice}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Форма</span>
                                <span class="detail-value">${program.form}</span>
                            </div>
                        </div>
                        
                        <p class="program-description">${program.description?.substring(0, 150)}...</p>
                    </div>
                    
                    <div class="program-footer">
                        <a href="${program.detailUrl}" class="btn btn-primary btn-small">Подробнее</a>
                        <div class="program-actions">
                            <button class="btn-icon btn-compare" aria-label="Добавить к сравнению">
                                <i class="fas fa-balance-scale"></i>
                            </button>
                            <button class="btn-icon btn-favorite" aria-label="Добавить в избранное">
                                <i class="far fa-star"></i>
                            </button>
                        </div>
                    </div>
                </article>
            `;
        });
        
        programsGrid.innerHTML = programsHTML;
    }

    // HTML для отсутствия результатов
    getNoResultsHTML() {
        return `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>Программы не найдены</h3>
                <p>Попробуйте изменить параметры поиска</p>
                <button class="btn btn-secondary" id="resetFiltersNoResults" style="margin-top: 1rem;">
                    <i class="fas fa-redo"></i> Сбросить фильтры
                </button>
            </div>
        `;
    }

    // Обновление пагинации
    updatePagination() {
        const totalPages = Math.ceil(this.filteredPrograms.length / this.itemsPerPage);
        const pagination = document.querySelector('.pagination');
        
        if (!pagination || totalPages <= 1) {
            if (pagination) pagination.style.display = 'none';
            return;
        }
        
        pagination.style.display = 'flex';
        
        let paginationHTML = `
            <button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} 
                    onclick="programsManager.goToPage(${this.currentPage - 1})">
                <i class="fas fa-chevron-left"></i>
            </button>
        `;
        
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button class="page-btn ${this.currentPage === i ? 'active' : ''}" 
                        onclick="programsManager.goToPage(${i})">
                    ${i}
                </button>
            `;
        }
        
        paginationHTML += `
            <button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} 
                    onclick="programsManager.goToPage(${this.currentPage + 1})">
                <i class="fas fa-chevron-right"></i>
            </button>
        `;
        
        pagination.innerHTML = paginationHTML;
    }

    // Переход на страницу
    goToPage(page) {
        if (page < 1 || page > Math.ceil(this.filteredPrograms.length / this.itemsPerPage)) {
            return;
        }
        
        this.currentPage = page;
        this.render();
        
        document.querySelector('.programs-grid')?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    // Обработка смены вида
    handleViewChange(e) {
        const btn = e.currentTarget;
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const viewType = btn.getAttribute('data-view');
        const programsGrid = document.getElementById('programsGrid');
        
        if (!programsGrid) return;
        
        if (viewType === 'list') {
            programsGrid.style.gridTemplateColumns = '1fr';
            document.querySelectorAll('.program-card').forEach(card => {
                card.style.flexDirection = 'row';
                if (card.querySelector('.program-body')) {
                    card.querySelector('.program-body').style.flex = '1';
                }
            });
        } else {
            programsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
            document.querySelectorAll('.program-card').forEach(card => {
                card.style.flexDirection = 'column';
            });
        }
    }

    // Обработка избранного
    handleFavoriteClick(e) {
        const btn = e.target.closest('.btn-favorite');
        const icon = btn.querySelector('i');
        
        if (icon.classList.contains('far')) {
            icon.classList.remove('far');
            icon.classList.add('fas');
            btn.style.color = '#ff6b6b';
            showNotification('Программа добавлена в избранное');
        } else {
            icon.classList.remove('fas');
            icon.classList.add('far');
            btn.style.color = '';
            showNotification('Программа удалена из избранного');
        }
    }

    // Обработка сравнения
    handleCompareClick(e) {
        showNotification('Программа добавлена к сравнению');
    }

    // Показать ошибку
    showError(message) {
        const programsGrid = document.getElementById('programsGrid');
        if (programsGrid) {
            programsGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Ошибка загрузки</h3>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 1rem;">
                        <i class="fas fa-redo"></i> Перезагрузить страницу
                    </button>
                </div>
            `;
        }
    }
}

// Функции для работы с UI
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const programsGrid = document.getElementById('programsGrid');
    
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
    
    if (programsGrid) {
        programsGrid.style.opacity = show ? '0.5' : '1';
        programsGrid.style.pointerEvents = show ? 'none' : 'auto';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? 'var(--primary-blue)' : '#ff9800'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
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

// Инициализация менеджера программ
let programsManager;

// Запуск при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    programsManager = new ProgramsManager();
    programsManager.init();
    
    document.addEventListener('click', function(e) {
        if (e.target.closest('#resetFiltersNoResults')) {
            programsManager.resetFilters();
        }
    });
});



// Экспорт для использования в консоли
if (typeof window !== 'undefined') {
    window.programsManager = programsManager;
}