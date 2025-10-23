// ===== KNOWLEDGE TREES APPLICATION =====

class KnowledgeTreesApp {
    constructor() {
        this.trees = [];
        this.notes = [];
        this.currentTree = null;
        this.currentTreeId = null;
        this.currentCategory = 'trees'; // 'trees' or 'notes'
        this.bulkSelectMode = false;
        this.selectedItems = new Set();
        this.githubSync = new GitHubSync(this);
        this.isAuthenticated = false;
        this.password = 'dusk';
        
        this.initAuth();
    }

    // ===== AUTHENTICATION =====
    initAuth() {
        // Check if already authenticated
        const savedAuth = localStorage.getItem('mkdusk_auth');
        if (savedAuth === 'true') {
            this.isAuthenticated = true;
            this.showMainApp();
        } else {
            this.showLoginScreen();
        }
        
        this.bindAuthEvents();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    bindAuthEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Focus password input when login screen is shown
        const passwordInput = document.getElementById('passwordInput');
        if (passwordInput) {
            setTimeout(() => passwordInput.focus(), 500);
        }
    }

    showLoginScreen() {
        const loginOverlay = document.getElementById('loginOverlay');
        const mainApp = document.getElementById('mainApp');
        
        if (loginOverlay) loginOverlay.style.display = 'flex';
        if (mainApp) mainApp.style.display = 'none';
    }

    showMainApp() {
        const loginOverlay = document.getElementById('loginOverlay');
        const mainApp = document.getElementById('mainApp');
        
        if (loginOverlay) {
            loginOverlay.classList.add('login-fade-out');
            setTimeout(() => {
                loginOverlay.style.display = 'none';
                loginOverlay.classList.remove('login-fade-out');
            }, 500);
        }
        
        if (mainApp) {
            mainApp.style.display = 'block';
            mainApp.classList.add('main-fade-in');
            setTimeout(() => {
                mainApp.classList.remove('main-fade-in');
            }, 500);
        }

        // Initialize main app after authentication
        if (!this.initialized) {
            this.init();
            this.initialized = true;
        }
    }

    handleLogin(event) {
        event.preventDefault();
        const passwordInput = document.getElementById('passwordInput');
        const loginError = document.getElementById('loginError');
        const enteredPassword = passwordInput.value;

        if (enteredPassword === this.password) {
            this.isAuthenticated = true;
            localStorage.setItem('mkdusk_auth', 'true');
            this.showMainApp();
            this.showNotification('🌙 Welcome to MK.Dusk OS!', 'success');
        } else {
            loginError.style.display = 'block';
            loginError.classList.add('shake');
            passwordInput.value = '';
            passwordInput.focus();
            
            setTimeout(() => {
                loginError.classList.remove('shake');
            }, 500);
        }
    }

    updateClock() {
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        
        const timeStr = now.toLocaleTimeString('ru-RU', timeOptions);
        const dateStr = now.toLocaleDateString('ru-RU', dateOptions);
        
        // Update login screen clock
        const loginTime = document.getElementById('loginTime');
        const loginDate = document.getElementById('loginDate');
        if (loginTime) loginTime.textContent = timeStr;
        if (loginDate) loginDate.textContent = dateStr;
    }

    logout() {
        this.isAuthenticated = false;
        localStorage.removeItem('mkdusk_auth');
        location.reload(); // Simple way to reset everything
    }

    init() {
        this.loadTrees();
        this.bindEvents();
        this.renderTreesList();
        this.updateStats();
        
        // Show welcome screen if no trees
        if (this.trees.length === 0) {
            this.showWelcomeScreen();
        }
    }

    // ===== DATA MANAGEMENT =====
    
    loadTrees() {
        console.log('🔍 LOAD DEBUG: Loading data from localStorage');
        
        const saved = localStorage.getItem('knowledgeTrees');
        if (saved) {
            this.trees = JSON.parse(saved);
            console.log('✅ Loaded trees from localStorage:', this.trees);
        } else {
            this.trees = [];
            console.log('❌ No trees found in localStorage');
        }
        
        const savedNotes = localStorage.getItem('knowledgeNotes');
        if (savedNotes) {
            this.notes = JSON.parse(savedNotes);
            console.log('✅ Loaded notes from localStorage:', this.notes);
        } else {
            this.notes = [];
            console.log('❌ No notes found in localStorage');
        }
        
        console.log('Final loaded data - Trees:', this.trees.length, 'Notes:', this.notes.length);
    }

