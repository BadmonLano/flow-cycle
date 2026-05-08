# ═══════════════════════════════════════════════════════════════════════════
# push_flow_cycle.ps1
# Manual deployment of flow-cycle site to GitHub Pages
# ═══════════════════════════════════════════════════════════════════════════
#
# WHEN TO USE:
#   - flow_cycle.py auto-commit is paused (GITHUB_AUTO_COMMIT_PAUSED meeting override)
#   - Site shows "OFFLINE" / stale "updated Xm ago" but the bot is running
#   - You manually edited a file in the flow_cycle_site repo and want to push it
#   - You want to force a deploy without waiting for the next sweep
#   - You replaced index.html with a new version and want to push it
#
# REPO LAYOUT (matches flow_cycle.py GITHUB_LOCAL_PATH default):
#   C:\Users\delan\.openclaw\workspace\bots\flow_cycle_site\   <-- THIS IS THE REPO
#     ├── .git/
#     ├── index.html
#     └── data/
#         ├── macro.json
#         ├── invariants.json
#         ├── horse_race_scoreboard.json
#         └── ... (all v2.7 site outputs)
#
# WHAT IT DOES:
#   1. (Optional) If a fresh index.html sits in $PSScriptRoot, copies it into the repo first
#   2. cd into the repo
#   3. git status (shows what's pending)
#   4. git add . (stages all changes including new data files)
#   5. git commit -m "<auto-message based on what changed>"
#   6. git push
#   7. Reports the result
#
# Mirrors the logic in flow_cycle.py git_commit_push() but works standalone.
#
# USAGE:
#   .\push_flow_cycle.ps1
#   .\push_flow_cycle.ps1 -Message "manual push, fixed data_gaps.json"
#   .\push_flow_cycle.ps1 -DryRun                      # show what would push, don't actually push
#   .\push_flow_cycle.ps1 -SkipIndexCopy               # just push existing repo state, don't copy fresh index.html
#
# ═══════════════════════════════════════════════════════════════════════════

[CmdletBinding()]
param(
    [string]$Message = "",
    [switch]$DryRun,
    [switch]$SkipIndexCopy
)

# ─── CONFIG (match flow_cycle.py env vars) ─────────────────────────────────
# Default matches GITHUB_LOCAL_PATH default in flow_cycle.py line 138-139
$DefaultRepoPath = "C:\Users\delan\.openclaw\workspace\bots\flow_cycle_site"
$DefaultBranch   = "main"

# Honor env overrides if set (matches flow_cycle.py behavior)
$RepoPath = if ($env:GITHUB_LOCAL_PATH) { $env:GITHUB_LOCAL_PATH } else { $DefaultRepoPath }
$Branch   = if ($env:GITHUB_BRANCH)     { $env:GITHUB_BRANCH }     else { $DefaultBranch }

# Source for the optional fresh index.html copy (script's own folder)
$IndexSource = Join-Path $PSScriptRoot "index.html"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host " flow-cycle manual push" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Repo:    $RepoPath" -ForegroundColor Gray
Write-Host "Branch:  $Branch" -ForegroundColor Gray
Write-Host "DryRun:  $DryRun" -ForegroundColor Gray
Write-Host ""

# ─── 1. SANITY CHECK ───────────────────────────────────────────────────────
if (-not (Test-Path $RepoPath)) {
    Write-Host "[ERROR] Repo path does not exist: $RepoPath" -ForegroundColor Red
    Write-Host "        Set GITHUB_LOCAL_PATH env var or edit DefaultRepoPath in this script." -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path (Join-Path $RepoPath ".git"))) {
    Write-Host "[ERROR] $RepoPath is not a git repo (no .git dir)." -ForegroundColor Red
    exit 1
}

