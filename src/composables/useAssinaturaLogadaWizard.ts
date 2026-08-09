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
import type { PagamentoAssinaturaPayload, TipoAssinatura } from '@/types/assinatura.types'
import { ROUTE_PATHS } from '@/constants/routes'
import { lojaSetupLocation } from '@/utils/lojaSetupNavigation'
import type { OnboardingEstabelecimentoDraft } from '@/types/onboardingAssinatura.types'
import type { EstabelecimentoPerfilCompleto } from '@/types/estabelecimento.types'
import type {
  AssinaturaLogadaWizardStep,
  AssinaturaOnboardingContexto,
  EstabelecimentoOnboardingContexto,
} from '@/types/assinaturaOnboarding.types'
import {
  ASSINATURA_LOGADA_WIZARD_STEPS,
  ASSINATURA_LOGADA_WIZARD_STEPS_AUTONOMO,
  normalizeAutonomoStoredStep,
  normalizeEstabelecimentoStoredStep,
} from '@/types/assinaturaOnboarding.types'
import { telefoneToApi } from '@/utils/formatters'
import { draftEnderecoToApi, validateEnderecoForSubmit } from '@/utils/enderecoPayload'
import { buildAtualizarPerfilPayload } from '@/utils/perfilPayload'
import { userService } from '@/services/userService'
import type { WhatsAppConfirmacaoInstrucoes } from '@/types/whatsapp.types'
import { MOCK_MODE } from '@/mocks/config'

const STORAGE_KEY = 'guc_assinatura_logada'

interface AssinaturaLogadaDraft {
  planoId: number
  tipoAssinatura: TipoAssinatura
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
    categoriaId: undefined,
  }
}

function createDraft(planoId: number, tipoAssinatura: TipoAssinatura): AssinaturaLogadaDraft {
  return {
    planoId,
    tipoAssinatura,
    step: tipoAssinatura === 'ProfissionalAutonomo' ? 'perfil' : 'informacoes-basicas',
    estabelecimento: emptyEstabelecimento(),
    estabelecimentoId: null,
  }
}

function loadDraft(): AssinaturaLogadaDraft | null {
  const raw = sessionStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as AssinaturaLogadaDraft & { step: string }
    const tipo = parsed.tipoAssinatura ?? 'Estabelecimento'
    const step =
      tipo === 'ProfissionalAutonomo'
        ? normalizeAutonomoStoredStep(parsed.step)
        : normalizeEstabelecimentoStoredStep(parsed.step)
    return {
      ...parsed,
      tipoAssinatura: tipo,
      step,
    }
  } catch {
    return null
  }
}

function saveDraft(draft: AssinaturaLogadaDraft) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

function telefonesEquivalentes(a: string | null | undefined, b: string | null | undefined): boolean {
  const na = telefoneToApi(a)
  const nb = telefoneToApi(b)
  return Boolean(na) && na === nb
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
    categoriaId: perfil?.categoriaId ?? undefined,
  }
}

function precisaCompletarEndereco(perfil: EstabelecimentoPerfilCompleto | null): boolean {
  if (!perfil?.endereco) return true
  return perfil.endereco.enderecoCompleto !== true
}

