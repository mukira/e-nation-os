#!/bin/bash
# Clean Old Builds - Keep Only Optimized Setup

echo "🧹 E-Nation OS - Cleanup Old Builds"
echo "====================================="
echo ""

CHROMIUM_OUT="$HOME/chromium/src/out"
KEPT=0
DELETED=0
SPACE_FREED=0

# 1. Check what exists
echo "1️⃣ Scanning build directories..."
if [ -d "$CHROMIUM_OUT" ]; then
    for dir in "$CHROMIUM_OUT"/*; do
        if [ -d "$dir" ]; then
            DIR_NAME=$(basename "$dir")
            SIZE=$(du -sh "$dir" 2>/dev/null | cut -f1)
            
            if [ "$DIR_NAME" = "Release" ]; then
                echo "   ✅ KEEP: $DIR_NAME ($SIZE) - Optimized build"
                ((KEPT++))
            else
                echo "   ❌ DELETE: $DIR_NAME ($SIZE) - Old build"
                ((DELETED++))
            fi
        fi
    done
fi

echo ""
echo "2️⃣ Deleting old build directories..."

# Delete everything except Release
if [ -d "$CHROMIUM_OUT" ]; then
    for dir in "$CHROMIUM_OUT"/*; do
        DIR_NAME=$(basename "$dir")
        if [ "$DIR_NAME" != "Release" ] && [ -d "$dir" ]; then
            SIZE_BEFORE=$(du -sm "$dir" 2>/dev/null | cut -f1)
            echo "   🗑️ Deleting $DIR_NAME (${SIZE_BEFORE}MB)..."
            rm -rf "$dir"
            SPACE_FREED=$((SPACE_FREED + SIZE_BEFORE))
        fi
    done
fi

echo ""
echo "3️⃣ Cleaning ccache (optional - keeps recent builds)..."
if command -v ccache &>/dev/null; then
    echo "   Current ccache size: $(ccache -s | grep 'cache size' | head -1)"
    echo "   💡 To clean: ccache -C (clears all)"
    echo "   Keeping ccache for fast rebuilds ✅"
fi

echo ""
echo "4️⃣ Cleaning Python caches..."
find ~/chromium -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null
find ~/chromium -name "*.pyc" -delete 2>/dev/null
echo "   ✅ Cleaned Python caches"

echo ""
echo "5️⃣ Cleaning build logs..."
cd /Users/Mukira/Downloads/BrowserOS
rm -f build.log bulletproof.log build_smart_resume.log 2>/dev/null
echo "   ✅ Cleaned old logs"

echo ""
echo "======================================"
echo "🎯 CLEANUP SUMMARY"
echo "======================================"
echo ""
echo "✅ Kept:    $KEPT directory (Release)"
echo "❌ Deleted: $DELETED old directories"  
echo "💾 Space freed: ~${SPACE_FREED}MB"
echo ""
echo "Remaining optimized setup:"
echo "  ~/chromium/src/out/Release/"
echo "    ✅ args.gn (with all optimizations)"
echo "    ✅ Build files ready"
echo ""
echo "Ready to build with:"
echo "  ./build_max_speed.sh"
echo ""
