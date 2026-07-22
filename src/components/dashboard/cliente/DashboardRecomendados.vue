<script setup lang="ts">
import type { EstabelecimentoProximo } from '@/types/estabelecimento.types'
import { formatNotaMediaDisplay } from '@/utils/formatNotaMediaIfood'

defineProps<{
  items: EstabelecimentoProximo[]
  loading?: boolean
}>()

defineEmits<{
  explorar: []
  agendar: [publicGuid: string]
}>()
</script>

<template>
  <section class="dashboard-recomendados">
    <div class="dashboard-recomendados__header">
      <h2 class="dashboard-recomendados__title">Recomendados para você</h2>
      <button type="button" class="dashboard-panel__link" @click="$emit('explorar')">
        Ver todos
      </button>
    </div>

    <div v-if="loading" class="dashboard-recomendados__grid">
      <div v-for="i in 3" :key="i" class="dashboard-recomendados__skeleton">
        <span class="dashboard-skeleton dashboard-skeleton--avatar" />
        <span class="dashboard-skeleton dashboard-skeleton--line" />
        <span class="dashboard-skeleton dashboard-skeleton--line dashboard-skeleton--sm" />
      </div>
    </div>

    <div v-else-if="items.length === 0" class="dashboard-recomendados__empty">
      <p class="dashboard-recomendados__empty-text">
        Ative a localização ou explore a plataforma para ver sugestões perto de você.
      </p>
      <button type="button" class="dashboard-recomendados__cta" @click="$emit('explorar')">
        Explorar lojas
      </button>
    </div>

    <div v-else class="dashboard-recomendados__grid">
      <article
        v-for="loja in items"
        :key="loja.publicGuid"
        class="dashboard-recomendados__card"
      >
        <div class="dashboard-recomendados__card-top">
          <span class="dashboard-recomendados__avatar">{{ loja.nome.charAt(0) }}</span>
          <div class="dashboard-recomendados__info">
            <p class="dashboard-recomendados__name">{{ loja.nome }}</p>
            <p class="dashboard-recomendados__meta">
              <span v-if="loja.notaMedia">★ {{ formatNotaMediaDisplay(loja.notaMedia) }}</span>
              <span v-if="loja.distanciaKm">{{ loja.distanciaKm.toFixed(1) }} km</span>
            </p>
          </div>
        </div>
        <button
          type="button"
          class="dashboard-recomendados__action"
          @click="$emit('agendar', loja.publicGuid)"
        >
          Agendar
        </button>
      </article>
    </div>
  </section>
</template>
