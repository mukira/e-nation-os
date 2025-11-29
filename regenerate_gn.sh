#!/bin/bash
cd ~/chromium/src
echo "📂 Changed to source root: $(pwd)"
echo "⚙️ Regenerating build files..."
~/depot_tools/gn gen out/Release
echo "✅ Done!"
