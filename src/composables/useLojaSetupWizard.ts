import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ROUTE_PATHS } from '@/constants/routes'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { useTrocarEstabelecimento } from '@/composables/useTrocarEstabelecimento'
import { assinaturaService } from '@/services/assinaturaService'
import { equipeService } from '@/services/equipeService'
import { servicoService } from '@/services/servicoService'
import { horarioService } from '@/services/horarioService'
import { estabelecimentoPerfilService } from '@/services/estabelecimentoPerfilService'
import { draftEnderecoToApi, validateEnderecoForSubmit } from '@/utils/enderecoPayload'
import { telefoneToApi } from '@/utils/formatters'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'
import type { EstabelecimentoPerfilCompleto } from '@/types/estabelecimento.types'
import type {
  LojaSetupDraft,
  LojaSetupLojaSubstep,
  LojaSetupMode,
  LojaSetupStepId,
} from '@/types/lojaSetup.types'
import type { OnboardingEtapaStatus } from '@/types/onboardingPublicacao.types'
import { mapBackendStepToWizardStep } from '@/types/onboardingPublicacao.types'
import {
  emptyLojaSetupSkipped,
  LOJA_SETUP_STEPS,
  LOJA_SETUP_STEP_SUBTITLES,
  LOJA_SETUP_STEP_SUBTITLES_AUTONOMO,
  LOJA_SETUP_STORAGE_KEY,
} from '@/types/lojaSetup.types'

function emptyEstabelecimento(): OnboardingEstabelecimentoDraft {
  return {
    nome: '',
    descricao: '',
    telefone: '',
    email: '',
    cep: '',
    logradouro: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    complemento: '',
    logoDataUrl: null,
    categoriaId: undefined,
    comodidadeIds: [],
  }
}

