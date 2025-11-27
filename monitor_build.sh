#!/bin/bash

# E-Nation OS Build Progress Monitor
# Run this in a separate terminal window to monitor build progress

CHROMIUM_SRC="$HOME/chromium/src"
BUILD_DIR="out/Default_arm64"
# We are now logging directly to build.log in the root
BUILD_LOG="build.log"

echo "🔨 E-Nation OS Build Monitor"
echo "================================"
echo ""

while true; do
    # Clear screen
    clear
    
    # Header
    echo "🔨 E-Nation OS Build Progress Monitor"
    echo "========================================"
    echo ""
    echo "⏰ Time: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # Check if build is running
    if pgrep -f "autoninja|siso|run_build.sh" > /dev/null 2>&1; then
        echo "📊 Status: BUILD RUNNING ✅"
        echo ""
        
        if [ -f "$BUILD_LOG" ]; then
             echo "🔧 Build Log: $BUILD_LOG"
             
             # Extract progress from the last line containing [X/Y]
             # Siso/Ninja output format: [123/456] ...
             PROGRESS_LINE=$(grep -o '\[[0-9]*\/[0-9]*\]' "$BUILD_LOG" | tail -1)
             
             if [ ! -z "$PROGRESS_LINE" ]; then
                 # Parse current and total
                 CURRENT=$(echo $PROGRESS_LINE | tr -d '[]' | cut -d'/' -f1)
                 TOTAL=$(echo $PROGRESS_LINE | tr -d '[]' | cut -d'/' -f2)
                 
                 # Calculate percentage
                 if [ "$TOTAL" -gt 0 ]; then
                     PERCENTAGE=$(echo "scale=2; ($CURRENT / $TOTAL) * 100" | bc)
                 else
                     PERCENTAGE="0.00"
                 fi
                 
                 echo "🎯 Architecture: arm64"
                 echo "📦 Completed: $CURRENT / $TOTAL targets"
                 echo "📈 Progress: $PERCENTAGE%"
                 echo ""
                 
                 # Show progress bar
                 PROGRESS_BAR_WIDTH=50
                 FILLED=$(printf "%.0f" $(echo "$PERCENTAGE / 2" | bc))
                 BAR=$(printf '%*s' "$FILLED" | tr ' ' '█')
                 EMPTY=$(printf '%*s' $((PROGRESS_BAR_WIDTH - FILLED)) | tr ' ' '░')
                 echo "[$BAR$EMPTY] $PERCENTAGE%"
                 echo ""
                 
                 echo "⬇️  Recent Output:"
                 tail -n 5 "$BUILD_LOG"
             else
                 echo "⏳ Waiting for progress data..."
                 echo "   (Build might be initializing or regenerating ninja files)"
                 echo ""
                 echo "⬇️  Recent Output:"
                 tail -n 5 "$BUILD_LOG"
             fi
             
        else
            echo "⏳ Waiting for log file..."
            echo "   ($BUILD_LOG not found yet)"
        fi
    else
        echo "📊 Status: BUILD NOT RUNNING ⏸️"
        echo ""
        echo "💡 The build process has either:"
        echo "   - Not started yet"
        echo "   - Completed"
        echo "   - Been stopped"
        
        if [ -f "$BUILD_LOG" ]; then
            echo ""
            echo "⬇️  Last Output:"
            tail -n 5 "$BUILD_LOG"
        fi
    fi
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Press Ctrl+C to stop monitoring"
    echo ""
    
    # Refresh every 1 second for "every detail"
    sleep 1
done
