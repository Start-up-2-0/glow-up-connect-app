<script setup lang="ts">
import { ref } from 'vue'
import { useDashboardNav } from '@/composables/useDashboardNav'
import IconSearch from './icons/IconSearch.vue'

const query = ref('')
const { searchPlaceholder } = useDashboardNav()
</script>

<template>
  <div class="relative w-full">
    <label for="sidebar-search" class="sr-only">Pesquisar</label>
    <IconSearch
      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-glow-text-subtle"
      :size="18"
    />
    <input
      id="sidebar-search"
      v-model="query"
      type="search"
      :placeholder="searchPlaceholder"
      class="h-10 w-full rounded-lg border border-glow-border-soft bg-glow-bg-highlight py-2 pl-10 pr-3 font-urbanist text-sm text-glow-text placeholder:text-glow-placeholder focus:border-glow-border-accent focus:outline-none focus:ring-1 focus:ring-glow-accent-glow"
    />
  </div>
</template>
