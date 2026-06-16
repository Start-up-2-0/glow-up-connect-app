<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CheckoutResumoPlano from '@/components/checkout/CheckoutResumoPlano.vue'
import CheckoutMetodoPagamentoTabs from '@/components/checkout/CheckoutMetodoPagamentoTabs.vue'
import MercadoPagoCardForm from '@/components/assinatura/MercadoPagoCardForm.vue'
import PagamentoPixForm from '@/components/assinatura/PagamentoPixForm.vue'
import { usarCheckoutPro } from '@/config/mercadopago'
import PagamentoPixQrPanel from '@/components/assinatura/PagamentoPixQrPanel.vue'
import { formatBRL } from '@/utils/formatters'
import { criarPagamentoPix, type MetodoPagamentoAssinatura } from '@/types/pagamento.types'
import type { OnboardingUiVariant } from '@/constants/onboardingWizardSteps'
import type { Plano, PromocaoLancamento } from '@/types/plano.types'
import type { PagamentoAssinaturaPayload } from '@/types/assinatura.types'

const props = withDefaults(
  defineProps<{
    plano: Plano
    promocao: PromocaoLancamento | null
    diasPermitidos: number[]
    submitting?: boolean
    aguardandoPagamento?: boolean
    errorMessage?: string | null
    pixQrCode?: string | null
    pixCheckoutUrl?: string | null
    variant?: OnboardingUiVariant
  }>(),
  {
    variant: 'public',
  },
)

const emit = defineEmits<{
  back: []
  submit: [diaVencimento: number, pagamento?: PagamentoAssinaturaPayload]
}>()

const cardFormRef = ref<InstanceType<typeof MercadoPagoCardForm> | null>(null)
const pixFormRef = ref<InstanceType<typeof PagamentoPixForm> | null>(null)
const diaVencimento = ref<number | null>(props.diasPermitidos[1] ?? props.diasPermitidos[0] ?? 10)
const metodoPagamento = ref<MetodoPagamentoAssinatura>('cartao')
const erroLocal = ref<string | null>(null)
const tokenizando = ref(false)

const permitePix = computed(() => true)
const exibindoPixGerado = computed(() => Boolean(props.pixQrCode?.trim()))

const trialAtivo = computed(
  () => props.promocao?.disponivel && (!usarCheckoutPro ? metodoPagamento.value === 'cartao' : true),
)

const diasTrialPromocao = computed(() => props.promocao?.diasTrial ?? 30)

const totalHoje = computed(() => (trialAtivo.value ? 0 : props.plano.preco))

const ctaLabel = computed(() => {
  if (props.aguardandoPagamento) return 'Aguardando confirmação...'
  if (tokenizando.value) return 'Validando cartão...'
  if (usarCheckoutPro && !trialAtivo.value) {
    return `Continuar para pagamento — ${formatBRL(totalHoje.value)}`
  }
  if (metodoPagamento.value === 'pix') return `Pagar ${formatBRL(totalHoje.value)} com PIX`
  if (trialAtivo.value) return 'Iniciar período de teste'
  return `Pagar ${formatBRL(totalHoje.value)}`
})