    saveTrees() {
        console.log('💾 SAVE DEBUG: Saving data to localStorage');
        console.log('Trees to save:', this.trees);
        console.log('Notes to save:', this.notes);
        console.log('Trees count:', this.trees.length);
        console.log('Notes count:', this.notes.length);
        
        // DEBUG: Show stack trace to see who called this
        if (this.trees.length === 0 && this.notes.length === 0) {
            console.log('🚨 WARNING: Saving empty data! Stack trace:');
            console.trace();
        }
        
        localStorage.setItem('knowledgeTrees', JSON.stringify(this.trees));
        localStorage.setItem('knowledgeNotes', JSON.stringify(this.notes));
        
        console.log('✅ Data saved to localStorage');
        
        // Trigger auto-sync if enabled
        if (this.githubSync) {
            this.githubSync.onDataChange();
        }
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        // Update UI
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');
        
        // Update button texts and welcome screen
        if (category === 'trees') {
            document.getElementById('createBtnText').textContent = 'Создать дерево';
            document.getElementById('createFirstBtnText').textContent = 'Создать первое дерево';
            document.getElementById('createSampleBtnText').textContent = 'Создать пример дерева';
            document.getElementById('searchInput').placeholder = 'Поиск деревьев...';
            document.getElementById('exportBtnText').textContent = 'Экспорт деревьев';
            
            // Update welcome screen for trees
            document.querySelector('.welcome-icon').textContent = '🌳';
            document.querySelector('.welcome-content h2').textContent = 'Добро пожаловать в Библиотеку Древ Знаний';
            document.querySelector('.welcome-content p').textContent = 'Создавайте структурированные деревья знаний для организации информации и идей';
        } else {
            document.getElementById('createBtnText').textContent = 'Создать заметку';
            document.getElementById('createFirstBtnText').textContent = 'Создать первую заметку';
            document.getElementById('createSampleBtnText').textContent = 'Создать пример заметки';
            document.getElementById('searchInput').placeholder = 'Поиск заметок...';
            document.getElementById('exportBtnText').textContent = 'Экспорт заметок';
            
            // Update welcome screen for notes
            document.querySelector('.welcome-icon').textContent = '📝';
            document.querySelector('.welcome-content h2').textContent = 'Добро пожаловать в Архив Заметок';
            document.querySelector('.welcome-content p').textContent = 'Создавайте и организуйте заметки для быстрого доступа к важной информации';
        }
        
        // Clear current selection
        this.currentTree = null;
        this.currentTreeId = null;
        
        // Reset bulk selection mode
        this.bulkSelectMode = false;
        this.selectedItems.clear();
        document.getElementById('bulkActions').style.display = 'none';
        document.getElementById('bulkDeleteBtn').style.display = 'none';
        
        // Re-render
        this.renderTreesList();
        this.updateStats();
        this.showWelcomeScreen();
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // ===== TREE OPERATIONS =====
    
    createNote(data) {
        const note = {
            id: this.generateId(),
            name: data.name,
            content: data.content || '',
            category: data.category || 'other',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.notes.push(note);
        this.saveTrees();
        this.renderTreesList();
        this.updateStats();
        this.selectTree(note.id);
        
        this.showNotification('Заметка создана успешно!');
        return note;
    }

    createTree(data) {
        const tree = {
            id: this.generateId(),
            name: data.name,
            description: data.description || '',
            category: data.category || 'other',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        this.trees.push(tree);
        this.saveTrees();
        this.renderTreesList();
        this.updateStats();
        this.selectTree(tree.id);
        
        this.showNotification('Дерево создано успешно!');
        return tree;
    }

    updateTree(id, data) {
        const tree = this.trees.find(t => t.id === id);
        if (tree) {
            Object.assign(tree, data);
            tree.updatedAt = new Date().toISOString();
            this.saveTrees();
            this.renderTreesList();
            if (this.currentTreeId === id) {
                this.renderCurrentTree();
            }
        }
    }

    updateNote(id, data) {
        const note = this.notes.find(n => n.id === id);
        if (note) {
            Object.assign(note, data);
            note.updatedAt = new Date().toISOString();
            this.saveTrees();
            this.renderTreesList();
            if (this.currentTreeId === id) {
                this.renderCurrentTree();
            }
        }
    }

    deleteTree(id) {
        if (confirm('Вы уверены, что хотите удалить это дерево?')) {
            console.log('🗑️ DELETE DEBUG: Deleting tree with ID:', id);
            console.log('Trees before delete:', this.trees.length);
            this.trees = this.trees.filter(t => t.id !== id);
            console.log('Trees after delete:', this.trees.length);
            this.saveTrees();
            this.renderTreesList();
            this.updateStats();
            
            if (this.currentTreeId === id) {
                this.currentTree = null;
                this.currentTreeId = null;
                this.showWelcomeScreen();
            }
            
            this.showNotification('Дерево удалено');
        }
    }

    deleteItem(id) {
        const itemType = this.currentCategory === 'trees' ? 'дерево' : 'заметку';
        if (confirm(`Вы уверены, что хотите удалить эт${this.currentCategory === 'trees' ? 'о' : 'у'} ${itemType}?`)) {
            console.log('🗑️ DELETE DEBUG: Deleting item with ID:', id, 'Category:', this.currentCategory);
            if (this.currentCategory === 'trees') {
                console.log('Trees before delete:', this.trees.length);
                this.trees = this.trees.filter(t => t.id !== id);
                console.log('Trees after delete:', this.trees.length);
            } else {
                console.log('Notes before delete:', this.notes.length);
                this.notes = this.notes.filter(n => n.id !== id);
                console.log('Notes after delete:', this.notes.length);
            }
            
            this.saveTrees();
            this.renderTreesList();
            this.updateStats();
            
            if (this.currentTreeId === id) {
                this.currentTree = null;
                this.currentTreeId = null;
                this.showWelcomeScreen();
            }
            
            this.showNotification(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} удален${this.currentCategory === 'trees' ? 'о' : 'а'}`);
        }
    }

    selectTree(id) {
        console.log('Selecting item with ID:', id);
        
        let item;
        if (this.currentCategory === 'trees') {
            item = this.trees.find(t => t.id === id);
        } else {
            item = this.notes.find(n => n.id === id);
        }
        
        if (item) {
            this.currentTree = item;
            this.currentTreeId = id;
            console.log('Current item set:', this.currentTree.name);
            this.renderCurrentTree();
            this.hideWelcomeScreen();
            
            // Update active state in sidebar
            document.querySelectorAll('.tree-item').forEach(item => {
                item.classList.remove('active');
            });
            const activeItem = document.querySelector(`[data-tree-id="${id}"]`);
            if (activeItem) {
                activeItem.classList.add('active');
            }
        } else {
            console.error('Item not found with ID:', id);
        }
    }


    // ===== BULK SELECTION =====
    
    toggleBulkSelectMode() {
        this.bulkSelectMode = !this.bulkSelectMode;
        this.selectedItems.clear();
        
        // Show/hide bulk actions
        document.getElementById('bulkActions').style.display = this.bulkSelectMode ? 'block' : 'none';
        document.getElementById('bulkDeleteBtn').style.display = this.bulkSelectMode ? 'inline-flex' : 'none';
        
        // Update "Select All" checkbox
        document.getElementById('selectAllCheckbox').checked = false;
        
        // Re-render list with checkboxes
        this.renderTreesList();
        
        if (this.bulkSelectMode) {
            this.showNotification('Режим массового выбора включен');
        } else {
            this.showNotification('Режим массового выбора выключен');
        }
    }

    toggleSelectAll() {
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        const items = this.currentCategory === 'trees' ? this.trees : this.notes;
        
        if (selectAllCheckbox.checked) {
            // Select all items
            items.forEach(item => this.selectedItems.add(item.id));
        } else {
            // Deselect all items
            this.selectedItems.clear();
        }
        
        this.updateBulkDeleteButton();
        this.renderTreesList();
    }

    toggleItemSelection(itemId) {
        if (this.selectedItems.has(itemId)) {
            this.selectedItems.delete(itemId);
        } else {
            this.selectedItems.add(itemId);
        }
        
        this.updateSelectAllCheckbox();
        this.updateBulkDeleteButton();
    }

    updateSelectAllCheckbox() {
        const items = this.currentCategory === 'trees' ? this.trees : this.notes;
        const selectAllCheckbox = document.getElementById('selectAllCheckbox');
        
        if (items.length === 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        } else if (this.selectedItems.size === items.length) {
            selectAllCheckbox.checked = true;
            selectAllCheckbox.indeterminate = false;
        } else if (this.selectedItems.size > 0) {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = true;
        } else {
            selectAllCheckbox.checked = false;
            selectAllCheckbox.indeterminate = false;
        }
    }

    updateBulkDeleteButton() {
        const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');
        const bulkDeleteText = document.getElementById('bulkDeleteText');
        
        if (this.selectedItems.size > 0) {
            bulkDeleteText.textContent = `Удалить выбранные (${this.selectedItems.size})`;
            bulkDeleteBtn.disabled = false;
        } else {
            bulkDeleteText.textContent = 'Удалить выбранные';
            bulkDeleteBtn.disabled = true;
        }
    }

    bulkDeleteSelected() {
        if (this.selectedItems.size === 0) return;
        
        const itemType = this.currentCategory === 'trees' ? 'деревьев' : 'заметок';
        const confirmMessage = `Вы уверены, что хотите удалить ${this.selectedItems.size} ${itemType}?`;
        
        if (confirm(confirmMessage)) {
            const selectedIds = Array.from(this.selectedItems);
            
            if (this.currentCategory === 'trees') {
                this.trees = this.trees.filter(tree => !selectedIds.includes(tree.id));
            } else {
                this.notes = this.notes.filter(note => !selectedIds.includes(note.id));
            }
            
            this.selectedItems.clear();
            this.saveTrees();
            this.renderTreesList();
            this.updateStats();
            this.showWelcomeScreen();
            
            this.showNotification(`Удалено ${selectedIds.length} ${itemType}`);
            this.updateBulkDeleteButton();
        }
    }

    // ===== RENDERING =====
    
    renderTreesList() {
        const container = document.getElementById('treesList');
        if (!container) {
            console.error('❌ Container treesList not found!');
            return;
        }
        
        const items = this.currentCategory === 'trees' ? this.trees : this.notes;
        const itemType = this.currentCategory === 'trees' ? 'деревьев' : 'заметок';
        const itemIcon = this.currentCategory === 'trees' ? '🌳' : '📝';
        
        console.log('🎨 Rendering', items.length, 'items in sidebar');
        
        if (items.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">${itemIcon}</div>
                    <div class="empty-state-text">Нет ${itemType}</div>
                    <div class="empty-state-subtext">Создайте ${this.currentCategory === 'trees' ? 'первое дерево знаний' : 'первую заметку'}</div>
                </div>
            `;
            return;
        }

        container.innerHTML = items.map(item => `
            <div class="tree-item ${this.bulkSelectMode ? 'bulk-select-mode' : ''}" data-tree-id="${item.id}">
                ${this.bulkSelectMode ? `
                    <input type="checkbox" class="tree-item-checkbox" 
                           ${this.selectedItems.has(item.id) ? 'checked' : ''}
                           onchange="app.toggleItemSelection('${item.id}'); event.stopPropagation();">
                ` : ''}
                <div class="tree-item-content" onclick="${this.bulkSelectMode ? `app.toggleItemSelection('${item.id}')` : `app.selectTree('${item.id}')`}">
                    <div class="tree-item-title">${item.name}</div>
                    <div class="tree-item-meta">
                        <span class="tree-category">${this.getCategoryName(item.category)}</span>
                        <span>${new Date(item.createdAt).toLocaleDateString('ru-RU')}</span>
                    </div>
                </div>
                ${!this.bulkSelectMode ? `
                    <div class="tree-item-actions">
                        <button class="btn btn-icon tree-delete-btn" onclick="app.deleteItem('${item.id}'); event.stopPropagation();" title="Удалить ${this.currentCategory === 'trees' ? 'дерево' : 'заметку'}">
                            <span class="icon">🗑️</span>
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');

        console.log('✅ Sidebar HTML updated, onclick handlers:', container.innerHTML.includes('app.selectTree'));
        
        // Добавляем обработчики событий как fallback для onclick
        this.attachSidebarEventListeners();
        
        // Click events are handled via onclick in HTML
    }

    attachSidebarEventListeners() {
        // Удаляем старые обработчики
        document.querySelectorAll('.tree-item-content').forEach(element => {
            element.replaceWith(element.cloneNode(true));
        });
        
        // Добавляем новые обработчики
        document.querySelectorAll('.tree-item-content').forEach(element => {
            element.addEventListener('click', (e) => {
                const treeItem = e.target.closest('.tree-item');
                if (treeItem) {
                    const id = treeItem.getAttribute('data-tree-id');
                    console.log('🖱️ Sidebar click via addEventListener:', id);
                    if (id) {
                        if (this.bulkSelectMode) {
                            this.toggleItemSelection(id);
                        } else {
                            this.selectTree(id);
                        }
                    }
                }
            });
        });
        
        // Обработчики для кнопок удаления
        document.querySelectorAll('.tree-delete-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const treeItem = e.target.closest('.tree-item');
                if (treeItem) {
                    const id = treeItem.getAttribute('data-tree-id');
                    console.log('🗑️ Delete click via addEventListener:', id);
                    if (id) {
                        this.deleteItem(id);
                    }
                }
            });
        });
        
        console.log('✅ Event listeners attached to sidebar elements');
    }

    renderCurrentTree() {
        if (!this.currentTree) return;

        document.getElementById('currentTreeTitle').textContent = this.currentTree.name;
        document.getElementById('currentTreeDate').textContent = 
            `Создано: ${new Date(this.currentTree.createdAt).toLocaleDateString('ru-RU')}`;

        const container = document.getElementById('treeContent');
        let content = '';

        if (this.currentCategory === 'notes') {
            // Для заметок показываем только содержимое
            document.getElementById('currentTreeNodes').textContent = 'Заметка';
            
            if (this.currentTree.content && this.currentTree.content.trim()) {
                content += `<div class="console-line console-content">${this.currentTree.content}</div>\n`;
            } else {
                content += `<div class="console-line console-content" style="color: #6e7681; font-style: italic;">📝 Заметка пустая</div>`;
            }
        } else {
            // Для деревьев показываем только описание
            document.getElementById('currentTreeNodes').textContent = 'Дерево знаний';
            
            if (this.currentTree.description && this.currentTree.description.trim()) {
                content += `<div class="console-line console-content">${this.currentTree.description}</div>\n`;
            } else {
                content += `<div class="console-line console-content" style="color: #6e7681; font-style: italic;">📝 Дерево пустое - добавьте описание</div>`;
            }
        }

        container.innerHTML = content;
    }


    // ===== UI HELPERS =====
    
    showWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'flex';
        document.getElementById('treeViewer').style.display = 'none';
    }

    hideWelcomeScreen() {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('treeViewer').style.display = 'flex';
    }

    updateStats() {
        const treesElement = document.getElementById('totalTrees');
        const nodesElement = document.getElementById('totalNodes');
        
        if (this.currentCategory === 'trees') {
            treesElement.textContent = this.trees.length;
            nodesElement.textContent = this.trees.length;
            
            // Обновляем лейблы
            treesElement.nextElementSibling.textContent = 'деревьев';
            nodesElement.nextElementSibling.textContent = 'всего';
        } else {
            treesElement.textContent = this.notes.length;
            nodesElement.textContent = this.notes.length;
            
            // Обновляем лейблы
            treesElement.nextElementSibling.textContent = 'заметок';
            nodesElement.nextElementSibling.textContent = 'всего';
        }
    }

    getCategoryName(category) {
        const categories = {
            business: 'Бизнес',
            technology: 'Технологии',
            science: 'Наука',
            education: 'Образование',
            personal: 'Личное',
            other: 'Другое'
        };
        return categories[category] || 'Другое';
    }

    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        const text = notification.querySelector('.notification-text');
        
