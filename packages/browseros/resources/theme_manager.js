/**
 * Theme Manager - Dark/Light Mode Toggle
 * Manages color themes across all E-Nation OS pages
 */

class ThemeManager {
    constructor() {
        this.currentTheme = this.loadTheme();
        this.init();
    }

    /**
     * Initialize theme system
     */
    init() {
        // Create theme toggle button
        this.createToggleButton();

        // Apply saved theme
        this.applyTheme(this.currentTheme);

        // Add CSS variables
        this.injectThemeStyles();
    }

    /**
     * Inject CSS variables for theming
     */
    injectThemeStyles() {
        const style = document.createElement('style');
        style.id = 'theme-variables';
        style.textContent = `
            :root {
                /* Dark Theme (Default) */
                --bg-primary: #0f172a;
                --bg-secondary: #1e293b;
                --bg-tertiary: #334155;
                --text-primary: #ffffff;
                --text-secondary: rgba(255, 255, 255, 0.8);
                --text-muted: rgba(255, 255, 255, 0.6);
                --border-color: rgba(255, 255, 255, 0.1);
                --accent-blue: #3b82f6;
                --accent-green: #22c55e;
                --accent-red: #ef4444;
                --accent-yellow: #fbbf24;
                --shadow: rgba(0, 0, 0, 0.3);
            }

            [data-theme="light"] {
                /* Light Theme */
                --bg-primary: #ffffff;
                --bg-secondary: #f8fafc;
                --bg-tertiary: #e2e8f0;
                --text-primary: #0f172a;
                --text-secondary: rgba(15, 23, 42, 0.8);
                --text-muted: rgba(15, 23, 42, 0.6);
                --border-color: rgba(15, 23, 42, 0.1);
                --accent-blue: #2563eb;
                --accent-green: #16a34a;
                --accent-red: #dc2626;
                --accent-yellow: #f59e0b;
                --shadow: rgba(0, 0, 0, 0.1);
            }

            /* Apply theme variables globally */
            body {
                background: var(--bg-primary);
                color: var(--text-primary);
                transition: background 0.3s ease, color 0.3s ease;
            }

            .sidebar, .main-container, .header {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }

            .section, .card, .kpi-card {
                background: var(--bg-tertiary);
                border-color: var(--border-color);
            }

            button, .input, select {
                background: var(--bg-tertiary);
                color: var(--text-primary);
                border-color: var(--border-color);
            }

            button:hover {
                background: var(--bg-secondary);
            }

            .toast {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }

            /* Theme toggle button */
            .theme-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 56px;
                height: 56px;
                border-radius: 50%;
                background: var(--accent-blue);
                border: 2px solid var(--border-color);
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px var(--shadow);
                transition: all 0.3s ease;
                z-index: 1000;
            }

            .theme-toggle:hover {
                transform: scale(1.1) rotate(20deg);
                box-shadow: 0 6px 20px var(--shadow);
            }

            .theme-toggle:active {
                transform: scale(0.95);
            }

            /* Smooth transitions for theme changes */
            * {
                transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Create theme toggle button
     */
    createToggleButton() {
        const button = document.createElement('button');
        button.className = 'theme-toggle';
        button.setAttribute('aria-label', 'Toggle theme');
        button.innerHTML = this.currentTheme === 'dark' ? '☀️' : '🌙';
        button.onclick = () => this.toggleTheme();

        document.body.appendChild(button);
        this.toggleButton = button;
    }

    /**
     * Toggle between dark and light themes
     */
    toggleTheme() {
        const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
        this.saveTheme(newTheme);

        // Show toast notification
        if (window.toast) {
            toast.success(`${newTheme === 'dark' ? '🌙' : '☀️'} ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`);
        }
    }

    /**
     * Apply theme to document
     */
    applyTheme(theme) {
        this.currentTheme = theme;
        document.documentElement.setAttribute('data-theme', theme);

        // Update toggle button icon
        if (this.toggleButton) {
            this.toggleButton.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        }
    }

    /**
     * Save theme to localStorage
     */
    saveTheme(theme) {
        localStorage.setItem('enation_theme', theme);
    }

    /**
     * Load theme from localStorage
     */
    loadTheme() {
        const saved = localStorage.getItem('enation_theme');

        // Default to dark theme, or use system preference
        if (saved) {
            return saved;
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            return 'light';
        } else {
            return 'dark';
        }
    }

    /**
     * Get current theme
     */
    getTheme() {
        return this.currentTheme;
    }

    /**
     * Set theme programmatically
     */
    setTheme(theme) {
        if (theme === 'dark' || theme === 'light') {
            this.applyTheme(theme);
            this.saveTheme(theme);
        }
    }
}

// Auto-initialize on page load
if (typeof window !== 'undefined') {
    window.themeManager = new ThemeManager();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ThemeManager;
}
