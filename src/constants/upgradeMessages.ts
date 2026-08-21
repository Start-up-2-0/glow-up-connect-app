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
    mensagem: 'Alertas automáticos no WhatsApp no plano Essencial',
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

/** Mensagens de upgrade para profissional autônomo (sem equipe/comissões). */
export const UPGRADE_BY_MODULO_AUTONOMO: Record<string, UpgradeInfo> = {
  WhatsApp: {
    planoMinimo: 'Premium',
    mensagem: 'Confirmações e lembretes automáticos no WhatsApp com o Premium',
  },
  Caixa: {
    planoMinimo: 'Premium',
    mensagem: 'Controle financeiro pessoal no Premium',
  },
  Financeiro: {
    planoMinimo: 'Premium',
    mensagem: 'Relatórios e indicadores financeiros no Premium',
  },
  Clientes: {
    planoMinimo: 'Essencial',
    mensagem: 'Gestão de clientes já inclusa no Essencial para autônomos',
  },
}

export function getUpgradeInfo(
  modulo: string,
  ehProfissionalAutonomo = false,
): UpgradeInfo {
  if (ehProfissionalAutonomo) {
    return (
      UPGRADE_BY_MODULO_AUTONOMO[modulo] ?? {
        planoMinimo: 'Premium',
        mensagem: 'Desbloqueie recursos avançados feitos para quem trabalha sozinho com o Premium.',
      }
    )
  }

  return (
    UPGRADE_BY_MODULO[modulo] ?? {
      planoMinimo: 'Essencial',
      mensagem: 'Este recurso não está disponível no seu plano atual.',
    }
  )
}
