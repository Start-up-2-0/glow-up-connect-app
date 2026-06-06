import { onUnmounted, ref } from 'vue'
import { userService } from '@/services/userService'
import { useUserStore } from '@/stores/user.store'
import type { WhatsAppConfirmacaoInstrucoes } from '@/types/whatsapp.types'

const POLL_INTERVAL_MS = 5_000
const POLL_TIMEOUT_MS = 5 * 60_000

export function useWhatsAppConfirmacao() {
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
        pollError.value = 'Tempo esgotado. Verifique seu e-mail e tente novamente.'
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
      instrucoes.value = await userService.solicitarConfirmacaoWhatsApp()
      startPolling()
    } finally {
      solicitando.value = false
    }
  }

  async function toggleOptIn(optIn: boolean) {
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
  }
}
