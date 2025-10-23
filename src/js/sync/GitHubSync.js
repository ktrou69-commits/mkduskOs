/**
 * Менеджер синхронизации с GitHub
 */
import { encodeUTF8ToBase64, decodeBase64ToUTF8 } from '../utils/encoding.js';
import { getDeviceInfo } from '../utils/helpers.js';
import { STORAGE_KEYS } from '../config/settings.js';

export class GitHubSync {
    constructor() {
        this.settings = {
            token: '',
            repo: '',
            branch: 'main',
            autoSync: false
        };
        this.isConnected = false;
        this.cache = new Map();
        this.rateLimitRemaining = 5000;
        this.rateLimitReset = 0;
        this.loadSettings();
    }

    /**
     * Загружает настройки синхронизации
     */
    loadSettings() {
        const saved = localStorage.getItem('githubSyncSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }

    /**
     * Сохраняет настройки синхронизации
     */
    saveSettings() {
        localStorage.setItem('githubSyncSettings', JSON.stringify(this.settings));
    }

    /**
     * Открывает модальное окно настроек
     */
    openSyncModal() {
        const modal = document.getElementById('syncModal');
        if (!modal) return;
        
        // Загружаем текущие настройки
        const tokenInput = document.getElementById('githubToken');
        const repoInput = document.getElementById('githubRepo');
        const branchInput = document.getElementById('syncBranch');
        const autoSyncCheckbox = document.getElementById('autoSync');

        if (tokenInput) tokenInput.value = this.settings.token;
        if (repoInput) repoInput.value = this.settings.repo;
        if (branchInput) branchInput.value = this.settings.branch;
        if (autoSyncCheckbox) autoSyncCheckbox.checked = this.settings.autoSync;
        
        this.updateSyncStatus();
        modal.classList.add('active');
    }

    /**
     * Сохраняет настройки синхронизации
     */
    saveSyncSettings() {
        const tokenInput = document.getElementById('githubToken');
        const repoInput = document.getElementById('githubRepo');
        const branchInput = document.getElementById('syncBranch');
        const autoSyncCheckbox = document.getElementById('autoSync');

        if (tokenInput) this.settings.token = tokenInput.value;
        if (repoInput) this.settings.repo = repoInput.value;
        if (branchInput) this.settings.branch = branchInput.value || 'main';
        if (autoSyncCheckbox) this.settings.autoSync = autoSyncCheckbox.checked;
        
        this.saveSettings();
        this.updateSyncStatus();
        
        // Отправляем событие об успешном сохранении
        const event = new CustomEvent('showNotification', {
            detail: { message: 'Настройки синхронизации сохранены', type: 'success' }
        });
        document.dispatchEvent(event);
    }

    /**
     * Обновляет статус подключения
     */
    updateSyncStatus() {
        const statusEl = document.getElementById('connectionStatus');
        const lastSyncEl = document.getElementById('lastSync');
        
        if (statusEl) {
            if (!this.settings.token || !this.settings.repo) {
                statusEl.textContent = 'Не настроено';
                statusEl.className = 'status-value';
            } else if (this.isConnected) {
                statusEl.textContent = 'Подключено';
                statusEl.className = 'status-value connected';
            } else {
                statusEl.textContent = 'Не проверено';
                statusEl.className = 'status-value';
            }
        }
        
        if (lastSyncEl) {
            const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
            if (lastSync) {
                const date = new Date(lastSync);
                lastSyncEl.textContent = date.toLocaleString('ru-RU');
            } else {
                lastSyncEl.textContent = 'Никогда';
            }
        }
    }

    /**
     * Тестирует подключение к GitHub
     */
    async testConnection() {
        if (!this.settings.token || !this.settings.repo) {
            const event = new CustomEvent('showNotification', {
                detail: { message: 'Заполните токен и репозиторий', type: 'error' }
            });
            document.dispatchEvent(event);
            return false;
        }

        try {
            const event = new CustomEvent('showNotification', {
                detail: { message: '🔍 Проверка подключения...', type: 'info' }
            });
            document.dispatchEvent(event);
            
            const response = await this.makeApiRequest(`https://api.github.com/repos/${this.settings.repo}`, {
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const repoData = await response.json();
                this.isConnected = true;
                
                // Проверяем лимиты API
                const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
                const rateLimitReset = response.headers.get('X-RateLimit-Reset');
                
                if (rateLimitRemaining) this.rateLimitRemaining = parseInt(rateLimitRemaining);
                if (rateLimitReset) this.rateLimitReset = parseInt(rateLimitReset);
                
                this.updateSyncStatus();
                
                const successEvent = new CustomEvent('showNotification', {
                    detail: { 
                        message: `✅ Подключение успешно! Репозиторий: ${repoData.full_name}`, 
                        type: 'success' 
                    }
                });
                document.dispatchEvent(successEvent);
                
                return true;
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            this.isConnected = false;
            this.updateSyncStatus();
            
            const errorEvent = new CustomEvent('showNotification', {
                detail: { message: `Ошибка подключения: ${error.message}`, type: 'error' }
            });
            document.dispatchEvent(errorEvent);
            
            return false;
        }
    }

    /**
     * Выполняет упрощенную синхронизацию
     */
    async syncSimple(data) {
        if (!this.isConnected) {
            const event = new CustomEvent('showNotification', {
                detail: { message: 'Сначала настройте подключение', type: 'error' }
            });
            document.dispatchEvent(event);
            return;
        }

        try {
            const notificationEvent = new CustomEvent('showNotification', {
                detail: { message: '📦 Создание резервной копии...', type: 'info' }
            });
            document.dispatchEvent(notificationEvent);
            
            // Создаем полную резервную копию
            const backupData = {
                backup: {
                    version: '2.0',
                    type: 'full_backup',
                    created: new Date().toISOString(),
                    createdBy: 'Knowledge Trees App',
                    device: getDeviceInfo(),
                    totalItems: (data.trees?.length || 0) + (data.notes?.length || 0)
                },
                statistics: {
                    treesCount: data.trees?.length || 0,
                    notesCount: data.notes?.length || 0,
                    totalNodes: this.calculateTotalNodes(data.trees || []),
                    categories: {
                        trees: [...new Set((data.trees || []).map(t => t.category))],
                        notes: [...new Set((data.notes || []).map(n => n.category))]
                    }
                },
                data: {
                    trees: data.trees || [],
                    notes: data.notes || []
                },
                settings: this.getAppSettings()
            };
            
            // Загружаем один файл backup.json
            await this.uploadOrUpdateFile('backup.json', JSON.stringify(backupData, null, 2));
            
            // Обновляем время последней синхронизации
            localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
            this.updateSyncStatus();
            
            const successEvent = new CustomEvent('showNotification', {
                detail: { 
                    message: `✅ Резервная копия сохранена в GitHub (${data.trees?.length || 0} деревьев, ${data.notes?.length || 0} заметок)`,
                    type: 'success'
                }
            });
            document.dispatchEvent(successEvent);
            
        } catch (error) {
            const errorEvent = new CustomEvent('showNotification', {
                detail: { message: `Ошибка создания резервной копии: ${error.message}`, type: 'error' }
            });
            document.dispatchEvent(errorEvent);
            console.error('Simple sync error:', error);
        }
    }

    /**
     * Загружает данные с GitHub
     */
    async loadFromGitHub() {
        if (!this.isConnected) {
            const event = new CustomEvent('showNotification', {
                detail: { message: 'Сначала настройте подключение', type: 'error' }
            });
            document.dispatchEvent(event);
            return;
        }

        try {
            const notificationEvent = new CustomEvent('showNotification', {
                detail: { message: '📥 Загрузка резервной копии с GitHub...', type: 'info' }
            });
            document.dispatchEvent(notificationEvent);
            
            // Загружаем backup.json
            const response = await this.makeApiRequest(`https://api.github.com/repos/${this.settings.repo}/contents/backup.json`, {
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                throw new Error('Резервная копия не найдена в репозитории');
            }

            const fileData = await response.json();
            const content = decodeBase64ToUTF8(fileData.content);
            const backupData = JSON.parse(content);
            
            // Проверяем формат
            if (!backupData.backup || backupData.backup.type !== 'full_backup') {
                throw new Error('Неверный формат резервной копии');
            }
            
            // Отправляем событие для импорта данных
            const importEvent = new CustomEvent('importData', {
                detail: { data: backupData.data }
            });
            document.dispatchEvent(importEvent);
            
            const backupDate = new Date(backupData.backup.created).toLocaleDateString('ru-RU');
            const successEvent = new CustomEvent('showNotification', {
                detail: { 
                    message: `📦 Резервная копия восстановлена (${backupDate}): ${backupData.data.trees?.length || 0} деревьев, ${backupData.data.notes?.length || 0} заметок`,
                    type: 'success'
                }
            });
            document.dispatchEvent(successEvent);
            
        } catch (error) {
            const errorEvent = new CustomEvent('showNotification', {
                detail: { message: `Ошибка загрузки: ${error.message}`, type: 'error' }
            });
            document.dispatchEvent(errorEvent);
            console.error('Load from GitHub error:', error);
        }
    }

    /**
     * Очищает репозиторий
     */
    async clearRepository() {
        if (!this.isConnected) {
            const event = new CustomEvent('showNotification', {
                detail: { message: 'Сначала настройте подключение', type: 'error' }
            });
            document.dispatchEvent(event);
            return;
        }

        // Подтверждение от пользователя
        if (!confirm('⚠️ Вы уверены, что хотите очистить весь репозиторий? Это действие нельзя отменить!')) {
            return;
        }

        try {
            const notificationEvent = new CustomEvent('showNotification', {
                detail: { message: '🗑️ Очистка репозитория...', type: 'info' }
            });
            document.dispatchEvent(notificationEvent);
            
            // Получаем список всех файлов в корне репозитория
            const response = await this.makeApiRequest(`https://api.github.com/repos/${this.settings.repo}/contents`, {
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const files = await response.json();
                let deletedCount = 0;
                
                // Удаляем все файлы и папки
                for (const file of files) {
                    try {
                        await this.deleteFileOrFolder(file.path, file.sha);
                        deletedCount++;
                    } catch (error) {
                        console.warn(`Не удалось удалить ${file.path}:`, error);
                    }
                }
                
                const successEvent = new CustomEvent('showNotification', {
                    detail: { message: `🗑️ Репозиторий очищен (удалено ${deletedCount} элементов)`, type: 'success' }
                });
                document.dispatchEvent(successEvent);
            }
            
        } catch (error) {
            const errorEvent = new CustomEvent('showNotification', {
                detail: { message: `Ошибка очистки репозитория: ${error.message}`, type: 'error' }
            });
            document.dispatchEvent(errorEvent);
            console.error('Clear repository error:', error);
        }
    }

    /**
     * Загружает или обновляет файл
     */
    async uploadOrUpdateFile(filename, content) {
        try {
            console.log(`📤 Processing file: ${filename}`);
            
            // Получаем текущий SHA файла (если существует)
            let sha = null;
            try {
                const getResponse = await this.makeApiRequest(`https://api.github.com/repos/${this.settings.repo}/contents/${filename}`, {
                    headers: {
                        'Authorization': `token ${this.settings.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (getResponse.ok) {
                    const fileData = await getResponse.json();
                    sha = fileData.sha;
                    console.log(`🔍 File exists, SHA: ${sha.substring(0, 8)}...`);
                }
            } catch (error) {
                console.log(`📄 File doesn't exist, will create new`);
            }
            
            // Кодируем контент в Base64 с правильной поддержкой UTF-8
            const base64Content = encodeUTF8ToBase64(content);
            
            // Подготавливаем данные для загрузки
            const uploadData = {
                message: `Update ${filename} - ${new Date().toLocaleString('ru-RU')}`,
                content: base64Content,
                branch: this.settings.branch
            };
            
            // Добавляем SHA если файл существует
            if (sha) {
                uploadData.sha = sha;
            }
            
            // Загружаем файл
            const uploadResponse = await this.makeApiRequest(`https://api.github.com/repos/${this.settings.repo}/contents/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(uploadData)
            });
            
            if (!uploadResponse.ok) {
                throw new Error(`Failed to upload ${filename}: ${uploadResponse.statusText}`);
            }
            
            console.log(`✅ Successfully uploaded: ${filename}`);
            return uploadResponse;
            
        } catch (error) {
            console.error(`❌ Error uploading ${filename}:`, error);
            throw error;
        }
    }

    /**
     * Удаляет файл или папку
     */
    async deleteFileOrFolder(path, sha) {
        const response = await this.makeApiRequest(`https://api.github.com/repos/${this.settings.repo}/contents/${path}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${this.settings.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `Delete ${path}`,
                sha: sha,
                branch: this.settings.branch
            })
        });

        if (!response.ok) {
            throw new Error(`Не удалось удалить ${path}`);
        }
        
        return response;
    }

    /**
     * Выполняет API запрос с обработкой лимитов
     */
    async makeApiRequest(url, options = {}) {
        // Проверяем лимиты API
        if (this.rateLimitRemaining <= 10) {
            const resetTime = new Date(this.rateLimitReset * 1000);
            const now = new Date();
            if (now < resetTime) {
                throw new Error(`API rate limit exceeded. Reset at ${resetTime.toLocaleTimeString()}`);
            }
        }

        const response = await fetch(url, options);
        
        // Обновляем информацию о лимитах
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const reset = response.headers.get('X-RateLimit-Reset');
        
        if (remaining) this.rateLimitRemaining = parseInt(remaining);
        if (reset) this.rateLimitReset = parseInt(reset);
        
        return response;
    }

    /**
     * Получает настройки приложения для экспорта
     */
    getAppSettings() {
        const settings = {
            theme: localStorage.getItem('theme') || 'auto',
            language: localStorage.getItem('language') || 'ru',
            autoSync: localStorage.getItem('autoSync') === 'true',
            lastSync: localStorage.getItem(STORAGE_KEYS.LAST_SYNC),
            syncBranch: this.settings.branch || 'main'
        };
        
        // НЕ экспортируем чувствительные данные
        return settings;
    }

    /**
     * Подсчитывает общее количество узлов в деревьях
     */
    calculateTotalNodes(trees) {
        return trees.reduce((total, tree) => {
            return total + this.countTreeNodes(tree);
        }, 0);
    }

    /**
     * Подсчитывает узлы в дереве
     */
    countTreeNodes(tree) {
        if (!tree.nodes || !Array.isArray(tree.nodes)) return 0;
        
        let count = tree.nodes.length;
        tree.nodes.forEach(node => {
            count += this.countNodeChildren(node);
        });
        
        return count;
    }

    /**
     * Подсчитывает дочерние узлы
     */
    countNodeChildren(node) {
        if (!node.children || !Array.isArray(node.children)) return 0;
        
        let count = node.children.length;
        node.children.forEach(child => {
            count += this.countNodeChildren(child);
        });
        
        return count;
    }

    /**
     * Автоматическая синхронизация при изменении данных
     */
    onDataChange(data) {
        if (this.settings.autoSync && this.isConnected) {
            // Debounce автосинхронизации
            clearTimeout(this.autoSyncTimeout);
            this.autoSyncTimeout = setTimeout(() => {
                this.syncSimple(data);
            }, 5000); // Ждем 5 секунд после последнего изменения
        }
    }
}
