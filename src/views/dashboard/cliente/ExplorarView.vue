<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import EstabelecimentoCard from '@/components/cliente/EstabelecimentoCard.vue'
import { publicoService } from '@/services/publicoService'
import { useGeolocation } from '@/composables/useGeolocation'
import { useApiError } from '@/composables/useApiError'
import {
  CLIENTE_BTN_OUTLINE_CLASS,
  CLIENTE_PAGE_DIVIDER_CLASS,
} from '@/constants/designTokens'
import type {
  EstabelecimentoCategoria,
  EstabelecimentoProximo,
} from '@/types/estabelecimento.types'

const RAIO_KM = 10
/** Chave de persistência dos filtros do Explorar (estrutura extensível p/ futuros filtros). */
const FILTROS_KEY = 'guc_explorar_filtros'

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

const categorias = ref<EstabelecimentoCategoria[]>([])
const categoriaSelecionada = ref<string>('')

const categoriaOptions = computed(() => [
  { value: '', label: 'Todas' },
  ...categorias.value.map((c) => ({ value: String(c.id), label: c.nome })),
])

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
      categoriaId: categoriaSelecionada.value
        ? Number(categoriaSelecionada.value)
        : undefined,
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

async function carregarCategorias() {
  try {
    categorias.value = await publicoService.listarCategorias()
  } catch {
    categorias.value = []
  }
}

function lerFiltroPersistido() {
  try {
    const raw = localStorage.getItem(FILTROS_KEY)
    const parsed = raw ? (JSON.parse(raw) as Record<string, string>) : {}
    categoriaSelecionada.value = String(parsed.categoriaId ?? '')
  } catch {
    categoriaSelecionada.value = ''
  }
}

function persistirFiltro() {
  const filtros: Record<string, string> = {
    ...(JSON.parse(localStorage.getItem(FILTROS_KEY) ?? '{}') as Record<string, string>),
    categoriaId: categoriaSelecionada.value,
  }
  localStorage.setItem(FILTROS_KEY, JSON.stringify(filtros))
}

// Troca de filtro → persiste e recarrega do topo.
watch(categoriaSelecionada, () => {
  persistirFiltro()
  void carregar(true)
})

function selecionarCategoria(value: string) {
  if (categoriaSelecionada.value === value) return
  categoriaSelecionada.value = value
}

onMounted(async () => {
  lerFiltroPersistido()
  void carregarCategorias()
  await carregar(true)
})
</script>

<template>
  <div class="cliente-explorar-page">
    <header class="cliente-explorar-intro">
      <div class="cliente-explorar-intro__top">
        <div class="cliente-explorar-intro__text">
          <h1 class="cliente-explorar-intro__title">Explorar lojas</h1>
          <p class="cliente-explorar-intro__subtitle">{{ subtituloLocal }}</p>
        </div>

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
    </header>

    <!-- Filtro por categoria (extensível p/ outros filtros) -->
    <div class="mt-5 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Filtrar por categoria">
      <button
        v-for="opt in categoriaOptions"
        :key="opt.value"
        type="button"
        role="tab"
        :aria-selected="categoriaSelecionada === opt.value"
        class="explorar-chip"
        :class="categoriaSelecionada === opt.value ? 'explorar-chip--active' : ''"
        @click="selecionarCategoria(opt.value)"
      >
        {{ opt.label }}
      </button>
    </div>

    <div
      :class="CLIENTE_PAGE_DIVIDER_CLASS"
      class="cliente-explorar-intro__divider"
      role="separator"
      aria-hidden="true"
    />

    <BaseAlert v-if="errorMessage && !loading" variant="warning" class="mt-6">
      {{ errorMessage }}
      <button type="button" :class="[CLIENTE_BTN_OUTLINE_CLASS, 'mt-3']" @click="handleRetryLocation">
        Tentar novamente
      </button>
    </BaseAlert>

    <BaseAlert v-if="error" variant="error" class="mt-6">{{ error }}</BaseAlert>

    <div
      v-if="itens.length === 0 && !errorMessage && !loading && !geoLoading"
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

<style scoped>
.explorar-chip {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  padding: 7px 14px;
  border-radius: 9999px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  color: var(--glow-text-subtle);
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.18s ease;
}
.explorar-chip:hover {
  background: var(--glow-surface-tint);
  color: var(--glow-text);
}
.explorar-chip:focus-visible {
  outline: 2px solid var(--glow-gold-cta);
  outline-offset: 2px;
}
.explorar-chip--active {
  background: var(--glow-gold-cta);
  border-color: var(--glow-gold-cta);
  color: #fff;
  box-shadow: 0 4px 12px -4px color-mix(in srgb, var(--glow-gold-cta) 55%, transparent);
}
</style>
