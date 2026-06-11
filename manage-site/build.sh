#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR/../vue-sites"

echo "-- Step 1/3: copy-notes.js --"
node scripts/copy-notes.js

echo "-- Step 2/3: vite build --"
./node_modules/.bin/vite build

echo "-- Step 3/3: copy-404.js --"
node scripts/copy-404.js

echo "-- Build SUCCESS --"
