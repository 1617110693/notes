#!/usr/bin/env bash
set -e
export PYTHONIOENCODING=utf-8

cd "$(dirname "$0")"

echo "========================================"
echo "  Notes Blog — Management Dashboard"
echo "========================================"
echo ""

# Check for uv
if ! command -v uv &> /dev/null; then
    echo "[ERROR] uv is not installed."
    echo "Install it with: curl -LsSf https://astral.sh/uv/install.sh | sh"
    echo "Or visit: https://github.com/astral-sh/uv"
    read -p "Press Enter to exit..."
    exit 1
fi

echo "Installing dependencies (if needed)..."
uv sync --quiet 2>/dev/null

echo ""
echo "Starting management server..."
echo ""
echo "  (Close this terminal to stop the server)"
echo ""

# Use venv Python directly so closing the terminal kills the server
if [ -f ".venv/bin/python" ]; then
    ".venv/bin/python" server.py
elif [ -f ".venv/bin/python3" ]; then
    ".venv/bin/python3" server.py
else
    echo "[ERROR] Virtual environment not found. Run: uv sync"
    read -p "Press Enter to exit..."
    exit 1
fi
