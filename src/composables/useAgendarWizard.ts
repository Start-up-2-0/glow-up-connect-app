import { computed, ref, watch } from 'vue'
import { publicoService } from '@/services/publicoService'
import { agendamentoService } from '@/services/agendamentoService'
import { useAuthStore } from '@/stores/auth.store'
import type {
  AgendamentoCliente,
  AgendamentoContextoPublico,
  AgendamentoCriado,
  ProfissionalPublico,
  ServicoPublico,
  SlotDisponivel,
} from '@/types/agendamento.types'
import type { EstabelecimentoPublico } from '@/types/estabelecimento.types'
import {
  addDaysToDateOnly,
  toAgendaTimeOnlyString,
  toDateOnlyFromIsoUtc,
  toDateOnlyString,
} from '@/utils/formatters'
import {
  clearAgendarWizardDraft,
  readAgendarWizardDraft,
  writeAgendarWizardDraft,
  type ModoIdentidadeAgendamento,
} from '@/utils/agendarWizardStorage'

const DISPONIBILIDADE_JANELA_DIAS = 31

export type WizardStep =
  | 'identidade'
  | 'contato'
  | 'profissional'
  | 'servicos'
  | 'data'
  | 'horario'
  | 'confirmar'
  | 'sucesso'
  | 'sucesso_cadastro'

export type ModoProfissionalAgendamento = 'especifico' | 'sem_preferencia'

