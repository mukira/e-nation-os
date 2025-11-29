// Test Suite V3 - Telemetry Verification
const { Telemetry } = require('../packages/browseros/resources/extensions/agentic-core/lib/telemetry.js');

// Mock Chrome Storage
global.chrome = {
    storage: {
        local: {
            data: {},
            get: async (keys) => {
                const result = {};
                keys.forEach(k => result[k] = global.chrome.storage.local.data[k]);
                return result;
            },
            set: async (obj) => {
                Object.assign(global.chrome.storage.local.data, obj);
            }
        }
    }
};

// Mock Crypto
global.crypto = {
    randomUUID: () => 'mock-uuid-1234'
};

// Mock Navigator
global.navigator = { platform: 'MacIntel' };

async function runTests() {
    console.log('🧪 Starting Telemetry Tests...\n');

    const telemetry = new Telemetry();
    await telemetry.init();

    // Test 1: Default State (No Consent)
    console.log('🔒 Testing Default State...');
    if (telemetry.hasConsent() === false) {
        console.log('✅ Default Consent is FALSE: PASS');
    } else {
        console.error('❌ Default Consent is TRUE: FAIL');
    }

    // Test 2: Grant Consent
    console.log('\n🔓 Testing Consent Grant...');
    await telemetry.setConsent(true);
    if (telemetry.hasConsent() === true) {
        console.log('✅ Consent Granted: PASS');
    } else {
        console.error('❌ Failed to Grant Consent: FAIL');
    }

    // Test 3: Log Event
    console.log('\n📝 Testing Event Logging...');
    // Capture console.log
    let lastLog = null;
    const originalLog = console.log;
    console.log = (...args) => { lastLog = args; };

    telemetry.logEvent('test_event', { foo: 'bar' });

    // Restore console.log
    console.log = originalLog;

    if (lastLog && lastLog[1].event === 'test_event') {
        console.log('✅ Event Logged: PASS');
        console.log('   Payload:', JSON.stringify(lastLog[1]));
    } else {
        console.error('❌ Event Not Logged: FAIL');
    }

    // Test 4: Revoke Consent
    console.log('\n🚫 Testing Consent Revocation...');
    await telemetry.setConsent(false);

    lastLog = null;
    console.log = (...args) => { lastLog = args; };
    telemetry.logEvent('should_not_log');
    console.log = originalLog;

    if (lastLog === null) {
        console.log('✅ Logging Blocked after Revocation: PASS');
    } else {
        console.error('❌ Logged Event without Consent: FAIL');
    }

    console.log('\n✨ All Telemetry Tests Completed');
}

runTests();
