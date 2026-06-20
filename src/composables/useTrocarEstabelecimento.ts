import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useNotificationsStore } from '@/stores/notifications.store'

export function useTrocarEstabelecimento() {
  const router = useRouter()
  const negocioStore = useNegocioStore()
  const assinaturaStore = useAssinaturaStore()
  const notifications = useNotificationsStore()
  const { trocandoEstabelecimento } = storeToRefs(negocioStore)

  async function trocarEstabelecimento(estabelecimentoId: number) {
    if (estabelecimentoId === negocioStore.estabelecimentoIdSelecionado) {
      return
    }

    try {
      await negocioStore.trocarEstabelecimento(estabelecimentoId)
      assinaturaStore.clear()

      const ativo = negocioStore.estabelecimentoAtivo
      if (!ativo) {
        notifications.push('error', 'Estabelecimento não encontrado para sua conta.')
        return
      }

      if (!ativo.assinaturaAtiva) {
        notifications.push(
          'warning',
          `A assinatura de "${ativo.nome}" está inativa. Alguns recursos podem ficar indisponíveis.`,
        )
      } else {
        notifications.push('success', `Loja alterada para ${ativo.nome}.`)
      }

      const route = router.currentRoute.value
      const { _ctx: _ignored, ...query } = route.query

      await router.replace({
        path: route.path,
        query: {
          ...query,
          _ctx: String(negocioStore.contextoVersao),
        },
        hash: route.hash,
      })
    } catch {
      notifications.push('error', 'Não foi possível trocar de loja. Tente novamente.')
    }
  }

  return {
    trocarEstabelecimento,
    trocandoEstabelecimento,
  }
}
