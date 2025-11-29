// E-Gov Authentication Module

export class EGovAuth {
    constructor() {
        this.isAuthenticated = false;
        this.userClearance = null;
        this.userEmail = null;
    }

    async initialize() {
        // Check if chrome API is available
        if (typeof chrome === 'undefined' || !chrome.storage) {
            console.log('E-Gov Auth: Running in test mode (no chrome API)');
            return false;
        }

        // Check if user has active session
        const session = await this.getSession();
        if (session && session.user_authenticated) {
            this.isAuthenticated = true;
            this.userClearance = session.user_clearance;
            this.userEmail = session.user_email;
            return true;
        }
        return false;
    }

    async promptSignIn() {
        // Open sign-in page in new tab
        chrome.tabs.create({
            url: chrome.runtime.getURL('signin.html'),
            active: true
        });
    }

    async getSession() {
        return await chrome.storage.local.get([
            'user_authenticated',
            'user_email',
            'user_clearance',
            'user_permissions',
            'session_started'
        ]);
    }

    async signOut() {
        await chrome.storage.local.remove([
            'user_authenticated',
            'user_email',
            'user_clearance',
            'user_permissions',
            'session_started'
        ]);

        this.isAuthenticated = false;
        this.userClearance = null;
        this.userEmail = null;
    }

    hasPermission(requiredClearance) {
        // Lower number = higher clearance
        // Level 1 (President) can access everything
        // Level 4 (Officer) can only access their level
        return this.userClearance <= requiredClearance;
    }

    getClearanceName() {
        const names = {
            1: 'Presidential Access',
            2: 'Cabinet-Level Access',
            3: 'Directorate Access',
            4: 'Officer Access'
        };
        return names[this.userClearance] || 'Unknown';
    }
}

// Initialize on extension load (only in browser)
if (typeof chrome !== 'undefined' && chrome.storage) {
    const egovAuth = new EGovAuth();
    egovAuth.initialize().then(authenticated => {
        if (!authenticated) {
            console.log('E-Gov Auth: User not authenticated');
            // In production, would prompt sign-in here
        } else {
            console.log(`E-Gov Auth: User authenticated with ${egovAuth.getClearanceName()}`);
        }
    });
}

export default typeof chrome !== 'undefined' ? egovAuth : EGovAuth;
