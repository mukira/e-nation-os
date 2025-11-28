// AI Model Router - Intelligent model selection
export class AIModelRouter {
    constructor() {
        this.models = {
            // OpenAI
            'gpt-4': { provider: 'openai', cost: 0.03, speed: 'medium', capability: 'high' },
            'gpt-4-turbo': { provider: 'openai', cost: 0.01, speed: 'fast', capability: 'high' },

            // Google
            'gemini-ultra': { provider: 'google', cost: 0.02, speed: 'medium', capability: 'high' },
            'gemini-pro': { provider: 'google', cost: 0.005, speed: 'fast', capability: 'medium' },
            'gemini-flash': { provider: 'google', cost: 0.001, speed: 'very_fast', capability: 'medium' },

            // Anthropic
            'claude-3-opus': { provider: 'anthropic', cost: 0.015, speed: 'medium', capability: 'high' },
            'claude-3-sonnet': { provider: 'anthropic', cost: 0.003, speed: 'fast', capability: 'medium' },
            'claude-3-haiku': { provider: 'anthropic', cost: 0.0002, speed: 'very_fast', capability: 'low' },

            // Local
            'llama3.1:70b': { provider: 'local', cost: 0, speed: 'fast', capability: 'high' },
            'qwen2.5:32b': { provider: 'local', cost: 0, speed: 'fast', capability: 'medium' }
        };

        this.config = null;
        this.loadConfig();
    }

    async loadConfig() {
        // Load API keys and preferences from secure storage
        const result = await chrome.storage.local.get(['aiConfig']);
        this.config = result.aiConfig || {
            openai: { apiKey: null, enabled: false },
            google: { apiKey: null, enabled: false },
            anthropic: { apiKey: null, enabled: false },
            local: { endpoint: 'http://localhost:11434', enabled: true }
        };
    }

    async selectModel({ query, sensitivity, complexity }) {
        // Priority: Sensitivity > Cost > Speed > Capability

        // RULE 1: Classified data must use local models
        if (sensitivity === 'classified' || sensitivity === 'top_secret') {
            return this.selectLocalModel(complexity);
        }

        // RULE 2: For public data, choose based on cost-capability tradeoff
        if (complexity === 'high') {
            // High complexity: Use best available model
            if (this.config.anthropic?.enabled) return 'claude-3-opus';
            if (this.config.openai?.enabled) return 'gpt-4-turbo';
            if (this.config.google?.enabled) return 'gemini-ultra';
            return 'llama3.1:70b'; // Fallback to local
        } else if (complexity === 'medium') {
            // Medium complexity: Balance cost and speed
            if (this.config.google?.enabled) return 'gemini-pro';
            if (this.config.anthropic?.enabled) return 'claude-3-sonnet';
            return 'qwen2.5:32b';
        } else {
            // Low complexity: Optimize for speed
            if (this.config.google?.enabled) return 'gemini-flash';
            if (this.config.anthropic?.enabled) return 'claude-3-haiku';
            return 'qwen2.5:32b';
        }
    }

    selectLocalModel(complexity) {
        if (complexity === 'high') return 'llama3.1:70b';
        return 'qwen2.5:32b';
    }

    async callModel(model, messages, options = {}) {
        const modelConfig = this.models[model];

        switch (modelConfig.provider) {
            case 'openai':
                return this.callOpenAI(model, messages, options);
            case 'google':
                return this.callGemini(model, messages, options);
            case 'anthropic':
                return this.callClaude(model, messages, options);
            case 'local':
                return this.callLocal(model, messages, options);
            default:
                throw new Error(`Unknown provider: ${modelConfig.provider}`);
        }
    }

    async callOpenAI(model, messages, options) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.openai.apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 4096
            })
        });

        const data = await response.json();
        return data.choices[0].message.content;
    }

    async callGemini(model, messages, options) {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': this.config.google.apiKey
                },
                body: JSON.stringify({
                    contents: messages.map(m => ({
                        role: m.role === 'assistant' ? 'model' : 'user',
                        parts: [{ text: m.content }]
                    }))
                })
            }
        );

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    async callClaude(model, messages, options) {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': this.config.anthropic.apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model,
                messages,
                max_tokens: options.maxTokens || 4096
            })
        });

        const data = await response.json();
        return data.content[0].text;
    }

    async callLocal(model, messages, options) {
        const response = await fetch(`${this.config.local.endpoint}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model,
                messages,
                stream: false
            })
        });

        const data = await response.json();
        return data.message.content;
    }
}
