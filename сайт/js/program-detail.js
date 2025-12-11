
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
        
        // Функция для добавления в избранное
        document.getElementById('favoriteBtn').addEventListener('click', function() {
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
        
        // Функция для сравнения
        document.getElementById('compareBtn').addEventListener('click', function() {
            showNotification('Программа добавлена к сравнению');
        });
        
        // Функция показа уведомлений
        function showNotification(message) {
            // Создаем элемент уведомления
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: var(--primary-blue);
                color: white;
                padding: 1rem 1.5rem;
                border-radius: var(--border-radius);
                box-shadow: var(--box-shadow);
                z-index: 1000;
                animation: slideIn 0.3s ease;
                max-width: 300px;
            `;
            
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-check-circle"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            // Удаляем через 3 секунды
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 300);
            }, 3000);
        }
        
        // Добавляем стили для анимации уведомлений
        const style = document.createElement('style');
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
        
        // Инициализация при загрузке страницы
        document.addEventListener('DOMContentLoaded', function() {
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