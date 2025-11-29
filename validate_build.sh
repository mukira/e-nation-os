#!/bin/bash
# Pre-Build Validation Script
# Checks all requirements before attempting build to prevent failures

set -e

echo "🔍 E-Nation OS Pre-Build Validation"
echo "===================================="
echo ""

ERRORS=0
WARNINGS=0

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

error() {
    echo -e "${RED}❌ ERROR: $1${NC}"
    ((ERRORS++))
}

warn() {
    echo -e "${YELLOW}⚠️  WARNING: $1${NC}"
    ((WARNINGS++))
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

info() {
    echo "ℹ️  $1"
}

echo "1️⃣  Checking System Resources..."
echo "================================"

# Check available disk space (need 100GB+)
AVAILABLE_SPACE=$(df -h . | awk 'NR==2 {print $4}' | sed 's/Gi//')
if [ "$AVAILABLE_SPACE" -lt 100 ]; then
    error "Insufficient disk space: ${AVAILABLE_SPACE}GB (need 100GB+)"
else
    success "Disk space: ${AVAILABLE_SPACE}GB available"
fi

# Check memory (need 8GB+)
TOTAL_MEM=$(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024}')
if [ "${TOTAL_MEM%.*}" -lt 8 ]; then
    error "Insufficient memory: ${TOTAL_MEM}GB (need 8GB+)"
else
    success "Memory: ${TOTAL_MEM%.*}GB available"
fi

# Check CPU cores
CPU_CORES=$(sysctl -n hw.ncpu)
success "CPU cores: $CPU_CORES"

echo ""
echo "2️⃣  Checking Build Tools..."
echo "============================"

# Check Xcode
if ! xcode-select -p &>/dev/null; then
    error "Xcode Command Line Tools not installed"
    info "Install with: xcode-select --install"
else
    XCODE_PATH=$(xcode-select -p)
    success "Xcode: $XCODE_PATH"
fi

# Check Python3
if ! command -v python3 &>/dev/null; then
    error "Python 3 not found"
else
    PYTHON_VERSION=$(python3 --version)
    success "$PYTHON_VERSION"
fi

# Check Git
if ! command -v git &>/dev/null; then
    error "Git not found"
else
    GIT_VERSION=$(git --version)
    success "$GIT_VERSION"
fi

# Check Node.js
if ! command -v node &>/dev/null; then
    warn "Node.js not found (optional but recommended)"
else
    NODE_VERSION=$(node --version)
    success "Node.js $NODE_VERSION"
fi

echo ""
echo "3️⃣  Checking Chromium Source..."
echo "==============================="

CHROMIUM_DIR="$HOME/chromium/src"
if [ ! -d "$CHROMIUM_DIR" ]; then
    error "Chromium source not found at $CHROMIUM_DIR"
    info "Run: ./init_chromium.sh"
else
    success "Chromium source exists"
    
    # Check if .gclient exists
    if [ ! -f "$HOME/chromium/.gclient" ]; then
        error ".gclient file missing"
    else
        success ".gclient configured"
    fi
    
    # Check depot_tools
    if ! command -v gn &>/dev/null; then
        error "depot_tools not in PATH"
        info "Add to PATH: export PATH=\$PATH:\$HOME/depot_tools"
    else
        success "depot_tools available"
    fi
fi

echo ""
echo "4️⃣  Checking Build Configuration..."
echo "==================================="

CONFIG_FILE="./packages/browseros/build/config/release.macos.yaml"
if [ ! -f "$CONFIG_FILE" ]; then
    error "Build config not found: $CONFIG_FILE"
else
    success "Build config exists"
    
    # Validate YAML syntax
    if command -v python3 &>/dev/null; then
        python3 -c "import yaml; yaml.safe_load(open('$CONFIG_FILE'))" 2>/dev/null
        if [ $? -eq 0 ]; then
            success "Build config valid YAML"
        else
            error "Build config has syntax errors"
        fi
    fi
fi

echo ""
echo "5️⃣  Checking Patches..."
echo "======================="

PATCH_DIR="./packages/browseros/patches"
if [ ! -d "$PATCH_DIR" ]; then
    warn "Patches directory not found"
else
    PATCH_COUNT=$(find "$PATCH_DIR" -name "*.patch" | wc -l | tr -d ' ')
    success "Found $PATCH_COUNT patch files"
    
    # Check if patches can be read
    for patch in "$PATCH_DIR"/*.patch; do
        if [ -f "$patch" ]; then
            if ! head -1 "$patch" &>/dev/null; then
                error "Cannot read patch: $(basename $patch)"
            fi
        fi
    done
fi

echo ""
echo "6️⃣  Checking Previous Build Failures..."
echo "======================================="

BUILD_LOG="./build.log"
if [ -f "$BUILD_LOG" ]; then
    # Check for common failure patterns
    if grep -q "FAILED:" "$BUILD_LOG"; then
        warn "Previous build had failures"
        info "Check build.log for details"
        
        # Show last failure
        LAST_FAILURE=$(grep "FAILED:" "$BUILD_LOG" | tail -1)
        info "Last failure: $LAST_FAILURE"
    fi
    
    # Check for out of memory errors
    if grep -q -i "out of memory\|cannot allocate" "$BUILD_LOG"; then
        error "Previous build ran out of memory"
        info "Consider reducing concurrency: export JOBS=4"
    fi
    
    # Check for disk space errors
    if grep -q -i "no space left\|disk full" "$BUILD_LOG"; then
        error "Previous build ran out of disk space"
    fi
fi

echo ""
echo "7️⃣  Checking Environment Variables..."
echo "====================================="

# Check JOBS setting
if [ -z "$JOBS" ]; then
    RECOMMENDED_JOBS=$((CPU_CORES / 2))
    warn "JOBS not set (will use all cores)"
    info "Recommended: export JOBS=$RECOMMENDED_JOBS"
else
    success "JOBS=$JOBS"
fi

# Check ulimit
ULIMIT=$(ulimit -n)
if [ "$ULIMIT" -lt 10000 ]; then
    warn "File descriptor limit low: $ULIMIT"
    info "Increase with: ulimit -n 10000"
else
    success "File descriptors: $ULIMIT"
fi

echo ""
echo "8️⃣  Checking Output Directory..."
echo "================================"

OUT_DIR="$CHROMIUM_DIR/out/Release"
if [ -d "$OUT_DIR" ]; then
    OUT_SIZE=$(du -sh "$OUT_DIR" | cut -f1)
    info "Existing output: $OUT_SIZE"
    
    # Check if it's a partial build
    if [ ! -f "$OUT_DIR/E-Nation OS.app/Contents/MacOS/E-Nation OS" ]; then
        warn "Previous build incomplete"
        info "Consider cleaning: rm -rf $OUT_DIR"
    fi
fi

echo ""
echo "9️⃣  Simulating Build Start..."
echo "============================="

# Check if gn can run
if command -v gn &>/dev/null && [ -d "$CHROMIUM_DIR" ]; then
    cd "$CHROMIUM_DIR"
    
    # Try generating build files (dry run)
    if gn gen out/TestValidation --args='is_debug=false is_component_build=false' &>/dev/null; then
        success "GN generation test passed"
        rm -rf out/TestValidation
    else
        error "GN generation test failed"
    fi
    
    cd - &>/dev/null
fi

echo ""
echo "🔟 System Load Check..."
echo "======================="

# Check current system load
LOAD=$(uptime | awk -F'load averages:' '{print $2}' | awk '{print $1}')
info "Current load: $LOAD"

# Check running processes
CHROME_PROCESSES=$(ps aux | grep -i chrome | grep -v grep | wc -l | tr -d ' ')
if [ "$CHROME_PROCESSES" -gt 5 ]; then
    warn "Multiple Chrome/Chromium processes running ($CHROME_PROCESSES)"
    info "Consider closing browsers before build"
fi

echo ""
echo "======================================"
echo "📊 VALIDATION SUMMARY"
echo "======================================"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Build should succeed.${NC}"
    echo ""
    echo "Recommended build command:"
    echo "  ./bulletproof_build.sh"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warnings found.${NC}"
    echo "Build may succeed but review warnings above."
    exit 0
else
    echo -e "${RED}❌ $ERRORS errors found.${NC}"
    echo -e "${YELLOW}⚠️  $WARNINGS warnings found.${NC}"
    echo ""
    echo "Fix errors before attempting build."
    exit 1
fi
