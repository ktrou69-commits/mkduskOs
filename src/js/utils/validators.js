/**
 * Валидаторы для проверки данных
 */

/**
 * Проверяет валидность email
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Проверяет валидность URL
 */
export const isValidURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Проверяет валидность GitHub токена
 */
export const isValidGitHubToken = (token) => {
    // GitHub Personal Access Token format: ghp_xxxxxxxxxxxxxxxxxxxx
    const tokenRegex = /^ghp_[a-zA-Z0-9]{36}$/;
    return tokenRegex.test(token);
};

/**
 * Проверяет валидность имени репозитория GitHub
 */
export const isValidGitHubRepo = (repo) => {
    // Format: username/repository
    const repoRegex = /^[a-zA-Z0-9._-]+\/[a-zA-Z0-9._-]+$/;
    return repoRegex.test(repo);
};

/**
 * Проверяет валидность названия дерева/заметки
 */
export const isValidTreeName = (name) => {
    return typeof name === 'string' && name.trim().length > 0 && name.length <= 200;
};

/**
 * Проверяет валидность категории
 */
export const isValidCategory = (category) => {
    const validCategories = ['business', 'technology', 'science', 'education', 'personal', 'other'];
    return validCategories.includes(category);
};

/**
 * Проверяет валидность уровня узла дерева
 */
export const isValidNodeLevel = (level) => {
    return Number.isInteger(level) && level >= 0 && level <= 5;
};

/**
 * Проверяет валидность структуры дерева
 */
export const isValidTreeStructure = (tree) => {
    if (!tree || typeof tree !== 'object') return false;
    
    const requiredFields = ['id', 'name', 'category', 'createdAt'];
    for (const field of requiredFields) {
        if (!tree.hasOwnProperty(field)) return false;
    }
    
    if (!isValidTreeName(tree.name)) return false;
    if (!isValidCategory(tree.category)) return false;
    
    return true;
};

/**
 * Проверяет валидность структуры заметки
 */
export const isValidNoteStructure = (note) => {
    if (!note || typeof note !== 'object') return false;
    
    const requiredFields = ['id', 'name', 'category', 'createdAt'];
    for (const field of requiredFields) {
        if (!note.hasOwnProperty(field)) return false;
    }
    
    if (!isValidTreeName(note.name)) return false;
    if (!isValidCategory(note.category)) return false;
    
    return true;
};

/**
 * Проверяет валидность резервной копии
 */
export const isValidBackup = (backup) => {
    if (!backup || typeof backup !== 'object') return false;
    
    // Проверяем новый формат полной резервной копии
    if (backup.backup && backup.backup.type === 'full_backup') {
        return backup.data && 
               Array.isArray(backup.data.trees) && 
               Array.isArray(backup.data.notes);
    }
    
    // Проверяем старый формат
    return (backup.trees && Array.isArray(backup.trees)) || 
           (backup.notes && Array.isArray(backup.notes));
};
