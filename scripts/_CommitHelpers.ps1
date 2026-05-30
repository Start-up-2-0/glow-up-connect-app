# Shared helpers for semantic commit batch scripts (glow-up-connect-app).

function Assert-GitUserConfigured {
    $name = git config user.name 2>$null
    $email = git config user.email 2>$null
    if ([string]::IsNullOrWhiteSpace($name) -or [string]::IsNullOrWhiteSpace($email)) {
        throw 'Configure git user.name and user.email before running this script.'
    }
    Write-Host ("Git author: {0} <{1}>" -f $name, $email) -ForegroundColor Cyan
    return @{ Name = $name; Email = $email }
}

function Assert-NoCursorCoAuthor {
    param([string]$Message)
    if ($Message -match '(?i)co-authored-by:\s*cursor') {
        throw 'Commit message contains Cursor co-author trailer. Aborting.'
    }
}

function Assert-NoForbiddenPaths {
    param([string[]]$Paths)
    foreach ($path in $Paths) {
        $normalized = $path -replace '\\', '/'
        if ($normalized -match '(?i)(^|/)node_modules(/|$)|(^|/)dist(/|$)|\.env\.local$|(^|/)\.env$') {
            throw "Forbidden path staged: $path"
        }
    }
}

function New-FeatureCommit {
    param(
        [Parameter(Mandatory)]
        [string]$Message,
        [Parameter(Mandatory)]
        [string[]]$Paths,
        [Parameter(Mandatory)]
        [string]$RepoRoot,
        [hashtable]$GitUser,
        [switch]$DryRun
    )

    Assert-NoCursorCoAuthor -Message $Message

    $existing = @()
    foreach ($path in $Paths) {
        $full = Join-Path $RepoRoot $path
        $tracked = git ls-files -- $path 2>$null
        $hasStatus = git status --porcelain -- $path 2>$null

        if ((Test-Path $full) -or $tracked -or $hasStatus) {
            $existing += $path
        }
    }

    if ($existing.Count -eq 0) {
        Write-Warning "Skip (no files): $Message"
        return
    }

    Write-Host ""
    Write-Host "==> $Message" -ForegroundColor Green
    $existing | ForEach-Object { Write-Host "    $_" -ForegroundColor DarkGray }

    if ($DryRun) {
        return
    }

    git add -- $existing
    if ($LASTEXITCODE -ne 0) { throw "git add failed for: $Message" }

    $staged = git diff --cached --name-only
    if (-not $staged) {
        Write-Warning "Nothing staged for: $Message"
        return
    }

    Assert-NoForbiddenPaths -Paths $staged

    $env:GIT_AUTHOR_NAME = $GitUser.Name
    $env:GIT_AUTHOR_EMAIL = $GitUser.Email
    $env:GIT_COMMITTER_NAME = $GitUser.Name
    $env:GIT_COMMITTER_EMAIL = $GitUser.Email

    git commit -m $Message --no-signoff
    if ($LASTEXITCODE -ne 0) { throw "git commit failed for: $Message" }

    $body = git log -1 --format=%B
    if ($body -match '(?i)co-authored-by:\s*cursor') {
        throw "Cursor co-author detected in commit '$Message'. Run: git reset --soft HEAD~1"
    }

    Write-Host "    OK $(git rev-parse --short HEAD)" -ForegroundColor Green
}

function Invoke-FrontendPostCommitChecks {
    param(
        [switch]$DryRun,
        [switch]$SkipBuild,
        [string[]]$StatusPaths = @('src/', 'docs/', 'scripts/', 'public/', 'README.md', '.cursor/')
    )

    if ($DryRun) {
        return
    }

    Write-Host ""
    Write-Host "=== Remaining uncommitted files ===" -ForegroundColor Cyan
    git status --short -- @StatusPaths | Where-Object { $_ -notmatch 'node_modules|\\dist\\|/dist/' }

    if (-not $SkipBuild) {
        Write-Host ""
        Write-Host "=== Running npm run build ===" -ForegroundColor Cyan
        npm run build
        if ($LASTEXITCODE -ne 0) { throw 'npm run build failed after commits.' }
    }
}
