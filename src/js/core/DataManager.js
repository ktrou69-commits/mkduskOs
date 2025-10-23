/**
 * Менеджер для работы с данными и localStorage
 */
import { STORAGE_KEYS, DEFAULT_SETTINGS } from '../config/settings.js';
import { deepClone } from '../utils/helpers.js';

export class DataManager {
    constructor() {
        this.trees = [];
        this.notes = [];
        this.settings = { ...DEFAULT_SETTINGS };
        this.loadData();
    }

    /**
     * Загружает все данные из localStorage
     */
    loadData() {
        try {
            // Загружаем деревья
            const treesData = localStorage.getItem(STORAGE_KEYS.TREES);
            if (treesData) {
                this.trees = JSON.parse(treesData);
                console.log(`📚 Loaded ${this.trees.length} trees from localStorage`);
            }

            // Загружаем заметки
            const notesData = localStorage.getItem(STORAGE_KEYS.NOTES);
            if (notesData) {
                this.notes = JSON.parse(notesData);
                console.log(`📝 Loaded ${this.notes.length} notes from localStorage`);
            }

            // Загружаем настройки
            const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            if (settingsData) {
                this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingsData) };
            }

            console.log('✅ Data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.trees = [];
            this.notes = [];
            this.settings = { ...DEFAULT_SETTINGS };
        }
    }

    /**
     * Сохраняет все данные в localStorage
     */
    saveData() {
        try {
            localStorage.setItem(STORAGE_KEYS.TREES, JSON.stringify(this.trees));
            localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(this.notes));
            localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
            console.log('✅ Data saved to localStorage');
            return true;
        } catch (error) {
            console.error('❌ Error saving data:', error);
            return false;
        }
    }

    /**
     * Получает все деревья
     */
    getTrees() {
        return deepClone(this.trees);
    }

    /**
     * Получает все заметки
     */
    getNotes() {
        return deepClone(this.notes);
    }

    /**
     * Получает дерево по ID
     */
    getTree(id) {
        const tree = this.trees.find(t => t.id === id);
        return tree ? deepClone(tree) : null;
    }

    /**
     * Получает заметку по ID
     */
    getNote(id) {
        const note = this.notes.find(n => n.id === id);
        return note ? deepClone(note) : null;
    }

    /**
     * Добавляет новое дерево
     */
    addTree(tree) {
        const newTree = deepClone(tree);
        newTree.createdAt = new Date().toISOString();
        newTree.updatedAt = newTree.createdAt;
        
        this.trees.push(newTree);
        this.saveData();
        return newTree;
    }

    /**
     * Добавляет новую заметку
     */
    addNote(note) {
        const newNote = deepClone(note);
        newNote.createdAt = new Date().toISOString();
        newNote.updatedAt = newNote.createdAt;
        
        this.notes.push(newNote);
        this.saveData();
        return newNote;
    }

    /**
     * Обновляет дерево
     */
    updateTree(id, updates) {
        const index = this.trees.findIndex(t => t.id === id);
        if (index !== -1) {
            this.trees[index] = { 
                ...this.trees[index], 
                ...updates, 
                updatedAt: new Date().toISOString() 
            };
            this.saveData();
            return deepClone(this.trees[index]);
        }
        return null;
    }

    /**
     * Обновляет заметку
     */
    updateNote(id, updates) {
        const index = this.notes.findIndex(n => n.id === id);
        if (index !== -1) {
            this.notes[index] = { 
                ...this.notes[index], 
                ...updates, 
                updatedAt: new Date().toISOString() 
            };
            this.saveData();
            return deepClone(this.notes[index]);
        }
        return null;
    }

    /**
     * Удаляет дерево
     */
    deleteTree(id) {
        const index = this.trees.findIndex(t => t.id === id);
        if (index !== -1) {
            const deleted = this.trees.splice(index, 1)[0];
            this.saveData();
            return deleted;
        }
        return null;
    }

    /**
     * Удаляет заметку
     */
    deleteNote(id) {
        const index = this.notes.findIndex(n => n.id === id);
        if (index !== -1) {
            const deleted = this.notes.splice(index, 1)[0];
            this.saveData();
            return deleted;
        }
        return null;
    }

    /**
     * Поиск по деревьям
     */
    searchTrees(query) {
        const lowerQuery = query.toLowerCase();
        return this.trees.filter(tree => 
            tree.name.toLowerCase().includes(lowerQuery) ||
            (tree.description && tree.description.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Поиск по заметкам
     */
    searchNotes(query) {
        const lowerQuery = query.toLowerCase();
        return this.notes.filter(note => 
            note.name.toLowerCase().includes(lowerQuery) ||
            (note.content && note.content.toLowerCase().includes(lowerQuery))
        );
    }

    /**
     * Фильтрация по категории
     */
    getTreesByCategory(category) {
        return this.trees.filter(tree => tree.category === category);
    }

    /**
     * Фильтрация заметок по категории
     */
    getNotesByCategory(category) {
        return this.notes.filter(note => note.category === category);
    }

    /**
     * Получает статистику
     */
    getStats() {
        const treeNodes = this.trees.reduce((total, tree) => {
            return total + this.countTreeNodes(tree);
        }, 0);

        return {
            treesCount: this.trees.length,
            notesCount: this.notes.length,
            totalNodes: treeNodes,
            categories: {
                trees: [...new Set(this.trees.map(t => t.category))],
                notes: [...new Set(this.notes.map(n => n.category))]
            }
        };
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
     * Очищает все данные
     */
    clearAllData() {
        this.trees = [];
        this.notes = [];
        localStorage.removeItem(STORAGE_KEYS.TREES);
        localStorage.removeItem(STORAGE_KEYS.NOTES);
        console.log('🗑️ All data cleared');
    }

    /**
     * Импортирует данные
     */
    importData(data) {
        try {
            if (data.trees && Array.isArray(data.trees)) {
                data.trees.forEach(tree => {
                    const existingIndex = this.trees.findIndex(t => t.id === tree.id);
                    if (existingIndex !== -1) {
                        this.trees[existingIndex] = tree;
                    } else {
                        this.trees.push(tree);
                    }
                });
            }

            if (data.notes && Array.isArray(data.notes)) {
                data.notes.forEach(note => {
                    const existingIndex = this.notes.findIndex(n => n.id === note.id);
                    if (existingIndex !== -1) {
                        this.notes[existingIndex] = note;
                    } else {
                        this.notes.push(note);
                    }
                });
            }

            this.saveData();
            return true;
        } catch (error) {
            console.error('❌ Error importing data:', error);
            return false;
        }
    }

    /**
     * Экспортирует все данные
     */
    exportAllData() {
        return {
            trees: deepClone(this.trees),
            notes: deepClone(this.notes),
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
    }
}
