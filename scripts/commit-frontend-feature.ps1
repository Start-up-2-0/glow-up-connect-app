#Requires -Version 5.1
<#
.SYNOPSIS
  Creates semantic commits for the glow-up-connect-app frontend.

.DESCRIPTION
  Run this script directly in your own PowerShell terminal (outside Cursor agent).
  Commits use ONLY your local git user.name / user.email - no Co-authored-by trailers.

  Usage (choose ONE):

    cd C:\Users\James\Documents\programacao\glow-up-connect-app
    powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\commit-frontend-feature.ps1

    scripts\commit-frontend-feature.cmd

  Do NOT double-click the .ps1 file - Windows opens it in Notepad by default.

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
        Message = 'chore(scaffold): adicionar projeto vite vue typescript'
        Paths   = @(
            'package.json',
            'package-lock.json',
            'index.html',
            'vite.config.ts',
            'tsconfig.json',
            'tsconfig.app.json',
            'tsconfig.node.json',
            'postcss.config.js',
            'eslint.config.js',
            '.prettierrc',
            '.gitignore',
            'public/'
        )
    },
    @{
        Message = 'chore(config): adicionar tailwind flowbite e env example'
        Paths   = @(
            'tailwind.config.js',
            '.env.example'
        )
    },
    @{
        Message = 'feat(styles): adicionar estilos globais e tokens de design'
        Paths   = @(
            'src/assets/main.css',
            'src/constants/designTokens.ts',
            'src/env.d.ts'
        )
    },
    @{
        Message = 'feat(types): adicionar tipos da api auth e usuario'
        Paths   = @('src/types/')
    },
    @{
        Message = 'feat(constants): adicionar rotas storage keys e erros da api'
        Paths   = @(
            'src/constants/routes.ts',
            'src/constants/storageKeys.ts',
            'src/constants/apiErrors.ts'
        )
    },
    @{
        Message = 'feat(utils): adicionar storage session sync e regras de senha'
        Paths   = @('src/utils/')
    },
    @{
        Message = 'feat(services): adicionar axios e servicos auth usuario recovery'
        Paths   = @('src/services/')
    },
    @{
        Message = 'feat(stores): adicionar stores pinia auth user app notifications'
        Paths   = @('src/stores/')
    },
    @{
        Message = 'feat(composables): adicionar composables auth api erro sessao recovery'
        Paths   = @('src/composables/')
    },
    @{
        Message = 'feat(router): adicionar rotas guards e layouts'
        Paths   = @(
            'src/router/',
            'src/layouts/'
        )
    },
    @{
        Message = 'feat(ui): adicionar componentes base layout e feedback'
        Paths   = @(
            'src/components/ui/',
            'src/components/feedback/',
            'src/components/layout/'
        )
    },
    @{
        Message = 'feat(auth): adicionar componentes compartilhados de autenticacao'
        Paths   = @(
            'src/components/auth/AuthSplashPanel.vue',
            'src/components/auth/AuthMobileBrand.vue',
            'src/components/auth/AuthPasswordToggle.vue',
            'src/components/auth/AuthAvatarUpload.vue'
        )
    },
    @{
        Message = 'feat(auth): adicionar views de login cadastro e confirmacao email'
        Paths   = @(
            'src/views/auth/LoginView.vue',
            'src/views/auth/RegisterView.vue',
            'src/views/auth/ConfirmEmailView.vue'
        )
    },
    @{
        Message = 'feat(auth): adicionar fluxo esqueci senha e componentes recovery'
        Paths   = @(
            'src/components/auth/recovery/',
            'src/views/auth/ForgotPasswordEmailView.vue',
            'src/views/auth/ForgotPasswordCodeView.vue',
            'src/views/auth/ResetPasswordView.vue',
            'src/views/auth/ResetPasswordSuccessView.vue'
        )
    },
    @{
        Message = 'feat(auth): adicionar assets visuais de login e icones'
        Paths   = @(
            'src/assets/auth/',
            'src/assets/icones/',
            'src/assets/icones_esqueceu_senha/'
        )
    },
    @{
        Message = 'feat(app): adicionar shell dashboard e pagina not found'
        Paths   = @(
            'src/App.vue',
            'src/main.ts',
            'src/views/dashboard/',
            'src/views/NotFoundView.vue'
        )
    },
    @{
        Message = 'docs: adicionar guias de integracao auth api'
        Paths   = @('docs/')
    },
    @{
        Message = 'chore(cursor): adicionar skills frontend e auth api'
        Paths   = @(
            '.cursor/skills/glow-up-connect-frontend/',
            '.cursor/skills/glow-up-connect-auth-api/'
        )
    },
    @{
        Message = 'chore(vscode): adicionar extensoes recomendadas'
        Paths   = @('.vscode/extensions.json')
    },
    @{
        Message = 'docs: atualizar readme do frontend'
        Paths   = @('README.md')
    },
    @{
        Message = 'chore(scripts): adicionar batch de commits semanticos do frontend'
        Paths   = @(
            'scripts/_CommitHelpers.ps1',
            'scripts/commit-frontend-feature.ps1',
            'scripts/commit-frontend-feature.cmd',
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
    git log --oneline -n 25 --format="%h %an %ae %s"
}
