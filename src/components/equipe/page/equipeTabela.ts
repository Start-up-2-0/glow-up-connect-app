import type { EstablishmentUserRole } from '@/types/negocio/equipe.types'

export interface EquipeTabelaRow {
  id: string
  nome: string
  cargo: string
  role: EstablishmentUserRole | 'Profissional' | 'Convidado'
  email?: string
  telefone?: string
  ativo?: boolean
  convidado?: boolean
  conviteEm?: string | null
  foto?: string | null
}
