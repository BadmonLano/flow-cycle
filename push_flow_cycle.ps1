# ── Push fixed index.html to flow-cycle GitHub Pages ─────────────────────────
# Run this from anywhere — it uses your existing local repo path

$REPO = "C:\Users\delan\.openclaw\workspace\bots\flow_cycle_site"
$SOURCE = "$PSScriptRoot\index.html"

# Check source file exists
if (-not (Test-Path $SOURCE)) {
    Write-Host "ERROR: index.html not found at $SOURCE" -ForegroundColor Red
    Write-Host "Make sure index.html is in the same folder as this script." -ForegroundColor Yellow
    exit 1
}

# Check repo exists
if (-not (Test-Path $REPO)) {
    Write-Host "ERROR: Repo not found at $REPO" -ForegroundColor Red
    exit 1
}

# Copy fixed index.html into repo
Write-Host "Copying fixed index.html to repo..." -ForegroundColor Cyan
Copy-Item -Path $SOURCE -Destination "$REPO\index.html" -Force

# Git add, commit, push
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
Set-Location $REPO

git add index.html
git commit -m "fix: fill missing chart data points Jan-Mar 2026, fix prediction line anchor"
git push

Write-Host ""
Write-Host "Done! Check https://badmonlano.github.io/flow-cycle/ in ~60 seconds." -ForegroundColor Green
