const LABELS: Record<string, string> = {
  Estabelecimento: 'Estabelecimento',
  Assinatura: 'Assinatura',
  Agenda: 'Agenda',
  Servicos: 'Serviços',
  HorariosAtendimento: 'Horários',
  Notificacoes: 'Notificações',
  Email: 'E-mail',
  Profissionais: 'Profissionais',
  WhatsApp: 'WhatsApp',
  Caixa: 'Caixa',
  Financeiro: 'Financeiro',
  ComissaoProfissionais: 'Comissões',
}

export function labelModulo(modulo: string): string {
  return LABELS[modulo] ?? modulo
}

export function labelModulos(modulos: string[]): string[] {
  return modulos.map(labelModulo)
}