# Check git is available
try {
    $gitVersion = git --version
    Write-Host "[OK] $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] git is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# ─── 1b. (Optional) COPY FRESH index.html INTO REPO ────────────────────────
# If an index.html exists in the script's folder AND it's different from the
# one in the repo, copy it over before pushing. This matches your original
# workflow of editing index.html locally next to the script.
# Skip with -SkipIndexCopy if you only want to push existing repo state.

if (-not $SkipIndexCopy -and (Test-Path $IndexSource)) {
    $RepoIndex = Join-Path $RepoPath "index.html"
    $needsCopy = $true
    
    if (Test-Path $RepoIndex) {
        # Only copy if files differ (avoid noise in git status)
        $sourceHash = (Get-FileHash $IndexSource -Algorithm SHA256).Hash
        $repoHash   = (Get-FileHash $RepoIndex -Algorithm SHA256).Hash
        if ($sourceHash -eq $repoHash) {
            Write-Host "[SKIP] index.html in repo matches $IndexSource, no copy needed" -ForegroundColor Gray
            $needsCopy = $false
        }
    }
    
    if ($needsCopy) {
        Write-Host "[COPY] Copying $IndexSource -> repo" -ForegroundColor Cyan
        if (-not $DryRun) {
            Copy-Item -Path $IndexSource -Destination $RepoIndex -Force
            Write-Host "[OK] index.html updated in repo" -ForegroundColor Green
        } else {
            Write-Host "[DRY RUN] would copy index.html" -ForegroundColor Yellow
        }
    }
}

# ─── 2. ENTER REPO ─────────────────────────────────────────────────────────
$originalLocation = Get-Location
Set-Location $RepoPath

try {
    # ─── 3. STATUS ─────────────────────────────────────────────────────────
    Write-Host ""
    Write-Host "─── git status ─────────────────────────────────────────────" -ForegroundColor Cyan
    $statusOutput = git status --short
    if ([string]::IsNullOrWhiteSpace($statusOutput)) {
        Write-Host "[INFO] Working tree clean. Nothing to commit." -ForegroundColor Yellow
        Write-Host "       (If site shows stale, the issue is GitHub Pages build, not local repo.)" -ForegroundColor Yellow
        exit 0
    }
    Write-Host $statusOutput
    Write-Host ""
    
    # Count what's changing
    $changedFiles = ($statusOutput -split "`n" | Where-Object { $_.Trim() }).Count
    Write-Host "[INFO] $changedFiles file(s) changed" -ForegroundColor Green
    
    # ─── 4. STAGE ──────────────────────────────────────────────────────────
    if ($DryRun) {
        Write-Host ""
        Write-Host "─── DRY RUN, would do: ─────────────────────────────────────" -ForegroundColor Yellow
        Write-Host "  git add ." -ForegroundColor Yellow
        Write-Host "  git commit -m '<message>'" -ForegroundColor Yellow
        Write-Host "  git push" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "[DRY RUN] No changes pushed. Re-run without -DryRun to actually push." -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host ""
    Write-Host "─── git add . ─────────────────────────────────────────────" -ForegroundColor Cyan
    git add .
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] git add failed (exit $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] staged" -ForegroundColor Green
    
    # ─── 5. COMMIT ─────────────────────────────────────────────────────────
    if ([string]::IsNullOrWhiteSpace($Message)) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        # Auto-detect message based on what's changed
        if ($statusOutput -match "index\.html") {
            $Message = "manual push: site update [$timestamp]"
        } elseif ($statusOutput -match "horse_race|invariants|falsification|jordan_thesis|data_gaps|surprise_index|cycle_position|brain_disagreement|reflexivity") {
            $Message = "manual push: discovery engine output [$timestamp]"
        } elseif ($statusOutput -match "macro\.json|brain_consensus\.json|chart_history\.json") {
            $Message = "manual push: sweep data update [$timestamp]"
        } else {
            $Message = "manual push: $changedFiles files [$timestamp]"
        }
    }
    
    Write-Host ""
    Write-Host "─── git commit ────────────────────────────────────────────" -ForegroundColor Cyan
    Write-Host "Message: $Message" -ForegroundColor Gray
    git commit -m "$Message"
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] git commit failed (exit $LASTEXITCODE)" -ForegroundColor Red
        Write-Host "        Common causes: nothing staged, pre-commit hook rejection, missing user.email/name config" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "[OK] committed" -ForegroundColor Green
    
    # ─── 6. PUSH ───────────────────────────────────────────────────────────
    Write-Host ""
    Write-Host "─── git push ───────────────────────────────────────────────" -ForegroundColor Cyan
    git push
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] git push failed (exit $LASTEXITCODE)" -ForegroundColor Red
        Write-Host "        Common causes: auth not configured, branch protection, network down, wrong remote" -ForegroundColor Yellow
        Write-Host "        Try: git remote -v       (verify remote URL)" -ForegroundColor Yellow
        Write-Host "             git config user.email / user.name  (verify identity)" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host " ✓ Pushed to origin/$Branch" -ForegroundColor Green
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "GitHub Pages may take 30s-2min to rebuild and serve the new content." -ForegroundColor Gray
    Write-Host "Check: https://badmonlano.github.io/flow-cycle/" -ForegroundColor Gray
    Write-Host ""
}
finally {
    Set-Location $originalLocation
}