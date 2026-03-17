#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build

# Download Chrome for Puppeteer inside the container
echo "Installing Puppeteer dependencies (Chrome for Linux)..."
npx puppeteer browsers install chrome
