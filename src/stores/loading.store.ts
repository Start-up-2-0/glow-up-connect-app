import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export type LoadingMode = 'fullscreen' | 'modal' | 'inline'

/** Atraso antes de exibir o overlay (evita "flash" em operações rápidas). */
const SHOW_DELAY_MS = 160
/** Timeout de segurança: força encerrar o loading se algo ficar pendente. */
const SAFETY_TIMEOUT_MS = 30_000

export const useLoadingStore = defineStore('loading', () => {
  /** Requisições/operações em andamento (axios + uso manual). */
  const pending = ref(0)
  /** Navegação de rota em andamento (router). */
  const navInFlight = ref(false)
  /** Overlay exibido por chamada manual (loading.show/hide). */
  const manual = ref(false)

  /** Overlay realmente visível (após o debounce de entrada). */
  const visible = ref(false)

  const message = ref('Carregando...')
  const progress = ref<number | null>(null)
  const mode = ref<LoadingMode>('fullscreen')

  const hasSource = computed(() => pending.value > 0 || navInFlight.value || manual.value)

  let showTimer: number | null = null
  let safetyTimer: number | null = null

  function clearTimer() {
    if (showTimer !== null) {
      window.clearTimeout(showTimer)
      showTimer = null
    }
  }

  function clearSafety() {
    if (safetyTimer !== null) {
      window.clearTimeout(safetyTimer)
      safetyTimer = null
    }
  }

  /** Agenda a exibição após o debounce; cancela se não houver mais fonte. */
  function syncVisibility() {
    if (hasSource.value) {
      if (visible.value) return
      clearTimer()
      showTimer = window.setTimeout(() => {
        visible.value = true
        showTimer = null
      }, SHOW_DELAY_MS)
      // Timeout de segurança: nunca deixar travado.
      clearSafety()
      safetyTimer = window.setTimeout(() => {
        pending.value = 0
        navInFlight.value = false
        manual.value = false
        visible.value = false
        clearTimer()
      }, SAFETY_TIMEOUT_MS)
    } else if (visible.value || showTimer !== null) {
      clearTimer()
      clearSafety()
      visible.value = false
    }
  }

  /** Exibe o loading (por ação manual). */
  function show(payload?: { message?: string; progress?: number | null; mode?: LoadingMode }) {
    if (payload?.message) message.value = payload.message
    if (payload?.progress !== undefined) progress.value = payload.progress
    if (payload?.mode) mode.value = payload.mode
    manual.value = true
    syncVisibility()
  }

  function hide() {
    manual.value = false
    pending.value = 0
    navInFlight.value = false
    syncVisibility()
  }

  /// Alias expostos no uso manual.
  /** Abre o loading (alias de show). */
  function open(payload?: { message?: string; progress?: number | null; mode?: LoadingMode }) {
    show(payload)
  }

  /** Fecha o loading e limpa a fila. */
  function close() {
    hide()
  }

  /// Gestão por requisição/operação (contador de concorrência).
  /** Marca início de operação (incrementa contador). */
  function start(messageOverride?: string) {
    if (messageOverride) message.value = messageOverride
    pending.value += 1
    syncVisibility()
  }

  /** Marca fim de operação (decrementa). */
  function finish() {
    if (pending.value > 0) pending.value -= 1
    syncVisibility()
  }

  /// Router.
  function navigationStart(messageOverride?: string) {
    if (messageOverride) message.value = messageOverride
    navInFlight.value = true
    syncVisibility()
  }

  function navigationEnd() {
    navInFlight.value = false
    syncVisibility()
  }

  function setMessage(msg: string) {
    message.value = msg
  }

  function setProgress(value: number | null) {
    progress.value = value
  }

  function setMode(next: LoadingMode) {
    mode.value = next
  }

  return {
    visible,
    message,
    progress,
    mode,
    pending,
    navInFlight,
    show,
    hide,
    open,
    close,
    start,
    finish,
    navigationStart,
    navigationEnd,
    setMessage,
    setProgress,
    setMode,
  }
})