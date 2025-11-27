# Build Optimization Guide

## Quick Reference

### 1. Real-Time Error Monitoring ✅

**Monitor build errors as they happen:**
```bash
./monitor_build_errors.sh
```

This script:
- Detects errors instantly
- Sends desktop notifications
- Logs all errors to `build_errors.log`
- Stops wasting time on failed builds

---

### 2. Speed Up Builds with ccache

**Installation:**
```bash
brew install ccache
```

**Configuration:**
```bash
export CCACHE_DIR="$HOME/.ccache"
export CCACHE_MAXSIZE="10G"
ccache --set-config=max_size=10G
```

**Add to GN args** (`flags.macos.release.gn`):
```gn
cc_wrapper="ccache"
```

**Expected Impact:** 50-90% faster rebuilds

---

### 3. Reduce Build Scope

Instead of building everything:

```bash
# Build only Chrome (skip chromedriver)
cd $HOME/chromium/src
autoninja -C out/Default_arm64 chrome
```

**Time Saved:** ~10-15% (skips chromedriver and test targets)

---

### 4. Optimize GN Flags

Current optimizations already in place:
- `symbol_level=0` - No debug symbols (saves time & disk)
- `is_official_build=true` - Optimized release build
- `is_component_build=false` - Static linking (faster runtime)

**Additional optional flags** to add if needed:
```gn
enable_nacl=false          # Disable Native Client
enable_remoting=false      # Disable remote desktop  
treat_warnings_as_errors=false  # Don't fail on warnings
```

---

### 5. Pre-Build Validation

**Run before starting a long build:**
```bash
./validate_build.sh
```

This checks:
- Build dependencies via `gn check`
- Disk space availability
- Python environment
- Patch integrity

---

## Build Time Estimates

| Configuration | Initial Build | Rebuild (ccache) |
|--------------|--------------|------------------|
| Full (chrome + chromedriver) | 2-4 hours | 20-40 min |
| Chrome only | 1.5-3 hours | 15-30 min |
| Minimal target | 30-60 min | 5-10 min |

*Times vary based on CPU cores and system specs*

---

## Monitoring Current Build

**Progress:**
```bash
./monitor_build.sh
```

**Errors:**
```bash
./monitor_build_errors.sh
```

**Both at once:**
```bash
# Terminal 1
./monitor_build.sh

# Terminal 2  
./monitor_build_errors.sh
```