export function useAgendarWizard(publicGuid: string, initialProfissionalGuid = '') {
  const authStore = useAuthStore()
  const isVisitante = computed(() => !authStore.isAuthenticated)
  const isModoInterno = computed(() => !isVisitante.value)

  const activeProfissionalGuid = ref(initialProfissionalGuid)
  const semPreferenciaProfissional = ref(false)
  const modoProfissional = ref<ModoProfissionalAgendamento | null>(null)
  const profissionais = ref<ProfissionalPublico[]>([])
  const estabelecimentoResumo = ref<EstabelecimentoPublico | null>(null)

  const profissionalVinculado = computed(
    () => activeProfissionalGuid.value.length > 0 || semPreferenciaProfissional.value,
  )

  const profissionalSelecionadoNome = computed(() => {
    if (semPreferenciaProfissional.value) return 'Sem preferência'
    const prof = profissionais.value.find((p) => p.publicGuid === activeProfissionalGuid.value)
    return prof?.nomePublico ?? contexto.value?.profissional?.nomePublico ?? '—'
  })

  const estabelecimentoNome = computed(
    () =>
      contexto.value?.estabelecimento?.nome
      ?? estabelecimentoResumo.value?.nome
      ?? '—',
  )

  const contexto = ref<AgendamentoContextoPublico | null>(null)
  const contextoInvalido = ref(false)
  const step = ref<WizardStep>(initialProfissionalGuid ? 'servicos' : 'profissional')
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

  const draftKey = computed(() =>
    activeProfissionalGuid.value || (semPreferenciaProfissional.value ? 'sem-preferencia' : ''),
  )

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

  const slotsDoDia = computed(() =>
    slots.value.filter((slot) => toDateOnlyFromIsoUtc(slot.inicio) === selectedDate.value),
  )

  const minSelectableDate = computed(() => toDateOnlyString(new Date()))

  const maxSelectableDate = computed(() =>
    addDaysToDateOnly(minSelectableDate.value, DISPONIBILIDADE_JANELA_DIAS - 1),
  )

  const datasAtendimentoSet = computed(() => new Set(datasAtendimento.value))

  function guidProfissionalApi(): string | undefined {
    return activeProfissionalGuid.value || undefined
  }

  function isDataAtendimentoPermitida(isoDate: string): boolean {
    return datasAtendimentoSet.value.has(isoDate)
  }

  function normalizarDatasAtendimento(datas: string[]): string[] {
    const hoje = minSelectableDate.value
    return [...new Set(datas.filter((data) => data >= hoje))].sort()
  }

  function primeiraDataAtendimentoDisponivel(): string | null {
    const hoje = minSelectableDate.value
    return datasAtendimento.value.find((data) => data >= hoje) ?? null
  }

  function garantirDataAtendimentoValida(): boolean {
    if (datasAtendimento.value.length === 0) {
      error.value =
        'Não há dias de atendimento disponíveis com os serviços selecionados.'
      return false
    }

    if (!isDataAtendimentoPermitida(selectedDate.value)) {
      const proxima = primeiraDataAtendimentoDisponivel()
      if (!proxima) {
        error.value =
          'Não há dias de atendimento disponíveis com os serviços selecionados.'
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
      error.value = 'Um ou mais serviços selecionados não estão disponíveis.'
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

    const slotPermitido = slotsDoDia.value.some((slot) => slot.inicio === selectedSlot.value?.inicio)
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
    const aindaDisponivel = slotsDoDia.value.some((slot) => slot.inicio === horarioReservado)
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
      error.value = 'Esta data não está na agenda disponível.'
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
    if (!draftKey.value) return
    if (step.value === 'sucesso' || step.value === 'sucesso_cadastro') return

    writeAgendarWizardDraft(publicGuid, draftKey.value, {
      step: step.value,
      modoIdentidade: modoIdentidade.value,
      selectedServicoIds: selectedServicoIds.value,
      selectedProfissionalGuid: activeProfissionalGuid.value,
      selectedDate: selectedDate.value,
      selectedSlotInicio: selectedSlot.value?.inicio ?? null,
      observacao: observacao.value,
      clienteNome: clienteNome.value,
      clienteEmail: clienteEmail.value,
      clienteTelefone: clienteTelefone.value,
    })
  }

  function restoreDraft() {
    if (!draftKey.value) return
    const draft = readAgendarWizardDraft(publicGuid, draftKey.value)
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
      activeProfissionalGuid,
      semPreferenciaProfissional,
    ],
    persistDraft,
    { deep: true },
  )

  async function loadEstabelecimentoResumo() {
    try {
      estabelecimentoResumo.value = await publicoService.obterEstabelecimento(publicGuid)
    } catch {
      estabelecimentoResumo.value = null
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

  async function loadContexto() {
    if (!activeProfissionalGuid.value) {
      contexto.value = null
      contextoInvalido.value = false
      return
    }

    loading.value = true
    error.value = null
    try {
      contexto.value = await publicoService.obterContextoLojaProfissional(
        publicGuid,
        activeProfissionalGuid.value,
      )
      if (!contexto.value.podeReceberAgendamento) {
        error.value = 'Este profissional não está recebendo agendamentos no momento.'
      }
    } catch {
      contextoInvalido.value = true
      error.value = 'Profissional não vinculado a esta loja.'
    } finally {
      loading.value = false
    }
  }

  async function loadServicos() {
    loading.value = true
    error.value = null
    try {
      servicos.value = await publicoService.listarServicosLoja(publicGuid, guidProfissionalApi())
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
      profissionalPublicGuid: guidProfissionalApi(),
    })
    datasAtendimento.value = normalizarDatasAtendimento(data.datasAtendimento ?? [])
    if (data.mensagemIndisponibilidade && datasAtendimento.value.length === 0) {
      error.value = data.mensagemIndisponibilidade
    }
    garantirDataAtendimentoValida()
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
        profissionalPublicGuid: guidProfissionalApi(),
      })
      slots.value = data.slots.filter(
        (slot) => toDateOnlyFromIsoUtc(slot.inicio) === dataConsulta,
      )
      if (data.datasAtendimento?.length) {
        datasAtendimento.value = normalizarDatasAtendimento([
          ...datasAtendimento.value,
          ...data.datasAtendimento,
        ])
      } else if (!isDataAtendimentoPermitida(dataConsulta)) {
        datasAtendimento.value = datasAtendimento.value.filter((dia) => dia !== dataConsulta)
        if (selectedDate.value === dataConsulta) {
          const proxima = primeiraDataAtendimentoDisponivel()
          if (proxima) selectedDate.value = proxima
        }
      }
      if (draftKey.value) {
        const draft = readAgendarWizardDraft(publicGuid, draftKey.value)
        if (draft?.selectedSlotInicio) {
          const match = data.slots.find((slot) => slot.inicio === draft.selectedSlotInicio)
          if (match) selectedSlot.value = match
        }
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

  function escolherModoProfissional(modo: ModoProfissionalAgendamento) {
    modoProfissional.value = modo
    error.value = null
    if (modo === 'sem_preferencia') {
      activeProfissionalGuid.value = ''
      semPreferenciaProfissional.value = true
      contexto.value = null
    } else {
      semPreferenciaProfissional.value = false
    }
  }

  function selecionarProfissional(guid: string) {
    activeProfissionalGuid.value = guid
    semPreferenciaProfissional.value = false
    modoProfissional.value = 'especifico'
    error.value = null
  }

  async function continuarDeProfissional() {
    if (modoProfissional.value === 'sem_preferencia') {
      if (isVisitante.value && modoIdentidade.value === 'register') {
        error.value = 'Para criar conta, escolha um profissional específico.'
        return
      }
      semPreferenciaProfissional.value = true
      activeProfissionalGuid.value = ''
      step.value = 'servicos'
      await loadServicos()
      return
    }

    if (modoProfissional.value === 'especifico') {
      if (!activeProfissionalGuid.value) {
        error.value = 'Selecione um profissional para continuar.'
        return
      }
      step.value = 'servicos'
      loading.value = true
      try {
        await loadContexto()
        if (contextoInvalido.value) return
        await loadServicos()
      } finally {
        loading.value = false
      }
      return
    }

    error.value = 'Escolha como deseja selecionar o profissional.'
  }

  function escolherIdentidade(modo: ModoIdentidadeAgendamento) {
    modoIdentidade.value = modo
    error.value = null
    if (modo === 'guest') {
      step.value = 'contato'
      return
    }
    if (modo === 'register') {
      step.value = initialProfissionalGuid ? 'servicos' : 'profissional'
      if (initialProfissionalGuid) void loadServicos()
    }
  }

  function voltarParaIdentidade() {
    modoIdentidade.value = null
    error.value = null
    limparSenhaCadastro()
    limparDadosContato()
    if (draftKey.value) clearAgendarWizardDraft(publicGuid, draftKey.value)
    step.value = 'identidade'
  }

  function voltarDeProfissional() {
    error.value = null
    if (isVisitante.value) {
      if (modoIdentidade.value === 'guest') {
        step.value = 'contato'
        return
      }
      voltarParaIdentidade()
      return
    }
    modoProfissional.value = null
    activeProfissionalGuid.value = initialProfissionalGuid
    semPreferenciaProfissional.value = false
  }

  function voltarDeServicos() {
    error.value = null
    if (modoIdentidade.value === 'guest') {
      step.value = 'contato'
      return
    }
    if (initialProfissionalGuid) {
      voltarParaIdentidade()
      return
    }
    step.value = 'profissional'
  }

  async function continuarDeContato() {
    if (!validarDadosContato()) return
    error.value = null
    step.value = initialProfissionalGuid ? 'servicos' : 'profissional'
    if (initialProfissionalGuid && servicos.value.length === 0) {
      loading.value = true
      try {
        await loadServicos()
      } finally {
        loading.value = false
      }
    } else if (!initialProfissionalGuid) {
      await loadProfissionais()
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
    if (!profissionalVinculado.value) {
      throw new Error('Selecione um profissional ou continue sem preferência.')
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
      const inicioSelecionado = slot.inicio
      const horarioInicio = toAgendaTimeOnlyString(inicioSelecionado)
      const observacaoTrim = observacao.value.trim() || undefined
      const profGuid = activeProfissionalGuid.value || undefined
      const payloadBase = {
        ...(profGuid ? { profissionalPublicGuid: profGuid } : {}),
        servicoIds: selectedServicoIds.value,
        data: toDateOnlyFromIsoUtc(inicioSelecionado),
        horarioInicio,
        inicioSelecionado,
        observacao: observacaoTrim,
      }

      if (isVisitante.value && modoIdentidade.value === 'register') {
        if (!profGuid) {
          throw new Error('Escolha um profissional específico para criar conta e agendar.')
        }
        if (!validarCadastro()) {
          throw new Error(error.value ?? 'Dados de cadastro inválidos.')
        }

        const criado = await publicoService.criarAgendamentoComCadastro(publicGuid, {
          ...payloadBase,
          profissionalPublicGuid: profGuid,
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
        if (draftKey.value) clearAgendarWizardDraft(publicGuid, draftKey.value)
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
        if (draftKey.value) clearAgendarWizardDraft(publicGuid, draftKey.value)
        return criado
      }

      const criado = await agendamentoService.criar({
        estabelecimentoPublicGuid: publicGuid,
        ...payloadBase,
      })
      agendamentoCriado.value = criado
      if (draftKey.value) clearAgendarWizardDraft(publicGuid, draftKey.value)
      return criado
    } finally {
      limparSenhaCadastro()
      submitting.value = false
    }
  }

  async function init() {
    contextoInvalido.value = false

    if (initialProfissionalGuid) {
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
      return
    }

    await Promise.all([loadEstabelecimentoResumo(), loadProfissionais()])

    if (isVisitante.value && !modoIdentidade.value) {
      step.value = 'identidade'
      return
    }

    if (isVisitante.value && modoIdentidade.value === 'guest' && !contatoGuestPreenchido()) {
      step.value = 'contato'
      return
    }

    step.value = 'profissional'
  }

  return {
    step,
    modoIdentidade,
    modoProfissional,
    loading,
    submitting,
    error,
    contexto,
    contextoInvalido,
    agendamentoCriado,
    sucessoCadastroPendente,
    isVisitante,
    isModoInterno,
    profissionalVinculado,
    profissionais,
    profissionalSelecionadoNome,
    estabelecimentoNome,
    servicos,
    slots,
    slotsDoDia,
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
    activeProfissionalGuid,
    semPreferenciaProfissional,
    toggleServico,
    escolherIdentidade,
    escolherModoProfissional,
    selecionarProfissional,
    continuarDeProfissional,
    voltarParaIdentidade,
    voltarDeProfissional,
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
