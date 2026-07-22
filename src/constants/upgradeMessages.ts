export interface UpgradeInfo {
  planoMinimo: string
  mensagem: string
}

export const UPGRADE_BY_MODULO: Record<string, UpgradeInfo> = {
  Profissionais: {
    planoMinimo: 'Essencial',
    mensagem: 'Convide sua equipe com o plano Essencial',
  },
  WhatsApp: {
    planoMinimo: 'Essencial',
    mensagem: 'Alertas automáticos no WhatsApp',
  },
  Clientes: {
    planoMinimo: 'Premium',
    mensagem: 'CRM de clientes no Premium',
  },
  Caixa: {
    planoMinimo: 'Premium',
    mensagem: 'Controle de caixa no Premium',
  },
  Financeiro: {
    planoMinimo: 'Premium',
    mensagem: 'Fluxo financeiro no Premium',
  },
  ComissaoProfissionais: {
    planoMinimo: 'Premium',
    mensagem: 'Comissões automáticas no Premium',
  },
}

export function getUpgradeInfo(modulo: string): UpgradeInfo {
  return (
    UPGRADE_BY_MODULO[modulo] ?? {
      planoMinimo: 'Essencial',
      mensagem: 'Este recurso não está disponível no seu plano atual.',
    }
  )
}
