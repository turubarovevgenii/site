// curriculum.js
/*class CurriculumLoader {
    constructor() {
        this.data = [];
        this.filteredData = [];
        this.currentFilter = 'all';
        this.currentSemester = 'all';
    }

    async loadCurriculum() {
        try {
            // Загрузка данных из JSON файла (сгенерированного из Excel)
            const response = await fetch('./js/curriculum-1.json');
            this.data = await response.json();
            
            this.renderTable();
            this.setupFilters();
            this.hideLoading();
            
        } catch (error) {
            console.error('Ошибка загрузки учебного плана:', error);
            this.showError();
        }
    }

    // Определение типа дисциплины по индексу
    getDisciplineType(code) {
        if (code.startsWith('Б1.О')) return 'general';
        if (code.startsWith('Б1.В')) return 'variable';
        if (code.startsWith('Б2.')) return 'practice';
        if (code.startsWith('Б3.')) return 'final';
        if (code.startsWith('ФТД')) return 'final';
        return 'other';
    }

    // Определение типа аттестации
    getAssessmentType(form) {
        const formLower = form.toLowerCase();
        if (formLower.includes('экзамен')) return 'exam';
        if (formLower.includes('зачёт с оценкой')) return 'graded-credit';
        if (formLower.includes('курсовой проект')) return 'project';
        if (formLower.includes('курсовая работа')) return 'course-work';
        if (formLower.includes('зачёт')) return 'credit';
        return 'other';
    }

    // Определение бейджа семестров
    formatSemesters(semesters) {
        const semArray = semesters.split(',').map(s => s.trim());
        
        // Если это диапазон (1-9)
        if (semArray.length > 3) {
            const first = semArray[0];
            const last = semArray[semArray.length - 1];
            return `${first}-${last}`;
        }
        
        return semesters;
    }

    // Рендер таблицы
    renderTable() {
        const tableBody = document.getElementById('curriculumTableBody');
        if (!tableBody) return;

        let html = '';
        
        this.filteredData.forEach(item => {
            const type = this.getDisciplineType(item.Индекс);
            const assessmentType = this.getAssessmentType(item['Формы пром. атт.']);
            const formattedSemesters = this.formatSemesters(item.Семестры);
            const semestersArray = item.Семестры.split(',').map(s => s.trim());
            
            html += `
                <tr class="curriculum-row" data-block="${type}" data-semesters="${semestersArray.join(',')}">
                    <td><span class="discipline-code">${item.Индекс}</span></td>
                    <td><strong>${item['Наименование']}</strong></td>
                    <td><span class="exam-type ${assessmentType}">${item['Формы пром. атт.']}</span></td>
                    <td><span class="semester-badge">${formattedSemesters}</span></td>
                    <td><span class="discipline-type ${type}">${this.getTypeName(type)}</span></td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        document.querySelector('.curriculum-table-container').style.display = 'block';
    }

    getTypeName(type) {
        const types = {
            'general': 'Базовая',
            'variable': 'Вариативная',
            'practice': 'Практика',
            'final': 'ГИА/ФТД',
            'choice': 'По выбору',
            'other': 'Другое'
        };
        return types[type] || 'Другое';
    }

    // Фильтрация по блоку
    filterCurriculumByBlock(block) {
        this.currentFilter = block;
        this.applyFilters();
        
        // Обновление активной кнопки
        document.querySelectorAll('.curriculum-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    // Фильтрация по семестрам
    filterCurriculumBySemester(semester) {
        this.currentSemester = semester;
        this.applyFilters();
        
        // Обновление активной кнопки
        document.querySelectorAll('.semester-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
    }

    applyFilters() {
        this.filteredData = this.data.filter(item => {
            // Фильтр по блоку
            const type = this.getDisciplineType(item.Индекс);
            if (this.currentFilter !== 'all' && type !== this.currentFilter) {
                return false;
            }
            
            // Фильтр по семестру
            if (this.currentSemester !== 'all') {
                const semesters = item.Семестры.split(',').map(s => s.trim());
                if (!semesters.includes(this.currentSemester)) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.renderTable();
    }

    setupFilters() {
        // Фильтры уже настроены через onclick в HTML
        this.filteredData = [...this.data];
        this.renderTable();
    }

    hideLoading() {
        const loading = document.getElementById('curriculumLoading');
        if (loading) {
            loading.style.display = 'none';
        }
    }

    showError() {
        const tableBody = document.getElementById('curriculumTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; padding: 2rem; color: #dc3545;">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Не удалось загрузить учебный план</p>
                        <button onclick="curriculumLoader.loadCurriculum()" class="btn btn-primary">
                            Попробовать снова
                        </button>
                    </td>
                </tr>
            `;
        }
    }
}

// Инициализация при загрузке страницы
let curriculumLoader;

document.addEventListener('DOMContentLoaded', function() {
    curriculumLoader = new CurriculumLoader();
    
    // Загружаем только когда вкладка активна
    const curriculumTab = document.getElementById('curriculum');
    if (curriculumTab) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    curriculumLoader.loadCurriculum();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        
        observer.observe(curriculumTab);
    }
    
    // Глобальные функции для onclick
    window.filterCurriculumByBlock = function(block) {
        curriculumLoader.filterCurriculumByBlock(block);
    };
    
    window.filterCurriculumBySemester = function(semester) {
        curriculumLoader.filterCurriculumBySemester(semester);
    };
});*/