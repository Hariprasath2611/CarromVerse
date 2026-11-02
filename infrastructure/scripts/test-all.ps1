Write-Host "Running typecheck across all workspaces..." -ForegroundColor Cyan
npm run typecheck

Write-Host "Running test suites across all workspaces..." -ForegroundColor Cyan
npm run test

Write-Host "All checks passed successfully!" -ForegroundColor Green

