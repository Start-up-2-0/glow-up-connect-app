import type { UserRole } from '@/types/user.types'

const ROLE_LABELS: Record<UserRole, string> = {
  1: 'Cliente',
  2: 'Dono do estabelecimento',
  3: 'Profissional autônomo',
  4: 'Profissional',
  5: 'Administrador',
}

export function getUserRoleLabel(role: UserRole | string | number | undefined): string {
  if (role === undefined || role === null) return 'Usuário'
  if (typeof role === 'number' && role in ROLE_LABELS) {
    return ROLE_LABELS[role as UserRole]
  }
  if (typeof role === 'string' && role in ROLE_LABELS) {
    return ROLE_LABELS[role as unknown as UserRole] ?? role
  }
  return String(role)
}
