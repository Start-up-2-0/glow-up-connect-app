import { ref, watch } from 'vue'
import { viaCepService } from '@/services/viaCepService'
import type { EnderecoFormFields } from '@/types/endereco.types'
import { cepFromInput, CEP_LENGTH, isValidCep, maskCep } from '@/utils/cep'

const DEBOUNCE_MS = 300

export function useCepLookup(
  getFields: () => EnderecoFormFields,
  patchFields: (patch: Partial<EnderecoFormFields>) => void,
) {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastFetchedCep = ref('')

  let debounceTimer: ReturnType<typeof setTimeout> | null = null
  let requestId = 0

  async function lookupCep(cepDigits: string) {
    if (!isValidCep(cepDigits)) {
      error.value = null
      return
    }

    if (cepDigits === lastFetchedCep.value) return

    const currentRequest = ++requestId
    loading.value = true
    error.value = null

    try {
      const result = await viaCepService.buscarCep(cepDigits)
      if (currentRequest !== requestId) return

      if (!result) {
        error.value = 'CEP não encontrado. Verifique o número ou preencha manualmente.'
        return
      }

      const current = getFields()
      patchFields({
        logradouro: result.logradouro,
        bairro: result.bairro,
        cidade: result.cidade,
        estado: result.estado,
        ...(result.complemento && !current.complemento.trim()
          ? { complemento: result.complemento }
          : {}),
      })
      lastFetchedCep.value = cepDigits
    } catch {
      if (currentRequest !== requestId) return
      error.value = 'Não foi possível consultar o CEP. Tente novamente ou preencha manualmente.'
    } finally {
      if (currentRequest === requestId) {
        loading.value = false
      }
    }
  }

  function scheduleLookup(cepDigits: string) {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      void lookupCep(cepDigits)
    }, DEBOUNCE_MS)
  }

  function onCepInput(raw: string) {
    const digits = cepFromInput(raw)
    const masked = maskCep(digits)
    patchFields({ cep: masked })
    error.value = null

    if (digits.length < CEP_LENGTH) {
      lastFetchedCep.value = ''
    }

    if (isValidCep(digits)) {
      scheduleLookup(digits)
    }
  }

  watch(
    () => getFields().cep,
    (cep) => {
      const digits = cepFromInput(cep)
      if (isValidCep(digits) && digits !== lastFetchedCep.value) {
        scheduleLookup(digits)
      }
    },
  )

  return {
    loading,
    error,
    lastFetchedCep,
    onCepInput,
    lookupCep,
  }
}
