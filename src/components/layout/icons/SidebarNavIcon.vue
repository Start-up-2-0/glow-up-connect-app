<script setup lang="ts">
import type { NavIconName } from '@/types/navIcon.types'
import IconDashboardGrid from './IconDashboardGrid.vue'

withDefaults(
  defineProps<{
    name: NavIconName
    size?: number
    class?: string
  }>(),
  { size: 22 },
)
</script>

<template>
  <IconDashboardGrid
    v-if="name === 'dashboard'"
    :size="size"
    :class="class"
  />

  <svg
    v-else
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    :class="class"
    aria-hidden="true"
  >
    <!-- home / início -->
    <template v-if="name === 'home'">
      <path
        d="M4 10.5L12 4.5L20 10.5V19.5C20 20.0523 19.5523 20.5 19 20.5H15V15.5H9V20.5H5C4.44772 20.5 4 20.0523 4 19.5V10.5Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
    </template>

    <!-- explorar lojas -->
    <template v-else-if="name === 'explore'">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.5" />
      <path d="M18.5 18.5L16 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- agenda / agendamentos -->
    <template v-else-if="name === 'calendar'">
      <rect x="4" y="5.5" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
      <path d="M8 4V7M16 4V7M4 10H20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- convites -->
    <template v-else-if="name === 'invites'">
      <rect x="4" y="6.5" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5" />
      <path d="M4 9.5L12 13.5L20 9.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
    </template>

    <!-- perfil -->
    <template v-else-if="name === 'user'">
      <circle cx="12" cy="8.5" r="3.5" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M5.5 19.5C6.6 16.5 9 15 12 15C15 15 17.4 16.5 18.5 19.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </template>

    <!-- abrir loja -->
    <template v-else-if="name === 'store-open'">
      <path
        d="M5 9.5L12 4.5L19 9.5V19.5C19 20.0523 18.5523 20.5 18 20.5H6C5.44772 20.5 5 20.0523 5 19.5V9.5Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path d="M9 20.5V13.5H15V20.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M12 8V11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path d="M10.5 9.5H13.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- serviços -->
    <template v-else-if="name === 'services'">
      <circle cx="7" cy="7.5" r="2.5" stroke="currentColor" stroke-width="1.5" />
      <circle cx="17" cy="7.5" r="2.5" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M9.2 9.5L11.2 16.5H12.8L14.8 9.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path d="M10 16.5H14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- horários -->
    <template v-else-if="name === 'clock'">
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" stroke-width="1.5" />
      <path d="M12 8V12.5L15 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </template>

    <!-- equipe / profissionais -->
    <template v-else-if="name === 'team'">
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.5" />
      <circle cx="16.5" cy="10" r="2" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M4.5 18.5C5.4 16 7.2 14.8 9 14.8C10.8 14.8 12.1 15.8 13 18.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
      <path
        d="M13.5 18.5C14.2 16.8 15.4 15.8 16.5 15.8C17.6 15.8 18.8 16.8 19.5 18.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </template>

    <!-- whatsapp -->
    <template v-else-if="name === 'whatsapp'">
      <path
        d="M12 4.5C7.85786 4.5 4.5 7.85786 4.5 12C4.5 13.55 4.95 14.99 5.75 16.2L4.5 19.5L7.95 18.35C9.1 19.05 10.5 19.5 12 19.5C16.1421 19.5 19.5 16.1421 19.5 12C19.5 7.85786 16.1421 4.5 12 4.5Z"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path
        d="M9.5 10.5C9.7 11.5 10.8 13.2 12.5 14C14.2 14.8 15.5 15 16 15"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </template>

    <!-- financeiro -->
    <template v-else-if="name === 'finance'">
      <rect x="4" y="6.5" width="16" height="12" rx="2" stroke="currentColor" stroke-width="1.5" />
      <path d="M4 10.5H20" stroke="currentColor" stroke-width="1.5" />
      <path d="M8 15.5H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- perfil estabelecimento -->
    <template v-else-if="name === 'building'">
      <path
        d="M5 19.5V9.5L12 5.5L19 9.5V19.5"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linejoin="round"
      />
      <path d="M9.5 19.5V14H14.5V19.5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
      <path d="M9 11.5H10M14 11.5H15M9 14.5H10M14 14.5H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- assinatura -->
    <template v-else-if="name === 'subscription'">
      <rect x="4" y="7" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.5" />
      <path d="M4 11H20" stroke="currentColor" stroke-width="1.5" />
      <path d="M8 15.5H11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </template>

    <!-- metas / target -->
    <template v-else-if="name === 'target'">
      <circle cx="12" cy="12" r="7.5" stroke="currentColor" stroke-width="1.5" />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" stroke-width="1.5" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <path d="M12 4.5V7M12 17V19.5M19.5 12H17M7 12H4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </template>
  </svg>
</template>
