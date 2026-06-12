import { computed, ref, watch } from 'vue'
import { publicoService } from '@/services/publicoService'
import { useApiError } from '@/composables/useApiError'
import type { ConsultarDisponibilidadeParams, SlotDisponivel } from '@/types/agendamento.types'
import {
  DISPONIBILIDADE_JANELA_DIAS,
  filtrarSlotsDoDia,
  isDataAtendimentoPermitida,
  mesclarDatasAtendimento,
  normalizarDatasAtendimento,
  primeiraDataAtendimentoDisponivel,
} from '@/utils/disponibilidadeAgenda'
import { addDaysToDateOnly, toDateOnlyString } from '@/utils/formatters'

interface UseRemarcarAgendamentoSlotsOptions {
  getPublicGuid: () => string | undefined
  getServicoIds: () => number[]
  getProfissionalPublicGuid?: () => string | undefined
  getProfissionalId?: () => number | undefined
  onError?: (message: string) => void
}

export function useRemarcarAgendamentoSlots(options: UseRemarcarAgendamentoSlotsOptions) {
  const { resolveError } = useApiError()

  const date = ref(toDateOnlyString(new Date()))
  const motivo = ref('')
  const slots = ref<SlotDisponivel[]>([])
  const datasAtendimento = ref<string[]>([])
  const selectedSlotInicio = ref<string | null>(null)
  const datasLoading = ref(false)
  const slotsLoading = ref(false)
  const mensagemIndisponibilidade = ref<string | null>(null)
  const active = ref(false)

  const minSelectableDate = computed(() => toDateOnlyString(new Date()))

  const maxSelectableDate = computed(() =>
    addDaysToDateOnly(minSelectableDate.value, DISPONIBILIDADE_JANELA_DIAS - 1),
  )

  function buildConsultaParams(
    dataInicio: string,
    dataFim: string,
  ): { publicGuid: string; params: ConsultarDisponibilidadeParams } | null {
    const publicGuid = options.getPublicGuid()
    const servicoIds = options.getServicoIds()
    if (!publicGuid || servicoIds.length === 0) return null

    const params: ConsultarDisponibilidadeParams = {
      dataInicio,
      dataFim,
      servicoIds,
    }

    const profissionalPublicGuid = options.getProfissionalPublicGuid?.()
    if (profissionalPublicGuid) {
      params.profissionalPublicGuid = profissionalPublicGuid
    } else {
      const profissionalId = options.getProfissionalId?.()
      if (profissionalId) params.profissionalId = profissionalId
    }

    return { publicGuid, params }
  }

  function garantirDataAtendimentoValida(): boolean {
    if (datasAtendimento.value.length === 0) {
      mensagemIndisponibilidade.value =
        'Não há dias de atendimento disponíveis para este profissional com os serviços selecionados.'
      return false
    }

    if (!isDataAtendimentoPermitida(datasAtendimento.value, date.value)) {
      const proxima = primeiraDataAtendimentoDisponivel(
        datasAtendimento.value,
        minSelectableDate.value,
      )
      if (!proxima) {
        mensagemIndisponibilidade.value =
          'Não há dias de atendimento disponíveis para este profissional com os serviços selecionados.'
        return false
      }
      date.value = proxima
    }

    return true
  }

  async function loadDatasAtendimento() {
    const consulta = buildConsultaParams(minSelectableDate.value, maxSelectableDate.value)
    if (!consulta) {
      datasAtendimento.value = []
      return
    }

    datasLoading.value = true
    mensagemIndisponibilidade.value = null

    try {
      const data = await publicoService.consultarDisponibilidadeLoja(
        consulta.publicGuid,
        consulta.params,
      )
      datasAtendimento.value = normalizarDatasAtendimento(
        data.datasAtendimento ?? [],
        minSelectableDate.value,
      )
      if (data.mensagemIndisponibilidade && datasAtendimento.value.length === 0) {
        mensagemIndisponibilidade.value = data.mensagemIndisponibilidade
      }
      garantirDataAtendimentoValida()
    } catch (err) {
      datasAtendimento.value = []
      options.onError?.(resolveError(err, 'Não foi possível carregar as datas disponíveis.'))
    } finally {
      datasLoading.value = false
    }
  }

  async function loadSlots() {
    const consulta = buildConsultaParams(date.value, date.value)
    if (!consulta) {
      slots.value = []
      return
    }

    if (!garantirDataAtendimentoValida()) {
      slots.value = []
      return
    }

    slotsLoading.value = true
    selectedSlotInicio.value = null
    const dataConsulta = date.value

    try {
      const data = await publicoService.consultarDisponibilidadeLoja(
        consulta.publicGuid,
        consulta.params,
      )
      slots.value = filtrarSlotsDoDia(data.slots, dataConsulta)

      if (data.datasAtendimento?.length) {
        datasAtendimento.value = mesclarDatasAtendimento(
          datasAtendimento.value,
          data.datasAtendimento,
          minSelectableDate.value,
        )
      } else if (!isDataAtendimentoPermitida(datasAtendimento.value, dataConsulta)) {
        datasAtendimento.value = datasAtendimento.value.filter((dia) => dia !== dataConsulta)
        if (date.value === dataConsulta) {
          const proxima = primeiraDataAtendimentoDisponivel(
            datasAtendimento.value,
            minSelectableDate.value,
          )
          if (proxima) date.value = proxima
        }
      }

      if (data.mensagemIndisponibilidade && slots.value.length === 0) {
        mensagemIndisponibilidade.value = data.mensagemIndisponibilidade
      }
    } catch (err) {
      slots.value = []
      options.onError?.(resolveError(err, 'Não foi possível carregar os horários.'))
    } finally {
      slotsLoading.value = false
    }
  }

  async function initialize() {
    active.value = false
    await loadDatasAtendimento()
    await loadSlots()
    active.value = true
  }

  function reset() {
    active.value = false
    date.value = toDateOnlyString(new Date())
    motivo.value = ''
    slots.value = []
    datasAtendimento.value = []
    selectedSlotInicio.value = null
    mensagemIndisponibilidade.value = null
  }

  function getSelectedSlot(): SlotDisponivel | null {
    if (!selectedSlotInicio.value) return null
    return slots.value.find((slot) => slot.inicio === selectedSlotInicio.value) ?? null
  }

  watch(date, () => {
    if (!active.value) return
    void loadSlots()
  })

  return {
    date,
    motivo,
    slots,
    datasAtendimento,
    selectedSlotInicio,
    datasLoading,
    slotsLoading,
    mensagemIndisponibilidade,
    minSelectableDate,
    maxSelectableDate,
    loadDatasAtendimento,
    loadSlots,
    initialize,
    reset,
    getSelectedSlot,
  }
}
