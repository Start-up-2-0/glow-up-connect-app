<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import AssinaturaResumoCard from '@/components/assinatura/AssinaturaResumoCard.vue'
import CancelarAssinaturaDialog from '@/components/assinatura/CancelarAssinaturaDialog.vue'
import TrialStatusBanner from '@/components/assinatura/TrialStatusBanner.vue'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { ROUTE_PATHS } from '@/constants/routes'

const router = useRouter()
const { assinaturaId, planoNome, estabelecimentoAtivo, ensureContext } = useNegocioContext()
const assinaturaStore = useAssinaturaStore()
const { assinatura, loading } = storeToRefs(assinaturaStore)
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const dialogAberto = ref(false)
const cancelando = ref(false)

onMounted(async () => {
  await ensureContext()
  if (!estabelecimentoAtivo.value) {
    await router.replace(ROUTE_PATHS.ONBOARDING_PLANOS)
  }
})

async function confirmarCancelamento() {
  if (!assinaturaId.value) return
  cancelando.value = true
  try {
    await assinaturaStore.cancelar(assinaturaId.value)
    notifications.push('success', 'Assinatura cancelada.')
    dialogAberto.value = false
    await router.push(ROUTE_PATHS.ONBOARDING_PLANOS)
  } catch (err) {
    notifications.push('error', resolveError(err))
  } finally {
    cancelando.value = false
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
    />

    <BaseCard
      v-if="assinatura?.status === 'PendentePagamento'"
      title="Pagamento pendente"
    >
      <p class="mb-4 text-sm text-glow-text-subtle">
        Conclua o pagamento para liberar os módulos operacionais.
      </p>
      <a
        v-if="assinatura.pagamentoInicial?.checkoutUrl"
        :href="assinatura.pagamentoInicial.checkoutUrl"
        class="inline-block"
      >
        <BaseButton variant="primary">Concluir pagamento</BaseButton>
      </a>
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
      <BaseButton variant="danger" @click="dialogAberto = true">
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
