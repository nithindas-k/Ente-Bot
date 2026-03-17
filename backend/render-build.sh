#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build
mkdir -p dist/data
cp src/data/manglish_dictionary.txt dist/data/manglish_dictionary.txt

# Download Chrome for Puppeteer inside the container
echo "Installing Puppeteer dependencies (Chrome for Linux)..."
export PUPPETEER_CACHE_DIR="$PWD/.cache/puppeteer"
npx puppeteer browsers install chrome
