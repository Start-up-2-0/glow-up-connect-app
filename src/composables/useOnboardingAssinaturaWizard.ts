import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { userService } from '@/services/userService'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { usePlanosStore } from '@/stores/planos.store'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useConfirmEmail } from '@/composables/useConfirmEmail'
import { useApiError } from '@/composables/useApiError'
import { useAssinaturaPagamentoResposta } from '@/composables/useAssinaturaPagamentoResposta'
import type { PagamentoAssinaturaPayload } from '@/types/assinatura.types'
import { ROUTE_PATHS } from '@/constants/routes'
import { redirectToLandingPlanos } from '@/utils/landingUrl'
import type {
  OnboardingAssinaturaDraft,
  OnboardingEstabelecimentoDraft,
  OnboardingUsuarioDraft,
  OnboardingWizardStep,
} from '@/types/onboardingAssinatura.types'
import { telefoneToApi } from '@/utils/formatters'
import { draftEnderecoToApi, validateEnderecoForSubmit } from '@/utils/enderecoPayload'

const STORAGE_KEY = 'guc_onboarding_assinatura'

function emptyUsuario(): OnboardingUsuarioDraft {
  return {
    nome: '',
    telefone: '',
    email: '',
    contaCriada: false,
    emailConfirmado: false,
  }
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

function createDraft(planoId: number): OnboardingAssinaturaDraft {
  return {
    planoId,
    step: 'conta',
    usuario: emptyUsuario(),
    estabelecimento: emptyEstabelecimento(),
  }
}

function loadDraft(): OnboardingAssinaturaDraft | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as OnboardingAssinaturaDraft
  } catch {
    return null
  }
}

