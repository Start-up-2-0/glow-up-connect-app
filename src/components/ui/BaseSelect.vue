<script setup lang="ts">
import { computed } from 'vue'
import FieldMessage from '@/components/form/FieldMessage.vue'

export interface SelectOption {
  value: string
  label: string
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    options: SelectOption[]
    placeholder?: string
    error?: string
    disabled?: boolean
    id?: string
    hint?: string
    required?: boolean
  }>(),
  {
    placeholder: 'Selecione…',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const selectId = props.id ?? `select-${Math.random().toString(36).slice(2, 9)}`

const describedBy = computed(() => {
  if (props.error) return `${selectId}-error`
  if (props.hint) return `${selectId}-hint`
  return undefined
})
</script>

<template>
  <div class="field-group">
    <label
      v-if="label"
      :for="selectId"
      class="font-urbanist text-sm font-medium text-glow-text"
    >
      {{ label }}
    </label>
    <select
      :id="selectId"
      :value="modelValue"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      class="h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm text-glow-text outline-none transition focus:border-glow-gold focus:ring-1 focus:ring-glow-gold disabled:cursor-not-allowed disabled:opacity-60"
      :class="{ 'field-input--error': !!error }"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="!modelValue" disabled value="">
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <FieldMessage
      v-if="error"
      :id="`${selectId}-error`"
      variant="error"
    >
      {{ error }}
    </FieldMessage>
    <FieldMessage
      v-else-if="hint"
      :id="`${selectId}-hint`"
      variant="hint"
    >
      {{ hint }}
    </FieldMessage>
  </div>
</template>
