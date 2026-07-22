<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
  showCustom?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  aplicar: []
}>()

const presets = [
  { value: 'hoje', label: 'Hoje' },
  { value: '7d', label: '7 dias' },
  { value: 'mes', label: 'Mês' },
  { value: 'custom', label: 'Personalizado' },
] as const

const visiblePresets = computed(() =>
  props.showCustom === false ? presets.filter((p) => p.value !== 'custom') : presets,
)

function select(value: string) {
  emit('update:modelValue', value)
  if (value !== 'custom') emit('aplicar')
}
</script>

<template>
  <div class="financeiro-segmented" role="group" aria-label="Período">
    <button
      v-for="preset in visiblePresets"
      :key="preset.value"
      type="button"
      class="financeiro-segmented__btn"
      :class="{ 'financeiro-segmented__btn--active': modelValue === preset.value }"
      @click="select(preset.value)"
    >
      {{ preset.label }}
    </button>
  </div>
</template>
