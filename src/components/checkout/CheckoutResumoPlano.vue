<script setup lang="ts">
import { computed } from 'vue'
import { aplicarDescontoPercentual, formatBRL } from '@/utils/formatters'
import type { MetodoPagamentoAssinatura } from '@/types/pagamento.types'
import type { Plano, PromocaoLancamento } from '@/types/plano.types'

const props = withDefaults(
  defineProps<{
    plano: Plano
    promocao: PromocaoLancamento | null
    metodoPagamento: MetodoPagamentoAssinatura
    variant?: 'default' | 'contratar'
  }>(),
  {
    variant: 'default',
  },
)

const isContratar = computed(() => props.variant === 'contratar')
const modulosExibidos = computed(() => props.plano.modulos.slice(0, 5))

const trialAtivo = computed(
  () => props.promocao?.disponivel && props.metodoPagamento === 'cartao',
)

const percentualDesconto = computed(() =>
  trialAtivo.value ? (props.promocao?.percentualDescontoMensalidade ?? 0) : 0,
)

const precoComDesconto = computed(() =>
  aplicarDescontoPercentual(props.plano.preco, percentualDesconto.value),
)

const totalHoje = computed(() => (trialAtivo.value ? 0 : props.plano.preco))
</script>

<template>
  <div :class="isContratar ? '' : 'checkout-panel h-full'">
    <h2
      class="font-satoshi font-bold text-glow-text"
      :class="isContratar ? 'mb-5 text-base' : 'mb-5 text-xl'"
    >
      Resumo do pedido
    </h2>

    <article :class="isContratar ? 'onboarding-contratar-plan-card' : 'checkout-item-card'">
      <div
        class="flex shrink-0 items-center justify-center rounded font-satoshi font-bold text-glow-gold"
        :class="isContratar ? 'size-[55px] rounded bg-glow-gold/15 text-xl' : 'size-16 rounded-xl bg-glow-gold-soft text-2xl'"
        aria-hidden="true"
      >
        {{ plano.nome.charAt(0) }}
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="font-satoshi text-base font-bold text-glow-text">{{ plano.nome }}</h3>
            <p class="mt-1 font-urbanist text-sm text-glow-text-subtle">{{ plano.descricao }}</p>
          </div>
          <p class="shrink-0 font-satoshi text-base font-bold text-glow-text">
            <template v-if="trialAtivo && percentualDesconto > 0">
              <span class="mr-2 text-sm font-normal text-glow-text-muted line-through">
                {{ formatBRL(plano.preco) }}
              </span>
              {{ formatBRL(precoComDesconto) }}
            </template>
            <template v-else>
              {{ formatBRL(plano.preco) }}
            </template>
            <span class="font-urbanist text-sm font-normal text-glow-text-muted">/mês</span>
          </p>
        </div>

        <ul class="mt-3 space-y-1.5">
          <li
            v-for="modulo in modulosExibidos"
            :key="modulo"
            class="flex items-center gap-2.5 font-urbanist text-sm text-glow-text-soft"
          >
            <span
              class="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-glow-gold text-[9px] text-white"
              aria-hidden="true"
            >
              ✓
            </span>
            {{ modulo }}
          </li>
        </ul>
      </div>
    </article>

    <div
      v-if="promocao?.disponivel"
      :class="isContratar ? 'onboarding-contratar-promo-card mt-4' : 'checkout-promo-row mt-4'"
    >
      <span
        class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-glow-gold/15 text-sm font-bold text-glow-gold"
        aria-hidden="true"
      >
        %
      </span>
      <div class="min-w-0 flex-1">
        <p class="font-urbanist text-sm font-bold text-glow-text">Promoção de lançamento</p>
        <p class="mt-0.5 font-urbanist text-xs text-glow-text-subtle">
          {{ promocao.diasTrial }} dias grátis com cartão
          <span class="mx-1.5 inline-block size-1 rounded-full bg-glow-border-soft align-middle" />
          {{ promocao.percentualDescontoMensalidade }}% off para sempre
          <span class="mx-1.5 inline-block size-1 rounded-full bg-glow-border-soft align-middle" />
          {{ promocao.vagasRestantes }} vagas
        </p>
      </div>
    </div>

    <div :class="isContratar ? 'mt-6 space-y-3' : 'mt-6 space-y-3 border-t border-glow-border-soft pt-5'">
      <p class="font-urbanist text-sm text-glow-text-subtle">
        A renovação será calculada automaticamente a partir da data de contratação. A fatura é gerada
        {{ promocao?.diasAntecedenciaGeracaoCobranca ?? 7 }} dias antes do vencimento.
      </p>

      <div class="flex items-center justify-between font-urbanist text-sm text-glow-text-soft">
        <span>Subtotal</span>
        <span>{{ formatBRL(plano.preco) }}/mês</span>
      </div>
      <div
        v-if="trialAtivo && percentualDesconto > 0"
        class="flex items-center justify-between font-urbanist text-sm text-emerald-700 dark:text-emerald-400"
      >
        <span>Desconto vitalício ({{ percentualDesconto }}%)</span>
        <span>− {{ formatBRL(plano.preco - precoComDesconto) }}</span>
      </div>
      <div
        v-if="trialAtivo"
        class="flex items-center justify-between font-urbanist text-sm text-glow-text-soft"
      >
        <span>Mensalidade após o teste</span>
        <span>{{ formatBRL(precoComDesconto) }}/mês</span>
      </div>
      <div
        v-else-if="metodoPagamento === 'pix'"
        class="flex items-center justify-between font-urbanist text-sm text-glow-text-soft"
      >
        <span>Cobrança</span>
        <span>Imediata via PIX</span>
      </div>

      <hr v-if="isContratar" class="border-glow-border-soft" />

      <div class="flex items-end justify-between pt-1">
        <div>
          <span class="font-urbanist text-sm text-glow-text-soft">Total hoje</span>
          <p v-if="trialAtivo" class="mt-1 font-urbanist text-xs text-glow-text-muted">
            Primeira cobrança de {{ formatBRL(precoComDesconto) }}/mês após {{ promocao?.diasTrial }} dias de teste.
          </p>
        </div>
        <span
          class="font-satoshi font-bold text-glow-text"
          :class="isContratar ? 'text-2xl' : 'text-xl'"
        >
          {{ formatBRL(totalHoje) }}
        </span>
      </div>
    </div>
  </div>
</template>
