import { onUnmounted, ref } from 'vue'
import { userService } from '@/services/userService'
import { useUserStore } from '@/stores/user.store'
import type { WhatsAppConfirmacaoInstrucoes } from '@/types/whatsapp.types'

const POLL_INTERVAL_MS = 5_000
const POLL_TIMEOUT_MS = 5 * 60_000

export interface UseWhatsAppConfirmacaoOptions {
  solicitarConfirmacao?: () => Promise<WhatsAppConfirmacaoInstrucoes>
  pollConfirmado?: () => Promise<boolean>
  atualizarOptIn?: (optIn: boolean) => Promise<void>
}

export function useWhatsAppConfirmacao(options: UseWhatsAppConfirmacaoOptions = {}) {
  const userStore = useUserStore()
  const instrucoes = ref<WhatsAppConfirmacaoInstrucoes | null>(null)
  const solicitando = ref(false)
  const polling = ref(false)
  const pollError = ref<string | null>(null)

  let pollTimer: ReturnType<typeof setInterval> | null = null
  let pollStartedAt = 0

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
    polling.value = false
  }

  async function pollOnce(): Promise<boolean> {
    if (options.pollConfirmado) {
      return options.pollConfirmado()
    }

    await userStore.fetchMe(true)
    return Boolean(userStore.profile?.whatsAppConfirmado)
  }

  function startPolling() {
    stopPolling()
    polling.value = true
    pollError.value = null
    pollStartedAt = Date.now()

    pollTimer = setInterval(async () => {
      if (Date.now() - pollStartedAt > POLL_TIMEOUT_MS) {
        stopPolling()
        pollError.value = 'Tempo esgotado. Verifique o WhatsApp e tente novamente.'
        return
      }

      try {
        const confirmed = await pollOnce()
        if (confirmed) {
          stopPolling()
          instrucoes.value = null
        }
      } catch {
        stopPolling()
        pollError.value = 'Não foi possível verificar a confirmação.'
      }
    }, POLL_INTERVAL_MS)
  }

  async function solicitarConfirmacao() {
    solicitando.value = true
    pollError.value = null
    try {
      instrucoes.value = options.solicitarConfirmacao
        ? await options.solicitarConfirmacao()
        : await userService.solicitarConfirmacaoWhatsApp()
      startPolling()
    } finally {
      solicitando.value = false
    }
  }

  async function toggleOptIn(optIn: boolean) {
    if (options.atualizarOptIn) {
      await options.atualizarOptIn(optIn)
      return
    }

    await userService.atualizarWhatsAppOptIn({ optIn })
    await userStore.fetchMe(true)
  }

  onUnmounted(stopPolling)

  return {
    instrucoes,
    solicitando,
    polling,
    pollError,
    solicitarConfirmacao,
    toggleOptIn,
    stopPolling,
    pollOnce,
  }
}
