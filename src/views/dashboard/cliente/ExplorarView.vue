<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import EstabelecimentoCard from '@/components/cliente/EstabelecimentoCard.vue'
import ClientePageHeader from '@/components/cliente/ClientePageHeader.vue'
import { publicoService } from '@/services/publicoService'
import { useGeolocation } from '@/composables/useGeolocation'
import { useApiError } from '@/composables/useApiError'
import {
  CLIENTE_BTN_OUTLINE_CLASS,
} from '@/constants/designTokens'
import type { EstabelecimentoProximo } from '@/types/estabelecimento.types'

const RAIO_KM = 10

const { coords, loading: geoLoading, errorMessage, request } = useGeolocation()
const { resolveError } = useApiError()

const itens = ref<EstabelecimentoProximo[]>([])
const cidade = ref('')
const estado = ref('')
const total = ref(0)
const pagina = ref(1)
const loading = ref(false)
const loadingMore = ref(false)
const error = ref<string | null>(null)

const subtituloLocal = computed(() => {
  if (cidade.value && estado.value) return `Estabelecimentos em ${cidade.value}, ${estado.value}`
  if (cidade.value) return `Estabelecimentos em ${cidade.value}`
  return 'Busque estabelecimentos por proximidade e agende serviços.'
})

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
    estado.value = data.estado
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
  <div class="cliente-explorar-page">
    <ClientePageHeader :subtitle="subtituloLocal" />

    <div class="cliente-explorar-toolbar">
      <button
        type="button"
        :class="CLIENTE_BTN_OUTLINE_CLASS"
        :disabled="geoLoading || loading"
        @click="handleRetryLocation"
      >
        <svg
          class="size-5 shrink-0"
          :class="{ 'animate-spin': geoLoading }"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M10 3v2M10 15v2M3 10H5M15 10h2M5.05 5.05l1.42 1.42M13.53 13.53l1.42 1.42M5.05 14.95l1.42-1.42M13.53 6.47l1.42-1.42"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
          />
        </svg>
        Atualizar localização
      </button>
    </div>

    <BaseAlert v-if="errorMessage && !loading" variant="warning">
      {{ errorMessage }}
      <button type="button" :class="[CLIENTE_BTN_OUTLINE_CLASS, 'mt-3']" @click="handleRetryLocation">
        Tentar novamente
      </button>
    </BaseAlert>

    <BaseAlert v-if="error" variant="error">{{ error }}</BaseAlert>

    <LoadingSpinner v-if="loading || (geoLoading && itens.length === 0)" />

    <div
      v-else-if="itens.length === 0 && !errorMessage"
      class="cliente-empty-panel"
    >
      <EmptyState
        title="Nenhuma loja encontrada"
        description="Não há estabelecimentos geocodificados neste raio. Tente atualizar sua localização."
      />
    </div>

    <template v-else-if="itens.length > 0">
      <div class="cliente-explorar-grid">
        <EstabelecimentoCard v-for="item in itens" :key="item.publicGuid" :item="item" />
      </div>

      <div v-if="hasMore()" class="flex justify-center pt-6">
        <button
          type="button"
          :class="CLIENTE_BTN_OUTLINE_CLASS"
          :disabled="loadingMore"
          @click="handleLoadMore"
        >
          {{ loadingMore ? 'Carregando…' : 'Carregar mais' }}
        </button>
      </div>
    </template>
  </div>
</template>
