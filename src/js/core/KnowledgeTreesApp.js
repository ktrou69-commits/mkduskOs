/**
 * Главный класс приложения Knowledge Trees
 */
import { DataManager } from './DataManager.js';
import { TreeManager } from './TreeManager.js';
import { NotesManager } from './NotesManager.js';
import { UIManager } from '../ui/UIManager.js';
import { GitHubSync } from '../sync/GitHubSync.js';
import { generateId } from '../utils/helpers.js';
import { isValidBackup } from '../utils/validators.js';

export class KnowledgeTreesApp {
    constructor() {
        console.log('🚀 Initializing Knowledge Trees App...');
        
        // Инициализируем менеджеры
        this.dataManager = new DataManager();
        this.treeManager = new TreeManager(this.dataManager);
        this.notesManager = new NotesManager(this.dataManager);
        this.uiManager = new UIManager();
        this.githubSync = new GitHubSync();
        
        // Состояние приложения
        this.currentCategory = 'trees';
        this.currentItem = null;
        this.currentItemId = null;
        
        // Инициализируем приложение
        this.init();
    }

    /**
     * Инициализирует приложение
     */
    init() {
        try {
            // Настраиваем обработчики событий
            this.setupEventListeners();
            
            // Инициализируем UI
            this.uiManager.init();
            
            // Обновляем интерфейс
            this.renderItemsList();
            this.updateStats();
            
            console.log('✅ Knowledge Trees App initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing app:', error);
        }
    }

