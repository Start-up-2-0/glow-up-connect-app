<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import { APP_NAME } from '@/constants/storageKeys'
import { ROUTE_PATHS } from '@/constants/routes'
import { useAppStore } from '@/stores/app.store'

const route = useRoute()
const appStore = useAppStore()

const navItems = [{ label: 'Início', to: ROUTE_PATHS.DASHBOARD }]

function isActive(path: string) {
  return route.path === path
}

function onNavigate() {
  appStore.closeSidebarOnMobile()
}
</script>

<template>
  <aside>
    <RouterLink :to="ROUTE_PATHS.DASHBOARD" @click="onNavigate">
      {{ APP_NAME }}
    </RouterLink>

    <nav>
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :aria-current="isActive(item.to) ? 'page' : undefined"
        @click="onNavigate"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
