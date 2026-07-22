<script setup lang="ts">
export interface PerfilTab {
  id: string
  label: string
  description: string
  icon: string
}

defineProps<{
  tabs: PerfilTab[]
  activeId: string
}>()

defineEmits<{
  select: [id: string]
}>()
</script>

<template>
  <div class="perfil-tabs" role="tablist" aria-label="Seções do perfil">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      type="button"
      role="tab"
      class="perfil-tabs__card"
      :class="{ 'perfil-tabs__card--active': activeId === tab.id }"
      :aria-selected="activeId === tab.id"
      @click="$emit('select', tab.id)"
    >
      <span class="perfil-tabs__icon" aria-hidden="true">{{ tab.icon }}</span>
      <span class="perfil-tabs__label">{{ tab.label }}</span>
      <span class="perfil-tabs__desc">{{ tab.description }}</span>
    </button>
  </div>
</template>
