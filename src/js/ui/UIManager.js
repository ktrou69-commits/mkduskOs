/**
 * Менеджер пользовательского интерфейса
 */
import { formatDate, escapeHtml } from '../utils/helpers.js';
import { getCategoryName, getCategoryIcon } from '../config/categories.js';

export class UIManager {
    constructor() {
        this.currentCategory = 'trees';
        this.currentItem = null;
        this.currentItemId = null;
        this.bulkSelectMode = false;
        this.selectedItems = new Set();
    }

    /**
     * Инициализирует UI
     */
    init() {
        this.setupEventListeners();
        this.updateStats();
        this.showWelcomeScreen();
        console.log('✅ UI Manager initialized');
    }

    /**
     * Настраивает обработчики событий
     */
    setupEventListeners() {
        // Переключение категорий
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchCategory(tab.dataset.category);
            });
        });

        // Поиск
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Модальные окна
        this.setupModalEventListeners();
    }

    /**
     * Настраивает обработчики для модальных окон
     */
    setupModalEventListeners() {
        // Закрытие модальных окон
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            });
        });

        // Закрытие по клику на фон
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal(modal.id);
                }
            });
        });
    }

    /**
     * Переключает категорию
     */
    switchCategory(category) {
        this.currentCategory = category;
        
        // Обновляем активную вкладку
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Обновляем тексты кнопок
        this.updateButtonTexts(category);
        
        // Сбрасываем выбор
        this.currentItem = null;
        this.currentItemId = null;
        this.bulkSelectMode = false;
        this.selectedItems.clear();
        
        // Обновляем интерфейс
        this.renderItemsList();
        this.updateStats();
        this.showWelcomeScreen();
        
        console.log(`🔄 Switched to category: ${category}`);
    }

    /**
     * Обновляет тексты кнопок в зависимости от категории
     */
    updateButtonTexts(category) {
        const isTreesCategory = category === 'trees';
        
        // Обновляем тексты кнопок
        const createBtnText = document.getElementById('createBtnText');
        const createFirstBtnText = document.getElementById('createFirstBtnText');
        const createSampleBtnText = document.getElementById('createSampleBtnText');
        const searchInput = document.getElementById('searchInput');
        const exportBtnText = document.getElementById('exportBtnText');

        if (createBtnText) createBtnText.textContent = isTreesCategory ? 'Создать дерево' : 'Создать заметку';
        if (createFirstBtnText) createFirstBtnText.textContent = isTreesCategory ? 'Создать первое дерево' : 'Создать первую заметку';
        if (createSampleBtnText) createSampleBtnText.textContent = isTreesCategory ? 'Создать пример дерева' : 'Создать пример заметки';
        if (searchInput) searchInput.placeholder = isTreesCategory ? 'Поиск деревьев...' : 'Поиск заметок...';
        if (exportBtnText) exportBtnText.textContent = isTreesCategory ? 'Экспорт деревьев' : 'Экспорт заметок';

        // Обновляем приветственный экран
        const welcomeIcon = document.querySelector('.welcome-icon');
        const welcomeTitle = document.querySelector('.welcome-content h2');
        const welcomeText = document.querySelector('.welcome-content p');

        if (welcomeIcon) welcomeIcon.textContent = isTreesCategory ? '🌳' : '📝';
        if (welcomeTitle) {
            welcomeTitle.textContent = isTreesCategory 
                ? 'Добро пожаловать в Библиотеку Древ Знаний'
                : 'Добро пожаловать в Архив Заметок';
        }
        if (welcomeText) {
            welcomeText.textContent = isTreesCategory
                ? 'Создавайте структурированные деревья знаний для организации информации и идей'
                : 'Создавайте и организуйте заметки для быстрого доступа к важной информации';
        }
    }

    /**
     * Рендерит список элементов
     */
    renderItemsList(items = null) {
        const container = document.getElementById('treesList');
        if (!container) {
            console.error('❌ Container treesList not found!');
            return;
        }

        // Если элементы не переданы, получаем их через событие
        if (!items) {
            const event = new CustomEvent('requestItems', { 
                detail: { category: this.currentCategory } 
            });
            document.dispatchEvent(event);
            return;
        }

        const itemType = this.currentCategory === 'trees' ? 'деревьев' : 'заметок';
        const itemIcon = this.currentCategory === 'trees' ? '🌳' : '📝';

        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">${itemIcon}</div>
                    <div class="empty-state-text">Нет ${itemType}</div>
                    <div class="empty-state-subtext">Создайте ${this.currentCategory === 'trees' ? 'первое дерево знаний' : 'первую заметку'}</div>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="tree-item ${this.bulkSelectMode ? 'bulk-select-mode' : ''}" data-tree-id="${item.id}">
                ${this.bulkSelectMode ? `
                    <input type="checkbox" class="tree-item-checkbox" 
                           ${this.selectedItems.has(item.id) ? 'checked' : ''}
                           onchange="window.uiManager.toggleItemSelection('${item.id}'); event.stopPropagation();">
                ` : ''}
                <div class="tree-item-content" onclick="${this.bulkSelectMode ? `window.uiManager.toggleItemSelection('${item.id}')` : `window.uiManager.selectItem('${item.id}')`}">
                    <div class="tree-item-title">${escapeHtml(item.name)}</div>
                    <div class="tree-item-meta">
                        <span class="tree-category">${getCategoryName(item.category)}</span>
                        <span>${formatDate(item.createdAt)}</span>
                    </div>
                </div>
                ${!this.bulkSelectMode ? `
                    <div class="tree-item-actions">
                        <button class="btn btn-icon tree-delete-btn" onclick="window.uiManager.deleteItem('${item.id}'); event.stopPropagation();" title="Удалить ${this.currentCategory === 'trees' ? 'дерево' : 'заметку'}">
                            <span class="icon">🗑️</span>
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');

        console.log(`✅ Rendered ${items.length} items in sidebar`);
    }

    /**
     * Выбирает элемент
     */
    selectItem(id) {
        console.log('🔍 Selecting item with ID:', id);
        
        // Отправляем событие для получения элемента
        const event = new CustomEvent('selectItem', { 
            detail: { id, category: this.currentCategory } 
        });
        document.dispatchEvent(event);
    }

    /**
     * Отображает выбранный элемент
     */
    displaySelectedItem(item) {
        if (!item) return;

        this.currentItem = item;
        this.currentItemId = item.id;
        
        console.log('✅ Displaying item:', item.name);
        
        // Обновляем заголовок
        const titleElement = document.getElementById('currentTreeTitle');
        const dateElement = document.getElementById('currentTreeDate');
        const nodesElement = document.getElementById('currentTreeNodes');
        
        if (titleElement) titleElement.textContent = item.name;
        if (dateElement) dateElement.textContent = `Создано: ${formatDate(item.createdAt)}`;
        if (nodesElement) {
            nodesElement.textContent = this.currentCategory === 'trees' ? 'Дерево знаний' : 'Заметка';
        }

        // Отображаем содержимое
        this.renderCurrentItemContent(item);
        this.hideWelcomeScreen();
        
        // Обновляем активное состояние в списке
        this.updateActiveState(item.id);
    }

    /**
     * Рендерит содержимое текущего элемента
     */
    renderCurrentItemContent(item) {
        const container = document.getElementById('treeContent');
        if (!container) return;

        let content = '';

        if (this.currentCategory === 'notes') {
            // Для заметок показываем содержимое
            if (item.content && item.content.trim()) {
                content = `<div class="console-line console-content">${escapeHtml(item.content)}</div>`;
            } else {
                content = `<div class="console-line console-content" style="color: #6e7681; font-style: italic;">📝 Заметка пустая</div>`;
            }
        } else {
            // Для деревьев показываем описание
            if (item.description && item.description.trim()) {
                content = `<div class="console-line console-content">${escapeHtml(item.description)}</div>`;
            } else {
                content = `<div class="console-line console-content" style="color: #6e7681; font-style: italic;">📝 Дерево пустое - добавьте описание</div>`;
            }
        }

        container.innerHTML = content;
    }

    /**
     * Обновляет активное состояние в списке
     */
    updateActiveState(id) {
        document.querySelectorAll('.tree-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-tree-id="${id}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    /**
     * Удаляет элемент
     */
    deleteItem(id) {
        console.log('🗑️ Delete button clicked for ID:', id);
        
        const itemType = this.currentCategory === 'trees' ? 'дерево' : 'заметку';
        if (confirm(`Вы уверены, что хотите удалить эт${this.currentCategory === 'trees' ? 'о' : 'у'} ${itemType}?`)) {
            // Отправляем событие для удаления
            const event = new CustomEvent('deleteItem', { 
                detail: { id, category: this.currentCategory } 
            });
            document.dispatchEvent(event);
        }
    }

    /**
     * Обрабатывает поиск
     */
    handleSearch(query) {
        const event = new CustomEvent('searchItems', { 
            detail: { query, category: this.currentCategory } 
        });
        document.dispatchEvent(event);
    }

    /**
     * Показывает приветственный экран
     */
    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const treeViewer = document.getElementById('treeViewer');
        
        if (welcomeScreen) welcomeScreen.style.display = 'flex';
        if (treeViewer) treeViewer.style.display = 'none';
    }

    /**
     * Скрывает приветственный экран
     */
    hideWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const treeViewer = document.getElementById('treeViewer');
        
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (treeViewer) treeViewer.style.display = 'flex';
    }

    /**
     * Обновляет статистику
     */
    updateStats(stats = null) {
        if (!stats) {
            // Запрашиваем статистику через событие
            const event = new CustomEvent('requestStats');
            document.dispatchEvent(event);
            return;
        }

        const treesElement = document.getElementById('totalTrees');
        const nodesElement = document.getElementById('totalNodes');
        
        if (treesElement) treesElement.textContent = stats.treesCount || 0;
        if (nodesElement) nodesElement.textContent = stats.totalNodes || 0;
    }

    /**
     * Показывает уведомление
     */
    showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';

        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    /**
     * Открывает модальное окно
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    /**
     * Закрывает модальное окно
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Переключает режим массового выбора
     */
    toggleBulkSelectMode() {
        this.bulkSelectMode = !this.bulkSelectMode;
        this.selectedItems.clear();
        
        // Обновляем интерфейс
        this.renderItemsList();
        
        const bulkActions = document.getElementById('bulkActions');
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        
        if (bulkActions) {
            bulkActions.style.display = this.bulkSelectMode ? 'flex' : 'none';
        }
        if (bulkDeleteBtn) {
            bulkDeleteBtn.style.display = this.bulkSelectMode ? 'inline-flex' : 'none';
        }
    }

    /**
     * Переключает выбор элемента в режиме массового выбора
     */
    toggleItemSelection(id) {
        if (this.selectedItems.has(id)) {
            this.selectedItems.delete(id);
        } else {
            this.selectedItems.add(id);
        }
        
        this.updateBulkDeleteButton();
    }

    /**
     * Обновляет кнопку массового удаления
     */
    updateBulkDeleteButton() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const bulkDeleteText = document.getElementById('bulkDeleteText');
        
        if (bulkDeleteBtn && bulkDeleteText) {
            const count = this.selectedItems.size;
            bulkDeleteText.textContent = count > 0 ? `Удалить выбранные (${count})` : 'Удалить выбранные';
            bulkDeleteBtn.disabled = count === 0;
        }
    }
}
