<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app.store'
import NavbarIconButton from './NavbarIconButton.vue'
import IconMoon from './icons/IconMoon.vue'
import IconSun from './icons/IconSun.vue'

const appStore = useAppStore()
const { isDark } = storeToRefs(appStore)
</script>

<template>
  <NavbarIconButton
    :label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
    @click="appStore.toggleTheme()"
  >
    <IconSun v-if="isDark" :size="20" />
    <IconMoon v-else :size="20" />
  </NavbarIconButton>
</template>
