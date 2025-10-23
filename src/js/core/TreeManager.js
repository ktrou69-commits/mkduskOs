/**
 * Менеджер для работы с деревьями знаний
 */
import { generateId } from '../utils/helpers.js';
import { isValidTreeStructure, isValidNodeLevel } from '../utils/validators.js';

export class TreeManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
    }

    /**
     * Создает новое дерево
     */
    createTree(treeData) {
        const tree = {
            id: generateId(),
            name: treeData.name,
            description: treeData.description || '',
            category: treeData.category || 'other',
            nodes: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (!isValidTreeStructure(tree)) {
            throw new Error('Invalid tree structure');
        }

        return this.dataManager.addTree(tree);
    }

    /**
     * Обновляет дерево
     */
    updateTree(id, updates) {
        const tree = this.dataManager.getTree(id);
        if (!tree) {
            throw new Error('Tree not found');
        }

        const updatedTree = { ...tree, ...updates };
        if (!isValidTreeStructure(updatedTree)) {
            throw new Error('Invalid tree structure after update');
        }

        return this.dataManager.updateTree(id, updates);
    }

    /**
     * Удаляет дерево
     */
    deleteTree(id) {
        const tree = this.dataManager.getTree(id);
        if (!tree) {
            throw new Error('Tree not found');
        }

        return this.dataManager.deleteTree(id);
    }

    /**
     * Получает дерево по ID
     */
    getTree(id) {
        return this.dataManager.getTree(id);
    }

    /**
     * Получает все деревья
     */
    getAllTrees() {
        return this.dataManager.getTrees();
    }

    /**
     * Поиск деревьев
     */
    searchTrees(query) {
        return this.dataManager.searchTrees(query);
    }

    /**
     * Фильтрация по категории
     */
    getTreesByCategory(category) {
        return this.dataManager.getTreesByCategory(category);
    }

    /**
     * Добавляет узел в дерево
     */
    addNode(treeId, nodeData) {
        const tree = this.dataManager.getTree(treeId);
        if (!tree) {
            throw new Error('Tree not found');
        }

        const node = {
            id: generateId(),
            title: nodeData.title,
            icon: nodeData.icon || '🌱',
            content: nodeData.content || '',
            level: nodeData.level || 0,
            parentId: nodeData.parentId || null,
            children: [],
            expanded: true,
            createdAt: new Date().toISOString()
        };

        if (!isValidNodeLevel(node.level)) {
            throw new Error('Invalid node level');
        }

        // Добавляем узел в соответствующее место
        if (node.parentId) {
            const parentNode = this.findNodeById(tree.nodes, node.parentId);
            if (parentNode) {
                parentNode.children.push(node);
            } else {
                throw new Error('Parent node not found');
            }
        } else {
            tree.nodes.push(node);
        }

        return this.dataManager.updateTree(treeId, { nodes: tree.nodes });
    }

    /**
     * Обновляет узел
     */
    updateNode(treeId, nodeId, updates) {
        const tree = this.dataManager.getTree(treeId);
        if (!tree) {
            throw new Error('Tree not found');
        }

        const node = this.findNodeById(tree.nodes, nodeId);
        if (!node) {
            throw new Error('Node not found');
        }

        Object.assign(node, updates);
        return this.dataManager.updateTree(treeId, { nodes: tree.nodes });
    }

    /**
     * Удаляет узел
     */
    deleteNode(treeId, nodeId) {
        const tree = this.dataManager.getTree(treeId);
        if (!tree) {
            throw new Error('Tree not found');
        }

        const removed = this.removeNodeById(tree.nodes, nodeId);
        if (!removed) {
            throw new Error('Node not found');
        }

        return this.dataManager.updateTree(treeId, { nodes: tree.nodes });
    }

    /**
     * Переключает состояние развернутости узла
     */
    toggleNodeExpanded(treeId, nodeId) {
        const tree = this.dataManager.getTree(treeId);
        if (!tree) {
            throw new Error('Tree not found');
        }

        const node = this.findNodeById(tree.nodes, nodeId);
        if (!node) {
            throw new Error('Node not found');
        }

        node.expanded = !node.expanded;
        return this.dataManager.updateTree(treeId, { nodes: tree.nodes });
    }

    /**
     * Перемещает узел
     */
    moveNode(treeId, nodeId, newParentId, newLevel) {
        const tree = this.dataManager.getTree(treeId);
        if (!tree) {
            throw new Error('Tree not found');
        }

        // Удаляем узел из текущего места
        const node = this.removeNodeById(tree.nodes, nodeId, true);
        if (!node) {
            throw new Error('Node not found');
        }

        // Обновляем уровень узла и всех его детей
        this.updateNodeLevels(node, newLevel);

        // Добавляем в новое место
        if (newParentId) {
            const parentNode = this.findNodeById(tree.nodes, newParentId);
            if (parentNode) {
                parentNode.children.push(node);
            } else {
                throw new Error('New parent node not found');
            }
        } else {
            tree.nodes.push(node);
        }

        return this.dataManager.updateTree(treeId, { nodes: tree.nodes });
    }

    /**
     * Находит узел по ID рекурсивно
     */
    findNodeById(nodes, nodeId) {
        for (const node of nodes) {
            if (node.id === nodeId) {
                return node;
            }
            if (node.children && node.children.length > 0) {
                const found = this.findNodeById(node.children, nodeId);
                if (found) return found;
            }
        }
        return null;
    }

    /**
     * Удаляет узел по ID рекурсивно
     */
    removeNodeById(nodes, nodeId, returnNode = false) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === nodeId) {
                const removed = nodes.splice(i, 1)[0];
                return returnNode ? removed : true;
            }
            if (nodes[i].children && nodes[i].children.length > 0) {
                const result = this.removeNodeById(nodes[i].children, nodeId, returnNode);
                if (result) return result;
            }
        }
        return returnNode ? null : false;
    }

    /**
     * Обновляет уровни узла и всех его детей
     */
    updateNodeLevels(node, newLevel) {
        node.level = newLevel;
        if (node.children && node.children.length > 0) {
            node.children.forEach(child => {
                this.updateNodeLevels(child, newLevel + 1);
            });
        }
    }

    /**
     * Подсчитывает общее количество узлов в дереве
     */
    countNodes(tree) {
        return this.dataManager.countTreeNodes(tree);
    }

    /**
     * Получает все узлы дерева в плоском виде
     */
    getFlatNodesList(tree) {
        const flatNodes = [];
        
        const traverse = (nodes) => {
            nodes.forEach(node => {
                flatNodes.push(node);
                if (node.children && node.children.length > 0) {
                    traverse(node.children);
                }
            });
        };

        if (tree.nodes) {
            traverse(tree.nodes);
        }

        return flatNodes;
    }

    /**
     * Создает пример дерева предпринимательства
     */
    createSampleTree() {
        const sampleTree = {
            name: "Дерево направлений предпринимательства",
            description: "Структурированный обзор основных направлений и возможностей в предпринимательстве",
            category: "business"
        };

        const tree = this.createTree(sampleTree);

        // Добавляем узлы примера
        const rootNodes = [
            {
                title: "Традиционный бизнес",
                icon: "🏢",
                content: "Классические формы предпринимательства с проверенными бизнес-моделями",
                level: 0
            },
            {
                title: "Цифровое предпринимательство",
                icon: "💻",
                content: "Современные IT-решения и цифровые продукты",
                level: 0
            },
            {
                title: "Социальное предпринимательство",
                icon: "🤝",
                content: "Бизнес, направленный на решение социальных проблем",
                level: 0
            }
        ];

        rootNodes.forEach(nodeData => {
            this.addNode(tree.id, nodeData);
        });

        return tree;
    }
}
