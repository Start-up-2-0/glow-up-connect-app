import { storeToRefs } from 'pinia'
import { useNegocioStore } from '@/stores/negocio.store'

export function useNegocioContext() {
  const negocioStore = useNegocioStore()
  const {
    estabelecimentos,
    estabelecimentoIdSelecionado,
    estabelecimentoAtivo,
    modulos,
    permissoes,
    assinaturaAtiva,
    assinaturaId,
    planoId,
    planoNome,
    role,
    loading,
  } = storeToRefs(negocioStore)

  return {
    estabelecimentos,
    estabelecimentoIdSelecionado,
    estabelecimentoAtivo,
    modulos,
    permissoes,
    assinaturaAtiva,
    assinaturaId,
    planoId,
    planoNome,
    role,
    loading,
    possuiModulo: negocioStore.possuiModulo,
    possuiPermissao: negocioStore.possuiPermissao,
    possuiAlgumaPermissao: negocioStore.possuiAlgumaPermissao,
    possuiAlgumModulo: negocioStore.possuiAlgumModulo,
    podeAcessar: negocioStore.podeAcessar,
    selecionarEstabelecimento: negocioStore.selecionarEstabelecimento,
    fetchEstabelecimentos: negocioStore.fetchEstabelecimentos,
    ensureContext: negocioStore.ensureContext,
  }
}
