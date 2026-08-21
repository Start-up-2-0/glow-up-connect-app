<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import type { EstabelecimentoProximo } from '@/types/estabelecimento.types'
import { estabelecimentoTemCoordenadas } from '@/utils/explorarMapa'
import ExplorarMapaCard from './ExplorarMapaCard.vue'

const props = defineProps<{
  itens: EstabelecimentoProximo[]
  userLat?: number | null
  userLng?: number | null
  /** Precisão GPS em metros (círculo de acurácia). */
  userAccuracy?: number | null
  selectedGuid?: string | null
  focusGuid?: string | null
  /** Quando true, o mapa acompanha o deslocamento do usuário. */
  followUser?: boolean
}>()

const emit = defineEmits<{
  'update:selectedGuid': [value: string | null]
  'bounds-change': [payload: { latitude: number; longitude: number }]
  'user-interact': []
}>()

const mapEl = ref<HTMLElement | null>(null)
const selectedItem = computed(
  () => props.itens.find((i) => i.publicGuid === props.selectedGuid) ?? null,
)

let map: L.Map | null = null
let cluster: L.MarkerClusterGroup | null = null
let userMarker: L.CircleMarker | null = null
let userAccuracyCircle: L.Circle | null = null
const markersByGuid = new Map<string, L.Marker>()
let moveTimer: ReturnType<typeof setTimeout> | null = null
let suppressTimer: ReturnType<typeof setTimeout> | null = null
let suppressBoundsEmit = false
let lastEmittedCenter: { lat: number; lng: number } | null = null
let userDragging = false

