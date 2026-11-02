#!/bin/bash
set -e
echo "Running typecheck across all workspaces..."
npm run typecheck

echo "Running test suites across all workspaces..."
npm run test

echo "All checks passed successfully!"

