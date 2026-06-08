import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { getUserRoleLabel } from '@/utils/userRoleLabel'
import { establishmentRoleLabel } from '@/constants/establishmentRoles'
import { isClienteRole } from '@/types/user.types'

export function useAcessoUsuario() {
  const userStore = useUserStore()
  const negocioStore = useNegocioStore()
  const { profile } = storeToRefs(userStore)
  const { estabelecimentos, estabelecimentoAtivo, role: roleLoja, permissoes } =
    storeToRefs(negocioStore)

  const temVinculoNegocio = computed(() => estabelecimentos.value.length > 0)

  const temContextoOperacional = computed(
    () => temVinculoNegocio.value && estabelecimentoAtivo.value !== null,
  )

  const podeVerMenuNegocio = temVinculoNegocio

  const roleExibicao = computed(() => {
    if (temContextoOperacional.value && roleLoja.value) {
      return establishmentRoleLabel(roleLoja.value)
    }
    return getUserRoleLabel(profile.value?.role)
  })

  const ehDonoOuAutonomo = computed(
    () => profile.value?.role !== undefined && !isClienteRole(profile.value.role),
  )

  const ehProfissionalOperacional = computed(() => {
    if (!temContextoOperacional.value) return false
    const perms = permissoes.value
    return (
      perms.includes('AgendaVisualizarPropria') &&
      !perms.includes('AgendaVisualizarGeral') &&
      !perms.includes('EquipeGerenciar')
    )
  })

  const linkAgendamentoPublico = computed(() => {
    const ativo = estabelecimentoAtivo.value
    if (!ativo?.publicGuid || !ativo.profissionalPublicGuid) return null
    const base = `${window.location.origin}/loja/${ativo.publicGuid}/agendar`
    return `${base}?profissional=${ativo.profissionalPublicGuid}`
  })

  return {
    temVinculoNegocio,
    temContextoOperacional,
    podeVerMenuNegocio,
    roleExibicao,
    ehDonoOuAutonomo,
    ehProfissionalOperacional,
    linkAgendamentoPublico,
  }
}
