// Actrac Authentication JavaScript

class AuthApp {
    constructor() {
        this.apiUrl = 'https://actrac.onrender.com';
        this.init();
    }

    init() {
        this.bindEventListeners();
        this.checkExistingSession();
    }

    bindEventListeners() {
        // Toggle between login and signup forms
        const loginToggle = document.getElementById('loginToggle');
        const signupToggle = document.getElementById('signupToggle');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');

        if (loginToggle && signupToggle && loginForm && signupForm) {
            loginToggle.addEventListener('click', () => {
                loginToggle.classList.add('active');
                signupToggle.classList.remove('active');
                loginForm.classList.remove('hidden');
                signupForm.classList.add('hidden');
            });

            signupToggle.addEventListener('click', () => {
                signupToggle.classList.add('active');
                loginToggle.classList.remove('active');
                signupForm.classList.remove('hidden');
                loginForm.classList.add('hidden');
            });

            // Form submissions
            loginForm.addEventListener('submit', this.handleLogin.bind(this));
            signupForm.addEventListener('submit', this.handleSignup.bind(this));
        }
    }

    checkExistingSession() {
        const user = localStorage.getItem('actracUser');
        if (user) {
            // Redirect to main app
            window.location.href = 'index.html';
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

    async handleLogin(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const email = formData.get('loginEmail').trim();
        const password = formData.get('loginPassword');

        if (!email || !password) {
            this.showNotification('Please enter both email and password!', 'error');
            return;
        }

        this.showLoading();

        try {
            const response = await fetch(`${this.apiUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Store user data in localStorage
            localStorage.setItem('actracUser', JSON.stringify(data.user));
            
            this.showNotification('Login successful! Redirecting...', 'success');
            
            // Redirect to main app after a short delay
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Login error:', error);
            this.showNotification(error.message || 'Login failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    async handleSignup(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const username = formData.get('signupUsername').trim();
        const email = formData.get('signupEmail').trim();
        const password = formData.get('signupPassword');

        if (!username || !email || !password) {
            this.showNotification('Please fill in all fields!', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('Password must be at least 6 characters!', 'error');
            return;
        }

        this.showLoading();

        try {
            const response = await fetch(`${this.apiUrl}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            this.showNotification('Account created successfully! Please login.', 'success');
            
            // Switch to login form
            setTimeout(() => {
                document.getElementById('loginToggle').click();
                document.getElementById('loginEmail').value = email;
            }, 1500);
            
        } catch (error) {
            console.error('Signup error:', error);
            this.showNotification(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authApp = new AuthApp();
});