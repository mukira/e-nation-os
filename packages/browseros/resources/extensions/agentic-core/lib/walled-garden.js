// Walled Garden - Domain Whitelisting System

export class WalledGarden {
    constructor() {
        this.enabled = false;
        this.whitelist = [];
        this.blockedCategories = [];
    }

    async initialize() {
        // Load whitelist from storage
        const config = await chrome.storage.local.get(['domain_whitelist', 'walled_garden_enabled', 'blocked_categories']);

        this.enabled = config.walled_garden_enabled || false;
        this.whitelist = config.domain_whitelist || this.getDefaultWhitelist();
        this.blockedCategories = config.blocked_categories || ['social-media', 'file-sharing'];

        if (this.enabled) {
            this.startEnforcement();
        }
    }

    getDefaultWhitelist() {
        return [
            // Government domains
            '*.go.ke',
            '*.ke',

            // Education
            '*.ac.ke',
            '*.edu',

            // Approved tools
            'google.com',
            '*.google.com',
            'github.com',
            '*.github.com',

            // Government services
            '*.e-citizen.go.ke',
            '*.ifmis.go.ke',
            'kra.go.ke',
            '*.kra.go.ke'
        ];
    }

    getCategoryDomains(category) {
        const categories = {
            'social-media': [
                'facebook.com', '*.facebook.com',
                'twitter.com', '*.twitter.com', 'x.com', '*.x.com',
                'instagram.com', '*.instagram.com',
                'tiktok.com', '*.tiktok.com',
                'linkedin.com', '*.linkedin.com'
            ],
            'file-sharing': [
                'dropbox.com', '*.dropbox.com',
                'drive.google.com',
                'onedrive.live.com',
                'box.com', '*.box.com',
                'we.tl', '*.we.tl'
            ],
            'personal-email': [
                'mail.google.com',
                'outlook.live.com',
                'mail.yahoo.com'
            ],
            'entertainment': [
                'youtube.com', '*.youtube.com',
                'netflix.com', '*.netflix.com',
                'spotify.com', '*.spotify.com',
                'twitch.tv', '*.twitch.tv'
            ]
        };

        return categories[category] || [];
    }

    isWhitelisted(url) {
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;

            // Check if domain matches whitelist
            for (const pattern of this.whitelist) {
                if (this.matchesPattern(hostname, pattern)) {
                    return true;
                }
            }

            // Check if domain is blocked by category
            for (const category of this.blockedCategories) {
                const blockedDomains = this.getCategoryDomains(category);
                for (const pattern of blockedDomains) {
                    if (this.matchesPattern(hostname, pattern)) {
                        return false;
                    }
                }
            }

            return false;
        } catch (error) {
            console.error('Walled Garden: Error checking URL', error);
            return true; // Default to allow on error
        }
    }

    matchesPattern(hostname, pattern) {
        // Convert wildcard pattern to regex
        if (pattern.startsWith('*.')) {
            const domain = pattern.substring(2);
            return hostname === domain || hostname.endsWith('.' + domain);
        }
        return hostname === pattern;
    }

    startEnforcement() {
        // Register web request listener
        if (chrome.webRequest) {
            chrome.webRequest.onBeforeRequest.addListener(
                (details) => {
                    if (!this.enabled) return {};

                    const url = details.url;

                    // Allow chrome:// and extension URLs
                    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
                        return {};
                    }

                    // Check whitelist
                    if (!this.isWhitelisted(url)) {
                        console.log('Walled Garden: Blocked', url);

                        // Redirect to blocked page
                        return {
                            redirectUrl: chrome.runtime.getURL('blocked.html') + '?url=' + encodeURIComponent(url)
                        };
                    }

                    return {};
                },
                { urls: ['<all_urls>'] },
                ['blocking']
            );
        }
    }

    async enable() {
        this.enabled = true;
        await chrome.storage.local.set({ walled_garden_enabled: true });
        this.startEnforcement();
    }

    async disable() {
        this.enabled = false;
        await chrome.storage.local.set({ walled_garden_enabled: false });
    }

    async addDomain(domain) {
        if (!this.whitelist.includes(domain)) {
            this.whitelist.push(domain);
            await chrome.storage.local.set({ domain_whitelist: this.whitelist });
        }
    }

    async removeDomain(domain) {
        this.whitelist = this.whitelist.filter(d => d !== domain);
        await chrome.storage.local.set({ domain_whitelist: this.whitelist });
    }

    async toggleCategory(category, blocked) {
        if (blocked && !this.blockedCategories.includes(category)) {
            this.blockedCategories.push(category);
        } else if (!blocked) {
            this.blockedCategories = this.blockedCategories.filter(c => c !== category);
        }
        await chrome.storage.local.set({ blocked_categories: this.blockedCategories });
    }
}

// Initialize on extension load (only in browser)
if (typeof chrome !== 'undefined' && chrome.storage) {
    const walledGarden = new WalledGarden();
    walledGarden.initialize();
}

export default typeof chrome !== 'undefined' ? walledGarden : WalledGarden;
