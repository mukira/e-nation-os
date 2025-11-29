#!/bin/bash
# Test that E-Nation OS Extension is Properly Bundled in Browser

echo "🧪 Testing E-Nation OS Extension Integration"
echo "============================================="
echo ""

EXTENSION_DIR="/Users/Mukira/Downloads/BrowserOS/packages/browseros/resources/extensions/agentic-core"
BROWSER_RESOURCES="/Users/Mukira/Downloads/BrowserOS/packages/browseros/resources"

ERRORS=0

# 1. Check extension exists
echo "1️⃣ Checking extension directory..."
if [ ! -d "$EXTENSION_DIR" ]; then
    echo "   ❌ Extension directory not found!"
    ((ERRORS++))
else
    echo "   ✅ Extension directory exists"
fi

# 2. Check manifest.json
echo ""
echo "2️⃣ Checking manifest.json..."
if [ ! -f "$EXTENSION_DIR/manifest.json" ]; then
    echo "   ❌ manifest.json not found!"
    ((ERRORS++))
else
    echo "   ✅ manifest.json exists"
    
    # Validate it's valid JSON
    if python3 -c "import json; json.load(open('$EXTENSION_DIR/manifest.json'))" 2>/dev/null; then
        echo "   ✅ manifest.json is valid JSON"
    else
        echo "   ❌ manifest.json has syntax errors!"
        ((ERRORS++))
    fi
fi

# 3. Check all module files exist
echo ""
echo "3️⃣ Checking module files..."

REQUIRED_FILES=(
    "popup.html"
    "popup.js"
    "styles.css"
    "newtab.html"
    "newtab.js"
    "newtab.css"
    "background.js"
    "content.js"
    "lib/telemetry.js"
    "lib/police-ops.js"
    "lib/border-control.js"
    "lib/revenue-agent.js"
    "lib/fleet-agent.js"
    "lib/egov-auth.js"
    "lib/walled-garden.js"
    "lib/vpn-connector.js"
    "lib/ad-blocker.js"
    "lib/voice-agent.js"
    "signin.html"
    "signin.js"
    "signin.css"
    "blocked.html"
    "admin/dashboard.html"
    "admin/dashboard.js"
    "admin/dashboard.css"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$EXTENSION_DIR/$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ❌ MISSING: $file"
        ((ERRORS++))
    fi
done

# 4. Check icon files
echo ""
echo "4️⃣ Checking icon files..."

ICON_FILES=(
    "icons/icon16.png"
    "icons/icon48.png"
    "icons/icon128.png"
    "icons/research.png"
    "icons/geointel.png"
    "icons/gov.png"
    "icons/task.png"
    "icons/vpn.png"
    "icons/police.png"
    "icons/border.png"
    "icons/revenue.png"
)

for icon in "${ICON_FILES[@]}"; do
    if [ -f "$EXTENSION_DIR/$icon" ]; then
        echo "   ✅ $icon"
    else
        echo "   ⚠️ Missing: $icon (non-critical)"
    fi
done

# 5. Check policy files
echo ""
echo "5️⃣ Checking policy templates..."

if [ -d "$EXTENSION_DIR/policies" ]; then
    POLICY_COUNT=$(ls -1 "$EXTENSION_DIR/policies"/*.json 2>/dev/null | wc -l)
    echo "   ✅ Found $POLICY_COUNT policy templates"
else
    echo "   ⚠️ No policies directory"
fi

# 6. Check if extension will be bundled
echo ""
echo "6️⃣ Checking browser build configuration..."

if [ -f "$BROWSER_RESOURCES/extensions_manifest.json" ]; then
    echo "   ✅ Extension manifest configured"
else
    echo "   ⚠️ No extensions_manifest.json (extension may not auto-load)"
fi

# Summary
echo ""
echo "======================================"
if [ $ERRORS -eq 0 ]; then
    echo "✅ ALL CHECKS PASSED!"
    echo "======================================"
    echo ""
    echo "Extension is complete and ready to bundle."
    echo "When you build the browser, the extension will be:"
    echo "  1. Bundled into the browser resources"
    echo "  2. Auto-loaded on browser startup"
    echo "  3. Available immediately (no manual installation)"
    exit 0
else
    echo "❌ $ERRORS ERRORS FOUND"
    echo "======================================"
    echo ""
    echo "Fix the errors above before building."
    exit 1
fi
