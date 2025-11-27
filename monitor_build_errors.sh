#!/bin/bash

# E-Nation OS Build Error Monitor
# Monitors build.log in real-time and alerts on errors

BUILD_LOG="build.log"
ERROR_LOG="build_errors.log"

# Colors for terminal output
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 E-Nation OS Error Monitor"
echo "================================"
echo "Monitoring: $BUILD_LOG"
echo "Error log: $ERROR_LOG"
echo ""

# Initialize error log
echo "=== Build Error Log - $(date) ===" > "$ERROR_LOG"

# Check if build log exists
if [ ! -f "$BUILD_LOG" ]; then
    echo "❌ Error: $BUILD_LOG not found!"
    echo "Make sure the build is running with: ./run_build.sh > build.log 2>&1 &"
    exit 1
fi

# Function to send desktop notification (macOS)
send_notification() {
    local title="$1"
    local message="$2"
    osascript -e "display notification \"$message\" with title \"$title\" sound name \"Basso\""
}

# Function to check for errors
check_errors() {
    local line="$1"
    
    # Pattern matching for various error types
    if echo "$line" | grep -qE "(error:|FAILED:|FileNotFoundError|ImportError|ModuleNotFoundError|ninja: build stopped|ld: |cannot find|undefined reference|fatal error)"; then
        echo -e "${RED}❌ ERROR DETECTED:${NC}"
        echo "$line"
        echo ""
        
        # Log to error file
        echo "$(date '+%H:%M:%S') - $line" >> "$ERROR_LOG"
        
        # Send notification
        send_notification "Build Error Detected!" "Check terminal for details"
        
        return 0
    fi
    
    # Check for warnings (non-fatal but important)
    if echo "$line" | grep -qE "(warning:|⚠️)"; then
        echo -e "${YELLOW}⚠️  WARNING:${NC} $line"
        return 1
    fi
    
    return 1
}

# Monitor the build log
echo "📡 Monitoring for errors... (Press Ctrl+C to stop)"
echo ""

tail -f "$BUILD_LOG" | while read -r line; do
    check_errors "$line"
    
    # Check for build completion
    if echo "$line" | grep -q "Build failed:"; then
        echo ""
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${RED}🛑 BUILD FAILED${NC}"
        echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo ""
        echo "Check $ERROR_LOG for all errors"
        send_notification "Build Failed!" "See terminal for details"
        exit 1
    fi
    
    if echo "$line" | grep -qE "(✅ Build completed|Build successful)"; then
        echo ""
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}✅ BUILD SUCCESSFUL${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        send_notification "Build Successful!" "E-Nation OS build completed"
        exit 0
    fi
done
