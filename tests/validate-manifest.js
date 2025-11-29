// Manifest Validator
const fs = require('fs');
const path = require('path');

console.log('🔍 Validating E-Nation OS Extension Manifest...\n');

const manifestPath = path.join(__dirname, '../packages/browseros/resources/extensions/agentic-core/manifest.json');
const extensionDir = path.join(__dirname, '../packages/browseros/resources/extensions/agentic-core');

let errors = 0;
let warnings = 0;

try {
    // 1. Load and parse manifest
    const manifestContent = fs.readFileSync(manifestPath, 'utf8');
    const manifest = JSON.parse(manifestContent);

    console.log('✅ Manifest JSON is valid');

    // 2. Check manifest version
    if (manifest.manifest_version === 3) {
        console.log('✅ Using Manifest V3');
    } else {
        console.error('❌ Invalid manifest version:', manifest.manifest_version);
        errors++;
    }

    // 3. Check required fields
    const requiredFields = ['name', 'version', 'manifest_version'];
    for (const field of requiredFields) {
        if (manifest[field]) {
            console.log(`✅ Required field '${field}': ${manifest[field]}`);
        } else {
            console.error(`❌ Missing required field: ${field}`);
            errors++;
        }
    }

    // 4. Check permissions
    console.log('\n📋 Permissions:');
    if (manifest.permissions && Array.isArray(manifest.permissions)) {
        manifest.permissions.forEach(p => console.log(`  - ${p}`));
    }

    // 5. Validate referenced files exist
    console.log('\n📁 Validating file references:');

    const filesToCheck = [
        { path: manifest.action?.default_popup, name: 'Popup HTML' },
        { path: manifest.background?.service_worker, name: 'Background Service Worker' },
        { path: manifest.chrome_url_overrides?.newtab, name: 'New Tab Page' }
    ];

    // Add content scripts
    if (manifest.content_scripts) {
        manifest.content_scripts.forEach((script, i) => {
            script.js?.forEach((js, j) => {
                filesToCheck.push({ path: js, name: `Content Script ${i}.${j}` });
            });
        });
    }

    for (const file of filesToCheck) {
        if (!file.path) continue;

        const fullPath = path.join(extensionDir, file.path);
        if (fs.existsSync(fullPath)) {
            console.log(`✅ ${file.name}: ${file.path}`);
        } else {
            console.error(`❌ Missing ${file.name}: ${file.path}`);
            errors++;
        }
    }

    // 6. Check for common issues
    console.log('\n🔧 Additional Checks:');

    // Check if background is module type
    if (manifest.background?.type === 'module') {
        console.log('✅ Background script is ES module');
    } else {
        console.warn('⚠️ Background script not set as module - imports may fail');
        warnings++;
    }

    // Check icon paths
    if (manifest.action?.default_icon) {
        Object.entries(manifest.action.default_icon).forEach(([size, iconPath]) => {
            const fullPath = path.join(extensionDir, iconPath);
            if (fs.existsSync(fullPath)) {
                console.log(`✅ Icon ${size}x${size}: exists`);
            } else {
                console.warn(`⚠️ Icon ${size}x${size}: ${iconPath} not found`);
                warnings++;
            }
        });
    }

    // 7. Check for webRequest permissions compatibility
    if (manifest.permissions?.includes('webRequestBlocking')) {
        if (!manifest.host_permissions || manifest.host_permissions.length === 0) {
            console.warn('⚠️ webRequestBlocking requires host_permissions');
            warnings++;
        } else {
            console.log('✅ webRequestBlocking has host_permissions');
        }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 VALIDATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`❌ Errors: ${errors}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log('='.repeat(50));

    if (errors === 0 && warnings === 0) {
        console.log('\n🎉 Manifest is valid and ready for production!');
        process.exit(0);
    } else if (errors === 0) {
        console.log('\n✅ Manifest is valid but has some warnings.');
        process.exit(0);
    } else {
        console.log('\n❌ Manifest has errors that must be fixed.');
        process.exit(1);
    }

} catch (error) {
    console.error('\n❌ Error validating manifest:', error.message);
    process.exit(1);
}
