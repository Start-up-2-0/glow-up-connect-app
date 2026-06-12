<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import AgendaFilterButton from '@/components/agenda/AgendaFilterButton.vue'

export interface AgendaFilterOption {
  value: string
  label: string
}

const props = defineProps<{
  buttonLabel: string
  options: AgendaFilterOption[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

const activeLabel = () =>
  props.options.find((option) => option.value === props.modelValue)?.label ?? props.buttonLabel

function toggle() {
  open.value = !open.value
}

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div ref="rootRef" class="relative">
    <AgendaFilterButton
      :label="modelValue ? activeLabel() : buttonLabel"
      :active="Boolean(modelValue) || open"
      @click.stop="toggle"
    >
      <template #icon>
        <slot name="icon" />
      </template>
    </AgendaFilterButton>

    <div v-if="open" class="agenda-filter-menu" role="menu">
      <button
        v-for="option in options"
        :key="option.value"
        type="button"
        role="menuitem"
        class="agenda-filter-menu__item"
        :class="{ 'agenda-filter-menu__item--active': option.value === modelValue }"
        @click="select(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
