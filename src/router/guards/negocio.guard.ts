import type { NavigationGuard } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useUserStore } from '@/stores/user.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { ROUTE_PATHS } from '@/constants/routes'
import { isClienteRole } from '@/types/user.types'
import { mapBackendStepToWizardStep } from '@/types/onboardingPublicacao.types'

function rotaRequerNegocio(to: Parameters<NavigationGuard>[0]): boolean {
  return to.matched.some((record) => {
    const meta = record.meta
    if (meta.skipNegocioGuard) return false
    if (meta.businessOnly) return true
    if (meta.requerModulo || meta.requerModulos?.length) return true
    if (meta.requerPermissao || meta.requerPermissoes?.length) return true
    return meta.requerAssinaturaAtiva === true
  })
}

export const negocioGuard: NavigationGuard = async (to) => {
  if (to.matched.some((record) => record.meta.skipNegocioGuard)) {
    return true
  }

  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    return true
  }

  if (!rotaRequerNegocio(to)) {
    return true
  }

  const userStore = useUserStore()
  const role = userStore.profile?.role
  if (role === undefined) {
    return true
  }

  const negocioStore = useNegocioStore()
  await negocioStore.ensureContext()

  const temVinculoNegocio = negocioStore.estabelecimentos.length > 0
  const isCliente = isClienteRole(role)

  if (isCliente && !temVinculoNegocio) {
    return true
  }

  const roleLoja = negocioStore.role
  if (roleLoja === 'Profissional') {
    const permitido = to.matched.some((record) => record.meta.permitidoRoleProfissional === true)
    if (!permitido) {
      useNotificationsStore().push('warning', 'Você não tem permissão para acessar esta área.')
      return { path: ROUTE_PATHS.DASHBOARD }
    }
  }

  const requerAssinatura =
    to.matched.some((record) => record.meta.requerAssinaturaAtiva !== false) &&
    to.matched.some(
      (record) =>
        record.meta.businessOnly ||
        record.meta.requerModulo ||
        record.meta.requerModulos?.length ||
        record.meta.requerPermissao ||
        record.meta.requerPermissoes?.length,
    )

  const isOnboarding =
    to.path.startsWith('/onboarding') || to.path === ROUTE_PATHS.UPGRADE

  const ignoraAssinaturaAtiva = to.matched.some((record) => record.meta.requerAssinaturaAtiva === false)

  if (
    requerAssinatura &&
    negocioStore.estabelecimentos.length === 0 &&
    !isOnboarding
  ) {
    // Domínios separados: fluxo de produto fica no app, não na landing.
    return { path: ROUTE_PATHS.ONBOARDING_CONTRATAR }
  }

  if (
    requerAssinatura &&
    !negocioStore.assinaturaAtiva &&
    !isOnboarding &&
    !ignoraAssinaturaAtiva &&
    negocioStore.estabelecimentos.length > 0
  ) {
    const status = negocioStore.assinaturaStatus
    const encerrada = status === 'Cancelada' || status === 'Expirada' || status === 'Suspensa'

    if (encerrada && to.path !== ROUTE_PATHS.ASSINATURA_DESPEDIDA) {
      return { path: ROUTE_PATHS.ASSINATURA_DESPEDIDA }
    }

    if (roleLoja === 'Profissional') {
      useNotificationsStore().push(
        'warning',
        'A assinatura desta loja está inativa. Fale com o administrador.',
      )
      return { path: ROUTE_PATHS.DASHBOARD }
    }
    return { path: ROUTE_PATHS.CONFIG_ASSINATURA }
  }

  const isLojaSetup = to.path === ROUTE_PATHS.ONBOARDING_LOJA_SETUP

  if (
    negocioStore.assinaturaAtiva
    && negocioStore.role === 'Owner'
    && negocioStore.ehProfissionalAutonomo
    && negocioStore.onboardingObrigatorioPendente
    && !isLojaSetup
    && !isOnboarding
    && requerAssinatura
  ) {
    const proximaEtapa = mapBackendStepToWizardStep(
      negocioStore.proximaEtapaOnboarding,
      negocioStore.ehProfissionalAutonomo,
    )
    return {
      path: ROUTE_PATHS.ONBOARDING_LOJA_SETUP,
      query: {
        mode: 'assinatura',
        ...(negocioStore.estabelecimentoIdSelecionado
          ? { estabelecimentoId: String(negocioStore.estabelecimentoIdSelecionado) }
          : {}),
        ...(negocioStore.assinaturaId ? { assinaturaId: String(negocioStore.assinaturaId) } : {}),
        step: proximaEtapa,
      },
    }
  }

  const requerModulo = to.matched
    .map((record) => record.meta.requerModulo)
    .find((m): m is string => Boolean(m))

  const requerModulos = to.matched
    .flatMap((record) => record.meta.requerModulos ?? [])
    .filter(Boolean)

  const moduloBloqueado =
    (requerModulo && !negocioStore.possuiModulo(requerModulo)) ||
    (requerModulos.length > 0 && !negocioStore.possuiAlgumModulo(requerModulos))

  if (moduloBloqueado) {
    const modulo = requerModulo ?? requerModulos[0]
    return {
      path: ROUTE_PATHS.UPGRADE,
      query: { modulo },
    }
  }

  const requerSemModulo = to.matched
    .map((record) => record.meta.requerSemModulo)
    .find((m): m is string => Boolean(m))

  if (requerSemModulo && negocioStore.possuiModulo(requerSemModulo)) {
    return { path: ROUTE_PATHS.DASHBOARD }
  }

  const requerPermissao = to.matched
    .map((record) => record.meta.requerPermissao)
    .find((p): p is string => Boolean(p))

  const requerPermissoes = to.matched
    .flatMap((record) => record.meta.requerPermissoes ?? [])
    .filter(Boolean)

  const permissaoBloqueada =
    (requerPermissao && !negocioStore.possuiPermissao(requerPermissao)) ||
    (requerPermissoes.length > 0 && !negocioStore.possuiAlgumaPermissao(requerPermissoes))

  if (permissaoBloqueada) {
    useNotificationsStore().push('warning', 'Você não tem permissão para acessar esta área.')
    return { path: ROUTE_PATHS.DASHBOARD }
  }

  const requerRoleOwner = to.matched.some((record) => record.meta.requerRoleOwner === true)
  if (requerRoleOwner && negocioStore.role !== 'Owner') {
    useNotificationsStore().push(
      'warning',
      'Apenas o proprietário da conta pode gerenciar as lojas.',
    )
    return { path: ROUTE_PATHS.DASHBOARD }
  }

  const requerMultiLoja = to.matched.some((record) => record.meta.requerMultiLoja === true)
  if (requerMultiLoja) {
    const limite = negocioStore.limites.estabelecimentos ?? 1
    if (limite <= 1) {
      useNotificationsStore().push(
        'info',
        'Gestão de múltiplas lojas está disponível no plano Premium.',
      )
      return { path: ROUTE_PATHS.CONFIG_ASSINATURA }
    }
  }

  return true
}
