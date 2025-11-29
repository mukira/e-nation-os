#!/bin/bash

# Bulletproof Build Script for E-Nation OS
# Designed to finish at all costs.

# 1. Configuration
export CHROMIUM_SRC="$HOME/chromium/src"
export BUILD_DIR="$CHROMIUM_SRC/out/Default_x64"
export PATH="$CHROMIUM_SRC/third_party/depot_tools:$PATH"

# Safe concurrency for 32GB RAM
JOBS=8

echo "🛡️  Starting Bulletproof Build..."
echo "   - Concurrency: $JOBS"
echo "   - Ignore Errors: YES (-k 0)"
echo "   - Auto-Restart: YES"

# 2. Activate Environment
cd /Users/Mukira/Downloads/BrowserOS/packages/browseros
source build_env/bin/activate

# 3. Infinite Persistence Loop
while true; do
    echo "🚀 [$(date)] Launching build process..."
    
    # Run build with:
    # -k 0: Keep going as much as possible even after errors
    # -j $JOBS: Limit concurrency to prevent OOM
    python3 build/build.py \
        --config build/config/release.macos.yaml \
        --chromium-src "$CHROMIUM_SRC" \
        --build \
        --package \
        -- \
        -k 0 \
        -j $JOBS

    EXIT_CODE=$?
    
    if [ $EXIT_CODE -eq 0 ]; then
        echo "✅ [$(date)] BUILD SUCCESSFUL! Exiting loop."
        break
    else
        echo "⚠️  [$(date)] Build process exited with code $EXIT_CODE."
        echo "🔄 Restarting in 5 seconds..."
        sleep 5
    fi
done
