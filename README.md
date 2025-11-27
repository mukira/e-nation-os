# E-Nation OS

A custom Chromium-based browser built on the BrowserOS framework with DeepIntel® branding.

## 🚀 Features

- **Custom Branding**: DeepIntel® branded browser with custom icons
- **Optimized Build**: Built with ccache for faster compilation
- **macOS Native**: Supports Apple Silicon (ARM64) and Intel (x64)
- **Based on Chromium**: Latest Chromium features and security updates

## 📋 System Requirements

- **macOS**: 11.0 (Big Sur) or later
- **Architecture**: Apple Silicon (M1/M2/M3/M4) or Intel
- **Disk Space**: 50GB+ for building from source
- **RAM**: 8GB minimum, 16GB+ recommended

## 🛠️ Building from Source

### Prerequisites

1. Install Xcode Command Line Tools:
```bash
xcode-select --install
```

2. Install Homebrew (if not installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

3. Install ccache for faster builds:
```bash
brew install ccache
```

### Setup

1. Clone the repository:
```bash
git clone https://github.com/YOUR_USERNAME/e-nation-os.git
cd e-nation-os
```

2. Setup Chromium source:
```bash
./setup_chromium.sh
```

3. Validate build environment:
```bash
./validate_build.sh
```

### Building

**Full Build (Universal Binary):**
```bash
./run_build.sh
```

**ARM64 Only (Faster):**
Edit `packages/browseros/build/config/release.macos.yaml`:
- Change `architectures: [arm64]`
- Set `universal: false`

Then run:
```bash
./run_build.sh
```

### Monitoring Build Progress

**Progress Monitor:**
```bash
./monitor_build.sh
```

**Error Monitor (Real-time alerts):**
```bash
./monitor_build_errors.sh
```

## ⚡ Build Optimization

This project includes several optimizations:

- **ccache**: Compiler cache for 50-90% faster rebuilds
- **Build Validation**: Pre-flight checks to catch issues early
- **Error Monitoring**: Real-time error detection with desktop notifications

See [BUILD_OPTIMIZATION.md](BUILD_OPTIMIZATION.md) for details.

## 📦 Output

Built application will be located at:
```
~/chromium/src/out/Default_arm64/E-Nation OS.app
```

## 🔐 Code Signing

For development and testing, the app will be unsigned. To distribute:

1. Obtain an Apple Developer Account
2. Set signing environment variables:
```bash
export MACOS_CERTIFICATE_NAME="Developer ID Application: Your Name"
export PROD_MACOS_NOTARIZATION_APPLE_ID="your@email.com"
export PROD_MACOS_NOTARIZATION_TEAM_ID="TEAM_ID"
export PROD_MACOS_NOTARIZATION_PWD="app-specific-password"
```

## 📝 License

See [LICENSE](LICENSE) for details.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 🏢 About

Built by **DeepIntel®**

Based on [BrowserOS](https://github.com/browseros-ai/BrowserOS) and [Chromium](https://www.chromium.org/)
