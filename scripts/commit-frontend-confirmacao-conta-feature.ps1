#Requires -Version 5.1
<#
.SYNOPSIS
  Creates semantic commits for the account confirmation flow (recovery-style UI).

.DESCRIPTION
  Commits the confirmacao de conta feature: composable, views, routes, redirects and docs.

  Usage:

    cd C:\Users\James\Documents\programacao\glow-up-connect-app
    powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\commit-frontend-confirmacao-conta-feature.ps1

    scripts\commit-frontend-confirmacao-conta-feature.cmd

  Options:
    -DryRun      Show what would be committed without creating commits
    -SkipBuild   Skip npm run build verification after all commits
#>
[CmdletBinding()]
param(
    [switch]$DryRun,
    [switch]$SkipBuild
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

. (Join-Path $PSScriptRoot '_CommitHelpers.ps1')

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
Set-Location $RepoRoot

$gitUser = Assert-GitUserConfigured

Write-Host ""
Write-Host "Repository: $RepoRoot" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host 'DRY RUN - no commits will be created' -ForegroundColor Yellow
}

$commits = @(
    @{
        Message = 'docs: adicionar guia de confirmacao de conta no frontend'
        Paths   = @('docs/confirmacao-conta.md')
    },
    @{
        Message = 'feat(composables): adicionar useConfirmEmail para fluxo de confirmacao'
        Paths   = @('src/composables/useConfirmEmail.ts')
    },
    @{
        Message = 'feat(constants): adicionar rotas de confirmacao de email e alias legacy'
        Paths   = @('src/constants/routes.ts')
    },
    @{
        Message = 'feat(auth): adicionar views de confirmacao por codigo token e sucesso'
        Paths   = @(
            'src/views/auth/ConfirmEmailCodeView.vue',
            'src/views/auth/ConfirmEmailSuccessView.vue',
            'src/views/auth/ConfirmEmailView.vue'
        )
    },
    @{
        Message = 'feat(router): registrar rotas de confirmacao e redirects legacy'
        Paths   = @('src/router/routes/auth.routes.ts')
    },
    @{
        Message = 'feat(auth): integrar redirects de cadastro e login na confirmacao de email'
        Paths   = @(
            'src/views/auth/RegisterView.vue',
            'src/views/auth/LoginView.vue'
        )
    },
    @{
        Message = 'chore(config): documentar FrontendBaseUrl para links de confirmacao'
        Paths   = @('.env.example')
    },
    @{
        Message = 'chore(scripts): adicionar batch de commits confirmacao de conta'
        Paths   = @(
            'scripts/commit-frontend-confirmacao-conta-feature.ps1',
            'scripts/commit-frontend-confirmacao-conta-feature.cmd'
        )
    }
)

foreach ($commit in $commits) {
    New-FeatureCommit `
        -Message $commit.Message `
        -Paths $commit.Paths `
        -RepoRoot $RepoRoot `
        -GitUser $gitUser `
        -DryRun:$DryRun
}

Invoke-FrontendPostCommitChecks -DryRun:$DryRun -SkipBuild:$SkipBuild

if (-not $DryRun) {
    Write-Host ""
    Write-Host "Done. $(($commits | Measure-Object).Count) commits planned/processed." -ForegroundColor Green
    Write-Host "Verify authors:" -ForegroundColor Cyan
    git log --oneline -n 12 --format="%h %an %ae %s"
}
