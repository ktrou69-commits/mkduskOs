/**
 * Вспомогательные функции
 */

/**
 * Генерирует уникальный ID
 */
export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

/**
 * Форматирует дату для отображения
 */
export const formatDate = (date, locale = 'ru-RU') => {
    return new Date(date).toLocaleDateString(locale);
};

/**
 * Форматирует дату и время
 */
export const formatDateTime = (date, locale = 'ru-RU') => {
    return new Date(date).toLocaleString(locale);
};

/**
 * Debounce функция
 */
export const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

/**
 * Throttle функция
 */
export const throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

/**
 * Глубокое клонирование объекта
 */
export const deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
};

/**
 * Проверяет, является ли строка валидным JSON
 */
export const isValidJSON = (str) => {
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Безопасное получение значения из объекта по пути
 */
export const safeGet = (obj, path, defaultValue = null) => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
        if (result === null || result === undefined || !result.hasOwnProperty(key)) {
            return defaultValue;
        }
        result = result[key];
    }
    
    return result;
};

/**
 * Экранирование HTML
 */
export const escapeHtml = (text) => {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
};

/**
 * Получение информации об устройстве
 */
export const getDeviceInfo = () => {
    return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        screen: {
            width: screen.width,
            height: screen.height
        },
        viewport: {
            width: window.innerWidth,
            height: window.innerHeight
        }
    };
};
