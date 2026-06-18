const THEME_STORAGE_KEY = 'guc_theme'
const DEFAULT_THEME = 'light'

function applyTheme(): void {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  const theme =
    saved === 'dark' || saved === 'light'
      ? saved
      : DEFAULT_THEME

  document.documentElement.classList.toggle('dark', theme === 'dark')
}

applyTheme()
