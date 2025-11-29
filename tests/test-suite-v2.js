// Test Suite V2 - Final Feature Verification
const { VPNConnector } = require('../packages/browseros/resources/extensions/agentic-core/lib/vpn-connector.js');
const { AdBlocker } = require('../packages/browseros/resources/extensions/agentic-core/lib/ad-blocker.js');

async function runTests() {
    console.log('🧪 Starting Final Feature Tests...\n');

    // Test 1: Sovereign VPN
    console.log('🛡️  Testing Sovereign VPN...');
    const vpn = new VPNConnector();
    console.log('   Initial Status:', vpn.getStatus().status);

    console.log('   Connecting...');
    const connResult = await vpn.connect();
    if (connResult.status === 'connected' && connResult.ip !== '192.168.1.100') {
        console.log('✅ VPN Connected (IP Masked): PASS');
    } else {
        console.error('❌ VPN Connection: FAIL');
    }

    // Test 2: AI Ad Blocker
    console.log('\n🚫 Testing AI Ad Blocker...');
    const blocker = new AdBlocker();
    const adUrl = 'https://doubleclick.net/ads/tracker.js';
    const cleanUrl = 'https://e-nation.go.ke/portal';

    if (blocker.shouldBlock(adUrl)) {
        console.log('✅ Blocked Ad Domain: PASS');
    } else {
        console.error('❌ Failed to Block Ad: FAIL');
    }

    if (!blocker.shouldBlock(cleanUrl)) {
        console.log('✅ Allowed Clean Domain: PASS');
    } else {
        console.error('❌ Blocked Clean Domain: FAIL');
    }

    console.log('\n✨ All Final Tests Completed');
}

runTests();
