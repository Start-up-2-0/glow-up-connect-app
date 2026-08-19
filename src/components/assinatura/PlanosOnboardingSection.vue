<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import EmptyState from '@/components/feedback/EmptyState.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import PlanosPromoBanner from '@/components/assinatura/planos/PlanosPromoBanner.vue'
import PlanosPricingCard from '@/components/assinatura/planos/PlanosPricingCard.vue'
import PlanosTrustBar from '@/components/assinatura/planos/PlanosTrustBar.vue'
import TipoOperacaoPicker from '@/components/assinatura/TipoOperacaoPicker.vue'
import { usePlanosStore } from '@/stores/planos.store'
import { useNegocioStore } from '@/stores/negocio.store'
import { useApiError } from '@/composables/useApiError'
import { ordenarPlanosPorPreco } from '@/utils/planoDisplay'
import { FEATURE_FLAGS } from '@/config/features'
import { TIPO_ASSINATURA_PADRAO } from '@/utils/tipoAssinatura'
import type { TipoAssinatura } from '@/types/assinatura.types'

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
const tipoAssinatura = ref<TipoAssinatura | null>(
  FEATURE_FLAGS.lojasHabilitadas ? null : TIPO_ASSINATURA_PADRAO,
)

const planosOrdenados = computed(() => ordenarPlanosPorPreco(planos.value))

const planoDestaqueId = computed(() => {
  const premium = planosOrdenados.value.find((p) =>
    p.nome.toLowerCase().includes('premium'),
  )
  return premium?.id ?? planosOrdenados.value[1]?.id ?? null
})

const exibirPromocaoTrial = computed(() => {
  if (!promocao.value?.disponivel) return false
  const jaTeveAssinatura = negocioStore.estabelecimentos.some((e) => Boolean(e.assinaturaId))
  return !jaTeveAssinatura
})

const percentualDescontoPromocao = computed(() =>
  exibirPromocaoTrial.value ? (promocao.value?.percentualDescontoMensalidade ?? null) : null,
)

const copyTitulo = computed(() =>
  tipoAssinatura.value === 'ProfissionalAutonomo'
    ? 'Planos para profissionais autônomos'
    : 'Planos para estabelecimentos',
)

const copySubtitulo = computed(() =>
  tipoAssinatura.value === 'ProfissionalAutonomo'
    ? 'Uma experiência feita para quem trabalha sozinho — sem equipe, sem comissões.'
    : 'Gestão completa para o seu negócio com equipe.',
)

async function carregarPlanos(tipo: TipoAssinatura) {
  erro.value = null
  try {
    await planosStore.fetchPlanos(true, tipo)
  } catch (err) {
    erro.value = resolveError(err)
  }
}

watch(tipoAssinatura, (tipo) => {
  if (tipo) void carregarPlanos(tipo)
}, { immediate: true })

onMounted(async () => {
  if (!FEATURE_FLAGS.lojasHabilitadas) {
    tipoAssinatura.value = TIPO_ASSINATURA_PADRAO
  }
})
</script>

<template>
  <div class="space-y-8">
    <TipoOperacaoPicker v-if="FEATURE_FLAGS.lojasHabilitadas" v-model="tipoAssinatura" />

    <template v-if="tipoAssinatura">
      <div class="mx-auto max-w-2xl text-center">
        <h2 class="font-satoshi text-xl font-bold text-glow-text sm:text-2xl">{{ copyTitulo }}</h2>
        <p class="mt-2 font-urbanist text-sm text-glow-text-subtle">{{ copySubtitulo }}</p>
      </div>

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
            :tipo-assinatura="tipoAssinatura"
            :percentual-desconto="percentualDescontoPromocao"
          />
        </div>

        <PlanosTrustBar :dias-trial="exibirPromocaoTrial ? promocao?.diasTrial : undefined" />
      </template>
    </template>
  </div>
</template>
