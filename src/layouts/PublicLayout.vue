<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { ROUTE_PATHS } from '@/constants/routes'
import { APP_NAME } from '@/constants/storageKeys'
import { authRouteWithRedirect } from '@/utils/authRedirect'

const route = useRoute()
const loginLink = computed(() => authRouteWithRedirect(ROUTE_PATHS.LOGIN, route.fullPath))
const registerLink = computed(() => authRouteWithRedirect(ROUTE_PATHS.REGISTER, route.fullPath))
</script>

<template>
  <div class="min-h-dvh bg-glow-canvas">
    <header class="border-b border-glow-border-soft bg-glow-surface">
      <div class="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 lg:px-6">
        <RouterLink to="/" class="font-urbanist text-lg font-semibold text-glow-text">
          {{ APP_NAME }}
        </RouterLink>
        <div class="flex items-center gap-3">
          <RouterLink
            :to="loginLink"
            class="text-sm font-medium text-glow-text-subtle hover:text-glow-text"
          >
            Entrar
          </RouterLink>
          <RouterLink
            :to="registerLink"
            class="rounded-lg bg-glow-gold px-4 py-2 text-sm font-medium text-white hover:brightness-95"
          >
            Criar conta
          </RouterLink>
        </div>
      </div>
    </header>
    <main class="mx-auto max-w-7xl px-4 py-8 lg:px-6 lg:py-12">
      <slot />
    </main>
  </div>
</template>
