import { ref } from 'vue'
import type { Assinatura } from '@/types/assinatura.types'
import { classificarRespostaPagamento } from '@/utils/assinaturaPagamento'

interface ProcessarRespostaCallbacks {
  onTrial: (diasTrial: number) => Promise<void>
  onDashboard: () => Promise<void>
  onConfirmarEmail?: () => void
  aguardarAtivacao: () => Promise<void>
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
      window.location.href = result.pagamentoInicial.checkoutUrl
      return
    }

    if (tipo === 'pix') {
      pixQrCode.value = result.pagamentoInicial?.qrCode ?? null
      pixCheckoutUrl.value = result.pagamentoInicial?.checkoutUrl ?? null
      aguardandoPagamento.value = true
      await callbacks.aguardarAtivacao()
      return
    }

    limparPix()
    aguardandoPagamento.value = true
    await callbacks.aguardarAtivacao()
  }

  return {
    pixQrCode,
    pixCheckoutUrl,
    aguardandoPagamento,
    limparPix,
    processarResposta,
  }
}
