<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowRight, Check } from 'lucide-vue-next'
import { ROUTE_PATHS } from '@/constants/routes'
import { aplicarDescontoPercentual, formatBRL } from '@/utils/formatters'
import {
  badgePlano,
  herancaLabel,
  limitesComoItens,
  recursosIncrementais,
} from '@/utils/planoDisplay'
import type { Plano } from '@/types/plano.types'

const props = withDefaults(
  defineProps<{
    plano: Plano
    planosOrdenados: Plano[]
    destacado?: boolean
    desabilitado?: boolean
    modoLogado?: boolean
    percentualDesconto?: number | null
  }>(),
  {
    destacado: false,
    desabilitado: false,
    modoLogado: false,
    percentualDesconto: null,
  },
)

const checkoutLink = computed(() => ({
  path: props.modoLogado ? ROUTE_PATHS.ONBOARDING_CONTRATAR : ROUTE_PATHS.ONBOARDING_ASSINATURA,
  query: { planoId: String(props.plano.id) },
}))

const anterior = computed(() => {
  const idx = props.planosOrdenados.findIndex((p) => p.id === props.plano.id)
  return idx > 0 ? props.planosOrdenados[idx - 1]! : null
})

const badge = computed(() => badgePlano(props.plano, props.planosOrdenados))
const heranca = computed(() => herancaLabel(props.plano, anterior.value))
const limites = computed(() => limitesComoItens(props.plano))
const extras = computed(() => recursosIncrementais(props.plano, anterior.value))

const temDesconto = computed(() => (props.percentualDesconto ?? 0) > 0 && props.plano.preco > 0)

const precoExibido = computed(() =>
  temDesconto.value
    ? aplicarDescontoPercentual(props.plano.preco, props.percentualDesconto!)
    : props.plano.preco,
)

const isGratis = computed(() => props.plano.preco === 0)
</script>

<template>
  <article
    class="relative flex h-full flex-col rounded-2xl border bg-glow-surface p-5 shadow-glow-sm transition duration-200 sm:p-6"
    :class="
      destacado
        ? 'border-glow-gold ring-2 ring-glow-gold lg:-translate-y-1 lg:shadow-md'
        : 'border-glow-border-soft hover:border-glow-gold/40'
    "
  >
    <div
      v-if="badge"
      class="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 font-urbanist text-[11px] font-bold"
      :class="
        destacado
          ? 'bg-glow-gold-cta text-white'
          : 'border border-glow-border-soft bg-glow-hover-surface text-glow-text-subtle'
      "
    >
      {{ badge }}
    </div>

    <header class="mt-1">
      <h3 class="font-satoshi text-lg font-bold text-glow-text">{{ plano.nome }}</h3>
      <p class="mt-1.5 min-h-[2.5rem] font-urbanist text-sm leading-relaxed text-glow-text-subtle">
        {{ plano.descricao }}
      </p>
    </header>

    <div class="mt-5">
      <template v-if="isGratis">
        <p class="font-satoshi text-3xl font-bold tracking-tight text-glow-text">Grátis</p>
        <p class="mt-1 font-urbanist text-xs text-glow-text-subtle">Para sempre no plano básico</p>
      </template>
      <template v-else>
        <div class="flex flex-wrap items-end gap-2">
          <p
            v-if="temDesconto"
            class="font-urbanist text-sm text-glow-text-subtle line-through"
          >
            {{ formatBRL(plano.preco) }}
          </p>
          <p class="font-satoshi text-3xl font-bold tracking-tight text-glow-text">
            {{ formatBRL(precoExibido) }}
            <span class="text-sm font-medium text-glow-text-subtle">/mês</span>
          </p>
        </div>
        <p v-if="temDesconto" class="mt-1 font-urbanist text-xs font-semibold text-glow-gold-cta">
          {{ percentualDesconto }}% off na mensalidade
        </p>
        <p v-else class="mt-1 font-urbanist text-xs text-glow-text-subtle">Cobrança mensal</p>
      </template>
    </div>

    <RouterLink
      v-if="!desabilitado"
      :to="checkoutLink"
      class="mt-5 block"
    >
      <span
        class="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl font-urbanist text-sm font-bold transition"
        :class="
          destacado
            ? 'bg-glow-gold-cta text-white shadow-glow-sm hover:brightness-95'
            : 'border border-glow-border-soft bg-glow-hover-surface text-glow-text hover:border-glow-gold hover:bg-glow-surface'
        "
      >
        Começar agora
        <ArrowRight class="size-4" aria-hidden="true" />
      </span>
    </RouterLink>
    <span
      v-else
      class="mt-5 inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-glow-border-soft bg-glow-hover-surface font-urbanist text-sm font-bold text-glow-text-subtle opacity-60"
    >
      Começar agora
    </span>

    <div class="mt-6 flex-1 border-t border-glow-border-soft pt-5">
      <p
        v-if="heranca"
        class="mb-3 font-urbanist text-xs font-semibold uppercase tracking-wide text-glow-gold-cta"
      >
        {{ heranca }}
      </p>
      <p
        v-else
        class="mb-3 font-urbanist text-xs font-semibold uppercase tracking-wide text-glow-text-subtle"
      >
        Inclui
      </p>

      <ul class="space-y-2.5">
        <li
          v-for="item in limites"
          :key="`lim-${item}`"
          class="flex items-start gap-2.5 font-urbanist text-sm text-glow-text"
        >
          <span
            class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-glow-gold/15 text-glow-gold-cta"
          >
            <Check class="size-2.5" stroke-width="3" aria-hidden="true" />
          </span>
          {{ item }}
        </li>
        <li
          v-for="item in extras"
          :key="`ext-${item}`"
          class="flex items-start gap-2.5 font-urbanist text-sm text-glow-text"
        >
          <span
            class="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-glow-gold/15 text-glow-gold-cta"
          >
            <Check class="size-2.5" stroke-width="3" aria-hidden="true" />
          </span>
          {{ item }}
        </li>
      </ul>
    </div>
  </article>
</template>
