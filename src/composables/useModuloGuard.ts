import { computed } from 'vue'
import { useNegocioContext } from '@/composables/useNegocioContext'

export function useModuloGuard(modulo: string, permissao?: string) {
  const { possuiModulo, possuiPermissao, assinaturaAtiva, podeAcessar } = useNegocioContext()

  const liberado = computed(() => {
    if (!assinaturaAtiva.value) return false
    if (permissao) return podeAcessar(modulo, permissao)
    return possuiModulo(modulo)
  })

  return {
    liberado,
    possuiModulo,
    possuiPermissao,
    assinaturaAtiva,
    podeAcessar,
  }
}
