<script setup lang="ts">
import { RouterLink } from 'vue-router'
import type { EstabelecimentoProximo } from '@/types/estabelecimento.types'
import { lojaDetalhePath } from '@/constants/routes'
import { formatDistanciaKm, formatEnderecoResumo } from '@/utils/formatters'

defineProps<{
  item: EstabelecimentoProximo
}>()
</script>

<template>
  <RouterLink
    :to="lojaDetalhePath(item.publicGuid)"
    class="group flex gap-4 rounded-lg border border-glow-border-soft bg-glow-surface p-4 transition-colors hover:border-glow-gold-dark hover:bg-glow-hover-surface"
  >
    <div
      class="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-glow-canvas"
    >
      <img
        v-if="item.logo"
        :src="item.logo"
        :alt="item.nome"
        class="size-full object-cover"
      />
      <span v-else class="font-satoshi text-lg font-bold text-glow-text-subtle">
        {{ item.nome.charAt(0) }}
      </span>
    </div>

    <div class="min-w-0 flex-1">
      <div class="flex items-start justify-between gap-2">
        <div class="flex min-w-0 flex-wrap items-center gap-2">
          <h2 class="truncate font-urbanist text-base font-semibold text-glow-text group-hover:text-glow-text-hover">
            {{ item.nome }}
          </h2>
          <span
            v-if="item.destaqueMarketplace"
            class="inline-flex shrink-0 rounded-full bg-glow-gold/15 px-2 py-0.5 font-urbanist text-xs font-medium text-glow-gold-dark"
          >
            Destaque
          </span>
        </div>
        <span class="shrink-0 font-urbanist text-xs font-medium text-glow-text-subtle">
          {{ formatDistanciaKm(item.distanciaKm) }}
        </span>
      </div>
      <p v-if="item.descricao" class="mt-1 line-clamp-2 font-urbanist text-sm text-glow-text-subtle">
        {{ item.descricao }}
      </p>
      <p class="mt-2 font-urbanist text-xs text-glow-text-subtle">
        {{ formatEnderecoResumo(item.endereco) }}
      </p>
    </div>
  </RouterLink>
</template>
