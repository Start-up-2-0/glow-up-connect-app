export const PASSWORD_RULES = [
  { id: 'uppercase', label: 'Letra maiúscula;', test: (senha: string) => /[A-Z]/.test(senha) },
  { id: 'lowercase', label: 'Letra minúscula;', test: (senha: string) => /[a-z]/.test(senha) },
  { id: 'number', label: 'Número;', test: (senha: string) => /\d/.test(senha) },
  {
    id: 'special',
    label: 'Caractere especial;',
    test: (senha: string) => /[^A-Za-z0-9]/.test(senha),
  },
  { id: 'minLength', label: 'Mínimo de 6 caracteres.', test: (senha: string) => senha.length >= 6 },
] as const

export function getUnmetPasswordRules(senha: string): string[] {
  return PASSWORD_RULES.filter((rule) => !rule.test(senha)).map((rule) => rule.label)
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (!local || !domain) return email

  const visible = local.slice(0, Math.min(4, local.length))
  const hidden = '*'.repeat(Math.max(0, local.length - visible.length))
  return `${visible}${hidden}@${domain}`
}
