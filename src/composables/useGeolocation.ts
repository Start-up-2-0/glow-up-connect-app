import { computed, onScopeDispose, ref } from 'vue'
import { distanciaMetros } from '@/utils/explorarMapa'

export type GeolocationErrorCode = 'unsupported' | 'denied' | 'unavailable' | 'timeout' | 'unknown'

export interface GeolocationCoords {
  latitude: number
  longitude: number
  accuracy?: number | null
  heading?: number | null
  timestamp?: number
}

const ERROR_MESSAGES: Record<GeolocationErrorCode, string> = {
  unsupported: 'Seu navegador não suporta geolocalização.',
  denied:
    'Permita o acesso à localização para encontrar lojas próximas. Se já negou antes, abra o ícone de cadeado na barra de endereço e altere Localização para Permitir.',
  unavailable: 'Não foi possível obter sua localização. Tente novamente.',
  timeout: 'A busca pela localização demorou demais. Tente novamente.',
  unknown: 'Erro ao obter localização.',
}

/** Meta ideal (metros). */
const TARGET_ACCURACY_M = 35
/** Consideramos confiável o suficiente para centralizar o mapa. */
export const RELIABLE_ACCURACY_M = 80
/** Acima disso é tipicamente rede/IP — não deve travar o mapa num bairro errado. */
export const COARSE_ACCURACY_M = 250
/** Descarta leituras absurdamente imprecisas enquanto houver alternativas. */
const UNUSABLE_ACCURACY_M = 2_000

const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 0,
  timeout: 25_000,
}

const MAX_SAMPLES = 24

