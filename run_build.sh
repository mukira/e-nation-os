#!/bin/bash
set -e

# Add depot_tools to PATH
export PATH="$HOME/depot_tools:$PATH"

# Activate virtual environment and run build
cd /Users/Mukira/Downloads/BrowserOS/packages/browseros
source build_env/bin/activate
# Default to 10 jobs to prevent OOM on 32GB RAM (adjust with -j flag)
JOBS=10

# Parse arguments
while getopts "j:" opt; do
  case $opt in
    j) JOBS="$OPTARG" ;;
    *) ;;
  esac
done

# Run build with specific concurrency
python3 build/build.py --config build/config/release.macos.yaml --chromium-src $HOME/chromium/src --build --package -- -j $JOBS
