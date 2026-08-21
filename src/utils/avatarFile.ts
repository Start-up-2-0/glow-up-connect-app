export const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

/** Teto do arquivo original no seletor (fotos de celular). */
export const AVATAR_SOURCE_MAX_BYTES = 5 * 1024 * 1024

/** Teto após otimização — o que a API persiste (bytes decodificados). */
export const AVATAR_MAX_BYTES = 1 * 1024 * 1024

export const AVATAR_MAX_DIMENSION = 800

export const AVATAR_HINT = 'JPEG, PNG ou WebP. A imagem será otimizada automaticamente (até 1 MB).'

export interface CompressedAvatar {
  dataUrl: string
  contentType: string
}

const QUALIDADES = [0.75, 0.62, 0.5, 0.4] as const
const TIPOS_COMPRESSAO = ['image/webp', 'image/jpeg'] as const

export function validateAvatarFile(file: File): string | null {
  if (!AVATAR_ALLOWED_TYPES.includes(file.type as (typeof AVATAR_ALLOWED_TYPES)[number])) {
    return 'Formato inválido. Use JPEG, PNG ou WebP.'
  }
  if (file.size > AVATAR_SOURCE_MAX_BYTES) {
    return 'Arquivo muito grande. Máximo 5 MB.'
  }
  return null
}

/** Lê o arquivo, redimensiona e comprime para data URI (WebP/JPEG, máx. 1 MB). */
export async function readFileAsDataUrl(file: File): Promise<string> {
  const compressed = await compressAvatarFile(file)
  return compressed.dataUrl
}

export async function compressAvatarFile(file: File): Promise<CompressedAvatar> {
  const validationError = validateAvatarFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const original = await blobToDataUrl(file)

  try {
    const blob = await encodeOnCanvas(file)
    if (blob.size > AVATAR_MAX_BYTES) {
      if (file.size <= AVATAR_MAX_BYTES) {
        return { dataUrl: original, contentType: file.type }
      }
      throw new Error('Não foi possível reduzir a imagem para 1 MB. Tente outra foto.')
    }

    if (file.size <= AVATAR_MAX_BYTES && blob.size >= file.size) {
      return { dataUrl: original, contentType: file.type }
    }

    const dataUrl = await blobToDataUrl(blob)
    return {
      dataUrl,
      contentType: blob.type || 'image/webp',
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('1 MB')) {
      throw error
    }
    if (file.size <= AVATAR_MAX_BYTES) {
      return { dataUrl: original, contentType: file.type }
    }
    throw new Error('Não foi possível otimizar a imagem. Tente outra foto.')
  }
}

async function encodeOnCanvas(file: File): Promise<Blob> {
  const bitmap = await loadBitmap(file)
  try {
    const { width, height } = fitWithin(bitmap.width, bitmap.height, AVATAR_MAX_DIMENSION)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas indisponível.')
    }

    let melhor: Blob | null = null

    for (const type of TIPOS_COMPRESSAO) {
      if (type === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, width, height)
      } else {
        ctx.clearRect(0, 0, width, height)
      }
      ctx.drawImage(bitmap, 0, 0, width, height)

      for (const quality of QUALIDADES) {
        const blob = await canvasToBlob(canvas, type, quality)
        if (!blob) continue
        if (!melhor || blob.size < melhor.size) {
          melhor = blob
        }
        if (blob.size <= AVATAR_MAX_BYTES) {
          return blob
        }
      }
    }

    if (melhor) return melhor
    throw new Error('Falha ao compactar a imagem.')
  } finally {
    bitmap.close()
  }
}

async function loadBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    return await createImageBitmap(file)
  }
}

function fitWithin(width: number, height: number, max: number): { width: number; height: number } {
  const longest = Math.max(width, height)
  if (longest <= max) {
    return { width, height }
  }
  const scale = max / longest
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), type, quality)
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'))
    reader.readAsDataURL(blob)
  })
}
