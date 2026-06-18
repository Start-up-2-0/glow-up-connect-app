const THEME_STORAGE_KEY = 'guc_theme'

function applyTheme(): void {
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  const theme =
    saved === 'dark' || saved === 'light'
      ? saved
      : window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'

  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  }
}

applyTheme()
