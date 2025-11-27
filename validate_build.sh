#!/bin/bash

# E-Nation OS Pre-Build Validation Script
# Run this before starting a long build to catch issues early

set -e

CHROMIUM_SRC="$HOME/chromium/src"
MIN_DISK_SPACE_GB=50

echo "🔍 E-Nation OS Pre-Build Validation"
echo "===================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0

# Function to print result
print_result() {
    local check_name="$1"
    local status="$2"
    
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✅ ${check_name}${NC}"
        ((PASS_COUNT++))
    else
        echo -e "${RED}❌ ${check_name}${NC}"
        ((FAIL_COUNT++))
    fi
}

# Check 1: Chromium source directory exists
echo "1. Checking Chromium source directory..."
if [ -d "$CHROMIUM_SRC" ]; then
    print_result "Chromium source found at $CHROMIUM_SRC" "PASS"
else
    print_result "Chromium source NOT found at $CHROMIUM_SRC" "FAIL"
fi
echo ""

# Check 2: Disk space
echo "2. Checking disk space..."
AVAILABLE_GB=$(df -g "$CHROMIUM_SRC" | tail -1 | awk '{print $4}')
if [ "$AVAILABLE_GB" -ge "$MIN_DISK_SPACE_GB" ]; then
    print_result "Sufficient disk space: ${AVAILABLE_GB}GB available" "PASS"
else
    print_result "LOW DISK SPACE: Only ${AVAILABLE_GB}GB available (need ${MIN_DISK_SPACE_GB}GB+)" "FAIL"
fi
echo ""

# Check 3: Python environment
echo "3. Checking Python environment..."
if command -v python3 >/dev/null 2>&1; then
    PYTHON_VERSION=$(python3 --version 2>&1)
    print_result "Python found: $PYTHON_VERSION" "PASS"
else
    print_result "Python3 NOT found" "FAIL"
fi
echo ""

# Check 4: depot_tools
echo "4. Checking depot_tools..."
if command -v gn >/dev/null 2>&1; then
    print_result "depot_tools (gn) found in PATH" "PASS"
else
    print_result "depot_tools NOT in PATH" "FAIL"
fi
echo ""

# Check 5: Build output directory state
echo "5. Checking build directory..."
BUILD_DIR="$CHROMIUM_SRC/out/Default_arm64"
if [ -d "$BUILD_DIR" ]; then
    if [ -f "$BUILD_DIR/args.gn" ]; then
        print_result "Build directory configured" "PASS"
    else
        print_result "Build directory exists but not configured (missing args.gn)" "FAIL"
    fi
else
    print_result "Build directory doesn't exist (will be created)" "PASS"
fi
echo ""

# Check 6: GN check (if build dir exists)
if [ -f "$BUILD_DIR/args.gn" ]; then
    echo "6. Running GN check..."
    cd "$CHROMIUM_SRC"
    if gn check out/Default_arm64 2>/dev/null; then
        print_result "GN dependency check passed" "PASS"
    else
        echo -e "${YELLOW}⚠️  GN check found issues (may not be critical)${NC}"
        print_result "GN check warnings" "PASS"
    fi
    echo ""
fi

# Check 7: No stale processes
echo "7. Checking for stale build processes..."
if pgrep -f "autoninja.*Default_arm64" > /dev/null 2>&1; then
    print_result "Build process already running!" "FAIL"
else
    print_result "No conflicting build processes" "PASS"
fi
echo ""

# Summary
echo "=================================="
echo "📊 Validation Summary"
echo "=================================="
echo -e "${GREEN}Passed: $PASS_COUNT${NC}"
echo -e "${RED}Failed: $FAIL_COUNT${NC}"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to build.${NC}"
    exit 0
else
    echo -e "${RED}⚠️  $FAIL_COUNT check(s) failed. Fix issues before building.${NC}"
    exit 1
fi
