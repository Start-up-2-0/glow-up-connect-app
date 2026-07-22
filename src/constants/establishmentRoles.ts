import type { EstablishmentUserRole } from '@/types/negocio/equipe.types'

export const ESTABLISHMENT_ROLE_LABELS: Record<EstablishmentUserRole, string> = {
  Owner: 'Dono',
  Admin: 'Administrador',
  Manager: 'Gerente',
  Receptionist: 'Recepcionista',
  Profissional: 'Profissional',
}

/** Funções disponíveis no cadastro manual de usuário da equipe. */
export const ROLES_CADASTRO_EQUIPE: {
  value: EstablishmentUserRole
  label: string
  description: string
}[] = [
  {
    value: 'Admin',
    label: ESTABLISHMENT_ROLE_LABELS.Admin,
    description: 'Acesso administrativo completo ao negócio.',
  },
  {
    value: 'Manager',
    label: ESTABLISHMENT_ROLE_LABELS.Manager,
    description: 'Gerencia operação do dia a dia.',
  },
  {
    value: 'Receptionist',
    label: ESTABLISHMENT_ROLE_LABELS.Receptionist,
    description: 'Atendimento na recepção e agenda geral.',
  },
  {
    value: 'Profissional',
    label: ESTABLISHMENT_ROLE_LABELS.Profissional,
    description: 'Atende clientes e gerencia a própria agenda.',
  },
]

export function establishmentRoleLabel(role: EstablishmentUserRole | string): string {
  return ESTABLISHMENT_ROLE_LABELS[role as EstablishmentUserRole] ?? role
}

/** Funções atribuíveis na edição de um membro (exclui Dono). */
export const ROLES_EDITAVEIS_EQUIPE = ROLES_CADASTRO_EQUIPE
