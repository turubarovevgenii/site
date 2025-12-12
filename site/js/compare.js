// Менеджер сравнения программ
class CompareManager {
    constructor() {
        this.selectedPrograms = [];
        this.allPrograms = [];
        this.maxCompareItems = 5;
        this.storageKey = 'comparedPrograms';
        
        this.init();
    }
    
    async init() {
        await this.loadAllPrograms();
        this.loadFromStorage();
        this.setupEventListeners();
        this.render();
        
        // Проверяем, есть ли программы в очереди из главной страницы
        this.checkQueueFromMain();
    }
    
    async loadAllPrograms() {
        try {
            // Загружаем все программы из основного файла
            const response = await fetch('./js/cchgeu_programs.json');
            if (response.ok) {
                const data = await response.json();
                this.allPrograms = data;
                console.log(`✅ Загружено ${this.allPrograms.length} программ для сравнения`);
            }
        } catch (error) {
            console.error('Ошибка загрузки программ для сравнения:', error);
            // Резервные данные
            this.allPrograms = this.getDemoPrograms();
        }
    }
    
    getDemoPrograms() {
        return [
            {
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
                description: "Подготовка архитекторов для проектирования зданий"
            },
            {
                id: 2,
                code: "08.03.01",
                title: "Строительство",
                profile: "Промышленное и гражданское строительство",
                faculty: "Строительный факультет",
                level: "bachelor",
                form: "Очная",
                duration: "4 года",
                budgetPlaces: 30,
                price: 145000,
                description: "Подготовка инженеров-строителей"
            },
            {
                id: 3,
                code: "09.03.01",
                title: "Информатика и вычислительная техника",
                profile: "Системы автоматизированного проектирования",
                faculty: "Факультет информационных технологий",
                level: "bachelor",
                form: "Очная",
                duration: "4 года",
                budgetPlaces: 20,
                price: 160000,
                description: "Подготовка IT-специалистов"
            },
            {
                id: 4,
                code: "13.03.02",
                title: "Электроэнергетика и электротехника",
                profile: "Электроснабжение",
                faculty: "Факультет энергетики и систем управления",
                level: "bachelor",
                form: "Очная",
                duration: "4 года",
                budgetPlaces: 15,
                price: 140000,
                description: "Подготовка энергетиков"
            },
            {
                id: 5,
                code: "15.03.04",
                title: "Автоматизация технологических процессов",
                profile: "Автоматизация производства",
                faculty: "Факультет машиностроения",
                level: "bachelor",
                form: "Очная",
                duration: "4 года",
                budgetPlaces: 18,
                price: 155000,
                description: "Подготовка специалистов по автоматизации"
            }
        ];
    }
    
    loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                this.selectedPrograms = parsed;
                console.log(`📊 Загружено ${this.selectedPrograms.length} программ из хранилища`);
            } catch (error) {
                console.error('Ошибка загрузки из хранилища:', error);
                this.selectedPrograms = [];
            }
        }
    }
    
    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.selectedPrograms));
    }
    
    // Проверяем очередь из главной страницы
    checkQueueFromMain() {
        const queue = JSON.parse(localStorage.getItem('compareQueue') || '[]');
        if (queue.length > 0) {
            console.log(`📥 Найдено ${queue.length} программ в очереди из главной страницы`);
            
            queue.forEach(item => {
                const program = this.allPrograms.find(p => p.id === item.id);
                if (program && !this.selectedPrograms.some(p => p.id === program.id)) {
                    this.addProgram(program);
                }
            });
            
            // Очищаем очередь после обработки
            localStorage.removeItem('compareQueue');
        }
    }
    
    addProgram(program) {
        if (this.selectedPrograms.length >= this.maxCompareItems) {
            this.showNotification(`Можно сравнивать не более ${this.maxCompareItems} программ`, 'warning');
            return false;
        }
        
        if (this.selectedPrograms.some(p => p.id === program.id)) {
            this.showNotification('Программа уже добавлена для сравнения', 'warning');
            return false;
        }
        
        this.selectedPrograms.push(program);
        this.saveToStorage();
        this.render();
        this.showNotification(`Программа "${program.title}" добавлена для сравнения`);
        return true;
    }
    
    removeProgram(programId) {
        const index = this.selectedPrograms.findIndex(p => p.id === programId);
        if (index !== -1) {
            const removed = this.selectedPrograms.splice(index, 1)[0];
            this.saveToStorage();
            this.render();
            this.showNotification(`Программа "${removed.title}" удалена из сравнения`);
        }
    }
    
    clearAll() {
        if (this.selectedPrograms.length === 0) return;
        
        if (confirm('Очистить список сравнения?')) {
            this.selectedPrograms = [];
            this.saveToStorage();
            this.render();
            this.showNotification('Список сравнения очищен');
        }
    }
    
    render() {
        this.updateCount();
        this.renderSelectedGrid();
        this.renderComparison();
        this.updateUIState();
    }
    
    updateCount() {
        const countElement = document.getElementById('selectedCount');
        if (countElement) {
            countElement.textContent = this.selectedPrograms.length;
        }
        
        const compareBtn = document.getElementById('startCompare');
        if (compareBtn) {
            compareBtn.disabled = this.selectedPrograms.length < 2;
        }
    }
    
    renderSelectedGrid() {
        const grid = document.getElementById('selectedGrid');
        if (!grid) return;
        
        if (this.selectedPrograms.length === 0) {
            grid.style.display = 'none';
            return;
        }
        
        grid.style.display = 'grid';
        grid.innerHTML = '';
        
        this.selectedPrograms.forEach(program => {
            const levelText = this.getLevelText(program.level);
            const priceText = program.price ? `${program.price.toLocaleString('ru-RU')} ₽/год` : 'Уточняйте';
            
            const card = document.createElement('div');
            card.className = 'selected-card';
            card.innerHTML = `
                <div class="selected-card-header">
                    <div class="selected-card-code">${program.code}</div>
                    <button class="remove-card" onclick="compareManager.removeProgram(${program.id})" 
                            aria-label="Удалить из сравнения">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="selected-card-title">${program.title}</div>
                <div class="selected-card-faculty">
                    <i class="fas fa-university"></i> ${program.faculty || '—'}
                </div>
                <div class="selected-card-details">
                    <div class="selected-card-detail">
                        <span class="detail-label">Уровень:</span>
                        <span class="detail-value">${levelText}</span>
                    </div>
                    <div class="selected-card-detail">
                        <span class="detail-label">Форма:</span>
                        <span class="detail-value">${program.form || '—'}</span>
                    </div>
                    <div class="selected-card-detail">
                        <span class="detail-label">Срок:</span>
                        <span class="detail-value">${program.duration || '—'}</span>
                    </div>
                    <div class="selected-card-detail">
                        <span class="detail-label">Бюджет:</span>
                        <span class="detail-value">${program.budgetPlaces || 0} мест</span>
                    </div>
                    <div class="selected-card-detail">
                        <span class="detail-label">Стоимость:</span>
                        <span class="detail-value">${priceText}</span>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }
    
    renderComparison() {
        if (this.selectedPrograms.length < 2) {
            document.getElementById('compareTable').style.display = 'none';
            document.getElementById('recommendations').style.display = 'none';
            return;
        }
        
        document.getElementById('compareTable').style.display = 'block';
        document.getElementById('recommendations').style.display = 'block';
        
        this.renderTableHeaders();
        this.renderTableBody();
        this.renderSummary();
        this.renderRecommendations();
    }
    
    renderTableHeaders() {
        const programHeaders = document.getElementById('programHeaders');
        const programTitles = document.getElementById('programTitles');
        
        if (!programHeaders || !programTitles) return;
        
        // Очищаем старые заголовки
        programHeaders.innerHTML = '';
        programTitles.innerHTML = '';
        
        // Добавляем ячейки для каждой программы
        this.selectedPrograms.forEach((program, index) => {
            programHeaders.innerHTML += `<th class="program-header">Программа ${index + 1}</th>`;
            
            const titleCell = document.createElement('th');
            titleCell.innerHTML = `
                <div class="program-title-compare">${program.title}</div>
                <div class="program-code-compare">${program.code}</div>
                <div class="program-faculty-compare">${program.faculty || '—'}</div>
            `;
            programTitles.appendChild(titleCell);
        });
    }
    
    renderTableBody() {
        const tbody = document.getElementById('compareTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        // Основные параметры для сравнения
        const comparisonParams = [
            {
                category: 'Основная информация',
                params: [
                    { label: 'Факультет', key: 'faculty' },
                    { label: 'Уровень образования', key: 'level', format: this.getLevelText.bind(this) },
                    { label: 'Форма обучения', key: 'form' },
                    { label: 'Срок обучения', key: 'duration' },
                    { label: 'Язык обучения', key: 'language', defaultValue: 'Русский' }
                ]
            },
            {
                category: 'Финансовые условия',
                params: [
                    { label: 'Бюджетных мест', key: 'budgetPlaces' },
                    { label: 'Стоимость обучения', key: 'price', format: (val) => val ? `${val.toLocaleString('ru-RU')} ₽/год` : 'Уточняйте' },
                    { label: 'Есть общежитие', key: 'hasDormitory', defaultValue: 'Да' }
                ]
            },
            {
                category: 'Статистика',
                params: [
                    { label: 'Средний балл ЕГЭ', key: 'avgScore', defaultValue: '4.5' },
                    { label: 'Проходной балл', key: 'passingScore', defaultValue: '180' },
                    { label: 'Трудоустройство выпускников', key: 'employmentRate', defaultValue: '92%' }
                ]
            }
        ];
        
        comparisonParams.forEach(section => {
            // Заголовок категории
            const categoryRow = document.createElement('tr');
            categoryRow.innerHTML = `<td colspan="${this.selectedPrograms.length + 1}" class="param-category">${section.category}</td>`;
            tbody.appendChild(categoryRow);
            
            // Параметры категории
            section.params.forEach(param => {
                const row = document.createElement('tr');
                let rowHTML = `<td>${param.label}</td>`;
                
                const values = this.selectedPrograms.map(program => {
                    let value = program[param.key] || param.defaultValue || '—';
                    if (param.format) {
                        value = param.format(value);
                    }
                    return value;
                });
                
                // Определяем лучшее значение (для числовых параметров)
                let bestIndex = -1;
                if (param.key === 'budgetPlaces' || param.key === 'employmentRate' || param.key === 'avgScore') {
                    bestIndex = this.getBestIndex(values, 'max');
                } else if (param.key === 'price' || param.key === 'passingScore') {
                    bestIndex = this.getBestIndex(values, 'min');
                }
                
                values.forEach((value, index) => {
                    const isBest = index === bestIndex && bestIndex !== -1;
                    rowHTML += `<td class="${isBest ? 'best-value' : ''}">${value}</td>`;
                });
                
                row.innerHTML = rowHTML;
                tbody.appendChild(row);
            });
        });
    }
    
    getBestIndex(values, type) {
        const numericValues = values.map(val => {
            if (typeof val === 'string') {
                // Извлекаем число из строки (например, "150 000 ₽/год" -> 150000)
                const num = parseFloat(val.replace(/[^\d.]/g, ''));
                return isNaN(num) ? null : num;
            } else if (typeof val === 'number') {
                return val;
            }
            return null;
        }).filter(val => val !== null);
        
        if (numericValues.length === 0) return -1;
        
        if (type === 'max') {
            const max = Math.max(...numericValues);
            return numericValues.indexOf(max);
        } else {
            const min = Math.min(...numericValues);
            return numericValues.indexOf(min);
        }
    }
    
    renderSummary() {
        const summaryGrid = document.getElementById('summaryGrid');
        if (!summaryGrid) return;
        
        summaryGrid.innerHTML = '';
        
        if (this.selectedPrograms.length < 2) return;
        
        const summaries = [
            {
                title: 'Наиболее бюджетный вариант',
                getWinner: () => {
                    const prices = this.selectedPrograms.map(p => p.price || Infinity);
                    const minPrice = Math.min(...prices);
                    const index = prices.indexOf(minPrice);
                    return this.selectedPrograms[index];
                },
                reason: 'Наименьшая стоимость обучения'
            },
            {
                title: 'Наибольшее количество бюджетных мест',
                getWinner: () => {
                    const places = this.selectedPrograms.map(p => p.budgetPlaces || 0);
                    const maxPlaces = Math.max(...places);
                    const index = places.indexOf(maxPlaces);
                    return this.selectedPrograms[index];
                },
                reason: 'Высокий шанс поступления на бюджет'
            },
            {
                title: 'Самый короткий срок обучения',
                getWinner: () => {
                    // Извлекаем число лет из строки
                    const durations = this.selectedPrograms.map(p => {
                        const match = (p.duration || '').match(/\d+/);
                        return match ? parseInt(match[0]) : 99;
                    });
                    const minDuration = Math.min(...durations);
                    const index = durations.indexOf(minDuration);
                    return this.selectedPrograms[index];
                },
                reason: 'Быстрее завершить образование'
            },
            {
                title: 'Лучшие карьерные перспективы',
                getWinner: () => {
                    // Предполагаем, что IT-специалисты имеют лучшие перспективы
                    const itIndex = this.selectedPrograms.findIndex(p => 
                        p.title.includes('Информатика') || 
                        p.title.includes('IT') || 
                        p.title.includes('Программирование')
                    );
                    return itIndex !== -1 ? this.selectedPrograms[itIndex] : this.selectedPrograms[0];
                },
                reason: 'Высокий спрос на рынке труда'
            }
        ];
        
        summaries.forEach(summary => {
            const winner = summary.getWinner();
            if (!winner) return;
            
            const card = document.createElement('div');
            card.className = 'summary-card';
            card.innerHTML = `
                <div class="summary-title">${summary.title}</div>
                <div class="summary-winner">${winner.title}</div>
                <div class="summary-reason">${summary.reason}</div>
            `;
            summaryGrid.appendChild(card);
        });
    }
    
    renderRecommendations() {
        const recommendationsGrid = document.getElementById('recommendationsGrid');
        if (!recommendationsGrid) return;
        
        recommendationsGrid.innerHTML = '';
        
        if (this.selectedPrograms.length < 2) return;
        
        const recommendations = [
            {
                title: 'Для экономии средств',
                icon: 'fas fa-money-bill-wave',
                type: 'recommended',
                getProgram: () => {
                    const prices = this.selectedPrograms.map(p => p.price || Infinity);
                    const minPrice = Math.min(...prices);
                    const index = prices.indexOf(minPrice);
                    return this.selectedPrograms[index];
                },
                description: 'Выберите программу с наименьшей стоимостью, если бюджет ограничен'
            },
            {
                title: 'Для поступления на бюджет',
                icon: 'fas fa-user-graduate',
                type: 'recommended',
                getProgram: () => {
                    const places = this.selectedPrograms.map(p => p.budgetPlaces || 0);
                    const maxPlaces = Math.max(...places);
                    const index = places.indexOf(maxPlaces);
                    return this.selectedPrograms[index];
                },
                description: 'Больше бюджетных мест означает больший шанс поступления'
            },
            {
                title: 'Для быстрого старта карьеры',
                icon: 'fas fa-briefcase',
                type: 'recommended',
                getProgram: () => {
                    const durations = this.selectedPrograms.map(p => {
                        const match = (p.duration || '').match(/\d+/);
                        return match ? parseInt(match[0]) : 99;
                    });
                    const minDuration = Math.min(...durations);
                    const index = durations.indexOf(minDuration);
                    return this.selectedPrograms[index];
                },
                description: 'Короткий срок обучения позволит раньше начать работать'
            }
        ];
        
        recommendations.forEach(rec => {
            const program = rec.getProgram();
            if (!program) return;
            
            const card = document.createElement('div');
            card.className = `recommendation-card ${rec.type}`;
            card.innerHTML = `
                <div class="recommendation-title">
                    <i class="${rec.icon}"></i> ${rec.title}
                </div>
                <div class="recommendation-desc">
                    <strong>${program.title}</strong> - ${rec.description}
                </div>
            `;
            recommendationsGrid.appendChild(card);
        });
    }
    
    getLevelText(level) {
        const levels = {
            'bachelor': 'Бакалавриат',
            'master': 'Магистратура',
            'specialist': 'Специалитет',
            'postgraduate': 'Аспирантура',
            'secondary': 'Среднее профессиональное'
        };
        return levels[level] || level;
    }
    
    updateUIState() {
        const state = document.getElementById('compareState');
        const table = document.getElementById('compareTable');
        const recommendations = document.getElementById('recommendations');
        
        if (this.selectedPrograms.length === 0) {
            state.style.display = 'block';
            if (table) table.style.display = 'none';
            if (recommendations) recommendations.style.display = 'none';
        } else {
            state.style.display = 'none';
        }
    }
    
    openAddModal() {
        const modal = document.getElementById('addProgramsModal');
        if (!modal) return;
        
        this.renderModalPrograms();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    closeAddModal() {
        const modal = document.getElementById('addProgramsModal');
        if (!modal) return;
        
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    renderModalPrograms() {
        const grid = document.getElementById('modalProgramsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        const alreadySelectedIds = this.selectedPrograms.map(p => p.id);
        
        this.allPrograms.forEach(program => {
            const isSelected = alreadySelectedIds.includes(program.id);
            const isDisabled = alreadySelectedIds.length >= this.maxCompareItems && !isSelected;
            
            const card = document.createElement('div');
            card.className = `modal-program-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`;
            card.dataset.id = program.id;
            
            if (isDisabled) {
                card.title = 'Достигнут лимит сравнения';
            }
            
            card.innerHTML = `
                <input type="checkbox" class="modal-program-check" id="program-${program.id}" 
                       ${isSelected ? 'checked' : ''} ${isDisabled ? 'disabled' : ''}>
                <label for="program-${program.id}" class="modal-program-content">
                    <div class="modal-program-title">${program.title}</div>
                    <div class="modal-program-code">${program.code}</div>
                    <div class="modal-program-faculty">${program.faculty || '—'}</div>
                </label>
            `;
            
            card.addEventListener('click', (e) => {
                if (!e.target.closest('input') && !isDisabled) {
                    const checkbox = card.querySelector('input');
                    checkbox.checked = !checkbox.checked;
                    card.classList.toggle('selected', checkbox.checked);
                }
            });
            
            grid.appendChild(card);
        });
    }
    
    addSelectedFromModal() {
        const checkboxes = document.querySelectorAll('.modal-program-check:checked');
        const selectedIds = Array.from(checkboxes).map(cb => parseInt(cb.id.replace('program-', '')));
        
        let addedCount = 0;
        selectedIds.forEach(id => {
            if (this.selectedPrograms.some(p => p.id === id)) {
                return; // Уже добавлена
            }
            
            const program = this.allPrograms.find(p => p.id === id);
            if (program && this.addProgram(program)) {
                addedCount++;
            }
        });
        
        if (addedCount > 0) {
            this.showNotification(`Добавлено ${addedCount} программ для сравнения`);
        }
        
        this.closeAddModal();
    }
    
    setupEventListeners() {
        // Очистка сравнения
        const clearBtn = document.getElementById('clearCompare');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearAll());
        }
        
        // Кнопка сравнения
        const compareBtn = document.getElementById('startCompare');
        if (compareBtn) {
            compareBtn.addEventListener('click', () => {
                if (this.selectedPrograms.length >= 2) {
                    document.getElementById('compareTable')?.scrollIntoView({ behavior: 'smooth' });
                    this.showNotification('Сравнение выполнено');
                }
            });
        }
        
        // Добавление программ
        const addBtn = document.getElementById('addMorePrograms');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openAddModal());
        }
        
        // Убрал кнопку экспорта
        
        // Модальное окно
        const modal = document.getElementById('addProgramsModal');
        if (modal) {
            // Закрытие по крестику
            const closeBtn = modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.closeAddModal());
            }
            
            // Закрытие по клику вне модалки
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeAddModal();
                }
            });
            
            // Кнопки в модалке
            const cancelBtn = document.getElementById('modalCancel');
            if (cancelBtn) {
                cancelBtn.addEventListener('click', () => this.closeAddModal());
            }
            
            const addSelectedBtn = document.getElementById('modalAddSelected');
            if (addSelectedBtn) {
                addSelectedBtn.addEventListener('click', () => this.addSelectedFromModal());
            }
            
            // Поиск в модалке
            const searchInput = document.getElementById('programSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.filterModalPrograms(e.target.value);
                });
            }
        }
        
        // Закрытие по ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAddModal();
            }
        });
    }
    
    filterModalPrograms(searchTerm) {
        const cards = document.querySelectorAll('.modal-program-card');
        const term = searchTerm.toLowerCase().trim();
        
        cards.forEach(card => {
            const title = card.querySelector('.modal-program-title')?.textContent.toLowerCase() || '';
            const code = card.querySelector('.modal-program-code')?.textContent.toLowerCase() || '';
            const faculty = card.querySelector('.modal-program-faculty')?.textContent.toLowerCase() || '';
            
            const matches = !term || 
                title.includes(term) || 
                code.includes(term) || 
                faculty.includes(term);
            
            card.style.display = matches ? '' : 'none';
        });
    }
    
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = 'notification';
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
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Добавляем анимации, если их нет
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
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
}

// Глобальный экземпляр менеджера сравнения
let compareManager;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    compareManager = new CompareManager();
});