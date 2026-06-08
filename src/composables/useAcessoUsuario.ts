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

  return {
    temVinculoNegocio,
    temContextoOperacional,
    podeVerMenuNegocio,
    roleExibicao,
    ehDonoOuAutonomo,
  }
}
