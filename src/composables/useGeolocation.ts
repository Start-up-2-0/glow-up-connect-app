import { ref } from 'vue'

export type GeolocationErrorCode = 'unsupported' | 'denied' | 'unavailable' | 'timeout' | 'unknown'

export interface GeolocationCoords {
  latitude: number
  longitude: number
}

const ERROR_MESSAGES: Record<GeolocationErrorCode, string> = {
  unsupported: 'Seu navegador não suporta geolocalização.',
  denied:
    'Permita o acesso à localização para encontrar lojas próximas. Se já negou antes, abra o ícone de cadeado na barra de endereço e altere Localização para Permitir.',
  unavailable: 'Não foi possível obter sua localização. Tente novamente.',
  timeout: 'A busca pela localização demorou demais. Tente novamente.',
  unknown: 'Erro ao obter localização.',
}

export function useGeolocation() {
  const coords = ref<GeolocationCoords | null>(null)
  const loading = ref(false)
  const errorCode = ref<GeolocationErrorCode | null>(null)
  const errorMessage = ref<string | null>(null)

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

  function request(options?: { force?: boolean }): Promise<GeolocationCoords | null> {
    if (coords.value && !options?.force) {
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

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const result = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          coords.value = result
          loading.value = false
          resolve(result)
        },
        (err) => {
          const code = mapError(err)
          errorCode.value = code
          errorMessage.value = ERROR_MESSAGES[code]
          loading.value = false
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
      )
    })
  }

  return { coords, loading, errorCode, errorMessage, request }
}
