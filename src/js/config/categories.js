/**
 * Категории для деревьев и заметок
 */
export const CATEGORIES = {
    business: {
        name: 'Бизнес',
        icon: '💼',
        color: '#3b82f6',
        description: 'Бизнес-процессы, стратегии, планирование'
    },
    technology: {
        name: 'Технологии',
        icon: '💻',
        color: '#10b981',
        description: 'IT, программирование, новые технологии'
    },
    science: {
        name: 'Наука',
        icon: '🔬',
        color: '#8b5cf6',
        description: 'Научные исследования, открытия, теории'
    },
    education: {
        name: 'Образование',
        icon: '📚',
        color: '#f59e0b',
        description: 'Обучение, курсы, образовательные материалы'
    },
    personal: {
        name: 'Личное',
        icon: '👤',
        color: '#ef4444',
        description: 'Личное развитие, цели, планы'
    },
    other: {
        name: 'Другое',
        icon: '📂',
        color: '#6b7280',
        description: 'Прочие материалы и заметки'
    }
};

export const getCategoryName = (categoryKey) => {
    return CATEGORIES[categoryKey]?.name || 'Неизвестная категория';
};

export const getCategoryIcon = (categoryKey) => {
    return CATEGORIES[categoryKey]?.icon || '📂';
};

export const getCategoryColor = (categoryKey) => {
    return CATEGORIES[categoryKey]?.color || '#6b7280';
};