function saveDraft(draft: OnboardingAssinaturaDraft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function useOnboardingAssinaturaWizard(planoId: number) {
  const router = useRouter()
  const authStore = useAuthStore()
  const userStore = useUserStore()
  const planosStore = usePlanosStore()
  const assinaturaStore = useAssinaturaStore()
  const negocioStore = useNegocioStore()
  const notifications = useNotificationsStore()
  const { setStoredEmail, confirmByCode } = useConfirmEmail()
  const { resolveError, resolveErrorCode, resolveFieldErrors } = useApiError()
  const {
    pixQrCode,
    pixCheckoutUrl,
    aguardandoPagamento,
    processarResposta,
  } = useAssinaturaPagamentoResposta()

  const storedDraft = loadDraft()
  const draft = ref<OnboardingAssinaturaDraft>(
    storedDraft?.planoId === planoId ? storedDraft : createDraft(planoId),
  )
  const loading = ref(false)
  const submitting = ref(false)
  const erro = ref<string | null>(null)
  const fieldErrors = ref<Record<string, string[]>>({})
  const captchaResetNonce = ref(0)
  const pendingAutoLogin = ref<{ email: string; senha: string } | null>(null)
  const step = computed({
    get: () => draft.value.step,
    set: (value: OnboardingWizardStep) => {
      draft.value.step = value
      saveDraft(draft.value)
    },
  })

  const plano = computed(() => planosStore.getPlanoById(planoId))
  const promocao = computed(() => planosStore.promocao)

  const stepperIndex = computed(() => {
    if (step.value === 'conta') return 0
    if (step.value === 'estabelecimento') return 1
    if (step.value === 'assinatura') return 2
    return 3
  })

  function persist() {
    saveDraft(draft.value)
  }

  function clearDraft() {
    sessionStorage.removeItem(STORAGE_KEY)
  }

  async function init() {
    erro.value = null
    loading.value = true
    try {
      if (!planoId || Number.isNaN(planoId)) {
        redirectToLandingPlanos()
        return
      }

      await planosStore.fetchPlanos()
      if (!plano.value) {
        redirectToLandingPlanos()
        return
      }

      if (authStore.isAuthenticated) {
        if (!userStore.profile) {
          await userStore.fetchMe()
        }
        if (userStore.profile?.ativo) {
          draft.value.usuario.emailConfirmado = true
          draft.value.usuario.contaCriada = true
          draft.value.usuario.nome = userStore.profile.nome
          draft.value.usuario.email = userStore.profile.email
          draft.value.usuario.telefone = userStore.profile.telefone ?? draft.value.usuario.telefone

          if (step.value === 'conta') {
            step.value = draft.value.usuario.emailConfirmado ? 'estabelecimento' : 'confirmar-email'
          }

          if (!draft.value.estabelecimento.email) {
            draft.value.estabelecimento.email = userStore.profile.email
          }
          if (!draft.value.estabelecimento.telefone) {
            draft.value.estabelecimento.telefone = userStore.profile.telefone ?? ''
          }
        }
      }

      persist()
    } catch (err) {
      erro.value = resolveError(err)
    } finally {
      loading.value = false
    }
  }

  async function cadastrarConta(payload: {
    nome: string
    telefone: string
    email: string
    confirmarEmail: string
    senha: string
    confirmarSenha: string
    avatarBase64?: string
    avatarContentType?: string
    captchaToken?: string
  }) {
    erro.value = null
    fieldErrors.value = {}

    if (pendingAutoLogin.value) {
      if (!payload.captchaToken) {
        erro.value = 'Marque o reCAPTCHA novamente para entrar na sua conta.'
        return
      }

      loading.value = true
      try {
        const loginData = await authStore.login({
          email: pendingAutoLogin.value.email,
          senha: pendingAutoLogin.value.senha,
          captchaToken: payload.captchaToken,
        })
        pendingAutoLogin.value = null
        await finalizarPosCadastro(loginData.requerConfirmacaoEmail ?? false)
      } catch (err) {
        captchaResetNonce.value += 1
        fieldErrors.value = resolveFieldErrors(err)
        erro.value = resolveError(err, 'Não foi possível entrar após o cadastro.')
      } finally {
        loading.value = false
      }
      return
    }

    if (payload.email.trim() !== payload.confirmarEmail.trim()) {
      erro.value = 'Os e-mails informados não coincidem.'
      return
    }
    if (payload.senha !== payload.confirmarSenha) {
      erro.value = 'As senhas informadas não coincidem.'
      return
    }

    loading.value = true
    try {
      const telefoneApi = telefoneToApi(payload.telefone)
      const { data } = await userService.cadastrar({
        nome: payload.nome.trim(),
        email: payload.email.trim(),
        telefone: telefoneApi,
        senha: payload.senha,
        avatarBase64: payload.avatarBase64,
        avatarContentType: payload.avatarContentType,
        captchaToken: payload.captchaToken,
      })

      draft.value.usuario = {
        nome: payload.nome.trim(),
        telefone: telefoneApi,
        email: payload.email.trim(),
        contaCriada: true,
        emailConfirmado: false,
      }
      setStoredEmail(payload.email.trim())
      notifications.push('success', data.mensagem)

      pendingAutoLogin.value = {
        email: payload.email.trim(),
        senha: payload.senha,
      }
      captchaResetNonce.value += 1
      erro.value =
        'Conta criada! Marque o reCAPTCHA novamente e clique em Continuar para prosseguir.'
    } catch (err) {
      captchaResetNonce.value += 1
      fieldErrors.value = resolveFieldErrors(err)
      erro.value = resolveError(err, 'Não foi possível cadastrar.')
    } finally {
      loading.value = false
    }
  }

  async function finalizarPosCadastro(requerConfirmacaoEmail: boolean) {
    if (!draft.value.estabelecimento.email) {
      draft.value.estabelecimento.email = draft.value.usuario.email
    }
    if (!draft.value.estabelecimento.telefone) {
      draft.value.estabelecimento.telefone = draft.value.usuario.telefone
    }

    if (requerConfirmacaoEmail) {
      step.value = 'estabelecimento'
    } else {
      draft.value.usuario.emailConfirmado = true
      step.value = 'estabelecimento'
    }
    persist()
  }

  async function confirmarEmailCodigo(codigo: string) {
    erro.value = null
    loading.value = true
    try {
      const result = await confirmByCode(codigo)
      if (!result.ok) {
        erro.value = 'Código inválido ou expirado.'
        return false
      }

      draft.value.usuario.emailConfirmado = true
      await userStore.fetchMe()
      clearDraft()
      notifications.push('success', 'Conta confirmada! Bem-vindo ao dashboard.')
      await router.push(ROUTE_PATHS.DASHBOARD)
      return true
    } catch (err) {
      erro.value = resolveError(err)
      return false
    } finally {
      loading.value = false
    }
  }

  function irParaConfirmacaoEmail() {
    step.value = 'confirmar-email'
    persist()
  }

  function avancarParaAssinatura(estabelecimento: OnboardingEstabelecimentoDraft) {
    erro.value = null

    if (!estabelecimento.nome.trim()) {
      erro.value = 'Informe o nome do estabelecimento.'
      return
    }
    if (!estabelecimento.logoDataUrl) {
      erro.value = 'Envie a logo do estabelecimento.'
      return
    }
    const enderecoError = validateEnderecoForSubmit(estabelecimento)
    if (enderecoError) {
      erro.value = enderecoError
      return
    }

    draft.value.estabelecimento = {
      ...estabelecimento,
      telefone: telefoneToApi(estabelecimento.telefone),
    }
    step.value = 'assinatura'
    persist()
  }

  function voltarParaEstabelecimento() {
    step.value = 'estabelecimento'
    persist()
  }

  async function aguardarAtivacao() {
    aguardandoPagamento.value = true
    const maxTentativas = 30
    for (let i = 0; i < maxTentativas; i++) {
      await new Promise((r) => setTimeout(r, 2000))
      await negocioStore.fetchEstabelecimentos(true)
      if (negocioStore.assinaturaAtiva) {
        aguardandoPagamento.value = false
        notifications.push('success', 'Pagamento confirmado! Confirme seu e-mail para acessar o dashboard.')
        irParaConfirmacaoEmail()
        return
      }
    }
    aguardandoPagamento.value = false
    notifications.push(
      'info',
      'Pagamento em processamento. Atualize a página em alguns instantes.',
    )
  }

  async function contratarPlano(diaVencimento: number, pagamento?: PagamentoAssinaturaPayload) {
    erro.value = null

    if (!plano.value) {
      erro.value = 'Plano não encontrado.'
      return
    }

    if (!authStore.isAuthenticated) {
      erro.value = 'Faça login para concluir a assinatura.'
      step.value = 'conta'
      persist()
      return
    }

    const negocio = draft.value.estabelecimento
    const endereco = draftEnderecoToApi(negocio)

    submitting.value = true
    try {
      const result = await assinaturaStore.criarAssinatura({
        planoId: plano.value.id,
        tipoAssinatura: 'Estabelecimento',
        estabelecimento: {
          nome: negocio.nome.trim(),
          descricao: negocio.descricao.trim(),
          logo: negocio.logoDataUrl!,
          telefone: telefoneToApi(negocio.telefone),
          email: negocio.email.trim(),
          endereco,
        },
        gateway: 'MercadoPago',
        diaVencimento,
        ...(pagamento ? { pagamento } : {}),
      })

      assinaturaStore.setAssinatura(result)
      await userStore.fetchMe()

      const precisaConfirmar =
        result.requerConfirmacaoEmail ?? !userStore.profile?.ativo

      await processarResposta(result, {
        onTrial: async (diasTrial) => {
          notifications.push('success', `Assinatura iniciada! Você tem ${diasTrial} dias de teste.`)
          if (precisaConfirmar) {
            irParaConfirmacaoEmail()
            return
          }
          clearDraft()
          await router.push(ROUTE_PATHS.DASHBOARD)
        },
        onDashboard: async () => {
          notifications.push('success', 'Assinatura iniciada com sucesso!')
          if (precisaConfirmar) {
            irParaConfirmacaoEmail()
            return
          }
          clearDraft()
          await router.push(ROUTE_PATHS.DASHBOARD)
        },
        aguardarAtivacao,
      })
    } catch (err) {
      const code = resolveErrorCode(err)
      if (code === 'EMAIL_NAO_CONFIRMADO') {
        erro.value = 'Sessão expirada. Faça login novamente para concluir a assinatura.'
        step.value = 'conta'
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
    plano,
    promocao,
    loading,
    submitting,
    aguardandoPagamento,
    pixQrCode,
    pixCheckoutUrl,
    erro,
    fieldErrors,
    captchaResetNonce,
    pendingAutoLogin,
    init,
    cadastrarConta,
    confirmarEmailCodigo,
    avancarParaAssinatura,
    voltarParaEstabelecimento,
    contratarPlano,
    irParaConfirmacaoEmail,
    persist,
  }
}
