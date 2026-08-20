<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import CancelarAssinaturaDialog from '@/components/assinatura/CancelarAssinaturaDialog.vue'
import TrialStatusBanner from '@/components/assinatura/TrialStatusBanner.vue'
import AssinaturaPageHeader from '@/components/assinatura/page/AssinaturaPageHeader.vue'
import AssinaturaPlanoHero from '@/components/assinatura/page/AssinaturaPlanoHero.vue'
import AssinaturaDetalhesCard from '@/components/assinatura/page/AssinaturaDetalhesCard.vue'
import AssinaturaBeneficiosCard from '@/components/assinatura/page/AssinaturaBeneficiosCard.vue'
import AssinaturaComparacaoPlanos from '@/components/assinatura/page/AssinaturaComparacaoPlanos.vue'
import AssinaturaSegurancaBanner from '@/components/assinatura/page/AssinaturaSegurancaBanner.vue'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { usePlanosStore } from '@/stores/planos.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useUserStore } from '@/stores/user.store'
import { useApiError } from '@/composables/useApiError'
import { assinaturaService } from '@/services/assinaturaService'
import { FEATURE_FLAGS } from '@/config/features'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatDate } from '@/utils/formatters'
import type { AssinaturaOnboardingContexto } from '@/types/assinaturaOnboarding.types'
import { redirectToThirdPartyUrl } from '@/utils/thirdPartyRedirect'
import '@/components/assinatura/page/assinaturaPage.css'

const router = useRouter()
const {
  assinaturaId,
  planoId,
  planoNome,
  estabelecimentoAtivo,
  tipoAssinatura,
  ensureContext,
} = useNegocioContext()
const assinaturaStore = useAssinaturaStore()
const planosStore = usePlanosStore()
const { assinatura, loading } = storeToRefs(assinaturaStore)
const { planos, loading: planosLoading } = storeToRefs(planosStore)
const notifications = useNotificationsStore()
const userStore = useUserStore()
const { resolveError } = useApiError()

const dialogAberto = ref(false)
const cancelando = ref(false)
const contextoOnboarding = ref<AssinaturaOnboardingContexto | null>(null)

const planoAtual = computed(() => {
  const id = assinatura.value?.planoId ?? planoId.value
  if (id == null) return null
  return planosStore.getPlanoById(id) ?? null
})

const paginaPronta = computed(() => !loading.value && !planosLoading.value)

const mostrarLinkMinhasLojas = computed(() => {
  if (!FEATURE_FLAGS.lojasHabilitadas && tipoAssinatura.value !== 'Estabelecimento') {
    return false
  }
  const ctx = contextoOnboarding.value
  if (!ctx) return false
  return (ctx.limiteLojas ?? 0) > 1 || ctx.podeAdicionarLoja || ctx.lojasVinculadas > 1
})

onMounted(async () => {
  await ensureContext()
  if (!estabelecimentoAtivo.value) {
    await router.replace(ROUTE_PATHS.ONBOARDING_CONTRATAR)
    return
  }
  await Promise.all([
    assinaturaId.value
      ? assinaturaStore.fetchAtual(estabelecimentoAtivo.value.estabelecimentoId)
      : Promise.resolve(),
    planosStore.fetchPlanos(false, tipoAssinatura.value ?? undefined),
  ])
  try {
    contextoOnboarding.value = await assinaturaService.obterContextoOnboarding()
  } catch {
    contextoOnboarding.value = null
  }
})

async function confirmarCancelamento() {
  if (!assinaturaId.value) return
  cancelando.value = true
  try {
    const resultado = await assinaturaStore.cancelar(assinaturaId.value)
    dialogAberto.value = false

    if (resultado.status === 'CancelamentoAgendado') {
      notifications.push(
        'success',
        `Cancelamento agendado. Você mantém acesso até ${formatDate(resultado.fim ?? resultado.proximaDataVencimento)}.`,
      )
      return
    }

    await userStore.fetchMe(true)
    notifications.push('success', 'Assinatura encerrada.')
    await router.push(ROUTE_PATHS.ASSINATURA_DESPEDIDA)
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    cancelando.value = false
  }
}

function concluirPagamento() {
  const url = assinatura.value?.pagamentoInicial?.checkoutUrl
  if (url) redirectToThirdPartyUrl(url)
}

function irTrocarPlano() {
  if (!FEATURE_FLAGS.trocaPlanoHabilitada) return
  void router.push(ROUTE_PATHS.CONFIG_ASSINATURA_UPGRADE)
}

