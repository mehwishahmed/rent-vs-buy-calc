# Auto-commit script for Rent vs Buy Calculator
Write-Host "🔄 Auto-committing changes to GitHub..." -ForegroundColor Cyan

# Add all changes
git add .

# Create commit with timestamp
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Auto-commit: $timestamp"

# Push to GitHub
git push origin main

Write-Host "✅ Changes committed and pushed to GitHub!" -ForegroundColor Green
Read-Host "Press Enter to continue"