function withSuppressedBounds(action: () => void, ms = 800) {
  suppressBoundsEmit = true
  if (suppressTimer) clearTimeout(suppressTimer)
  action()
  suppressTimer = setTimeout(() => {
    suppressBoundsEmit = false
  }, ms)
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

function markerHtml(item: EstabelecimentoProximo, state: 'default' | 'selected' | 'destaque') {
  const classes = [
    'explorar-marker',
    state === 'selected' ? 'explorar-marker--selected' : '',
    state === 'destaque' || item.destaqueMarketplace ? 'explorar-marker--destaque' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const nome = item.nome || 'Estabelecimento'
  const label = escapeHtml(nome)
  const initial = escapeHtml(nome.charAt(0).toUpperCase())
  const logoSrc = item.logo?.trim()
  const avatar = logoSrc
    ? `<img class="explorar-marker__logo" src="${escapeHtml(logoSrc)}" alt="" width="28" height="28" loading="lazy" decoding="async" />`
    : `<span class="explorar-marker__initial">${initial}</span>`

  return `<button type="button" class="${classes}" aria-label="${label}"><span class="explorar-marker__avatar">${avatar}</span><span class="explorar-marker__name">${label}</span></button>`
}

function markerIcon(item: EstabelecimentoProximo, selected: boolean) {
  const state = selected ? 'selected' : item.destaqueMarketplace ? 'destaque' : 'default'
  return L.divIcon({
    className: 'explorar-marker-wrap',
    html: markerHtml(item, state),
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  })
}

function syncMarkers() {
  if (!map || !cluster) return

  cluster.clearLayers()
  markersByGuid.clear()

  const comCoords = props.itens.filter(estabelecimentoTemCoordenadas)
  for (const item of comCoords) {
    const selected = item.publicGuid === props.selectedGuid
    const marker = L.marker([item.latitude, item.longitude], {
      icon: markerIcon(item, selected),
      riseOnHover: true,
      title: item.nome,
    })
    marker.on('click', () => {
      emit('update:selectedGuid', item.publicGuid)
    })
    markersByGuid.set(item.publicGuid, marker)
    cluster.addLayer(marker)
  }
}

function clearUserLayers() {
  if (!map) return
  if (userMarker) {
    map.removeLayer(userMarker)
    userMarker = null
  }
  if (userAccuracyCircle) {
    map.removeLayer(userAccuracyCircle)
    userAccuracyCircle = null
  }
}

function syncUserMarker() {
  if (!map) return
  if (props.userLat == null || props.userLng == null) {
    clearUserLayers()
    return
  }

  const latlng: L.LatLngExpression = [props.userLat, props.userLng]

  if (!userAccuracyCircle) {
    userAccuracyCircle = L.circle(latlng, {
      radius: Math.max(props.userAccuracy ?? 40, 20),
      color: 'var(--glow-gold-cta, #92679b)',
      weight: 1,
      opacity: 0.35,
      fillColor: 'var(--glow-gold-cta, #92679b)',
      fillOpacity: 0.12,
      interactive: false,
    }).addTo(map)
  } else {
    userAccuracyCircle.setLatLng(latlng)
    if (props.userAccuracy != null && props.userAccuracy > 0) {
      userAccuracyCircle.setRadius(Math.max(props.userAccuracy, 20))
    }
  }

  if (!userMarker) {
    userMarker = L.circleMarker(latlng, {
      radius: 8,
      color: '#fff',
      weight: 2,
      fillColor: 'var(--glow-gold-cta, #92679b)',
      fillOpacity: 1,
    }).addTo(map)
    userMarker.bindTooltip('Você está aqui', { direction: 'top', offset: [0, -8] })
  } else {
    userMarker.setLatLng(latlng)
  }

  if (props.followUser && props.userAccuracy != null && props.userAccuracy <= 80) {
    withSuppressedBounds(() => {
      map?.panTo(latlng, { animate: true, duration: 0.35 })
    }, 500)
  }
}

function fitToContent(force = false) {
  if (!map || !cluster) return

  // Com localização do usuário, prioriza o ponto dele — não “puxa” o mapa para o cluster de lojas.
  if (props.userLat != null && props.userLng != null) {
    if (force) {
      withSuppressedBounds(() => {
        map?.setView([props.userLat!, props.userLng!], 15)
      })
    }
    return
  }

  const layers = cluster.getLayers()
  if (layers.length === 0) return

  const bounds = cluster.getBounds()
  if (force || !map.getBounds().contains(bounds)) {
    withSuppressedBounds(() => {
      map?.fitBounds(bounds.pad(0.18), { maxZoom: 15, animate: true })
    })
  }
}

function focusEstabelecimento(guid: string) {
  const item = props.itens.find((i) => i.publicGuid === guid)
  if (!item || !estabelecimentoTemCoordenadas(item) || !map) return
  withSuppressedBounds(() => {
    map?.flyTo([item.latitude, item.longitude], Math.max(map.getZoom(), 15), {
      duration: 0.55,
    })
  }, 900)
  emit('update:selectedGuid', guid)
}

function onMoveEnd() {
  if (!map || suppressBoundsEmit) return
  if (userDragging) {
    emit('user-interact')
    userDragging = false
  }
  if (moveTimer) clearTimeout(moveTimer)
  moveTimer = setTimeout(() => {
    if (!map || suppressBoundsEmit) return
    const center = map.getCenter()
    if (
      lastEmittedCenter &&
      Math.abs(lastEmittedCenter.lat - center.lat) < 0.002 &&
      Math.abs(lastEmittedCenter.lng - center.lng) < 0.002
    ) {
      return
    }
    lastEmittedCenter = { lat: center.lat, lng: center.lng }
    emit('bounds-change', { latitude: center.lat, longitude: center.lng })
  }, 450)
}

function onDragStart() {
  userDragging = true
}

function onAppResumed() {
  requestAnimationFrame(() => {
    map?.invalidateSize({ animate: false })
  })
}

onMounted(() => {
  if (!mapEl.value) return

  const startLat = props.userLat ?? -10.9472
  const startLng = props.userLng ?? -37.0731

  map = L.map(mapEl.value, {
    zoomControl: false,
    attributionControl: true,
  }).setView([startLat, startLng], 13)

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map)

  cluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 52,
    spiderfyOnMaxZoom: true,
    disableClusteringAtZoom: 17,
    iconCreateFunction(c) {
      const count = c.getChildCount()
      const size = count > 20 ? 'lg' : count > 8 ? 'md' : 'sm'
      return L.divIcon({
        html: `<div class="explorar-cluster explorar-cluster--${size}"><span>${count}</span></div>`,
        className: 'explorar-cluster-wrap',
        iconSize: L.point(44, 44),
      })
    },
  })
  map.addLayer(cluster)

  map.on('dragstart', onDragStart)
  map.on('moveend', onMoveEnd)

  syncUserMarker()
  syncMarkers()
  fitToContent(true)

  requestAnimationFrame(() => {
    map?.invalidateSize()
  })

  window.addEventListener('guc:app-resumed', onAppResumed)
  window.visualViewport?.addEventListener('resize', onAppResumed)
})

onUnmounted(() => {
  window.removeEventListener('guc:app-resumed', onAppResumed)
  window.visualViewport?.removeEventListener('resize', onAppResumed)
  if (moveTimer) clearTimeout(moveTimer)
  if (suppressTimer) clearTimeout(suppressTimer)
  map?.off('dragstart', onDragStart)
  map?.off('moveend', onMoveEnd)
  clearUserLayers()
  map?.remove()
  map = null
  cluster = null
  markersByGuid.clear()
})

watch(
  () => props.itens,
  () => {
    syncMarkers()
  },
  { deep: true },
)

watch(
  () => [props.userLat, props.userLng, props.userAccuracy, props.followUser] as const,
  () => {
    syncUserMarker()
  },
)

watch(
  () => props.selectedGuid,
  (guid, prev) => {
    syncMarkers()
    if (guid && guid !== prev) {
      const item = props.itens.find((i) => i.publicGuid === guid)
      if (item && estabelecimentoTemCoordenadas(item) && map) {
        withSuppressedBounds(() => {
          map?.flyTo([item.latitude, item.longitude], Math.max(map.getZoom(), 15), {
            duration: 0.55,
          })
        }, 900)
      }
    }
  },
)

watch(
  () => props.focusGuid,
  (guid) => {
    if (guid) focusEstabelecimento(guid)
  },
)

