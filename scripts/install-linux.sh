#!/bin/bash
set -e

echo "============================================="
echo "  Oxevy Launcher - Auto Installer for Linux  "
echo "============================================="
echo ""

cd "$(dirname "$0")/.."

# Install Node.js 20 if missing
if ! command -v node &> /dev/null; then
    echo "[1/5] Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - 2>/dev/null
    sudo apt-get install -y nodejs 2>&1 | tail -3
    export PATH="/usr/bin:$PATH"
else
    echo "[1/5] Node.js already installed: $(node -v)"
fi

# Install dependencies
echo ""
echo "[2/5] Installing npm dependencies..."
npm install --silent 2>&1 | tail -3

# Build frontend
echo ""
echo "[3/5] Building frontend..."
npx vite build 2>&1 | tail -3

# Package for Linux
echo ""
echo "[4/5] Packaging AppImage..."
npx electron-builder --linux 2>&1 | tail -5

# Done
echo ""
echo "============================================="
echo "  ✅ Build complete!                        "
echo "============================================="
echo ""
echo "Output files:"
ls -lh dist-electron/
echo ""
echo "To run: ./dist-electron/Oxevy\ Launcher-1.0.0.AppImage"