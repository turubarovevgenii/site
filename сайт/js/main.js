// JavaScript для интерактивности главной страницы

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    // Фильтры по уровню образования
    const levelOptions = document.querySelectorAll('.filter-option[data-level]');
    levelOptions.forEach(option => {
        option.addEventListener('click', function() {
            levelOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            updateProgramsCount();
        });
    });
    
    // Кнопка сброса фильтров
    document.getElementById('resetFilters').addEventListener('click', function() {
        document.querySelectorAll('.filter-select').forEach(select => {
            select.value = '';
        });
        document.querySelectorAll('.filter-input').forEach(input => {
            input.value = '';
        });
        levelOptions.forEach(opt => {
            opt.classList.remove('active');
            if (opt.getAttribute('data-level') === '') {
                opt.classList.add('active');
            }
        });
        document.getElementById('sortSelect').value = 'name-asc';
        updateProgramsCount();
    });
    
    // Кнопка поиска
    document.getElementById('searchButton').addEventListener('click', function() {
        showLoading(true);
        
        // Имитация загрузки
        setTimeout(() => {
            updateProgramsCount();
            showLoading(false);
        }, 800);
    });
    
    // Смена вида (сетка/список)
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const viewType = this.getAttribute('data-view');
            const programsGrid = document.getElementById('programsGrid');
            
            if (viewType === 'list') {
                programsGrid.style.gridTemplateColumns = '1fr';
                document.querySelectorAll('.program-card').forEach(card => {
                    card.style.flexDirection = 'row';
                    card.querySelector('.program-body').style.flex = '1';
                });
            } else {
                programsGrid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
                document.querySelectorAll('.program-card').forEach(card => {
                    card.style.flexDirection = 'column';
                });
            }
        });
    });
    
    // Добавление в избранное
    document.querySelectorAll('.btn-favorite').forEach(btn => {
        btn.addEventListener('click', function() {
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
    });
    
    // Добавление к сравнению
    document.querySelectorAll('.btn-compare').forEach(btn => {
        btn.addEventListener('click', function() {
            showNotification('Программа добавлена к сравнению');
        });
    });
    
    // Пагинация
    document.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
        btn.addEventListener('click', function() {
            if (!this.classList.contains('active')) {
                document.querySelectorAll('.page-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                showLoading(true);
                
                // Имитация загрузки новой страницы
                setTimeout(() => {
                    showLoading(false);
                }, 500);
            }
        });
    });
    
    // Инициализация счетчика
    updateProgramsCount();
});

function updateProgramsCount() {
    // Здесь должна быть реальная логика подсчета отфильтрованных программ
    // Для демонстрации используем случайное число
    const count = Math.floor(Math.random() * 5) + 8;
    document.getElementById('programsCount').textContent = count;
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const programsGrid = document.getElementById('programsGrid');
    
    if (show) {
        spinner.style.display = 'block';
        programsGrid.style.opacity = '0.5';
    } else {
        spinner.style.display = 'none';
        programsGrid.style.opacity = '1';
    }
}