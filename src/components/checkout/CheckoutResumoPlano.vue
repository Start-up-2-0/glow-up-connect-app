<script setup lang="ts">
import { computed } from 'vue'
import DiaVencimentoSelect from '@/components/assinatura/DiaVencimentoSelect.vue'
import { formatBRL } from '@/utils/formatters'
import type { MetodoPagamentoAssinatura } from '@/types/pagamento.types'
import type { Plano, PromocaoLancamento } from '@/types/plano.types'

const props = defineProps<{
  plano: Plano
  promocao: PromocaoLancamento | null
  diasPermitidos: number[]
  diaVencimento: number | null
  metodoPagamento: MetodoPagamentoAssinatura
}>()

const emit = defineEmits<{ 'update:diaVencimento': [value: number] }>()

const modulosExibidos = computed(() => props.plano.modulos.slice(0, 5))

const trialAtivo = computed(
  () => props.promocao?.disponivel && props.metodoPagamento === 'cartao',
)

const totalHoje = computed(() => (trialAtivo.value ? 0 : props.plano.preco))
</script>

<template>
  <div class="checkout-panel h-full">
    <div class="mb-5 flex items-center justify-between gap-3">
      <h2 class="font-satoshi text-xl font-bold text-glow-text">Resumo do pedido</h2>
      <span class="checkout-badge">1 plano</span>
    </div>

    <article class="checkout-item-card">
      <div
        class="flex size-16 shrink-0 items-center justify-center rounded-xl bg-glow-gold-soft font-satoshi text-2xl font-bold text-glow-gold"
        aria-hidden="true"
      >
        {{ plano.nome.charAt(0) }}
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-satoshi text-base font-semibold text-glow-text">{{ plano.nome }}</h3>
            <p class="mt-1 text-sm text-glow-text-subtle">{{ plano.descricao }}</p>
          </div>
          <p class="shrink-0 font-satoshi text-base font-bold text-glow-text">
            {{ formatBRL(plano.preco) }}
            <span class="block text-right text-xs font-normal text-glow-text-subtle">/mês</span>
          </p>
        </div>

        <ul class="mt-3 space-y-1">
          <li
            v-for="modulo in modulosExibidos"
            :key="modulo"
            class="flex items-center gap-2 text-sm text-glow-text-subtle"
          >
            <span
              class="flex size-3.5 shrink-0 items-center justify-center rounded-full bg-glow-gold text-[10px] text-white"
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
      class="checkout-promo-row mt-4"
    >
      <span class="checkout-promo-icon" aria-hidden="true">%</span>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-medium text-glow-text">Promoção de lançamento</p>
        <p class="text-xs text-glow-text-subtle">
          {{ promocao.diasTrial }} dias grátis com cartão · {{ promocao.vagasRestantes }} vagas
        </p>
      </div>
    </div>

    <div class="mt-6 border-t border-glow-border-soft pt-5">
      <DiaVencimentoSelect
        :model-value="diaVencimento"
        label="Dia de vencimento mensal"
        @update:model-value="emit('update:diaVencimento', $event)"
      />
    </div>

    <div class="mt-6 space-y-3 border-t border-glow-border-soft pt-5">
      <div class="flex items-center justify-between text-sm text-glow-text-subtle">
        <span>Subtotal</span>
        <span>{{ formatBRL(plano.preco) }}/mês</span>
      </div>
      <div
        v-if="trialAtivo"
        class="checkout-alert-success flex items-center justify-between text-sm"
      >
        <span>Período de teste</span>
        <span>− {{ formatBRL(plano.preco) }}</span>
      </div>
      <div
        v-else-if="metodoPagamento === 'pix'"
        class="flex items-center justify-between text-sm text-glow-text-subtle"
      >
        <span>Cobrança</span>
        <span>Imediata via PIX</span>
      </div>
      <div class="flex items-center justify-between border-t border-glow-border-soft pt-3">
        <span class="font-satoshi text-base font-semibold text-glow-text">Total hoje</span>
        <span class="font-satoshi text-xl font-bold text-glow-text">{{ formatBRL(totalHoje) }}</span>
      </div>
      <p v-if="trialAtivo" class="text-xs text-glow-text-subtle">
        Primeira cobrança após {{ promocao?.diasTrial }} dias de teste.
      </p>
    </div>
  </div>
</template>
