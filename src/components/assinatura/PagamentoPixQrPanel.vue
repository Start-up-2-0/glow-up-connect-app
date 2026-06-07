<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { qrCodeParaExibicao } from '@/utils/assinaturaPagamento'

const props = defineProps<{
  qrCode: string
  checkoutUrl?: string | null
  aguardando?: boolean
}>()

const copiado = ref(false)

const exibicao = computed(() => qrCodeParaExibicao(props.qrCode))

async function copiarCodigo() {
  if (exibicao.value.tipo !== 'copia-cola') return
  try {
    await navigator.clipboard.writeText(exibicao.value.valor)
    copiado.value = true
    window.setTimeout(() => {
      copiado.value = false
    }, 2500)
  } catch {
    // fallback silencioso
  }
}
</script>

<template>
  <div class="rounded-lg border border-glow-border-soft bg-glow-surface p-4">
    <h3 class="font-satoshi text-lg font-semibold text-glow-text">Pague com PIX</h3>
    <p class="mt-1 text-sm text-glow-text-subtle">
      Escaneie o QR Code ou copie o código. Aguardando confirmação do pagamento...
    </p>

    <div class="mt-4 flex flex-col items-center gap-4">
      <img
        v-if="exibicao.tipo === 'imagem'"
        :src="exibicao.valor"
        alt="QR Code PIX"
        class="max-h-56 rounded-lg border border-glow-border-soft bg-white p-2"
      />
      <div v-else class="w-full">
        <p class="mb-2 text-xs font-medium uppercase tracking-wide text-glow-text-subtle">Pix copia e cola</p>
        <textarea
          readonly
          class="h-28 w-full resize-none rounded-lg border border-glow-border-soft bg-white p-3 font-mono text-xs text-glow-text"
          :value="exibicao.valor"
        />
        <BaseButton type="button" variant="secondary" class="mt-2" block @click="copiarCodigo">
          {{ copiado ? 'Código copiado!' : 'Copiar código PIX' }}
        </BaseButton>
      </div>

      <a
        v-if="checkoutUrl"
        :href="checkoutUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm font-medium text-glow-gold hover:underline"
      >
        Abrir pagamento no Mercado Pago
      </a>

      <p v-if="aguardando" class="text-sm text-glow-text-subtle">Verificando pagamento automaticamente...</p>
    </div>
  </div>
</template>
