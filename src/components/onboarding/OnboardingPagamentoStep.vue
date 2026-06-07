<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import DiaVencimentoSelect from '@/components/assinatura/DiaVencimentoSelect.vue'
import MercadoPagoCardForm from '@/components/assinatura/MercadoPagoCardForm.vue'
import MetodoPagamentoSelect from '@/components/assinatura/MetodoPagamentoSelect.vue'
import PagamentoPixForm from '@/components/assinatura/PagamentoPixForm.vue'
import PagamentoPixQrPanel from '@/components/assinatura/PagamentoPixQrPanel.vue'
import PromocaoLancamentoBanner from '@/components/assinatura/PromocaoLancamentoBanner.vue'
import { formatBRL } from '@/utils/formatters'
import { criarPagamentoPix, type MetodoPagamentoAssinatura } from '@/types/pagamento.types'
import type { Plano, PromocaoLancamento } from '@/types/plano.types'
import type { PagamentoAssinaturaPayload } from '@/types/assinatura.types'

const props = defineProps<{
  plano: Plano
  promocao: PromocaoLancamento | null
  diasPermitidos: number[]
  submitting?: boolean
  aguardandoPagamento?: boolean
  errorMessage?: string | null
  pixQrCode?: string | null
  pixCheckoutUrl?: string | null
}>()

const emit = defineEmits<{
  back: []
  submit: [diaVencimento: number, pagamento: PagamentoAssinaturaPayload]
}>()

const cardFormRef = ref<InstanceType<typeof MercadoPagoCardForm> | null>(null)
const pixFormRef = ref<InstanceType<typeof PagamentoPixForm> | null>(null)
const diaVencimento = ref<number | null>(props.diasPermitidos[1] ?? props.diasPermitidos[0] ?? 10)
const metodoPagamento = ref<MetodoPagamentoAssinatura>('cartao')
const erroLocal = ref<string | null>(null)
const tokenizando = ref(false)

const permitePix = computed(() => true)
const exibindoPixGerado = computed(() => Boolean(props.pixQrCode?.trim()))

const ctaLabel = computed(() => {
  if (props.aguardandoPagamento) return 'Aguardando confirmação...'
  if (tokenizando.value) return 'Validando cartão...'
  if (metodoPagamento.value === 'pix') return 'Gerar PIX'
  if (props.promocao?.disponivel) return 'Contratar com período de teste'
  return 'Contratar plano'
})

const erroVisivel = computed(() => props.errorMessage ?? erroLocal.value)

watch(metodoPagamento, () => {
  erroLocal.value = null
})

function onCardError(message: string) {
  erroLocal.value = message
}

function validarCpfPix(cpf: string): string | null {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length < 11) {
    return 'Informe o CPF para gerar o PIX.'
  }
  return null
}

async function handleSubmit() {
  erroLocal.value = null

  if (diaVencimento.value === null) {
    erroLocal.value = 'Selecione o dia de vencimento da cobrança.'
    return
  }

  if (metodoPagamento.value === 'pix') {
    const cpf = pixFormRef.value?.obterCpf() ?? ''
    const erroCpf = validarCpfPix(cpf)
    if (erroCpf) {
      erroLocal.value = erroCpf
      return
    }
    emit('submit', diaVencimento.value, criarPagamentoPix(cpf))
    return
  }

  tokenizando.value = true
  try {
    const pagamento = await cardFormRef.value?.tokenizar()
    if (!pagamento) {
      if (!erroLocal.value) {
        erroLocal.value = 'Não foi possível validar o cartão. Preencha todos os campos.'
      }
      return
    }
    emit('submit', diaVencimento.value, pagamento)
  } finally {
    tokenizando.value = false
  }
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

    <PagamentoPixQrPanel
      v-if="exibindoPixGerado"
      :qr-code="pixQrCode!"
      :checkout-url="pixCheckoutUrl"
      :aguardando="aguardandoPagamento"
      class="mb-6"
    />

    <div v-else class="space-y-4">
      <BaseCard title="Cobrança">
        <div class="space-y-4">
          <DiaVencimentoSelect v-model="diaVencimento" :dias-permitidos="diasPermitidos" />
          <MetodoPagamentoSelect v-model="metodoPagamento" :permite-pix="permitePix" />
          <p
            v-if="promocao?.disponivel && metodoPagamento === 'pix'"
            class="text-xs text-glow-text-subtle"
          >
            Com PIX a cobrança é imediata e o período de teste não se aplica. Use cartão para ativar os dias grátis.
          </p>
        </div>
      </BaseCard>

      <BaseCard :title="metodoPagamento === 'pix' ? 'Dados do PIX' : 'Cartão de crédito'">
        <PagamentoPixForm
          v-if="metodoPagamento === 'pix'"
          ref="pixFormRef"
          :error-message="erroVisivel"
        />
        <MercadoPagoCardForm v-else ref="cardFormRef" @error="onCardError" />
      </BaseCard>

      <p v-if="erroVisivel && metodoPagamento === 'cartao'" class="text-sm text-red-600" role="alert">
        {{ erroVisivel }}
      </p>

      <div class="flex flex-col gap-3 sm:flex-row">
        <BaseButton type="button" variant="secondary" class="sm:flex-1" @click="emit('back')">
          Voltar
        </BaseButton>
        <BaseButton
          type="button"
          variant="primary"
          class="sm:flex-1"
          :loading="submitting || aguardandoPagamento || tokenizando"
          :disabled="submitting || aguardandoPagamento || tokenizando"
          @click="handleSubmit"
        >
          {{ ctaLabel }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>
