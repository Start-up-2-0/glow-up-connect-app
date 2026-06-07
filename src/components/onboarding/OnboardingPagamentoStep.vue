<script setup lang="ts">
import { computed, ref } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import DiaVencimentoSelect from '@/components/assinatura/DiaVencimentoSelect.vue'
import MercadoPagoCardForm from '@/components/assinatura/MercadoPagoCardForm.vue'
import PromocaoLancamentoBanner from '@/components/assinatura/PromocaoLancamentoBanner.vue'
import { formatBRL } from '@/utils/formatters'
import type { Plano, PromocaoLancamento } from '@/types/plano.types'

const props = defineProps<{
  plano: Plano
  promocao: PromocaoLancamento | null
  diasPermitidos: number[]
  submitting?: boolean
  aguardandoPagamento?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  back: []
  submit: [
    diaVencimento: number,
    pagamento: {
      token: string
      paymentMethodId: string
      issuerId?: string
      installments?: number
      identificationType?: string
      identificationNumber?: string
    },
  ]
}>()

const cardFormRef = ref<InstanceType<typeof MercadoPagoCardForm> | null>(null)
const diaVencimento = ref<number | null>(props.diasPermitidos[1] ?? 10)

const ctaLabel = computed(() => {
  if (props.aguardandoPagamento) return 'Processando pagamento...'
  if (props.promocao?.disponivel) return 'Contratar com período de teste'
  return 'Contratar plano'
})

async function handleSubmit() {
  if (diaVencimento.value === null) return
  const pagamento = await cardFormRef.value?.tokenizar()
  if (!pagamento) return
  emit('submit', diaVencimento.value, pagamento)
}
</script>

<template>
  <div>
    <header class="mb-6">
      <h2 class="font-satoshi text-2xl font-bold text-zinc-800">Finalize a assinatura</h2>
      <p class="mt-1 font-satoshi text-base text-zinc-800/50">
        Plano <strong>{{ plano.nome }}</strong> — {{ formatBRL(plano.preco) }}/mês
      </p>
    </header>

    <PromocaoLancamentoBanner v-if="promocao?.disponivel" :promocao="promocao" class="mb-6" />

    <div class="space-y-4">
      <BaseCard title="Cobrança">
        <DiaVencimentoSelect v-model="diaVencimento" :dias-permitidos="diasPermitidos" />
      </BaseCard>

      <BaseCard title="Cartão de crédito">
        <MercadoPagoCardForm ref="cardFormRef" />
      </BaseCard>

      <p v-if="errorMessage" class="text-sm text-red-600" role="alert">{{ errorMessage }}</p>

      <div class="flex flex-col gap-3 sm:flex-row">
        <BaseButton type="button" variant="secondary" class="sm:flex-1" @click="emit('back')">
          Voltar
        </BaseButton>
        <BaseButton
          type="button"
          variant="primary"
          class="sm:flex-1"
          :loading="submitting || aguardandoPagamento"
          @click="handleSubmit"
        >
          {{ ctaLabel }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
