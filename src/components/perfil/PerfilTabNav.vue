<script setup lang="ts">
import type { Component } from 'vue'

export interface PerfilTab {
  id: string
  label: string
  icon: Component
}

withDefaults(
  defineProps<{
    tabs: PerfilTab[]
    activeId: string
    variant?: 'embedded' | 'standalone'
    ariaLabel?: string
  }>(),
  {
    variant: 'embedded',
    ariaLabel: 'Seções do perfil',
  },
)

defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div
    class="perfil-tabs"
    :class="{ 'perfil-tabs--standalone': variant === 'standalone' }"
    role="tablist"
    :aria-label="ariaLabel"
  >
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      class="perfil-tabs__item"
      :class="{ 'perfil-tabs__item--active': activeId === tab.id }"
      :aria-selected="activeId === tab.id"
      :tabindex="activeId === tab.id ? 0 : -1"
      @click="$emit('select', tab.id)"
    >
      <component :is="tab.icon" class="perfil-tabs__icon" aria-hidden="true" />
      <span>{{ tab.label }}</span>
    </button>
  </div>
</template>
