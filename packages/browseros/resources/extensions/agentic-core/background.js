// E-Nation OS Agentic Core - Background Service Worker
import { AIModelRouter } from './lib/ai-router.js';
import { AgentExecutor } from './lib/agent-executor.js';
import { ToolRegistry } from './lib/tool-registry.js';

class AgenticCore {
    constructor() {
        this.router = new AIModelRouter();
        this.executor = new AgentExecutor();
        this.tools = new ToolRegistry();
        this.initializeTools();
    }

    async initializeTools() {
        // Register all available tools
        this.tools.register('web_search', this.webSearch.bind(this));
        this.tools.register('geointel_query', this.geoIntelQuery.bind(this));
        this.tools.register('news_search', this.newsSearch.bind(this));
        this.tools.register('sentiment_analysis', this.sentimentAnalysis.bind(this));
        this.tools.register('db_query', this.databaseQuery.bind(this));

        console.log('[AgenticCore] Initialized with', this.tools.count(), 'tools');
    }

    async handleAgentRequest(request) {
        const { query, context, preferences } = request;

        // Step 1: Select appropriate AI model
        const model = await this.router.selectModel({
            query,
            sensitivity: context.classification || 'public',
            complexity: this.analyzer.estimateComplexity(query)
        });

        // Step 2: Execute agent workflow
        const result = await this.executor.run({
            model,
            query,
            tools: this.tools,
            maxSteps: 10,
            requireApproval: context.requireApproval !== false
        });

        return result;
    }

    async webSearch(params) {
        // Implement web search tool
        return { result: 'Web search results', sources: [] };
    }

    async geoIntelQuery(params) {
        // Integrate with GeoIntel APIs
        return { maps: [], analysis: {} };
    }

    async newsSearch(params) {
        // Search Kenya news sources
        return { articles: [], sentiment: 0 };
    }

    async sentimentAnalysis(params) {
        // Analyze social media sentiment
        return { score: 0, trends: [] };
    }

    async databaseQuery(params) {
        // Query government databases
        return { data: [], metadata: {} };
    }
}

// Initialize core
const core = new AgenticCore();

// Listen for messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'AGENT_REQUEST') {
        core.handleAgentRequest(request.data)
            .then(sendResponse)
            .catch(error => sendResponse({ error: error.message }));
        return true; // Keep message channel open for async response
    }
});

console.log('[E-Nation OS] Agentic Core initialized');
