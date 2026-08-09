<script setup lang="ts">
import { computed } from 'vue'
import { ONBOARDING_CONTRATAR_CARD_CLASS } from '@/constants/designTokens'
import { aplicarDescontoPercentual, formatBRL } from '@/utils/formatters'
import type { Plano, PromocaoLancamento } from '@/types/plano.types'

const props = withDefaults(
  defineProps<{
    plano: Plano
    promocao?: PromocaoLancamento | null
    /** sidebar sticky | bloco inline na revisão/confirmação */
    variant?: 'sidebar' | 'inline'
  }>(),
  {
    promocao: null,
    variant: 'sidebar',
  },
)

const promoAtiva = computed(
  () =>
    props.promocao?.disponivel === true
    && (props.promocao.percentualDescontoMensalidade ?? 0) > 0,
)

const percentualDesconto = computed(() =>
  promoAtiva.value ? (props.promocao?.percentualDescontoMensalidade ?? 0) : 0,
)

const precoComDesconto = computed(() =>
  aplicarDescontoPercentual(props.plano.preco, percentualDesconto.value),
)

const valorDesconto = computed(() =>
  Math.round((props.plano.preco - precoComDesconto.value) * 100) / 100,
)

const diasTrial = computed(() => props.promocao?.diasTrial ?? 0)
</script>

<template>
  <aside
    :class="[
      ONBOARDING_CONTRATAR_CARD_CLASS,
      variant === 'sidebar' ? 'h-fit lg:sticky lg:top-6' : '',
    ]"
  >
    <p class="font-urbanist text-xs font-bold uppercase tracking-wide text-glow-text-subtle">
      Seu plano
    </p>

    <div class="mt-4 flex items-start gap-3">
      <div
        class="flex size-11 shrink-0 items-center justify-center rounded-lg bg-glow-gold/15 font-satoshi text-lg font-bold text-glow-gold"
        aria-hidden="true"
      >
        {{ plano.nome.charAt(0) }}
      </div>
      <div class="min-w-0">
        <p class="font-satoshi text-lg font-bold text-glow-text">{{ plano.nome }}</p>
        <p class="mt-1 font-urbanist text-sm leading-snug text-glow-text-muted">
          {{ plano.descricao }}
        </p>
      </div>
    </div>

    <div
      v-if="promoAtiva"
      class="mt-4 rounded-lg border border-glow-gold/25 bg-glow-gold/10 px-3 py-2.5"
    >
      <p class="font-urbanist text-xs font-bold text-glow-gold-cta">
        Promoção de lançamento
      </p>
      <p class="mt-0.5 font-urbanist text-xs text-glow-text-subtle">
        {{ percentualDesconto }}% off vitalício
        <template v-if="diasTrial > 0">
          · {{ diasTrial }} dias grátis
        </template>
        <template v-if="promocao?.vagasRestantes != null">
          · {{ promocao.vagasRestantes }} vagas
        </template>
      </p>
    </div>

    <div class="mt-5 space-y-2.5 border-t border-glow-border-soft pt-4">
      <div class="flex items-center justify-between gap-3 font-urbanist text-sm text-glow-text-soft">
        <span>Subtotal</span>
        <span>{{ formatBRL(plano.preco) }}/mês</span>
      </div>

      <div
        v-if="promoAtiva"
        class="flex items-center justify-between gap-3 font-urbanist text-sm text-emerald-700 dark:text-emerald-400"
      >
        <span>Desconto ({{ percentualDesconto }}%)</span>
        <span>− {{ formatBRL(valorDesconto) }}</span>
      </div>

      <div class="flex items-end justify-between gap-3 border-t border-glow-border-soft pt-3">
        <div>
          <p class="font-urbanist text-sm font-bold text-glow-text">Mensalidade</p>
          <p
            v-if="promoAtiva && diasTrial > 0"
            class="mt-0.5 font-urbanist text-xs text-glow-text-muted"
          >
            Após {{ diasTrial }} dias de teste
          </p>
        </div>
        <div class="text-right">
          <p
            v-if="promoAtiva"
            class="font-urbanist text-xs text-glow-text-muted line-through"
          >
            {{ formatBRL(plano.preco) }}
          </p>
          <p class="font-satoshi text-xl font-bold text-glow-text">
            {{ formatBRL(promoAtiva ? precoComDesconto : plano.preco) }}
            <span class="text-sm font-medium text-glow-text-muted">/mês</span>
          </p>
        </div>
      </div>

      <p
        v-if="promoAtiva && diasTrial > 0"
        class="pt-1 font-urbanist text-xs text-glow-text-subtle"
      >
        Total hoje com cartão: {{ formatBRL(0) }} (teste grátis).
      </p>
    </div>
  </aside>
</template>