        text.textContent = message;
        notification.className = `notification ${type} show`;
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    // ===== MODAL OPERATIONS =====
    
    openNoteModal(noteId = null) {
        // Для простоты используем то же модальное окно, но адаптируем его
        this.openTreeModal(noteId, true);
    }

    createSampleNote() {
        const sampleNote = {
            name: "Пример заметки",
            content: "Это пример простой заметки.\n\nЗаметки могут содержать:\n- Текст\n- Списки\n- Идеи\n- Ссылки\n\nИспользуйте заметки для быстрых записей и мыслей.",
            category: "personal"
        };
        
        return this.createNote(sampleNote);
    }
    
    openTreeModal(treeId = null, isNote = false) {
        const modal = document.getElementById('treeModal');
        const title = document.getElementById('treeModalTitle');
        const form = document.getElementById('treeForm');
        
        // Получаем элементы для изменения лейблов
        const nameLabel = document.querySelector('label[for="treeName"]');
        const descLabel = document.querySelector('label[for="treeDescription"]');
        const nameInput = document.getElementById('treeName');
        const descTextarea = document.getElementById('treeDescription');
        
        // Адаптируем заголовки и лейблы для заметок
        if (isNote) {
            // Изменяем лейблы для заметок
            nameLabel.textContent = 'Название заметки';
            descLabel.textContent = 'Содержимое';
            nameInput.placeholder = 'Введите название заметки';
            descTextarea.placeholder = 'Содержимое заметки...';
            
            if (treeId) {
                const note = this.notes.find(n => n.id === treeId);
                if (note) {
                    title.textContent = 'Редактировать заметку';
                    nameInput.value = note.name;
                    descTextarea.value = note.content || '';
                    document.getElementById('treeCategory').value = note.category;
                    form.dataset.treeId = treeId;
                    form.dataset.isNote = 'true';
                }
            } else {
                title.textContent = 'Создать заметку';
                form.reset();
                delete form.dataset.treeId;
                form.dataset.isNote = 'true';
            }
        } else {
            // Возвращаем лейблы для деревьев
            nameLabel.textContent = 'Название дерева';
            descLabel.textContent = 'Описание';
            nameInput.placeholder = 'Введите название дерева';
            descTextarea.placeholder = 'Краткое описание дерева знаний';
            
            if (treeId) {
                const tree = this.trees.find(t => t.id === treeId);
                if (tree) {
                    title.textContent = 'Редактировать дерево';
                    nameInput.value = tree.name;
                    descTextarea.value = tree.description || '';
                    document.getElementById('treeCategory').value = tree.category;
                    form.dataset.treeId = treeId;
                    delete form.dataset.isNote;
                }
            } else {
                title.textContent = 'Создать дерево';
                form.reset();
                delete form.dataset.treeId;
                delete form.dataset.isNote;
            }
        }
        
        modal.classList.add('active');
    }


    // ===== EVENT BINDINGS =====
    
