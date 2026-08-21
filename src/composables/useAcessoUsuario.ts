import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { getUserRoleLabel } from '@/utils/userRoleLabel'
import { establishmentRoleLabel } from '@/constants/establishmentRoles'
import { lojaAgendarUrl } from '@/constants/routes'
import { isClienteRole } from '@/types/user.types'

export function useAcessoUsuario() {
  const userStore = useUserStore()
  const negocioStore = useNegocioStore()
  const { profile } = storeToRefs(userStore)
  const { estabelecimentos, estabelecimentoAtivo, role: roleLoja } = storeToRefs(negocioStore)

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

  const ehProfissionalOperacional = computed(
    () => temContextoOperacional.value && roleLoja.value === 'Profissional',
  )

  const possuiEstabelecimentoProprio = computed(() =>
    estabelecimentos.value.some((e) => e.role === 'Owner'),
  )

  const possuiAssinaturaAtivaComoDono = computed(() =>
    estabelecimentos.value.some((e) => e.role === 'Owner' && e.assinaturaAtiva),
  )

  /** Link público de agendamento (hospedado na landing). */
  const linkAgendamentoPublico = computed(() => {
    const ativo = estabelecimentoAtivo.value
    if (!ativo?.publicGuid || !ativo.profissionalPublicGuid) return null
    return lojaAgendarUrl(ativo.publicGuid, ativo.profissionalPublicGuid)
  })

  return {
    temVinculoNegocio,
    temContextoOperacional,
    podeVerMenuNegocio,
    roleExibicao,
    ehDonoOuAutonomo,
    ehProfissionalOperacional,
    possuiEstabelecimentoProprio,
    possuiAssinaturaAtivaComoDono,
    linkAgendamentoPublico,
  }
}
