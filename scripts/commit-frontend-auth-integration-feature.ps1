#Requires -Version 5.1
<#
.SYNOPSIS
  Creates semantic commits for the GLOWAPI auth integration layer (services, stores, composables).

.DESCRIPTION
  Use when committing only the auth API integration without UI changes.
  For the full frontend, prefer commit-frontend-feature.ps1.

  Usage:

    cd C:\Users\James\Documents\programacao\glow-up-connect-app
    powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\commit-frontend-auth-integration-feature.ps1

    scripts\commit-frontend-auth-integration-feature.cmd

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
        Message = 'feat(types): alinhar tipos auth api e validation problem details'
        Paths   = @(
            'src/types/api.types.ts',
            'src/types/auth.types.ts',
            'src/types/user.types.ts'
        )
    },
    @{
        Message = 'feat(constants): expandir mapa de erros da api auth'
        Paths   = @('src/constants/apiErrors.ts')
    },
    @{
        Message = 'feat(composables): adicionar resolveErrorCode e erros por campo aspnet'
        Paths   = @('src/composables/useApiError.ts')
    },
    @{
        Message = 'feat(services): adicionar recovery service e sync de sessao no refresh'
        Paths   = @(
            'src/services/recoveryService.ts',
            'src/services/api.ts',
            'src/services/index.ts',
            'src/utils/sessionSync.ts'
        )
    },
    @{
        Message = 'feat(stores): sincronizar sessao e refresh proativo no auth store'
        Paths   = @(
            'src/stores/auth.store.ts',
            'src/composables/useSessionRefresh.ts',
            'src/main.ts'
        )
    },
    @{
        Message = 'feat(composables): adicionar useForgotPassword hibrido api e mock'
        Paths   = @(
            'src/composables/useForgotPassword.ts',
            'src/composables/useForgotPasswordMock.ts',
            'src/utils/passwordRules.ts'
        )
    },
    @{
        Message = 'feat(auth): endurecer login cadastro e confirmacao email com api'
        Paths   = @(
            'src/views/auth/LoginView.vue',
            'src/views/auth/RegisterView.vue',
            'src/views/auth/ConfirmEmailView.vue',
            'src/views/auth/ResetPasswordView.vue',
            'src/views/auth/ForgotPasswordEmailView.vue',
            'src/views/auth/ForgotPasswordCodeView.vue'
        )
    },
    @{
        Message = 'docs: adicionar guias e skill de integracao auth api'
        Paths   = @(
            'docs/',
            '.cursor/skills/glow-up-connect-auth-api/',
            '.env.example'
        )
    },
    @{
        Message = 'chore(scripts): adicionar batch de commits auth integration'
        Paths   = @(
            'scripts/_CommitHelpers.ps1',
            'scripts/commit-frontend-auth-integration-feature.ps1',
            'scripts/commit-frontend-auth-integration-feature.cmd'
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
