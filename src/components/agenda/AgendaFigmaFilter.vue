<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

export interface AgendaFigmaFilterOption {
  value: string
  label: string
}

const props = withDefaults(
  defineProps<{
    label: string
    modelValue: string
    options?: AgendaFigmaFilterOption[]
    mode?: 'options' | 'date'
    minWidth?: string
    defaultValue?: string
    clearValue?: string
  }>(),
  {
    mode: 'options',
    options: () => [],
    minWidth: '171px',
    defaultValue: '',
    clearValue: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  apply: [value: string]
  clear: []
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const draft = ref(props.modelValue)

const triggerLabel = computed(() => {
  if (!props.modelValue || props.modelValue === props.defaultValue) return props.label
  if (props.mode === 'date') {
    const [year, month, day] = props.modelValue.split('-')
    if (year && month && day) return `${day}/${month}/${year}`
  }
  return props.options.find((option) => option.value === props.modelValue)?.label ?? props.label
})

const hasAppliedValue = computed(() => {
  if (!props.modelValue) return false
  return props.modelValue !== props.defaultValue
})

watch(
  () => props.modelValue,
  (value) => {
    if (!open.value) draft.value = value
  },
)

function toggle() {
  open.value = !open.value
  if (open.value) draft.value = props.modelValue
}

function selectOption(value: string) {
  draft.value = value
}

function apply() {
  emit('update:modelValue', draft.value)
  emit('apply', draft.value)
  open.value = false
}

function clear() {
  draft.value = props.clearValue
  emit('update:modelValue', props.clearValue)
  emit('clear')
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
  <div
    ref="rootRef"
    class="agenda-figma-filter"
    :class="{
      'agenda-figma-filter--open': open,
      'agenda-figma-filter--active': hasAppliedValue,
      'agenda-figma-filter--wide': minWidth !== '171px',
    }"
  >
    <button
      type="button"
      class="agenda-figma-filter__trigger"
      :aria-expanded="open"
      @click.stop="toggle"
    >
      <slot name="icon" />
      <span class="agenda-figma-filter__trigger-label">{{ triggerLabel }}</span>
    </button>

    <div v-if="open" class="agenda-figma-filter__panel" role="dialog" :aria-label="label">
      <div v-if="mode === 'options'" class="agenda-figma-filter__options">
        <button
          v-for="option in options"
          :key="option.value || 'all'"
          type="button"
          class="agenda-figma-filter__option"
          :class="{ 'agenda-figma-filter__option--selected': option.value === draft }"
          @click="selectOption(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <div v-else class="agenda-figma-filter__date-field">
        <input
          v-model="draft"
          type="date"
          class="agenda-figma-filter__date-input"
          :aria-label="label"
        />
      </div>

      <div class="agenda-figma-filter__divider" aria-hidden="true" />

      <div class="agenda-figma-filter__actions">
        <button type="button" class="agenda-figma-filter__apply" @click="apply">
          Aplicar
        </button>
        <button
          type="button"
          class="agenda-figma-filter__clear"
          :disabled="!draft && !hasAppliedValue"
          @click="clear"
        >
          Limpar
        </button>
      </div>
    </div>
  </div>
</template>
