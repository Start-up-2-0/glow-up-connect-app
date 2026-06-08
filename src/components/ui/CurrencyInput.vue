<script setup lang="ts">
import { computed } from 'vue'
import FieldMessage from '@/components/form/FieldMessage.vue'
import { GLOW_INPUT_CLASS } from '@/constants/designTokens'
import {
  currencyCentsFromInput,
  currencyCentsToDecimal,
  decimalToCurrencyCents,
  maskCurrencyBRL,
} from '@/utils/formatters'

const props = withDefaults(
  defineProps<{
    modelValue: number
    label?: string
    id?: string
    hint?: string
    error?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    variant?: 'dashboard' | 'auth'
  }>(),
  {
    placeholder: '0,00',
    variant: 'dashboard',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: number] }>()

const inputId = props.id ?? `currency-${Math.random().toString(36).slice(2, 9)}`

const cents = computed(() => decimalToCurrencyCents(props.modelValue))
const displayValue = computed(() => maskCurrencyBRL(cents.value))

const prefixClass = computed(() =>
  props.variant === 'auth'
    ? 'inline-flex h-[49px] shrink-0 items-center rounded-l-lg border-[0.3px] border-r-0 border-glow-text/40 bg-glow-surface px-4 font-satoshi text-sm font-medium text-glow-text-subtle'
    : 'inline-flex h-11 shrink-0 items-center rounded-l-lg border border-r-0 border-glow-border-soft bg-glow-surface px-3.5 font-urbanist text-sm font-medium text-glow-text-subtle',
)

const dashboardInputClass =
  'h-11 w-full rounded-r-lg border border-glow-border-soft bg-glow-canvas px-3.5 font-urbanist text-sm text-glow-text outline-none transition placeholder:text-glow-placeholder focus:border-glow-gold focus:ring-1 focus:ring-glow-gold disabled:cursor-not-allowed disabled:opacity-60'

const inputClass = computed(() => {
  const base = props.variant === 'auth' ? GLOW_INPUT_CLASS : dashboardInputClass
  const shape = `${base} rounded-r-lg`
  return props.error ? `${shape} field-input--error` : shape
})

const describedBy = computed(() => {
  if (props.error) return `${inputId}-error`
  if (props.hint) return `${inputId}-hint`
  return undefined
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
  const nextCents = currencyCentsFromInput(input.value)
  emit('update:modelValue', currencyCentsToDecimal(nextCents))
  input.value = maskCurrencyBRL(nextCents)
}

function onKeydown(event: KeyboardEvent) {
  if (allowedKeys.has(event.key) || event.ctrlKey || event.metaKey) return
  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}
</script>

<template>
  <div class="field-group">
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
      <span :class="prefixClass" aria-hidden="true">R$</span>
      <input
        :id="inputId"
        :value="displayValue"
        type="text"
        inputmode="numeric"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
        :class="inputClass"
        @input="onInput"
        @keydown="onKeydown"
      />
    </div>
    <FieldMessage v-if="error" :id="`${inputId}-error`" variant="error">
      {{ error }}
    </FieldMessage>
    <FieldMessage v-else-if="hint" :id="`${inputId}-hint`" variant="hint">
      {{ hint }}
    </FieldMessage>
  </div>
</template>
