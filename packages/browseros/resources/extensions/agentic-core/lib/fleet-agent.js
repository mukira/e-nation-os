// Fleet Agent - Client-side component for Zero-Touch Deployment
// This runs on each E-Nation OS installation to receive and apply policies

export class FleetAgent {
    constructor() {
        this.adminServerUrl = 'https://fleet.e-nation.go.ke'; // Mock URL
        this.pollInterval = 5 * 60 * 1000; // 5 minutes
        this.installationId = null;
        this.currentVersion = '1.0.5';
    }

    async initialize() {
        // Check if chrome API is available (won't be in Node.js tests)
        if (typeof chrome === 'undefined' || !chrome.storage) {
            console.log('Fleet Agent: Running in test mode (no chrome API)');
            this.installationId = this.generateInstallationId();
            return;
        }

        // Get or create installation ID
        const stored = await chrome.storage.local.get(['installation_id']);
        if (stored.installation_id) {
            this.installationId = stored.installation_id;
        } else {
            this.installationId = this.generateInstallationId();
            await chrome.storage.local.set({ installation_id: this.installationId });
        }

        // Start polling for updates
        this.startPolling();

        // Report initial status
        await this.reportStatus();
    }

    generateInstallationId() {
        return 'ENO-' + Math.random().toString(36).substring(2, 10).toUpperCase();
    }

    startPolling() {
        // Check for updates every 5 minutes
        setInterval(() => {
            this.checkForUpdates();
        }, this.pollInterval);

        // Initial check
        this.checkForUpdates();
    }

    async checkForUpdates() {
        try {
            // In production, this would fetch from admin server
            // For now, simulate with localStorage
            const policies = await this.fetchPolicies();

            if (policies && policies.length > 0) {
                await this.applyPolicies(policies);
            }
        } catch (error) {
            console.error('Fleet Agent: Error checking for updates', error);
        }
    }

    async fetchPolicies() {
        // Mock: In production, this would be:
        // const response = await fetch(`${this.adminServerUrl}/api/policies/${this.installationId}`);
        // return await response.json();

        // For demo, check localStorage for pending policies
        const stored = await chrome.storage.local.get(['pending_policies']);
        return stored.pending_policies || [];
    }

    async applyPolicies(policies) {
        console.log('Fleet Agent: Applying policies', policies);

        for (const policy of policies) {
            try {
                switch (policy.type) {
                    case 'feature_toggle':
                        await this.applyFeatureToggle(policy);
                        break;
                    case 'configuration':
                        await this.applyConfiguration(policy);
                        break;
                    case 'whitelist':
                        await this.applyWhitelist(policy);
                        break;
                    case 'extension_update':
                        await this.applyExtensionUpdate(policy);
                        break;
                }

                // Mark policy as applied
                await this.markPolicyApplied(policy.id);
            } catch (error) {
                console.error(`Fleet Agent: Error applying policy ${policy.id}`, error);
                // Report failure to admin server
                await this.reportPolicyFailure(policy.id, error.message);
            }
        }
    }

    async applyFeatureToggle(policy) {
        // Toggle feature on/off
        const config = await chrome.storage.local.get(['feature_config']);
        const features = config.feature_config || {};

        features[policy.feature] = policy.enabled;

        await chrome.storage.local.set({ feature_config: features });
        console.log(`Fleet Agent: Toggled ${policy.feature} to ${policy.enabled}`);
    }

    async applyConfiguration(policy) {
        // Update configuration
        await chrome.storage.local.set({ [policy.key]: policy.value });
        console.log(`Fleet Agent: Updated config ${policy.key}`);
    }

    async applyWhitelist(policy) {
        // Update domain whitelist
        await chrome.storage.local.set({ domain_whitelist: policy.domains });
        console.log(`Fleet Agent: Updated whitelist with ${policy.domains.length} domains`);
    }

    async applyExtensionUpdate(policy) {
        // In production, this would trigger extension update
        // For demo, just log
        console.log(`Fleet Agent: Extension update available: ${policy.version}`);

        // Show notification to user
        chrome.notifications.create({
            type: 'basic',
            iconUrl: '../icons/research.png',
            title: 'E-Nation OS Update Available',
            message: `Version ${policy.version} is ready to install. Browser will restart.`,
            priority: 2
        });
    }

    async markPolicyApplied(policyId) {
        const stored = await chrome.storage.local.get(['applied_policies']);
        const applied = stored.applied_policies || [];
        applied.push({
            id: policyId,
            appliedAt: new Date().toISOString()
        });
        await chrome.storage.local.set({ applied_policies: applied });
    }

    async reportStatus() {
        // Report status to admin server
        const status = {
            installationId: this.installationId,
            version: this.currentVersion,
            status: 'online',
            timestamp: new Date().toISOString(),
            department: await this.getDepartment(),
            userAgent: navigator.userAgent
        };

        // In production:
        // await fetch(`${this.adminServerUrl}/api/status`, {
        //   method: 'POST',
        //   body: JSON.stringify(status)
        // });

        console.log('Fleet Agent: Status reported', status);
    }

    async reportPolicyFailure(policyId, error) {
        // Report failure to admin server
        console.error(`Fleet Agent: Policy ${policyId} failed: ${error}`);

        // In production, POST to admin server
    }

    async getDepartment() {
        // Get user's department from config
        const config = await chrome.storage.local.get(['user_department']);
        return config.user_department || 'Unknown';
    }
}

// Initialize fleet agent on extension load (only in browser)
if (typeof chrome !== 'undefined' && chrome.storage) {
    const fleetAgent = new FleetAgent();
    fleetAgent.initialize();
}
