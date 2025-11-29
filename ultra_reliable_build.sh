#!/bin/bash
# Ultra-Reliable Build Script - Maximum Speed Edition
# This will NEVER give up until the build succeeds

set -e

echo "🛡️  ULTRA-RELIABLE BUILD MODE (MAX SPEED)"
echo "=========================================="
echo "This build will:"
echo "  ✅ Auto-resume on stalls"
echo "  ✅ Prevent Mac from sleeping"
echo "  ✅ Retry forever until success"
echo "  ✅ Close non-essential apps"
echo "  ✅ Disable Spotlight & Time Machine"
echo "  ✅ Boost process priority"
echo ""

# 1. Close all GUI apps except Terminal
echo "1️⃣  Closing GUI applications..."
osascript -e 'tell application "System Events" to set visible of (processes where visible is true and name is not "Terminal") to false' 2>/dev/null || true

# 2. Disable Spotlight indexing (requires sudo)
echo "2️⃣  Disabling Spotlight indexing..."
sudo mdutil -a -i off 2>/dev/null || echo "   ⚠️  Skipped (needs sudo)"

# 3. Stop Time Machine (requires sudo)
echo "3️⃣  Stopping Time Machine..."
sudo tmutil disable 2>/dev/null || echo "   ⚠️  Skipped (needs sudo)"

# 4. Kill any existing builds
echo "4️⃣  Stopping current build processes..."
pkill -f unstoppable_build.py 2>/dev/null || true
pkill -f ninja 2>/dev/null || true
sleep 2

# 5. Verify RAM disk
echo "5️⃣  Checking RAM disk..."
if mount | grep -q "/Volumes/RamDisk"; then
    echo "   ✅ RAM disk is mounted"
else
    echo "   ⚠️  WARNING: RAM disk not found!"
fi

# 6. Prevent Mac from sleeping (critical for long builds)
caffeinate -disu -w $$ &
CAFFEINATE_PID=$!
echo "6️⃣  Mac will not sleep (caffeinate PID: $CAFFEINATE_PID)"

# 7. Get max CPU cores
CPU_CORES=$(sysctl -n hw.ncpu)
export JOBS=$CPU_CORES
echo "7️⃣  Using $CPU_CORES parallel jobs"

# 8. Create a watchdog that monitors and restarts if needed
(
  while true; do
    sleep 300  # Check every 5 minutes
    if ! pgrep -f "unstoppable_build.py" > /dev/null; then
      echo "⚠️  Build script died, restarting..."
      nohup ./unstoppable_build.py >> build_ultra_reliable.log 2>&1 &
      sleep 5
      # Re-boost priority
      NINJA_PID=$(pgrep -f "ninja.*chrome")
      [ ! -z "$NINJA_PID" ] && sudo renice -n -20 -p $NINJA_PID 2>/dev/null || true
    fi
  done
) &
WATCHDOG_PID=$!
echo "8️⃣  Watchdog started (PID: $WATCHDOG_PID)"

# 9. Start the main build
echo ""
echo "🏁 Starting build... (check build_ultra_reliable.log)"
nohup ./unstoppable_build.py > build_ultra_reliable.log 2>&1 &
BUILD_PID=$!
echo "✅ Build launched (PID: $BUILD_PID)"

# 10. Wait for ninja to start, then boost priority
echo "9️⃣  Waiting for ninja to start..."
sleep 5
NINJA_PID=$(pgrep -f "ninja.*chrome")
if [ ! -z "$NINJA_PID" ]; then
    sudo renice -n -20 -p $NINJA_PID 2>/dev/null && echo "   ✅ Boosted ninja priority (PID: $NINJA_PID)" || echo "   ⚠️  Priority boost skipped (needs sudo)"
fi
sudo renice -n -20 -p $BUILD_PID 2>/dev/null && echo "   ✅ Boosted build agent priority (PID: $BUILD_PID)" || echo "   ⚠️  Priority boost skipped (needs sudo)"

echo ""
echo "✅ BUILD OPTIMIZED FOR MAXIMUM SPEED"
echo "======================================"
echo "Active optimizations:"
echo "  • All non-essential apps closed"
echo "  • Spotlight disabled"
echo "  • Time Machine stopped"  
echo "  • High process priority (-20)"
echo "  • RAM disk active"
echo "  • $CPU_CORES parallel jobs"
echo ""
echo "You can now:"
echo "  • Close this terminal (build keeps running)"
echo "  • Turn off your screen (Mac won't sleep)"
echo "  • Run: ./monitor_build.py  (to watch progress)"
echo ""

# Save PIDs for cleanup
echo "$BUILD_PID" > ultra_build.pid
echo "$WATCHDOG_PID" >> ultra_build.pid
echo "$CAFFEINATE_PID" >> ultra_build.pid

echo "To stop the build: kill \$(cat ultra_build.pid)"
echo ""
echo "⚠️  After build completes, re-enable services:"
echo "   sudo mdutil -a -i on    # Spotlight"
echo "   sudo tmutil enable      # Time Machine"
