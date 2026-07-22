<script setup lang="ts">
import type { PerfilStatusItem } from '@/utils/perfilUtils'

defineProps<{
  items: PerfilStatusItem[]
  progresso: number
  segurancaLabel?: string
}>()
</script>

<template>
  <section class="perfil-status-card">
    <div class="perfil-status-card__head">
      <div>
        <h2 class="perfil-status-card__title">Status da conta</h2>
        <p class="perfil-status-card__subtitle">
          Segurança: {{ segurancaLabel ?? 'Boa' }}
        </p>
      </div>
      <div class="perfil-status-card__progress">
        <span class="perfil-status-card__progress-label">Perfil</span>
        <div class="perfil-status-card__progress-track">
          <span class="perfil-status-card__progress-bar" :style="{ width: `${progresso}%` }" />
        </div>
        <span class="perfil-status-card__progress-value">{{ progresso }}%</span>
      </div>
    </div>
    <ul class="perfil-status-card__list">
      <li
        v-for="item in items"
        :key="item.id"
        class="perfil-status-card__item"
        :class="`perfil-status-card__item--${item.tone}`"
      >
        <span class="perfil-status-card__icon" aria-hidden="true">
          {{ item.tone === 'ok' ? '✔' : item.tone === 'warning' ? '⚠' : '○' }}
        </span>
        {{ item.label }}
      </li>
    </ul>
  </section>
</template>
