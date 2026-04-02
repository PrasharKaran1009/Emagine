#!/usr/bin/env bash
# Exit on error
set -o errexit

# Install Python dependencies
pip install -r requirements.txt

# Compile the C++ steganography engine for Linux
# Render provides g++ in its build environment
g++ -O3 encoding/steganography.cpp -o encoding/steg
