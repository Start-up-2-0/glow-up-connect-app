<script setup lang="ts">
import { computed } from 'vue'
import FieldMessage from '@/components/form/FieldMessage.vue'
import {
  GLOW_INPUT_CLASS,
  ONBOARDING_CONTRATAR_INPUT_CLASS,
  ONBOARDING_CONTRATAR_LABEL_CLASS,
  ONBOARDING_CONTRATAR_TELEFONE_PREFIX_CLASS,
} from '@/constants/designTokens'
import { maskTelefoneLocal, telefoneLocalFromInput, maskTelefoneUnified } from '@/utils/formatters'

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
    unified?: boolean
    variant?: 'dashboard' | 'auth' | 'contratar'
  }>(),
  {
    placeholder: '(79) 99191-7634',
    autocomplete: 'tel-national',
    showDdiPrefix: true,
    unified: false,
    variant: 'dashboard',
  },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const inputId = props.id ?? `telefone-${Math.random().toString(36).slice(2, 9)}`

const displayValue = computed(() => {
  if (props.unified) return maskTelefoneUnified(props.modelValue)
  return maskTelefoneLocal(props.modelValue)
})

const AUTH_PREFIX_CLASS =
  'inline-flex h-[54px] shrink-0 items-center rounded-l-xl border border-r-0 border-glow-border-soft bg-glow-bg-surface px-4 font-satoshi text-sm font-medium text-glow-text-subtle'

const AUTH_INPUT_CLASS =
  'h-[54px] w-full border border-glow-border-soft bg-glow-bg-surface px-4 font-satoshi text-[15px] text-glow-text placeholder:font-satoshi placeholder:text-[15px] placeholder:text-glow-placeholder outline-none transition-all duration-200 focus:border-glow-gold-dark focus:ring-2 focus:ring-glow-gold/20 disabled:cursor-not-allowed disabled:opacity-60'

const prefixClass = computed(() => {
  if (props.variant === 'contratar') return ONBOARDING_CONTRATAR_TELEFONE_PREFIX_CLASS
  if (props.variant === 'auth') return AUTH_PREFIX_CLASS
  return 'inline-flex h-11 shrink-0 items-center rounded-l-lg border border-r-0 border-glow-border-soft bg-glow-surface px-3.5 font-urbanist text-sm font-medium text-glow-text-subtle'
})

const dashboardInputClass =
  'h-11 w-full border border-glow-border-soft bg-glow-hover-surface px-3.5 font-urbanist text-sm text-glow-text outline-none transition placeholder:text-glow-placeholder focus:border-glow-gold focus:ring-1 focus:ring-glow-gold disabled:cursor-not-allowed disabled:opacity-60'

const contratarInputClass = `${ONBOARDING_CONTRATAR_INPUT_CLASS} rounded-l-none`

const inputClass = computed(() => {
  let base = dashboardInputClass
  if (props.variant === 'auth') base = AUTH_INPUT_CLASS
  if (props.variant === 'contratar') base = contratarInputClass

  let shape: string
  if (props.variant === 'auth') {
    shape = props.showDdiPrefix && !props.unified
      ? `${base} rounded-r-xl rounded-l-none`
      : `${base} rounded-xl`
  } else if (props.unified) {
    shape = `${base} rounded-lg`
  } else if (props.showDdiPrefix) {
    shape = `${base} rounded-r-lg`
  } else {
    shape = `${base} rounded-lg`
  }

  return props.error ? `${shape} field-input--error` : shape
})

const labelClass = computed(() => {
  if (props.variant === 'auth') return 'font-satoshi text-sm font-medium text-glow-text'
  if (props.variant === 'contratar') return ONBOARDING_CONTRATAR_LABEL_CLASS
  return 'font-urbanist text-sm font-medium text-glow-text'
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
  const digits = telefoneLocalFromInput(input.value)
  emit('update:modelValue', digits)
  input.value = props.unified ? maskTelefoneUnified(digits) : maskTelefoneLocal(digits)
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
      :class="labelClass"
    >
      {{ label }}
    </label>
    <div class="flex">
      <span v-if="showDdiPrefix && !props.unified" :class="prefixClass" aria-hidden="true">+55</span>
      <input
        :id="inputId"
        :value="displayValue"
        type="tel"
        inputmode="numeric"
        :placeholder="props.unified ? '+55 (79) 99191-7634' : placeholder"
        :required="required"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="describedBy"
        :class="inputClass"
        @input="onInput"
        @keydown="onKeydown"
      />
    </div>
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