    bindEvents() {
        // Header buttons
        document.getElementById('createItemBtn').addEventListener('click', () => {
            if (this.currentCategory === 'trees') {
                this.openTreeModal();
            } else {
                this.openNoteModal();
            }
        });
        document.getElementById('createFirstItemBtn').addEventListener('click', () => {
            if (this.currentCategory === 'trees') {
                this.openTreeModal();
            } else {
                this.openNoteModal();
            }
        });
        document.getElementById('createSampleBtn').addEventListener('click', () => {
            if (this.currentCategory === 'trees') {
                this.createSampleTree();
            } else {
                this.createSampleNote();
            }
        });

        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchCategory(tab.dataset.category);
            });
        });
        
        // Tree form
        document.getElementById('treeForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const isNote = e.target.dataset.isNote === 'true';
            
            const data = {
                name: formData.get('treeName') || document.getElementById('treeName').value,
                [isNote ? 'content' : 'description']: formData.get('treeDescription') || document.getElementById('treeDescription').value,
                category: formData.get('treeCategory') || document.getElementById('treeCategory').value
            };
            
            if (e.target.dataset.treeId) {
                if (isNote) {
                    this.updateNote(e.target.dataset.treeId, data);
                } else {
                    this.updateTree(e.target.dataset.treeId, data);
                }
            } else {
                if (isNote) {
                    this.createNote(data);
                } else {
                    this.createTree(data);
                }
            }
            
            this.closeModal('treeModal');
        });


        // Tree viewer buttons
        document.getElementById('editTreeBtn').addEventListener('click', () => {
            if (this.currentTreeId) {
                if (this.currentCategory === 'trees') {
                    this.openTreeModal(this.currentTreeId, false);
                } else {
                    this.openTreeModal(this.currentTreeId, true);
                }
            }
        });
        document.getElementById('deleteTreeBtn').addEventListener('click', () => {
            console.log('Delete button clicked, currentTreeId:', this.currentTreeId);
            if (this.currentTreeId) {
                this.deleteItem(this.currentTreeId);
            } else {
                console.warn('No item selected for deletion');
            }
        });

        // Modal close buttons
        document.querySelectorAll('.modal-close, #cancelTreeBtn, #cancelNodeBtn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });

        // Notification close
        document.querySelector('.notification-close').addEventListener('click', () => {
            document.getElementById('notification').classList.remove('show');
        });

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterTrees(e.target.value);
        });

        // Import/Export functionality
        document.getElementById('importBtn').addEventListener('click', () => this.openImportModal());
        document.getElementById('exportCurrentBtn').addEventListener('click', () => this.exportCurrentCategory());
        document.getElementById('exportAllBtn').addEventListener('click', () => this.exportAllData());

        // Execute import
        document.getElementById('executeImport').addEventListener('click', () => {
            this.executeImport();
        });

        // Bulk selection
        document.getElementById('selectAllCheckbox').addEventListener('change', () => {
            this.toggleSelectAll();
        });

        document.getElementById('bulkDeleteBtn').addEventListener('click', () => {
            this.bulkDeleteSelected();
        });

        // Double-click to toggle bulk select mode
        document.getElementById('treesList').addEventListener('dblclick', (e) => {
            if (e.target.closest('.tree-item')) {
                this.toggleBulkSelectMode();
            }
        });

        // Statistics modal
        document.getElementById('showStatsChart').addEventListener('click', () => {
            this.openStatsModal();
        });

        // Sync settings
        document.getElementById('syncSettingsBtn').addEventListener('click', () => this.githubSync.openSyncModal());
        
        // Debug button (only if exists)
        const debugBtn = document.getElementById('debugDataBtn');
        if (debugBtn) {
            debugBtn.addEventListener('click', () => this.debugData());
        }

        document.getElementById('saveSyncSettings').addEventListener('click', () => {
            this.githubSync.saveSyncSettings();
        });

        document.getElementById('testConnection').addEventListener('click', () => {
            this.githubSync.testConnection();
        });

        document.getElementById('syncNow').addEventListener('click', () => {
            this.githubSync.syncSimple();
        });

        document.getElementById('downloadFromGithub').addEventListener('click', () => {
            this.githubSync.loadFromGitHub();
        });

        document.getElementById('clearRepository').addEventListener('click', () => {
            this.githubSync.clearRepository();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            if (confirm('Вы уверены, что хотите выйти из MK.Dusk OS?')) {
                this.logout();
            }
        });

        // Import file handling
        document.getElementById('importFile').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    document.getElementById('importText').value = event.target.result;
                };
                reader.readAsText(file);
            }
        });
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }


    filterTrees(query) {
        const items = document.querySelectorAll('.tree-item');
        const lowercaseQuery = query.toLowerCase();
        
        items.forEach(item => {
            const title = item.querySelector('.tree-item-title').textContent.toLowerCase();
            const visible = title.includes(lowercaseQuery);
            item.style.display = visible ? 'block' : 'none';
        });
    }

    // ===== STATISTICS =====
    
    openStatsModal() {
        const modal = document.getElementById('statsModal');
        this.updateStatsData();
        this.drawStatsChart();
        modal.classList.add('active');
    }

    updateStatsData() {
        const treesCount = this.trees.length;
        const notesCount = this.notes.length;
        const totalCount = treesCount + notesCount;

        // Update summary numbers
        document.getElementById('statsTreesCount').textContent = treesCount;
        document.getElementById('statsNotesCount').textContent = notesCount;
        document.getElementById('statsTotalCount').textContent = totalCount;

        // Calculate categories
        const treeCategories = new Set(this.trees.map(t => t.category)).size;
        const noteCategories = new Set(this.notes.map(n => n.category)).size;

        // Calculate created today/week
        const today = new Date();
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        const createdToday = [...this.trees, ...this.notes].filter(item => {
            const created = new Date(item.createdAt);
            return created.toDateString() === today.toDateString();
        }).length;

        const createdWeek = [...this.trees, ...this.notes].filter(item => {
            const created = new Date(item.createdAt);
            return created >= weekAgo;
        }).length;

        // Update detail stats
        document.getElementById('treeCategoriesCount').textContent = treeCategories;
        document.getElementById('noteCategoriesCount').textContent = noteCategories;
        document.getElementById('createdTodayCount').textContent = createdToday;
        document.getElementById('createdWeekCount').textContent = createdWeek;
    }

    drawStatsChart() {
        const canvas = document.getElementById('statsChart');
        const ctx = canvas.getContext('2d');
        
        const treesCount = this.trees.length;
        const notesCount = this.notes.length;
        const total = treesCount + notesCount;

        if (total === 0) {
            // Draw empty state
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Нет данных для отображения', canvas.width / 2, canvas.height / 2);
            return;
        }

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Chart settings
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        // Calculate angles
        const treesAngle = (treesCount / total) * 2 * Math.PI;
        const notesAngle = (notesCount / total) * 2 * Math.PI;

        // Colors
        const treesColor = '#4CAF50'; // Green for trees
        const notesColor = '#2196F3'; // Blue for notes

        // Draw trees slice
        if (treesCount > 0) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, 0, treesAngle);
            ctx.closePath();
            ctx.fillStyle = treesColor;
            ctx.fill();
        }

        // Draw notes slice
        if (notesCount > 0) {
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, treesAngle, treesAngle + notesAngle);
            ctx.closePath();
            ctx.fillStyle = notesColor;
            ctx.fill();
        }

        // Draw labels
        ctx.fillStyle = '#333';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';

        if (treesCount > 0) {
            const treesLabelAngle = treesAngle / 2;
            const treesLabelX = centerX + Math.cos(treesLabelAngle) * (radius * 0.7);
            const treesLabelY = centerY + Math.sin(treesLabelAngle) * (radius * 0.7);
            ctx.fillStyle = 'white';
            ctx.fillText(`🌳 ${treesCount}`, treesLabelX, treesLabelY);
        }

        if (notesCount > 0) {
            const notesLabelAngle = treesAngle + (notesAngle / 2);
            const notesLabelX = centerX + Math.cos(notesLabelAngle) * (radius * 0.7);
            const notesLabelY = centerY + Math.sin(notesLabelAngle) * (radius * 0.7);
            ctx.fillStyle = 'white';
            ctx.fillText(`📝 ${notesCount}`, notesLabelX, notesLabelY);
        }

        // Draw center circle for donut effect
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.4, 0, 2 * Math.PI);
        ctx.fillStyle = '#f5f5f5';
        ctx.fill();

        // Draw total in center
        ctx.fillStyle = '#333';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`${total}`, centerX, centerY - 5);
        ctx.font = '12px Arial';
        ctx.fillText('всего', centerX, centerY + 15);
    }

    // ===== DEBUG OPERATIONS =====
    
    debugData() {
        console.log('🔍 === DEBUG DATA REPORT ===');
        console.log('Current app state:');
        console.log('- Trees array:', this.trees);
        console.log('- Notes array:', this.notes);
        console.log('- Trees count:', this.trees.length);
        console.log('- Notes count:', this.notes.length);
        console.log('- Current category:', this.currentCategory);
        
        // Check localStorage
        const savedTrees = localStorage.getItem('knowledgeTrees');
        const savedNotes = localStorage.getItem('knowledgeNotes');
        
        console.log('LocalStorage data:');
        console.log('- knowledgeTrees:', savedTrees ? JSON.parse(savedTrees) : 'null');
        console.log('- knowledgeNotes:', savedNotes ? JSON.parse(savedNotes) : 'null');
        
        // Check GitHub repository state
        this.debugGitHubRepo();
        
        // Show alert with summary
        const summary = `
DEBUG REPORT:
📊 App Data:
- Trees: ${this.trees.length}
- Notes: ${this.notes.length}
- Category: ${this.currentCategory}

💾 LocalStorage:
- Trees: ${savedTrees ? JSON.parse(savedTrees).length : 0}
- Notes: ${savedNotes ? JSON.parse(savedNotes).length : 0}

🔍 GitHub repo check started - see console!
        `;
        
        alert(summary);
        this.showNotification('🔍 Debug info logged to console', 'info');
    }

    async debugGitHubRepo() {
        if (!this.githubSync.isConnected) {
            console.log('❌ GitHub not connected');
            return;
        }

        console.log('🔍 === GITHUB REPOSITORY DEBUG ===');
        
        try {
            // Check if metadata.json exists
            const metadataResponse = await this.githubSync.makeApiRequest(`https://api.github.com/repos/${this.githubSync.settings.repo}/contents/metadata.json`, {
                headers: {
                    'Authorization': `token ${this.githubSync.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (metadataResponse.ok) {
                const metadata = await metadataResponse.json();
                console.log('✅ metadata.json exists, SHA:', metadata.sha.substring(0, 8));
            } else {
                console.log('❌ metadata.json does not exist');
            }

            // Check data folder
            const dataResponse = await this.githubSync.makeApiRequest(`https://api.github.com/repos/${this.githubSync.settings.repo}/contents/data`, {
                headers: {
                    'Authorization': `token ${this.githubSync.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (dataResponse.ok) {
                const dataContents = await dataResponse.json();
                console.log('✅ data folder exists with items:', dataContents.map(item => item.name));
            } else {
                console.log('❌ data folder does not exist');
            }

        } catch (error) {
            console.log('❌ Error checking GitHub repo:', error);
        }
    }

    // ===== IMPORT/EXPORT OPERATIONS =====
    
    openImportModal() {
        const modal = document.getElementById('importModal');
        modal.classList.add('active');
    }

    exportCurrentCategory() {
        console.log('🔍 EXPORT DEBUG: Current category export');
        console.log('Current category:', this.currentCategory);
        console.log('Trees data:', this.trees);
        console.log('Notes data:', this.notes);
        console.log('Trees count:', this.trees.length);
        console.log('Notes count:', this.notes.length);
        
        let dataToExport;
        let filename;
        
        if (this.currentCategory === 'trees') {
            dataToExport = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                type: 'trees',
                trees: this.trees,
                notes: []
            };
            filename = `trees-${new Date().toISOString().split('T')[0]}.json`;
        } else {
            dataToExport = {
                version: '1.0',
                exportDate: new Date().toISOString(),
                type: 'notes',
                trees: [],
                notes: this.notes
            };
            filename = `notes-${new Date().toISOString().split('T')[0]}.json`;
        }
        
        console.log('Data to export:', dataToExport);
        
        this.downloadJSON(dataToExport, filename);
        this.showNotification(`${this.currentCategory === 'trees' ? 'Деревья' : 'Заметки'} экспортированы`);
    }

    exportAllData() {
        console.log('🔍 EXPORT DEBUG: Full backup export');
        console.log('Trees data:', this.trees);
        console.log('Notes data:', this.notes);
        console.log('Trees count:', this.trees.length);
        console.log('Notes count:', this.notes.length);
        
        // Создаем полную резервную копию с расширенными метаданными
        const backupData = {
            // Информация о резервной копии
            backup: {
                version: '2.0',
                type: 'full_backup',
                created: new Date().toISOString(),
                createdBy: 'Knowledge Trees App',
                device: this.getDeviceInfo(),
                totalItems: this.trees.length + this.notes.length
            },
            
            // Статистика
            statistics: {
                treesCount: this.trees.length,
                notesCount: this.notes.length,
                totalNodes: this.trees.reduce((total, tree) => total + this.countTreeNodes(tree), 0),
                categories: {
                    trees: [...new Set(this.trees.map(t => t.category))],
                    notes: [...new Set(this.notes.map(n => n.category))]
                }
            },
            
            // Данные
            data: {
                trees: this.trees,
                notes: this.notes
            },
            
            // Настройки приложения (если есть)
            settings: this.getAppSettings()
        };
        
        console.log('Full backup data to export:', backupData);
        
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `knowledge-backup-${timestamp}.json`;
        
        this.downloadJSON(backupData, filename);
        this.showNotification(`📦 Полная резервная копия создана (${this.trees.length} деревьев, ${this.notes.length} заметок)`);
    }

    // Вспомогательные методы для резервного копирования
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
    
    getAppSettings() {
        // Получаем настройки из localStorage или возвращаем дефолтные
        const settings = {
            theme: localStorage.getItem('theme') || 'auto',
            language: localStorage.getItem('language') || 'ru',
            autoSync: localStorage.getItem('autoSync') === 'true',
            lastSync: localStorage.getItem('lastSync'),
            githubRepo: localStorage.getItem('githubRepo'),
            syncBranch: localStorage.getItem('syncBranch') || 'main'
        };
        
        // Убираем чувствительные данные
        delete settings.githubToken;
        
        return settings;
    }
    
    countTreeNodes(tree) {
        if (!tree.nodes || !Array.isArray(tree.nodes)) return 0;
        
        let count = tree.nodes.length;
        tree.nodes.forEach(node => {
            count += this.countNodeChildren(node);
        });
        
        return count;
    }
    
    countNodeChildren(node) {
        if (!node.children || !Array.isArray(node.children)) return 0;
        
        let count = node.children.length;
        node.children.forEach(child => {
            count += this.countNodeChildren(child);
        });
        
        return count;
    }

    restoreSettings(settings) {
        // Восстанавливаем настройки приложения (без чувствительных данных)
        if (settings.theme && settings.theme !== 'auto') {
            localStorage.setItem('theme', settings.theme);
        }
        
        if (settings.language) {
            localStorage.setItem('language', settings.language);
        }
        
        if (settings.syncBranch) {
            localStorage.setItem('syncBranch', settings.syncBranch);
        }
        
        // НЕ восстанавливаем githubToken и githubRepo для безопасности
        console.log('⚙️ Настройки восстановлены:', settings);
    }

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


    executeImport() {
        const importText = document.getElementById('importText').value.trim();
        if (!importText) {
            this.showNotification('Введите данные для импорта', 'error');
            return;
        }

        try {
            const data = JSON.parse(importText);
            
            // Определяем тип импорта
            const isFullBackup = data.backup && data.backup.type === 'full_backup';
            const isLegacyFormat = data.trees || data.notes;
            
            let importedTrees = 0;
            let importedNotes = 0;
            let backupInfo = null;
            
            if (isFullBackup) {
                // Новый формат полной резервной копии
                console.log('📦 Импорт полной резервной копии');
                backupInfo = data.backup;
                
                const treesToImport = data.data?.trees || [];
                const notesToImport = data.data?.notes || [];
                
                // Показываем информацию о резервной копии
                console.log('Backup info:', backupInfo);
                console.log('Statistics:', data.statistics);
                
                // Импортируем деревья
                treesToImport.forEach(tree => {
                    const existingTree = this.trees.find(t => t.id === tree.id);
                    if (existingTree) {
                        Object.assign(existingTree, { ...tree, id: existingTree.id });
                    } else {
                        this.trees.push({ ...tree });
                    }
                    importedTrees++;
                });
                
                // Импортируем заметки
                notesToImport.forEach(note => {
                    const existingNote = this.notes.find(n => n.id === note.id);
                    if (existingNote) {
                        Object.assign(existingNote, { ...note, id: existingNote.id });
                    } else {
                        this.notes.push({ ...note });
                    }
                    importedNotes++;
                });
                
                // Восстанавливаем настройки (опционально)
                if (data.settings) {
                    this.restoreSettings(data.settings);
                }
                
            } else if (isLegacyFormat) {
                // Старый формат или частичный экспорт
                console.log('📄 Импорт данных в старом формате');
                
                // Импортируем деревья
                if (data.trees && Array.isArray(data.trees)) {
                    data.trees.forEach(tree => {
                        const existingTree = this.trees.find(t => t.id === tree.id);
                        if (existingTree) {
                            Object.assign(existingTree, { ...tree, id: existingTree.id });
                        } else {
                            this.trees.push({ ...tree });
                        }
                        importedTrees++;
                    });
                }
                
                // Импортируем заметки
                if (data.notes && Array.isArray(data.notes)) {
                    data.notes.forEach(note => {
                        const existingNote = this.notes.find(n => n.id === note.id);
                        if (existingNote) {
                            Object.assign(existingNote, { ...note, id: existingNote.id });
                        } else {
                            this.notes.push({ ...note });
                        }
                        importedNotes++;
                    });
                }
            } else {
                throw new Error('Неизвестный формат данных');
            }
            
            if (importedTrees === 0 && importedNotes === 0) {
                throw new Error('Не найдено данных для импорта');
            }

            this.saveTrees();
            this.renderTreesList();
            this.updateStats();
            
            // Формируем сообщение о результате
            let message = '';
            if (isFullBackup) {
                const backupDate = new Date(backupInfo.created).toLocaleDateString('ru-RU');
                message = `📦 Резервная копия восстановлена (${backupDate}): `;
            } else {
                message = 'Данные восстановлены: ';
            }
            
            if (importedTrees > 0) message += `${importedTrees} деревьев`;
            if (importedNotes > 0) {
                if (importedTrees > 0) message += ', ';
                message += `${importedNotes} заметок`;
            }
            
            this.showNotification(message);
            this.closeModal('importModal');
            
        } catch (error) {
            console.error('Import error:', error);
            this.showNotification('Ошибка импорта: ' + error.message, 'error');
        }
    }


    // ===== SAMPLE DATA =====
    
    createSampleTree() {
        const sampleTree = {
            name: "Дерево направлений предпринимательства",
            description: `📂 ДЕРЕВО НАПРАВЛЕНИЙ ПРЕДПРИНИМАТЕЛЬСТВА

🌱 УРОВЕНЬ 0: БАЗОВЫЕ НАПРАВЛЕНИЯ (ЖИЗНЕННО НЕОБХОДИМЫЕ)

├── 🍞 Товарный бизнес
│   ├── Оптовая и розничная торговля
│   ├── Перепродажа, дропшипинг, маркетплейсы
│   ├── Паттерны успеха:
│   │   • идея и актуальность товара
│   │   • связи и поставщики
│   │   • скорость оборота
│   │   • маркетинг и визуализация
│   │   • партнёрская сеть и дистрибуция
│   └── Мета-смысл: скорость и эффективность обмена ценности

├── 👕 Брендовый бизнес (одежда, аксессуары, лайфстайл)
│   ├── Создание бренда и культурного кода
│   ├── Производство / дроп / линейка продуктов
│   ├── Паттерны успеха:
│   │   • сильный визуальный и смысловой образ
│   │   • уникальная идентичность бренда
│   │   • эмоция и эстетика (а не функционал)
│   │   • сообщество вокруг стиля
│   │   • коллаборации и инфлюенсеры
│   └── Мета-смысл: самовыражение через продукт

💓 УРОВЕНЬ 1: ОБРАЗОВАТЕЛЬНО-ПСИХОЛОГИЧЕСКИЕ НАПРАВЛЕНИЯ

├── 🧠 Образовательный бизнес (курсы, языки, апскилл)
│   ├── Курсы по английскому, немецкому, профессиональным навыкам
│   ├── Онлайн-школы, наставничество, ИИ-обучение
│   ├── Паттерны успеха:
│   │   • экспертность и доверие к личности
│   │   • структура и результат обучения
│   │   • маркетинг через ценность и пользу
│   │   • постоянное обновление контента
│   └── Мета-смысл: развитие потенциала людей

├── 💭 Психология, коучинг, ментал-хелс
│   ├── Курсы по саморазвитию, терапия, менторство
│   ├── Онлайн и оффлайн форматы
│   ├── Паттерны успеха:
│   │   • доверие и этика взаимодействия
│   │   • личный бренд специалиста
│   │   • эмоциональная вовлечённость
│   │   • результаты, подтверждённые отзывами
│   └── Мета-смысл: внутреннее равновесие и рост сознания`,
            category: "business"
        };
        
        return this.createTree(sampleTree);
    }
}

// ===== GITHUB SYNC CLASS =====
class GitHubSync {
    constructor(app) {
        this.app = app;
        this.settings = {
            token: '',
            repo: '',
            branch: 'main',
            autoSync: false
        };
        this.isConnected = false;
        this.cache = new Map(); // Enhanced cache for API responses
        this.rateLimitRemaining = 5000; // GitHub API limit
        this.rateLimitReset = 0;
        this.loadSettings();
        
        // Периодическая очистка кэша каждые 30 минут
        setInterval(() => this.clearCache(), 1800000);
    }

    loadSettings() {
        const saved = localStorage.getItem('githubSyncSettings');
        if (saved) {
            this.settings = JSON.parse(saved);
        }
    }

    saveSettings() {
        localStorage.setItem('githubSyncSettings', JSON.stringify(this.settings));
    }

    openSyncModal() {
        const modal = document.getElementById('syncModal');
        
        // Load current settings
        document.getElementById('githubToken').value = this.settings.token;
        document.getElementById('githubRepo').value = this.settings.repo;
        document.getElementById('syncBranch').value = this.settings.branch;
        document.getElementById('autoSync').checked = this.settings.autoSync;
        
        this.updateSyncStatus();
        modal.classList.add('active');
    }

    saveSyncSettings() {
        this.settings.token = document.getElementById('githubToken').value;
        this.settings.repo = document.getElementById('githubRepo').value;
        this.settings.branch = document.getElementById('syncBranch').value || 'main';
        this.settings.autoSync = document.getElementById('autoSync').checked;
        
        this.saveSettings();
        this.updateSyncStatus();
        this.app.showNotification('Настройки синхронизации сохранены');
    }

    updateSyncStatus() {
        const statusEl = document.getElementById('connectionStatus');
        const lastSyncEl = document.getElementById('lastSync');
        
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
        
        if (this.settings.lastSync) {
            const date = new Date(this.settings.lastSync);
            lastSyncEl.textContent = date.toLocaleString('ru-RU');
        } else {
            lastSyncEl.textContent = 'Никогда';
        }
    }

    async testConnection() {
        if (!this.settings.token || !this.settings.repo) {
            this.app.showNotification('Заполните токен и репозиторий', 'error');
            return false;
        }

        try {
            this.app.showNotification('🔍 Проверка подключения...', 'info');
            
            const response = await this.makeApiRequest(`https://api.github.com/repos/${this.settings.repo}`, {
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (response.ok) {
                const repoData = await response.json();
                this.isConnected = true;
                
                // Check rate limit
                const rateLimitRemaining = response.headers.get('X-RateLimit-Remaining');
                const rateLimitReset = response.headers.get('X-RateLimit-Reset');
                
                console.log(`📊 GitHub API: ${rateLimitRemaining} requests remaining`);
                
                this.app.showNotification(`✅ Подключение успешно! Репозиторий: ${repoData.full_name}`, 'success');
                this.updateSyncStatus();
                return true;
            } else {
                const error = await response.json();
                this.isConnected = false;
                this.app.showNotification(`❌ Ошибка подключения: ${error.message}`, 'error');
                this.updateSyncStatus();
                return false;
            }
        } catch (error) {
            this.isConnected = false;
            this.app.showNotification(`🌐 Ошибка сети: ${error.message}`, 'error');
            this.updateSyncStatus();
            return false;
        }
    }

    async createRepository() {
        try {
            const [owner, repo] = this.settings.repo.split('/');
            const response = await fetch('https://api.github.com/user/repos', {
                method: 'POST',
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: repo,
                    description: 'Knowledge Trees backup repository',
                    private: true,
                    auto_init: true
                })
            });

            if (response.ok) {
                this.isConnected = true;
                document.getElementById('connectionStatus').textContent = 'Репозиторий создан';
                document.getElementById('connectionStatus').className = 'status-value connected';
                this.app.showNotification('Репозиторий создан успешно!');
            } else {
                throw new Error(`Не удалось создать репозиторий: ${response.statusText}`);
            }
        } catch (error) {
            this.app.showNotification(`Ошибка создания репозитория: ${error.message}`, 'error');
        }
    }

    async syncNow() {
        if (!this.isConnected) {
            this.app.showNotification('Сначала настройте подключение', 'error');
            return;
        }

        const startTime = Date.now();
        
        try {
            this.app.showNotification('🔄 Простая синхронизация началась...', 'info');
            
            // DEBUG: Check data before sync
            console.log('🔍 SYNC DEBUG: Data before sync:');
            console.log('App trees:', this.app.trees);
            console.log('App notes:', this.app.notes);
            console.log('Trees count:', this.app.trees.length);
            console.log('Notes count:', this.app.notes.length);
            
            // Clear cache for fresh start
            this.clearCache(true);
            console.log('🧹 Cache cleared for clean sync');
            
            // Step 1: Ensure folder structure exists
            this.app.showNotification('📁 Проверка структуры папок...', 'info');
            await this.ensureFolderStructure();
            
            // Step 2: Upload metadata
            this.app.showNotification('📊 Обновление метаданных...', 'info');
            const metadata = {
                version: '2.0',
                exportDate: new Date().toISOString(),
                structure: 'structured',
                treesCount: this.app.trees.length,
                notesCount: this.app.notes.length,
                lastModified: new Date().toISOString()
            };
            await this.uploadOrUpdateFile('metadata.json', JSON.stringify(metadata, null, 2));

            // Step 3: Upload all trees
            this.app.showNotification('🌳 Синхронизация деревьев...', 'info');
            const uploadedTrees = await this.uploadAllTrees();
            
            // Step 4: Upload all notes
            this.app.showNotification('📝 Синхронизация заметок...', 'info');
            const uploadedNotes = await this.uploadAllNotes();
            
            // Update sync settings
            this.settings.lastSync = new Date().toISOString();
            this.saveSettings();
            this.updateSyncStatus();
            
            // Final success message
            const totalFiles = uploadedTrees + uploadedNotes + 1; // +1 for metadata
            const duration = ((Date.now() - startTime) / 1000).toFixed(1);
            this.app.showNotification(`✅ Синхронизация завершена за ${duration}с! 
            🌳 Деревьев: ${uploadedTrees}
            📝 Заметок: ${uploadedNotes}
            📊 Всего файлов: ${totalFiles}`, 'success');
            
        } catch (error) {
            this.app.showNotification(`Ошибка синхронизации: ${error.message}`, 'error');
            console.error('Sync error:', error);
        }
    }

    // Простой метод для загрузки или обновления файла
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
                } else {
                    console.log(`📄 File doesn't exist, will create new`);
                }
            } catch (error) {
                console.log(`📄 File doesn't exist, will create new`);
            }
            
            // Кодируем контент в Base64 с правильной поддержкой UTF-8
            const base64Content = this.encodeUTF8ToBase64(content);
            
            // Подготавливаем данные для загрузки
            const uploadData = {
                message: `Update ${filename} - ${new Date().toLocaleString('ru-RU')}`,
                content: base64Content,
                branch: this.settings.branch
            };
            
            // Добавляем SHA если файл существует
            if (sha) {
                uploadData.sha = sha;
                console.log(`📝 Updating existing file`);
            } else {
                console.log(`📄 Creating new file`);
            }
            
            // Загружаем файл
            const response = await this.makeApiRequest(`https://api.github.com/repos/${this.settings.repo}/contents/${filename}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(uploadData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to upload ${filename}: ${errorData.message}`);
            }
            
            const result = await response.json();
            console.log(`✅ Successfully uploaded ${filename}`);
            return result;
            
        } catch (error) {
            console.error(`❌ Error uploading ${filename}:`, error);
            throw error;
        }
    }

    // Простой метод для загрузки всех деревьев
    async uploadAllTrees() {
        if (this.app.trees.length === 0) {
            console.log('📝 No trees to upload');
            return 0;
        }

        console.log(`🌳 Uploading ${this.app.trees.length} trees...`);
        let uploadedCount = 0;

        for (const tree of this.app.trees) {
            try {
                const filename = `data/trees/tree_${tree.id}.json`;
                const content = JSON.stringify(tree, null, 2);
                
                await this.uploadOrUpdateFile(filename, content);
                console.log(`✅ Uploaded tree: ${tree.title || tree.name || 'Untitled'}`);
                uploadedCount++;
                
                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ Failed to upload tree ${tree.title || tree.name}:`, error);
            }
        }

        return uploadedCount;
    }

    // Простой метод для загрузки всех заметок
    async uploadAllNotes() {
        if (this.app.notes.length === 0) {
            console.log('📝 No notes to upload');
            return 0;
        }

        console.log(`📝 Uploading ${this.app.notes.length} notes...`);
        let uploadedCount = 0;

        for (const note of this.app.notes) {
            try {
                const filename = `data/notes/note_${note.id}.json`;
                const content = JSON.stringify(note, null, 2);
                
                await this.uploadOrUpdateFile(filename, content);
                console.log(`✅ Uploaded note: ${note.title || note.name || 'Untitled'}`);
                uploadedCount++;
                
                // Small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.error(`❌ Failed to upload note ${note.title || note.name}:`, error);
            }
        }

        return uploadedCount;
    }

    async makeApiRequest(url, options = {}) {
        // Проверяем rate limit
        if (this.rateLimitRemaining < 50) {
            const now = Date.now() / 1000;
            if (now < this.rateLimitReset) {
                const waitTime = (this.rateLimitReset - now + 1) * 1000;
                console.log(`⏳ Rate limit low, waiting ${Math.ceil(waitTime/1000)}s...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }

        // Адаптивная задержка в зависимости от оставшихся запросов
        if (this.rateLimitRemaining < 200) {
            await new Promise(resolve => setTimeout(resolve, 500));
        } else if (this.rateLimitRemaining < 500) {
            await new Promise(resolve => setTimeout(resolve, 200));
        }

        const response = await fetch(url, options);
        
        // Обновляем информацию о rate limit
        const remaining = response.headers.get('X-RateLimit-Remaining');
        const reset = response.headers.get('X-RateLimit-Reset');
        
        if (remaining) {
            this.rateLimitRemaining = parseInt(remaining);
            console.log(`📊 API requests remaining: ${this.rateLimitRemaining}`);
        }
        
        if (reset) {
            this.rateLimitReset = parseInt(reset);
        }

        return response;
    }

    clearCache(force = false) {
        if (force) {
            // Полная очистка кэша
            this.cache.clear();
            console.log('🧹 Cache: completely cleared');
            return;
        }
        
        // Умная очистка кэша - удаляем только старые записи (старше 1 часа)
        const now = Date.now();
        const maxAge = 3600000; // 1 час
        let cleared = 0;
        
        for (const [key, value] of this.cache.entries()) {
            if (value.timestamp && (now - value.timestamp > maxAge)) {
                this.cache.delete(key);
                cleared++;
            }
        }
        
        console.log(`🧹 Cache: removed ${cleared} old entries, ${this.cache.size} remain`);
    }

    // Удален дублирующий метод - используется только clearExistingDataFast

    async clearExistingDataFast() {
        try {
            console.log('Starting fast parallel cleanup...');
            
            // Parallel deletion of both folders
            const [treesDeleted, notesDeleted] = await Promise.all([
                this.deleteFilesInFolderFast('data/trees'),
                this.deleteFilesInFolderFast('data/notes')
            ]);
            
            console.log(`Fast deleted: ${treesDeleted} trees, ${notesDeleted} notes`);
            this.app.showNotification(`🗑️ Быстро удалено: ${treesDeleted} деревьев, ${notesDeleted} заметок`, 'info');
            
        } catch (error) {
            console.warn('Fast cleanup failed, falling back to regular cleanup:', error);
            await this.clearExistingData();
        }
    }

    async deleteFilesInFolder(folderPath) {
        try {
            // Get folder contents
            const response = await fetch(`https://api.github.com/repos/${this.settings.repo}/contents/${folderPath}`, {
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                console.log(`Folder ${folderPath} doesn't exist or is empty`);
                return 0;
            }

            const files = await response.json();
            let deletedCount = 0;

            // Delete each file (except .gitkeep and README.md)
            for (const file of files) {
                if (file.type === 'file' && 
                    !file.name.includes('.gitkeep') && 
                    !file.name.includes('README.md')) {
                    
                    console.log(`Deleting ${file.path}...`);
                    await this.deleteFileFromGitHub(file.path, file.sha);
                    deletedCount++;
                }
            }

            return deletedCount;
        } catch (error) {
            console.error(`Error deleting files in ${folderPath}:`, error);
            return 0;
        }
    }

    async deleteFileFromGitHub(filePath, sha) {
        const response = await fetch(`https://api.github.com/repos/${this.settings.repo}/contents/${filePath}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${this.settings.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `🗑️ Remove old ${filePath.includes('trees') ? 'tree' : 'note'} file before sync`,
                sha: sha,
                branch: this.settings.branch
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to delete ${filePath}: ${errorData.message}`);
        }

        return await response.json();
    }

    async deleteFilesInFolderFast(folderPath) {
        try {
            // Get folder contents
            const response = await this.makeApiRequest(`https://api.github.com/repos/${this.settings.repo}/contents/${folderPath}`, {
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    console.log(`📁 Folder ${folderPath} doesn't exist - this is expected for clean sync`);
                } else {
                    console.log(`❌ Error accessing folder ${folderPath}: ${response.status}`);
                }
                return 0;
            }

            const files = await response.json();
            
            // Filter files to delete (exclude .gitkeep and README.md)
            const filesToDelete = files.filter(file => 
                file.type === 'file' && 
                !file.name.includes('.gitkeep') && 
                !file.name.includes('README.md')
            );

            if (filesToDelete.length === 0) {
                return 0;
            }

            // Delete files in parallel batches of 5
            const batchSize = 5;
            let deletedCount = 0;

            for (let i = 0; i < filesToDelete.length; i += batchSize) {
                const batch = filesToDelete.slice(i, i + batchSize);
                
                const deletePromises = batch.map(file => 
                    this.deleteFileFromGitHubFast(file.path, file.sha)
                        .then(() => {
                            console.log(`✅ Deleted ${file.path}`);
                            return 1;
                        })
                        .catch(error => {
                            console.warn(`❌ Failed to delete ${file.path}:`, error);
                            return 0;
                        })
                );

                const results = await Promise.all(deletePromises);
                deletedCount += results.reduce((sum, result) => sum + result, 0);
                
                // Small delay between batches to avoid rate limiting
                if (i + batchSize < filesToDelete.length) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            return deletedCount;
        } catch (error) {
            console.error(`Error in fast deletion for ${folderPath}:`, error);
            return 0;
        }
    }

    async deleteFileFromGitHubFast(filePath, sha) {
        const response = await this.makeApiRequest(`https://api.github.com/repos/${this.settings.repo}/contents/${filePath}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${this.settings.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: `🚀 Fast cleanup: Remove ${filePath.includes('trees') ? 'tree' : 'note'} file`,
                sha: sha,
                branch: this.settings.branch
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to delete ${filePath}: ${errorData.message}`);
        }

        return await response.json();
    }

    async uploadTreesFast() {
        console.log('🔍 DEBUG: Checking trees data...');
        console.log('Trees array:', this.app.trees);
        console.log('Trees length:', this.app.trees.length);
        
        if (this.app.trees.length === 0) {
            console.log('❌ No trees to upload - trees array is empty!');
            return 0;
        }

        console.log(`🌳 Fast uploading ${this.app.trees.length} trees...`);
        
        // Upload trees in smaller batches to avoid SHA conflicts
        const batchSize = 1;
        let uploadedCount = 0;

        for (let i = 0; i < this.app.trees.length; i += batchSize) {
            const batch = this.app.trees.slice(i, i + batchSize);
            
            const uploadPromises = batch.map(tree => {
                const filename = `data/trees/tree_${tree.id}.json`;
                const content = JSON.stringify(tree, null, 2);
                
                return this.uploadToGitHub(filename, content)
                    .then(() => {
                        console.log(`✅ Uploaded tree: ${tree.name}`);
                        return 1;
                    })
                    .catch(error => {
                        console.error(`❌ Failed to upload tree ${tree.name}:`, error);
                        return 0;
                    });
            });

            const results = await Promise.all(uploadPromises);
            uploadedCount += results.reduce((sum, result) => sum + result, 0);
            
            // Show progress
            this.app.showNotification(`🌳 Загружено деревьев: ${uploadedCount}/${this.app.trees.length}`, 'info');
            
            // Small delay between batches
            if (i + batchSize < this.app.trees.length) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        return uploadedCount;
    }

    async uploadNotesFast() {
        console.log('🔍 DEBUG: Checking notes data...');
        console.log('Notes array:', this.app.notes);
        console.log('Notes length:', this.app.notes.length);
        
        if (this.app.notes.length === 0) {
            console.log('❌ No notes to upload - notes array is empty!');
            return 0;
        }

        console.log(`📝 Fast uploading ${this.app.notes.length} notes...`);
        
        // Upload notes in smaller batches to avoid SHA conflicts
        const batchSize = 1;
        let uploadedCount = 0;

        for (let i = 0; i < this.app.notes.length; i += batchSize) {
            const batch = this.app.notes.slice(i, i + batchSize);
            
            const uploadPromises = batch.map(note => {
                const filename = `data/notes/note_${note.id}.json`;
                const content = JSON.stringify(note, null, 2);
                
                return this.uploadToGitHub(filename, content)
                    .then(() => {
                        console.log(`✅ Uploaded note: ${note.title}`);
                        return 1;
                    })
                    .catch(error => {
                        console.error(`❌ Failed to upload note ${note.title}:`, error);
                        return 0;
                    });
            });

            const results = await Promise.all(uploadPromises);
            uploadedCount += results.reduce((sum, result) => sum + result, 0);
            
            // Show progress
            this.app.showNotification(`📝 Загружено заметок: ${uploadedCount}/${this.app.notes.length}`, 'info');
            
            // Small delay between batches
            if (i + batchSize < this.app.notes.length) {
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }

        return uploadedCount;
    }

    async ensureFolderStructure() {
        try {
            // Create README.md in data folder to ensure it exists
            const readmeContent = `# Knowledge Trees Data

This folder contains structured data for the Knowledge Trees application.

## Structure:
- \`trees/\` - Individual tree files
- \`notes/\` - Individual note files

Last sync: ${new Date().toISOString()}
Total trees: ${this.app.trees.length}
Total notes: ${this.app.notes.length}
`;
            
            await this.uploadToGitHub('data/README.md', readmeContent);
            
            // Create .gitkeep files to ensure folders exist
            if (this.app.trees.length === 0) {
                await this.uploadToGitHub('data/trees/.gitkeep', '# This file ensures the trees folder exists');
            }
            
            if (this.app.notes.length === 0) {
                await this.uploadToGitHub('data/notes/.gitkeep', '# This file ensures the notes folder exists');
            }
            
        } catch (error) {
            console.warn('Failed to create folder structure:', error);
            // Continue anyway, folders will be created when files are uploaded
        }
    }

    async verifyRepoStructure() {
        try {
            // Check if metadata exists
            const metadataResponse = await fetch(`https://api.github.com/repos/${this.settings.repo}/contents/metadata.json`, {
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            // Check if data folder exists
            const dataResponse = await fetch(`https://api.github.com/repos/${this.settings.repo}/contents/data`, {
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (metadataResponse.ok && dataResponse.ok) {
                this.app.showNotification('📁 Структура репозитория создана успешно!', 'info');
                
                // Log structure for debugging
                const dataContents = await dataResponse.json();
                console.log('Repository structure:', dataContents.map(item => item.name));
            } else {
                this.app.showNotification('⚠️ Структура может быть неполной, проверьте репозиторий', 'warning');
            }
        } catch (error) {
            console.warn('Failed to verify repository structure:', error);
        }
    }

    async uploadToGitHub(filename, content) {
        const cacheKey = `${this.settings.repo}:${filename}`;
        let sha = null;
        let existingContent = null;
        
        try {
            // При force update всегда проверяем существование файла для получения SHA
            if (this.forceUpdate) {
                console.log(`🔄 Force update mode for ${filename}`);
                
                // Всегда делаем запрос для получения актуального SHA
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
                        console.log(`🔍 File exists, using SHA: ${sha.substring(0, 8)}... for update`);
                        
                        // Кэшируем данные
                        this.cache.set(cacheKey, {
                            sha: sha,
                            content: this.decodeBase64ToUTF8(fileData.content),
                            timestamp: Date.now()
                        });
                    } else {
                        console.log(`📄 File ${filename} doesn't exist, will create new`);
                    }
                } catch (error) {
                    console.log(`📄 File ${filename} doesn't exist, will create new`);
                }
            } else {
                // Обычный режим - проверяем кэш и делаем GET если нужно
                const cachedData = this.cache.get(cacheKey);
                if (cachedData && cachedData.sha) {
                    sha = cachedData.sha;
                    // Если в кэше есть контент, используем его для сравнения
                    if (cachedData.content === content) {
                        console.log(`⏭️ Skipping ${filename} - no changes (cached)`);
                        return;
                    }
                } else {
                    // Делаем GET запрос только если нет данных в кэше
                    const getResponse = await this.makeApiRequest(`https://api.github.com/repos/${this.settings.repo}/contents/${filename}`, {
                        headers: {
                            'Authorization': `token ${this.settings.token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    
                    if (getResponse.ok) {
                        const fileData = await getResponse.json();
                        sha = fileData.sha;
                        existingContent = this.decodeBase64ToUTF8(fileData.content);
                        
                        // Кэшируем данные с timestamp
                        this.cache.set(cacheKey, {
                            sha: sha,
                            content: existingContent,
                            timestamp: Date.now()
                        });
                        
                        // Проверяем изменения
                        if (existingContent === content) {
                            console.log(`⏭️ Skipping ${filename} - no changes`);
                            return;
                        }
                    }
                }
            }
        } catch (error) {
            console.log(`❌ Error checking file ${filename}:`, error.message);
        }

        // Create descriptive commit message
        let commitMessage;
        if (filename === 'metadata.json') {
            commitMessage = `📊 Update metadata - ${new Date().toLocaleString('ru-RU')}`;
        } else if (filename.includes('data/README.md')) {
            commitMessage = `📁 Create data folder structure`;
        } else if (filename.includes('data/trees/')) {
            commitMessage = `🌳 Update tree: ${filename.split('/').pop()}`;
        } else if (filename.includes('data/notes/')) {
            commitMessage = `📝 Update note: ${filename.split('/').pop()}`;
        } else if (filename.includes('.gitkeep')) {
            commitMessage = `📁 Ensure folder structure exists`;
        } else {
            commitMessage = `📄 Update ${filename} - ${new Date().toLocaleString('ru-RU')}`;
        }

        // Improved UTF-8 Base64 encoding with better memory handling
        let base64Content;
        try {
            // For small content, use direct encoding
            base64Content = this.encodeUTF8ToBase64(content);
        } catch (error) {
            console.warn('Fallback to simple base64 encoding:', error);
            base64Content = this.encodeUTF8ToBase64(content);
        }

        // Upload or update the file
        const uploadData = {
            message: commitMessage,
            content: base64Content,
            branch: this.settings.branch
        };

        // Only add SHA if we have one (for updates, not new files)
        if (sha) {
            uploadData.sha = sha;
            console.log(`📝 Updating existing file with SHA: ${sha.substring(0, 8)}...`);
        } else {
            console.log(`📄 Creating new file: ${filename}`);
        }

        console.log(`📤 Uploading ${filename}...`, { 
            hasContent: !!content, 
            hasSha: !!sha,
            contentLength: content.length,
            operation: sha ? 'UPDATE' : 'CREATE'
        });

        const response = await this.makeApiRequest(`https://api.github.com/repos/${this.settings.repo}/contents/${filename}`, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.settings.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`Upload failed for ${filename}:`, errorData);
            throw new Error(`Failed to upload ${filename}: ${errorData.message || response.statusText}`);
        }

        const result = await response.json();
        
        // Update cache with new SHA and content
        if (result.content?.sha) {
            this.cache.set(cacheKey, {
                sha: result.content.sha,
                content: content,
                timestamp: Date.now()
            });
        }
        
        console.log(`✅ Successfully uploaded ${filename}`, result.commit?.sha);
        return result;
    }

    async downloadFromGithub() {
        if (!this.isConnected && this.settings.token && this.settings.repo) {
            await this.testConnection();
        }

        if (!this.isConnected) {
            this.app.showNotification('Сначала настройте подключение', 'error');
            return;
        }

        try {
            this.app.showNotification('Загрузка с GitHub началась...', 'info');

            // First, check if we have structured storage (metadata.json)
            let isStructured = false;
            try {
                const metadataResponse = await fetch(`https://api.github.com/repos/${this.settings.repo}/contents/metadata.json`, {
                    headers: {
                        'Authorization': `token ${this.settings.token}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                });
                
                if (metadataResponse.ok) {
                    isStructured = true;
                    this.app.showNotification('Обнаружена структурированная синхронизация', 'info');
                }
            } catch (error) {
                // No metadata, try old format
            }

            let importedTrees = 0;
            let importedNotes = 0;

            if (isStructured) {
                // Load structured data
                importedTrees = await this.loadStructuredTrees();
                importedNotes = await this.loadStructuredNotes();
            } else {
                // Fallback to old format
                const legacyData = await this.loadLegacyFormat();
                importedTrees = legacyData.trees;
                importedNotes = legacyData.notes;
            }

            this.app.saveTrees();
            this.app.renderTreesList();
            this.app.updateStats();

            let message = 'Загружено с GitHub: ';
            if (importedTrees > 0) message += `${importedTrees} деревьев`;
            if (importedNotes > 0) {
                if (importedTrees > 0) message += ', ';
                message += `${importedNotes} заметок`;
            }

            this.app.showNotification(message);
            
        } catch (error) {
            this.app.showNotification(`Ошибка загрузки: ${error.message}`, 'error');
        }
    }

    async loadStructuredTrees() {
        try {
            // Get list of tree files
            const treesResponse = await fetch(`https://api.github.com/repos/${this.settings.repo}/contents/data/trees`, {
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!treesResponse.ok) {
                return 0; // No trees folder
            }

            const treeFiles = await treesResponse.json();
            let loadedCount = 0;

            for (const file of treeFiles) {
                if (file.name.endsWith('.json')) {
                    try {
                        const tree = await this.downloadAndParseFile(file.download_url);
                        const existingIndex = this.app.trees.findIndex(t => t.id === tree.id);
                        if (existingIndex !== -1) {
                            this.app.trees[existingIndex] = { ...tree };
                        } else {
                            this.app.trees.push({ ...tree });
                        }
                        loadedCount++;
                    } catch (error) {
                        console.warn(`Failed to load tree file ${file.name}:`, error);
                    }
                }
            }

            return loadedCount;
        } catch (error) {
            console.warn('Failed to load structured trees:', error);
            return 0;
        }
    }

    async loadStructuredNotes() {
        try {
            // Get list of note files
            const notesResponse = await fetch(`https://api.github.com/repos/${this.settings.repo}/contents/data/notes`, {
                headers: {
                    'Authorization': `token ${this.settings.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });

            if (!notesResponse.ok) {
                return 0; // No notes folder
            }

            const noteFiles = await notesResponse.json();
            let loadedCount = 0;

            for (const file of noteFiles) {
                if (file.name.endsWith('.json')) {
                    try {
                        const note = await this.downloadAndParseFile(file.download_url);
                        const existingIndex = this.app.notes.findIndex(n => n.id === note.id);
                        if (existingIndex !== -1) {
                            this.app.notes[existingIndex] = { ...note };
                        } else {
                            this.app.notes.push({ ...note });
                        }
                        loadedCount++;
                    } catch (error) {
                        console.warn(`Failed to load note file ${file.name}:`, error);
                    }
                }
            }

            return loadedCount;
        } catch (error) {
            console.warn('Failed to load structured notes:', error);
            return 0;
        }
    }

    async downloadAndParseFile(downloadUrl) {
        const response = await fetch(downloadUrl);
        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }
        const content = await response.text();
        return JSON.parse(content);
    }

    async loadLegacyFormat() {
        // Load old format for backward compatibility
        const response = await fetch(`https://api.github.com/repos/${this.settings.repo}/contents/knowledge-backup.json`, {
            headers: {
                'Authorization': `token ${this.settings.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });

        if (!response.ok) {
            throw new Error('Файл резервной копии не найден');
        }

        const fileData = await response.json();
        const content = this.decodeBase64ToUTF8(fileData.content);
        const data = JSON.parse(content);

        let importedTrees = 0;
        let importedNotes = 0;

        if (data.trees && Array.isArray(data.trees)) {
            data.trees.forEach(tree => {
                const existingIndex = this.app.trees.findIndex(t => t.id === tree.id);
                if (existingIndex !== -1) {
                    this.app.trees[existingIndex] = { ...tree };
                } else {
                    this.app.trees.push({ ...tree });
                }
                importedTrees++;
            });
        }

        if (data.notes && Array.isArray(data.notes)) {
            data.notes.forEach(note => {
                const existingIndex = this.app.notes.findIndex(n => n.id === note.id);
                if (existingIndex !== -1) {
                    this.app.notes[existingIndex] = { ...note };
                } else {
                    this.app.notes.push({ ...note });
                }
                importedNotes++;
            });
        }

        return { trees: importedTrees, notes: importedNotes };
    }

    // Auto-sync when data changes
    onDataChange() {
        if (this.settings.autoSync && this.isConnected) {
            // Debounce auto-sync to avoid too frequent uploads
            clearTimeout(this.autoSyncTimeout);
            this.autoSyncTimeout = setTimeout(() => {
                this.syncSimple();
            }, 5000); // Wait 5 seconds after last change
        }
    }

    // ===== НОВАЯ УПРОЩЕННАЯ СИНХРОНИЗАЦИЯ =====
    
    async syncSimple() {
        if (!this.isConnected) {
            this.app.showNotification('Сначала настройте подключение', 'error');
            return;
        }

        try {
            this.app.showNotification('📦 Создание резервной копии...', 'info');
            
            // Создаем полную резервную копию используя существующий метод
            const backupData = {
                backup: {
                    version: '2.0',
                    type: 'full_backup',
                    created: new Date().toISOString(),
                    createdBy: 'Knowledge Trees App',
                    device: this.app.getDeviceInfo(),
                    totalItems: this.app.trees.length + this.app.notes.length
                },
                statistics: {
                    treesCount: this.app.trees.length,
                    notesCount: this.app.notes.length,
                    totalNodes: this.app.trees.reduce((total, tree) => total + this.app.countTreeNodes(tree), 0),
                    categories: {
                        trees: [...new Set(this.app.trees.map(t => t.category))],
                        notes: [...new Set(this.app.notes.map(n => n.category))]
                    }
                },
                data: {
                    trees: this.app.trees,
                    notes: this.app.notes
                },
                settings: this.app.getAppSettings()
            };
            
            // Загружаем один файл backup.json
            await this.uploadOrUpdateFile('backup.json', JSON.stringify(backupData, null, 2));
            
            // Обновляем настройки
            this.settings.lastSync = new Date().toISOString();
            this.saveSettings();
            this.updateSyncStatus();
            
            this.app.showNotification(`✅ Резервная копия сохранена в GitHub (${this.app.trees.length} деревьев, ${this.app.notes.length} заметок)`);
            
        } catch (error) {
            this.app.showNotification(`Ошибка создания резервной копии: ${error.message}`, 'error');
            console.error('Simple sync error:', error);
        }
    }

    async loadFromGitHub() {
        if (!this.isConnected) {
            this.app.showNotification('Сначала настройте подключение', 'error');
            return;
        }

        try {
            this.app.showNotification('📥 Загрузка резервной копии с GitHub...', 'info');
            
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
            const content = this.decodeBase64ToUTF8(fileData.content);
            const backupData = JSON.parse(content);
            
            // Проверяем формат
            if (!backupData.backup || backupData.backup.type !== 'full_backup') {
                throw new Error('Неверный формат резервной копии');
            }
            
            // Восстанавливаем данные
            this.app.trees = backupData.data?.trees || [];
            this.app.notes = backupData.data?.notes || [];
            
            // Сохраняем локально
            this.app.saveTrees();
            this.app.renderTreesList();
            this.app.updateStats();
            
            // Восстанавливаем настройки
            if (backupData.settings) {
                this.app.restoreSettings(backupData.settings);
            }
            
            const backupDate = new Date(backupData.backup.created).toLocaleDateString('ru-RU');
            this.app.showNotification(`📦 Резервная копия восстановлена (${backupDate}): ${this.app.trees.length} деревьев, ${this.app.notes.length} заметок`);
            
        } catch (error) {
            this.app.showNotification(`Ошибка загрузки: ${error.message}`, 'error');
            console.error('Load from GitHub error:', error);
        }
    }

    async clearRepository() {
        if (!this.isConnected) {
            this.app.showNotification('Сначала настройте подключение', 'error');
            return;
        }

        // Подтверждение от пользователя
        if (!confirm('⚠️ Вы уверены, что хотите очистить весь репозиторий? Это действие нельзя отменить!')) {
            return;
        }

        try {
            this.app.showNotification('🗑️ Очистка репозитория...', 'info');
            
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
                
                this.app.showNotification(`🗑️ Репозиторий очищен (удалено ${deletedCount} элементов)`);
            }
            
        } catch (error) {
            this.app.showNotification(`Ошибка очистки репозитория: ${error.message}`, 'error');
            console.error('Clear repository error:', error);
        }
    }

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

    // ===== УТИЛИТЫ ДЛЯ ПРАВИЛЬНОГО КОДИРОВАНИЯ UTF-8 =====
    
    encodeUTF8ToBase64(str) {
        // Кодируем строку UTF-8 в Base64 правильно
        try {
            // Используем TextEncoder для правильного кодирования UTF-8
            const encoder = new TextEncoder();
            const data = encoder.encode(str);
            
            // Конвертируем Uint8Array в строку для btoa
            let binary = '';
            for (let i = 0; i < data.length; i++) {
                binary += String.fromCharCode(data[i]);
            }
            
            return btoa(binary);
        } catch (error) {
            console.error('UTF-8 encoding error:', error);
            // Fallback к старому методу
            return btoa(unescape(encodeURIComponent(str)));
        }
    }
    
    decodeBase64ToUTF8(base64) {
        // Декодируем Base64 в строку UTF-8 правильно
        try {
            // Декодируем Base64 в бинарную строку
            const binary = atob(base64);
            
            // Конвертируем бинарную строку в Uint8Array
            const bytes = new Uint8Array(binary.length);
            for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
            }
            
            // Используем TextDecoder для правильного декодирования UTF-8
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(bytes);
        } catch (error) {
            console.error('UTF-8 decoding error:', error);
            // Fallback к старому методу
            try {
                return decodeURIComponent(escape(atob(base64)));
            } catch (fallbackError) {
                console.error('Fallback decoding error:', fallbackError);
                return atob(base64); // Последний резерв
            }
        }
    }
}

// ===== INITIALIZE APP =====
// Простая инициализация без лишних проверок
const app = new KnowledgeTreesApp();

// Делаем app доступным глобально для onclick обработчиков
window.app = app;

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ ДЛЯ ОТЛАДКИ =====
window.testApp = function() {
    console.log('🧪 TESTING APP...');
    console.log('App exists:', !!window.app);
    console.log('selectTree exists:', !!(window.app && window.app.selectTree));
    console.log('deleteItem exists:', !!(window.app && window.app.deleteItem));
    
    if (window.app) {
        console.log('Current category:', window.app.currentCategory);
        console.log('Trees count:', window.app.trees.length);
        console.log('Notes count:', window.app.notes.length);
        
        // Тестируем клик на первый элемент
        const firstItem = document.querySelector('.tree-item');
        if (firstItem) {
            const id = firstItem.getAttribute('data-tree-id');
            console.log('Testing click on first item with ID:', id);
            if (id) {
                window.app.selectTree(id);
            }
        }
    }
};

window.debugClick = function(id) {
    console.log('🖱️ DEBUG CLICK: Simulating click on ID:', id);
    if (window.app && window.app.selectTree) {
        window.app.selectTree(id);
    } else {
        console.error('App or selectTree not available');
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
        if (window.app && id) {
            window.app.selectTree(id);
        }
    }
};
