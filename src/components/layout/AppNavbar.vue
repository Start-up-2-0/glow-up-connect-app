<script setup lang="ts">
import AppUserMenu from './AppUserMenu.vue'
import AppNotifications from './AppNotifications.vue'

defineEmits<{ toggleSidebar: [] }>()
</script>

<template>
  <header>
    <button type="button" aria-label="Alternar menu" @click="$emit('toggleSidebar')">
      Menu
    </button>
    <AppNotifications />
    <AppUserMenu />
  </header>
</template>