defineExpose({
  focusEstabelecimento,
  fitToContent,
  recenterUser() {
    if (!map || props.userLat == null || props.userLng == null) return
    withSuppressedBounds(() => {
      map?.flyTo([props.userLat!, props.userLng!], 14, { duration: 0.5 })
    }, 800)
  },
  panToUser() {
    if (!map || props.userLat == null || props.userLng == null) return
    withSuppressedBounds(() => {
      map?.panTo([props.userLat!, props.userLng!], { animate: true, duration: 0.35 })
    }, 500)
  },
})
</script>

<template>
  <div class="explorar-mapa">
    <div ref="mapEl" class="explorar-mapa__canvas" role="application" aria-label="Mapa de estabelecimentos" />

    <div v-if="selectedItem" class="explorar-mapa__card-slot">
      <ExplorarMapaCard
        :item="selectedItem"
        @close="emit('update:selectedGuid', null)"
      />
    </div>

    <p
      v-if="itens.length > 0 && itens.every((i) => !estabelecimentoTemCoordenadas(i))"
      class="explorar-mapa__hint"
    >
      As lojas encontradas ainda não têm coordenadas no mapa.
    </p>
  </div>
</template>

<style>
.explorar-mapa {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.explorar-mapa__canvas {
  width: 100%;
  height: 100%;
  background: #ebe6f0;
}

.explorar-mapa__card-slot {
  position: absolute;
  z-index: 600;
  left: 0.75rem;
  right: 0.75rem;
  bottom: 0.75rem;
  max-width: 22rem;
  pointer-events: none;
}

.explorar-mapa__card-slot > * {
  pointer-events: auto;
}

.explorar-mapa__hint {
  position: absolute;
  inset: auto 1rem 1rem;
  z-index: 500;
  margin: 0;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--glow-surface) 94%, transparent);
  border: 1px solid var(--glow-border-soft);
  padding: 0.65rem 0.85rem;
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.75rem;
  color: var(--glow-text-subtle);
}

.explorar-marker-wrap {
  background: transparent !important;
  border: none !important;
}

.explorar-marker {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-width: 11rem;
  height: 2.25rem;
  margin: 0;
  padding: 0.2rem 0.65rem 0.2rem 0.2rem;
  border: 1px solid color-mix(in srgb, var(--glow-gold-cta, #92679b) 22%, #fff);
  border-radius: 9999px;
  background: color-mix(in srgb, var(--glow-surface, #fff) 94%, transparent);
  box-shadow:
    0 8px 18px -10px rgb(40 20 50 / 0.35),
    0 1px 2px rgb(40 20 50 / 0.08);
  color: var(--glow-text, #2a1f30);
  cursor: pointer;
  transform: translate(-1.05rem, calc(-100% - 0.35rem));
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease,
    background 0.15s ease;
}

.explorar-marker:hover,
.explorar-marker--selected {
  transform: translate(-1.05rem, calc(-100% - 0.5rem)) scale(1.03);
  border-color: var(--glow-gold-cta, #92679b);
  box-shadow:
    0 12px 24px -12px rgb(40 20 50 / 0.42),
    0 0 0 3px color-mix(in srgb, var(--glow-gold-cta, #92679b) 22%, transparent);
}

.explorar-marker--destaque {
  border-color: color-mix(in srgb, #c9a227 55%, var(--glow-gold-cta, #92679b));
  background: linear-gradient(
    135deg,
    color-mix(in srgb, #c9a227 14%, #fff),
    color-mix(in srgb, var(--glow-surface, #fff) 96%, transparent)
  );
}

.explorar-marker--selected {
  background: color-mix(in srgb, var(--glow-gold-cta, #92679b) 10%, #fff);
}

.explorar-marker__avatar {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  width: 1.85rem;
  height: 1.85rem;
  overflow: hidden;
  border-radius: 9999px;
  border: 1.5px solid #fff;
  background: var(--glow-gold-cta, #92679b);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--glow-gold-cta, #92679b) 28%, transparent);
}

.explorar-marker__logo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.explorar-marker__initial {
  font-family: 'Satoshi', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.explorar-marker__name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'Satoshi', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.1;
  padding-right: 0.15rem;
}

.explorar-cluster-wrap {
  background: transparent !important;
  border: none !important;
}

.explorar-cluster {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  border: 2px solid #fff;
  background: color-mix(in srgb, var(--glow-gold-cta, #92679b) 92%, #1a1020);
  color: #fff;
  font-family: 'Satoshi', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 8px 18px -8px rgb(40 20 50 / 0.4);
}

.explorar-cluster--sm {
  width: 40px;
  height: 40px;
  font-size: 0.8rem;
}

.explorar-cluster--lg {
  width: 52px;
  height: 52px;
  font-size: 0.95rem;
}

.leaflet-container {
  font-family: 'Urbanist', ui-sans-serif, system-ui, sans-serif;
  z-index: 0;
}

@media (min-width: 768px) {
  .explorar-mapa__card-slot {
    left: 1rem;
    right: auto;
    bottom: 1rem;
  }
}
</style>
