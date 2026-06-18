import axios from 'axios'
import { API_BASE_URL } from '@/constants/storageKeys'
import type { ApiSuccessResponse } from '@/types/api.types'

export const REQUEST_PROOF_HEADER = 'X-Glow-Request-Proof'
const BOOTSTRAP_PATH = '/security/request-proof'
const DEFAULT_POOL_SIZE = 5
const MIN_POOL = 2

const EXEMPT_SUFFIXES = [BOOTSTRAP_PATH]

let pool: string[] = []
let refillPromise: Promise<void> | null = null
let disabled = false

export function isExemptRequestProofPath(url?: string): boolean {
  if (!url) return false
  const normalized = url.split('?')[0]
  return EXEMPT_SUFFIXES.some((suffix) => normalized.endsWith(suffix))
}

export function resolveApiPath(url?: string): string {
  const path = (url ?? '').split('?')[0]
  if (path.startsWith('/api/')) return path.toLowerCase()
  const base = API_BASE_URL.replace(/\/$/, '')
  const joined = `${base}${path.startsWith('/') ? path : `/${path}`}`
  return joined.toLowerCase()
}

async function fetchProofs(count = DEFAULT_POOL_SIZE): Promise<void> {
  const client = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: { Accept: 'application/json' },
    timeout: 15_000,
  })

  const { data } = await client.get<ApiSuccessResponse<{ proofs: string[] }>>(
    `${BOOTSTRAP_PATH}?count=${count}`,
  )

  const proofs = data.data?.proofs ?? []
  if (proofs.length > 0) {
    pool.push(...proofs)
    disabled = false
    return
  }

  if (data.success) {
    disabled = true
  }
}

export async function ensureRequestProofPool(min = MIN_POOL): Promise<void> {
  if (disabled) return
  if (pool.length >= min) return

  if (!refillPromise) {
    refillPromise = fetchProofs().finally(() => {
      refillPromise = null
    })
  }

  await refillPromise
}

export async function acquireRequestProof(
  _method?: string,
  _url?: string,
): Promise<string | undefined> {
  if (disabled) return undefined

  await ensureRequestProofPool(1)
  const proof = pool.shift()
  if (!proof) {
    await fetchProofs(1)
    return pool.shift()
  }

  void ensureRequestProofPool(MIN_POOL)
  return proof
}

export function invalidateRequestProofPool(): void {
  pool = []
}

export function isRequestProofError(code?: string): boolean {
  return !!code && code.startsWith('REQUEST_PROOF_')
}
