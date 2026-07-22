export interface EnderecoFormFields {
  cep: string
  logradouro: string
  numero: string
  bairro: string
  cidade: string
  estado: string
  complemento: string
}

export interface ViaCepResponse {
  cep: string
  logradouro: string
  complemento: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export interface EnderecoCepLookupResult {
  logradouro: string
  bairro: string
  cidade: string
  estado: string
  complemento?: string
}

export function emptyEnderecoFormFields(): EnderecoFormFields {
  return {
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: '',
  }
}
