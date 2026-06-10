import { computed, ref, watch } from 'vue'
import { publicoService } from '@/services/publicoService'
import { agendamentoService } from '@/services/agendamentoService'
import { useAuthStore } from '@/stores/auth.store'
import type {
  AgendamentoCliente,
  AgendamentoContextoPublico,
  AgendamentoCriado,
  ServicoPublico,
  SlotDisponivel,
} from '@/types/agendamento.types'
import { addDaysToDateOnly, toDateOnlyString, toTimeOnlyString } from '@/utils/formatters'

const DISPONIBILIDADE_JANELA_DIAS = 31
import {
  clearAgendarWizardDraft,
  readAgendarWizardDraft,
  writeAgendarWizardDraft,
  type ModoIdentidadeAgendamento,
} from '@/utils/agendarWizardStorage'

export type WizardStep =
  | 'identidade'
  | 'contato'
  | 'servicos'
  | 'data'
  | 'horario'
  | 'confirmar'
  | 'sucesso'
  | 'sucesso_cadastro'

export function useAgendarWizard(publicGuid: string, profissionalPublicGuid: string) {
  const authStore = useAuthStore()
  const isVisitante = computed(() => !authStore.isAuthenticated)
  const profissionalVinculado = computed(() => profissionalPublicGuid.length > 0)

  const contexto = ref<AgendamentoContextoPublico | null>(null)
  const contextoInvalido = ref(false)
  const step = ref<WizardStep>('servicos')
  const modoIdentidade = ref<ModoIdentidadeAgendamento | null>(null)
  const loading = ref(false)
  const submitting = ref(false)
  const error = ref<string | null>(null)
  const agendamentoCriado = ref<AgendamentoCliente | AgendamentoCriado | null>(null)
  const sucessoCadastroPendente = ref(false)

  const servicos = ref<ServicoPublico[]>([])
  const slots = ref<SlotDisponivel[]>([])
  const datasAtendimento = ref<string[]>([])

  const selectedServicoIds = ref<number[]>([])
  const selectedDate = ref(toDateOnlyString(new Date()))
  const selectedSlot = ref<SlotDisponivel | null>(null)
  const observacao = ref('')
  const clienteNome = ref('')
  const clienteEmail = ref('')
  const clienteTelefone = ref('')
  const cadastroSenha = ref('')

  const selectedServicos = computed(() =>
    servicos.value.filter((s) => selectedServicoIds.value.includes(s.id)),
  )

  const valorEstimado = computed(() => {
    const selected = selectedServicos.value
    if (selected.length === 0) return 0
    return selected.reduce((sum, s) => sum + s.precoMinimo, 0)
  })

  const duracaoTotal = computed(() =>
    selectedServicos.value.reduce((sum, servico) => sum + servico.duracaoMinutosEstimada, 0),
  )

  const minSelectableDate = computed(() => toDateOnlyString(new Date()))

  const maxSelectableDate = computed(() =>
    addDaysToDateOnly(minSelectableDate.value, DISPONIBILIDADE_JANELA_DIAS - 1),
  )

  const datasAtendimentoSet = computed(() => new Set(datasAtendimento.value))

  function isDataAtendimentoPermitida(isoDate: string): boolean {
    return datasAtendimentoSet.value.has(isoDate)
  }

  function primeiraDataAtendimentoDisponivel(): string | null {
    const hoje = minSelectableDate.value
    return datasAtendimento.value.find((data) => data >= hoje) ?? null
  }

  function garantirDataAtendimentoValida(): boolean {
    if (datasAtendimento.value.length === 0) {
      error.value =
        'Não há dias de atendimento disponíveis para este profissional com os serviços selecionados.'
      return false
    }

    if (!isDataAtendimentoPermitida(selectedDate.value)) {
      const proxima = primeiraDataAtendimentoDisponivel()
      if (!proxima) {
        error.value =
          'Não há dias de atendimento disponíveis para este profissional com os serviços selecionados.'
        return false
      }
      selectedDate.value = proxima
    }

    return true
  }

  function validarServicosSelecionados(): boolean {
    if (selectedServicoIds.value.length === 0) {
      error.value = 'Selecione ao menos um serviço.'
      return false
    }

    const permitidos = new Set(servicos.value.map((servico) => servico.id))
    const invalido = selectedServicoIds.value.some((id) => !permitidos.has(id))
    if (invalido) {
      error.value = 'Um ou mais serviços selecionados não estão disponíveis para este profissional.'
      return false
    }

    return true
  }

  function validarSelecaoHorario(): boolean {
    if (!validarServicosSelecionados()) return false
    if (!garantirDataAtendimentoValida()) return false
    if (!selectedSlot.value) {
      error.value = 'Selecione um horário.'
      return false
    }

    const slotPermitido = slots.value.some((slot) => slot.inicio === selectedSlot.value?.inicio)
    if (!slotPermitido) {
      error.value = 'O horário selecionado não está mais disponível. Escolha outro horário.'
      return false
    }

    return true
  }

  async function revalidarHorarioSelecionado(): Promise<boolean> {
    if (!validarServicosSelecionados()) return false
    if (!garantirDataAtendimentoValida()) return false
    if (!selectedSlot.value) {
      error.value = 'Selecione um horário.'
      return false
    }

    const horarioReservado = selectedSlot.value.inicio
    await loadDisponibilidade()
    const aindaDisponivel = slots.value.some((slot) => slot.inicio === horarioReservado)
    if (!aindaDisponivel) {
      error.value = 'O horário selecionado não está mais disponível. Escolha outro horário.'
      selectedSlot.value = null
      return false
    }

    selectedSlot.value = slots.value.find((slot) => slot.inicio === horarioReservado) ?? null
    return selectedSlot.value !== null
  }

  async function selecionarData(data: string, carregarHorarios = true) {
    if (!isDataAtendimentoPermitida(data)) {
      error.value = 'Esta data não está na agenda do profissional.'
      return
    }

    selectedDate.value = data
    error.value = null
    selectedSlot.value = null
    if (carregarHorarios) {
      await loadDisponibilidade()
    }
  }

  function limparSenhaCadastro() {
    cadastroSenha.value = ''
  }

  function limparDadosContato() {
    clienteNome.value = ''
    clienteEmail.value = ''
    clienteTelefone.value = ''
  }

  function persistDraft() {
    if (!profissionalVinculado.value) return
    if (step.value === 'sucesso' || step.value === 'sucesso_cadastro') return

    writeAgendarWizardDraft(publicGuid, profissionalPublicGuid, {
      step: step.value,
      modoIdentidade: modoIdentidade.value,
      selectedServicoIds: selectedServicoIds.value,
      selectedProfissionalGuid: profissionalPublicGuid,
      selectedDate: selectedDate.value,
      selectedSlotInicio: selectedSlot.value?.inicio ?? null,
      observacao: observacao.value,
      clienteNome: clienteNome.value,
      clienteEmail: clienteEmail.value,
      clienteTelefone: clienteTelefone.value,
    })
  }

  function restoreDraft() {
    const draft = readAgendarWizardDraft(publicGuid, profissionalPublicGuid)
    if (!draft) return

    modoIdentidade.value = draft.modoIdentidade
    selectedServicoIds.value = draft.selectedServicoIds
    selectedDate.value = draft.selectedDate
    observacao.value = draft.observacao
    clienteNome.value = draft.clienteNome
    clienteEmail.value = draft.clienteEmail
    clienteTelefone.value = draft.clienteTelefone
    limparSenhaCadastro()

    if (draft.selectedSlotInicio) {
      selectedSlot.value = { inicio: draft.selectedSlotInicio, fim: '', profissionalId: 0 }
    }

    if (!isVisitante.value && draft.step !== 'identidade') {
      step.value = draft.step === 'sucesso_cadastro' ? 'servicos' : draft.step
    }
  }

  watch(
    [
      step,
      modoIdentidade,
      selectedServicoIds,
      selectedDate,
      selectedSlot,
      observacao,
      clienteNome,
      clienteEmail,
      clienteTelefone,
    ],
    persistDraft,
    { deep: true },
  )

  async function loadContexto() {
    if (!profissionalVinculado.value) {
      contextoInvalido.value = true
      return
    }

    loading.value = true
    error.value = null
    try {
      contexto.value = await publicoService.obterContextoLojaProfissional(
        publicGuid,
        profissionalPublicGuid,
      )
      if (!contexto.value.podeReceberAgendamento) {
        error.value = 'Este profissional não está recebendo agendamentos no momento.'
      }
    } catch {
      contextoInvalido.value = true
      error.value = 'Link de agendamento inválido ou profissional não vinculado a esta loja.'
    } finally {
      loading.value = false
    }
  }

  async function loadServicos() {
    loading.value = true
    error.value = null
    try {
      servicos.value = await publicoService.listarServicosLoja(publicGuid, profissionalPublicGuid)
      const permitidos = new Set(servicos.value.map((servico) => servico.id))
      selectedServicoIds.value = selectedServicoIds.value.filter((id) => permitidos.has(id))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar serviços.'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function loadDatasAtendimento() {
    if (selectedServicoIds.value.length === 0) return
    const data = await publicoService.consultarDisponibilidadeLoja(publicGuid, {
      dataInicio: minSelectableDate.value,
      dataFim: maxSelectableDate.value,
      servicoIds: selectedServicoIds.value,
      profissionalPublicGuid,
    })
    datasAtendimento.value = data.datasAtendimento ?? []
    if (data.mensagemIndisponibilidade && datasAtendimento.value.length === 0) {
      error.value = data.mensagemIndisponibilidade
    }
  }

  async function loadDisponibilidade() {
    if (selectedServicoIds.value.length === 0) return
    if (!garantirDataAtendimentoValida()) {
      slots.value = []
      return
    }

    loading.value = true
    error.value = null
    selectedSlot.value = null
    const dataConsulta = selectedDate.value
    try {
      const data = await publicoService.consultarDisponibilidadeLoja(publicGuid, {
        dataInicio: dataConsulta,
        dataFim: dataConsulta,
        servicoIds: selectedServicoIds.value,
        profissionalPublicGuid,
      })
      slots.value = data.slots
      if (data.datasAtendimento?.length) {
        const merged = new Set([...datasAtendimento.value, ...data.datasAtendimento])
        datasAtendimento.value = [...merged].sort()
      } else if (!isDataAtendimentoPermitida(dataConsulta)) {
        datasAtendimento.value = datasAtendimento.value.filter((dia) => dia !== dataConsulta)
        if (selectedDate.value === dataConsulta) {
          const proxima = primeiraDataAtendimentoDisponivel()
          if (proxima) selectedDate.value = proxima
        }
      }
      const draft = readAgendarWizardDraft(publicGuid, profissionalPublicGuid)
      if (draft?.selectedSlotInicio) {
        const match = data.slots.find((slot) => slot.inicio === draft.selectedSlotInicio)
        if (match) selectedSlot.value = match
      }
      if (data.mensagemIndisponibilidade && slots.value.length === 0) {
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

  function contatoGuestPreenchido(): boolean {
    return (
      clienteNome.value.trim().length > 0
      && clienteEmail.value.trim().length > 0
      && clienteTelefone.value.trim().length > 0
    )
  }

  function escolherIdentidade(modo: ModoIdentidadeAgendamento) {
    modoIdentidade.value = modo
    error.value = null
    if (modo === 'guest') {
      step.value = 'contato'
      return
    }
    if (modo === 'register') {
      step.value = 'servicos'
      void loadServicos()
    }
  }

  function voltarParaIdentidade() {
    modoIdentidade.value = null
    error.value = null
    limparSenhaCadastro()
    limparDadosContato()
    clearAgendarWizardDraft(publicGuid, profissionalPublicGuid)
    step.value = 'identidade'
  }

  function voltarDeServicos() {
    error.value = null
    if (modoIdentidade.value === 'guest') {
      step.value = 'contato'
      return
    }
    voltarParaIdentidade()
  }

  async function continuarDeContato() {
    if (!validarDadosContato()) return
    error.value = null
    step.value = 'servicos'
    if (servicos.value.length === 0) {
      loading.value = true
      try {
        await loadServicos()
      } finally {
        loading.value = false
      }
    }
  }

  async function goToData() {
    if (selectedServicoIds.value.length === 0) {
      error.value = 'Selecione ao menos um serviço.'
      return
    }
    step.value = 'data'
    loading.value = true
    error.value = null
    try {
      await loadDatasAtendimento()
      if (!garantirDataAtendimentoValida()) {
        slots.value = []
      }
    } finally {
      loading.value = false
    }
  }

  async function goToHorario() {
    if (!validarServicosSelecionados()) return
    if (!garantirDataAtendimentoValida()) return

    step.value = 'horario'
    loading.value = true
    error.value = null
    try {
      await loadDisponibilidade()
    } finally {
      loading.value = false
    }
  }

  function voltarDeData() {
    error.value = null
    step.value = 'servicos'
  }

  function voltarDeHorario() {
    error.value = null
    selectedSlot.value = null
    step.value = 'data'
  }

  function voltarDeConfirmar() {
    error.value = null
    step.value = 'horario'
  }

  function goToConfirmar() {
    if (!validarSelecaoHorario()) return
    error.value = null
    step.value = 'confirmar'
  }

  function validarDadosContato(): boolean {
    if (!isVisitante.value || modoIdentidade.value !== 'guest') return true

    const nome = clienteNome.value.trim()
    const email = clienteEmail.value.trim()
    const telefone = clienteTelefone.value.trim()

    if (!nome || !email || !telefone) {
      error.value = 'Informe nome, e-mail e telefone para continuar.'
      return false
    }

    if (!email.includes('@') || !email.includes('.')) {
      error.value = 'Informe um e-mail válido.'
      return false
    }

    return true
  }

  function validarCadastro(): boolean {
    const nome = clienteNome.value.trim()
    const email = clienteEmail.value.trim()
    const telefone = clienteTelefone.value.trim()
    const senha = cadastroSenha.value

    if (!nome || !email || !telefone || !senha) {
      error.value = 'Preencha todos os dados de cadastro.'
      return false
    }

    if (senha.length < 6) {
      error.value = 'A senha deve ter pelo menos 6 caracteres.'
      return false
    }

    return true
  }

  async function confirmar(): Promise<AgendamentoCliente | AgendamentoCriado> {
    if (!profissionalPublicGuid) {
      throw new Error('Profissional não informado.')
    }

    if (!(await revalidarHorarioSelecionado())) {
      throw new Error(error.value ?? 'Seleção de horário inválida.')
    }

    const slot = selectedSlot.value
    if (!slot) {
      throw new Error('Seleção de horário inválida.')
    }

    submitting.value = true
    error.value = null
    try {
      const inicio = new Date(slot.inicio)
      const horarioInicio = toTimeOnlyString(inicio)
      const observacaoTrim = observacao.value.trim() || undefined
      const payloadBase = {
        profissionalPublicGuid,
        servicoIds: selectedServicoIds.value,
        data: selectedDate.value,
        horarioInicio,
        observacao: observacaoTrim,
      }

      if (isVisitante.value && modoIdentidade.value === 'register') {
        if (!validarCadastro()) {
          throw new Error(error.value ?? 'Dados de cadastro inválidos.')
        }

        const criado = await publicoService.criarAgendamentoComCadastro(publicGuid, {
          ...payloadBase,
          cadastro: {
            nome: clienteNome.value.trim(),
            email: clienteEmail.value.trim(),
            telefone: clienteTelefone.value.trim(),
            senha: cadastroSenha.value,
          },
        })
        agendamentoCriado.value = criado
        sucessoCadastroPendente.value = true
        step.value = 'sucesso_cadastro'
        limparSenhaCadastro()
        limparDadosContato()
        clearAgendarWizardDraft(publicGuid, profissionalPublicGuid)
        return criado
      }

      if (isVisitante.value) {
        if (!validarDadosContato()) {
          throw new Error(error.value ?? 'Dados do cliente inválidos.')
        }

        const criado = await publicoService.criarAgendamentoLoja(publicGuid, {
          ...payloadBase,
          clienteNome: clienteNome.value.trim(),
          clienteEmail: clienteEmail.value.trim(),
          clienteTelefone: clienteTelefone.value.trim(),
        })
        agendamentoCriado.value = criado
        step.value = 'sucesso'
        limparDadosContato()
        clearAgendarWizardDraft(publicGuid, profissionalPublicGuid)
        return criado
      }

      const criado = await agendamentoService.criar({
        estabelecimentoPublicGuid: publicGuid,
        ...payloadBase,
      })
      agendamentoCriado.value = criado
      clearAgendarWizardDraft(publicGuid, profissionalPublicGuid)
      return criado
    } finally {
      limparSenhaCadastro()
      submitting.value = false
    }
  }

  async function init() {
    restoreDraft()
    await loadContexto()
    if (contextoInvalido.value) return

    if (isVisitante.value && !modoIdentidade.value) {
      step.value = 'identidade'
      return
    }

    if (isVisitante.value && modoIdentidade.value === 'guest' && !contatoGuestPreenchido()) {
      step.value = 'contato'
      return
    }

    await loadServicos()
    if (selectedServicoIds.value.length > 0 && (step.value === 'data' || step.value === 'horario')) {
      await loadDatasAtendimento()
      if (garantirDataAtendimentoValida() && step.value === 'horario') {
        await loadDisponibilidade()
      }
    }
  }

  return {
    step,
    modoIdentidade,
    loading,
    submitting,
    error,
    contexto,
    contextoInvalido,
    agendamentoCriado,
    sucessoCadastroPendente,
    isVisitante,
    profissionalVinculado,
    servicos,
    slots,
    datasAtendimento,
    minSelectableDate,
    maxSelectableDate,
    isDataAtendimentoPermitida,
    selectedServicoIds,
    selectedDate,
    selectedSlot,
    observacao,
    clienteNome,
    clienteEmail,
    clienteTelefone,
    cadastroSenha,
    selectedServicos,
    valorEstimado,
    duracaoTotal,
    toggleServico,
    escolherIdentidade,
    voltarParaIdentidade,
    voltarDeServicos,
    voltarDeData,
    voltarDeHorario,
    voltarDeConfirmar,
    continuarDeContato,
    loadDisponibilidade,
    selecionarData,
    goToData,
    goToHorario,
    goToConfirmar,
    confirmar,
    init,
    persistDraft,
  }
}
