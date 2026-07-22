import type { EnderecoCepLookupResult, ViaCepResponse } from '@/types/endereco.types'
import { cepToApi, isValidCep } from '@/utils/cep'

const VIA_CEP_TIMEOUT_MS = 8000

async function fetchViaCep(cep: string): Promise<EnderecoCepLookupResult | null> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), VIA_CEP_TIMEOUT_MS)

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
      signal: controller.signal,
    })
    if (!response.ok) return null

    const data = (await response.json()) as ViaCepResponse
    if (data.erro) return null

    return {
      logradouro: data.logradouro ?? '',
      bairro: data.bairro ?? '',
      cidade: data.localidade ?? '',
      estado: data.uf ?? '',
      complemento: data.complemento || undefined,
    }
  } finally {
    window.clearTimeout(timeout)
  }
}

async function fetchBrasilApi(cep: string): Promise<EnderecoCepLookupResult | null> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), VIA_CEP_TIMEOUT_MS)

  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cep}`, {
      signal: controller.signal,
    })
    if (!response.ok) return null

    const data = (await response.json()) as {
      street?: string
      neighborhood?: string
      city?: string
      state?: string
    }

    return {
      logradouro: data.street ?? '',
      bairro: data.neighborhood ?? '',
      cidade: data.city ?? '',
      estado: data.state ?? '',
    }
  } finally {
    window.clearTimeout(timeout)
  }
}

export const viaCepService = {
  async buscarCep(cep: string): Promise<EnderecoCepLookupResult | null> {
    const normalized = cepToApi(cep)
    if (!isValidCep(normalized)) return null

    const viaCep = await fetchViaCep(normalized)
    if (viaCep) return viaCep

    return fetchBrasilApi(normalized)
  },
}
