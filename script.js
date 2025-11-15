// Actrac - Activity Tracker JavaScript

class ActracApp {
    constructor() {
        this.apiUrl = 'http://localhost:3001';
        this.user = null;
        this.activities = [];
        this.totalPoints = 0;
        this.init();
    }

    init() {
        // Check if user is logged in
        const user = localStorage.getItem('actracUser');
        if (!user) {
            window.location.href = 'login.html';
            return;
        }
        
        this.user = JSON.parse(user);
        this.bindEventListeners();
        this.loadUser();
        this.loadActivities();
        this.setupIntersectionObserver();
        this.initializeAnimations();
        this.applyTheme();
    }

    loadUser() {
        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) {
            usernameDisplay.textContent = this.user.username;
        }
    }

    bindEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }
        
        // Theme toggle
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }

        // Form submission
        const activityForm = document.getElementById('activityForm');
        if (activityForm) {
            activityForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        }
        
        // Edit activity form
        const editActivityForm = document.getElementById('editActivityForm');
        if (editActivityForm) {
            editActivityForm.addEventListener('submit', this.handleEditActivity.bind(this));
        }
        
        // Close edit modal
        const closeEditModal = document.getElementById('closeEditModal');
        if (closeEditModal) {
            closeEditModal.addEventListener('click', this.closeEditModal.bind(this));
        }
        
        // Delete activity button
        const deleteActivityBtn = document.getElementById('deleteActivityBtn');
        if (deleteActivityBtn) {
            deleteActivityBtn.addEventListener('click', this.handleDeleteActivity.bind(this));
        }
        
        // Click outside modal to close
        const editActivityModal = document.getElementById('editActivityModal');
        if (editActivityModal) {
            editActivityModal.addEventListener('click', (e) => {
                if (e.target.id === 'editActivityModal') {
                    this.closeEditModal();
                }
            });
        }

        // Close achievement modal
        const closeModal = document.getElementById('closeModal');
        if (closeModal) {
            closeModal.addEventListener('click', this.closeAchievementModal.bind(this));
        }
        
        // Click outside achievement modal to close
        const achievementModal = document.getElementById('achievementModal');
        if (achievementModal) {
            achievementModal.addEventListener('click', (e) => {
                if (e.target.id === 'achievementModal') {
                    this.closeAchievementModal();
                }
            });
        }

        // Form input animations
        this.setupFormAnimations();
    }

    handleLogout() {
        localStorage.removeItem('actracUser');
        window.location.href = 'login.html';
    }

    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.toggle('dark-mode');
        
        // Save preference
        localStorage.setItem('actracTheme', isDark ? 'dark' : 'light');
        
        // Update toggle button
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.classList.toggle('dark', isDark);
        }
    }

    applyTheme() {
        const savedTheme = localStorage.getItem('actracTheme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.classList.add('dark');
            }
        }
    }

    setupFormAnimations() {
        const inputs = document.querySelectorAll('.form-input');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.classList.add('focused');
            });
            
            input.addEventListener('blur', () => {
                if (!input.value) {
                    input.parentElement.classList.remove('focused');
                }
            });
        });
    }

    setupIntersectionObserver() {
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.animationPlayState = 'running';
                    }
                });
            }, observerOptions);

            // Observe all animated elements
            document.querySelectorAll('.stat-card, .glass-panel, .activity-item').forEach(el => {
                observer.observe(el);
            });
        }
    }

    initializeAnimations() {
        // Add stagger effect to title letters
        const titleLetters = document.querySelectorAll('.title-letter');
        titleLetters.forEach((letter, index) => {
            letter.style.animationDelay = `${index * 0.1}s`;
        });

        // Initialize floating stats cards
        this.initFloatingCards();
        
        // Initialize particle background
        this.initParticleBackground();
    }

    initFloatingCards() {
        const cards = document.querySelectorAll('.stat-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * -2}s`;
            
            // Add mouse parallax effect
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = -(x - centerX) / 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    initParticleBackground() {
        const container = document.querySelector('.background-animation');
        if (!container) return;
        
        // Clear existing particles
        container.innerHTML = '';
        
        // Create floating particles
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 2}px;
                height: ${Math.random() * 4 + 2}px;
                background: radial-gradient(circle, var(--secondary-shade), transparent);
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: float ${Math.random() * 10 + 15}s ease-in-out infinite;
                animation-delay: ${Math.random() * -10}s;
                opacity: 0.6;
            `;
            container.appendChild(particle);
        }
    }

    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'flex';
    }

    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.style.display = 'none';
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const formData = new FormData(form);
        const activityName = formData.get('activityName').trim();
        const activityPoints = parseInt(formData.get('activityPoints'));
        const activityDate = formData.get('activityDate');
        const activityHost = formData.get('activityHost').trim();
        const activityDescription = formData.get('activityDescription').trim();

        if (!activityName || !activityPoints || activityPoints <= 0) {
            this.showNotification('Please enter valid activity name and points!', 'error');
            return;
        }

        this.showLoading();

        try {
            const response = await fetch(`${this.apiUrl}/activities`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': this.user.id
                },
                body: JSON.stringify({
                    name: activityName,
                    points: activityPoints,
                    date: activityDate,
                    host: activityHost,
                    description: activityDescription
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const newActivity = await response.json();
            
            // Add to local array
            this.activities.unshift(newActivity);
            this.renderActivities();
            this.updateStats();
            
            // Reset form
            form.reset();
            
            this.showNotification('Activity added successfully!', 'success');
            
            // Check for achievement
            this.checkAchievement();
            
        } catch (error) {
            console.error('Error adding activity:', error);
            this.showNotification(error.message || 'Failed to add activity. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleEditActivity(e) {
        e.preventDefault();
        
        const form = e.target;
        const activityId = document.getElementById('editActivityId').value;
        const activityName = document.getElementById('editActivityName').value.trim();
        const activityPoints = parseInt(document.getElementById('editActivityPoints').value);
        const activityDate = document.getElementById('editActivityDate').value;
        const activityHost = document.getElementById('editActivityHost').value.trim();
        const activityDescription = document.getElementById('editActivityDescription').value.trim();

        if (!activityName || !activityPoints || activityPoints <= 0) {
            this.showNotification('Please enter valid activity name and points!', 'error');
            return;
        }

        this.showLoading();

        try {
            const response = await fetch(`${this.apiUrl}/activities/${activityId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'User-ID': this.user.id
                },
                body: JSON.stringify({
                    name: activityName,
                    points: activityPoints,
                    date: activityDate,
                    host: activityHost,
                    description: activityDescription
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const updatedActivity = await response.json();
            
            // Update in local array
            const index = this.activities.findIndex(a => a.id == activityId);
            if (index !== -1) {
                this.activities[index] = updatedActivity;
            }
            
            this.renderActivities();
            this.updateStats();
            this.closeEditModal();
            
            this.showNotification('Activity updated successfully!', 'success');
            
        } catch (error) {
            console.error('Error updating activity:', error);
            this.showNotification(error.message || 'Failed to update activity. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleDeleteActivity() {
        const activityId = document.getElementById('editActivityId').value;
        
        if (!confirm('Are you sure you want to delete this activity?')) {
            return;
        }

        this.showLoading();

        try {
            const response = await fetch(`${this.apiUrl}/activities/${activityId}`, {
                method: 'DELETE',
                headers: {
                    'User-ID': this.user.id
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            // Remove from local array
            this.activities = this.activities.filter(a => a.id != activityId);
            this.renderActivities();
            this.updateStats();
            this.closeEditModal();
            
            this.showNotification('Activity deleted successfully!', 'success');
            
        } catch (error) {
            console.error('Error deleting activity:', error);
            this.showNotification(error.message || 'Failed to delete activity. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    openEditModal(activity) {
        document.getElementById('editActivityId').value = activity.id;
        document.getElementById('editActivityName').value = activity.name;
        document.getElementById('editActivityPoints').value = activity.points;
        document.getElementById('editActivityDate').value = activity.date || '';
        document.getElementById('editActivityHost').value = activity.host || '';
        document.getElementById('editActivityDescription').value = activity.description || '';
        
        document.getElementById('editActivityModal').style.display = 'flex';
    }

    closeEditModal() {
        document.getElementById('editActivityModal').style.display = 'none';
    }

    async loadActivities() {
        this.showLoading();

        try {
            const response = await fetch(`${this.apiUrl}/activities`, {
                headers: {
                    'User-ID': this.user.id
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.activities = await response.json();
            this.renderActivities();
            this.updateStats();
            
        } catch (error) {
            console.error('Error loading activities:', error);
            this.showNotification('Failed to load activities. Please check your connection.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    renderActivities() {
        const container = document.getElementById('activitiesContainer');
        const emptyState = document.getElementById('emptyState');

        if (!container || !emptyState) return;

        if (this.activities.length === 0) {
            emptyState.style.display = 'block';
            container.innerHTML = '';
            return;
        }

        emptyState.style.display = 'none';
        
        // Clear existing activities except empty state
        container.innerHTML = '';

        this.activities.forEach((activity, index) => {
            const activityElement = this.createActivityElement(activity, index);
            container.appendChild(activityElement);
        });
    }

    createActivityElement(activity, index) {
        const div = document.createElement('div');
        div.className = 'activity-item';
        div.style.animationDelay = `${index * 0.1}s`;
        
        // Format date
        const formattedDate = activity.date ? new Date(activity.date).toLocaleDateString() : 'No date';
        
        div.innerHTML = `
            <div class="activity-info">
                <div class="activity-name">${this.escapeHtml(activity.name)}</div>
                <div class="activity-meta">
                    <span class="activity-date">${formattedDate}</span>
                    ${activity.host ? `<span class="activity-host">Host: ${this.escapeHtml(activity.host)}</span>` : ''}
                </div>
                ${activity.description ? `<div class="activity-description">${this.escapeHtml(activity.description)}</div>` : ''}
            </div>
            <div class="activity-actions">
                <div class="activity-points">${activity.points}</div>
                <button class="edit-btn" data-id="${activity.id}">Edit</button>
            </div>
        `;

        // Add hover effects
        div.addEventListener('mouseenter', () => {
            div.style.transform = 'translateY(-2px) scale(1.02)';
            div.style.boxShadow = '0 12px 30px rgba(107, 63, 105, 0.2)';
        });

        div.addEventListener('mouseleave', () => {
            div.style.transform = '';
            div.style.boxShadow = '';
        });
        
        // Add edit button event
        const editBtn = div.querySelector('.edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const activity = this.activities.find(a => a.id == editBtn.dataset.id);
            if (activity) {
                this.openEditModal(activity);
            }
        });

        return div;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async updateStats() {
        try {
            const response = await fetch(`${this.apiUrl}/total`, {
                headers: {
                    'User-ID': this.user.id
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            this.totalPoints = data.total;
            
            // Animate stat updates
            this.animateStatUpdate('totalPoints', data.total);
            this.animateStatUpdate('remainingPoints', Math.max(0, data.remaining));
            this.animateStatUpdate('totalActivities', this.activities.length);
            
            // Update progress bar
            this.updateProgressBar(data.total);
            
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    animateStatUpdate(elementId, newValue) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        const currentValue = parseInt(element.textContent) || 0;
        
        if (currentValue === newValue) return;

        // Scale animation
        element.style.transform = 'scale(1.2)';
        element.style.color = 'var(--highlight-shade)';
        
        // Counter animation
        this.animateCounter(element, currentValue, newValue, 1000);
        
        setTimeout(() => {
            element.style.transform = '';
            element.style.color = '';
        }, 500);
    }

    animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        const difference = end - start;

        const updateCounter = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + difference * easeOutCubic);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        };
        
        requestAnimationFrame(updateCounter);
    }

    updateProgressBar(totalPoints) {
        const progressFill = document.getElementById('progressFill');
        if (!progressFill) return;
        
        const percentage = Math.min((totalPoints / 100) * 100, 100);
        
        progressFill.style.width = `${percentage}%`;
        
        // Update achievement badge
        const badge = document.getElementById('achievementBadge');
        const badgeText = badge ? badge.querySelector('span') : null;
        
        if (!badgeText) return;
        
        if (totalPoints >= 100) {
            badgeText.textContent = 'Goal Achieved! 🎉';
            badge.style.background = 'linear-gradient(135deg, #FFD700, #FFA500)';
        } else if (totalPoints >= 75) {
            badgeText.textContent = 'Almost There! 🔥';
            badge.style.background = 'linear-gradient(135deg, var(--secondary-shade), var(--highlight-shade))';
        } else if (totalPoints >= 50) {
            badgeText.textContent = 'Great Progress! 💪';
            badge.style.background = 'linear-gradient(135deg, var(--accent-shade), var(--secondary-shade))';
        } else {
            badgeText.textContent = 'Keep Going! 🚀';
            badge.style.background = 'linear-gradient(135deg, var(--soft-accent), var(--accent-shade))';
        }
    }

    checkAchievement() {
        if (this.totalPoints >= 100) {
            setTimeout(() => {
                this.showAchievementModal(this.totalPoints);
            }, 500);
        }
    }

    showAchievementModal(points) {
        const modal = document.getElementById('achievementModal');
        const pointsElement = document.getElementById('achievementPoints');
        
        if (pointsElement) pointsElement.textContent = points;
        if (modal) modal.style.display = 'flex';
        
        // Add confetti effect
        this.createConfettiEffect();
    }

    closeAchievementModal() {
        const modal = document.getElementById('achievementModal');
        if (modal) {
            modal.style.animation = 'fadeOut 0.3s ease-out';
            
            setTimeout(() => {
                modal.style.display = 'none';
                modal.style.animation = '';
            }, 300);
        }
    }

    createConfettiEffect() {
        const colors = ['var(--secondary-shade)', 'var(--accent-shade)', 'var(--highlight-shade)', '#FFD700'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 8px;
                height: 8px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: ${Math.random() * 100}vw;
                top: -10px;
                z-index: 1001;
                animation: confetti-fall ${Math.random() * 3 + 2}s linear forwards;
                transform: rotate(${Math.random() * 360}deg);
            `;
            
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 5000);
        }

        // Add confetti animation to CSS if not exists
        if (!document.querySelector('style[data-confetti]')) {
            const style = document.createElement('style');
            style.setAttribute('data-confetti', 'true');
            style.textContent = `
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(-10px) rotateZ(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh) rotateZ(720deg);
                        opacity: 0;
                    }
                }
                
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        
        const colors = {
            success: 'linear-gradient(135deg, #4CAF50, #45a049)',
            error: 'linear-gradient(135deg, #f44336, #da190b)',
            info: 'linear-gradient(135deg, var(--secondary-shade), var(--highlight-shade))'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
            z-index: 1002;
            animation: slideInRight 0.3s ease-out;
            font-family: 'Georgia', serif;
            font-weight: 600;
            max-width: 300px;
            word-wrap: break-word;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        // Add notification animations to CSS if not exists
        if (!document.querySelector('style[data-notifications]')) {
            const style = document.createElement('style');
            style.setAttribute('data-notifications', 'true');
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.actracApp = new ActracApp();
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}