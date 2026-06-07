<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { loadMercadoPago } from '@mercadopago/sdk-js'
import BaseInput from '@/components/ui/BaseInput.vue'
import type { PagamentoAssinaturaPayload } from '@/types/assinatura.types'

const emit = defineEmits<{
  tokenized: [payload: PagamentoAssinaturaPayload]
  error: [message: string]
}>()

const cardNumber = ref('')
const cardholderName = ref('')
const expirationMonth = ref('')
const expirationYear = ref('')
const securityCode = ref('')
const identificationNumber = ref('')
const loading = ref(false)
const mpReady = ref(false)

const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY?.trim() ?? ''

onMounted(async () => {
  if (!publicKey) return
  try {
    await loadMercadoPago()
    mpReady.value = true
  } catch {
    emit('error', 'Não foi possível carregar o Mercado Pago.')
  }
})

async function tokenizar(): Promise<PagamentoAssinaturaPayload | null> {
  if (!publicKey) {
    emit('error', 'Chave pública do Mercado Pago não configurada.')
    return null
  }

  loading.value = true
  try {
    const MercadoPagoCtor = (
      window as Window & {
        MercadoPago?: new (key: string) => {
          createCardToken: (data: Record<string, string>) => Promise<{
            id: string
            payment_method_id?: string
          }>
        }
      }
    ).MercadoPago

    if (!MercadoPagoCtor) {
      await loadMercadoPago()
    }

    const Ctor = (
      window as unknown as {
        MercadoPago: new (key: string) => {
          createCardToken: (data: Record<string, string>) => Promise<{
            id: string
            payment_method_id?: string
          }>
        }
      }
    ).MercadoPago

    const mp = new Ctor(publicKey)
    const result = await mp.createCardToken({
      cardNumber: cardNumber.value.replace(/\s/g, ''),
      cardholderName: cardholderName.value,
      cardExpirationMonth: expirationMonth.value.padStart(2, '0'),
      cardExpirationYear: expirationYear.value.length === 2 ? `20${expirationYear.value}` : expirationYear.value,
      securityCode: securityCode.value,
      identificationType: 'CPF',
      identificationNumber: identificationNumber.value.replace(/\D/g, ''),
    })

    const payload: PagamentoAssinaturaPayload = {
      paymentMethodId: result.payment_method_id ?? 'visa',
      token: result.id,
      installments: 1,
      identificationType: 'CPF',
      identificationNumber: identificationNumber.value.replace(/\D/g, ''),
    }

    emit('tokenized', payload)
    return payload
  } catch {
    emit('error', 'Não foi possível validar o cartão.')
    return null
  } finally {
    loading.value = false
  }
}

defineExpose({ tokenizar, loading, mpReady })
</script>

<template>
  <div class="space-y-4">
    <p v-if="!publicKey" class="text-sm text-amber-700 dark:text-amber-400">
      Configure VITE_MP_PUBLIC_KEY para tokenizar cartões em ambiente de desenvolvimento.
    </p>
    <BaseInput v-model="cardNumber" label="Número do cartão" placeholder="0000 0000 0000 0000" autocomplete="cc-number" />
    <BaseInput v-model="cardholderName" label="Nome no cartão" autocomplete="cc-name" />
    <div class="grid grid-cols-2 gap-4">
      <BaseInput v-model="expirationMonth" label="Mês" placeholder="MM" autocomplete="cc-exp-month" />
      <BaseInput v-model="expirationYear" label="Ano" placeholder="AA" autocomplete="cc-exp-year" />
    </div>
    <BaseInput v-model="securityCode" label="CVV" placeholder="123" type="password" autocomplete="cc-csc" />
    <BaseInput v-model="identificationNumber" label="CPF do titular" placeholder="000.000.000-00" />
  </div>
</template>
