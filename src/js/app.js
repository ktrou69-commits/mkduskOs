/**
 * Главный файл приложения Knowledge Trees
 * Инициализирует и запускает приложение
 */
import { KnowledgeTreesApp } from './core/KnowledgeTreesApp.js';

// Глобальные переменные для отладки
let app;
let uiManager;

/**
 * Инициализирует приложение после загрузки DOM
 */
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing modular app...');
    
    try {
        // Создаем экземпляр приложения
        app = new KnowledgeTreesApp();
        
        // Делаем менеджеры доступными глобально для отладки и onclick обработчиков
        window.app = app;
        window.uiManager = app.uiManager;
        
        console.log('✅ Modular Knowledge Trees App initialized');
        console.log('✅ App available globally:', typeof window.app);
        console.log('✅ UI Manager available:', typeof window.uiManager);
        
        // Проверяем доступность ключевых методов
        if (typeof window.uiManager.selectItem !== 'function') {
            console.error('❌ selectItem method not available!');
        }
        if (typeof window.uiManager.deleteItem !== 'function') {
            console.error('❌ deleteItem method not available!');
        }
        
    } catch (error) {
        console.error('❌ Error initializing modular app:', error);
    }
});

// Альтернативная инициализация, если DOM уже загружен
if (document.readyState === 'loading') {
    console.log('📋 DOM still loading, waiting for DOMContentLoaded...');
} else {
    console.log('📋 DOM already loaded, initializing immediately...');
    setTimeout(() => {
        if (!window.app) {
            console.log('🔄 App not initialized yet, doing it now...');
            try {
                app = new KnowledgeTreesApp();
                window.app = app;
                window.uiManager = app.uiManager;
                console.log('✅ App initialized via fallback method');
            } catch (error) {
                console.error('❌ Fallback initialization failed:', error);
            }
        }
    }, 100);
}

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ ОТЛАДКИ =====
window.testApp = function() {
    console.log('🧪 TESTING MODULAR APP...');
    console.log('App exists:', !!window.app);
    console.log('UI Manager exists:', !!window.uiManager);
    console.log('selectItem exists:', !!(window.uiManager && window.uiManager.selectItem));
    console.log('deleteItem exists:', !!(window.uiManager && window.uiManager.deleteItem));
    
    if (window.app) {
        console.log('Current category:', window.app.currentCategory);
        console.log('Data Manager:', !!window.app.dataManager);
        console.log('Tree Manager:', !!window.app.treeManager);
        console.log('Notes Manager:', !!window.app.notesManager);
        console.log('GitHub Sync:', !!window.app.githubSync);
        
        // Тестируем клик на первый элемент
        const firstItem = document.querySelector('.tree-item');
        if (firstItem) {
            const id = firstItem.getAttribute('data-tree-id');
            console.log('Testing click on first item with ID:', id);
            if (id && window.uiManager) {
                window.uiManager.selectItem(id);
            }
        }
    }
};

window.debugClick = function(id) {
    console.log('🖱️ DEBUG CLICK: Simulating click on ID:', id);
    if (window.uiManager && window.uiManager.selectItem) {
        window.uiManager.selectItem(id);
    } else {
        console.error('UI Manager or selectItem not available');
    }
};

window.testSidebar = function() {
    console.log('🧪 TESTING SIDEBAR...');
    const sidebarItems = document.querySelectorAll('.tree-item');
    console.log('Sidebar items found:', sidebarItems.length);
    
    sidebarItems.forEach((item, index) => {
        const id = item.getAttribute('data-tree-id');
        const content = item.querySelector('.tree-item-content');
        const deleteBtn = item.querySelector('.tree-delete-btn');
        
        console.log(`Item ${index + 1}:`, {
            id: id,
            hasContent: !!content,
            hasDeleteBtn: !!deleteBtn,
            onclick: content ? content.getAttribute('onclick') : 'none'
        });
    });
    
    // Тестируем клик на первый элемент
    if (sidebarItems.length > 0) {
        const firstItem = sidebarItems[0];
        const id = firstItem.getAttribute('data-tree-id');
        console.log('Testing click on first sidebar item:', id);
        if (window.uiManager && id) {
            window.uiManager.selectItem(id);
        }
    }
};

window.testModules = function() {
    console.log('🧪 TESTING MODULES...');
    
    if (window.app) {
        console.log('📊 Data Manager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.app.dataManager)));
        console.log('🌳 Tree Manager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.app.treeManager)));
        console.log('📝 Notes Manager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.app.notesManager)));
        console.log('🎨 UI Manager methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.app.uiManager)));
        console.log('☁️ GitHub Sync methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(window.app.githubSync)));
        
        // Тестируем получение данных
        const trees = window.app.dataManager.getTrees();
        const notes = window.app.dataManager.getNotes();
        const stats = window.app.dataManager.getStats();
        
        console.log('📈 Current data:', {
            trees: trees.length,
            notes: notes.length,
            stats: stats
        });
    } else {
        console.error('❌ App not available for module testing');
    }
};

// Экспортируем для использования в других модулях
export { app };