const erroVisivel = computed(() => props.errorMessage ?? erroLocal.value)
const isPublic = computed(() => props.variant === 'public')
const processando = computed(
  () => props.submitting || props.aguardandoPagamento || tokenizando.value,
)

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

  if (usarCheckoutPro) {
    emit('submit', diaVencimento.value)
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
  <div class="checkout-page w-full">
    <header v-if="isPublic" class="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="agendar-section-title">Finalize sua assinatura</h1>
        <p class="agendar-section-subtitle mt-2">
          Escolha o vencimento e conclua o pagamento para ativar seu plano.
        </p>
      </div>
      <button
        type="button"
        class="text-sm font-medium text-glow-text-subtle transition hover:text-glow-text"
        @click="emit('back')"
      >
        ← Voltar
      </button>
    </header>

    <div
      v-if="!isPublic"
      class="grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:items-start"
    >
      <section class="onboarding-contratar-checkout-shell">
        <div class="onboarding-contratar-checkout-panel">
          <CheckoutResumoPlano
            variant="contratar"
            :plano="plano"
            :promocao="promocao"
            :dias-permitidos="diasPermitidos"
            :dia-vencimento="diaVencimento"
            :metodo-pagamento="metodoPagamento"
            @update:dia-vencimento="diaVencimento = $event"
          />
        </div>
      </section>

      <section class="onboarding-contratar-checkout-shell">
        <div class="onboarding-contratar-checkout-panel">
          <PagamentoPixQrPanel
            v-if="exibindoPixGerado"
            :qr-code="pixQrCode!"
            :checkout-url="pixCheckoutUrl"
            :aguardando="aguardandoPagamento"
          />

          <template v-else>
            <div
              v-if="usarCheckoutPro && trialAtivo"
              class="onboarding-contratar-info-box"
            >
              Você ganha {{ diasTrialPromocao }} dias grátis para testar todos os módulos.
              Não há cobrança hoje — a primeira fatura será gerada ao fim do período de teste, com link de pagamento por e-mail e WhatsApp.
            </div>
            <div
              v-else-if="usarCheckoutPro"
              class="onboarding-contratar-info-box"
            >
              Você será redirecionado ao Mercado Pago para escolher o meio de pagamento (cartão, PIX, boleto e outros).
              O estabelecimento só será criado após a confirmação do pagamento.
            </div>

            <template v-else>
              <CheckoutMetodoPagamentoTabs
                v-model="metodoPagamento"
                :permite-pix="permitePix"
              />

              <p
                v-if="promocao?.disponivel && metodoPagamento === 'pix'"
                class="mt-4 rounded-lg bg-glow-surface px-3 py-2 text-xs text-glow-text-subtle"
              >
                Com PIX a cobrança é imediata e o período de teste não se aplica. Use cartão para os dias grátis.
              </p>

              <div class="mt-6">
                <h3 class="checkout-section-title">
                  {{ metodoPagamento === 'pix' ? 'Dados para PIX' : 'Informações de pagamento' }}
                </h3>

                <PagamentoPixForm
                  v-if="metodoPagamento === 'pix'"
                  ref="pixFormRef"
                  variant="checkout"
                  :error-message="erroVisivel"
                />
                <MercadoPagoCardForm
                  v-else
                  ref="cardFormRef"
                  variant="checkout"
                  @error="onCardError"
                />
              </div>
            </template>

            <p v-if="erroVisivel" class="checkout-alert-error mt-4" role="alert">
              {{ erroVisivel }}
            </p>

            <hr class="my-6 border-glow-border-soft" />

            <div class="mb-5 flex items-end justify-between">
              <span class="font-urbanist text-sm text-glow-text-soft">Total hoje</span>
              <span class="font-satoshi text-2xl font-bold text-glow-text">
                {{ formatBRL(totalHoje) }}
              </span>
            </div>

            <button
              type="button"
              class="onboarding-contratar-pay-cta"
              :disabled="processando"
              @click="handleSubmit"
            >
              <span
                v-if="processando"
                class="size-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                aria-hidden="true"
              />
              <template v-else>{{ ctaLabel }}</template>
              <span
                v-if="!processando"
                class="flex size-7 items-center justify-center rounded-full bg-white/20"
                aria-hidden="true"
              >
                <svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M7 17L17 7M17 7H9M17 7V15" />
                </svg>
              </span>
            </button>

            <p class="mt-3 text-center font-urbanist text-xs text-glow-text-subtle">
              Pagamento processado com segurança via Mercado Pago
            </p>
          </template>
        </div>
      </section>
    </div>

    <div
      v-else
      class="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start"
    >
      <section class="checkout-shell">
        <CheckoutResumoPlano
          :plano="plano"
          :promocao="promocao"
          :dias-permitidos="diasPermitidos"
          :dia-vencimento="diaVencimento"
          :metodo-pagamento="metodoPagamento"
          @update:dia-vencimento="diaVencimento = $event"
        />
      </section>

      <section class="checkout-shell">
        <div class="checkout-panel">
          <PagamentoPixQrPanel
            v-if="exibindoPixGerado"
            :qr-code="pixQrCode!"
            :checkout-url="pixCheckoutUrl"
            :aguardando="aguardandoPagamento"
          />

          <template v-else>
            <div
              v-if="usarCheckoutPro && trialAtivo"
              class="rounded-xl border border-glow-border-soft bg-glow-surface/60 p-4 text-sm text-glow-text-subtle"
            >
              Você ganha {{ diasTrialPromocao }} dias grátis para testar todos os módulos.
              Não há cobrança hoje — a primeira fatura será gerada ao fim do período de teste, com link de pagamento por e-mail e WhatsApp.
            </div>
            <div
              v-else-if="usarCheckoutPro"
              class="rounded-xl border border-glow-border-soft bg-glow-surface/60 p-4 text-sm text-glow-text-subtle"
            >
              Você será redirecionado ao Mercado Pago para escolher o meio de pagamento (cartão, PIX, boleto e outros).
              O estabelecimento só será criado após a confirmação do pagamento.
            </div>

            <template v-else>
              <CheckoutMetodoPagamentoTabs
                v-model="metodoPagamento"
                :permite-pix="permitePix"
              />

              <p
                v-if="promocao?.disponivel && metodoPagamento === 'pix'"
                class="mt-4 rounded-lg bg-glow-surface px-3 py-2 text-xs text-glow-text-subtle"
              >
                Com PIX a cobrança é imediata e o período de teste não se aplica. Use cartão para os dias grátis.
              </p>

              <div class="mt-6">
                <h3 class="checkout-section-title">
                  {{ metodoPagamento === 'pix' ? 'Dados para PIX' : 'Informações de pagamento' }}
                </h3>

                <PagamentoPixForm
                  v-if="metodoPagamento === 'pix'"
                  ref="pixFormRef"
                  variant="checkout"
                  :error-message="erroVisivel"
                />
                <MercadoPagoCardForm
                  v-else
                  ref="cardFormRef"
                  variant="checkout"
                  @error="onCardError"
                />
              </div>
            </template>

            <p v-if="erroVisivel" class="checkout-alert-error mt-4" role="alert">
              {{ erroVisivel }}
            </p>

            <div class="mt-8 border-t border-glow-border-soft pt-5">
              <div class="mb-4 flex items-center justify-between text-sm">
                <span class="text-glow-text-subtle">Total hoje</span>
                <span class="font-satoshi text-lg font-bold text-glow-text">
                  {{ formatBRL(totalHoje) }}
                </span>
              </div>

              <button
                type="button"
                class="checkout-pay-button"
                :disabled="processando"
                @click="handleSubmit"
              >
                <svg
                  v-if="processando"
                  class="size-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                <svg
                  v-else
                  viewBox="0 0 24 24"
                  class="size-4"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  aria-hidden="true"
                >
                  <rect x="5" y="11" width="14" height="10" rx="2" />
                  <path d="M8 11V8a4 4 0 118 0v3" />
                </svg>
                {{ ctaLabel }}
              </button>

              <p class="mt-3 text-center text-xs text-glow-text-subtle">
                Pagamento processado com segurança via Mercado Pago
              </p>
            </div>
          </template>
        </div>
      </section>
    </div>
  </div>
</template>
