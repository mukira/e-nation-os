#!/bin/bash

# High-Precision Build Monitor for E-Nation OS
# Monitors siso build progress with 3 decimal point accuracy

BUILD_DIR="/Users/Mukira/chromium/src/out/Default_arm64"
METRICS_FILE="$BUILD_DIR/siso_metrics.json"
TOTAL_TARGETS=102493  # From previous build attempt

clear

echo "🔨 E-Nation OS High-Precision Build Monitor"
echo "=============================================="
echo ""

while true; do
    if [ ! -f "$METRICS_FILE" ]; then
        echo "⏳ Waiting for build to start..."
        sleep 2
        continue
    fi
    
    # Count completed actions from siso_metrics.json
    COMPLETED=$(wc -l < "$METRICS_FILE" 2>/dev/null || echo "0")
    
    # Calculate percentage with 3 decimal precision
    PERCENTAGE=$(awk "BEGIN {printf \"%.3f\", ($COMPLETED / $TOTAL_TARGETS) * 100}")
    
    # Calculate remaining
    REMAINING=$((TOTAL_TARGETS - COMPLETED))
    
    # Get current time
    CURRENT_TIME=$(date "+%Y-%m-%d %H:%M:%S")
    
    # Check if files are being modified (activity indicator)
    LAST_MODIFIED=$(stat -f "%Sm" -t "%H:%M:%S" "$METRICS_FILE" 2>/dev/null || echo "Unknown")
    
    # Create progress bar (50 chars wide)
    PROGRESS_WIDTH=50
    FILLED=$(awk "BEGIN {printf \"%.0f\", ($COMPLETED / $TOTAL_TARGETS) * $PROGRESS_WIDTH}")
    BAR=$(printf "█%.0s" $(seq 1 $FILLED))
    EMPTY=$(printf "░%.0s" $(seq 1 $((PROGRESS_WIDTH - FILLED))))
    
    # Clear previous output and display
    tput cup 3 0
    echo "⏰ Time: $CURRENT_TIME                    "
    echo ""
    echo "📊 Build Progress:"
    echo "   Completed: $COMPLETED / $TOTAL_TARGETS targets"
    echo "   Remaining: $REMAINING targets"
    echo "   Progress:  $PERCENTAGE%"
    echo ""
    echo "[$BAR$EMPTY] $PERCENTAGE%"
    echo ""
    echo "🔄 Last Activity: $LAST_MODIFIED"
    echo ""
    echo "Press Ctrl+C to stop monitoring"
    
    sleep 1
done
