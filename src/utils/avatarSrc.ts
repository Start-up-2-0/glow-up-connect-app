export function normalizeAvatarSrc(src?: string | null): string | null {
  if (!src) return null
  if (src.startsWith('data:')) return src
  return `data:image/jpeg;base64,${src}`
}

export function getAvatarInitial(name?: string | null): string {
  return name?.charAt(0)?.toUpperCase() ?? 'U'
}
