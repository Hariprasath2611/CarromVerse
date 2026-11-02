#!/bin/bash
set -e
echo "Setting up CarromVerse monorepo..."
npm install
npm run build
echo "Setup complete!"

