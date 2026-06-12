import { ref } from 'vue'
import { publicoService } from '@/services/publicoService'
import { useApiError } from '@/composables/useApiError'
import type { SlotDisponivel } from '@/types/agendamento.types'
import { toDateOnlyString } from '@/utils/formatters'

interface UseRemarcarAgendamentoSlotsOptions {
  getPublicGuid: () => string | undefined
  getServicoIds: () => number[]
  onError?: (message: string) => void
}

export function useRemarcarAgendamentoSlots(options: UseRemarcarAgendamentoSlotsOptions) {
  const { resolveError } = useApiError()

  const date = ref(toDateOnlyString(new Date()))
  const motivo = ref('')
  const slots = ref<SlotDisponivel[]>([])
  const selectedSlotInicio = ref<string | null>(null)
  const slotsLoading = ref(false)

  async function loadSlots() {
    const publicGuid = options.getPublicGuid()
    const servicoIds = options.getServicoIds()
    if (!publicGuid || servicoIds.length === 0) {
      slots.value = []
      return
    }

    slotsLoading.value = true
    selectedSlotInicio.value = null

    try {
      const data = await publicoService.consultarDisponibilidadeLoja(publicGuid, {
        dataInicio: date.value,
        dataFim: date.value,
        servicoIds,
      })
      slots.value = data.slots
    } catch (err) {
      slots.value = []
      options.onError?.(resolveError(err, 'Não foi possível carregar os horários.'))
    } finally {
      slotsLoading.value = false
    }
  }

  function reset() {
    date.value = toDateOnlyString(new Date())
    motivo.value = ''
    slots.value = []
    selectedSlotInicio.value = null
  }

  function getSelectedSlot(): SlotDisponivel | null {
    if (!selectedSlotInicio.value) return null
    return slots.value.find((slot) => slot.inicio === selectedSlotInicio.value) ?? null
  }

  return {
    date,
    motivo,
    slots,
    selectedSlotInicio,
    slotsLoading,
    loadSlots,
    reset,
    getSelectedSlot,
  }
}
