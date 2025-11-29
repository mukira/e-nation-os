// Privacy-Preserving Telemetry Module
// Strictly opt-in. No PII.

export class Telemetry {
    constructor() {
        this.consented = false;
        this.installationId = null;
        this.init();
    }

    async init() {
        // Check if chrome API is available
        if (typeof chrome === 'undefined' || !chrome.storage) {
            console.log('Telemetry: Running in test mode (no chrome API)');
            this.installationId = 'TEST-' + Math.random().toString(36).substring(7);
            return;
        }

        const data = await chrome.storage.local.get(['telemetry_consent', 'installation_id']);
        this.consented = data.telemetry_consent || false;

        if (data.installation_id) {
            this.installationId = data.installation_id;
        } else {
            this.installationId = crypto.randomUUID();
            await chrome.storage.local.set({ installation_id: this.installationId });
        }
    }

    async setConsent(allowed) {
        if (typeof chrome === 'undefined' || !chrome.storage) {
            this.consented = allowed;
            return;
        }

        this.consented = allowed;
        await chrome.storage.local.set({ telemetry_consent: allowed });
        console.log(`[Telemetry] Consent set to: ${allowed}`);

        if (allowed) {
            this.logEvent('consent_granted', { timestamp: Date.now() });
        }
    }

    hasConsent() {
        return this.consented;
    }

    logEvent(eventName, eventData = {}) {
        if (!this.consented) return;

        const payload = {
            event: eventName,
            data: eventData,
            meta: {
                installId: this.installationId,
                timestamp: Date.now(),
                platform: typeof navigator !== 'undefined' ? navigator.platform : 'test',
                version: '1.0.0'
            }
        };

        // In production, this would POST to a secure endpoint
        console.log('[Telemetry] 📡 Sending Event:', payload);
    }
}
