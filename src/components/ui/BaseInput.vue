<script setup lang="ts">
import { computed } from 'vue'
import FieldMessage from '@/components/form/FieldMessage.vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    type?: string
    placeholder?: string
    error?: string
    disabled?: boolean
    id?: string
    autocomplete?: string
    hint?: string
    readonly?: boolean
  }>(),
  {
    type: 'text',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const inputId = props.id ?? `input-${Math.random().toString(36).slice(2, 9)}`

const describedBy = computed(() => {
  if (props.error) return `${inputId}-error`
  if (props.hint) return `${inputId}-hint`
  return undefined
})
</script>

<template>
  <div class="field-group">
    <label
      v-if="label"
      :for="inputId"
      class="font-urbanist text-sm font-medium text-glow-text"
    >
      {{ label }}
    </label>
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :readonly="readonly"
      :autocomplete="autocomplete"
      :aria-invalid="error ? true : undefined"
      :aria-describedby="describedBy"
      class="h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm text-glow-text outline-none transition placeholder:text-glow-placeholder focus:border-glow-gold focus:ring-1 focus:ring-glow-gold disabled:cursor-not-allowed disabled:opacity-60 read-only:cursor-default read-only:bg-glow-surface read-only:text-glow-text-subtle"
      :class="{ 'field-input--error': !!error }"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <FieldMessage
      v-if="error"
      :id="`${inputId}-error`"
      variant="error"
    >
      {{ error }}
    </FieldMessage>
    <FieldMessage
      v-else-if="hint"
      :id="`${inputId}-hint`"
      variant="hint"
    >
      {{ hint }}
    </FieldMessage>
  </div>
</template>
