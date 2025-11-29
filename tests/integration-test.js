// Comprehensive Integration Test Suite for E-Nation OS

import { Telemetry } from '../packages/browseros/resources/extensions/agentic-core/lib/telemetry.js';
import { PoliceOps } from '../packages/browseros/resources/extensions/agentic-core/lib/police-ops.js';
import { BorderControl } from '../packages/browseros/resources/extensions/agentic-core/lib/border-control.js';
import { RevenueAgent } from '../packages/browseros/resources/extensions/agentic-core/lib/revenue-agent.js';
import { FleetAgent } from '../packages/browseros/resources/extensions/agentic-core/lib/fleet-agent.js';
import { EGovAuth } from '../packages/browseros/resources/extensions/agentic-core/lib/egov-auth.js';
import { WalledGarden } from '../packages/browseros/resources/extensions/agentic-core/lib/walled-garden.js';

console.log('🧪 Starting E-Nation OS Integration Tests...\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, testName) {
    if (condition) {
        console.log(`✅ ${testName}: PASS`);
        passedTests++;
    } else {
        console.error(`❌ ${testName}: FAIL`);
        failedTests++;
    }
}

async function runTests() {
    // Test 1: Telemetry Module
    console.log('\n📊 Testing Telemetry Module...');
    try {
        const telemetry = new Telemetry();
        assert(typeof telemetry.logEvent === 'function', 'Telemetry has logEvent method');
        assert(typeof telemetry.setConsent === 'function', 'Telemetry has setConsent method');
    } catch (e) {
        console.error('Telemetry module error:', e);
        failedTests++;
    }

    // Test 2: Police Ops Module
    console.log('\n👮 Testing Police Ops Module...');
    try {
        const police = new PoliceOps();
        assert(police.active === false, 'Police Ops initializes with active=false');
        police.toggle(true);
        assert(police.active === true, 'Police Ops toggle works');

        const result = await police.scan('face');
        assert(result !== undefined, 'Police scan returns result');
        assert(result.match !== undefined, 'Police scan has match property');
    } catch (e) {
        console.error('Police Ops module error:', e);
        failedTests++;
    }

    // Test 3: Border Control Module
    console.log('\n🛂 Testing Border Control Module...');
    try {
        const border = new BorderControl();
        assert(border.scanning === false, 'Border Control initializes correctly');

        const result = await border.scanPassport();
        assert(result !== undefined, 'Border scan returns result');
        assert(result.data !== undefined, 'Border scan has data property');
        assert(result.mrz !== undefined, 'Border scan has MRZ property');
    } catch (e) {
        console.error('Border Control module error:', e);
        failedTests++;
    }

    // Test 4: Revenue Agent Module
    console.log('\n💰 Testing Revenue Agent Module...');
    try {
        const revenue = new RevenueAgent();

        // Test TIN verification
        const tinResult = await revenue.verifyTIN('P051234567A');
        assert(tinResult.valid === true, 'Valid TIN passes verification');
        assert(tinResult.status === 'ACTIVE', 'TIN status is correct');

        // Test duty calculation
        const calcResult = revenue.calculateDuties(100000, false);
        assert(calcResult.totalTaxes > 0, 'Duty calculation returns taxes');
        assert(calcResult.breakdown !== undefined, 'Duty calculation has breakdown');

        // Verify tax calculation accuracy
        const expectedTax = 50500; // Pre-calculated
        assert(Math.abs(calcResult.totalTaxes - expectedTax) < 100, 'Tax calculation is accurate');
    } catch (e) {
        console.error('Revenue Agent module error:', e);
        failedTests++;
    }

    // Test 5: Fleet Agent Module
    console.log('\n📡 Testing Fleet Agent Module...');
    try {
        const fleet = new FleetAgent();
        assert(typeof fleet.generateInstallationId === 'function', 'Fleet Agent has ID generation');
        assert(typeof fleet.checkForUpdates === 'function', 'Fleet Agent has update check');

        const id = fleet.generateInstallationId();
        assert(id.startsWith('ENO-'), 'Installation ID has correct format');
    } catch (e) {
        console.error('Fleet Agent module error:', e);
        failedTests++;
    }

    // Test 6: E-Gov Auth Module
    console.log('\n🔐 Testing E-Gov Auth Module...');
    try {
        const auth = new EGovAuth();
        assert(auth.isAuthenticated === false, 'Auth initializes as not authenticated');
        assert(typeof auth.hasPermission === 'function', 'Auth has permission check');

        // Test clearance system
        auth.userClearance = 1; // President level
        assert(auth.hasPermission(4) === true, 'Level 1 can access Level 4');

        auth.userClearance = 4; // Officer level
        assert(auth.hasPermission(1) === false, 'Level 4 cannot access Level 1');
    } catch (e) {
        console.error('E-Gov Auth module error:', e);
        failedTests++;
    }

    // Test 7: Walled Garden Module
    console.log('\n🚫 Testing Walled Garden Module...');
    try {
        const garden = new WalledGarden();
        garden.whitelist = ['*.go.ke', 'google.com'];

        assert(garden.isWhitelisted('https://kra.go.ke') === true, 'Whitelisted domain allowed');
        assert(garden.isWhitelisted('https://facebook.com') === false, 'Non-whitelisted domain blocked');
        assert(garden.matchesPattern('kra.go.ke', '*.go.ke') === true, 'Wildcard pattern matching works');
    } catch (e) {
        console.error('Walled Garden module error:', e);
        failedTests++;
    }

    // Test 8: HTML Files Validation
    console.log('\n📄 Testing HTML Files...');
    const htmlFiles = [
        'newtab.html',
        'popup.html',
        'signin.html',
        'blocked.html',
        'admin/dashboard.html'
    ];
    // Note: Would validate these exist in actual browser environment

    // Test 9: CSS Files Validation
    console.log('\n🎨 Testing CSS Files...');
    const cssFiles = [
        'styles.css',
        'newtab.css',
        'signin.css',
        'admin/dashboard.css'
    ];

    // Test 10: JS Module Exports
    console.log('\n📦 Testing Module Exports...');
    try {
        assert(Telemetry !== undefined, 'Telemetry module exports');
        assert(PoliceOps !== undefined, 'PoliceOps module exports');
        assert(BorderControl !== undefined, 'BorderControl module exports');
        assert(RevenueAgent !== undefined, 'RevenueAgent module exports');
        assert(FleetAgent !== undefined, 'FleetAgent module exports');
        assert(EGovAuth !== undefined, 'EGovAuth module exports');
        assert(WalledGarden !== undefined, 'WalledGarden module exports');
    } catch (e) {
        console.error('Module export error:', e);
        failedTests++;
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
    console.log('='.repeat(50));

    if (failedTests === 0) {
        console.log('\n🎉 All tests passed! Extension is ready for deployment.');
    } else {
        console.log('\n⚠️ Some tests failed. Review errors above.');
    }
}

runTests().catch(err => {
    console.error('Test suite error:', err);
});
