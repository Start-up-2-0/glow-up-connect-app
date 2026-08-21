<script setup lang="ts">
import { Gift } from 'lucide-vue-next'
import type { PromocaoLancamento } from '@/types/plano.types'

defineProps<{
  promocao: PromocaoLancamento
}>()
</script>

<template>
  <aside
    class="flex flex-col gap-3 rounded-2xl border border-glow-border-soft bg-glow-hover-surface px-4 py-4 sm:flex-row sm:items-center sm:gap-4 sm:px-5"
    role="status"
  >
    <span
      class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-glow-gold/15 text-glow-gold-cta"
    >
      <Gift class="size-5" aria-hidden="true" />
    </span>
    <div class="min-w-0 flex-1">
      <p class="font-satoshi text-sm font-bold text-glow-text sm:text-base">
        Promoção de lançamento —
        {{ promocao.diasTrial }} dias grátis + {{ promocao.percentualDescontoMensalidade }}% off
      </p>
      <p class="mt-0.5 font-urbanist text-xs leading-relaxed text-glow-text-subtle sm:text-sm">
        Restam {{ promocao.vagasRestantes }} vagas. Cartão necessário; a primeira cobrança já sai com
        desconto após o teste.
      </p>
    </div>
  </aside>
</template>
