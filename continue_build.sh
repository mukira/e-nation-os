#!/bin/bash
set -e

# Add depot_tools to PATH
export PATH="$HOME/depot_tools:$PATH"

# Activate virtual environment and run build
cd packages/browseros
source build_env/bin/activate
python3 build/build.py --config build/config/continue.macos.yaml --chromium-src $HOME/chromium/src --build --package
