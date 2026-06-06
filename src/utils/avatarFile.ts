export const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
    return 'Formato inválido. Use JPEG, PNG ou WebP.'
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return 'Arquivo muito grande. Máximo 5 MB.'
  }
  return null
}
