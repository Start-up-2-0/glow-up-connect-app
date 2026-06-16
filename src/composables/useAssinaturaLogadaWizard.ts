import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { assinaturaService } from '@/services/assinaturaService'
import { estabelecimentoPerfilService } from '@/services/estabelecimentoPerfilService'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { usePlanosStore } from '@/stores/planos.store'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { useAssinaturaPagamentoResposta } from '@/composables/useAssinaturaPagamentoResposta'
import type { PagamentoAssinaturaPayload } from '@/types/assinatura.types'
import { ROUTE_PATHS } from '@/constants/routes'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'
import type { EstabelecimentoPerfilCompleto } from '@/types/estabelecimento.types'
import type {
  AssinaturaLogadaWizardStep,
  AssinaturaOnboardingContexto,
  EstabelecimentoOnboardingContexto,
} from '@/types/assinaturaOnboarding.types'
import { ASSINATURA_LOGADA_WIZARD_STEPS } from '@/types/assinaturaOnboarding.types'
import { telefoneToApi } from '@/utils/formatters'
import { draftEnderecoToApi, validateEnderecoForSubmit } from '@/utils/enderecoPayload'
import { buildAtualizarPerfilPayload } from '@/utils/perfilPayload'

function normalizeStoredStep(step: string): AssinaturaLogadaWizardStep {
  if (step === 'estabelecimento') return 'informacoes-basicas'
  return step as AssinaturaLogadaWizardStep
}

const STORAGE_KEY = 'guc_assinatura_logada'

interface AssinaturaLogadaDraft {
  planoId: number
  step: AssinaturaLogadaWizardStep
  estabelecimento: OnboardingEstabelecimentoDraft
  estabelecimentoId: number | null
}

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
  }
}

function createDraft(planoId: number): AssinaturaLogadaDraft {
  return {
    planoId,
    step: 'informacoes-basicas',
    estabelecimento: emptyEstabelecimento(),
    estabelecimentoId: null,
  }
}

function loadDraft(): AssinaturaLogadaDraft | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AssinaturaLogadaDraft & { step: string }
    return {
      ...parsed,
      step: normalizeStoredStep(parsed.step),
    }
  } catch {
    return null
  }
}

