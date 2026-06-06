<script setup lang="ts">
import { onMounted, ref } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import EstabelecimentoCard from '@/components/cliente/EstabelecimentoCard.vue'
import { publicoService } from '@/services/publicoService'
import { useGeolocation } from '@/composables/useGeolocation'
import { useApiError } from '@/composables/useApiError'
import type { EstabelecimentoProximo } from '@/types/estabelecimento.types'

const RAIO_KM = 10

const { coords, loading: geoLoading, errorMessage, request } = useGeolocation()
const { resolveError } = useApiError()

const itens = ref<EstabelecimentoProximo[]>([])
const cidade = ref('')
const total = ref(0)
const pagina = ref(1)
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<string | null>(null)

async function carregar(reset = false) {
  if (reset) {
    pagina.value = 1
    itens.value = []
  }

  const location = coords.value ?? (await request())
  if (!location) return

  const isFirstPage = pagina.value === 1
  if (isFirstPage) loading.value = true
  else loadingMore.value = true

  error.value = null
  try {
    const data = await publicoService.listarProximos({
      latitude: location.latitude,
      longitude: location.longitude,
      raioKm: RAIO_KM,
      pagina: pagina.value,
      tamanhoPagina: 20,
    })
    cidade.value = data.cidade
    total.value = data.total
    itens.value = reset ? data.itens : [...itens.value, ...data.itens]
  } catch (err) {
    error.value = resolveError(err, 'Não foi possível carregar estabelecimentos.')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

async function handleRetryLocation() {
  await request({ force: true })
  await carregar(true)
}

async function handleLoadMore() {
  pagina.value += 1
  await carregar(false)
}

const hasMore = () => itens.value.length < total.value

onMounted(async () => {
  await carregar(true)
})
</script>

<template>
  <div class="space-y-4 lg:space-y-6">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 class="font-satoshi text-xl font-bold leading-tight text-glow-text lg:text-2xl">
          Explorar lojas
        </h1>
        <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">
          <template v-if="cidade">Estabelecimentos em {{ cidade }}</template>
          <template v-else>Busque estabelecimentos por proximidade e agende serviços.</template>
        </p>
      </div>
      <BaseButton variant="secondary" size="sm" :loading="geoLoading" @click="handleRetryLocation">
        Atualizar localização
      </BaseButton>
    </div>

    <BaseAlert v-if="errorMessage && !loading" variant="warning">
      {{ errorMessage }}
      <BaseButton class="mt-3" variant="secondary" size="sm" @click="handleRetryLocation">
        Tentar novamente
      </BaseButton>
    </BaseAlert>

    <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>

    <LoadingSpinner v-if="loading || (geoLoading && itens.length === 0)" />

    <BaseCard v-else-if="itens.length === 0 && !errorMessage">
      <EmptyState
        title="Nenhuma loja encontrada"
        description="Não há estabelecimentos geocodificados neste raio. Tente atualizar sua localização."
      />
    </BaseCard>

    <div v-else-if="itens.length > 0" class="space-y-3">
      <EstabelecimentoCard v-for="item in itens" :key="item.publicGuid" :item="item" />

      <div v-if="hasMore()" class="flex justify-center pt-2">
        <BaseButton variant="secondary" :loading="loadingMore" @click="handleLoadMore">
          Carregar mais
        </BaseButton>
      </div>
    </div>
  </div>
</template>
