import type { EnderecoOnboarding } from '@/types/assinatura.types'
import type { EnderecoFormFields } from '@/types/endereco.types'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'
import { cepToApi, isValidCep, isValidUf, normalizeUf } from '@/utils/cep'

export type EnderecoDraftSource =
  | Pick<
      OnboardingEstabelecimentoDraft,
      'cep' | 'logradouro' | 'numero' | 'bairro' | 'cidade' | 'estado' | 'complemento'
    >
  | EnderecoFormFields

export function validateEnderecoForSubmit(fields: EnderecoDraftSource): string | null {
  if (!isValidCep(fields.cep)) {
    return 'Informe um CEP válido com 8 dígitos.'
  }
  if (!fields.logradouro.trim()) {
    return 'Informe o logradouro.'
  }
  if (!fields.numero.trim()) {
    return 'Informe o número.'
  }
  if (!fields.bairro.trim()) {
    return 'Informe o bairro.'
  }
  if (!fields.cidade.trim()) {
    return 'Informe a cidade.'
  }
  if (!isValidUf(fields.estado)) {
    return 'Informe a UF com 2 caracteres.'
  }
  return null
}

export function draftEnderecoToApi(fields: EnderecoDraftSource): EnderecoOnboarding {
  const complemento = fields.complemento?.trim()
  return {
    cep: cepToApi(fields.cep),
    logradouro: fields.logradouro.trim(),
    numero: fields.numero.trim(),
    bairro: fields.bairro.trim(),
    cidade: fields.cidade.trim(),
    estado: normalizeUf(fields.estado),
    ...(complemento ? { complemento } : {}),
  }
}