function saveDraft(draft: AssinaturaLogadaDraft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

function mapEstabelecimentoExistente(
  estabelecimento: EstabelecimentoOnboardingContexto,
  perfil?: EstabelecimentoPerfilCompleto | null,
): OnboardingEstabelecimentoDraft {
  const endereco = perfil?.endereco
  return {
    nome: perfil?.nome ?? estabelecimento.nome,
    descricao: perfil?.descricao ?? '',
    telefone: perfil?.telefone ?? '',
    email: perfil?.email ?? '',
    cep: endereco?.cep ?? '',
    logradouro: endereco?.logradouro ?? '',
    numero: endereco?.numero ?? '',
    bairro: endereco?.bairro ?? '',
    cidade: endereco?.cidade ?? '',
    estado: endereco?.estado ?? '',
    complemento: endereco?.complemento ?? '',
    logoDataUrl: perfil?.logo ?? estabelecimento.logo,
  }
}

function precisaCompletarEndereco(perfil: EstabelecimentoPerfilCompleto | null): boolean {
  if (!perfil?.endereco) return true
  return perfil.endereco.enderecoCompleto !== true
}

export function useAssinaturaLogadaWizard(planoId: number) {
  const router = useRouter()
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const planosStore = usePlanosStore()
  const assinaturaStore = useAssinaturaStore()
  const negocioStore = useNegocioStore()
  const notifications = useNotificationsStore()
  const { resolveError, resolveErrorCode } = useApiError()
  const {
    pixQrCode,
    pixCheckoutUrl,
    aguardandoPagamento,
    processarResposta,
  } = useAssinaturaPagamentoResposta()

  const storedDraft = loadDraft()
  const draft = ref<AssinaturaLogadaDraft>(
    storedDraft?.planoId === planoId ? storedDraft : createDraft(planoId),
  )
  const contexto = ref<AssinaturaOnboardingContexto | null>(null)
  const perfilExistente = ref<EstabelecimentoPerfilCompleto | null>(null)
  const requerComplementoEndereco = ref(false)
  const loading = ref(false)
  const submitting = ref(false)
  const erro = ref<string | null>(null)
  const step = computed({
    get: () => draft.value.step,
    set: (value: AssinaturaLogadaWizardStep) => {
      draft.value.step = value
      saveDraft(draft.value)
    },
  })

  const plano = computed(() => planosStore.getPlanoById(planoId))
  const promocao = computed(() => planosStore.promocao)

  const usaEstabelecimentoExistente = computed(
    () => contexto.value?.temEstabelecimentoProprio === true,
  )

  const wizardSteps = computed(() => {
    if (usaEstabelecimentoExistente.value && !requerComplementoEndereco.value) {
      return ASSINATURA_LOGADA_WIZARD_STEPS.filter(
        (item) => item.id !== 'informacoes-basicas' && item.id !== 'endereco',
      )
    }
    if (usaEstabelecimentoExistente.value && requerComplementoEndereco.value) {
      return ASSINATURA_LOGADA_WIZARD_STEPS.filter((item) => item.id !== 'informacoes-basicas')
    }
    return ASSINATURA_LOGADA_WIZARD_STEPS
  })

  const stepperIndex = computed(() => {
    const index = wizardSteps.value.findIndex((item) => item.id === step.value)
    return index >= 0 ? index : 0
  })

  function persist() {
    saveDraft(draft.value)
  }

  function clearDraft() {
    sessionStorage.removeItem(STORAGE_KEY)
  }

  function preencherDadosUsuario() {
    const profile = userStore.profile
    if (!profile) return

    if (!draft.value.estabelecimento.email) {
      draft.value.estabelecimento.email = profile.email
    }
    if (!draft.value.estabelecimento.telefone) {
      draft.value.estabelecimento.telefone = profile.telefone ?? ''
    }
  }

  async function aplicarContexto(data: AssinaturaOnboardingContexto) {
    contexto.value = data

    if (data.proximaEtapa === 'GerenciarAssinatura') {
      void router.replace(ROUTE_PATHS.CONFIG_ASSINATURA)
      return false
    }

    if (data.proximaEtapa === 'EscolherPlano') {
      void router.replace(ROUTE_PATHS.ONBOARDING_PLANOS)
      return false
    }

    if (data.temEstabelecimentoProprio && data.estabelecimentoIdSugerido) {
      draft.value.estabelecimentoId = data.estabelecimentoIdSugerido
      const existente = data.estabelecimentos.find(
        (item) => item.estabelecimentoId === data.estabelecimentoIdSugerido,
      )

      let perfil: EstabelecimentoPerfilCompleto | null = null
      try {
        perfil = await estabelecimentoPerfilService.obterPerfil(data.estabelecimentoIdSugerido)
      } catch {
        perfil = null
      }

      if (existente) {
        draft.value.estabelecimento = mapEstabelecimentoExistente(existente, perfil)
      }

      perfilExistente.value = perfil
      requerComplementoEndereco.value = precisaCompletarEndereco(perfil)
      step.value = requerComplementoEndereco.value ? 'endereco' : 'confirmar'
    } else if (step.value === 'confirmar' && !data.temEstabelecimentoProprio) {
      step.value = 'informacoes-basicas'
    }

    persist()
    return true
  }

  async function init() {
    erro.value = null
    loading.value = true
    try {
      if (!authStore.isAuthenticated) {
        await router.replace({
          path: ROUTE_PATHS.LOGIN,
          query: { redirect: `${ROUTE_PATHS.ONBOARDING_CONTRATAR}?planoId=${planoId}` },
        })
        return
      }

      if (!planoId || Number.isNaN(planoId)) {
        await router.replace(ROUTE_PATHS.ONBOARDING_PLANOS)
        return
      }

      if (!userStore.profile) {
        await userStore.fetchMe()
      }

      if (!userStore.profile?.ativo) {
        await router.replace({
          path: ROUTE_PATHS.CONFIRM_EMAIL_CODE,
          query: { email: userStore.profile?.email },
        })
        return
      }

      await planosStore.fetchPlanos()
      if (!plano.value) {
        await router.replace(ROUTE_PATHS.ONBOARDING_PLANOS)
        return
      }

      preencherDadosUsuario()

      const data = await assinaturaService.obterContextoOnboarding()
      if (!(await aplicarContexto(data))) {
        return
      }
    } catch (err) {
      erro.value = resolveError(err)
    } finally {
      loading.value = false
    }
  }

  function avancarDeInformacoesBasicas(estabelecimento: OnboardingEstabelecimentoDraft) {
    erro.value = null

    if (!estabelecimento.nome.trim()) {
      erro.value = 'Informe o nome do estabelecimento.'
      return
    }
    if (!estabelecimento.logoDataUrl) {
      erro.value = 'Envie a logo do estabelecimento.'
      return
    }
    if (!estabelecimento.email.trim()) {
      erro.value = 'Informe o e-mail comercial.'
      return
    }
    if (!estabelecimento.telefone.trim()) {
      erro.value = 'Informe o telefone comercial.'
      return
    }

    draft.value.estabelecimento = {
      ...draft.value.estabelecimento,
      nome: estabelecimento.nome,
      descricao: estabelecimento.descricao,
      telefone: telefoneToApi(estabelecimento.telefone),
      email: estabelecimento.email,
      logoDataUrl: estabelecimento.logoDataUrl,
    }
    draft.value.estabelecimentoId = null
    step.value = 'endereco'
    persist()
  }

  function voltarDeEndereco() {
    step.value = 'informacoes-basicas'
    persist()
  }

  async function avancarDeEndereco(estabelecimento: OnboardingEstabelecimentoDraft) {
    erro.value = null

    const enderecoError = validateEnderecoForSubmit(estabelecimento)
    if (enderecoError) {
      erro.value = enderecoError
      return
    }

    draft.value.estabelecimento = {
      ...draft.value.estabelecimento,
      cep: estabelecimento.cep,
      logradouro: estabelecimento.logradouro,
      numero: estabelecimento.numero,
      bairro: estabelecimento.bairro,
      cidade: estabelecimento.cidade,
      estado: estabelecimento.estado,
      complemento: estabelecimento.complemento,
    }

    if (usaEstabelecimentoExistente.value && draft.value.estabelecimentoId) {
      submitting.value = true
      try {
        const perfilBase: EstabelecimentoPerfilCompleto =
          perfilExistente.value ?? {
            id: draft.value.estabelecimentoId,
            publicGuid: '',
            nome: draft.value.estabelecimento.nome,
            logo: draft.value.estabelecimento.logoDataUrl ?? '',
            telefone: draft.value.estabelecimento.telefone,
            email: draft.value.estabelecimento.email,
            endereco: null,
          }

        const atualizado = await estabelecimentoPerfilService.atualizarPerfil(
          draft.value.estabelecimentoId,
          buildAtualizarPerfilPayload(perfilBase, {
            endereco: draftEnderecoToApi(estabelecimento),
          }),
        )
        perfilExistente.value = atualizado
        requerComplementoEndereco.value = precisaCompletarEndereco(atualizado)
      } catch (err) {
        erro.value = resolveError(err)
        return
      } finally {
        submitting.value = false
      }
    } else {
      draft.value.estabelecimentoId = null
    }

    step.value = 'confirmar'
    persist()
  }

  function voltarDoConfirmar() {
    if (usaEstabelecimentoExistente.value) {
      void router.push(ROUTE_PATHS.ONBOARDING_PLANOS)
      return
    }
    step.value = 'endereco'
    persist()
  }

  function editarEstabelecimento() {
    step.value = 'informacoes-basicas'
    persist()
  }

  function avancarParaPagamento() {
    step.value = 'assinatura'
    persist()
  }

  function voltarParaConfirmar() {
    step.value = 'confirmar'
    persist()
  }

  async function aguardarAtivacao() {
    const maxTentativas = 30
    for (let i = 0; i < maxTentativas; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      await userStore.fetchMe()
      await negocioStore.fetchEstabelecimentos(true)
      if (negocioStore.assinaturaAtiva) {
        aguardandoPagamento.value = false
        clearDraft()
        notifications.push('success', 'Pagamento confirmado! Bem-vindo ao seu estabelecimento.')
        await router.push(ROUTE_PATHS.DASHBOARD)
        return
      }
    }
    aguardandoPagamento.value = false
    notifications.push(
      'info',
      'Pagamento em processamento. Atualize a página em alguns instantes.',
    )
  }

  async function finalizarAssinatura(diaVencimento: number, pagamento?: PagamentoAssinaturaPayload) {
    erro.value = null

    if (!plano.value) {
      erro.value = 'Plano não encontrado.'
      return
    }

    submitting.value = true
    try {
      const payloadBase = {
        planoId: plano.value.id,
        tipoAssinatura: 'Estabelecimento' as const,
        gateway: 'MercadoPago' as const,
        diaVencimento,
        ...(pagamento ? { pagamento } : {}),
      }

      const result = await assinaturaStore.criarAssinatura(
        draft.value.estabelecimentoId
          ? {
              ...payloadBase,
              estabelecimentoId: draft.value.estabelecimentoId,
            }
          : {
              ...payloadBase,
              estabelecimento: {
                nome: draft.value.estabelecimento.nome.trim(),
                descricao: draft.value.estabelecimento.descricao.trim(),
                logo: draft.value.estabelecimento.logoDataUrl!,
                telefone: telefoneToApi(draft.value.estabelecimento.telefone),
                email: draft.value.estabelecimento.email.trim(),
                endereco: draftEnderecoToApi(draft.value.estabelecimento),
              },
            },
      )

      assinaturaStore.setAssinatura(result)
      await userStore.fetchMe()
      try {
        await negocioStore.fetchEstabelecimentos(true)
      } catch {
        // Contexto será recarregado após o redirect.
      }

      await processarResposta(result, {
        onTrial: async (diasTrial) => {
          notifications.push('success', `Assinatura iniciada! Você tem ${diasTrial} dias de teste.`)
          clearDraft()
          await router.push(ROUTE_PATHS.DASHBOARD)
        },
        onDashboard: async () => {
          notifications.push('success', 'Assinatura iniciada com sucesso!')
          clearDraft()
          await router.push(ROUTE_PATHS.DASHBOARD)
        },
        aguardarAtivacao,
      })
    } catch (err) {
      const code = resolveErrorCode(err)
      if (code === 'ESTABELECIMENTO_ONBOARDING_DUPLICADO') {
        const data = await assinaturaService.obterContextoOnboarding()
        await aplicarContexto(data)
        erro.value = 'Você já possui um estabelecimento. Confirme os dados para assinar o plano.'
        step.value = 'confirmar'
        persist()
        return
      }
      erro.value = resolveError(err)
    } finally {
      submitting.value = false
    }
  }

  return {
    draft,
    step,
    stepperIndex,
    wizardSteps,
    plano,
    promocao,
    contexto,
    usaEstabelecimentoExistente,
    loading,
    submitting,
    aguardandoPagamento,
    pixQrCode,
    pixCheckoutUrl,
    erro,
    init,
    avancarDeInformacoesBasicas,
    voltarDeEndereco,
    avancarDeEndereco,
    voltarDoConfirmar,
    editarEstabelecimento,
    avancarParaPagamento,
    voltarParaConfirmar,
    finalizarAssinatura,
  }
}
