<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import MercadoPagoCardForm from '@/components/assinatura/MercadoPagoCardForm.vue'
import PlanoUpgradeModal from '@/components/assinatura/PlanoUpgradeModal.vue'
import { usePlanosStore } from '@/stores/planos.store'
import { useAssinaturaStore } from '@/stores/assinatura.store'
import { useNegocioContext } from '@/composables/useNegocioContext'
import { useNotificationsStore } from '@/stores/notifications.store'
import { useApiError } from '@/composables/useApiError'
import { ROUTE_PATHS } from '@/constants/routes'
import { formatBRL } from '@/utils/formatters'

const router = useRouter()
const planosStore = usePlanosStore()
const assinaturaStore = useAssinaturaStore()
const { assinaturaId, planoId, planoNome, tipoAssinatura } = useNegocioContext()
const { planos, loading: planosLoading } = storeToRefs(planosStore)
const { loading: submitting } = storeToRefs(assinaturaStore)
const notifications = useNotificationsStore()
const { resolveError } = useApiError()

const modalAberto = ref(false)
const planoSelecionadoId = ref<number | null>(null)
const cardFormRef = ref<InstanceType<typeof MercadoPagoCardForm> | null>(null)
const confirmarDowngrade = ref(false)

onMounted(() => planosStore.fetchPlanos(false, tipoAssinatura.value ?? undefined))

function abrirModal(planoIdAlvo: number) {
  const atual = planos.value.find((p) => p.id === planoId.value)
  const alvo = planos.value.find((p) => p.id === planoIdAlvo)
  if (atual && alvo && alvo.preco < atual.preco) {
    planoSelecionadoId.value = planoIdAlvo
    confirmarDowngrade.value = true
    return
  }
  planoSelecionadoId.value = planoIdAlvo
  modalAberto.value = true
}

async function executarTroca() {
  if (!assinaturaId.value || !planoSelecionadoId.value) return

  const pagamento = await cardFormRef.value?.tokenizar()
  if (!pagamento) return

  try {
    await assinaturaStore.trocarPlano(assinaturaId.value, {
      novoPlanoId: planoSelecionadoId.value,
      gateway: 'MercadoPago',
      pagamento,
    })
    notifications.push('success', 'Plano alterado com sucesso!')
    modalAberto.value = false
    confirmarDowngrade.value = false
    await router.push(ROUTE_PATHS.CONFIG_ASSINATURA)
  } catch (err) {
    notifications.push('error', resolveError(err))
  }
}
</script>

<template>
  <div class="mx-auto max-w-2xl space-y-6">
    <h1 class="font-satoshi text-xl font-bold text-glow-text">Trocar plano</h1>

    <BaseCard>
      <p class="text-sm text-glow-text-subtle">
        Plano atual: <strong class="text-glow-text">{{ planoNome ?? '—' }}</strong>
      </p>
    </BaseCard>

    <div v-if="!planosLoading" class="space-y-3">
      <BaseCard
        v-for="plano in planos"
        :key="plano.id"
        class="flex items-center justify-between"
      >
        <div>
          <p class="font-medium text-glow-text">{{ plano.nome }}</p>
          <p class="text-sm text-glow-text-subtle">{{ formatBRL(plano.preco) }}/mês</p>
        </div>
        <BaseButton
          v-if="plano.id !== planoId"
          variant="secondary"
          size="sm"
          @click="abrirModal(plano.id)"
        >
          Selecionar
        </BaseButton>
        <span v-else class="text-xs text-glow-text-subtle">Atual</span>
      </BaseCard>
    </div>

    <PlanoUpgradeModal
      :open="modalAberto"
      :planos="planos"
      :plano-atual-id="planoId"
      :loading="submitting"
      @select="(id) => { planoSelecionadoId = id; modalAberto = true }"
      @close="modalAberto = false"
    />

    <Teleport to="body">
      <div
        v-if="confirmarDowngrade"
        class="fixed inset-0 z-[3000] flex items-center justify-center p-4"
      >
      <div class="absolute inset-0 glow-modal-scrim" @click="confirmarDowngrade = false" />
        <div class="relative z-10 w-full max-w-md rounded-lg border border-glow-border-soft bg-glow-surface p-6">
          <h2 class="mb-2 font-semibold text-glow-text">Confirmar downgrade</h2>
          <p class="mb-4 text-sm text-glow-text-subtle">
            Você pode perder acesso a módulos do plano atual. Deseja continuar?
          </p>
          <BaseCard title="Cartão para confirmação" class="mb-4">
            <MercadoPagoCardForm ref="cardFormRef" />
          </BaseCard>
          <div class="flex justify-end gap-2">
            <BaseButton variant="ghost" @click="confirmarDowngrade = false">Cancelar</BaseButton>
            <BaseButton variant="danger" :loading="submitting" @click="executarTroca">
              Confirmar
            </BaseButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
