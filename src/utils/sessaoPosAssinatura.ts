import { authService } from '@/services/authService'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { syncSession } from '@/utils/sessionSync'

export function obterDeadlinePollPagamento(expiraEm?: string | null): number {
  const bufferMs = 15_000
  if (expiraEm) {
    const limite = new Date(expiraEm).getTime()
    if (!Number.isNaN(limite)) {
      return limite + bufferMs
    }
  }

  return Date.now() + 5 * 60_000
}

export async function sincronizarSessaoPosAssinatura(): Promise<boolean> {
  try {
    const { data } = await authService.refresh()
    syncSession({
      token: '',
      refreshToken: '',
      expiresAt: data.data.expiresAt,
      refreshExpiresAt: data.data.refreshExpiresAt,
    })
  } catch {
    return false
  }

  const userStore = useUserStore()
  const negocioStore = useNegocioStore()
  await userStore.fetchMe(true)
  await negocioStore.fetchEstabelecimentos(true)
  return true
}

export const MENSAGEM_AGUARDANDO_PAGAMENTO = 'Aguardando confirmação do pagamento...'
export const MENSAGEM_PAGAMENTO_CONCLUIDO = 'Pagamento concluído! Sua assinatura está ativa.'
export const MENSAGEM_LINK_EXPIRADO =
  'O link de pagamento expirou ou ainda não foi confirmado. Clique em Assinar para gerar um novo link.'
export const MENSAGEM_REFRESH_FALHOU =
  'Pagamento confirmado. Entre novamente para atualizar seu acesso.'
