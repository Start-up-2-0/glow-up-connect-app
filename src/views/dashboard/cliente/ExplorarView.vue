<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { LocateFixed, Search } from 'lucide-vue-next'
import BaseAlert from '@/components/feedback/BaseAlert.vue'
import EmptyState from '@/components/feedback/EmptyState.vue'
import ExplorarMapa from '@/components/cliente/ExplorarMapa.vue'
import { publicoService } from '@/services/publicoService'
import { useGeolocation } from '@/composables/useGeolocation'
import { useApiError } from '@/composables/useApiError'
import { CLIENTE_BTN_OUTLINE_CLASS } from '@/constants/designTokens'
import type {
  EstabelecimentoCategoria,
  EstabelecimentoProximo,
} from '@/types/estabelecimento.types'
import { visivelNoMarketplace, tipoAssinaturaParaCategorias } from '@/utils/tipoAssinatura'
import { FEATURE_FLAGS } from '@/config/features'
import { distanciaMetros, estabelecimentoTemCoordenadas } from '@/utils/explorarMapa'
import {
  COARSE_ACCURACY_M,
  RELIABLE_ACCURACY_M,
} from '@/composables/useGeolocation'

const RAIO_KM = 12
const FILTROS_KEY = 'guc_explorar_filtros'
/** Centro neutro só para abrir o mapa se o GPS falhar — nunca como “posição do usuário”. */
const MAP_BOOTSTRAP_CENTER = { latitude: -10.9472, longitude: -37.0731 }
const REFETCH_USER_METERS = 250
const ACCURACY_CORRECTION_METERS = 60

const {
  coords,
  loading: geoLoading,
  watching: geoWatching,
  isReliable,
  isCoarse,
  errorMessage,
  request,
  startWatch,
  stopWatch,
} = useGeolocation()
const { resolveError } = useApiError()

const itens = ref<EstabelecimentoProximo[]>([])
const cidade = ref('')
const estado = ref('')
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

const categorias = ref<EstabelecimentoCategoria[]>([])
const categoriaSelecionada = ref<string>('')
const busca = ref('')
const selectedGuid = ref<string | null>(null)
const focusGuid = ref<string | null>(null)
const mapaRef = ref<InstanceType<typeof ExplorarMapa> | null>(null)
/** Mantém o mapa acompanhando o GPS até o usuário arrastar o mapa. */
const followUser = ref(false)

/** Centro usado na consulta (usuário ou área do mapa). */
const queryCenter = ref<{ latitude: number; longitude: number } | null>(null)
/** Última posição do usuário usada para buscar estabelecimentos. */
const lastUserFetch = ref<{ latitude: number; longitude: number } | null>(null)

const localizacaoAproximada = computed(() => isCoarse.value && coords.value != null)

const precisaoLabel = computed(() => {
  const acc = coords.value?.accuracy
  if (acc == null || !Number.isFinite(acc)) return null
  if (acc <= RELIABLE_ACCURACY_M) return `Precisão ~${Math.round(acc)} m`
  if (acc <= COARSE_ACCURACY_M) return `Precisão ~${Math.round(acc)} m`
  if (acc >= 1000) return `Localização aproximada (~${(acc / 1000).toFixed(1)} km)`
  return `Localização aproximada (~${Math.round(acc)} m)`
})

/** Só exibe o ponto do usuário quando houver coordenada real do GPS. */
const userLat = computed(() => coords.value?.latitude ?? null)
const userLng = computed(() => coords.value?.longitude ?? null)
const userAccuracy = computed(() => coords.value?.accuracy ?? null)
const podeSeguirUsuario = computed(() => followUser.value && isReliable.value)
const mapaVisivel = computed(
  () => queryCenter.value != null || coords.value != null || !geoLoading,
)

const categoriaOptions = computed(() => [
  { value: '', label: 'Todas' },
  ...categorias.value.map((c) => ({ value: String(c.id), label: c.nome })),
])

const subtituloLocal = computed(() => {
  if (cidade.value && estado.value) return `${cidade.value}, ${estado.value}`
  if (cidade.value) return cidade.value
  return FEATURE_FLAGS.lojasHabilitadas
    ? 'Descubra profissionais e lojas próximas no mapa'
    : 'Descubra profissionais próximos no mapa'
})

