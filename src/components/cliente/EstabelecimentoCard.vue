<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AvaliacaoNotaResumo from '@/components/avaliacao/AvaliacaoNotaResumo.vue'
import type { EstabelecimentoProximo } from '@/types/estabelecimento.types'
import { lojaDetalhePath } from '@/constants/routes'
import { formatDistanciaKm, formatEnderecoCard } from '@/utils/formatters'

defineProps<{
  item: EstabelecimentoProximo
}>()
</script>

<template>
  <RouterLink
    :to="lojaDetalhePath(item.publicGuid)"
    class="cliente-estab-card group"
  >
    <div class="cliente-estab-card__logo">
      <img
        v-if="item.logo"
        :src="item.logo"
        :alt="item.nome"
        class="size-full object-cover"
      />
      <span v-else class="cliente-estab-card__logo-fallback">
        {{ item.nome.charAt(0) }}
      </span>
    </div>

    <div class="cliente-estab-card__body">
      <div class="cliente-estab-card__title-row">
        <h2 class="cliente-estab-card__name group-hover:text-glow-text-hover">
          {{ item.nome }}
        </h2>
        <span
          v-if="item.destaqueMarketplace"
          class="cliente-estab-card__destaque"
        >
          Destaque
        </span>
      </div>

      <p class="cliente-estab-card__meta">
        <svg class="size-4 shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path
            d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.75 4.5 8.5 4.5 8.5s4.5-4.75 4.5-8.5c0-2.5-2-4.5-4.5-4.5Z"
            stroke="currentColor"
            stroke-width="1.2"
          />
          <circle cx="8" cy="6" r="1.5" fill="currentColor" />
        </svg>
        {{ formatDistanciaKm(item.distanciaKm) }}
      </p>

      <AvaliacaoNotaResumo
        v-if="item.notaMedia != null && item.totalAvaliacoes != null"
        class="cliente-estab-card__rating"
        :nota-media="item.notaMedia"
        :total-avaliacoes="item.totalAvaliacoes"
        variant="inline"
      />

      <p class="cliente-estab-card__address">
        <svg class="size-3.5 shrink-0" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M2 5.5C2 3.015 4.015 1 6.5 1S11 3.015 11 5.5c0 3.25-4.5 7.5-4.5 7.5S2 8.75 2 5.5Z"
            stroke="currentColor"
            stroke-width="1"
          />
          <circle cx="6.5" cy="5.5" r="1.5" stroke="currentColor" stroke-width="1" />
        </svg>
        <span class="truncate">{{ formatEnderecoCard(item.endereco) }}</span>
      </p>
    </div>
  </RouterLink>
</template>