export function useAssinaturaLogadaWizard(
  planoId: number,
  tipoAssinatura: TipoAssinatura = 'Estabelecimento',
) {
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
  const draftCompativel =
    storedDraft != null
    && storedDraft.planoId === planoId
    && (storedDraft.tipoAssinatura ?? 'Estabelecimento') === tipoAssinatura
  const draft = ref<AssinaturaLogadaDraft>(
    draftCompativel ? storedDraft! : createDraft(planoId, tipoAssinatura),
  )
  const contexto = ref<AssinaturaOnboardingContexto | null>(null)
  const perfilExistente = ref<EstabelecimentoPerfilCompleto | null>(null)
  const requerComplementoEndereco = ref(false)
  const loading = ref(false)
  const submitting = ref(false)
  const erro = ref<string | null>(null)
  const telefonePendenteConfirmacao = ref(false)
  const whatsappInstrucoes = ref<WhatsAppConfirmacaoInstrucoes | null>(null)
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

  const ehAutonomo = computed(() => draft.value.tipoAssinatura === 'ProfissionalAutonomo')

  const avatarContaDisponivel = computed(() => Boolean(userStore.profile?.avatarBase64?.trim()))

  const wizardSteps = computed(() => {
    const baseSteps = ehAutonomo.value
      ? ASSINATURA_LOGADA_WIZARD_STEPS_AUTONOMO
      : ASSINATURA_LOGADA_WIZARD_STEPS

    if (usaEstabelecimentoExistente.value && !requerComplementoEndereco.value) {
      return baseSteps.filter(
        (item) => item.id !== 'informacoes-basicas' && item.id !== 'endereco',
      )
    }
    if (usaEstabelecimentoExistente.value && requerComplementoEndereco.value) {
      return baseSteps.filter((item) => item.id !== 'informacoes-basicas')
    }
    return baseSteps
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

  function emSetupOperacionalAutonomo(): boolean {
    return (
      draft.value.tipoAssinatura === 'ProfissionalAutonomo'
      && (step.value === 'servicos' || step.value === 'horarios')
      && Boolean(draft.value.estabelecimentoId)
    )
  }

  async function entrarSetupOperacionalAutonomo(estabelecimentoId: number | null | undefined) {
    const estabId = estabelecimentoId ?? negocioStore.estabelecimentoIdSelecionado
    if (!estabId) {
      await router.push(ROUTE_PATHS.DASHBOARD)
      return
    }

    try {
      await negocioStore.fetchEstabelecimentos(true)
      if (negocioStore.estabelecimentoIdSelecionado !== estabId) {
        await negocioStore.trocarEstabelecimento(estabId)
      }
    } catch {
      // Segue mesmo assim — os steps tentam carregar com o id do draft.
    }

    draft.value.estabelecimentoId = estabId
    step.value = 'servicos'
    persist()
  }

  async function concluirSetupOperacionalAutonomo() {
    clearDraft()
    notifications.push('success', 'Perfil configurado! Bem-vindo ao painel.')
    await router.push(ROUTE_PATHS.DASHBOARD)
  }

  function avancarDeServicos() {
    step.value = 'horarios'
    persist()
  }

  function pularServicos() {
    step.value = 'horarios'
    persist()
  }

  function voltarDeHorarios() {
    step.value = 'servicos'
    persist()
  }

  async function avancarDeHorarios() {
    await concluirSetupOperacionalAutonomo()
  }

  async function pularHorarios() {
    await concluirSetupOperacionalAutonomo()
  }

  function preencherDadosUsuario() {
    const profile = userStore.profile
    if (!profile) return

    const negocio = draft.value.estabelecimento

    if (!negocio.email) {
      negocio.email = profile.email
    }
    if (!negocio.telefone) {
      negocio.telefone = profile.telefone ?? ''
    }

    if (draft.value.tipoAssinatura !== 'ProfissionalAutonomo') return

    if (!negocio.nome.trim()) {
      negocio.nome = profile.nome
    }
    if (!negocio.logoDataUrl && profile.avatarBase64?.trim()) {
      negocio.logoDataUrl = profile.avatarBase64
    }
  }

  async function aplicarContexto(data: AssinaturaOnboardingContexto) {
    contexto.value = data

    if (data.proximaEtapa === 'GerenciarAssinatura' && !MOCK_MODE) {
      // Autônomo pode ainda estar no setup pós-pagamento (serviços/horários).
      if (!emSetupOperacionalAutonomo()) {
        void router.replace(ROUTE_PATHS.CONFIG_ASSINATURA)
        return false
      }
      return true
    }

    if (data.proximaEtapa === 'EscolherPlano') {
      void router.replace(ROUTE_PATHS.ONBOARDING_PLANOS)
      return false
    }

    if (
      draft.value.tipoAssinatura !== 'ProfissionalAutonomo'
      && data.temEstabelecimentoProprio
      && data.estabelecimentoIdSugerido
    ) {
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
    } else if (
      (step.value === 'confirmar' || step.value === 'revisao')
      && !data.temEstabelecimentoProprio
    ) {
      step.value = ehAutonomo.value ? 'perfil' : 'informacoes-basicas'
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
          query: {
            redirect: `${ROUTE_PATHS.ONBOARDING_CONTRATAR}?planoId=${planoId}&tipoAssinatura=${tipoAssinatura}`,
          },
        })
        return
      }

      if (!planoId || Number.isNaN(planoId)) {
        await router.replace(ROUTE_PATHS.ONBOARDING_PLANOS)
        return
      }

      // Login grava só UserSummary (sem telefone/WhatsApp). /me completo
      // alimenta o prefill de "Usar meus dados cadastrais".
      await userStore.fetchMe(true)

      if (!userStore.profile?.ativo) {
        await router.replace({
          path: ROUTE_PATHS.CONFIRM_EMAIL_CODE,
          query: { email: userStore.profile?.email },
        })
        return
      }

      preencherDadosUsuario()

      // Sempre o tipo da URL/entrada do wizard — não o draft stale.
      await planosStore.fetchPlanos(false, tipoAssinatura)
      if (!plano.value) {
        await router.replace(ROUTE_PATHS.ONBOARDING_PLANOS)
        return
      }

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
    if (!estabelecimento.categoriaId) {
      erro.value = 'Selecione a categoria do estabelecimento.'
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
      categoriaId: estabelecimento.categoriaId,
    }
    draft.value.estabelecimentoId = null
    step.value = 'endereco'
    persist()
  }

  /**
   * Step Perfil (autônomo): nome, e-mail, telefone, bio, foto.
   * Gate de WhatsApp quando o telefone muda ou ainda não está confirmado.
   */
  async function avancarDePerfil(perfil: OnboardingEstabelecimentoDraft) {
    erro.value = null
    telefonePendenteConfirmacao.value = false
    whatsappInstrucoes.value = null

    if (!perfil.nome.trim()) {
      erro.value = 'Informe o nome profissional.'
      return
    }
    if (!perfil.email.trim()) {
      erro.value = 'Informe o e-mail.'
      return
    }
    if (!perfil.telefone.trim()) {
      erro.value = 'Informe o telefone.'
      return
    }
    if (!perfil.logoDataUrl) {
      erro.value = 'Envie a foto profissional ou use a foto da sua conta.'
      return
    }
    if (!perfil.categoriaId) {
      erro.value = 'Selecione a área em que você atua.'
      return
    }

    const telefoneNovo = telefoneToApi(perfil.telefone)
    const telefoneConta = telefoneToApi(userStore.profile?.telefone)
    const whatsConfirmado = Boolean(userStore.profile?.whatsAppConfirmado)
    const telefoneIgual = telefonesEquivalentes(telefoneNovo, telefoneConta)

    draft.value.estabelecimento = {
      ...draft.value.estabelecimento,
      nome: perfil.nome.trim(),
      descricao: perfil.descricao,
      telefone: telefoneNovo,
      email: perfil.email.trim(),
      logoDataUrl: perfil.logoDataUrl,
      categoriaId: perfil.categoriaId,
    }
    draft.value.estabelecimentoId = null

    if (telefoneIgual && whatsConfirmado) {
      step.value = 'endereco'
      persist()
      return
    }

    submitting.value = true
    try {
      if (!telefoneIgual) {
        await userStore.updateProfile({ telefone: telefoneNovo })
      }

      const instrucoes = await userService.solicitarConfirmacaoWhatsApp()
      whatsappInstrucoes.value = instrucoes
      telefonePendenteConfirmacao.value = true
      erro.value =
        'Confirme o telefone no WhatsApp para continuar. Assim que confirmar, clique em Continuar novamente.'
    } catch (err) {
      await userStore.fetchMe(true)
      if (userStore.profile?.whatsAppConfirmado) {
        telefonePendenteConfirmacao.value = false
        step.value = 'endereco'
        persist()
        return
      }
      erro.value = resolveError(err)
    } finally {
      submitting.value = false
    }
  }

  async function verificarTelefoneEAvancar(opts?: { silencioso?: boolean }) {
    const silencioso = opts?.silencioso === true
    if (!silencioso) erro.value = null
    await userStore.fetchMe(true)
    if (userStore.profile?.whatsAppConfirmado) {
      telefonePendenteConfirmacao.value = false
      whatsappInstrucoes.value = null
      erro.value = null
      step.value = 'endereco'
      persist()
      return
    }
    if (!silencioso) {
      erro.value =
        'Ainda não detectamos a confirmação. Envie a mensagem no WhatsApp e tente de novo.'
    }
  }

  function voltarDeEndereco() {
    step.value = ehAutonomo.value ? 'perfil' : 'informacoes-basicas'
    persist()
  }

  function voltarDePerfil() {
    void router.push(ROUTE_PATHS.ONBOARDING_PLANOS)
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

    step.value = ehAutonomo.value ? 'revisao' : 'confirmar'
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

  function voltarDeRevisao() {
    step.value = 'endereco'
    persist()
  }

  function editarEstabelecimento() {
    step.value = 'informacoes-basicas'
    persist()
  }

  function editarAutonomo(
    destino: 'perfil' | 'endereco' = 'perfil',
  ) {
    step.value = destino
    persist()
  }

  function avancarParaPagamento() {
    step.value = 'assinatura'
    persist()
  }

  function avancarDeRevisao() {
    erro.value = null
    step.value = 'assinatura'
    persist()
  }

  function voltarParaConfirmar() {
    step.value = ehAutonomo.value ? 'revisao' : 'confirmar'
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
        notifications.push(
          'success',
          ehAutonomo.value
            ? 'Pagamento confirmado! Configure seus serviços e horários.'
            : 'Pagamento confirmado! Bem-vindo ao seu estabelecimento.',
        )
        const estabId = negocioStore.estabelecimentoIdSelecionado
        if (ehAutonomo.value) {
          await entrarSetupOperacionalAutonomo(estabId)
          return
        }
        clearDraft()
        await router.push(
          lojaSetupLocation({
            mode: 'assinatura',
            estabelecimentoId: estabId,
          }),
        )
        return
      }
    }
    aguardandoPagamento.value = false
    notifications.push(
      'info',
      'Pagamento em processamento. Atualize a página em alguns instantes.',
    )
  }

  async function finalizarAssinatura(pagamento?: PagamentoAssinaturaPayload) {
    erro.value = null

    if (!plano.value) {
      erro.value = 'Plano não encontrado.'
      return
    }

    submitting.value = true
    try {
      const tipo = draft.value.tipoAssinatura
      const negocio = draft.value.estabelecimento

      const result = await assinaturaStore.criarAssinatura(
        tipo === 'ProfissionalAutonomo'
          ? {
              planoId: plano.value.id,
              tipoAssinatura: 'ProfissionalAutonomo',
              profissionalAutonomo: {
                nomePublico: negocio.nome.trim(),
                biografia: negocio.descricao.trim() || undefined,
                logo: negocio.logoDataUrl!,
                telefone: telefoneToApi(negocio.telefone),
                email: negocio.email.trim(),
                categoriaId: negocio.categoriaId,
                endereco: draftEnderecoToApi(negocio),
              },
              gateway: 'MercadoPago',
              ...(pagamento ? { pagamento } : {}),
            }
          : draft.value.estabelecimentoId
            ? {
                planoId: plano.value.id,
                tipoAssinatura: 'Estabelecimento',
                estabelecimentoId: draft.value.estabelecimentoId,
                gateway: 'MercadoPago',
                ...(pagamento ? { pagamento } : {}),
              }
            : {
                planoId: plano.value.id,
                tipoAssinatura: 'Estabelecimento',
                estabelecimento: {
                  nome: negocio.nome.trim(),
                  descricao: negocio.descricao.trim(),
                  logo: negocio.logoDataUrl!,
                  telefone: telefoneToApi(negocio.telefone),
                  email: negocio.email.trim(),
                  categoriaId: negocio.categoriaId,
                  endereco: draftEnderecoToApi(negocio),
                },
                gateway: 'MercadoPago',
                ...(pagamento ? { pagamento } : {}),
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
          const estabId =
            result.estabelecimentoId ?? negocioStore.estabelecimentoIdSelecionado
          if (ehAutonomo.value) {
            await entrarSetupOperacionalAutonomo(estabId)
            return
          }
          clearDraft()
          await router.push(
            lojaSetupLocation({
              mode: 'assinatura',
              estabelecimentoId: estabId,
            }),
          )
        },
        onDashboard: async () => {
          notifications.push('success', 'Assinatura iniciada com sucesso!')
          const estabId =
            result.estabelecimentoId ?? negocioStore.estabelecimentoIdSelecionado
          if (ehAutonomo.value) {
            await entrarSetupOperacionalAutonomo(estabId)
            return
          }
          clearDraft()
          await router.push(
            lojaSetupLocation({
              mode: 'assinatura',
              estabelecimentoId: estabId,
            }),
          )
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
      if (
        code === 'TELEFONE_NAO_CONFIRMADO'
        || code === 'TELEFONE_DIVERGENTE_NAO_CONFIRMADO'
      ) {
        telefonePendenteConfirmacao.value = true
        step.value = 'perfil'
        persist()
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
    ehAutonomo,
    avatarContaDisponivel,
    telefonePendenteConfirmacao,
    whatsappInstrucoes,
    loading,
    submitting,
    aguardandoPagamento,
    pixQrCode,
    pixCheckoutUrl,
    erro,
    init,
    avancarDeInformacoesBasicas,
    avancarDePerfil,
    verificarTelefoneEAvancar,
    voltarDePerfil,
    voltarDeEndereco,
    avancarDeEndereco,
    voltarDoConfirmar,
    voltarDeRevisao,
    editarEstabelecimento,
    editarAutonomo,
    avancarParaPagamento,
    avancarDeRevisao,
    voltarParaConfirmar,
    finalizarAssinatura,
    avancarDeServicos,
    pularServicos,
    voltarDeHorarios,
    avancarDeHorarios,
    pularHorarios,
  }
}
