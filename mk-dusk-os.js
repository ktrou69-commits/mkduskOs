// ===== MK.DUSK OS JAVASCRIPT =====

class MKDuskOS {
    constructor() {
        this.isLoggedIn = false;
        this.password = 'dusk';
        this.windows = new Map();
        this.windowZIndex = 100;
        this.draggedWindow = null;
        this.startMenuOpen = false;
        
        this.init();
    }

    init() {
        this.bootSystem();
        this.bindEvents();
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    // ===== BOOT SEQUENCE =====
    async bootSystem() {
        const bootSteps = [
            { text: 'Initializing system...', progress: 10 },
            { text: 'Loading kernel modules...', progress: 25 },
            { text: 'Starting system services...', progress: 45 },
            { text: 'Initializing user interface...', progress: 70 },
            { text: 'Loading desktop environment...', progress: 90 },
            { text: 'System ready!', progress: 100 }
        ];

        for (let i = 0; i < bootSteps.length; i++) {
            const step = bootSteps[i];
            document.getElementById('bootText').textContent = step.text;
            document.getElementById('bootProgress').style.width = step.progress + '%';
            
            await this.sleep(800 + Math.random() * 400);
        }

        await this.sleep(500);
        this.showLoginScreen();
    }

    showLoginScreen() {
        document.getElementById('bootScreen').style.display = 'none';
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('loginScreen').classList.add('fade-in');
        
        // Focus password input
        setTimeout(() => {
            document.getElementById('passwordInput').focus();
        }, 500);
    }

    // ===== AUTHENTICATION =====
    handleLogin(event) {
        event.preventDefault();
        const password = document.getElementById('passwordInput').value;
        const errorEl = document.getElementById('loginError');

        if (password === this.password) {
            this.isLoggedIn = true;
            this.showDesktop();
        } else {
            errorEl.style.display = 'block';
            errorEl.classList.add('shake');
            document.getElementById('passwordInput').value = '';
            document.getElementById('passwordInput').focus();
            
            setTimeout(() => {
                errorEl.classList.remove('shake');
            }, 500);
        }
    }

    showDesktop() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('desktop').style.display = 'block';
        document.getElementById('desktop').classList.add('fade-in');
        
        // Show welcome notification
        setTimeout(() => {
            this.showNotification('Welcome to MK.Dusk OS!', 'system');
        }, 1000);
    }

    // ===== WINDOW MANAGEMENT =====
    openApp(appName) {
        if (this.windows.has(appName)) {
            // Focus existing window
            this.focusWindow(appName);
            return;
        }

        const window = this.createWindow(appName);
        this.windows.set(appName, window);
        this.addToTaskbar(appName);
        
        // Load app content
        this.loadAppContent(appName, window);
    }

    createWindow(appName) {
        const windowEl = document.createElement('div');
        windowEl.className = 'window slide-up';
        windowEl.style.zIndex = ++this.windowZIndex;
        
        // Random position
        const x = 100 + Math.random() * 200;
        const y = 50 + Math.random() * 100;
        windowEl.style.left = x + 'px';
        windowEl.style.top = y + 'px';
        windowEl.style.width = '800px';
        windowEl.style.height = '600px';

        const appInfo = this.getAppInfo(appName);
        
        windowEl.innerHTML = `
            <div class="window-header">
                <div class="window-title">
                    <span class="window-icon">${appInfo.icon}</span>
                    <span class="window-text">${appInfo.name}</span>
                </div>
                <div class="window-controls">
                    <div class="window-control minimize" onclick="os.minimizeWindow('${appName}')">−</div>
                    <div class="window-control maximize" onclick="os.toggleMaximize('${appName}')">□</div>
                    <div class="window-control close" onclick="os.closeWindow('${appName}')">×</div>
                </div>
            </div>
            <div class="window-content" id="window-content-${appName}">
                <div style="padding: 2rem; text-align: center; color: #666;">
                    Loading ${appInfo.name}...
                </div>
            </div>
        `;

        document.getElementById('windowsContainer').appendChild(windowEl);
        this.makeWindowDraggable(windowEl, appName);
        
        return windowEl;
    }

