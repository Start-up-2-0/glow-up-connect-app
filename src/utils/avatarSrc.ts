export function normalizeAvatarSrc(src?: string | null): string | null {
  if (!src) return null
  if (
    src.startsWith('data:') ||
    src.startsWith('blob:') ||
    src.startsWith('http://') ||
    src.startsWith('https://')
  ) {
    return src
  }
  return `data:image/jpeg;base64,${src}`
}

export function getAvatarInitial(name?: string | null): string {
  return name?.charAt(0)?.toUpperCase() ?? 'U'
}
