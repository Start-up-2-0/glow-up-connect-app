export interface UpgradeInfo {
  planoMinimo: string
  mensagem: string
}

export const UPGRADE_BY_MODULO: Record<string, UpgradeInfo> = {
  Profissionais: {
    planoMinimo: 'Plus',
    mensagem: 'Convide sua equipe com o plano Plus',
  },
  WhatsApp: {
    planoMinimo: 'Plus',
    mensagem: 'Alertas automáticos no WhatsApp',
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
      planoMinimo: 'Plus',
      mensagem: 'Este recurso não está disponível no seu plano atual.',
    }
  )
}
