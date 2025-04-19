class TaskTimer {
    constructor() {
        this.tasks = [];
        this.taskForm = document.getElementById('taskForm');
        this.taskList = document.getElementById('taskList');
        this.runningTasksList = document.getElementById('runningTasksList');
        this.statsElements = {
            totalTasks: document.getElementById('totalTasks'),
            activeTasks: document.getElementById('activeTasks'),
            totalTime: document.getElementById('totalTime')
        };
        this.charts = {
            pie: null,
            bar: null
        };
        this.darkMode = localStorage.getItem('darkMode') === 'true';

        // Storage preferences
        this.storagePreferences = {
            essential: true,
            taskStorage: false,
            fileStorage: false
        };

        // Storage status
        this.storageStatus = document.querySelector('.storage-status');
        this.cookieConsent = document.querySelector('.cookie-consent');
        this.cookieModal = document.querySelector('.modal');

        this.init();
    }

    init() {
        this.initDarkMode();
        this.initCharts();
        this.initAuth();
        this.taskForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        this.loadTasks();
        this.startStatsUpdate();
        this.initAdContainer();

        // Initialize storage
        this.initializeStorage();
    }

    initDarkMode() {
        document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
        const darkModeToggle = document.getElementById('darkModeToggle');
        darkModeToggle.addEventListener('click', () => {
            this.darkMode = !this.darkMode;
            localStorage.setItem('darkMode', this.darkMode);
            document.documentElement.setAttribute('data-theme', this.darkMode ? 'dark' : 'light');
            this.updateCharts();
        });
    }

    initCharts() {
        const pieCtx = document.getElementById('categoryPieChart').getContext('2d');
        const barCtx = document.getElementById('dailyBarChart').getContext('2d');

        this.charts.pie = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#3b82f6', '#ef4444', '#22c55e', '#f59e0b',
                        '#6366f1', '#ec4899', '#8b5cf6', '#14b8a6'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.darkMode ? '#f3f4f6' : '#1f2937'
                        }
                    }
                }
            }
        });

        this.charts.bar = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Hours Spent',
                    data: Array(7).fill(0),
                    backgroundColor: '#3b82f6'
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: this.darkMode ? '#f3f4f6' : '#1f2937'
                        }
                    },
                    x: {
                        ticks: {
                            color: this.darkMode ? '#f3f4f6' : '#1f2937'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: this.darkMode ? '#f3f4f6' : '#1f2937'
                        }
                    }
                }
            }
        });
    }

    updateCharts() {
        const categoryData = {};
        const dailyData = Array(7).fill(0);
        const now = new Date();

        this.tasks.forEach(task => {
            // Update category data
            const category = task.category || 'Uncategorized';
            categoryData[category] = (categoryData[category] || 0) + task.totalTimeSpent;

            // Update daily data (last 7 days)
            if (task.lastStartTime) {
                const taskDate = new Date(task.lastStartTime);
                const dayDiff = Math.floor((now - taskDate) / (1000 * 60 * 60 * 24));
                if (dayDiff < 7) {
                    dailyData[6 - dayDiff] += task.totalTimeSpent / 3600000; // Convert to hours
                }
            }
        });

        // Update pie chart
        this.charts.pie.data.labels = Object.keys(categoryData);
        this.charts.pie.data.datasets[0].data = Object.values(categoryData);
        this.charts.pie.options.plugins.legend.labels.color = this.darkMode ? '#f3f4f6' : '#1f2937';
        this.charts.pie.update();

        // Update bar chart
        this.charts.bar.data.datasets[0].data = dailyData;
        this.charts.bar.options.scales.y.ticks.color = this.darkMode ? '#f3f4f6' : '#1f2937';
        this.charts.bar.options.scales.x.ticks.color = this.darkMode ? '#f3f4f6' : '#1f2937';
        this.charts.bar.options.plugins.legend.labels.color = this.darkMode ? '#f3f4f6' : '#1f2937';
        this.charts.bar.update();
    }

    initAuth() {
        const googleLoginBtn = document.querySelector('.google-login');
        const xLoginBtn = document.querySelector('.x-login');
        const logoutBtn = document.getElementById('logoutBtn');

        googleLoginBtn.addEventListener('click', () => this.handleGoogleLogin());
        xLoginBtn.addEventListener('click', () => this.handleXLogin());
        logoutBtn.addEventListener('click', () => this.handleLogout());

        // Check if user is already logged in
        const user = localStorage.getItem('user');
        if (user) {
            this.updateUserProfile(JSON.parse(user));
        }
    }

    handleGoogleLogin() {
        // Implement Google OAuth login
        console.log('Google login clicked');
    }

    handleXLogin() {
        // Implement X (Twitter) OAuth login
        console.log('X login clicked');
    }

    handleLogout() {
        localStorage.removeItem('user');
        document.getElementById('loginButtons').style.display = 'flex';
        document.getElementById('userProfile').style.display = 'none';
    }

    updateUserProfile(user) {
        document.getElementById('loginButtons').style.display = 'none';
        document.getElementById('userProfile').style.display = 'flex';
        document.getElementById('userAvatar').src = user.avatar;
        document.getElementById('userName').textContent = user.name;
    }

    initAdContainer() {
        const adContainer = document.getElementById('adContainer');
        const closeAdBtn = document.getElementById('closeAd');
        
        if (closeAdBtn) {
            closeAdBtn.addEventListener('click', () => {
                adContainer.style.display = 'none';
                // Add padding to main content
                document.querySelector('.main-content').style.paddingBottom = '2rem';
            });
        }

        // Optional: Show ad after delay
        setTimeout(() => {
            if (adContainer) {
                adContainer.style.display = 'block';
            }
        }, 2000);
    }

    handleFormSubmit(e) {
        e.preventDefault();
        const name = document.getElementById('taskName').value;
        const description = document.getElementById('taskDescription').value;
        const category = document.getElementById('taskCategory').value;

        if (!name.trim() && !category) {
            alert('Please enter either a task name or select a category');
            return;
        }

        const task = {
            id: Date.now(),
            name: name.trim() || category,
            description,
            category,
            totalTimeSpent: 0,
            currentSessionTime: 0,
            isRunning: false,
            lastStartTime: null
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTask(task);
        this.renderRunningTasks();
        this.updateStats();
        this.updateCharts();
        this.taskForm.reset();
    }

    renderTask(task) {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.id = `task-${task.id}`;

        taskElement.innerHTML = `
            <div class="task-header">
                <h3 class="task-title">${task.name}</h3>
                <div class="task-timer">
                    <span class="session-time">${this.formatTime(task.currentSessionTime)}</span>
                    <small class="total-time">Total: ${this.formatTime(task.totalTimeSpent)}</small>
                </div>
            </div>
            <p class="task-description">${task.description}</p>
            <div class="timer-controls">
                <button class="start-btn" onclick="taskTimer.toggleTimer(${task.id})">
                    <i class="fas ${task.isRunning ? 'fa-pause' : 'fa-play'}"></i>
                    ${task.isRunning ? 'Pause' : 'Start'}
                </button>
                <button class="stop-btn" onclick="taskTimer.resetTimer(${task.id})">
                    <i class="fas fa-stop"></i> Reset
                </button>
                <button class="delete-btn" onclick="taskTimer.deleteTask(${task.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

        this.taskList.appendChild(taskElement);

        if (task.isRunning) {
            this.startTimer(task.id);
        }
    }

    renderRunningTasks() {
        const runningTasks = this.tasks.filter(t => t.isRunning);
        
        if (runningTasks.length === 0) {
            this.runningTasksList.innerHTML = `
                <div class="no-running-tasks">
                    <i class="fas fa-coffee"></i>
                    <span>No active tasks</span>
                </div>
            `;
            return;
        }

        this.runningTasksList.innerHTML = runningTasks.map(task => `
            <div class="running-task-item" id="running-${task.id}">
                <div class="running-task-header">
                    <span class="running-task-name">${task.name}</span>
                    ${task.category ? `<span class="running-task-category">${task.category}</span>` : ''}
                </div>
                <div class="running-task-time" data-task-id="${task.id}">
                    ${this.formatTime(Math.floor(task.currentSessionTime / 1000))}
                </div>
                <div class="running-task-controls">
                    <button onclick="taskTimer.toggleTimer(${task.id})" title="Pause">
                        <i class="fas fa-pause"></i>
                    </button>
                    <button onclick="taskTimer.resetTimer(${task.id})" title="Reset">
                        <i class="fas fa-stop"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    toggleTimer(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        const now = Date.now();
        if (task.isRunning) {
            const timeSpent = now - task.lastStartTime;
            task.totalTimeSpent += timeSpent;
            task.currentSessionTime += timeSpent;
        }

        task.isRunning = !task.isRunning;
        task.lastStartTime = task.isRunning ? now : null;
        
        this.saveTasks();
        this.updateTaskDisplay(task);
        this.renderRunningTasks();
        this.updateStats();

        if (task.isRunning) {
            this.startTimer(taskId);
        }
    }

    startTimer(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task || !task.isRunning) return;

        const timerElement = document.querySelector(`#task-${taskId} .task-timer`);
        const sessionTimeElement = timerElement.querySelector('.session-time');
        const totalTimeElement = timerElement.querySelector('.total-time');
        const runningTimerElement = document.querySelector(`#running-${taskId} .running-task-time`);
        
        const updateTimer = () => {
            if (!task.isRunning) return;
            
            const now = Date.now();
            const timeSpent = now - task.lastStartTime;
            const currentSession = task.currentSessionTime + timeSpent;
            const totalTime = task.totalTimeSpent + timeSpent;
            
            sessionTimeElement.textContent = this.formatTime(Math.floor(currentSession / 1000));
            totalTimeElement.textContent = `Total: ${this.formatTime(Math.floor(totalTime / 1000))}`;
            
            if (runningTimerElement) {
                runningTimerElement.textContent = this.formatTime(Math.floor(currentSession / 1000));
            }
            
            if (task.isRunning) {
                requestAnimationFrame(updateTimer);
            }
        };

        requestAnimationFrame(updateTimer);
    }

    resetTimer(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;

        task.currentSessionTime = 0;
        task.isRunning = false;
        task.lastStartTime = null;
        this.saveTasks();
        this.updateTaskDisplay(task);
        this.renderRunningTasks();
        this.updateStats();
    }

    deleteTask(taskId) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return;

        this.tasks.splice(taskIndex, 1);
        this.saveTasks();
        this.renderRunningTasks();
        this.updateStats();

        const taskElement = document.getElementById(`task-${taskId}`);
        taskElement.remove();
    }

    updateTaskDisplay(task) {
        const taskElement = document.getElementById(`task-${task.id}`);
        if (!taskElement) return;

        const timerElement = taskElement.querySelector('.task-timer');
        const startBtn = taskElement.querySelector('.start-btn');
        
        timerElement.querySelector('.session-time').textContent = this.formatTime(Math.floor(task.currentSessionTime / 1000));
        timerElement.querySelector('.total-time').textContent = `Total: ${this.formatTime(Math.floor(task.totalTimeSpent / 1000))}`;
        
        startBtn.innerHTML = task.isRunning ? 
            '<i class="fas fa-pause"></i> Pause' : 
            '<i class="fas fa-play"></i> Start';
    }

    updateStats() {
        const activeTasks = this.tasks.filter(t => t.isRunning).length;
        const totalTime = this.tasks.reduce((sum, task) => {
            const activeTime = task.isRunning ? Date.now() - task.lastStartTime : 0;
            return sum + task.totalTimeSpent + activeTime;
        }, 0);

        this.statsElements.totalTasks.textContent = this.tasks.length;
        this.statsElements.activeTasks.textContent = activeTasks;
        this.statsElements.totalTime.textContent = this.formatTime(Math.floor(totalTime / 1000));
        this.updateCharts();
    }

    startStatsUpdate() {
        const updateStats = () => {
            this.updateStats();
            requestAnimationFrame(updateStats);
        };
        requestAnimationFrame(updateStats);
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    saveTasks() {
        if (!this.storagePreferences.taskStorage) return;

        this.showStorageStatus('Saving tasks...');
        try {
            const tasksData = {
                tasks: this.tasks,
                statistics: this.statistics
            };
            localStorage.setItem('tasks', JSON.stringify(tasksData));
            
            if (this.storagePreferences.fileStorage) {
                this.exportTasksToFile(tasksData);
            }
            
            this.showStorageStatus('Tasks saved successfully', 'success');
        } catch (error) {
            console.error('Error saving tasks:', error);
            this.showStorageStatus('Error saving tasks', 'error');
        }
    }

    loadTasks() {
        if (!this.storagePreferences.taskStorage) return;

        this.showStorageStatus('Loading tasks...');
        try {
            const tasksData = localStorage.getItem('tasks');
            if (tasksData) {
                const { tasks, statistics } = JSON.parse(tasksData);
                this.tasks = tasks;
                this.statistics = statistics;
                this.renderTasks();
                this.renderRunningTasks();
                this.updateCharts();
                this.showStorageStatus('Tasks loaded successfully', 'success');
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showStorageStatus('Error loading tasks', 'error');
        }
    }

    exportTasksToFile(tasksData) {
        if (!this.storagePreferences.fileStorage) return;

        const blob = new Blob([JSON.stringify(tasksData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'task-timer-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importTasksFromFile(file) {
        if (!this.storagePreferences.fileStorage) {
            this.showStorageStatus('File storage is not enabled', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const tasksData = JSON.parse(event.target.result);
                this.tasks = tasksData.tasks;
                this.statistics = tasksData.statistics;
                this.saveTasks();
                this.renderTasks();
                this.renderRunningTasks();
                this.updateCharts();
                this.showStorageStatus('Tasks imported successfully', 'success');
            } catch (error) {
                console.error('Error importing tasks:', error);
                this.showStorageStatus('Error importing tasks', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Initialize storage and cookie consent
    initializeStorage() {
        // Check if cookie consent was previously given
        const consentStatus = localStorage.getItem('cookieConsent');
        
        if (!consentStatus) {
            // Show cookie consent banner immediately
            setTimeout(() => this.showCookieConsent(), 1000);
        } else {
            try {
                this.storagePreferences = JSON.parse(consentStatus);
                if (this.storagePreferences.taskStorage) {
                    this.loadTasks();
                }
            } catch (e) {
                console.error('Error parsing storage preferences:', e);
                this.showCookieConsent();
            }
        }

        // Add event listeners for cookie consent
        document.querySelector('.cookie-btn.accept').addEventListener('click', () => this.handleCookieConsent('all'));
        document.querySelector('.cookie-btn.essential').addEventListener('click', () => this.handleCookieConsent('essential'));
        document.querySelector('.cookie-btn.settings').addEventListener('click', () => this.showCookieSettings());
        document.querySelector('.close-modal').addEventListener('click', () => this.hideCookieSettings());
        document.querySelector('.modal-footer .cookie-btn.accept').addEventListener('click', () => this.saveStoragePreferences());

        // Add event listeners for storage toggles
        const toggles = document.querySelectorAll('.cookie-option input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                if (toggle.id === 'essential') return; // Essential cookies can't be disabled
                this.storagePreferences[toggle.id] = toggle.checked;
            });
        });
    }

    // Show cookie consent banner
    showCookieConsent() {
        this.cookieConsent.classList.add('active');
    }

    // Hide cookie consent banner
    hideCookieConsent() {
        this.cookieConsent.classList.remove('active');
    }

    // Show cookie settings modal
    showCookieSettings() {
        this.cookieModal.classList.add('active');
        // Set toggle states based on current preferences
        Object.entries(this.storagePreferences).forEach(([key, value]) => {
            const toggle = document.getElementById(key);
            if (toggle) toggle.checked = value;
        });
    }

    // Hide cookie settings modal
    hideCookieSettings() {
        this.cookieModal.classList.remove('active');
    }

    // Handle cookie consent choice
    handleCookieConsent(choice) {
        if (choice === 'all') {
            this.storagePreferences = {
                essential: true,
                taskStorage: true,
                fileStorage: true
            };
        } else {
            this.storagePreferences = {
                essential: true,
                taskStorage: false,
                fileStorage: false
            };
        }

        this.saveStoragePreferences();
        this.hideCookieConsent();
        
        if (this.storagePreferences.taskStorage) {
            this.loadTasks();
        }
    }

    // Save storage preferences
    saveStoragePreferences() {
        localStorage.setItem('cookieConsent', JSON.stringify(this.storagePreferences));
        this.hideCookieSettings();
        this.showStorageStatus('Preferences saved', 'success');
        
        if (this.storagePreferences.taskStorage) {
            this.saveTasks();
        } else {
            localStorage.removeItem('tasks');
            localStorage.removeItem('statistics');
        }
    }

    // Show storage status message
    showStorageStatus(message, type = '') {
        this.storageStatus.textContent = message;
        this.storageStatus.classList.add('active');
        if (type) {
            this.storageStatus.classList.add(type);
        }
        setTimeout(() => {
            this.storageStatus.classList.remove('active');
            if (type) {
                this.storageStatus.classList.remove(type);
            }
        }, 3000);
    }
}

const taskTimer = new TaskTimer();

document.addEventListener('DOMContentLoaded', () => {
    console.log('Task Timer application initialized');
}); 