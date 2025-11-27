/**
 * E-Nation OS UI Utilities
 * Toast notifications, copy-to-clipboard, loading states, and more
 */

// Toast Notification System
class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .toast-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .toast {
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 12px;
                padding: 16px 20px;
                color: white;
                display: flex;
                align-items: center;
                gap: 12px;
                min-width: 300px;
                max-width: 400px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                transform: translateX(400px);
                transition: transform 0.3s ease, opacity 0.3s ease;
                opacity: 0;
            }

            .toast.show {
                transform: translateX(0);
                opacity: 1;
            }

            .toast-success {
                border-left: 4px solid #22c55e;
            }

            .toast-error {
                border-left: 4px solid #ef4444;
            }

            .toast-warning {
                border-left: 4px solid #fbbf24;
            }

            .toast-info {
                border-left: 4px solid #3b82f6;
            }

            .toast-icon {
                font-size: 1.5rem;
                flex-shrink: 0;
            }

            .toast-content {
                flex: 1;
                font-size: 0.95rem;
                line-height: 1.4;
            }

            .toast-close {
                background: none;
                border: none;
                color: rgba(255, 255, 255, 0.6);
                cursor: pointer;
                font-size: 1.2rem;
                padding: 0;
                width: 24px;
                height: 24px;
                flex-shrink: 0;
                transition: color 0.2s ease;
            }

            .toast-close:hover {
                color: white;
            }
        `;
        document.head.appendChild(style);
    }

    show(message, type = 'info', duration = 3000) {
        const icons = {
            success: '✓',
            error: '✗',
            warning: '⚠',
            info: 'ℹ'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">${message}</div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
        `;

        this.container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
        });

        // Auto-remove
        if (duration > 0) {
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }

        return toast;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// Initialize global toast manager
const toast = new ToastManager();

// Copy to Clipboard Utility
async function copyToClipboard(text, successMessage = '✓ Copied to clipboard!') {
    try {
        await navigator.clipboard.writeText(text);
        toast.success(successMessage);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        toast.error('Failed to copy to clipboard');
        return false;
    }
}

// Create copy button element
function createCopyButton(text, label = '📋 Copy') {
    const button = document.createElement('button');
    button.className = 'copy-btn';
    button.innerHTML = label;
    button.onclick = () => copyToClipboard(text);

    // Add button styles if not already added
    if (!document.getElementById('copy-btn-styles')) {
        const style = document.createElement('style');
        style.id = 'copy-btn-styles';
        style.textContent = `
            .copy-btn {
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.3);
                color: #60a5fa;
                padding: 6px 12px;
                border-radius: 6px;
                font-size: 0.85rem;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .copy-btn:hover {
                background: rgba(59, 130, 246, 0.2);
                border-color: rgba(59, 130, 246, 0.5);
                transform: translateY(-1px);
            }

            .copy-btn:active {
                transform: translateY(0);
            }
        `;
        document.head.appendChild(style);
    }

    return button;
}

// Loading Overlay System
class LoadingManager {
    constructor() {
        this.overlay = null;
        this.init();
    }

