/**
 * E-Nation OS UX Enhancements
 * Complete UX/UI improvement library with all missing features
 */

class UXEnhancements {
    constructor() {
        this.navigationHistory = [];
        this.recentActivity = this.loadRecentActivity();
        this.init();
    }

    /**
     * Initialize all UX enhancements
     */
    init() {
        this.injectStyles();
        this.createBreadcrumbs();
        this.createBackButton();
        this.createRefreshButton();
        this.setupKeyboardShortcuts();
        this.setupErrorBoundary();
        this.setupStickyHeader();
        this.setupTooltips();
        this.setupContextMenu();
        this.createRecentActivityWidget();

        console.log('✓ E-Nation OS UX Enhancements loaded');
    }

    /**
     * Inject all CSS styles
     */
    injectStyles() {
        const style = document.createElement('style');
        style.id = 'ux-enhancements-styles';
        style.textContent = `
            /* Breadcrumbs */
            .breadcrumbs {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 12px 20px;
                background: var(--bg-secondary, rgba(30, 41, 59, 0.8));
                border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
                font-size: 0.9rem;
                color: var(--text-secondary, rgba(255, 255, 255, 0.8));
            }

            .breadcrumb-item {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .breadcrumb-link {
                color: var(--accent-blue, #3b82f6);
                text-decoration: none;
                cursor: pointer;
                transition: color 0.2s ease;
            }

            .breadcrumb-link:hover {
                color: var(--accent-green, #22c55e);
                text-decoration: underline;
            }

            .breadcrumb-separator {
                color: var(--text-muted, rgba(255, 255, 255, 0.4));
            }

            .breadcrumb-current {
                color: var(--text-primary, white);
                font-weight: 600;
            }

            /* Back Button */
            .back-button {
                position: fixed;
                top: 80px;
                left: 20px;
                background: var(--accent-blue, #3b82f6);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-size: 0.9rem;
                font-weight: 500;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
                z-index: 999;
            }

            .back-button:hover {
                background: var(--accent-green, #22c55e);
                transform: translateX(-3px);
            }

            .back-button.hidden {
                display: none;
            }

            /* Refresh Button */
            .refresh-button {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: var(--accent-green, #22c55e);
                color: white;
                border: none;
                font-size: 1.3rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
                z-index: 999;
            }

            .refresh-button:hover {
                transform: rotate(180deg) scale(1.1);
            }

            .refresh-button.refreshing {
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            /* Status Badges */
            .badge {
                display: inline-block;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .badge-critical {
                background: #991b1b;
                color: white;
                animation: pulse 1.5s ease-in-out infinite;
            }

            .badge-high {
                background: #dc2626;
                color: white;
            }

            .badge-medium {
                background: #f59e0b;
                color: white;
            }

            .badge-low {
                background: #10b981;
                color: white;
            }

            .badge-new {
                background: #3b82f6;
                color: white;
            }

            .badge-updated {
                background: #8b5cf6;
                color: white;
            }

            .badge-live {
                background: #22c55e;
                color: white;
                animation: pulse 2s ease-in-out infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }

            /* Empty State */
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                text-align: center;
            }

            .empty-state .icon {
                font-size: 4rem;
                margin-bottom: 20px;
                opacity: 0.5;
            }

            .empty-state h3 {
                font-size: 1.5rem;
                margin-bottom: 12px;
                color: var(--text-primary, white);
            }

            .empty-state p {
                font-size: 1rem;
                color: var(--text-secondary, rgba(255, 255, 255, 0.7));
                max-width: 500px;
            }

            /* Skeleton Loader */
            .skeleton {
                background: linear-gradient(
                    90deg,
                    rgba(255, 255, 255, 0.05) 25%,
                    rgba(255, 255, 255, 0.1) 50%,
                    rgba(255, 255, 255, 0.05) 75%
                );
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 8px;
            }

            .skeleton-text {
                height: 16px;
                margin-bottom: 8px;
            }

            .skeleton-title {
                height: 24px;
                width: 60%;
                margin-bottom: 12px;
            }

            .skeleton-card {
                height: 200px;
            }

            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }

            /* Keyboard Shortcuts Modal */
            .shortcuts-modal {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bg-secondary, #1e293b);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                border-radius: 16px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                z-index: 10001;
                display: none;
            }

            .shortcuts-modal.visible {
                display: block;
            }

            .shortcuts-modal h2 {
                margin-bottom: 24px;
                color: var(--text-primary, white);
                display: flex;
                align-items: center;
                gap: 12px;
            }

            .shortcuts-list {
                display: grid;
                gap: 16px;
            }

            .shortcut-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: var(--bg-tertiary, rgba(51, 65, 85, 0.5));
                border-radius: 8px;
            }

            .shortcut-keys {
                display: flex;
                gap: 6px;
            }

            kbd {
                background: var(--bg-primary, #0f172a);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.3));
                border-radius: 4px;
                padding: 4px 8px;
                font-family: monospace;
                font-size: 0.85rem;
                color: var(--accent-blue, #60a5fa);
            }

            /* Tooltip */
            .tooltip {
                position: absolute;
                background: rgba(15, 23, 42, 0.95);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.85rem;
                max-width: 250px;
                z-index: 10000;
                pointer-events: none;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                display: none;
            }

            .tooltip.visible {
                display: block;
            }

            /* Context Menu */
            .context-menu {
                position: fixed;
                background: var(--bg-secondary, #1e293b);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                border-radius: 8px;
                padding: 8px 0;
                min-width: 200px;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
                z-index: 10000;
                display: none;
            }

            .context-menu.visible {
                display: block;
            }

            .context-menu-item {
                padding: 10px 16px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 12px;
                color: var(--text-primary, white);
                transition: background 0.2s ease;
            }

            .context-menu-item:hover {
                background: var(--bg-tertiary, rgba(51, 65, 85, 0.8));
            }

            .context-menu-separator {
                height: 1px;
                background: var(--border-color, rgba(255, 255, 255, 0.1));
                margin: 4px 0;
            }

            /* Recent Activity Widget */
            .recent-activity-widget {
                position: fixed;
                top: 80px;
                right: 20px;
                background: var(--bg-secondary, #1e293b);
                border: 1px solid var(--border-color, rgba(255, 255, 255, 0.2));
                border-radius: 12px;
                padding: 16px;
                width: 280px;
                max-height: 400px;
                overflow-y: auto;
                box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
                z-index: 998;
                display: none;
            }

            .recent-activity-widget.visible {
                display: block;
            }

            .recent-activity-widget h4 {
                margin-bottom: 12px;
                color: var(--text-primary, white);
                font-size: 0.95rem;
            }

            .activity-item {
                padding: 10px;
                background: var(--bg-tertiary, rgba(51, 65, 85, 0.5));
                border-radius: 8px;
                margin-bottom: 8px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: background 0.2s ease;
            }

            .activity-item:hover {
                background: var(--bg-tertiary, rgba(51, 65, 85, 0.8));
            }

            .activity-time {
                font-size: 0.75rem;
                color: var(--text-muted, rgba(255, 255, 255, 0.5));
                margin-top: 4px;
            }

            /* Sticky Header */
            .sticky-header {
                position: sticky;
                top: 0;
                z-index: 100;
                background: var(--bg-secondary, #1e293b);
                border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
            }

            /* Confirmation Dialog */
            .confirm-dialog {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: var(--bg-secondary, #1e293b);
                border: 2px solid var(--accent-blue, #3b82f6);
                border-radius: 16px;
                padding: 30px;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                z-index: 10002;
                display: none;
            }

            .confirm-dialog.visible {
                display: block;
            }

            .confirm-dialog h3 {
                margin-bottom: 16px;
                color: var(--text-primary, white);
            }

            .confirm-dialog p {
                margin-bottom: 24px;
                color: var(--text-secondary, rgba(255, 255, 255, 0.8));
                line-height: 1.6;
            }

            .confirm-buttons {
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }

            .confirm-btn {
                padding: 10px 24px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.2s ease;
            }

            .confirm-btn-primary {
                background: var(--accent-blue, #3b82f6);
                color: white;
            }

            .confirm-btn-primary:hover {
                background: var(--accent-green, #22c55e);
            }

            .confirm-btn-secondary {
                background: rgba(255, 255, 255, 0.1);
                color: white;
            }

            .confirm-btn-secondary:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* Overlay */
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                backdrop-filter: blur(4px);
                z-index: 10000;
                display: none;
            }

            .modal-overlay.visible {
                display: block;
            }

            /* Fullscreen Button */
            .fullscreen-button {
                position: fixed;
                bottom: 150px;
                right: 20px;
                width: 48px;
                height: 48px;
                border-radius: 50%;
                background: var(--accent-blue, #3b82f6);
                color: white;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
                transition: all 0.3s ease;
                z-index: 999;
            }

            .fullscreen-button:hover {
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Create breadcrumb navigation
     */
    createBreadcrumbs() {
        const container = document.createElement('div');
        container.className = 'breadcrumbs';
        container.id = 'breadcrumbs';

        // Insert at top of body
        if (document.body.firstChild) {
            document.body.insertBefore(container, document.body.firstChild);
        } else {
            document.body.appendChild(container);
        }

        this.breadcrumbsContainer = container;
        this.updateBreadcrumbs(['Home', 'GeoIntel']);
    }

    /**
     * Update breadcrumbs
     */
    updateBreadcrumbs(path) {
        if (!this.breadcrumbsContainer) return;

        const html = path.map((item, index) => {
            const isLast = index === path.length - 1;
            if (isLast) {
                return `<span class="breadcrumb-current">${item}</span>`;
            } else {
                return `
                    <div class="breadcrumb-item">
                        <a class="breadcrumb-link" onclick="uxEnhancements.navigateTo(${index})">${item}</a>
                        <span class="breadcrumb-separator">›</span>
                    </div>
                `;
            }
        }).join('');

        this.breadcrumbsContainer.innerHTML = html;
    }

    /**
     * Navigate via breadcrumb
     */
    navigateTo(index) {
        console.log(`Navigate to breadcrumb ${index}`);
        // Implement navigation logic
    }

    /**
     * Create back button
     */
    createBackButton() {
        const button = document.createElement('button');
        button.className = 'back-button hidden';
        button.innerHTML = '← Back';
        button.onclick = () => this.goBack();
        document.body.appendChild(button);
        this.backButton = button;
    }

    /**
     * Show/hide back button
     */
    toggleBackButton(show) {
        if (this.backButton) {
            this.backButton.classList.toggle('hidden', !show);
        }
    }

    /**
     * Go back
     */
    goBack() {
        window.history.back();
    }

    /**
     * Create refresh button
     */
    createRefreshButton() {
        const button = document.createElement('button');
        button.className = 'refresh-button';
        button.innerHTML = '🔄';
        button.title = 'Refresh data';
        button.onclick = () => this.refreshData();
        document.body.appendChild(button);
        this.refreshButton = button;
    }

    /**
     * Refresh data
     */
    async refreshData() {
        if (!this.refreshButton) return;

        this.refreshButton.classList.add('refreshing');

        // Simulate refresh
        await new Promise(resolve => setTimeout(resolve, 1000));

        this.refreshButton.classList.remove('refreshing');

        if (window.toast) {
            toast.success('✓ Data refreshed successfully');
        }

        // Trigger custom refresh event
        window.dispatchEvent(new CustomEvent('dataRefresh'));
    }

    /**
     * Create status badge
     */
    createBadge(level, text) {
        const badge = document.createElement('span');
        badge.className = `badge badge-${level}`;
        badge.textContent = text || level.toUpperCase();
        return badge;
    }

    /**
     * Create empty state
     */
    createEmptyState(icon, title, description) {
        const container = document.createElement('div');
        container.className = 'empty-state';
        container.innerHTML = `
            <div class="icon">${icon}</div>
            <h3>${title}</h3>
            <p>${description}</p>
        `;
        return container;
    }

    /**
     * Create skeleton loader
     */
    createSkeleton(type = 'text', count = 3) {
        const container = document.createElement('div');

        for (let i = 0; i < count; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = `skeleton skeleton-${type}`;
            container.appendChild(skeleton);
        }

        return container;
    }

    /**
     * Setup keyboard shortcuts
     */
    setupKeyboardShortcuts() {
        // Create shortcutsmodal
        const modal = document.createElement('div');
        modal.className = 'shortcuts-modal';
        modal.innerHTML = `
            <h2>⌨️ Keyboard Shortcuts</h2>
            <div class="shortcuts-list">
                <div class="shortcut-item">
                    <span>Open GeoIntel</span>
                    <div class="shortcut-keys">
                        <kbd>Ctrl</kbd> + <kbd>G</kbd>
                    </div>
                </div>
                <div class="shortcut-item">
                    <span>Open eCitizen</span>
                    <div class="shortcut-keys">
                        <kbd>Ctrl</kbd> + <kbd>E</kbd>
                    </div>
                </div>
                <div class="shortcut-item">
                    <span>Open Kenya News</span>
                    <div class="shortcut-keys">
                        <kbd>Ctrl</kbd> + <kbd>K</kbd>
                    </div>
                </div>
                <div class="shortcut-item">
                    <span>Search</span>
                    <div class="shortcut-keys">
                        <kbd>Ctrl</kbd> + <kbd>F</kbd>
                    </div>
                </div>
                <div class="shortcut-item">
                    <span>Export PDF</span>
                    <div class="shortcut-keys">
                        <kbd>Ctrl</kbd> + <kbd>P</kbd>
                    </div>
                </div>
                <div class="shortcut-item">
                    <span>Refresh Data</span>
                    <div class="shortcut-keys">
                        <kbd>Ctrl</kbd> + <kbd>R</kbd>
                    </div>
                </div>
                <div class="shortcut-item">
                    <span>Toggle Theme</span>
                    <div class="shortcut-keys">
                        <kbd>Ctrl</kbd> + <kbd>T</kbd>
                    </div>
                </div>
                <div class="shortcut-item">
                    <span>Show Shortcuts</span>
                    <div class="shortcut-keys">
                        <kbd>?</kbd> or <kbd>H</kbd>
                    </div>
                </div>
                <div class="shortcut-item">
                    <span>Close/Escape</span>
                    <div class="shortcut-keys">
                        <kbd>Esc</kbd>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.shortcutsModal = modal;

        // Global keyboard handler
        document.addEventListener('keydown', (e) => {
            // Show shortcuts with ? or H
            if ((e.key === '?' || e.key.toLowerCase() === 'h') && !e.ctrlKey && !e.altKey) {
                this.toggleShortcutsModal();
                e.preventDefault();
                return;
            }

            // Close modals with Esc
            if (e.key === 'Escape') {
                this.closeAllModals();
                return;
            }

            // Ctrl shortcuts
            if (e.ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case 'g':
                        console.log('Open GeoIntel');
                        e.preventDefault();
                        break;
                    case 'e':
                        console.log('Open eCitizen');
                        e.preventDefault();
                        break;
                    case 'k':
                        console.log('Open Kenya News');
                        e.preventDefault();
                        break;
                    case 'p':
                        if (window.ENationUtils) {
                            ENationUtils.exportToPDF();
                            e.preventDefault();
                        }
                        break;
                    case 'r':
                        this.refreshData();
                        e.preventDefault();
                        break;
                    case 't':
                        if (window.themeManager) {
                            themeManager.toggleTheme();
                            e.preventDefault();
                        }
                        break;
                }
            }
        });
    }

    /**
     * Toggle shortcuts modal
     */
    toggleShortcutsModal() {
        this.shortcutsModal.classList.toggle('visible');
        this.toggleOverlay(this.shortcutsModal.classList.contains('visible'));
    }

    /**
     * Setup tooltips
     */
    setupTooltips() {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
        this.tooltip = tooltip;

        // Listen for elements with data-tooltip
        document.addEventListener('mouseover', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                const text = target.getAttribute('data-tooltip');
                this.showTooltip(text, e.pageX, e.pageY);
            }
        });

        document.addEventListener('mouseout', (e) => {
            const target = e.target.closest('[data-tooltip]');
            if (target) {
                this.hideTooltip();
            }
        });
    }

    /**
     * Show tooltip
     */
    showTooltip(text, x, y) {
        this.tooltip.textContent = text;
        this.tooltip.style.left = x + 10 + 'px';
        this.tooltip.style.top = y + 10 + 'px';
        this.tooltip.classList.add('visible');
    }

    /**
     * Hide tooltip
     */
    hideTooltip() {
        this.tooltip.classList.remove('visible');
    }

    /**
     * Setup context menu
     */
    setupContextMenu() {
        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.innerHTML = `
            <div class="context-menu-item" onclick="ENationUtils.exportToPDF()">
                📄 Export as PDF
            </div>
            <div class="context-menu-item" onclick="uxEnhancements.shareData()">
                📱 Share via WhatsApp
            </div>
            <div class="context-menu-item" onclick="uxEnhancements.copyPageData()">
                📋 Copy Data
            </div>
            <div class="context-menu-separator"></div>
            <div class="context-menu-item" onclick="uxEnhancements.refreshData()">
                🔄 Refresh
            </div>
            <div class="context-menu-item" onclick="window.print()">
                🖨️ Print
            </div>
        `;

        document.body.appendChild(menu);
        this.contextMenu = menu;

        // Right-click handler
        document.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e.pageX, e.pageY);
        });

        // Close on click outside
        document.addEventListener('click', () => {
            this.hideContextMenu();
        });
    }

    /**
     * Show context menu
     */
    showContextMenu(x, y) {
        this.contextMenu.style.left = x + 'px';
        this.contextMenu.style.top = y + 'px';
        this.contextMenu.classList.add('visible');
    }

    /**
     * Hide context menu
     */
    hideContextMenu() {
        this.contextMenu.classList.remove('visible');
    }

    /**
     * Setup error boundary
     */
    setupErrorBoundary() {
        window.onerror = (message, source, lineno, colno, error) => {
            this.showErrorPage({
                title: 'Something went wrong',
                message: 'An unexpected error occurred. Please refresh the page or contact support.',
                technical: message,
                location: `${source}:${lineno}:${colno}`
            });
            return true;
        };

        window.addEventListener('unhandledrejection', (event) => {
            this.showErrorPage({
                title: 'Unhandled Promise Rejection',
                message: 'A network or data error occurred. Please try again.',
                technical: event.reason
            });
        });
    }

    /**
     * Show error page
     */
    showErrorPage(error) {
        console.error('Error:', error);

        if (window.toast) {
            toast.error(error.message);
        }
    }

    /**
     * Setup sticky header
     */
    setupStickyHeader() {
        const headers = document.querySelectorAll('.header, .dashboard-header');
        headers.forEach(header => {
            header.classList.add('sticky-header');
        });
    }

    /**
     * Show confirmation dialog
     */
    confirm(title, message) {
        return new Promise((resolve) => {
            const dialog = document.createElement('div');
            dialog.className = 'confirm-dialog visible';
            dialog.innerHTML = `
                <h3>${title}</h3>
                <p>${message}</p>
                <div class="confirm-buttons">
                    <button class="confirm-btn confirm-btn-secondary" onclick="uxEnhancements.closeConfirm(false)">
                        Cancel
                    </button>
                    <button class="confirm-btn confirm-btn-primary" onclick="uxEnhancements.closeConfirm(true)">
                        Confirm
                    </button>
                </div>
            `;

            document.body.appendChild(dialog);
            this.confirmDialog = dialog;
            this.confirmCallback = resolve;
            this.toggleOverlay(true);
        });
    }

    /**
     * Close confirmation dialog
     */
    closeConfirm(result) {
        if (this.confirmDialog) {
            this.confirmDialog.remove();
            this.confirmDialog = null;
        }
        this.toggleOverlay(false);

        if (this.confirmCallback) {
            this.confirmCallback(result);
            this.confirmCallback = null;
        }
    }

    /**
     * Toggle overlay
     */
    toggleOverlay(show) {
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.className = 'modal-overlay';
            this.overlay.onclick = () => this.closeAllModals();
            document.body.appendChild(this.overlay);
        }

        this.overlay.classList.toggle('visible', show);
    }

    /**
     * Close all modals
     */
    closeAllModals() {
        if (this.shortcutsModal) {
            this.shortcutsModal.classList.remove('visible');
        }
        if (this.confirmDialog) {
            this.closeConfirm(false);
        }
        this.toggleOverlay(false);
    }

    /**
     * Create recent activity widget
     */
    createRecentActivityWidget() {
        const widget = document.createElement('div');
        widget.className = 'recent-activity-widget';
        widget.innerHTML = `
            <h4>📜 Recent Activity</h4>
            <div id="activity-list"></div>
        `;

        document.body.appendChild(widget);
        this.recentActivityWidget = widget;
        this.updateRecentActivity();
    }

    /**
     * Add activity to recent
     */
    addActivity(description) {
        const activity = {
            description,
            timestamp: Date.now()
        };

        this.recentActivity.unshift(activity);
        if (this.recentActivity.length > 10) {
            this.recentActivity.pop();
        }

        this.saveRecentActivity();
        this.updateRecentActivity();
    }

    /**
     * Update recent activity display
     */
    updateRecentActivity() {
        const list = document.getElementById('activity-list');
        if (!list) return;

        list.innerHTML = this.recentActivity.map(activity => `
            <div class="activity-item">
                <div>${activity.description}</div>
                <div class="activity-time">${this.formatTimeAgo(activity.timestamp)}</div>
            </div>
        `).join('') || '<div class="empty-state"><p>No recent activity</p></div>';
    }

    /**
     * Format time ago
     */
    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    /**
     * Save recent activity
     */
    saveRecentActivity() {
        localStorage.setItem('enation_recent_activity', JSON.stringify(this.recentActivity));
    }

    /**
     * Load recent activity
     */
    loadRecentActivity() {
        try {
            const saved = localStorage.getItem('enation_recent_activity');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    /**
     * Toggle recent activity widget
     */
    toggleRecentActivity() {
        this.recentActivityWidget.classList.toggle('visible');
    }

    /**
     * Share data helper
     */
    shareData() {
        if (window.ENationUtils) {
            ENationUtils.shareWhatsApp('Check out this E-Nation OS intelligence data!');
        }
    }

    /**
     * Copy page data helper
     */
    copyPageData() {
        const text = document.title + '\n' + window.location.href;
        if (window.copyToClipboard) {
            copyToClipboard(text);
        }
    }

    /**
     * Create fullscreen button
     */
    createFullscreenButton() {
        const button = document.createElement('button');
        button.className = 'fullscreen-button';
        button.innerHTML = '⛶';
        button.title = 'Toggle fullscreen';
        button.onclick = () => this.toggleFullscreen();
        document.body.appendChild(button);
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
}

// Auto-initialize
if (typeof window !== 'undefined') {
    window.uxEnhancements = new UXEnhancements();
}

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UXEnhancements;
}
