// Test Suite V5 - Revenue Agent Verification
const { RevenueAgent } = require('../packages/browseros/resources/extensions/agentic-core/lib/revenue-agent.js');

async function runTests() {
    console.log('🧪 Starting Revenue Agent Tests...\n');

    const revenue = new RevenueAgent();

    // Test 1: TIN Verification
    console.log('💰 Testing TIN Verification...');

    // Valid Active TIN
    const validTin = await revenue.verifyTIN('P051234567A');
    if (validTin.valid && validTin.status === 'ACTIVE') {
        console.log('✅ Valid TIN Check: PASS');
    } else {
        console.error('❌ Valid TIN Check: FAIL');
    }

    // Suspended TIN
    const suspendedTin = await revenue.verifyTIN('P059876543Z');
    if (suspendedTin.status === 'SUSPENDED') {
        console.log('✅ Suspended TIN Check: PASS');
    } else {
        console.error('❌ Suspended TIN Check: FAIL');
    }

    // Invalid Format
    const invalidTin = await revenue.verifyTIN('12345');
    if (!invalidTin.valid) {
        console.log('✅ Invalid Format Check: PASS');
    } else {
        console.error('❌ Invalid Format Check: FAIL');
    }

    // Test 2: Duty Calculation
    console.log('\n🧮 Testing Duty Calculation...');
    const value = 100000; // 100k KES
    const result = revenue.calculateDuties(value, false); // Non-excise

    console.log(`   Declared Value: ${value}`);
    console.log(`   Total Taxes: ${result.totalTaxes.toFixed(2)}`);

    // Manual Check:
    // ID (25%) = 25,000
    // VAT (16% of 125,000) = 20,000
    // IDF (3.5%) = 3,500
    // RDL (2.0%) = 2,000
    // Total = 50,500

    const expectedTax = 50500;
    // Allow small float diff
    if (Math.abs(result.totalTaxes - expectedTax) < 100) {
        console.log('✅ Tax Calculation Accuracy: PASS');
    } else {
        console.error(`❌ Tax Calculation Accuracy: FAIL (Expected ~${expectedTax}, Got ${result.totalTaxes})`);
    }

    console.log('\n✨ All Revenue Agent Tests Completed');
}

runTests();
