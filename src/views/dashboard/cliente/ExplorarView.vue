<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import LoadingSpinner from '@/components/feedback/LoadingSpinner.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import EstabelecimentoCard from '@/components/cliente/EstabelecimentoCard.vue'
import { publicoService } from '@/services/publicoService'
import { useGeolocation } from '@/composables/useGeolocation'
import { useApiError } from '@/composables/useApiError'
import {
  CLIENTE_BTN_OUTLINE_CLASS,
  CLIENTE_PAGE_DIVIDER_CLASS,
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
    <header class="cliente-explorar-intro">
      <h1 class="cliente-explorar-intro__title">Explorar lojas</h1>
      <p class="cliente-explorar-intro__subtitle">{{ subtituloLocal }}</p>
    </header>

    <div
      :class="CLIENTE_PAGE_DIVIDER_CLASS"
      class="cliente-explorar-intro__divider"
      role="separator"
      aria-hidden="true"
    />

    <div class="cliente-explorar-toolbar">
      <button
        type="button"
        class="cliente-explorar-btn-localizacao"
        :disabled="geoLoading || loading"
        @click="handleRetryLocation"
      >
        <svg
          class="cliente-explorar-btn-localizacao__icon"
          :class="{ 'animate-spin': geoLoading }"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M17.5 10a7.5 7.5 0 1 1-2.2-5.3"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
          />
          <path
            d="M17.5 3.5V10h-6.5"
            stroke="currentColor"
            stroke-width="1.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        Atualizar localização
      </button>
    </div>

    <BaseAlert v-if="errorMessage && !loading" variant="warning" class="mt-6">
      {{ errorMessage }}
      <button type="button" :class="[CLIENTE_BTN_OUTLINE_CLASS, 'mt-3']" @click="handleRetryLocation">
        Tentar novamente
      </button>
    </BaseAlert>

    <BaseAlert v-if="error" variant="error" class="mt-6">{{ error }}</BaseAlert>

    <LoadingSpinner v-if="loading || (geoLoading && itens.length === 0)" class="mt-6" />

    <div
      v-else-if="itens.length === 0 && !errorMessage"
      class="cliente-empty-panel mt-6"
    >
      <EmptyState
        title="Nenhuma loja encontrada"
        description="Não há estabelecimentos geocodificados neste raio. Tente atualizar sua localização."
      />
    </div>

    <template v-else-if="itens.length > 0">
      <div class="cliente-explorar-grid" role="list">
        <EstabelecimentoCard
          v-for="item in itens"
          :key="item.publicGuid"
          role="listitem"
          :item="item"
        />
      </div>

      <div v-if="hasMore()" class="cliente-explorar-load-more">
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
