/**
 * Менеджер для работы с заметками
 */
import { generateId } from '../utils/helpers.js';
import { isValidNoteStructure } from '../utils/validators.js';

export class NotesManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Создает новую заметку
     */
    createNote(noteData) {
        const note = {
            id: generateId(),
            name: noteData.name,
            content: noteData.content || '',
            category: noteData.category || 'other',
            tags: noteData.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (!isValidNoteStructure(note)) {
            throw new Error('Invalid note structure');
        }

        return this.dataManager.addNote(note);
    }

    /**
     * Обновляет заметку
     */
    updateNote(id, updates) {
        const note = this.dataManager.getNote(id);
        if (!note) {
            throw new Error('Note not found');
        }

        const updatedNote = { ...note, ...updates };
        if (!isValidNoteStructure(updatedNote)) {
            throw new Error('Invalid note structure after update');
        }

        return this.dataManager.updateNote(id, updates);
    }

    /**
     * Удаляет заметку
     */
    deleteNote(id) {
        const note = this.dataManager.getNote(id);
        if (!note) {
            throw new Error('Note not found');
        }

        return this.dataManager.deleteNote(id);
    }

    /**
     * Получает заметку по ID
     */
    getNote(id) {
        return this.dataManager.getNote(id);
    }

    /**
     * Получает все заметки
     */
    getAllNotes() {
        return this.dataManager.getNotes();
    }

    /**
     * Поиск заметок
     */
    searchNotes(query) {
        return this.dataManager.searchNotes(query);
    }

    /**
     * Фильтрация по категории
     */
    getNotesByCategory(category) {
        return this.dataManager.getNotesByCategory(category);
    }

    /**
     * Поиск заметок по тегам
     */
    getNotesByTag(tag) {
        return this.dataManager.getNotes().filter(note => 
            note.tags && note.tags.includes(tag)
        );
    }

    /**
     * Получает все уникальные теги
     */
    getAllTags() {
        const allTags = new Set();
        this.dataManager.getNotes().forEach(note => {
            if (note.tags && Array.isArray(note.tags)) {
                note.tags.forEach(tag => allTags.add(tag));
            }
        });
        return Array.from(allTags).sort();
    }

    /**
     * Добавляет тег к заметке
     */
    addTagToNote(noteId, tag) {
        const note = this.dataManager.getNote(noteId);
        if (!note) {
            throw new Error('Note not found');
        }

        if (!note.tags) {
            note.tags = [];
        }

        if (!note.tags.includes(tag)) {
            note.tags.push(tag);
            return this.dataManager.updateNote(noteId, { tags: note.tags });
        }

        return note;
    }

    /**
     * Удаляет тег из заметки
     */
    removeTagFromNote(noteId, tag) {
        const note = this.dataManager.getNote(noteId);
        if (!note) {
            throw new Error('Note not found');
        }

        if (note.tags && note.tags.includes(tag)) {
            note.tags = note.tags.filter(t => t !== tag);
            return this.dataManager.updateNote(noteId, { tags: note.tags });
        }

        return note;
    }

    /**
     * Получает заметки, созданные в определенный период
     */
    getNotesByDateRange(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return this.dataManager.getNotes().filter(note => {
            const noteDate = new Date(note.createdAt);
            return noteDate >= start && noteDate <= end;
        });
    }

    /**
     * Получает недавние заметки
     */
    getRecentNotes(limit = 10) {
        return this.dataManager.getNotes()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }

    /**
     * Получает заметки, отсортированные по дате обновления
     */
    getNotesByLastModified(limit = 10) {
        return this.dataManager.getNotes()
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, limit);
    }

    /**
     * Дублирует заметку
     */
    duplicateNote(id) {
        const originalNote = this.dataManager.getNote(id);
        if (!originalNote) {
            throw new Error('Note not found');
        }

        const duplicatedNote = {
            ...originalNote,
            id: generateId(),
            name: `${originalNote.name} (копия)`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        return this.dataManager.addNote(duplicatedNote);
    }

    /**
     * Архивирует заметку (добавляет тег "архив")
     */
    archiveNote(id) {
        return this.addTagToNote(id, 'архив');
    }

    /**
     * Разархивирует заметку (удаляет тег "архив")
     */
    unarchiveNote(id) {
        return this.removeTagFromNote(id, 'архив');
    }

    /**
     * Получает архивированные заметки
     */
    getArchivedNotes() {
        return this.getNotesByTag('архив');
    }

    /**
     * Получает активные (неархивированные) заметки
     */
    getActiveNotes() {
        return this.dataManager.getNotes().filter(note => 
            !note.tags || !note.tags.includes('архив')
        );
    }

    /**
     * Получает статистику по заметкам
     */
    getNotesStats() {
        const notes = this.dataManager.getNotes();
        const categories = {};
        const tags = {};
        
        notes.forEach(note => {
            // Статистика по категориям
            categories[note.category] = (categories[note.category] || 0) + 1;
            
            // Статистика по тегам
            if (note.tags && Array.isArray(note.tags)) {
                note.tags.forEach(tag => {
                    tags[tag] = (tags[tag] || 0) + 1;
                });
            }
        });

        return {
            total: notes.length,
            categories,
            tags,
            archived: this.getArchivedNotes().length,
            active: this.getActiveNotes().length
        };
    }

    /**
     * Создает пример заметки
     */
    createSampleNote() {
        const sampleNote = {
            name: "Идеи для развития проекта",
            content: `# Основные направления

## Техническое развитие
- Улучшение производительности
- Добавление новых функций
- Оптимизация интерфейса

## Маркетинг
- Продвижение в социальных сетях
- Создание контента
- Работа с сообществом

## Планы на будущее
- Мобильная версия
- API для интеграций
- Система плагинов`,
            category: "business",
            tags: ["идеи", "планы", "развитие"]
        };

        return this.createNote(sampleNote);
    }
}