const itensFiltrados = computed(() => {
  const visiveis = itens.value.filter(visivelNoMarketplace)
  const q = busca.value.trim().toLowerCase()
  if (!q) return visiveis
  return visiveis.filter((item) => {
    const hay = [
      item.nome,
      item.categoria ?? '',
      item.endereco?.logradouro ?? '',
      item.endereco?.bairro ?? '',
      item.endereco?.cidade ?? '',
    ]
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

async function carregar(opts?: { latitude: number; longitude: number }) {
  const location =
    opts ??
    queryCenter.value ??
    (coords.value && !isCoarse.value ? coords.value : null) ??
    MAP_BOOTSTRAP_CENTER

  queryCenter.value = {
    latitude: location.latitude,
    longitude: location.longitude,
  }

  loading.value = true
  error.value = null
  try {
    const data = await publicoService.listarProximos({
      latitude: location.latitude,
      longitude: location.longitude,
      raioKm: RAIO_KM,
      pagina: 1,
      tamanhoPagina: 50,
      categoriaId: categoriaSelecionada.value
        ? Number(categoriaSelecionada.value)
        : undefined,
    })
    cidade.value = data.cidade
    estado.value = data.estado
    total.value = data.total
    itens.value = data.itens

    if (
      selectedGuid.value &&
      !data.itens.some((i) => i.publicGuid === selectedGuid.value)
    ) {
      selectedGuid.value = null
    }
  } catch (err) {
    error.value = resolveError(
      err,
      FEATURE_FLAGS.lojasHabilitadas
        ? 'Não foi possível carregar estabelecimentos.'
        : 'Não foi possível carregar profissionais.',
    )
  } finally {
    loading.value = false
  }
}

async function handleRetryLocation() {
  followUser.value = true
  const location = await request({
    force: true,
    waitMs: 25_000,
    targetAccuracyM: 35,
    minSamples: 4,
  })
  startWatch()
  if (!location) return
  selectedGuid.value = null
  lastUserFetch.value = {
    latitude: location.latitude,
    longitude: location.longitude,
  }
  await carregar(location)
  // Só centraliza com força se a leitura estiver confiável; senão o círculo mostra a incerteza.
  if (isReliable.value) {
    mapaRef.value?.recenterUser()
  } else {
    mapaRef.value?.panToUser()
  }
}

function onBoundsChange(payload: { latitude: number; longitude: number }) {
  void carregar(payload)
}

function onUserInteract() {
  followUser.value = false
}

async function carregarCategorias() {
  try {
    categorias.value = await publicoService.listarCategorias(tipoAssinaturaParaCategorias())
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

watch(categoriaSelecionada, () => {
  persistirFiltro()
  selectedGuid.value = null
  void carregar()
})

function selecionarCategoria(value: string) {
  if (categoriaSelecionada.value === value) return
  categoriaSelecionada.value = value
}

function onBuscaEnter() {
  const match = itensFiltrados.value.find(estabelecimentoTemCoordenadas)
  if (!match) return
  focusGuid.value = match.publicGuid
  selectedGuid.value = match.publicGuid
}

watch(busca, (q) => {
  if (!q.trim()) return
  const match = itensFiltrados.value.find(estabelecimentoTemCoordenadas)
  if (match && itensFiltrados.value.length === 1) {
    focusGuid.value = match.publicGuid
    selectedGuid.value = match.publicGuid
  }
})

watch(
  coords,
  (next, prev) => {
    if (!next) return

    // Quando a precisão melhora de “grosseira” para confiável, corrige o mapa.
    if (prev && lastUserFetch.value) {
      const prevAcc = prev.accuracy ?? Number.POSITIVE_INFINITY
      const nextAcc = next.accuracy ?? Number.POSITIVE_INFINITY
      const improved =
        (prevAcc > COARSE_ACCURACY_M && nextAcc <= RELIABLE_ACCURACY_M) ||
        nextAcc + 25 < prevAcc
      const jumped = distanciaMetros(lastUserFetch.value, next) >= ACCURACY_CORRECTION_METERS

      if (improved && jumped) {
        lastUserFetch.value = {
          latitude: next.latitude,
          longitude: next.longitude,
        }
        followUser.value = true
        void carregar(next)
        mapaRef.value?.recenterUser()
        return
      }
    }

    if (!followUser.value || !isReliable.value || !lastUserFetch.value || !prev) return

    const moved = distanciaMetros(lastUserFetch.value, next)
    if (moved < REFETCH_USER_METERS) return

    lastUserFetch.value = {
      latitude: next.latitude,
      longitude: next.longitude,
    }
    void carregar(next)
  },
)

onMounted(async () => {
  lerFiltroPersistido()
  void carregarCategorias()

  // 1) Amostra GPS com consenso (sem watch paralelo).
  // 2) Só então inicia acompanhamento contínuo.
  const location = await request({
    force: true,
    waitMs: 25_000,
    targetAccuracyM: 35,
    minSamples: 4,
  })
  startWatch()

  if (location) {
    followUser.value = isReliable.value
    lastUserFetch.value = {
      latitude: location.latitude,
      longitude: location.longitude,
    }
    await carregar(location)
    if (isReliable.value) {
      mapaRef.value?.recenterUser()
    }
  } else {
    followUser.value = false
    await carregar(MAP_BOOTSTRAP_CENTER)
  }
})

onUnmounted(() => {
  stopWatch()
})
</script>

<template>
  <div class="explorar-page">
    <header class="explorar-page__toolbar">
      <div class="explorar-page__heading">
        <h1 class="explorar-page__title">Explorar</h1>
        <p class="explorar-page__subtitle">{{ subtituloLocal }}</p>
      </div>

      <label class="explorar-page__search">
        <Search class="explorar-page__search-icon" aria-hidden="true" />
        <input
          v-model="busca"
          type="search"
          class="explorar-page__search-input"
          placeholder="Buscar por nome, bairro ou cidade..."
          autocomplete="off"
          @keydown.enter.prevent="onBuscaEnter"
        />
      </label>

      <button
        type="button"
        class="explorar-page__locate"
        :class="{ 'explorar-page__locate--active': followUser && geoWatching && isReliable }"
        :disabled="geoLoading"
        :aria-pressed="followUser && geoWatching && isReliable"
        :title="followUser && isReliable ? 'Acompanhando sua localização' : 'Centralizar na minha localização'"
        @click="handleRetryLocation"
      >
        <LocateFixed
          class="size-4"
          :class="{ 'animate-spin': geoLoading }"
          aria-hidden="true"
        />
        <span class="hidden sm:inline">
          {{ geoLoading ? 'Obtendo GPS…' : followUser && isReliable ? 'Acompanhar' : 'Minha localização' }}
        </span>
      </button>
    </header>

    <div
      class="explorar-page__chips"
      role="tablist"
      aria-label="Filtrar por categoria"
    >
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

    <BaseAlert v-if="errorMessage && !loading" variant="warning" class="mt-3">
      {{ errorMessage }}
      <button type="button" :class="[CLIENTE_BTN_OUTLINE_CLASS, 'mt-3']" @click="handleRetryLocation">
        Tentar novamente
      </button>
    </BaseAlert>

    <BaseAlert v-else-if="localizacaoAproximada" variant="warning" class="mt-3">
      A localização do navegador está imprecisa
      <template v-if="precisaoLabel"> ({{ precisaoLabel }})</template>
      e pode apontar para outro bairro. No celular com GPS, ou ao ar livre, a precisão melhora.
      <button type="button" :class="[CLIENTE_BTN_OUTLINE_CLASS, 'mt-3']" @click="handleRetryLocation">
        Tentar localização precisa
      </button>
    </BaseAlert>

    <BaseAlert v-if="error" variant="error" class="mt-3">{{ error }}</BaseAlert>

    <div class="explorar-page__map-shell">
      <div
        v-if="!mapaVisivel || (loading && itens.length === 0 && !queryCenter)"
        class="explorar-page__map-loading"
      >
        Carregando mapa…
      </div>

      <ExplorarMapa
        v-else
        ref="mapaRef"
        :itens="itensFiltrados"
        :user-lat="userLat"
        :user-lng="userLng"
        :user-accuracy="userAccuracy"
        :follow-user="podeSeguirUsuario"
        :selected-guid="selectedGuid"
        :focus-guid="focusGuid"
        @update:selected-guid="selectedGuid = $event"
        @bounds-change="onBoundsChange"
        @user-interact="onUserInteract"
      />

      <div
        v-if="itensFiltrados.length === 0 && !errorMessage && !loading && !geoLoading && queryCenter"
        class="explorar-page__empty-overlay"
      >
        <EmptyState
          :title="FEATURE_FLAGS.lojasHabilitadas ? 'Nenhuma loja nesta área' : 'Nenhum profissional nesta área'"
          description="Ajuste os filtros, mova o mapa ou atualize sua localização."
        />
      </div>

      <p v-if="itensFiltrados.length > 0 || precisaoLabel" class="explorar-page__count">
        <template v-if="itensFiltrados.length > 0">
          {{ itensFiltrados.length }}
          {{ FEATURE_FLAGS.lojasHabilitadas
            ? itensFiltrados.length === 1 ? 'loja' : 'lojas'
            : itensFiltrados.length === 1 ? 'profissional' : 'profissionais' }}
        </template>
        <template v-if="precisaoLabel">
          <span v-if="itensFiltrados.length > 0"> · </span>{{ precisaoLabel }}
        </template>
        <span v-if="loading || geoLoading" class="opacity-60"> · atualizando…</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
.explorar-page {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: calc(100dvh - 8.5rem);
}

.explorar-page__toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.explorar-page__heading {
  min-width: 0;
  flex: 1 1 10rem;
}

.explorar-page__title {
  font-family: 'Satoshi', ui-sans-serif, system-ui, sans-serif;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--glow-text);
  line-height: 1.2;
}

.explorar-page__subtitle {
  margin-top: 0.15rem;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.8125rem;
  color: var(--glow-text-subtle);
}

.explorar-page__search {
  position: relative;
  flex: 1 1 14rem;
  max-width: 22rem;
}

.explorar-page__search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  width: 1rem;
  height: 1rem;
  transform: translateY(-50%);
  color: var(--glow-text-subtle);
  pointer-events: none;
}

.explorar-page__search-input {
  width: 100%;
  height: 2.5rem;
  border-radius: 0.875rem;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  padding: 0 0.75rem 0 2.25rem;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.875rem;
  color: var(--glow-text);
  outline: none;
}

.explorar-page__search-input:focus {
  border-color: var(--glow-gold-cta);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--glow-gold-cta) 18%, transparent);
}

.explorar-page__locate {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 2.5rem;
  padding: 0 0.9rem;
  border-radius: 0.875rem;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  color: var(--glow-text);
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.15s ease, background 0.15s ease;
}

.explorar-page__locate:hover:not(:disabled) {
  border-color: color-mix(in srgb, var(--glow-gold-cta) 45%, transparent);
  background: var(--glow-hover-surface);
}

.explorar-page__locate:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.explorar-page__locate--active {
  border-color: var(--glow-gold-cta);
  background: color-mix(in srgb, var(--glow-gold-cta) 12%, var(--glow-surface));
  color: var(--glow-gold-cta);
}

.explorar-page__chips {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.15rem;
}

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
  background: var(--glow-surface-tint, var(--glow-hover-surface));
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

.explorar-page__map-shell {
  position: relative;
  z-index: 0;
  isolation: isolate;
  transform: translateZ(0);
  flex: 1 1 auto;
  min-height: min(62dvh, 640px);
  border-radius: 1.25rem;
  overflow: hidden;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  box-shadow: var(--shadow-glow-sm, 0 1px 2px rgb(0 0 0 / 0.04));
}

.explorar-page__map-loading {
  display: grid;
  place-items: center;
  min-height: inherit;
  padding: 2rem;
  color: var(--glow-text-subtle);
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.875rem;
}

.explorar-page__empty-overlay {
  position: absolute;
  inset: auto 0.75rem 4.5rem;
  z-index: 550;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.explorar-page__empty-overlay :deep(.empty-state),
.explorar-page__empty-overlay > * {
  pointer-events: auto;
  max-width: 20rem;
  border-radius: 1rem;
  border: 1px solid var(--glow-border-soft);
  background: color-mix(in srgb, var(--glow-surface) 96%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 32px -16px rgb(30 18 40 / 0.35);
  padding: 1rem;
}

.explorar-page__count {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  z-index: 500;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--glow-surface) 92%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid var(--glow-border-soft);
  padding: 0.35rem 0.7rem;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--glow-text-subtle);
  pointer-events: none;
}

@media (max-width: 640px) {
  .explorar-page {
    min-height: calc(100dvh - 7rem);
  }

  .explorar-page__search {
    flex: 1 1 100%;
    max-width: none;
    order: 3;
  }

  .explorar-page__map-shell {
    min-height: min(68dvh, 720px);
    border-radius: 1rem;
  }
}
</style>
