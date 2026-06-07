<script setup lang="ts">
import type { BeneficioIconId } from '@/constants/landing'

defineProps<{
  name: BeneficioIconId
}>()
</script>

<template>
  <svg
    class="size-7 text-white"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <!-- Agendamento rápido -->
    <template v-if="name === 'calendar-fast'">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M13 14l-2 2 4 4" />
    </template>

    <!-- Profissionais perto de você -->
    <template v-else-if="name === 'location'">
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.5" />
    </template>

    <!-- Histórico organizado -->
    <template v-else-if="name === 'history'">
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 5.6 7.6L3 10" />
      <path d="M12 7v5l3 2" />
    </template>

    <!-- Lembretes automáticos -->
    <template v-else-if="name === 'bell'">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </template>

    <!-- Agenda inteligente -->
    <template v-else-if="name === 'calendar-smart'">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h4" />
    </template>

    <!-- Mais visibilidade -->
    <template v-else-if="name === 'visibility'">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </template>

    <!-- Gestão sem planilhas -->
    <template v-else-if="name === 'clipboard'">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" />
      <path d="M9 12h6M9 16h6M9 8h6" />
    </template>

    <!-- Comunicação integrada -->
    <template v-else-if="name === 'chat'">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 10h.01M12 10h.01M16 10h.01" />
    </template>

    <!-- Operação centralizada -->
    <template v-else-if="name === 'dashboard'">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </template>

    <!-- Controle financeiro -->
    <template v-else-if="name === 'finance'">
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
    </template>

    <!-- Módulos sob medida -->
    <template v-else-if="name === 'modules'">
      <path d="M12 2l3 3-3 3-3-3 3-3z" />
      <path d="M19 9l3 3-3 3-3-3 3-3z" />
      <path d="M5 9l3 3-3 3-3-3 3-3z" />
      <path d="M12 14l3 3-3 3-3-3 3-3z" />
    </template>

    <!-- Destaque no marketplace -->
    <template v-else-if="name === 'marketplace'">
      <path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 17l-6.3 4 2.3-7-6-4.6h7.6L12 2z" />
    </template>
  </svg>
</template>
