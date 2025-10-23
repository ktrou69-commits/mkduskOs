/**
 * Настройки приложения по умолчанию
 */
export const DEFAULT_SETTINGS = {
    // Тема оформления
    theme: 'auto', // 'light', 'dark', 'auto'
    
    // Язык интерфейса
    language: 'ru',
    
    // Синхронизация
    autoSync: false,
    syncInterval: 300000, // 5 минут
    
    // Деревья
    maxTreeLevels: 6,
    defaultCategory: 'other',
    autoSave: true,
    autoSaveInterval: 30000, // 30 секунд
    
    // UI настройки
    showWelcomeScreen: true,
    showStats: true,
    compactMode: false,
    animationsEnabled: true,
    
    // Экспорт/импорт
    exportFormat: 'json',
    includeMetadata: true,
    
    // Отладка
    debugMode: false,
    logLevel: 'info' // 'debug', 'info', 'warn', 'error'
};

export const STORAGE_KEYS = {
    TREES: 'knowledgeTrees',
    NOTES: 'knowledgeNotes',
    SETTINGS: 'knowledgeSettings',
    GITHUB_SYNC: 'githubSyncSettings',
    LAST_SYNC: 'lastSyncTime'
};

export const API_ENDPOINTS = {
    GITHUB_API: 'https://api.github.com',
    GITHUB_REPOS: '/user/repos',
    GITHUB_CONTENTS: '/repos/{owner}/{repo}/contents/{path}'
};
