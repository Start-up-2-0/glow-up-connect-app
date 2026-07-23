<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { RouterLink } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import AssinaturaResumoCard from '@/components/assinatura/AssinaturaResumoCard.vue'
import CancelarAssinaturaDialog from '@/components/assinatura/CancelarAssinaturaDialog.vue'
import TrialStatusBanner from '@/components/assinatura/TrialStatusBanner.vue'
import AdicionarUnidadePanel from '@/components/assinatura/AdicionarUnidadePanel.vue'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useTrocarEstabelecimento } from '@/composables/useTrocarEstabelecimento'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useUserStore } from '@/stores/user.store'
import { useApiError } from '@/composables/useApiError'
import { assinaturaService } from '@/services/assinaturaService'
import { ROUTE_PATHS } from '@/constants/routes'
import { redirectToLandingPlanos } from '@/utils/landingUrl'
import { formatDate } from '@/utils/formatters'
import type { AssinaturaOnboardingContexto } from '@/types/assinaturaOnboarding.types'
import type { EstabelecimentoOnboarding } from '@/types/assinatura.types'
import { redirectToThirdPartyUrl } from '@/utils/thirdPartyRedirect'

const router = useRouter()
const { assinaturaId, planoNome, estabelecimentoAtivo, ensureContext } = useNegocioContext()
const { trocarEstabelecimento } = useTrocarEstabelecimento()
const assinaturaStore = useAssinaturaStore()
const { assinatura, loading } = storeToRefs(assinaturaStore)
const notifications = useNotificationsStore()
const userStore = useUserStore()
const { resolveError } = useApiError()

const dialogAberto = ref(false)
const cancelando = ref(false)
const contextoOnboarding = ref<AssinaturaOnboardingContexto | null>(null)
const exibirFormUnidade = ref(false)
const adicionandoUnidade = ref(false)
const erroUnidade = ref<string | null>(null)

onMounted(async () => {
  await ensureContext()
  if (!estabelecimentoAtivo.value) {
    redirectToLandingPlanos()
    return
  }
  if (assinaturaId.value) {
    await assinaturaStore.fetchAtual(estabelecimentoAtivo.value.estabelecimentoId)
  }
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

async function adicionarUnidade(estabelecimento: EstabelecimentoOnboarding) {
  const id = contextoOnboarding.value?.assinaturaPremiumId ?? assinaturaId.value
  if (!id) return
  adicionandoUnidade.value = true
  erroUnidade.value = null
  try {
    const resultado = await assinaturaStore.adicionarEstabelecimento(id, { estabelecimento })
    await trocarEstabelecimento(resultado.estabelecimentoId)
    notifications.push('success', `Unidade "${resultado.nome}" adicionada com sucesso.`)
    exibirFormUnidade.value = false
    contextoOnboarding.value = await assinaturaService.obterContextoOnboarding()
  } catch (err) {
    erroUnidade.value = resolveError(err)
  } finally {
    adicionandoUnidade.value = false
  }
}

function concluirPagamento() {
  const url = assinatura.value?.pagamentoInicial?.checkoutUrl
  if (url) {
    redirectToThirdPartyUrl(url)
  }
}
</script>

<template>
  <div class="mx-auto max-w-3xl space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h1 class="font-satoshi text-xl font-bold text-glow-text lg:text-2xl">Assinatura</h1>
      <RouterLink :to="ROUTE_PATHS.CONFIG_ASSINATURA_FATURAS">
        <BaseButton variant="secondary">Ver faturas</BaseButton>
      </RouterLink>
    </div>

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

    <BaseCard
      v-if="assinatura?.status === 'PendentePagamento'"
      title="Pagamento pendente"
    >
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
      v-if="contextoOnboarding?.podeAdicionarLoja"
      title="Multi-unidades Premium"
    >
      <p class="mb-3 text-sm text-glow-text-subtle">
        {{ contextoOnboarding.lojasVinculadas }}
        de
        {{ contextoOnboarding.limiteLojas ?? '—' }}
        unidades em uso.
      </p>
      <BaseButton
        v-if="!exibirFormUnidade"
        variant="primary"
        @click="exibirFormUnidade = true"
      >
        Adicionar unidade
      </BaseButton>
      <AdicionarUnidadePanel
        v-else
        :loading="adicionandoUnidade"
        :error-message="erroUnidade"
        @submit="adicionarUnidade"
        @cancel="exibirFormUnidade = false"
      />
    </BaseCard>

    <LoadingSpinner v-if="loading" />
    <AssinaturaResumoCard
      v-else
      :plano-nome="planoNome"
      :assinatura="assinatura"
    />

    <div class="flex flex-wrap gap-3">
      <RouterLink :to="ROUTE_PATHS.CONFIG_ASSINATURA_UPGRADE">
        <BaseButton variant="primary">Trocar plano</BaseButton>
      </RouterLink>
      <RouterLink
        v-if="contextoOnboarding?.podeAdicionarLoja"
        :to="ROUTE_PATHS.FINANCEIRO_REDE"
      >
        <BaseButton variant="secondary">Painel da rede</BaseButton>
      </RouterLink>
      <BaseButton variant="danger" :disabled="assinatura?.status === 'CancelamentoAgendado'" @click="dialogAberto = true">
        Cancelar assinatura
      </BaseButton>
    </div>

    <CancelarAssinaturaDialog
      :open="dialogAberto"
      :loading="cancelando"
      @confirm="confirmarCancelamento"
      @cancel="dialogAberto = false"
    />
  </div>
</template>
