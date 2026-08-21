import { ref } from 'vue'
import type { Assinatura } from '@/types/assinatura.types'
import { classificarRespostaPagamento } from '@/utils/assinaturaPagamento'
import { openThirdPartyUrl } from '@/utils/thirdPartyRedirect'

interface ProcessarRespostaCallbacks {
  onTrial: (diasTrial: number) => Promise<void>
  onDashboard: () => Promise<void>
  onConfirmarEmail?: () => void
  aguardarAtivacao: (expiraEm?: string | null) => Promise<void>
}

export function useAssinaturaPagamentoResposta() {
  const pixQrCode = ref<string | null>(null)
  const pixCheckoutUrl = ref<string | null>(null)
  const aguardandoPagamento = ref(false)

  function limparPix() {
    pixQrCode.value = null
    pixCheckoutUrl.value = null
  }

  async function processarResposta(result: Assinatura, callbacks: ProcessarRespostaCallbacks) {
    const tipo = classificarRespostaPagamento(result)
    const expiraEm = result.pagamentoInicial?.expiraEm

    if (tipo === 'trial') {
      limparPix()
      await callbacks.onTrial(result.diasTrial)
      return
    }

    if (tipo === 'dashboard') {
      limparPix()
      await callbacks.onDashboard()
      return
    }

    if (tipo === 'checkout' && result.pagamentoInicial?.checkoutUrl) {
      limparPix()
      const modo = openThirdPartyUrl(result.pagamentoInicial.checkoutUrl)
      if (modo === 'denied') {
        return
      }
      if (modo === 'same-tab') {
        return
      }
      aguardandoPagamento.value = true
      await callbacks.aguardarAtivacao(expiraEm)
      return
    }

    if (tipo === 'pix') {
      pixQrCode.value = result.pagamentoInicial?.qrCode ?? null
      pixCheckoutUrl.value = result.pagamentoInicial?.checkoutUrl ?? null
      aguardandoPagamento.value = true
      await callbacks.aguardarAtivacao(expiraEm)
      return
    }

    limparPix()
    aguardandoPagamento.value = true
    await callbacks.aguardarAtivacao(expiraEm)
  }

  return {
    pixQrCode,
    pixCheckoutUrl,
    aguardandoPagamento,
    limparPix,
    processarResposta,
  }
}
