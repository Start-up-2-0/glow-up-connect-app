<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: number | null | undefined
  label?: string
}>()

const visivel = computed(() => props.value != null && Number.isFinite(props.value))
const positivo = computed(() => (props.value ?? 0) >= 0)

const texto = computed(() => {
  if (!visivel.value) return ''
  const abs = Math.abs(Math.round(props.value!))
  const seta = props.value! >= 0 ? '↑' : '↓'
  return `${seta} ${abs}%`
})
</script>

<template>
  <p
    v-if="visivel"
    class="dashboard-trend"
    :class="positivo ? 'dashboard-trend--up' : 'dashboard-trend--down'"
  >
    <span class="dashboard-trend__value">{{ texto }}</span>
    <span v-if="label" class="dashboard-trend__label">{{ label }}</span>
  </p>
</template>
