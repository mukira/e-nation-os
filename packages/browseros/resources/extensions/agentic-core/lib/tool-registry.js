// Tool Registry - Manages available tools for agents
export class ToolRegistry {
    constructor() {
        this.tools = new Map();
    }

    register(name, handler) {
        this.tools.set(name, handler);
    }

    async execute(name, params) {
        if (!this.tools.has(name)) {
            throw new Error(`Tool not found: ${name}`);
        }
        const handler = this.tools.get(name);
        return await handler(params);
    }

    count() {
        return this.tools.size;
    }

    list() {
        return Array.from(this.tools.keys());
    }
}
