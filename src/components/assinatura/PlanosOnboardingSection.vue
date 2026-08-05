<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import EmptyState from '@/components/feedback/EmptyState.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import PlanosPromoBanner from '@/components/assinatura/planos/PlanosPromoBanner.vue'
import PlanosPricingCard from '@/components/assinatura/planos/PlanosPricingCard.vue'
import PlanosTrustBar from '@/components/assinatura/planos/PlanosTrustBar.vue'
import { usePlanosStore } from '@/stores/planos.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useApiError } from '@/composables/useApiError'
import { ordenarPlanosPorPreco } from '@/utils/planoDisplay'

withDefaults(
  defineProps<{
    modoLogado?: boolean
  }>(),
  {
    modoLogado: false,
  },
)

const planosStore = usePlanosStore()
const negocioStore = useNegocioStore()
const { planos, promocao, loading } = storeToRefs(planosStore)
const { resolveError } = useApiError()
const erro = ref<string | null>(null)

const planosOrdenados = computed(() => ordenarPlanosPorPreco(planos.value))

const planoDestaqueId = computed(() => {
  const plus = planosOrdenados.value.find((p) => p.nome === 'Plus')
  return plus?.id ?? planosOrdenados.value[1]?.id ?? null
})

const exibirPromocaoTrial = computed(() => {
  if (!promocao.value?.disponivel) return false
  const jaTeveAssinatura = negocioStore.estabelecimentos.some((e) => Boolean(e.assinaturaId))
  return !jaTeveAssinatura
})

const percentualDescontoPromocao = computed(() =>
  exibirPromocaoTrial.value ? (promocao.value?.percentualDescontoMensalidade ?? null) : null,
)

onMounted(async () => {
  try {
    await planosStore.fetchPlanos()
  } catch (err) {
    erro.value = resolveError(err)
  }
})
</script>

<template>
  <div class="space-y-8">
    <PlanosPromoBanner v-if="exibirPromocaoTrial && promocao" :promocao="promocao" />

    <LoadingSpinner v-if="loading" />

    <p v-else-if="erro" class="text-center font-urbanist text-sm text-red-600">{{ erro }}</p>

    <EmptyState
      v-else-if="planosOrdenados.length === 0"
      title="Nenhum plano disponível"
      description="Tente novamente mais tarde."
    />

    <template v-else>
      <div
        class="mx-auto grid max-w-6xl grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-6 xl:pt-3"
      >
        <PlanosPricingCard
          v-for="plano in planosOrdenados"
          :key="plano.id"
          :plano="plano"
          :planos-ordenados="planosOrdenados"
          :destacado="plano.id === planoDestaqueId"
          :modo-logado="modoLogado"
          :percentual-desconto="percentualDescontoPromocao"
        />
      </div>

      <PlanosTrustBar :dias-trial="exibirPromocaoTrial ? promocao?.diasTrial : undefined" />
    </template>
  </div>
</template>
