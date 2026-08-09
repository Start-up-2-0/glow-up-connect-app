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
    :aria-label="`Ver detalhes de ${item.nome}`"
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
      <h2 class="cliente-estab-card__name group-hover:text-glow-text-hover">
        {{ item.nome }}
      </h2>

      <div class="mt-1 flex flex-wrap items-center gap-1.5">
        <span
          class="inline-flex w-fit items-center rounded-md px-2 py-0.5 font-urbanist text-[11px] font-semibold"
          :class="
            item.tipoAssinatura === 'ProfissionalAutonomo'
              ? 'bg-glow-surface-tint text-glow-text'
              : 'bg-glow-canvas text-glow-text-muted'
          "
        >
          {{ item.tipoAssinatura === 'ProfissionalAutonomo' ? 'Profissional' : 'Loja' }}
        </span>
        <span
          v-if="item.categoria"
          class="inline-flex w-fit items-center rounded-full px-2 py-0.5 font-urbanist text-[11px] font-semibold text-glow-gold-cta"
          style="background: color-mix(in srgb, var(--glow-gold-cta) 12%, transparent)"
        >
          {{ item.categoria }}
        </span>
      </div>

      <p class="cliente-estab-card__meta mt-1">
        <svg class="cliente-estab-card__meta-icon" viewBox="0 0 16 16" fill="none" aria-hidden="true">
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
        class="cliente-estab-card__rating"
        :nota-media="item.notaMedia ?? 0"
        :total-avaliacoes="item.totalAvaliacoes ?? 0"
        variant="inline"
      />

      <p class="cliente-estab-card__address">
        <svg class="cliente-estab-card__address-icon" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path
            d="M2 4.5h10v7.5H2V4.5Z"
            stroke="currentColor"
            stroke-width="1"
            stroke-linejoin="round"
          />
          <path d="M4.5 4.5V3a2.5 2.5 0 0 1 5 0v1.5" stroke="currentColor" stroke-width="1" />
          <path d="M2 7h10" stroke="currentColor" stroke-width="1" />
        </svg>
        <span class="truncate">{{ formatEnderecoCard(item.endereco) }}</span>
      </p>
    </div>
  </RouterLink>
</template>
