// Enhanced Workday Calculator with Advanced Features

class WorkdayCalculator {
    constructor() {
        this.settings = this.loadSettings();
        this.notifications = [];
        this.reminders = new Map();
        this.isNotificationsEnabled = false;
        this.theme = localStorage.getItem('theme') || 'dark';
        
        this.init();
    }

    // Initialization
    init() {
        this.initTheme();
        this.setupEventListeners();
        this.setupAutoCalculation();
        this.setupNotifications();
        this.loadInitialData();
        this.startRealTimeUpdates();
        this.renderAnalytics();
        this.renderSettings();
        this.handleResponsiveFeatures();
    }

    initTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
    }

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Notification toggle
        document.getElementById('notificationToggle').addEventListener('click', () => {
            this.toggleNotifications();
        });

        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.closest('.tab-btn').dataset.tab);
            });
        });

        // Quick actions
        document.getElementById('useCurrentTime').addEventListener('click', () => {
            this.setCurrentTime();
        });

        document.getElementById('quickReset').addEventListener('click', () => {
            this.resetCalculator();
        });

        // Main actions
        document.getElementById('calculate').addEventListener('click', () => {
            this.calculateResults();
        });

        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });

        // Reminder buttons
        document.getElementById('setReminderA').addEventListener('click', () => {
            this.setReminder('A');
        });

        document.getElementById('setReminderB').addEventListener('click', () => {
            this.setReminder('B');
        });

        // Settings
        document.getElementById('clearHistory').addEventListener('click', () => {
            this.clearHistory();
        });

        document.getElementById('resetSettings').addEventListener('click', () => {
            this.resetAllSettings();
        });

        document.getElementById('backupData').addEventListener('click', () => {
            this.backupData();
        });

        // Handle window resize for responsive features
        window.addEventListener('resize', () => {
            this.handleResponsiveFeatures();
        });

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResponsiveFeatures();
            }, 100);
        });
    }

    handleResponsiveFeatures() {
        const isMobile = window.innerWidth <= 767;
        const isTablet = window.innerWidth >= 768 && window.innerWidth <= 991;
        const isDesktop = window.innerWidth >= 992;

        // Adjust notification container for mobile
        const notificationContainer = document.getElementById('notificationContainer');
        if (isMobile) {
            notificationContainer.style.left = '0.5rem';
            notificationContainer.style.right = '0.5rem';
            notificationContainer.style.maxWidth = 'none';
        } else {
            notificationContainer.style.left = 'auto';
            notificationContainer.style.right = '1rem';
            notificationContainer.style.maxWidth = '350px';
        }

        // Handle tab scrolling on mobile
        const tabNavigation = document.querySelector('.tab-navigation');
        if (isMobile && tabNavigation.scrollWidth > tabNavigation.clientWidth) {
            tabNavigation.style.justifyContent = 'flex-start';
        } else {
            tabNavigation.style.justifyContent = 'center';
        }

        // Adjust chart height for mobile
        const weekChart = document.getElementById('weekChart');
        if (weekChart) {
            weekChart.style.height = isMobile ? '150px' : '200px';
        }
    }

    setupAutoCalculation() {
        const inputs = document.querySelectorAll('input[type="time"], input[type="number"]');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.saveSettings();
                if (document.getElementById('inTime').value) {
                    this.calculateResults();
                }
            });
        });
    }

    async setupNotifications() {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            this.isNotificationsEnabled = permission === 'granted';
        }
    }

    loadInitialData() {
        this.loadSettings();
        if (document.getElementById('inTime').value) {
            this.calculateResults();
        }
    }

    startRealTimeUpdates() {
        // Update current time every second
        setInterval(() => {
            this.updateCurrentTime();
            this.updateProgress();
            this.checkReminders();
        }, 1000);

        // Recalculate every minute
        setInterval(() => {
            if (document.getElementById('inTime').value) {
                this.calculateResults();
            }
        }, 60000);
    }

    // Theme management
    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.theme);
        localStorage.setItem('theme', this.theme);
        this.showNotification('Theme changed to ' + this.theme + ' mode', 'success');
    }

    toggleNotifications() {
        if (!this.isNotificationsEnabled) {
            this.setupNotifications();
        } else {
            this.isNotificationsEnabled = false;
            this.showNotification('Notifications disabled', 'warning');
        }
    }

    // Tab management
    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Refresh content based on tab
        if (tabName === 'analytics') {
            this.renderAnalytics();
        }

        // Handle responsive adjustments after tab switch
        setTimeout(() => {
            this.handleResponsiveFeatures();
        }, 100);
    }

    // Time utilities
    toMinutes(hours, minutes) {
        return (Number(hours) || 0) * 60 + (Number(minutes) || 0);
    }

    format24Hour(totalMinutes) {
        const mm = ((totalMinutes % 1440) + 1440) % 1440;
        const h = Math.floor(mm / 60);
        const m = mm % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    format12Hour(totalMinutes) {
        const mm = ((totalMinutes % 1440) + 1440) % 1440;
        let h = Math.floor(mm / 60);
        const m = mm % 60;
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12;
        if (h === 0) h = 12;
        return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
    }

    parseTimeToMinutes(timeStr) {
        if (!timeStr) return null;
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    }

    formatDuration(mins) {
        mins = Math.round(mins);
        const h = Math.floor(Math.abs(mins) / 60);
        const m = Math.abs(mins) % 60;
        const sign = mins < 0 ? '-' : '';
        return `${sign}${h}h ${m}m`;
    }

    getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    getCurrentTimeInMinutes() {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    }

    // Storage management
    saveSettings() {
        try {
            const settings = {
                inTime: document.getElementById('inTime').value,
                workH: document.getElementById('workH').value,
                workM: document.getElementById('workM').value,
                stdBreakH: document.getElementById('stdBreakH').value,
                stdBreakM: document.getElementById('stdBreakM').value,
                actBreakH: document.getElementById('actBreakH').value,
                actBreakM: document.getElementById('actBreakM').value,
                presenceH: document.getElementById('presenceH').value,
                presenceM: document.getElementById('presenceM').value,
            };
            localStorage.setItem('workday-calculator-settings', JSON.stringify(settings));
        } catch (error) {
            console.warn('Failed to save settings:', error);
        }
    }

    loadSettings() {
        try {
            const data = localStorage.getItem('workday-calculator-settings');
            if (!data) return {};
            
            const settings = JSON.parse(data);
            document.getElementById('inTime').value = settings.inTime || '';
            document.getElementById('workH').value = settings.workH || '8';
            document.getElementById('workM').value = settings.workM || '15';
            document.getElementById('stdBreakH').value = settings.stdBreakH || '0';
            document.getElementById('stdBreakM').value = settings.stdBreakM || '45';
            document.getElementById('actBreakH').value = settings.actBreakH || '0';
            document.getElementById('actBreakM').value = settings.actBreakM || '30';
            document.getElementById('presenceH').value = settings.presenceH || '9';
            document.getElementById('presenceM').value = settings.presenceM || '0';
            
            return settings;
        } catch (error) {
            console.warn('Failed to load settings:', error);
            return {};
        }
    }

    // Real-time updates
    updateCurrentTime() {
        const now = new Date();
        const showSeconds = document.getElementById('showSeconds')?.checked;
        const timeString = now.toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit',
            second: showSeconds ? '2-digit' : undefined 
        });
        document.getElementById('currentTime').textContent = timeString;
    }

    updateProgress() {
        const inTimeMinutes = this.parseTimeToMinutes(document.getElementById('inTime').value);
        if (!inTimeMinutes) return;

        const currentTimeMinutes = this.getCurrentTimeInMinutes();
        const workingMinutes = this.toMinutes(
            document.getElementById('workH').value,
            document.getElementById('workM').value
        );
        
        const elapsedMinutes = currentTimeMinutes - inTimeMinutes;
        const progress = Math.min(Math.max((elapsedMinutes / workingMinutes) * 100, 0), 100);
        
        document.querySelector('.progress-fill').style.width = `${progress}%`;
        document.getElementById('progressText').textContent = `${Math.round(progress)}%`;

        // Update work status
        let status = 'Not Started';
        if (elapsedMinutes > 0) {
            if (progress >= 100) {
                status = 'Completed';
            } else if (progress >= 75) {
                status = 'Almost Done';
            } else if (progress >= 50) {
                status = 'In Progress';
            } else {
                status = 'Started';
            }
        }
        document.getElementById('workStatus').textContent = status;
    }

    // Calculation engine
    calculateResults() {
        const inTimeMinutes = this.parseTimeToMinutes(document.getElementById('inTime').value);
        if (inTimeMinutes === null) {
            this.showNotification('Please set your clock-in time first', 'warning');
            return;
        }

        const workingMinutes = this.toMinutes(
            document.getElementById('workH').value,
            document.getElementById('workM').value
        );
        const actualBreakMinutes = this.toMinutes(
            document.getElementById('actBreakH').value,
            document.getElementById('actBreakM').value
        );
        const presenceMinutes = this.toMinutes(
            document.getElementById('presenceH').value,
            document.getElementById('presenceM').value
        );

        const ruleAEndTime = inTimeMinutes + workingMinutes + actualBreakMinutes;
        const ruleBEndTime = inTimeMinutes + presenceMinutes;
        const currentTimeMinutes = this.getCurrentTimeInMinutes();

        // Calculate attended time
        const attendedMinutes = Math.max(0, currentTimeMinutes - inTimeMinutes);
        
        // Update results
        this.updateRuleResults('A', ruleAEndTime, currentTimeMinutes, workingMinutes, actualBreakMinutes);
        this.updateRuleResults('B', ruleBEndTime, currentTimeMinutes, presenceMinutes, 0);

        // Update summary
        this.updateSummary(attendedMinutes, actualBreakMinutes, workingMinutes, Math.min(ruleAEndTime, ruleBEndTime));

        // Save to log
        this.saveToLog(ruleAEndTime, ruleBEndTime, attendedMinutes);
        
        this.saveSettings();
    }

    updateRuleResults(rule, endTime, currentTime, workTime, breakTime) {
        const remaining = endTime - currentTime;
        const isOptimal = rule === 'A' ? 
            endTime <= this.parseTimeToMinutes(document.getElementById('inTime').value) + this.toMinutes(document.getElementById('presenceH').value, document.getElementById('presenceM').value) :
            endTime <= this.parseTimeToMinutes(document.getElementById('inTime').value) + this.toMinutes(document.getElementById('workH').value, document.getElementById('workM').value) + this.toMinutes(document.getElementById('actBreakH').value, document.getElementById('actBreakM').value);

        // Update time display
        const show24Hour = document.getElementById('show24Hour')?.checked ?? true;
        const timeDisplay = show24Hour ? this.format24Hour(endTime) : this.format12Hour(endTime);
        const timeElement = document.getElementById(`rule${rule}Time`);
        timeElement.innerHTML = show24Hour ? 
            timeDisplay : 
            `${timeDisplay} <span class="time-24">(${this.format24Hour(endTime)})</span>`;

        // Update countdown
        const countdownElement = document.getElementById(`countdown${rule}`);
        if (remaining > 0) {
            countdownElement.querySelector('.countdown-time').textContent = this.formatDuration(remaining);
            countdownElement.querySelector('.countdown-label').textContent = 'remaining';
        } else {
            countdownElement.querySelector('.countdown-time').textContent = this.formatDuration(-remaining);
            countdownElement.querySelector('.countdown-label').textContent = 'overtime';
        }

        // Update meta information
        const inTime = this.format24Hour(this.parseTimeToMinutes(document.getElementById('inTime').value));
        let metaHTML = `<div class="calculation">In: ${inTime}`;
        if (rule === 'A') {
            metaHTML += ` + Work: ${this.formatDuration(workTime)} + Break: ${this.formatDuration(breakTime)}`;
        } else {
            metaHTML += ` + Presence: ${this.formatDuration(workTime)}`;
        }
        metaHTML += ` = ${this.format24Hour(endTime)}</div>`;

        if (remaining >= 0) {
            metaHTML += `<div class="remaining" style="color: var(--success-color);">Time remaining: ${this.formatDuration(remaining)}</div>`;
        } else {
            metaHTML += `<div class="remaining" style="color: var(--danger-color);">Overtime: ${this.formatDuration(-remaining)}</div>`;
        }

        document.getElementById(`rule${rule}Meta`).innerHTML = metaHTML;

        // Update badge
        const badge = document.querySelector(`#rule${rule} .rule-badge`);
        badge.classList.toggle('optimal', remaining <= Math.abs(remaining) && remaining >= -30); // Within 30 minutes is considered optimal
    }

    updateSummary(attendedMinutes, breakMinutes, workMinutes, recommendedExit) {
        document.getElementById('timeWorked').textContent = this.formatDuration(Math.max(0, attendedMinutes - breakMinutes));
        document.getElementById('breakTime').textContent = this.formatDuration(breakMinutes);
        
        const efficiency = workMinutes > 0 ? Math.round(((attendedMinutes - breakMinutes) / workMinutes) * 100) : 0;
        document.getElementById('efficiency').textContent = `${Math.max(0, Math.min(100, efficiency))}%`;
        document.getElementById('recommendedExit').textContent = this.format24Hour(recommendedExit);
    }

    // Quick actions
    setCurrentTime() {
        document.getElementById('inTime').value = this.getCurrentTime();
        this.calculateResults();
        this.showNotification('Current time set successfully', 'success');
    }

    resetCalculator() {
        if (confirm('Are you sure you want to reset all settings?')) {
            // Reset inputs to defaults
            document.getElementById('inTime').value = '';
            document.getElementById('workH').value = '8';
            document.getElementById('workM').value = '15';
            document.getElementById('stdBreakH').value = '0';
            document.getElementById('stdBreakM').value = '45';
            document.getElementById('actBreakH').value = '0';
            document.getElementById('actBreakM').value = '30';
            document.getElementById('presenceH').value = '9';
            document.getElementById('presenceM').value = '0';

            // Reset displays
            document.getElementById('ruleATime').textContent = '--:--';
            document.getElementById('ruleBTime').textContent = '--:--';
            document.getElementById('ruleAMeta').textContent = 'Configure your times above to see results';
            document.getElementById('ruleBMeta').textContent = 'Configure your times above to see results';

            // Reset badges
            document.querySelectorAll('.rule-badge').forEach(badge => {
                badge.classList.remove('optimal');
            });

            // Clear progress
            document.querySelector('.progress-fill').style.width = '0%';
            document.getElementById('progressText').textContent = '0%';
            document.getElementById('workStatus').textContent = 'Not Started';

            this.saveSettings();
            this.showNotification('Calculator reset successfully', 'success');
        }
    }

    // Reminders and notifications
    setReminder(rule) {
        const endTime = rule === 'A' ? 
            this.calculateRuleAEndTime() : 
            this.calculateRuleBEndTime();
        
        if (!endTime) {
            this.showNotification('Please calculate exit times first', 'warning');
            return;
        }

        const reminderTime = endTime - 15; // 15 minutes before
        this.reminders.set(`rule${rule}`, reminderTime);
        
        this.showNotification(`Reminder set for Rule ${rule} (15 minutes before exit)`, 'success');
    }

    checkReminders() {
        if (!this.isNotificationsEnabled) return;

        const currentTime = this.getCurrentTimeInMinutes();
        
        this.reminders.forEach((reminderTime, key) => {
            if (Math.abs(currentTime - reminderTime) < 1) { // Within 1 minute
                const rule = key.includes('A') ? 'A' : 'B';
                this.showBrowserNotification(
                    'Work Reminder',
                    `15 minutes until Rule ${rule} exit time!`
                );
                this.reminders.delete(key); // Remove after triggering
            }
        });
    }

    calculateRuleAEndTime() {
        const inTime = this.parseTimeToMinutes(document.getElementById('inTime').value);
        if (!inTime) return null;
        
        const work = this.toMinutes(document.getElementById('workH').value, document.getElementById('workM').value);
        const break_time = this.toMinutes(document.getElementById('actBreakH').value, document.getElementById('actBreakM').value);
        return inTime + work + break_time;
    }

    calculateRuleBEndTime() {
        const inTime = this.parseTimeToMinutes(document.getElementById('inTime').value);
        if (!inTime) return null;
        
        const presence = this.toMinutes(document.getElementById('presenceH').value, document.getElementById('presenceM').value);
        return inTime + presence;
    }

    showNotification(message, type = 'info') {
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    async showBrowserNotification(title, message) {
        if (this.isNotificationsEnabled && 'Notification' in window) {
            new Notification(title, {
                body: message,
                icon: '/favicon.ico'
            });
        }
    }

    // Data management
    saveToLog(ruleATime, ruleBTime, attendedTime) {
        const today = new Date().toISOString().split('T')[0];
        let logs = JSON.parse(localStorage.getItem('workday-calculator-log') || '{}');
        
        logs[today] = {
            date: today,
            inTime: document.getElementById('inTime').value,
            workHours: `${document.getElementById('workH').value}h ${document.getElementById('workM').value}m`,
            breakTime: `${document.getElementById('actBreakH').value}h ${document.getElementById('actBreakM').value}m`,
            attendedTime: this.formatDuration(attendedTime),
            ruleAExit: this.format24Hour(ruleATime),
            ruleBExit: this.format24Hour(ruleBTime),
            efficiency: Math.round((attendedTime / this.toMinutes(document.getElementById('workH').value, document.getElementById('workM').value)) * 100)
        };
        
        localStorage.setItem('workday-calculator-log', JSON.stringify(logs));
    }

    exportData() {
        const settings = JSON.parse(localStorage.getItem('workday-calculator-settings') || '{}');
        const logs = JSON.parse(localStorage.getItem('workday-calculator-log') || '{}');
        
        const data = {
            settings,
            logs,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workday-calculator-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotification('Data exported successfully', 'success');
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear all history?')) {
            localStorage.removeItem('workday-calculator-log');
            this.renderAnalytics();
            this.showNotification('History cleared successfully', 'success');
        }
    }

    resetAllSettings() {
        if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
            localStorage.removeItem('workday-calculator-settings');
            localStorage.removeItem('workday-calculator-log');
            localStorage.removeItem('theme');
            location.reload();
        }
    }

    backupData() {
        this.exportData();
    }

    // Analytics
    renderAnalytics() {
        const logs = JSON.parse(localStorage.getItem('workday-calculator-log') || '{}');
        this.renderWeekChart(logs);
        this.renderStats(logs);
        this.renderHistory(logs);
    }

    renderWeekChart(logs) {
        const chartContainer = document.getElementById('weekChart');
        chartContainer.innerHTML = '';
        
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        
        days.forEach((day, index) => {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + index);
            const dateStr = date.toISOString().split('T')[0];
            
            const log = logs[dateStr];
            const hours = log ? parseFloat(log.attendedTime) || 0 : 0;
            const maxHours = 10; // Assuming max 10 hours for scaling
            const height = Math.max(20, (hours / maxHours) * 180);
            
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${height}px`;
            bar.title = `${day}: ${hours}h`;
            
            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = day;
            
            bar.appendChild(label);
            chartContainer.appendChild(bar);
        });
    }

    renderStats(logs) {
        const statsContainer = document.getElementById('statsList');
        statsContainer.innerHTML = '';
        
        const logEntries = Object.values(logs);
        const totalDays = logEntries.length;
        const avgHours = totalDays > 0 ? 
            logEntries.reduce((sum, log) => sum + (parseFloat(log.attendedTime) || 0), 0) / totalDays : 0;
        const avgEfficiency = totalDays > 0 ?
            logEntries.reduce((sum, log) => sum + (log.efficiency || 0), 0) / totalDays : 0;
        
        const stats = [
            { label: 'Total Days Logged', value: totalDays },
            { label: 'Average Hours/Day', value: `${avgHours.toFixed(1)}h` },
            { label: 'Average Efficiency', value: `${avgEfficiency.toFixed(0)}%` },
            { label: 'This Week', value: this.getWeekHours(logs) + 'h' }
        ];
        
        stats.forEach(stat => {
            const item = document.createElement('div');
            item.className = 'stat-item';
            item.innerHTML = `
                <span class="stat-label">${stat.label}</span>
                <span class="stat-value">${stat.value}</span>
            `;
            statsContainer.appendChild(item);
        });
    }

    getWeekHours(logs) {
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
        let weekHours = 0;
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart);
            date.setDate(weekStart.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            const log = logs[dateStr];
            if (log) {
                weekHours += parseFloat(log.attendedTime) || 0;
            }
        }
        
        return weekHours.toFixed(1);
    }

    renderHistory(logs) {
        const historyContainer = document.getElementById('historyList');
        historyContainer.innerHTML = '';
        
        const sortedEntries = Object.values(logs)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10); // Show last 10 entries
        
        sortedEntries.forEach(log => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-date">${new Date(log.date).toLocaleDateString()}</div>
                <div class="history-hours">${log.attendedTime}</div>
            `;
            historyContainer.appendChild(item);
        });
        
        if (sortedEntries.length === 0) {
            historyContainer.innerHTML = '<div class="history-item">No history available</div>';
        }
    }

    // Settings
    renderSettings() {
        // Load and set checkbox states
        const breakReminders = localStorage.getItem('breakReminders') !== 'false';
        const exitReminders = localStorage.getItem('exitReminders') !== 'false';
        const overtimeAlerts = localStorage.getItem('overtimeAlerts') === 'true';
        const show24Hour = localStorage.getItem('show24Hour') !== 'false';
        const showSeconds = localStorage.getItem('showSeconds') === 'true';
        
        document.getElementById('breakReminders').checked = breakReminders;
        document.getElementById('exitReminders').checked = exitReminders;
        document.getElementById('overtimeAlerts').checked = overtimeAlerts;
        document.getElementById('show24Hour').checked = show24Hour;
        document.getElementById('showSeconds').checked = showSeconds;
        
        // Add event listeners
        document.querySelectorAll('#settings input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                localStorage.setItem(e.target.id, e.target.checked);
                if (e.target.id === 'show24Hour' && document.getElementById('inTime').value) {
                    this.calculateResults(); // Refresh display
                }
            });
        });
    }
}

// Initialize the calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const calculator = new WorkdayCalculator();
    
    // Make it globally accessible for debugging
    window.workdayCalculator = calculator;
});