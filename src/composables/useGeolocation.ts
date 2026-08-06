import { onScopeDispose, ref } from 'vue'
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

/** Meta de precisão (metros). Leituras piores só substituem se forem claramente melhores. */
const TARGET_ACCURACY_M = 40
const ACCEPTABLE_ACCURACY_M = 120
/** Acima disso consideramos “aproximada” (rede/IP). */
export const COARSE_ACCURACY_M = 500

const HIGH_ACCURACY_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  /** Sem cache: força leitura nova do sensor/rede. */
  maximumAge: 0,
  timeout: 30_000,
}

export function useGeolocation() {
  const coords = ref<GeolocationCoords | null>(null)
  const loading = ref(false)
  const watching = ref(false)
  const errorCode = ref<GeolocationErrorCode | null>(null)
  const errorMessage = ref<string | null>(null)

  let watchId: number | null = null
  let requestWatchId: number | null = null

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

  /**
   * Aceita a nova leitura se for a primeira, tiver precisão melhor,
   * ou indicar deslocamento real (acima do ruído do GPS).
   */
  function shouldAccept(next: GeolocationCoords, force = false): boolean {
    if (force) return true
    const prev = coords.value
    if (!prev) return true

    const nextAcc = accuracyOf(next)
    const prevAcc = accuracyOf(prev)

    // Melhora relevante de precisão (ex.: IP/Wi‑Fi → GPS).
    if (nextAcc + 8 < prevAcc) return true

    // Mesmo nível de precisão: só atualiza se o deslocamento passar do ruído.
    const noiseFloor = Math.max(Math.min(nextAcc, prevAcc), 12)
    const moved = distanciaMetros(prev, next)
    if (moved > noiseFloor && nextAcc <= prevAcc * 1.35) return true

    // Leitura fresca e já aceitável, sem piorar muito.
    if (
      nextAcc <= ACCEPTABLE_ACCURACY_M &&
      nextAcc <= prevAcc + 20 &&
      (next.timestamp ?? 0) >= (prev.timestamp ?? 0)
    ) {
      return true
    }

    return false
  }

  function applyPosition(position: GeolocationPosition, force = false): GeolocationCoords | null {
    const next = fromPosition(position)
    if (!shouldAccept(next, force)) return null
    coords.value = next
    return next
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
   * Obtém localização priorizando precisão:
   * usa `watchPosition` até atingir boa acurácia ou esgotar o tempo,
   * devolvendo a melhor leitura recebida.
   */
  function request(options?: {
    force?: boolean
    /** Tempo máximo aguardando GPS mais preciso (ms). */
    waitMs?: number
    /** Precisão alvo em metros. */
    targetAccuracyM?: number
  }): Promise<GeolocationCoords | null> {
    const force = options?.force === true
    const waitMs = options?.waitMs ?? 18_000
    const targetAccuracyM = options?.targetAccuracyM ?? TARGET_ACCURACY_M

    if (
      !force &&
      coords.value &&
      accuracyOf(coords.value) <= ACCEPTABLE_ACCURACY_M
    ) {
      return Promise.resolve(coords.value)
    }

    if (!navigator.geolocation) {
      errorCode.value = 'unsupported'
      errorMessage.value = ERROR_MESSAGES.unsupported
      return Promise.resolve(null)
    }

    loading.value = true
    errorCode.value = null
    errorMessage.value = null
    clearRequestWatch()

    return new Promise((resolve) => {
      let best: GeolocationCoords | null = coords.value
      let settled = false

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
        finish(best)
      }, waitMs)

      requestWatchId = navigator.geolocation.watchPosition(
        (position) => {
          const candidate = fromPosition(position)
          const candidateAcc = accuracyOf(candidate)
          const bestAcc = accuracyOf(best)

          if (!best || candidateAcc < bestAcc) {
            best = candidate
            coords.value = candidate
          } else if (shouldAccept(candidate, force)) {
            best = candidate
            coords.value = candidate
          }

          if (candidateAcc <= targetAccuracyM) {
            finish(candidate)
          }
        },
        (err) => {
          // Se já temos alguma leitura, devolve a melhor; senão, falha.
          if (best) {
            finish(best)
            return
          }
          fail(err)
          finish(null)
        },
        HIGH_ACCURACY_OPTIONS,
      )
    })
  }

  /** Inicia acompanhamento contínuo via `watchPosition`. */
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
        // Timeout intermitente no watch não deve apagar uma posição boa.
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
    errorCode,
    errorMessage,
    request,
    startWatch,
    stopWatch,
  }
}
