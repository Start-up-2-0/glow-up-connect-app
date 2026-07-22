<script setup lang="ts">
import { computed } from 'vue'
import type { PromocaoLancamento } from '@/types/plano.types'

const props = defineProps<{
  promocao: PromocaoLancamento
  variant?: 'default' | 'landing'
}>()

const isLanding = computed(() => props.variant === 'landing')
</script>

<template>
  <!-- Landing: fundo sempre claro — texto sempre escuro (ignora tema dark do app) -->
  <div
    v-if="isLanding"
    class="rounded-2xl border border-glow-gold-cta bg-glow-promo-bg-soft px-5 py-4 text-center shadow-glow-md lg:px-6"
    role="status"
  >
    <p class="font-montserrat text-lg font-semibold leading-snug text-glow-text">
      <span class="text-glow-promo-accent">Promoção de lançamento</span>
      <span> — {{ promocao.diasTrial }} dias grátis</span>
    </p>
    <p class="mt-1.5 font-poppins text-sm font-normal leading-relaxed text-glow-text/85">
      Restam {{ promocao.vagasRestantes }} vagas. Cartão necessário; primeira cobrança após o período de teste.
    </p>
  </div>

  <!-- Dashboard / onboarding -->
  <div
    v-else
    class="mb-8 rounded-2xl border border-glow-gold/50 bg-glow-promo-bg-dashboard px-5 py-4 text-center dark:border-glow-gold/40 dark:bg-glow-promo-bg-dark lg:px-6"
    role="status"
  >
    <p class="font-urbanist text-base font-semibold text-glow-text">
      Promoção de lançamento — {{ promocao.diasTrial }} dias grátis
    </p>
    <p class="mt-1.5 text-sm text-glow-text/75">
      Restam {{ promocao.vagasRestantes }} vagas. Cartão necessário; primeira cobrança após o período de teste.
    </p>
  </div>
</template>
