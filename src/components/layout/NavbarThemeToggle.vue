<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAppStore } from '@/stores/app.store'
import NavbarIconButton from './NavbarIconButton.vue'
import IconMoon from './icons/IconMoon.vue'
import IconSun from './icons/IconSun.vue'

withDefaults(
  defineProps<{
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const appStore = useAppStore()
const { isDark } = storeToRefs(appStore)
</script>

<template>
  <NavbarIconButton
    :label="isDark ? 'Ativar modo claro' : 'Ativar modo escuro'"
    :size="size"
    @click="appStore.toggleTheme()"
  >
    <IconSun v-if="isDark" :size="size === 'sm' ? 18 : 20" />
    <IconMoon v-else :size="size === 'sm' ? 18 : 20" />
  </NavbarIconButton>
</template>
