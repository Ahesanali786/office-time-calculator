// Enhanced Workday Calculator with Advanced Features

class WorkdayCalculator {
    constructor() {
        this.settings = this.loadSettings();
        this.notifications = [];
        this.reminders = new Map();
        this.isNotificationsEnabled = false;
        this.theme = localStorage.getItem('theme') || 'dark';
        
        // Break tracking
        this.breakSessions = [];
        this.currentBreakStart = null;
        this.isOnBreak = false;
        
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
        this.loadBreakSessions();
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

        // Break tracking
        document.getElementById('startBreak').addEventListener('click', () => {
            this.startBreak();
        });

        document.getElementById('endBreak').addEventListener('click', () => {
            this.endBreak();
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

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('historyModal').addEventListener('click', (e) => {
            if (e.target.id === 'historyModal') {
                this.closeModal();
            }
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
            this.updateBreakTracker();
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

    formatTime(mins) {
        const h = Math.floor(Math.abs(mins) / 60);
        const m = Math.abs(mins) % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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
            document.getElementById('presenceH').value = settings.presenceH || '9';
            document.getElementById('presenceM').value = settings.presenceM || '0';
            
            return settings;
        } catch (error) {
            console.warn('Failed to load settings:', error);
            return {};
        }
    }

    // Break tracking
    loadBreakSessions() {
        const today = new Date().toISOString().split('T')[0];
        const data = localStorage.getItem(`break-sessions-${today}`);
        this.breakSessions = data ? JSON.parse(data) : [];
        
        // Check if there's an ongoing break
        const ongoingBreak = this.breakSessions.find(session => !session.endTime);
        if (ongoingBreak) {
            this.currentBreakStart = ongoingBreak.startTime;
            this.isOnBreak = true;
            document.getElementById('startBreak').disabled = true;
            document.getElementById('endBreak').disabled = false;
        }
        
        this.updateBreakTracker();
    }

    saveBreakSessions() {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`break-sessions-${today}`, JSON.stringify(this.breakSessions));
    }

    startBreak() {
        if (this.isOnBreak) return;
        
        const now = this.getCurrentTimeInMinutes();
        this.currentBreakStart = now;
        this.isOnBreak = true;
        
        this.breakSessions.push({
            startTime: now,
            endTime: null,
            duration: 0
        });
        
        document.getElementById('startBreak').disabled = true;
        document.getElementById('endBreak').disabled = false;
        
        this.saveBreakSessions();
        this.showNotification('Break started', 'success');
    }

    endBreak() {
        if (!this.isOnBreak) return;
        
        const now = this.getCurrentTimeInMinutes();
        const duration = now - this.currentBreakStart;
        
        // Update the current break session
        const currentSession = this.breakSessions.find(session => !session.endTime);
        if (currentSession) {
            currentSession.endTime = now;
            currentSession.duration = duration;
        }
        
        this.isOnBreak = false;
        this.currentBreakStart = null;
        
        document.getElementById('startBreak').disabled = false;
        document.getElementById('endBreak').disabled = true;
        
        this.saveBreakSessions();
        this.calculateResults(); // Recalculate with new break time
        this.showNotification(`Break ended (${this.formatDuration(duration)})`, 'success');
    }

    getTotalBreakTime() {
        let total = 0;
        this.breakSessions.forEach(session => {
            if (session.endTime) {
                total += session.duration;
            } else if (this.isOnBreak) {
                // Add current ongoing break time
                total += this.getCurrentTimeInMinutes() - session.startTime;
            }
        });
        return total;
    }

    updateBreakTracker() {
        const totalBreakTime = this.getTotalBreakTime();
        const currentBreakTime = this.isOnBreak ? 
            this.getCurrentTimeInMinutes() - this.currentBreakStart : 0;
        
        document.getElementById('currentBreakTime').textContent = this.formatTime(currentBreakTime);
        document.getElementById('totalBreakTime').textContent = this.formatTime(totalBreakTime);
        document.getElementById('breakCount').textContent = this.breakSessions.length;
        
        // Update break status
        document.getElementById('breakStatus').textContent = this.isOnBreak ? 'On Break' : 'Not on Break';
    }

    // Real-time updates
    updateCurrentTime() {
        const now = new Date();
        const show12Hour = document.getElementById('show12Hour')?.checked ?? true;
        const showSeconds = document.getElementById('showSeconds')?.checked ?? false;
        
        let timeString;
        if (show12Hour) {
            timeString = now.toLocaleTimeString('en-US', { 
                hour12: true, 
                hour: 'numeric', 
                minute: '2-digit',
                second: showSeconds ? '2-digit' : undefined 
            });
        } else {
            timeString = now.toLocaleTimeString('en-US', { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit',
                second: showSeconds ? '2-digit' : undefined 
            });
        }
        
        document.getElementById('currentTime').textContent = timeString;
        document.getElementById('currentTimeFormat').textContent = show12Hour ? '12H' : '24H';
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
        const presenceMinutes = this.toMinutes(
            document.getElementById('presenceH').value,
            document.getElementById('presenceM').value
        );

        // Get actual break time from tracker
        const actualBreakMinutes = this.getTotalBreakTime();

        const ruleAEndTime = inTimeMinutes + workingMinutes + actualBreakMinutes;
        const ruleBEndTime = inTimeMinutes + presenceMinutes;
        const currentTimeMinutes = this.getCurrentTimeInMinutes();

        // Calculate attended time
        const attendedMinutes = Math.max(0, currentTimeMinutes - inTimeMinutes);
        
        // Update results
        this.updateRuleResults('A', ruleAEndTime, currentTimeMinutes, workingMinutes, actualBreakMinutes);
        this.updateRuleResults('B', ruleBEndTime, currentTimeMinutes, presenceMinutes, 0);

        // Calculate real exit time (considering break deduction)
        this.updateRealExitTime(inTimeMinutes, workingMinutes, actualBreakMinutes);

        // Update summary
        this.updateSummary(attendedMinutes, actualBreakMinutes, workingMinutes, Math.min(ruleAEndTime, ruleBEndTime));

        // Save to log
        this.saveToLog(ruleAEndTime, ruleBEndTime, attendedMinutes, actualBreakMinutes);
        
        this.saveSettings();
    }

    updateRuleResults(rule, endTime, currentTime, workTime, breakTime) {
        const remaining = endTime - currentTime;
        const isOptimal = remaining <= 30 && remaining >= -30; // Within 30 minutes is optimal

        // Update time display
        const show12Hour = document.getElementById('show12Hour')?.checked ?? true;
        const timeDisplay = show12Hour ? this.format12Hour(endTime) : this.format24Hour(endTime);
        const timeElement = document.getElementById(`rule${rule}Time`);
        
        if (show12Hour) {
            timeElement.innerHTML = `${timeDisplay} <span class="time-24">(${this.format24Hour(endTime)})</span>`;
        } else {
            timeElement.textContent = timeDisplay;
        }

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
        badge.classList.toggle('optimal', isOptimal);
    }

    updateRealExitTime(inTime, workTime, actualBreakTime) {
        const realExitTime = inTime + workTime + actualBreakTime;
        const currentTime = this.getCurrentTimeInMinutes();
        const remaining = realExitTime - currentTime;
        
        const show12Hour = document.getElementById('show12Hour')?.checked ?? true;
        const timeDisplay = show12Hour ? this.format12Hour(realExitTime) : this.format24Hour(realExitTime);
        
        document.getElementById('realExitTime').textContent = timeDisplay;
        
        let metaText = `Based on ${this.formatDuration(workTime)} work + ${this.formatDuration(actualBreakTime)} actual breaks`;
        if (remaining > 0) {
            metaText += ` • ${this.formatDuration(remaining)} remaining`;
        } else if (remaining < 0) {
            metaText += ` • ${this.formatDuration(-remaining)} overtime`;
        } else {
            metaText += ` • Time to leave!`;
        }
        
        document.getElementById('realExitMeta').textContent = metaText;
    }

    updateSummary(attendedMinutes, breakMinutes, workMinutes, recommendedExit) {
        const actualWorkTime = Math.max(0, attendedMinutes - breakMinutes);
        document.getElementById('timeWorked').textContent = this.formatDuration(actualWorkTime);
        document.getElementById('breakTime').textContent = this.formatDuration(breakMinutes);
        
        const efficiency = workMinutes > 0 ? Math.round((actualWorkTime / workMinutes) * 100) : 0;
        document.getElementById('efficiency').textContent = `${Math.max(0, Math.min(100, efficiency))}%`;
        
        const show12Hour = document.getElementById('show12Hour')?.checked ?? true;
        const exitDisplay = show12Hour ? this.format12Hour(recommendedExit) : this.format24Hour(recommendedExit);
        document.getElementById('recommendedExit').textContent = exitDisplay;
    }

    // Quick actions
    setCurrentTime() {
        document.getElementById('inTime').value = this.getCurrentTime();
        this.calculateResults();
        this.showNotification('Current time set successfully', 'success');
    }

    resetCalculator() {
        if (confirm('Are you sure you want to reset all settings and break data?')) {
            // Reset inputs to defaults
            document.getElementById('inTime').value = '';
            document.getElementById('workH').value = '8';
            document.getElementById('workM').value = '15';
            document.getElementById('stdBreakH').value = '0';
            document.getElementById('stdBreakM').value = '45';
            document.getElementById('presenceH').value = '9';
            document.getElementById('presenceM').value = '0';

            // Reset break tracking
            this.breakSessions = [];
            this.currentBreakStart = null;
            this.isOnBreak = false;
            document.getElementById('startBreak').disabled = false;
            document.getElementById('endBreak').disabled = true;
            this.saveBreakSessions();

            // Reset displays
            document.getElementById('ruleATime').textContent = '--:--';
            document.getElementById('ruleBTime').textContent = '--:--';
            document.getElementById('ruleAMeta').textContent = 'Configure your times above to see results';
            document.getElementById('ruleBMeta').textContent = 'Configure your times above to see results';
            document.getElementById('realExitTime').textContent = '--:--';
            document.getElementById('realExitMeta').textContent = 'Start tracking breaks to see real exit time';

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
        const breakTime = this.getTotalBreakTime();
        return inTime + work + breakTime;
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
    saveToLog(ruleATime, ruleBTime, attendedTime, actualBreakTime) {
        const today = new Date().toISOString().split('T')[0];
        let logs = JSON.parse(localStorage.getItem('workday-calculator-log') || '{}');
        
        logs[today] = {
            date: today,
            inTime: document.getElementById('inTime').value,
            workHours: `${document.getElementById('workH').value}h ${document.getElementById('workM').value}m`,
            breakTime: this.formatDuration(actualBreakTime),
            attendedTime: this.formatDuration(attendedTime),
            ruleAExit: this.format24Hour(ruleATime),
            ruleBExit: this.format24Hour(ruleBTime),
            realExitTime: this.format24Hour(this.parseTimeToMinutes(document.getElementById('inTime').value) + this.toMinutes(document.getElementById('workH').value, document.getElementById('workM').value) + actualBreakTime),
            efficiency: Math.round(((attendedTime - actualBreakTime) / this.toMinutes(document.getElementById('workH').value, document.getElementById('workM').value)) * 100),
            breakSessions: [...this.breakSessions]
        };
        
        localStorage.setItem('workday-calculator-log', JSON.stringify(logs));
    }

    exportData() {
        const settings = JSON.parse(localStorage.getItem('workday-calculator-settings') || '{}');
        const logs = JSON.parse(localStorage.getItem('workday-calculator-log') || '{}');
        
        // Include break sessions for today
        const today = new Date().toISOString().split('T')[0];
        const todayBreaks = localStorage.getItem(`break-sessions-${today}`);
        
        const data = {
            settings,
            logs,
            todayBreaks: todayBreaks ? JSON.parse(todayBreaks) : [],
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
            // Clear all break sessions
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('break-sessions-')) {
                    localStorage.removeItem(key);
                }
            });
            this.renderAnalytics();
            this.showNotification('History cleared successfully', 'success');
        }
    }

    resetAllSettings() {
        if (confirm('Are you sure you want to reset all settings? This cannot be undone.')) {
            localStorage.removeItem('workday-calculator-settings');
            localStorage.removeItem('workday-calculator-log');
            localStorage.removeItem('theme');
            // Clear all break sessions
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith('break-sessions-')) {
                    localStorage.removeItem(key);
                }
            });
            location.reload();
        }
    }

    backupData() {
        this.exportData();
    }

    // Modal management
    openHistoryModal(date, logData) {
        const modal = document.getElementById('historyModal');
        const title = document.getElementById('modalTitle');
        const content = document.getElementById('modalContent');
        
        title.textContent = `Details for ${new Date(date).toLocaleDateString()}`;
        
        const show12Hour = document.getElementById('show12Hour')?.checked ?? true;
        
        let modalHTML = `
            <div class="modal-detail-grid">
                <div class="modal-detail-item">
                    <span class="modal-detail-label">Clock In Time</span>
                    <span class="modal-detail-value">${logData.inTime || 'Not set'}</span>
                </div>
                <div class="modal-detail-item">
                    <span class="modal-detail-label">Work Hours Required</span>
                    <span class="modal-detail-value">${logData.workHours || 'Not set'}</span>
                </div>
                <div class="modal-detail-item">
                    <span class="modal-detail-label">Time Attended</span>
                    <span class="modal-detail-value">${logData.attendedTime || '0h 0m'}</span>
                </div>
                <div class="modal-detail-item">
                    <span class="modal-detail-label">Break Time</span>
                    <span class="modal-detail-value">${logData.breakTime || '0h 0m'}</span>
                </div>
                <div class="modal-detail-item">
                    <span class="modal-detail-label">Rule A Exit</span>
                    <span class="modal-detail-value">${show12Hour ? this.format12Hour(this.parseTimeToMinutes(logData.ruleAExit)) : logData.ruleAExit}</span>
                </div>
                <div class="modal-detail-item">
                    <span class="modal-detail-label">Rule B Exit</span>
                    <span class="modal-detail-value">${show12Hour ? this.format12Hour(this.parseTimeToMinutes(logData.ruleBExit)) : logData.ruleBExit}</span>
                </div>
                <div class="modal-detail-item">
                    <span class="modal-detail-label">Real Exit Time</span>
                    <span class="modal-detail-value">${logData.realExitTime ? (show12Hour ? this.format12Hour(this.parseTimeToMinutes(logData.realExitTime)) : logData.realExitTime) : 'Not calculated'}</span>
                </div>
                <div class="modal-detail-item">
                    <span class="modal-detail-label">Efficiency</span>
                    <span class="modal-detail-value">${logData.efficiency || 0}%</span>
                </div>
            </div>
        `;
        
        // Add break timeline if available
        if (logData.breakSessions && logData.breakSessions.length > 0) {
            modalHTML += `
                <div class="break-timeline">
                    <h4>Break Timeline</h4>
            `;
            
            logData.breakSessions.forEach((session, index) => {
                const startTime = show12Hour ? this.format12Hour(session.startTime) : this.format24Hour(session.startTime);
                const endTime = session.endTime ? 
                    (show12Hour ? this.format12Hour(session.endTime) : this.format24Hour(session.endTime)) : 
                    'Ongoing';
                const duration = session.duration ? this.formatDuration(session.duration) : 'Ongoing';
                
                modalHTML += `
                    <div class="break-entry">
                        <span class="break-time-range">Break ${index + 1}: ${startTime} - ${endTime}</span>
                        <span class="break-duration">${duration}</span>
                    </div>
                `;
            });
            
            modalHTML += '</div>';
        }
        
        content.innerHTML = modalHTML;
        modal.classList.add('active');
    }

    closeModal() {
        document.getElementById('historyModal').classList.remove('active');
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
            const hours = log ? this.parseDurationToHours(log.attendedTime) : 0;
            const maxHours = 10; // Assuming max 10 hours for scaling
            const height = Math.max(20, (hours / maxHours) * 180);
            
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            bar.style.height = `${height}px`;
            bar.title = `${day}: ${hours.toFixed(1)}h`;
            
            const label = document.createElement('div');
            label.className = 'chart-label';
            label.textContent = day;
            
            bar.appendChild(label);
            chartContainer.appendChild(bar);
        });
    }

    parseDurationToHours(durationStr) {
        if (!durationStr) return 0;
        const match = durationStr.match(/(\d+)h\s*(\d+)m/);
        if (match) {
            return parseInt(match[1]) + parseInt(match[2]) / 60;
        }
        return 0;
    }

    renderStats(logs) {
        const statsContainer = document.getElementById('statsList');
        statsContainer.innerHTML = '';
        
        const logEntries = Object.values(logs);
        const totalDays = logEntries.length;
        const avgHours = totalDays > 0 ? 
            logEntries.reduce((sum, log) => sum + this.parseDurationToHours(log.attendedTime), 0) / totalDays : 0;
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
                weekHours += this.parseDurationToHours(log.attendedTime);
            }
        }
        
        return weekHours.toFixed(1);
    }

    renderHistory(logs) {
        const historyContainer = document.getElementById('historyList');
        historyContainer.innerHTML = '';
        
        const sortedEntries = Object.entries(logs)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .slice(0, 10); // Show last 10 entries
        
        sortedEntries.forEach(([date, log]) => {
            const item = document.createElement('div');
            item.className = 'history-item';
            item.innerHTML = `
                <div class="history-date">${new Date(date).toLocaleDateString()}</div>
                <div class="history-hours">${log.attendedTime || '0h 0m'}</div>
            `;
            
            // Add click event to open modal
            item.addEventListener('click', () => {
                this.openHistoryModal(date, log);
            });
            
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
        const show12Hour = localStorage.getItem('show12Hour') !== 'false';
        const showSeconds = localStorage.getItem('showSeconds') === 'true';
        
        document.getElementById('breakReminders').checked = breakReminders;
        document.getElementById('exitReminders').checked = exitReminders;
        document.getElementById('overtimeAlerts').checked = overtimeAlerts;
        document.getElementById('show12Hour').checked = show12Hour;
        document.getElementById('showSeconds').checked = showSeconds;
        
        // Add event listeners
        document.querySelectorAll('#settings input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                localStorage.setItem(e.target.id, e.target.checked);
                if ((e.target.id === 'show12Hour' || e.target.id === 'showSeconds') && document.getElementById('inTime').value) {
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