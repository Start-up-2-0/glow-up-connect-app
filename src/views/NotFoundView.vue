<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'
import AuthSplashPanel from '@/components/auth/AuthSplashPanel.vue'
import AuthMobileBrand from '@/components/auth/AuthMobileBrand.vue'
import { useAuthStore } from '@/stores/auth.store'
import { ROUTE_PATHS } from '@/constants/routes'
import {
  GLOW_AUTH_PANEL_CLASS,
  GLOW_BUTTON_PRIMARY_CLASS,
  GLOW_LINK_CLASS,
} from '@/constants/designTokens'

const authStore = useAuthStore()
const { isAuthenticated } = storeToRefs(authStore)
</script>

<template>
  <div class="relative flex min-h-dvh bg-white">
    <AuthSplashPanel />

    <main :class="GLOW_AUTH_PANEL_CLASS">
      <div class="w-full max-w-[494px] text-center lg:text-left">
        <AuthMobileBrand />

        <p class="text-[120px] font-bold leading-none text-glow-gold">404</p>
        <h1 class="mt-4 text-[32px] font-bold text-glow-text">Página não encontrada</h1>
        <p class="mt-[5px] text-xl text-glow-text-muted">
          O endereço que você acessou não existe ou foi movido.
        </p>

        <div class="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-start">
          <RouterLink
            :to="isAuthenticated ? ROUTE_PATHS.DASHBOARD : ROUTE_PATHS.LOGIN"
            :class="[GLOW_BUTTON_PRIMARY_CLASS, 'inline-flex no-underline']"
          >
            {{ isAuthenticated ? 'Ir para o dashboard' : 'Ir para o login' }}
          </RouterLink>
          <RouterLink
            v-if="isAuthenticated"
            :to="ROUTE_PATHS.LOGIN"
            :class="[GLOW_LINK_CLASS, 'inline-flex items-center justify-center px-4 py-3']"
          >
            Sair e ir para login
          </RouterLink>
        </div>
      </div>
    </main>
  </div>
</template>
