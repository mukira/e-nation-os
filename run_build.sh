#!/bin/bash
set -e

# Add depot_tools to PATH
export PATH="$HOME/depot_tools:$PATH"

# Activate virtual environment and run build
cd /Users/Mukira/Downloads/BrowserOS/packages/browseros
source build_env/bin/activate
python3 build/build.py --config build/config/mvp.macos.x64.yaml --chromium-src $HOME/chromium/src --build --package
