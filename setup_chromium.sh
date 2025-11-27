#!/bin/bash
set -e

echo "🚀 Starting Chromium Source Setup"
echo "⚠️  WARNING: This will download ~100GB of data and take several hours."
echo "⚠️  Ensure you have a stable internet connection and power."

# 1. Install depot_tools
if [ ! -d "$HOME/depot_tools" ]; then
    echo "📦 Cloning depot_tools..."
    git clone https://chromium.googlesource.com/chromium/tools/depot_tools.git "$HOME/depot_tools"
else
    echo "✅ depot_tools already exists"
fi

# Add to PATH for this session
export PATH="$HOME/depot_tools:$PATH"

# 2. Create chromium directory
mkdir -p "$HOME/chromium"
cd "$HOME/chromium"

# 3. Fetch Chromium
if [ ! -d "src" ]; then
    echo "⬇️  Fetching Chromium source (this will take a LONG time)..."
    fetch --no-history chromium
else
    echo "✅ Chromium source directory (src) already exists."
    echo "   If you want to update it, run 'git rebase-update' inside src."
fi

echo ""
echo "🎉 Setup script finished!"
echo "👉 Your Chromium source is at: $HOME/chromium/src"
echo "👉 You can now run the build command."