    init() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.style.display = 'none';
        this.overlay.innerHTML = `
            <div class="loading-content">
                <div class="spinner"></div>
                <div class="loading-text">Loading...</div>
            </div>
        `;
        document.body.appendChild(this.overlay);

        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                backdrop-filter: blur(4px);
            }

            .loading-content {
                background: rgba(15, 23, 42, 0.95);
                border: 1px solid rgba(59, 130, 246, 0.3);
                border-radius: 16px;
                padding: 40px;
                text-align: center;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
            }

            .spinner {
                width: 60px;
                height: 60px;
                border: 4px solid rgba(59, 130, 246, 0.2);
                border-top-color: #3b82f6;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                margin: 0 auto 20px;
            }

            @keyframes spin {
                to { transform: rotate(360deg); }
            }

            .loading-text {
                color: white;
                font-size: 1.1rem;
                font-weight: 500;
            }
        `;
        document.head.appendChild(style);
    }

    show(message = 'Loading...') {
        this.overlay.querySelector('.loading-text').textContent = message;
        this.overlay.style.display = 'flex';
    }

    hide() {
        this.overlay.style.display = 'none';
    }

    async wrap(promise, message = 'Loading...') {
        this.show(message);
        try {
            const result = await promise;
            this.hide();
            return result;
        } catch (error) {
            this.hide();
            throw error;
        }
    }
}

const loading = new LoadingManager();

// Export to PDF (using browser print)
function exportToPDF(title = 'E-Nation OS Report') {
    // Set document title for PDF
    const originalTitle = document.title;
    document.title = title;

    // Add print styles if not already added
    if (!document.getElementById('print-styles')) {
        const style = document.createElement('style');
        style.id = 'print-styles';
        style.textContent = `
            @media print {
                .no-print, .header-controls, .sidebar, .navigation, 
                .toast-container, .loading-overlay, .copy-btn {
                    display: none !important;
                }

                body {
                    background: white !important;
                    color: black !important;
                }

                .main-container {
                    display: block !important;
                }

                .map-container, .content-area {
                    width: 100% !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Trigger print
    window.print();

    // Restore title
    document.title = originalTitle;

    toast.success('📄 PDF export initiated');
}

// Share via WhatsApp
function shareWhatsApp(text, url = window.location.href) {
    const message = encodeURIComponent(`${text}\n\n${url}`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast.success('📱 Opening WhatsApp...');
}

// Quick Stats Widget
class QuickStatsWidget {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container ${containerId} not found`);
            return;
        }
        this.init();
    }

    init() {
        this.container.className = 'quick-stats-widget';

        const style = document.createElement('style');
        style.textContent = `
            .quick-stats-widget {
                display: flex;
                gap: 16px;
                padding: 12px 20px;
                background: rgba(15, 23, 42, 0.8);
                border-bottom: 1px solid rgba(59, 130, 246, 0.2);
                overflow-x: auto;
            }

            .quick-stat {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 16px;
                background: rgba(59, 130, 246, 0.1);
                border: 1px solid rgba(59, 130, 246, 0.2);
                border-radius: 8px;
                white-space: nowrap;
                transition: all 0.2s ease;
            }

            .quick-stat:hover {
                background: rgba(59, 130, 246, 0.15);
                transform: translateY(-1px);
            }

            .quick-stat-icon {
                font-size: 1.5rem;
            }

            .quick-stat-content {
                display: flex;
                flex-direction: column;
            }

            .quick-stat-value {
                font-size: 1.1rem;
                font-weight: 700;
                color: #60a5fa;
            }

            .quick-stat-label {
                font-size: 0.75rem;
                opacity: 0.7;
            }

            .quick-stat-trend {
                font-size: 0.7rem;
                margin-top: 2px;
            }

            .trend-up {
                color: #22c55e;
            }

            .trend-down {
                color: #ef4444;
            }
        `;
        document.head.appendChild(style);
    }

    update(stats) {
        this.container.innerHTML = stats.map(stat => `
            <div class="quick-stat" ${stat.onClick ? `onclick="${stat.onClick}"` : ''} style="cursor: ${stat.onClick ? 'pointer' : 'default'}">
                <div class="quick-stat-icon">${stat.icon}</div>
                <div class="quick-stat-content">
                    <div class="quick-stat-value">${stat.value}</div>
                    <div class="quick-stat-label">${stat.label}</div>
                    ${stat.trend ? `<div class="quick-stat-trend ${stat.trend > 0 ? 'trend-up' : 'trend-down'}">
                        ${stat.trend > 0 ? '↗' : '↘'} ${Math.abs(stat.trend)}%
                    </div>` : ''}
                </div>
            </div>
        `).join('');
    }
}

// Data Freshness Indicator
function createFreshnessIndicator(timestamp) {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    let status, color, text;
    if (hours < 1) {
        status = 'fresh';
        color = '#22c55e';
        text = 'Just updated';
    } else if (hours < 24) {
        status = 'recent';
        color = '#3b82f6';
        text = `${hours}h ago`;
    } else if (hours < 48) {
        status = 'stale';
        color = '#fbbf24';
        text = '1-2 days old';
    } else {
        status = 'old';
        color = '#ef4444';
        text = `${Math.floor(hours / 24)}d ago`;
    }

    return {
        html: `<span class="freshness-indicator" style="color: ${color}; font-size: 0.8rem;">
            ● ${text}
        </span>`,
        status,
        color,
        text
    };
}

// Utility Functions
const utils = {
    toast,
    copyToClipboard,
    createCopyButton,
    loading,
    exportToPDF,
    shareWhatsApp,
    QuickStatsWidget,
    createFreshnessIndicator,

    // Format currency
    formatCurrency(amount) {
        if (amount >= 1000000000) {
            return `KES ${(amount / 1000000000).toFixed(1)}B`;
        } else if (amount >= 1000000) {
            return `KES ${(amount / 1000000).toFixed(1)}M`;
        } else if (amount >= 1000) {
            return `KES ${(amount / 1000).toFixed(0)}K`;
        }
        return `KES ${amount.toLocaleString()}`;
    },

    // Format time ago
    timeAgo(timestamp) {
        const now = Date.now();
        const diff = now - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    },

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
} else {
    window.ENationUtils = utils;
}

console.log('✓ E-Nation OS UI Utilities loaded');
