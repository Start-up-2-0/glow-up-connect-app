<script setup lang="ts">
import type { PromocaoLancamento } from '@/types/plano.types'

defineProps<{
  promocao: PromocaoLancamento
}>()
</script>

<template>
  <div
    class="mb-8 rounded-lg border border-glow-gold/30 bg-glow-gold/10 px-4 py-4 text-center lg:px-6"
    role="status"
  >
    <p class="font-urbanist text-base font-semibold text-glow-text">
      Promoção de lançamento — {{ promocao.diasTrial }} dias grátis
    </p>
    <p class="mt-1 text-sm text-glow-text-subtle">
      Restam {{ promocao.vagasRestantes }} vagas. Cartão necessário; primeira cobrança após o período de teste.
    </p>
  </div>
</template>
