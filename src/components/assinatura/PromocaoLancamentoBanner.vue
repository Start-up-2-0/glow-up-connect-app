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
    class="rounded-2xl border border-[#e6ad01] bg-[#fff3cc] px-5 py-4 text-center shadow-[0_8px_24px_rgba(255,191,0,0.18)] lg:px-6"
    role="status"
  >
    <p class="font-montserrat text-lg font-semibold leading-snug text-[#282828]">
      <span class="text-[#a67c00]">Promoção de lançamento</span>
      <span> — {{ promocao.diasTrial }} dias grátis</span>
    </p>
    <p class="mt-1.5 font-poppins text-sm font-normal leading-relaxed text-[#282828]/85">
      Restam {{ promocao.vagasRestantes }} vagas. Cartão necessário; primeira cobrança após o período de teste.
    </p>
  </div>

  <!-- Dashboard / onboarding -->
  <div
    v-else
    class="mb-8 rounded-2xl border border-glow-gold/50 bg-[#fff8e1] px-5 py-4 text-center dark:border-glow-gold/40 dark:bg-[#3d3500] lg:px-6"
    role="status"
  >
    <p class="font-urbanist text-base font-semibold text-[#282828] dark:text-[#f3f3f3]">
      Promoção de lançamento — {{ promocao.diasTrial }} dias grátis
    </p>
    <p class="mt-1.5 text-sm text-[#282828]/75 dark:text-[#f3f3f3]/80">
      Restam {{ promocao.vagasRestantes }} vagas. Cartão necessário; primeira cobrança após o período de teste.
    </p>
  </div>
</template>
