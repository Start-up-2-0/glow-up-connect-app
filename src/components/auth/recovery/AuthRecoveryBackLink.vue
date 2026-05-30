<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'
import { GLOW_RECOVERY_BACK_LINK_CLASS } from '@/constants/designTokens'
</script>

<template>
  <RouterLink :to="ROUTE_PATHS.LOGIN" :class="GLOW_RECOVERY_BACK_LINK_CLASS">
    <svg class="size-6 shrink-0" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
    Voltar para o login
  </RouterLink>
</template>
