#!/bin/bash
# Ultimate Bulletproof Build Script
# - Auto-fixes errors
# - Detects 5-min stalls and restarts
# - Never gives up until success

set -e

echo "🛡️ E-Nation OS - Ultimate Bulletproof Build"
echo "==========================================="
echo ""

# 1. Pre-flight validation
echo "1️⃣ Running pre-build validation..."
if ! ./validate_build.sh; then
    echo "❌ Validation failed. Fix errors above first."
    exit 1
fi

echo ""
echo "2️⃣ Setting optimal environment..."

# Add depot_tools to PATH
export PATH=$PATH:$HOME/depot_tools

# Set concurrency (safe default)
export JOBS=${JOBS:-6}
echo "   JOBS=$JOBS"

# Increase file descriptor limit
ulimit -n 10000
echo "   File descriptors: $(ulimit -n)"

# Set unlimited virtual memory
ulimit -v unlimited

echo ""
echo "3️⃣ Launching Unstoppable Build Agent..."
echo "   This will:"
echo "   ✅ Build until successful"
echo "   ✅ Auto-fix common errors"
echo "   ✅ Restart if stalled (5 min timeout)"
echo "   ✅ Retry up to 10 times"
echo ""

# Launch the unstoppable build agent
python3 unstoppable_build.py

BUILD_EXIT=$?

if [ $BUILD_EXIT -eq 0 ]; then
    echo ""
    echo "🎉🎉🎉 BUILD SUCCESSFUL! 🎉🎉🎉"
    echo ""
    echo "Your E-Nation OS browser is ready:"
    echo "  ~/chromium/src/out/Release/E-Nation OS.app"
    echo ""
    exit 0
else
    echo ""
    echo "❌ Build failed after all retries"
    echo "Check logs:"
    echo "  - build_smart_resume.log"
    echo "  - ~/chromium/src/out/Release/build.log"
    echo ""
    exit 1
fi