    /**
     * Настраивает обработчики событий
     */
    setupEventListeners() {
        // Кнопки создания
        const createBtn = document.getElementById('createBtn');
        const createFirstBtn = document.getElementById('createFirstBtn');
        const createSampleBtn = document.getElementById('createSampleBtn');

        if (createBtn) {
            createBtn.addEventListener('click', () => this.openCreateModal());
        }
        if (createFirstBtn) {
            createFirstBtn.addEventListener('click', () => this.openCreateModal());
        }
        if (createSampleBtn) {
            createSampleBtn.addEventListener('click', () => this.createSampleItem());
        }

        // Кнопки импорта/экспорта
        const importBtn = document.getElementById('importBtn');
        const exportCurrentBtn = document.getElementById('exportCurrentBtn');
        const exportAllBtn = document.getElementById('exportAllBtn');

        if (importBtn) {
            importBtn.addEventListener('click', () => this.openImportModal());
        }
        if (exportCurrentBtn) {
            exportCurrentBtn.addEventListener('click', () => this.exportCurrentCategory());
        }
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => this.exportAllData());
        }

        // GitHub синхронизация
        const syncSettingsBtn = document.getElementById('syncSettingsBtn');
        if (syncSettingsBtn) {
            syncSettingsBtn.addEventListener('click', () => this.githubSync.openSyncModal());
        }

        // Обработчики для модальных окон
        this.setupModalHandlers();

        // Обработчики для GitHub синхронизации
        this.setupGitHubHandlers();

        // Пользовательские события
        this.setupCustomEvents();
    }

    /**
     * Настраивает обработчики модальных окон
     */
    setupModalHandlers() {
        // Сохранение дерева/заметки
        const saveTreeBtn = document.getElementById('saveTree');
        if (saveTreeBtn) {
            saveTreeBtn.addEventListener('click', () => this.saveItem());
        }

        // Импорт
        const executeImportBtn = document.getElementById('executeImport');
        if (executeImportBtn) {
            executeImportBtn.addEventListener('click', () => this.executeImport());
        }

        // Обработка загрузки файла
        const importFile = document.getElementById('importFile');
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const importText = document.getElementById('importText');
                        if (importText) {
                            importText.value = e.target.result;
                        }
                    };
                    reader.readAsText(file);
                }
            });
        }
    }

    /**
     * Настраивает обработчики GitHub синхронизации
     */
    setupGitHubHandlers() {
        const saveSyncSettingsBtn = document.getElementById('saveSyncSettings');
        const testConnectionBtn = document.getElementById('testConnection');
        const syncNowBtn = document.getElementById('syncNow');
        const downloadFromGithubBtn = document.getElementById('downloadFromGithub');
        const clearRepositoryBtn = document.getElementById('clearRepository');

        if (saveSyncSettingsBtn) {
            saveSyncSettingsBtn.addEventListener('click', () => this.githubSync.saveSyncSettings());
        }
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', () => this.githubSync.testConnection());
        }
        if (syncNowBtn) {
            syncNowBtn.addEventListener('click', () => this.syncToGitHub());
        }
        if (downloadFromGithubBtn) {
            downloadFromGithubBtn.addEventListener('click', () => this.githubSync.loadFromGitHub());
        }
        if (clearRepositoryBtn) {
            clearRepositoryBtn.addEventListener('click', () => this.githubSync.clearRepository());
        }
    }

    /**
     * Настраивает пользовательские события
     */
    setupCustomEvents() {
        // Запрос элементов для отображения
        document.addEventListener('requestItems', (e) => {
            const { category } = e.detail;
            const items = category === 'trees' ? this.dataManager.getTrees() : this.dataManager.getNotes();
            this.uiManager.renderItemsList(items);
        });

        // Выбор элемента
        document.addEventListener('selectItem', (e) => {
            const { id, category } = e.detail;
            const item = category === 'trees' ? this.dataManager.getTree(id) : this.dataManager.getNote(id);
            if (item) {
                this.uiManager.displaySelectedItem(item);
            }
        });

        // Удаление элемента
        document.addEventListener('deleteItem', (e) => {
            const { id, category } = e.detail;
            this.deleteItem(id, category);
        });

        // Поиск элементов
        document.addEventListener('searchItems', (e) => {
            const { query, category } = e.detail;
            const items = category === 'trees' 
                ? this.dataManager.searchTrees(query)
                : this.dataManager.searchNotes(query);
            this.uiManager.renderItemsList(items);
        });

        // Запрос статистики
        document.addEventListener('requestStats', () => {
            const stats = this.dataManager.getStats();
            this.uiManager.updateStats(stats);
        });

        // Показ уведомлений
        document.addEventListener('showNotification', (e) => {
            const { message, type } = e.detail;
            this.uiManager.showNotification(message, type);
        });

        // Импорт данных
        document.addEventListener('importData', (e) => {
            const { data } = e.detail;
            this.importData(data);
        });
    }

    /**
     * Открывает модальное окно создания
     */
    openCreateModal() {
        const modal = document.getElementById('treeModal');
        const title = document.getElementById('treeModalTitle');
        
        if (modal && title) {
            title.textContent = this.currentCategory === 'trees' ? 'Создать дерево' : 'Создать заметку';
            
            // Очищаем форму
            this.clearForm();
            
            this.uiManager.openModal('treeModal');
        }
    }

    /**
     * Очищает форму создания/редактирования
     */
    clearForm() {
        const nameInput = document.getElementById('treeName');
        const descriptionInput = document.getElementById('treeDescription');
        const categorySelect = document.getElementById('treeCategory');

        if (nameInput) nameInput.value = '';
        if (descriptionInput) descriptionInput.value = '';
        if (categorySelect) categorySelect.value = 'other';
    }

    /**
     * Сохраняет элемент (дерево или заметку)
     */
    saveItem() {
        const nameInput = document.getElementById('treeName');
        const descriptionInput = document.getElementById('treeDescription');
        const categorySelect = document.getElementById('treeCategory');

        if (!nameInput || !nameInput.value.trim()) {
            this.uiManager.showNotification('Введите название', 'error');
            return;
        }

        const itemData = {
            name: nameInput.value.trim(),
            category: categorySelect ? categorySelect.value : 'other'
        };

        try {
            let createdItem;
            
            if (this.currentCategory === 'trees') {
                itemData.description = descriptionInput ? descriptionInput.value.trim() : '';
                createdItem = this.treeManager.createTree(itemData);
            } else {
                itemData.content = descriptionInput ? descriptionInput.value.trim() : '';
                createdItem = this.notesManager.createNote(itemData);
            }

            // Обновляем интерфейс
            this.renderItemsList();
            this.updateStats();
            this.selectItem(createdItem.id);
            
            // Закрываем модальное окно
            this.uiManager.closeModal('treeModal');
            
            // Показываем уведомление
            const itemType = this.currentCategory === 'trees' ? 'Дерево' : 'Заметка';
            this.uiManager.showNotification(`${itemType} создан${this.currentCategory === 'trees' ? 'о' : 'а'} успешно!`, 'success');
            
            // Автосинхронизация
            this.triggerAutoSync();
            
        } catch (error) {
            console.error('Error saving item:', error);
            this.uiManager.showNotification(`Ошибка создания: ${error.message}`, 'error');
        }
    }

    /**
     * Удаляет элемент
     */
    deleteItem(id, category = null) {
        const currentCategory = category || this.currentCategory;
        
        try {
            if (currentCategory === 'trees') {
                this.treeManager.deleteTree(id);
            } else {
                this.notesManager.deleteNote(id);
            }

            // Обновляем интерфейс
            this.renderItemsList();
            this.updateStats();
            
            // Если удаляем текущий элемент, показываем приветственный экран
            if (this.currentItemId === id) {
                this.currentItem = null;
                this.currentItemId = null;
                this.uiManager.showWelcomeScreen();
            }
            
            const itemType = currentCategory === 'trees' ? 'Дерево' : 'Заметка';
            this.uiManager.showNotification(`${itemType} удален${currentCategory === 'trees' ? 'о' : 'а'}`, 'success');
            
            // Автосинхронизация
            this.triggerAutoSync();
            
        } catch (error) {
            console.error('Error deleting item:', error);
            this.uiManager.showNotification(`Ошибка удаления: ${error.message}`, 'error');
        }
    }

    /**
     * Выбирает элемент
     */
    selectItem(id) {
        const item = this.currentCategory === 'trees' 
            ? this.dataManager.getTree(id)
            : this.dataManager.getNote(id);
            
        if (item) {
            this.uiManager.displaySelectedItem(item);
        }
    }

    /**
     * Рендерит список элементов
     */
    renderItemsList() {
        const items = this.currentCategory === 'trees' 
            ? this.dataManager.getTrees()
            : this.dataManager.getNotes();
        this.uiManager.renderItemsList(items);
    }

    /**
     * Обновляет статистику
     */
    updateStats() {
        const stats = this.dataManager.getStats();
        this.uiManager.updateStats(stats);
    }

    /**
     * Создает пример элемента
     */
    createSampleItem() {
        try {
            let sampleItem;
            
            if (this.currentCategory === 'trees') {
                sampleItem = this.treeManager.createSampleTree();
            } else {
                sampleItem = this.notesManager.createSampleNote();
            }

            // Обновляем интерфейс
            this.renderItemsList();
            this.updateStats();
            this.selectItem(sampleItem.id);
            
            const itemType = this.currentCategory === 'trees' ? 'дерево' : 'заметка';
            this.uiManager.showNotification(`Пример ${itemType} создан!`, 'success');
            
            // Автосинхронизация
            this.triggerAutoSync();
            
        } catch (error) {
            console.error('Error creating sample:', error);
            this.uiManager.showNotification(`Ошибка создания примера: ${error.message}`, 'error');
        }
    }

    /**
     * Открывает модальное окно импорта
     */
    openImportModal() {
        this.uiManager.openModal('importModal');
    }

    /**
     * Выполняет импорт данных
     */
    executeImport() {
        const importText = document.getElementById('importText');
        if (!importText || !importText.value.trim()) {
            this.uiManager.showNotification('Введите данные для импорта', 'error');
            return;
        }

        try {
            const data = JSON.parse(importText.value.trim());
            
            if (!isValidBackup(data)) {
                throw new Error('Неверный формат данных');
            }

            this.importData(data);
            
        } catch (error) {
            console.error('Import error:', error);
            this.uiManager.showNotification(`Ошибка импорта: ${error.message}`, 'error');
        }
    }

    /**
     * Импортирует данные
     */
    importData(data) {
        try {
            let importedData = data;
            
            // Обрабатываем новый формат полной резервной копии
            if (data.backup && data.backup.type === 'full_backup') {
                importedData = data.data;
            }

            const success = this.dataManager.importData(importedData);
            
            if (success) {
                // Обновляем интерфейс
                this.renderItemsList();
                this.updateStats();
                
                // Закрываем модальное окно
                this.uiManager.closeModal('importModal');
                
                const treesCount = importedData.trees?.length || 0;
                const notesCount = importedData.notes?.length || 0;
                
                let message = 'Данные восстановлены: ';
                if (treesCount > 0) message += `${treesCount} деревьев`;
                if (notesCount > 0) {
                    if (treesCount > 0) message += ', ';
                    message += `${notesCount} заметок`;
                }
                
                this.uiManager.showNotification(message, 'success');
                
                // Автосинхронизация
                this.triggerAutoSync();
            } else {
                throw new Error('Не удалось импортировать данные');
            }
            
        } catch (error) {
            console.error('Import data error:', error);
            this.uiManager.showNotification(`Ошибка импорта данных: ${error.message}`, 'error');
        }
    }

    /**
     * Экспортирует текущую категорию
     */
    exportCurrentCategory() {
        const items = this.currentCategory === 'trees' 
            ? this.dataManager.getTrees()
            : this.dataManager.getNotes();

        const exportData = {
            [this.currentCategory]: items,
            exportedAt: new Date().toISOString(),
            category: this.currentCategory,
            version: '1.0'
        };

        const filename = `${this.currentCategory}-${new Date().toISOString().split('T')[0]}.json`;
        this.downloadJSON(exportData, filename);
        
        const itemType = this.currentCategory === 'trees' ? 'деревьев' : 'заметок';
        this.uiManager.showNotification(`📤 Экспорт ${itemType} завершен (${items.length} элементов)`, 'success');
    }

    /**
     * Экспортирует все данные
     */
    exportAllData() {
        const trees = this.dataManager.getTrees();
        const notes = this.dataManager.getNotes();
        const stats = this.dataManager.getStats();

        // Создаем полную резервную копию с расширенными метаданными
        const backupData = {
            backup: {
                version: '2.0',
                type: 'full_backup',
                created: new Date().toISOString(),
                createdBy: 'Knowledge Trees App',
                device: this.getDeviceInfo(),
                totalItems: trees.length + notes.length
            },
            statistics: stats,
            data: {
                trees: trees,
                notes: notes
            },
            settings: this.getAppSettings()
        };

        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `knowledge-backup-${timestamp}.json`;
        
        this.downloadJSON(backupData, filename);
        this.uiManager.showNotification(`📦 Полная резервная копия создана (${trees.length} деревьев, ${notes.length} заметок)`, 'success');
    }

    /**
     * Синхронизирует с GitHub
     */
    syncToGitHub() {
        const data = {
            trees: this.dataManager.getTrees(),
            notes: this.dataManager.getNotes()
        };
        
        this.githubSync.syncSimple(data);
    }

    /**
     * Запускает автосинхронизацию
     */
    triggerAutoSync() {
        const data = {
            trees: this.dataManager.getTrees(),
            notes: this.dataManager.getNotes()
        };
        
        this.githubSync.onDataChange(data);
    }

    /**
     * Скачивает JSON файл
     */
    downloadJSON(data, filename) {
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Получает информацию об устройстве
     */
    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            screen: {
                width: screen.width,
                height: screen.height
            }
        };
    }

    /**
     * Получает настройки приложения
     */
    getAppSettings() {
        const settings = {
            theme: localStorage.getItem('theme') || 'auto',
            language: localStorage.getItem('language') || 'ru',
            autoSync: localStorage.getItem('autoSync') === 'true',
            lastSync: localStorage.getItem('lastSync'),
            syncBranch: localStorage.getItem('syncBranch') || 'main'
        };
        
        // Убираем чувствительные данные
        delete settings.githubToken;
        
        return settings;
    }
}
