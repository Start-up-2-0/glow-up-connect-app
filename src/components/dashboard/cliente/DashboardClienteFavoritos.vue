<script setup lang="ts">
import type { DashboardFavoritoLoja, DashboardFavoritoProfissional } from '@/composables/useDashboardClienteData'

defineProps<{
  lojas: DashboardFavoritoLoja[]
  profissionais: DashboardFavoritoProfissional[]
  loading?: boolean
}>()

defineEmits<{
  explorar: []
  abrirLoja: [publicGuid: string]
}>()
</script>

<template>
  <section class="dashboard-favoritos">
    <h2 class="dashboard-favoritos__title">Favoritos</h2>
    <div class="dashboard-favoritos__grid">
      <article class="dashboard-favoritos__panel">
        <h3 class="dashboard-favoritos__panel-title">Lojas</h3>
        <div v-if="loading" class="dashboard-favoritos__skeleton">
          <span class="dashboard-skeleton dashboard-skeleton--line" />
        </div>
        <div v-else-if="lojas.length === 0" class="dashboard-favoritos__empty dashboard-favoritos__empty--compact">
          <span class="dashboard-favoritos__empty-icon">🏪</span>
          <p class="dashboard-favoritos__empty-title">Você ainda não possui favoritos</p>
          <p class="dashboard-favoritos__empty-desc">Quando favoritar uma loja, ela aparecerá aqui.</p>
          <button type="button" class="dashboard-favoritos__cta" @click="$emit('explorar')">Explorar</button>
        </div>
        <div v-else class="dashboard-favorite-grid">
          <button
            v-for="loja in lojas"
            :key="loja.id"
            type="button"
            class="dashboard-favorite-card"
            @click="$emit('abrirLoja', loja.publicGuid)"
          >
            <span class="dashboard-favorite-card__avatar">{{ loja.nome.charAt(0) }}</span>
            <span class="dashboard-favorite-card__name">{{ loja.nome }}</span>
            <span class="dashboard-favorite-card__meta">{{ loja.visitas }} visita(s)</span>
          </button>
        </div>
      </article>

      <article class="dashboard-favoritos__panel">
        <h3 class="dashboard-favoritos__panel-title">Profissionais</h3>
        <div v-if="loading" class="dashboard-favoritos__skeleton">
          <span class="dashboard-skeleton dashboard-skeleton--line" />
        </div>
        <div v-else-if="profissionais.length === 0" class="dashboard-favoritos__empty dashboard-favoritos__empty--compact">
          <span class="dashboard-favoritos__empty-icon">👨</span>
          <p class="dashboard-favoritos__empty-title">Nenhum profissional favorito</p>
          <p class="dashboard-favoritos__empty-desc">Profissionais dos seus agendamentos aparecerão aqui.</p>
        </div>
        <div v-else class="dashboard-favorite-grid">
          <div
            v-for="prof in profissionais"
            :key="prof.id"
            class="dashboard-favorite-card dashboard-favorite-card--static"
          >
            <span class="dashboard-favorite-card__avatar">{{ prof.nome.charAt(0) }}</span>
            <span class="dashboard-favorite-card__name">{{ prof.nome }}</span>
            <span class="dashboard-favorite-card__meta">{{ prof.estabelecimentoNome }}</span>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