function loadStored(): LojaSetupDraft | null {
  try {
    const raw = sessionStorage.getItem(LOJA_SETUP_STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as LojaSetupDraft
  } catch {
    return null
  }
}

function saveStored(draft: LojaSetupDraft) {
  sessionStorage.setItem(LOJA_SETUP_STORAGE_KEY, JSON.stringify(draft))
}

export function clearLojaSetupDraft() {
  sessionStorage.removeItem(LOJA_SETUP_STORAGE_KEY)
}

function createDraft(mode: LojaSetupMode): LojaSetupDraft {
  return {
    mode,
    step: mode === 'adicionar-unidade' ? 'loja' : 'equipe',
    lojaSubstep: 'informacoes-basicas',
    estabelecimentoId: null,
    assinaturaId: null,
    skipped: emptyLojaSetupSkipped(),
  }
}

export function useLojaSetupWizard() {
  const route = useRoute()
  const router = useRouter()
  const negocioStore = useNegocioStore()
  const assinaturaStore = useAssinaturaStore()
  const notifications = useNotificationsStore()
  const { resolveError } = useApiError()
  const { trocarEstabelecimento } = useTrocarEstabelecimento()
  const { ehProfissionalAutonomo, estabelecimentoAtivo } = storeToRefs(negocioStore)

  const mode = computed<LojaSetupMode>(() =>
    route.query.mode === 'assinatura' ? 'assinatura' : 'adicionar-unidade',
  )

  const draft = ref<LojaSetupDraft>(createDraft(mode.value))
  const estabelecimentoDraft = ref<OnboardingEstabelecimentoDraft>(emptyEstabelecimento())
  const perfil = ref<EstabelecimentoPerfilCompleto | null>(null)
  const etapasPublicacao = ref<OnboardingEtapaStatus[]>([])
  const loading = ref(true)
  const submitting = ref(false)
  const erro = ref<string | null>(null)

  const contagens = ref({ equipe: 0, servicos: 0, horariosAtivos: 0 })

  const visibleSteps = computed(() => {
    let steps = [...LOJA_SETUP_STEPS]
    if (ehProfissionalAutonomo.value) {
      steps = steps.filter((s) => s.id !== 'equipe')
    }
    // Assinatura: loja já foi criada no fluxo anterior
    if (mode.value === 'assinatura' || draft.value.estabelecimentoId) {
      if (mode.value === 'assinatura') {
        steps = steps.filter((s) => s.id !== 'loja')
      } else if (draft.value.estabelecimentoId && draft.value.step !== 'loja') {
        steps = steps.filter((s) => s.id !== 'loja')
      }
    }
    return steps
  })

  const step = computed(() => draft.value.step)
  const lojaSubstep = computed(() => draft.value.lojaSubstep)
  const stepperIndex = computed(() => {
    const idx = visibleSteps.value.findIndex((s) => s.id === draft.value.step)
    return idx >= 0 ? idx : 0
  })
  const stepSubtitle = computed(() =>
    ehProfissionalAutonomo.value
      ? (LOJA_SETUP_STEP_SUBTITLES_AUTONOMO[draft.value.step]
        ?? LOJA_SETUP_STEP_SUBTITLES[draft.value.step])
      : LOJA_SETUP_STEP_SUBTITLES[draft.value.step],
  )
  const skippedIds = computed(() => [] as string[])

  const etapasConcluidas = computed(() =>
    etapasPublicacao.value.filter((etapa) => etapa.concluida).map((etapa) => etapa.id),
  )

  const pageTitle = computed(() => {
    if (mode.value === 'adicionar-unidade') return 'Adicionar loja'
    return ehProfissionalAutonomo.value ? 'Configurar perfil' : 'Configurar loja'
  })
  const pageDescription = computed(() => {
    if (mode.value === 'adicionar-unidade') {
      return 'Cadastre a nova unidade e deixe a operação pronta antes de acessar o painel.'
    }
    return ehProfissionalAutonomo.value
      ? 'Configure serviços e horários para começar a receber agendamentos.'
      : 'Configure equipe, serviços e horários para começar a receber agendamentos.'
  })

  function persist() {
    saveStored(draft.value)
  }

  function setStep(next: LojaSetupStepId) {
    draft.value.step = next
    persist()
  }

  function setLojaSubstep(next: LojaSetupLojaSubstep) {
    draft.value.lojaSubstep = next
    persist()
  }

  async function refreshContagens(estabelecimentoId: number) {
    try {
      const servicosPromise = servicoService.listar(estabelecimentoId).catch(() => [])
      if (ehProfissionalAutonomo.value) {
        const profissionalId = estabelecimentoAtivo.value?.profissionalId ?? undefined
        const [servicos, horarios] = await Promise.all([
          servicosPromise,
          horarioService
            .listarProfissionais(estabelecimentoId, { profissionalId, ativo: true })
            .catch(() => []),
        ])
        contagens.value = {
          equipe: 0,
          servicos: servicos.filter((s) => s.ativo).length,
          horariosAtivos: horarios.filter((h) => h.ativo).length,
        }
        return
      }

      const [membrosPage, servicos, horarios] = await Promise.all([
        equipeService.listarMembros(estabelecimentoId, { tamanhoPagina: 50 }).catch(() => null),
        servicosPromise,
        horarioService.listarLoja(estabelecimentoId).catch(() => []),
      ])
      const membros = membrosPage?.itens ?? []
      contagens.value = {
        equipe: membros.filter((m) => m.ativo && m.role !== 'Owner' && m.tipo !== 'convite').length,
        servicos: servicos.filter((s) => s.ativo).length,
        horariosAtivos: horarios.filter((h) => h.ativo).length,
      }
    } catch {
      contagens.value = { equipe: 0, servicos: 0, horariosAtivos: 0 }
    }
  }

  async function loadPerfil(estabelecimentoId: number) {
    try {
      perfil.value = await estabelecimentoPerfilService.obterPerfil(estabelecimentoId)
    } catch {
      perfil.value = null
    }
  }

  async function carregarStatusPublicacao(estabelecimentoId: number) {
    try {
      const status = await assinaturaService.obterStatusPublicacao(estabelecimentoId)
      etapasPublicacao.value = status.etapas
      return status
    } catch {
      etapasPublicacao.value = []
      return null
    }
  }

  function resolverStepInicial(
    _estabelecimentoId: number,
    backendStep: string | null | undefined,
    queryStep?: string,
  ): LojaSetupStepId {
    if (queryStep === 'equipe' || queryStep === 'servicos' || queryStep === 'horarios' || queryStep === 'revisao') {
      return queryStep
    }
    return mapBackendStepToWizardStep(backendStep, ehProfissionalAutonomo.value)
  }

  async function init() {
    loading.value = true
    erro.value = null
    try {
      const queryEstabId = Number(route.query.estabelecimentoId)
      const queryAssinaturaId = Number(route.query.assinaturaId)
      const stored = loadStored()

      draft.value = {
        ...createDraft(mode.value),
        ...(stored && stored.mode === mode.value ? stored : {}),
        mode: mode.value,
      }

      if (Number.isFinite(queryEstabId) && queryEstabId > 0) {
        draft.value.estabelecimentoId = queryEstabId
      }
      if (Number.isFinite(queryAssinaturaId) && queryAssinaturaId > 0) {
        draft.value.assinaturaId = queryAssinaturaId
      }

      if (mode.value === 'adicionar-unidade' && negocioStore.role !== 'Owner') {
        notifications.push('warning', 'Apenas o proprietário pode adicionar lojas.')
        await router.replace(ROUTE_PATHS.DASHBOARD)
        return
      }

      if (mode.value === 'adicionar-unidade' && !draft.value.assinaturaId) {
        try {
          const ctx = await assinaturaService.obterContextoOnboarding()
          draft.value.assinaturaId = ctx.assinaturaPremiumId
          if (!ctx.podeAdicionarLoja && !draft.value.estabelecimentoId) {
            notifications.push('warning', 'Não é possível adicionar uma nova loja no momento.')
            await router.replace(ROUTE_PATHS.MINHAS_LOJAS)
            return
          }
        } catch (err) {
          erro.value = resolveError(err)
        }
      }

      const estabId = draft.value.estabelecimentoId
      const queryStep = typeof route.query.step === 'string' ? route.query.step : undefined
      if (estabId) {
        await trocarEstabelecimento(estabId)
        const [status] = await Promise.all([
          carregarStatusPublicacao(estabId),
          refreshContagens(estabId),
          loadPerfil(estabId),
        ])
        if (mode.value === 'assinatura' || draft.value.step !== 'loja') {
          draft.value.step = resolverStepInicial(
            estabId,
            status?.proximaEtapa,
            queryStep,
          )
        }
      } else if (mode.value === 'assinatura') {
        const ativo = estabelecimentoAtivo.value?.estabelecimentoId
        if (ativo) {
          draft.value.estabelecimentoId = ativo
          const [status] = await Promise.all([
            carregarStatusPublicacao(ativo),
            refreshContagens(ativo),
            loadPerfil(ativo),
          ])
          draft.value.step = resolverStepInicial(
            ativo,
            status?.proximaEtapa,
            queryStep,
          )
        }
      } else {
        draft.value.step = 'loja'
        draft.value.lojaSubstep = 'informacoes-basicas'
      }

      if (ehProfissionalAutonomo.value && draft.value.step === 'equipe') {
        draft.value.step = 'servicos'
      }

      persist()
    } finally {
      loading.value = false
    }
  }

  function avancarDeInformacoesBasicas(dados: OnboardingEstabelecimentoDraft) {
    estabelecimentoDraft.value = { ...dados }
    setLojaSubstep('endereco')
  }

  function voltarDeEndereco() {
    setLojaSubstep('informacoes-basicas')
  }

  async function criarUnidade(dados: OnboardingEstabelecimentoDraft) {
    const assinaturaId = draft.value.assinaturaId
    if (!assinaturaId) {
      erro.value = 'Assinatura Premium não encontrada.'
      return
    }
    if (!dados.logoDataUrl) {
      erro.value = 'Logo do estabelecimento é obrigatória.'
      return
    }
    const enderecoError = validateEnderecoForSubmit(dados)
    if (enderecoError) {
      erro.value = enderecoError
      return
    }

    submitting.value = true
    erro.value = null
    try {
      estabelecimentoDraft.value = { ...dados }
      const resultado = await assinaturaStore.adicionarEstabelecimento(assinaturaId, {
        estabelecimento: {
          nome: dados.nome,
          descricao: dados.descricao || undefined,
          logo: dados.logoDataUrl,
          telefone: telefoneToApi(dados.telefone) || undefined,
          email: dados.email || undefined,
          categoriaId: dados.categoriaId,
        endereco: draftEnderecoToApi(dados),
        comodidadeIds: dados.comodidadeIds,
        },
      })
      draft.value.estabelecimentoId = resultado.estabelecimentoId
      await trocarEstabelecimento(resultado.estabelecimentoId)
      await Promise.all([
        refreshContagens(resultado.estabelecimentoId),
        loadPerfil(resultado.estabelecimentoId),
      ])
      notifications.push('success', `Loja "${resultado.nome}" criada.`)
      if (ehProfissionalAutonomo.value) {
        setStep('servicos')
      } else {
        setStep('equipe')
      }
    } catch (err) {
      erro.value = resolveError(err)
    } finally {
      submitting.value = false
    }
  }

  function skipStep(_id: 'equipe' | 'servicos' | 'horarios') {
    notifications.push(
      'info',
      'Esta etapa é obrigatória para publicar seu perfil e receber agendamentos.',
    )
  }

  async function goNextFromOps(from: LojaSetupStepId) {
    const estabId = draft.value.estabelecimentoId
    if (estabId) {
      await refreshContagens(estabId)
      const status = await carregarStatusPublicacao(estabId)
      if (status?.proximaEtapa) {
        setStep(mapBackendStepToWizardStep(status.proximaEtapa, ehProfissionalAutonomo.value))
        return
      }
    }
    const order: LojaSetupStepId[] = ehProfissionalAutonomo.value
      ? ['servicos', 'horarios', 'revisao']
      : ['equipe', 'servicos', 'horarios', 'revisao']
    const idx = order.indexOf(from)
    setStep(order[idx + 1] ?? 'revisao')
  }

  function goToStep(id: LojaSetupStepId) {
    if (id === 'loja' && draft.value.estabelecimentoId && mode.value === 'assinatura') {
      return
    }
    if (id !== 'loja' && !draft.value.estabelecimentoId) {
      notifications.push('info', 'Cadastre a loja antes de continuar.')
      return
    }
    setStep(id)
  }

  async function concluir() {
    const estabId = draft.value.estabelecimentoId
    if (!estabId) {
      erro.value = 'Estabelecimento não encontrado.'
      return
    }

    submitting.value = true
    erro.value = null
    try {
      const status = await assinaturaService.recalcularPublicacao(estabId)
      etapasPublicacao.value = status.etapas
      await negocioStore.fetchEstabelecimentos(true)

      if (status.onboardingObrigatorioPendente) {
        const pendencias = status.etapas
          .filter((etapa) => !etapa.concluida)
          .flatMap((etapa) => etapa.pendencias)
        erro.value = pendencias[0]
          ?? 'Conclua todas as etapas obrigatórias antes de acessar o painel.'
        draft.value.step = mapBackendStepToWizardStep(
          status.proximaEtapa,
          ehProfissionalAutonomo.value,
        )
        persist()
        notifications.push('warning', 'Ainda faltam requisitos para publicar seu perfil.')
        return
      }

      clearLojaSetupDraft()
      notifications.push('success', 'Configuração concluída. Seu perfil já está público!')
      await router.push(ROUTE_PATHS.DASHBOARD)
    } catch (err) {
      erro.value = resolveError(err)
    } finally {
      submitting.value = false
    }
  }

  return {
    mode,
    draft,
    estabelecimentoDraft,
    perfil,
    loading,
    submitting,
    erro,
    contagens,
    visibleSteps,
    step,
    lojaSubstep,
    stepperIndex,
    stepSubtitle,
    skippedIds,
    etapasPublicacao,
    etapasConcluidas,
    pageTitle,
    pageDescription,
    ehProfissionalAutonomo,
    init,
    persist,
    setStep,
    setLojaSubstep,
    avancarDeInformacoesBasicas,
    voltarDeEndereco,
    criarUnidade,
    skipStep,
    goNextFromOps,
    goToStep,
    refreshContagens,
    loadPerfil,
    concluir,
  }
}
