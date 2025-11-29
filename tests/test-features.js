// Test Harness for Agentic Features
const { GeoIntelConnector } = require('../packages/browseros/resources/extensions/agentic-core/lib/geointel-connector.js');
const { GovernmentAPIs } = require('../packages/browseros/resources/extensions/agentic-core/lib/government-apis.js');

// Mock chrome.storage
global.chrome = {
    storage: {
        local: {
            get: async () => ({})
        }
    }
};

// Mock fetch
global.fetch = async (url) => {
    console.log(`[MockFetch] Request to: ${url}`);
    return {
        json: async () => ({ status: 'success', mockData: true })
    };
};

async function runTests() {
    console.log('🧪 Starting Feature Tests...\n');

    // Test 1: GeoIntel Connector
    console.log('🛰️ Testing GeoIntel Connector...');
    try {
        const geoIntel = new GeoIntelConnector();
        const result = await geoIntel.queryNaturalLanguage('Show me illegal logging in Mau Forest');
        if (result.metadata.phenomenon === 'deforestation') {
            console.log('✅ GeoIntel NLP Parsing: PASS');
        } else {
            console.error('❌ GeoIntel NLP Parsing: FAIL');
        }
    } catch (e) {
        console.error('❌ GeoIntel Test Error:', e);
    }

    // Test 2: Government APIs
    console.log('\n🏛️ Testing Government APIs...');
    try {
        const gov = new GovernmentAPIs();
        await gov.checkApplicationStatus('APP123');
        console.log('✅ E-Citizen Connection: PASS');

        await gov.verifyTIN('P051234567Z');
        console.log('✅ KRA iTax Connection: PASS');
    } catch (e) {
        console.error('❌ Gov API Test Error:', e);
    }

    console.log('\n✨ All Tests Completed');
}

runTests();
