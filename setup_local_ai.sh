#!/bin/bash
# Setup Local AI (Ollama) for E-Nation OS

echo "🧠 Setting up Local Sovereign AI..."

# 1. Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "⬇️  Downloading Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "✅ Ollama is already installed."
fi

# 2. Start Ollama Server
echo "🚀 Starting AI Server..."
ollama serve &
PID=$!
sleep 5

# 3. Pull Llama 3 Model (Sovereign Base)
echo "📥 Downloading Llama 3 (8GB) - This may take a while..."
ollama pull llama3

echo "✅ Setup Complete!"
echo "   - Model: Llama 3"
echo "   - Endpoint: http://localhost:11434"
echo "   - Status: Ready for E-Nation OS"

# Keep server running or exit based on usage
# kill $PID
