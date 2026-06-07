<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { loadMercadoPago } from '@mercadopago/sdk-js'
import BaseInput from '@/components/ui/BaseInput.vue'
import type { PagamentoAssinaturaPayload } from '@/types/assinatura.types'
import { extrairErroMercadoPago, obterMercadoPagoCtor } from '@/utils/mercadoPagoErrors'

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
const sdkErro = ref<string | null>(null)

const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY?.trim() ?? ''
const mpConfigurado = computed(() => Boolean(publicKey))

async function garantirSdkCarregado(): Promise<boolean> {
  if (!publicKey) {
    emit('error', 'Chave pública do Mercado Pago não configurada no deploy (VITE_MP_PUBLIC_KEY).')
    return false
  }

  if (obterMercadoPagoCtor()) {
    mpReady.value = true
    sdkErro.value = null
    return true
  }

  try {
    await loadMercadoPago()
    if (!obterMercadoPagoCtor()) {
      throw new Error('SDK do Mercado Pago indisponível após o carregamento.')
    }
    mpReady.value = true
    sdkErro.value = null
    return true
  } catch (err) {
    const mensagem = extrairErroMercadoPago(err)
    sdkErro.value =
      mensagem === 'Não foi possível validar o cartão. Verifique os dados e tente novamente.'
        ? 'Não foi possível carregar o Mercado Pago. Verifique sua conexão ou desative bloqueadores.'
        : mensagem
    emit('error', sdkErro.value)
    return false
  }
}

onMounted(() => {
  void garantirSdkCarregado()
})

function validarCampos(): string | null {
  if (!cardNumber.value.replace(/\s/g, '').trim()) {
    return 'Informe o número do cartão.'
  }
  if (!cardholderName.value.trim()) {
    return 'Informe o nome impresso no cartão.'
  }
  if (!expirationMonth.value.trim() || !expirationYear.value.trim()) {
    return 'Informe a validade do cartão.'
  }
  if (!securityCode.value.trim()) {
    return 'Informe o CVV do cartão.'
  }
  const cpf = identificationNumber.value.replace(/\D/g, '')
  if (cpf.length < 11) {
    return 'Informe o CPF do titular.'
  }
  return null
}

async function tokenizar(): Promise<PagamentoAssinaturaPayload | null> {
  const validacao = validarCampos()
  if (validacao) {
    emit('error', validacao)
    return null
  }

  const sdkOk = await garantirSdkCarregado()
  if (!sdkOk) {
    return null
  }

  const Ctor = obterMercadoPagoCtor()
  if (!Ctor) {
    emit('error', 'SDK do Mercado Pago não está disponível.')
    return null
  }

  loading.value = true
  try {
    const mp = new Ctor(publicKey, { locale: 'pt-BR' })
    const result = await mp.createCardToken({
      cardNumber: cardNumber.value.replace(/\s/g, ''),
      cardholderName: cardholderName.value.trim(),
      cardExpirationMonth: expirationMonth.value.padStart(2, '0'),
      cardExpirationYear:
        expirationYear.value.length === 2 ? `20${expirationYear.value}` : expirationYear.value,
      securityCode: securityCode.value.trim(),
      identificationType: 'CPF',
      identificationNumber: identificationNumber.value.replace(/\D/g, ''),
    })

    if (!result?.id) {
      emit('error', 'O Mercado Pago não retornou um token válido para o cartão.')
      return null
    }

    const payload: PagamentoAssinaturaPayload = {
      paymentMethodId: result.payment_method_id ?? 'visa',
      token: result.id,
      installments: 1,
      identificationType: 'CPF',
      identificationNumber: identificationNumber.value.replace(/\D/g, ''),
    }

    emit('tokenized', payload)
    return payload
  } catch (err) {
    const mensagem = extrairErroMercadoPago(err)
    emit('error', mensagem)
    return null
  } finally {
    loading.value = false
  }
}

defineExpose({ tokenizar, loading, mpReady, mpConfigurado })
</script>

<template>
  <div class="space-y-4">
    <p v-if="!mpConfigurado" class="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="alert">
      Pagamento indisponível: a variável <strong>VITE_MP_PUBLIC_KEY</strong> não foi incluída no build
      de homologação. Configure no Railway e faça um novo deploy.
    </p>
    <p
      v-else-if="sdkErro"
      class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      role="alert"
    >
      {{ sdkErro }}
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
