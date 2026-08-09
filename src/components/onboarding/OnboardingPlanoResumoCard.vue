<script setup lang="ts">
import { computed } from 'vue'
import { aplicarDescontoPercentual, formatBRL } from '@/utils/formatters'
import { ONBOARDING_CONTRATAR_CARD_CLASS } from '@/constants/designTokens'
import type { Plano, PromocaoLancamento } from '@/types/plano.types'

const props = withDefaults(
  defineProps<{
    plano: Plano
    promocao?: PromocaoLancamento | null
    /** sidebar sticky | bloco inline | painel escuro estilo Flowbite */
    variant?: 'sidebar' | 'inline' | 'panel'
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

const beneficios = computed(() => {
  const fromFunc = props.plano.funcionalidades?.filter(Boolean) ?? []
  if (fromFunc.length) return fromFunc.slice(0, 6)
  return (props.plano.modulos ?? []).slice(0, 6)
})

const isPanel = computed(() => props.variant === 'panel')
</script>

<template>
  <!-- Painel Flowbite (sidebar escura) -->
  <aside
    v-if="isPanel"
    class="flex h-full flex-col justify-between bg-[#1a102e] p-6 text-white lg:p-8"
  >
    <div>
      <p class="font-urbanist text-xs font-bold uppercase tracking-[0.12em] text-white/55">
        Plano selecionado
      </p>
      <h2 class="mt-3 font-satoshi text-2xl font-bold tracking-tight text-white">
        {{ plano.nome }}
      </h2>
      <p
        v-if="diasTrial > 0 && promocao?.disponivel"
        class="mt-2 font-urbanist text-sm text-glow-gold"
      >
        {{ diasTrial }} dias de teste grátis
      </p>
      <p v-else class="mt-2 font-urbanist text-sm text-white/65">
        {{ plano.descricao }}
      </p>

      <div
        class="mt-6 rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm"
      >
        <div class="flex items-end justify-between gap-3">
          <div>
            <p
              v-if="promoAtiva"
              class="font-urbanist text-sm text-white/45 line-through"
            >
              {{ formatBRL(plano.preco) }}/mês
            </p>
            <p class="font-satoshi text-3xl font-bold text-white">
              {{ formatBRL(promoAtiva ? precoComDesconto : plano.preco) }}
              <span class="text-base font-medium text-white/55">/mês</span>
            </p>
          </div>
          <span
            v-if="promoAtiva"
            class="rounded-full bg-glow-gold-cta px-3 py-1 font-urbanist text-xs font-bold text-white"
          >
            {{ percentualDesconto }}% OFF
          </span>
        </div>

        <p
          v-if="promoAtiva"
          class="mt-3 font-urbanist text-xs leading-relaxed text-white/60"
        >
          Promoção de lançamento · desconto vitalício
          <template v-if="promocao?.vagasRestantes != null">
            · {{ promocao.vagasRestantes }} vagas restantes
          </template>
        </p>

        <div
          v-if="promoAtiva"
          class="mt-4 space-y-2 border-t border-white/10 pt-4 font-urbanist text-sm"
        >
          <div class="flex justify-between text-white/55">
            <span>Subtotal</span>
            <span>{{ formatBRL(plano.preco) }}</span>
          </div>
          <div class="flex justify-between text-emerald-300">
            <span>Desconto ({{ percentualDesconto }}%)</span>
            <span>− {{ formatBRL(valorDesconto) }}</span>
          </div>
          <div class="flex justify-between font-bold text-white">
            <span>Mensalidade</span>
            <span>{{ formatBRL(precoComDesconto) }}</span>
          </div>
        </div>
      </div>

      <ul v-if="beneficios.length" class="mt-8 space-y-3.5">
        <li
          v-for="item in beneficios"
          :key="item"
          class="flex items-start gap-3 font-urbanist text-sm text-white/80"
        >
          <span
            class="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-glow-gold-cta text-[10px] font-bold text-white"
            aria-hidden="true"
          >
            ✓
          </span>
          <span>{{ item }}</span>
        </li>
      </ul>
    </div>

    <p class="mt-10 font-urbanist text-xs text-white/40">
      Glow Up Connect · Assinatura
    </p>
  </aside>

  <!-- Card claro (sidebar sticky / inline) -->
  <aside
    v-else
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
        <template v-if="diasTrial > 0"> · {{ diasTrial }} dias grátis </template>
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
    </div>
  </aside>
</template>
