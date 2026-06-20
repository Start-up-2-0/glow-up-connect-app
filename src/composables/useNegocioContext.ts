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
    limites,
    emTrial,
    diasTrial,
    proximaDataVencimento,
    prioridadeMarketplace,
    loading,
    trocandoEstabelecimento,
    contextoVersao,
  } = storeToRefs(negocioStore)

  return {
    estabelecimentos,
    estabelecimentoIdSelecionado,
    estabelecimentoId: estabelecimentoIdSelecionado,
    estabelecimentoAtivo,
    modulos,
    permissoes,
    assinaturaAtiva,
    assinaturaId,
    planoId,
    planoNome,
    role,
    limites,
    emTrial,
    diasTrial,
    proximaDataVencimento,
    prioridadeMarketplace,
    loading,
    trocandoEstabelecimento,
    contextoVersao,
    possuiModulo: negocioStore.possuiModulo,
    possuiPermissao: negocioStore.possuiPermissao,
    possuiAlgumaPermissao: negocioStore.possuiAlgumaPermissao,
    possuiAlgumModulo: negocioStore.possuiAlgumModulo,
    podeAcessar: negocioStore.podeAcessar,
    selecionarEstabelecimento: negocioStore.selecionarEstabelecimento,
    trocarEstabelecimento: negocioStore.trocarEstabelecimento,
    fetchEstabelecimentos: negocioStore.fetchEstabelecimentos,
    ensureContext: negocioStore.ensureContext,
  }
}