function irUpgrade(planoAlvoId: number) {
  if (!FEATURE_FLAGS.trocaPlanoHabilitada) return
  void router.push({
    path: ROUTE_PATHS.CONFIG_ASSINATURA_UPGRADE,
    query: { planoId: String(planoAlvoId) },
  })
}

function irContratar() {
  void router.push(ROUTE_PATHS.ONBOARDING_CONTRATAR)
}

function scrollComparacao() {
  document.getElementById('assinatura-comparacao')?.scrollIntoView({
    behavior: 'smooth',
    block: 'start',
  })
}

function abrirPolitica() {
  notifications.push(
    'info',
    'Pagamentos processados pelo Mercado Pago. O cancelamento preserva o acesso até o fim do ciclo vigente.',
  )
}
</script>

<template>
  <div class="assinatura-page flex w-full flex-col gap-5 pb-8">
    <AssinaturaPageHeader />

    <TrialStatusBanner
      v-if="assinatura?.emTrial && assinatura.proximaDataVencimento"
      :dias-trial="assinatura.diasTrial"
      :proxima-data-vencimento="assinatura.proximaDataVencimento"
      :inicio="assinatura.inicio"
      :percentual-desconto-permanente="assinatura.percentualDescontoPermanente"
    />

    <BaseCard
      v-if="assinatura?.status === 'CancelamentoAgendado'"
      title="Cancelamento agendado"
    >
      <p class="text-sm text-glow-text-subtle">
        Sua assinatura permanece ativa até
        <strong>{{ formatDate(assinatura.fim ?? assinatura.proximaDataVencimento) }}</strong>.
        Depois disso, o acesso ao plano será encerrado automaticamente.
      </p>
    </BaseCard>

    <BaseCard v-if="assinatura?.status === 'PendentePagamento'" title="Pagamento pendente">
      <p class="mb-4 text-sm text-glow-text-subtle">
        Conclua o pagamento para liberar os módulos operacionais.
      </p>
      <BaseButton
        v-if="assinatura.pagamentoInicial?.checkoutUrl"
        variant="primary"
        @click="concluirPagamento"
      >
        Concluir pagamento
      </BaseButton>
    </BaseCard>

    <BaseCard
      v-if="mostrarLinkMinhasLojas"
      title="Multi-unidades"
    >
      <p class="mb-3 text-sm text-glow-text-subtle">
        <template v-if="contextoOnboarding">
          {{ contextoOnboarding.lojasVinculadas }}
          de
          {{ contextoOnboarding.limiteLojas ?? '—' }}
          lojas utilizadas.
        </template>
        A gestão operacional das unidades fica em Minhas Lojas.
      </p>
      <RouterLink :to="ROUTE_PATHS.MINHAS_LOJAS">
        <BaseButton variant="secondary">Gerenciar lojas</BaseButton>
      </RouterLink>
    </BaseCard>

    <template v-if="paginaPronta && assinatura">
      <AssinaturaPlanoHero
        :plano-nome="planoNome"
        :plano="planoAtual"
        :assinatura="assinatura"
      />

      <div class="grid gap-5 lg:grid-cols-5 lg:items-stretch">
        <AssinaturaDetalhesCard
          class="lg:col-span-3"
          :plano-nome="planoNome"
          :plano="planoAtual"
          :assinatura="assinatura"
          :pode-cancelar="assinatura.status !== 'CancelamentoAgendado'"
          @trocar-plano="irTrocarPlano"
          @cancelar="dialogAberto = true"
        />
        <AssinaturaBeneficiosCard
          class="lg:col-span-2"
          :plano="planoAtual"
          :plano-nome="planoNome"
          @ver-beneficios="scrollComparacao"
        />
      </div>

      <AssinaturaComparacaoPlanos
        id="assinatura-comparacao"
        :planos="planos"
        :plano-atual-id="assinatura.planoId ?? planoId"
        @upgrade="irUpgrade"
        @ver-planos="irTrocarPlano"
      />

      <AssinaturaSegurancaBanner @saiba-mais="abrirPolitica" />
    </template>

    <BaseCard v-else-if="paginaPronta" title="Nenhuma assinatura ativa">
      <p class="mb-4 text-sm text-glow-text-subtle">
        Contrate um plano para liberar a operação completa da sua loja.
      </p>
      <BaseButton variant="primary" @click="irContratar">Ver planos</BaseButton>
    </BaseCard>

    <CancelarAssinaturaDialog
      :open="dialogAberto"
      :loading="cancelando"
      @confirm="confirmarCancelamento"
      @cancel="dialogAberto = false"
    />
  </div>
</template>
