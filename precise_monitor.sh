#!/bin/bash

# Advanced High-Precision Build Monitor
# Integrates with Smart Build Agent

BUILD_DIR="/Users/Mukira/chromium/src/out/Default_x64"
METRICS_FILE="$BUILD_DIR/siso_metrics.json"
AGENT_STATUS_FILE="/Users/Mukira/Downloads/BrowserOS/agent_status.txt"
TOTAL_TARGETS=102493

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Hide cursor
tput civis

# Restore cursor on exit
trap "tput cnorm; exit" SIGINT SIGTERM

clear

echo -e "${BLUE}🔨 E-Nation OS Advanced Build Monitor${NC}"
echo "=============================================="

while true; do
    # 1. Get Agent Status
    if [ -f "$AGENT_STATUS_FILE" ]; then
        AGENT_STATUS=$(cat "$AGENT_STATUS_FILE")
    else
        AGENT_STATUS="UNKNOWN"
    fi

    # Colorize Status
    STATUS_COLOR=$NC
    if [[ "$AGENT_STATUS" == "BUILDING" || "$AGENT_STATUS" == "MONITORING" ]]; then
        STATUS_COLOR=$GREEN
    elif [[ "$AGENT_STATUS" == "STALLED" || "$AGENT_STATUS" == "CRASHED" || "$AGENT_STATUS" == "FAILED_MAX_RETRIES" ]]; then
        STATUS_COLOR=$RED
    elif [[ "$AGENT_STATUS" == "FIXING"* || "$AGENT_STATUS" == "ANALYZING"* || "$AGENT_STATUS" == "RESUMING" || "$AGENT_STATUS" == "RETRYING" ]]; then
        STATUS_COLOR=$YELLOW
    fi

    # 2. Get Build Metrics
    if [ ! -f "$METRICS_FILE" ]; then
        COMPLETED=0
        PERCENTAGE=0
    else
        COMPLETED=$(wc -l < "$METRICS_FILE" 2>/dev/null || echo "0")
        PERCENTAGE=$(awk "BEGIN {printf \"%.3f\", ($COMPLETED / $TOTAL_TARGETS) * 100}")
    fi
    
    REMAINING=$((TOTAL_TARGETS - COMPLETED))
    CURRENT_TIME=$(date "+%Y-%m-%d %H:%M:%S")
    LAST_MODIFIED=$(stat -f "%Sm" -t "%H:%M:%S" "$METRICS_FILE" 2>/dev/null || echo "Unknown")

    # 3. Progress Bar
    PROGRESS_WIDTH=50
    FILLED=$(awk "BEGIN {printf \"%.0f\", ($COMPLETED / $TOTAL_TARGETS) * $PROGRESS_WIDTH}")
    # Ensure FILLED is not negative
    if (( FILLED < 0 )); then FILLED=0; fi
    if (( FILLED > PROGRESS_WIDTH )); then FILLED=$PROGRESS_WIDTH; fi
    
    BAR=$(printf "█%.0s" $(seq 1 $FILLED))
    EMPTY=$(printf "░%.0s" $(seq 1 $((PROGRESS_WIDTH - FILLED))))

    # 4. Display - Move to line 3 (0-indexed is 2, but tput cup uses 0-indexed)
    tput cup 3 0
    echo "⏰ Time: $CURRENT_TIME                    "
    echo ""
    echo -e "🤖 Agent Status: ${STATUS_COLOR}$AGENT_STATUS${NC}          "
    echo ""
    echo "📊 Build Progress:"
    echo "   Completed: $COMPLETED / $TOTAL_TARGETS targets"
    echo "   Remaining: $REMAINING targets"
    echo "   Progress:  $PERCENTAGE%"
    echo ""
    echo -e "[${GREEN}$BAR${NC}$EMPTY] $PERCENTAGE%"
    echo ""
    echo "🔄 Last Activity: $LAST_MODIFIED"
    echo ""

    # 5. Show Error/Fix Info if relevant
    # Clear line first to remove old messages
    tput el 
    if [[ "$AGENT_STATUS" == "STALLED" || "$AGENT_STATUS" == "CRASHED" || "$AGENT_STATUS" == "FIXING"* || "$AGENT_STATUS" == "ANALYZING"* ]]; then
        echo -e "${RED}⚠️  ISSUE DETECTED${NC}"
        echo "   Smart Agent is analyzing/fixing..."
        echo "   Check 'build_smart_resume.log' for details."
    elif [[ "$AGENT_STATUS" == "BUILDING" ]]; then
        echo -e "${GREEN}✅ Build is proceeding normally${NC}"
        echo "                                             " # Clear potential old error lines
        echo "                                             "
    else
        echo "                                             "
        echo "                                             "
        echo "                                             "
    fi
    
    # Clear to end of screen to remove any artifacts from previous longer output
    tput ed

    sleep 1
done
