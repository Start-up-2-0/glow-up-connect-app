<script setup lang="ts">
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
</script>

<template>
  <div class="flex flex-col gap-2">
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
      class="h-11 w-full rounded-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm text-glow-text outline-none transition placeholder:text-glow-placeholder focus:border-glow-gold focus:ring-1 focus:ring-glow-gold disabled:cursor-not-allowed disabled:opacity-60 read-only:cursor-default read-only:bg-glow-surface read-only:text-glow-text-subtle"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="hint && !error" class="font-urbanist text-xs text-glow-text-subtle">{{ hint }}</p>
    <p v-if="error" class="font-urbanist text-xs text-red-600">{{ error }}</p>
  </div>
</template>
