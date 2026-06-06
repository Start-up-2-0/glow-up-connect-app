import { computed, ref } from 'vue'
import { publicoService } from '@/services/publicoService'
import { agendamentoService } from '@/services/agendamentoService'
import type {
  AgendamentoCliente,
  ProfissionalPublico,
  ServicoPublico,
  SlotDisponivel,
} from '@/types/agendamento.types'
import { toDateOnlyString, toTimeOnlyString } from '@/utils/formatters'

export type WizardStep = 'servicos' | 'profissional' | 'horario' | 'confirmar'

export function useAgendarWizard(publicGuid: string) {
  const step = ref<WizardStep>('servicos')
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)

  const servicos = ref<ServicoPublico[]>([])
  const profissionais = ref<ProfissionalPublico[]>([])
  const slots = ref<SlotDisponivel[]>([])

  const selectedServicoIds = ref<number[]>([])
  const selectedProfissionalGuid = ref<string>('')
  const selectedDate = ref(toDateOnlyString(new Date()))
  const selectedSlot = ref<SlotDisponivel | null>(null)
  const observacao = ref('')

  const selectedServicos = computed(() =>
    servicos.value.filter((s) => selectedServicoIds.value.includes(s.id)),
  )

  const valorEstimado = computed(() => {
    const selected = selectedServicos.value
    if (selected.length === 0) return 0
    return selected.reduce((sum, s) => sum + s.precoMinimo, 0)
  })

  async function loadServicos() {
    loading.value = true
    error.value = null
    try {
      servicos.value = await publicoService.listarServicosLoja(
        publicGuid,
        selectedProfissionalGuid.value || undefined,
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar serviços.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadProfissionais() {
    loading.value = true
    error.value = null
    try {
      profissionais.value = await publicoService.listarProfissionaisLoja(publicGuid)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar profissionais.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadDisponibilidade() {
    if (selectedServicoIds.value.length === 0) return
    loading.value = true
    error.value = null
    selectedSlot.value = null
    try {
      const data = await publicoService.consultarDisponibilidadeLoja(publicGuid, {
        dataInicio: selectedDate.value,
        dataFim: selectedDate.value,
        servicoIds: selectedServicoIds.value,
      })
      slots.value = data.slots
      if (data.mensagemIndisponibilidade) {
        error.value = data.mensagemIndisponibilidade
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar horários.'
      throw err
    } finally {
      loading.value = false
    }
  }

  function toggleServico(id: number) {
    const index = selectedServicoIds.value.indexOf(id)
    if (index >= 0) {
      selectedServicoIds.value = selectedServicoIds.value.filter((sid) => sid !== id)
    } else {
      selectedServicoIds.value = [...selectedServicoIds.value, id]
    }
  }

  async function goToProfissional() {
    if (selectedServicoIds.value.length === 0) {
      error.value = 'Selecione ao menos um serviço.'
      return
    }
    await loadProfissionais()
    step.value = 'profissional'
  }

  async function goToHorario() {
    step.value = 'horario'
    await loadDisponibilidade()
  }

  function goToConfirmar() {
    if (!selectedSlot.value) {
      error.value = 'Selecione um horário.'
      return
    }
    error.value = null
    step.value = 'confirmar'
  }

  async function confirmar(): Promise<AgendamentoCliente> {
    if (!selectedSlot.value) {
      throw new Error('Horário não selecionado.')
    }
    submitting.value = true
    error.value = null
    try {
      const inicio = new Date(selectedSlot.value.inicio)
      return await agendamentoService.criar({
        estabelecimentoPublicGuid: publicGuid,
        profissionalPublicGuid: selectedProfissionalGuid.value || undefined,
        servicoIds: selectedServicoIds.value,
        data: selectedDate.value,
        horarioInicio: toTimeOnlyString(inicio),
        observacao: observacao.value.trim() || undefined,
      })
    } finally {
      submitting.value = false
    }
  }

  async function init() {
    await loadServicos()
  }

  return {
    step,
    loading,
    submitting,
    error,
    servicos,
    profissionais,
    slots,
    selectedServicoIds,
    selectedProfissionalGuid,
    selectedDate,
    selectedSlot,
    observacao,
    selectedServicos,
    valorEstimado,
    toggleServico,
    loadDisponibilidade,
    goToProfissional,
    goToHorario,
    goToConfirmar,
    confirmar,
    init,
  }
}
