<script setup lang="ts">
import { computed } from 'vue'
import { GLOW_INPUT_CLASS } from '@/constants/designTokens'
import { maskTelefoneLocal, telefoneLocalFromInput } from '@/utils/formatters'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    id?: string
    hint?: string
    error?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    autocomplete?: string
    showDdiPrefix?: boolean
    variant?: 'dashboard' | 'auth'
  }>(),
  {
    placeholder: '(79) 99191-7634',
    autocomplete: 'tel-national',
    showDdiPrefix: true,
    variant: 'dashboard',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const inputId = props.id ?? `telefone-${Math.random().toString(36).slice(2, 9)}`

const displayValue = computed(() => maskTelefoneLocal(props.modelValue))

const prefixClass = computed(() =>
  props.variant === 'auth'
    ? 'inline-flex h-[49px] shrink-0 items-center rounded-l-lg border-[0.3px] border-r-0 border-glow-text/40 bg-glow-surface px-4 font-satoshi text-sm font-medium text-glow-text-subtle'
    : 'inline-flex h-11 shrink-0 items-center rounded-l-lg border border-r-0 border-glow-border-soft bg-glow-surface px-3.5 font-urbanist text-sm font-medium text-glow-text-subtle',
)

const dashboardInputClass =
  'h-11 w-full border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm text-glow-text outline-none transition placeholder:text-glow-placeholder focus:border-glow-gold focus:ring-1 focus:ring-glow-gold disabled:cursor-not-allowed disabled:opacity-60'

const inputClass = computed(() => {
  const base = props.variant === 'auth' ? GLOW_INPUT_CLASS : dashboardInputClass
  return props.showDdiPrefix ? `${base} rounded-r-lg` : `${base} rounded-lg`
})

const allowedKeys = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'Escape',
  'Enter',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
])

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  const digits = telefoneLocalFromInput(input.value)
  emit('update:modelValue', digits)
  input.value = maskTelefoneLocal(digits)
}

function onKeydown(event: KeyboardEvent) {
  if (allowedKeys.has(event.key) || event.ctrlKey || event.metaKey) return
  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label
      v-if="label"
      :for="inputId"
      :class="
        variant === 'auth'
          ? 'font-satoshi text-sm font-normal text-zinc-800'
          : 'font-urbanist text-sm font-medium text-glow-text'
      "
    >
      {{ label }}
    </label>
    <div class="flex">
      <span v-if="showDdiPrefix" :class="prefixClass" aria-hidden="true">+55</span>
      <input
        :id="inputId"
        :value="displayValue"
        type="tel"
        inputmode="numeric"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :class="inputClass"
        @input="onInput"
        @keydown="onKeydown"
      />
    </div>
    <p v-if="hint && !error" class="font-urbanist text-xs text-glow-text-subtle">{{ hint }}</p>
    <p v-if="error" class="font-urbanist text-xs text-red-600">{{ error }}</p>
  </div>
</template>