export function useGeolocation() {
  const coords = ref<GeolocationCoords | null>(null)
  const loading = ref(false)
  const watching = ref(false)
  const errorCode = ref<GeolocationErrorCode | null>(null)
  const errorMessage = ref<string | null>(null)

  let watchId: number | null = null
  let requestWatchId: number | null = null
  const samples: GeolocationCoords[] = []

  const isReliable = computed(() => {
    const acc = coords.value?.accuracy
    return acc != null && Number.isFinite(acc) && acc <= RELIABLE_ACCURACY_M
  })

  const isCoarse = computed(() => {
    const acc = coords.value?.accuracy
    return acc == null || !Number.isFinite(acc) || acc > COARSE_ACCURACY_M
  })

  function mapError(error: GeolocationPositionError): GeolocationErrorCode {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'denied'
      case error.POSITION_UNAVAILABLE:
        return 'unavailable'
      case error.TIMEOUT:
        return 'timeout'
      default:
        return 'unknown'
    }
  }

  function fromPosition(position: GeolocationPosition): GeolocationCoords {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
      heading: position.coords.heading,
      timestamp: position.timestamp,
    }
  }

  function accuracyOf(value: GeolocationCoords | null | undefined): number {
    return value?.accuracy != null && Number.isFinite(value.accuracy)
      ? value.accuracy
      : Number.POSITIVE_INFINITY
  }

  function pushSample(sample: GeolocationCoords) {
    samples.push(sample)
    if (samples.length > MAX_SAMPLES) samples.shift()
  }

  /**
   * Escolhe a leitura mais provável: prioriza precisão + consenso
   * (várias leituras próximas), para evitar um “pulo” de Wi‑Fi para o bairro errado.
   */
  function pickConsensus(pool: GeolocationCoords[]): GeolocationCoords | null {
    if (pool.length === 0) return null

    const usable = pool.filter((s) => accuracyOf(s) <= UNUSABLE_ACCURACY_M)
    const candidates = (usable.length > 0 ? usable : pool).slice()

    let best = candidates[0]!
    let bestScore = Number.NEGATIVE_INFINITY

    for (const candidate of candidates) {
      const acc = accuracyOf(candidate)
      const radius = Math.max(60, Math.min(acc, 180))
      const neighbors = candidates.filter((s) => distanciaMetros(candidate, s) <= radius).length
      // Consenso pesa mais que uma única leitura “ótima” mas isolada/errada.
      const score = neighbors * 2_000 - acc
      if (score > bestScore) {
        bestScore = score
        best = candidate
      }
    }

    return best
  }

  function shouldAccept(next: GeolocationCoords, force = false): boolean {
    if (force) return true
    const prev = coords.value
    if (!prev) return accuracyOf(next) <= UNUSABLE_ACCURACY_M

    const nextAcc = accuracyOf(next)
    const prevAcc = accuracyOf(prev)

    // Nunca trocar uma posição boa por uma grosseira.
    if (nextAcc > COARSE_ACCURACY_M && prevAcc <= RELIABLE_ACCURACY_M) return false
    if (nextAcc > prevAcc * 1.8 && nextAcc > RELIABLE_ACCURACY_M) return false

    if (nextAcc + 5 < prevAcc) return true

    const noiseFloor = Math.max(Math.min(nextAcc, prevAcc), 15)
    const moved = distanciaMetros(prev, next)

    // Deslocamento dentro do ruído do GPS: ignora.
    if (moved <= noiseFloor) {
      // Ainda assim aceita se a precisão melhorou um pouco.
      return nextAcc + 3 < prevAcc
    }

    // Pulo grande só com precisão melhor ou equivalente boa.
    if (moved > Math.max(noiseFloor * 2, 80)) {
      return nextAcc <= prevAcc && nextAcc <= COARSE_ACCURACY_M
    }

    return nextAcc <= prevAcc * 1.25
  }

  function applyPosition(position: GeolocationPosition, force = false): GeolocationCoords | null {
    const next = fromPosition(position)
    pushSample(next)

    // Em modo contínuo, prefere consenso recente em vez do último ponto cru.
    const recent = samples.slice(-8)
    const consensus = pickConsensus(recent) ?? next
    const candidate = force ? next : consensus

    if (!shouldAccept(candidate, force)) return null
    coords.value = candidate
    return candidate
  }

  function fail(err: GeolocationPositionError) {
    const code = mapError(err)
    errorCode.value = code
    errorMessage.value = ERROR_MESSAGES[code]
    loading.value = false
  }

  function clearRequestWatch() {
    if (requestWatchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(requestWatchId)
    }
    requestWatchId = null
  }

  /**
   * Obtém localização com amostragem + consenso.
   * Não usa cache e evita travar na primeira leitura de rede/IP.
   */
  function request(options?: {
    force?: boolean
    waitMs?: number
    targetAccuracyM?: number
    /** Mínimo de amostras antes de aceitar precisão “ok”. */
    minSamples?: number
  }): Promise<GeolocationCoords | null> {
    const force = options?.force === true
    const waitMs = options?.waitMs ?? 22_000
    const targetAccuracyM = options?.targetAccuracyM ?? TARGET_ACCURACY_M
    const minSamples = options?.minSamples ?? 3

    if (!force && coords.value && accuracyOf(coords.value) <= RELIABLE_ACCURACY_M) {
      return Promise.resolve(coords.value)
    }

    if (!navigator.geolocation) {
      errorCode.value = 'unsupported'
      errorMessage.value = ERROR_MESSAGES.unsupported
      return Promise.resolve(null)
    }

    // Evita dois watchPosition ao mesmo tempo (causa leituras instáveis).
    if (watchId != null) {
      navigator.geolocation.clearWatch(watchId)
      watchId = null
      watching.value = false
    }

    loading.value = true
    errorCode.value = null
    errorMessage.value = null
    clearRequestWatch()
    if (force) {
      samples.length = 0
      coords.value = null
    }

    return new Promise((resolve) => {
      let settled = false
      const collected: GeolocationCoords[] = []

      const finish = (value: GeolocationCoords | null) => {
        if (settled) return
        settled = true
        clearRequestWatch()
        window.clearTimeout(timer)
        if (value) {
          coords.value = value
          errorCode.value = null
          errorMessage.value = null
        }
        loading.value = false
        resolve(value)
      }

      const timer = window.setTimeout(() => {
        finish(pickConsensus(collected.length ? collected : samples))
      }, waitMs)

      requestWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const candidate = fromPosition(position)
          if (accuracyOf(candidate) > UNUSABLE_ACCURACY_M && collected.length > 0) {
            return
          }

          collected.push(candidate)
          pushSample(candidate)

          const consensus = pickConsensus(collected)
          if (consensus) {
            coords.value = consensus
          }

          const bestAcc = accuracyOf(consensus)
          const enoughSamples = collected.length >= minSamples
          const preciseEnough = bestAcc <= targetAccuracyM && enoughSamples
          const goodEnough =
            bestAcc <= RELIABLE_ACCURACY_M &&
            collected.length >= Math.max(minSamples, 4)

          if (preciseEnough || goodEnough) {
            finish(consensus)
          }
        },
        (err) => {
          const fallback = pickConsensus(collected.length ? collected : samples)
          if (fallback) {
            finish(fallback)
            return
          }
          fail(err)
          finish(null)
        },
        HIGH_ACCURACY_OPTIONS,
      )
    })
  }

  function startWatch(): void {
    if (!navigator.geolocation) {
      errorCode.value = 'unsupported'
      errorMessage.value = ERROR_MESSAGES.unsupported
      return
    }

    if (watchId != null) {
      watching.value = true
      return
    }

    // Não compete com uma request em andamento.
    if (requestWatchId != null) return

    loading.value = coords.value == null
    errorCode.value = null
    errorMessage.value = null
    watching.value = true

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        applyPosition(position)
        loading.value = false
        errorCode.value = null
        errorMessage.value = null
      },
      (err) => {
        if (err.code === err.TIMEOUT && coords.value) {
          loading.value = false
          return
        }
        fail(err)
        if (err.code === err.PERMISSION_DENIED) {
          stopWatch()
        }
      },
      HIGH_ACCURACY_OPTIONS,
    )
  }

  function stopWatch(): void {
    if (watchId != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId)
    }
    watchId = null
    watching.value = false
    clearRequestWatch()
  }

  onScopeDispose(() => {
    stopWatch()
  })

  return {
    coords,
    loading,
    watching,
    isReliable,
    isCoarse,
    errorCode,
    errorMessage,
    request,
    startWatch,
    stopWatch,
  }
}
