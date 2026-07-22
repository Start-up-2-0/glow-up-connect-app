export interface ProfissionalVitrine {
  id: number
  estabelecimentoId: number
  profissionalId: number
  publicGuid: string
  nomePublico: string
  biografia: string
  logo: string
  somenteExibicao: boolean
  ativo: boolean
}

export interface CadastrarProfissionalVitrinePayload {
  nomePublico: string
  biografia?: string
  logo?: string
}

export interface AtualizarProfissionalVitrinePayload {
  nomePublico: string
  biografia?: string
  logo?: string
}

export interface AtualizarStatusProfissionalVitrinePayload {
  ativo: boolean
}

export interface ProfissionalVitrinePublico {
  publicGuid: string
  nomePublico: string
  biografia: string
  logo: string
}