    loadAppContent(appName, windowEl) {
        const contentEl = windowEl.querySelector('.window-content');
        
        switch (appName) {
            case 'knowledge-trees':
                // Load the existing Knowledge Trees app
                fetch('knowledge-trees.html')
                    .then(response => response.text())
                    .then(html => {
                        // Extract body content
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, 'text/html');
                        const bodyContent = doc.body.innerHTML;
                        contentEl.innerHTML = bodyContent;
                        
                        // Load and execute the app script
                        this.loadScript('app.js');
                    })
                    .catch(() => {
                        contentEl.innerHTML = this.getAppPlaceholder(appName);
                    });
                break;
                
            case 'file-manager':
                contentEl.innerHTML = `
                    <div style="height: 100%; display: flex; flex-direction: column;">
                        <div style="padding: 1rem; border-bottom: 1px solid #eee; background: #f8f9fa;">
                            <div style="display: flex; gap: 1rem; align-items: center;">
                                <button style="padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">← Back</button>
                                <button style="padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">→ Forward</button>
                                <div style="flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; background: white;">📁 /home/user/Documents</div>
                            </div>
                        </div>
                        <div style="flex: 1; padding: 1rem; background: white;">
                            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 1rem;">
                                <div style="text-align: center; padding: 1rem; border: 1px solid #eee; border-radius: 8px; cursor: pointer;">
                                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📁</div>
                                    <div style="font-size: 0.8rem;">Projects</div>
                                </div>
                                <div style="text-align: center; padding: 1rem; border: 1px solid #eee; border-radius: 8px; cursor: pointer;">
                                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">📄</div>
                                    <div style="font-size: 0.8rem;">document.txt</div>
                                </div>
                                <div style="text-align: center; padding: 1rem; border: 1px solid #eee; border-radius: 8px; cursor: pointer;">
                                    <div style="font-size: 2rem; margin-bottom: 0.5rem;">🖼️</div>
                                    <div style="font-size: 0.8rem;">image.png</div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'terminal':
                contentEl.innerHTML = `
                    <div style="height: 100%; background: #1a1a1a; color: #00ff00; font-family: 'Courier New', monospace; padding: 1rem; overflow-y: auto;">
                        <div>MK.Dusk OS Terminal v1.0.0</div>
                        <div>Copyright (c) 2024 MK.Dusk Corporation</div>
                        <div style="margin: 1rem 0;">Type 'help' for available commands.</div>
                        <div style="display: flex; align-items: center;">
                            <span style="color: #00ffff;">user@mkdusk:~$ </span>
                            <input type="text" style="flex: 1; background: transparent; border: none; color: #00ff00; outline: none; font-family: inherit;" placeholder="Enter command...">
                        </div>
                    </div>
                `;
                break;
                
            case 'calculator':
                contentEl.innerHTML = `
                    <div style="height: 100%; display: flex; flex-direction: column; background: #f0f0f0;">
                        <div style="padding: 1rem; background: #333; color: white; text-align: right; font-size: 1.5rem; font-family: monospace;">0</div>
                        <div style="flex: 1; display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #ddd;">
                            ${['C', '±', '%', '÷', '7', '8', '9', '×', '4', '5', '6', '−', '1', '2', '3', '+', '0', '0', '.', '='].map(btn => 
                                `<button style="background: ${['C', '±', '%', '÷', '×', '−', '+', '='].includes(btn) ? '#ff9500' : '#fff'}; border: none; font-size: 1.2rem; cursor: pointer; ${btn === '0' ? 'grid-column: span 2;' : ''}">${btn}</button>`
                            ).join('')}
                        </div>
                    </div>
                `;
                break;
                
            case 'settings':
                contentEl.innerHTML = `
                    <div style="height: 100%; display: flex; background: white;">
                        <div style="width: 200px; background: #f8f9fa; border-right: 1px solid #eee; padding: 1rem;">
                            <div style="font-weight: bold; margin-bottom: 1rem;">Settings</div>
                            <div style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <div style="padding: 0.5rem; border-radius: 4px; cursor: pointer; background: #007bff; color: white;">System</div>
                                <div style="padding: 0.5rem; border-radius: 4px; cursor: pointer;">Display</div>
                                <div style="padding: 0.5rem; border-radius: 4px; cursor: pointer;">Network</div>
                                <div style="padding: 0.5rem; border-radius: 4px; cursor: pointer;">Privacy</div>
                                <div style="padding: 0.5rem; border-radius: 4px; cursor: pointer;">Updates</div>
                            </div>
                        </div>
                        <div style="flex: 1; padding: 2rem;">
                            <h2 style="margin-bottom: 1rem; color: #333;">System Information</h2>
                            <div style="display: flex; flex-direction: column; gap: 1rem;">
                                <div><strong>OS:</strong> MK.Dusk OS v1.0.0</div>
                                <div><strong>Kernel:</strong> DuskKernel 5.4.0</div>
                                <div><strong>Architecture:</strong> x64</div>
                                <div><strong>Memory:</strong> 8.0 GB</div>
                                <div><strong>Storage:</strong> 256 GB SSD</div>
                                <div><strong>Uptime:</strong> 2 hours, 34 minutes</div>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'notes':
                contentEl.innerHTML = `
                    <div style="height: 100%; display: flex; flex-direction: column; background: white;">
                        <div style="padding: 1rem; border-bottom: 1px solid #eee; background: #f8f9fa;">
                            <div style="display: flex; gap: 1rem; align-items: center;">
                                <button style="padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">📄 New</button>
                                <button style="padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">💾 Save</button>
                                <button style="padding: 0.5rem 1rem; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">📁 Open</button>
                            </div>
                        </div>
                        <textarea style="flex: 1; border: none; padding: 1rem; font-family: 'Segoe UI', sans-serif; font-size: 1rem; outline: none; resize: none;" placeholder="Start typing your notes here..."></textarea>
                    </div>
                `;
                break;
                
            default:
                contentEl.innerHTML = this.getAppPlaceholder(appName);
        }
    }

    getAppPlaceholder(appName) {
        const appInfo = this.getAppInfo(appName);
        return `
            <div style="height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: white; color: #666;">
                <div style="font-size: 4rem; margin-bottom: 1rem;">${appInfo.icon}</div>
                <h2 style="margin-bottom: 1rem; color: #333;">${appInfo.name}</h2>
                <p>This application is under development.</p>
                <p style="margin-top: 0.5rem; font-size: 0.9rem;">Coming soon in MK.Dusk OS!</p>
            </div>
        `;
    }

    getAppInfo(appName) {
        const apps = {
            'knowledge-trees': { name: 'Knowledge Trees', icon: '🌳' },
            'file-manager': { name: 'File Manager', icon: '📁' },
            'settings': { name: 'Settings', icon: '⚙️' },
            'terminal': { name: 'Terminal', icon: '💻' },
            'calculator': { name: 'Calculator', icon: '🧮' },
            'notes': { name: 'Notes', icon: '📝' }
        };
        return apps[appName] || { name: 'Unknown App', icon: '❓' };
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    makeWindowDraggable(windowEl, appName) {
        const header = windowEl.querySelector('.window-header');
        let isDragging = false;
        let startX, startY, startLeft, startTop;

        header.addEventListener('mousedown', (e) => {
            if (e.target.closest('.window-controls')) return;
            
            isDragging = true;
            this.draggedWindow = appName;
            startX = e.clientX;
            startY = e.clientY;
            startLeft = parseInt(windowEl.style.left);
            startTop = parseInt(windowEl.style.top);
            
            windowEl.style.zIndex = ++this.windowZIndex;
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        });

        const onMouseMove = (e) => {
            if (!isDragging) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            windowEl.style.left = (startLeft + deltaX) + 'px';
            windowEl.style.top = Math.max(0, startTop + deltaY) + 'px';
        };

        const onMouseUp = () => {
            isDragging = false;
            this.draggedWindow = null;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
    }

    focusWindow(appName) {
        const window = this.windows.get(appName);
        if (window) {
            window.style.zIndex = ++this.windowZIndex;
            this.updateTaskbar();
        }
    }

    minimizeWindow(appName) {
        const window = this.windows.get(appName);
        if (window) {
            window.style.display = 'none';
            this.updateTaskbar();
        }
    }

    toggleMaximize(appName) {
        const window = this.windows.get(appName);
        if (window) {
            window.classList.toggle('maximized');
        }
    }

    closeWindow(appName) {
        const window = this.windows.get(appName);
        if (window) {
            window.remove();
            this.windows.delete(appName);
            this.removeFromTaskbar(appName);
        }
    }

    // ===== TASKBAR MANAGEMENT =====
    addToTaskbar(appName) {
        const taskbarApps = document.getElementById('taskbarApps');
        const appInfo = this.getAppInfo(appName);
        
        const taskbarApp = document.createElement('div');
        taskbarApp.className = 'taskbar-app active';
        taskbarApp.dataset.app = appName;
        taskbarApp.innerHTML = `
            <span class="app-icon">${appInfo.icon}</span>
            <span class="app-title">${appInfo.name}</span>
        `;
        
        taskbarApp.addEventListener('click', () => {
            const window = this.windows.get(appName);
            if (window.style.display === 'none') {
                window.style.display = 'block';
                this.focusWindow(appName);
            } else {
                this.focusWindow(appName);
            }
        });
        
        taskbarApps.appendChild(taskbarApp);
    }

    removeFromTaskbar(appName) {
        const taskbarApp = document.querySelector(`[data-app="${appName}"]`);
        if (taskbarApp) {
            taskbarApp.remove();
        }
    }

    updateTaskbar() {
        // Update active states based on window z-index
        const taskbarApps = document.querySelectorAll('.taskbar-app');
        taskbarApps.forEach(app => {
            app.classList.remove('active');
        });
        
        // Find highest z-index window
        let highestZ = 0;
        let activeApp = null;
        this.windows.forEach((window, appName) => {
            const zIndex = parseInt(window.style.zIndex);
            if (zIndex > highestZ && window.style.display !== 'none') {
                highestZ = zIndex;
                activeApp = appName;
            }
        });
        
        if (activeApp) {
            const activeTaskbarApp = document.querySelector(`[data-app="${activeApp}"]`);
            if (activeTaskbarApp) {
                activeTaskbarApp.classList.add('active');
            }
        }
    }

    // ===== START MENU =====
    toggleStartMenu() {
        const startMenu = document.getElementById('startMenu');
        const startButton = document.getElementById('startButton');
        
        this.startMenuOpen = !this.startMenuOpen;
        
        if (this.startMenuOpen) {
            startMenu.style.display = 'block';
            startMenu.classList.add('slide-up');
            startButton.classList.add('active');
        } else {
            startMenu.style.display = 'none';
            startMenu.classList.remove('slide-up');
            startButton.classList.remove('active');
        }
    }

    // ===== UTILITIES =====
    updateClock() {
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
        
        const timeStr = now.toLocaleTimeString('ru-RU', timeOptions);
        const dateStr = now.toLocaleDateString('ru-RU', dateOptions);
        
        // Update taskbar clock
        const taskbarTime = document.getElementById('taskbarTime');
        const taskbarDate = document.getElementById('taskbarDate');
        if (taskbarTime) taskbarTime.textContent = timeStr;
        if (taskbarDate) taskbarDate.textContent = dateStr;
        
        // Update login screen clock
        const loginTime = document.getElementById('loginTime');
        const loginDate = document.getElementById('loginDate');
        if (loginTime) loginTime.textContent = timeStr;
        if (loginDate) loginDate.textContent = dateStr;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(26, 26, 46, 0.95);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border: 1px solid #333;
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease-out;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2rem;">${type === 'system' ? '🔔' : 'ℹ️'}</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // ===== EVENT HANDLERS =====
    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        
        // Desktop icons
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('dblclick', () => {
                const appName = icon.dataset.app;
                this.openApp(appName);
            });
        });
        
        // Start menu
        document.getElementById('startButton').addEventListener('click', () => this.toggleStartMenu());
        
        // Start menu apps
        document.querySelectorAll('.start-app').forEach(app => {
            app.addEventListener('click', () => {
                const appName = app.dataset.app;
                this.openApp(appName);
                this.toggleStartMenu();
            });
        });
        
        // Power button
        document.getElementById('powerButton').addEventListener('click', () => {
            if (confirm('Are you sure you want to shutdown MK.Dusk OS?')) {
                location.reload();
            }
        });
        
        // Click outside to close start menu
        document.addEventListener('click', (e) => {
            if (this.startMenuOpen && !e.target.closest('.start-menu') && !e.target.closest('.start-button')) {
                this.toggleStartMenu();
            }
        });
        
        // Context menu
        document.getElementById('desktop').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.clientX, e.clientY);
        });
        
        // Hide context menu on click
        document.addEventListener('click', () => {
            document.getElementById('contextMenu').style.display = 'none';
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Escape') {
                this.toggleStartMenu();
            }
        });
    }

    showContextMenu(x, y) {
        const contextMenu = document.getElementById('contextMenu');
        contextMenu.style.display = 'block';
        contextMenu.style.left = x + 'px';
        contextMenu.style.top = y + 'px';
    }
}

// ===== GLOBAL FUNCTIONS =====
window.os = new MKDuskOS();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
