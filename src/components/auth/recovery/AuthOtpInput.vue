<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps<{
  modelValue?: string
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  complete: [value: string]
}>()

const inputs = ref<(HTMLInputElement | null)[]>([])
const digits = ref<string[]>(Array.from({ length: 6 }, () => ''))

const code = computed(() => digits.value.join(''))

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      digits.value = Array.from({ length: 6 }, () => '')
      return
    }

    const chars = value.slice(0, 6).split('')
    digits.value = Array.from({ length: 6 }, (_, index) => chars[index] ?? '')
  },
  { immediate: true },
)

watch(code, (value) => {
  emit('update:modelValue', value)
  if (value.length === 6) {
    emit('complete', value)
  }
})

function focusInput(index: number) {
  nextTick(() => inputs.value[index]?.focus())
}

function setDigit(index: number, value: string) {
  const digit = value.replace(/\D/g, '').slice(-1)
  digits.value[index] = digit

  if (digit && index < 5) {
    focusInput(index + 1)
  }
}

function onInput(index: number, event: Event) {
  const target = event.target as HTMLInputElement
  setDigit(index, target.value)
}

function onKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !digits.value[index] && index > 0) {
    digits.value[index - 1] = ''
    focusInput(index - 1)
    event.preventDefault()
  }
}

function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasted = event.clipboardData?.getData('text').replace(/\D/g, '').slice(0, 6) ?? ''

  digits.value = Array.from({ length: 6 }, (_, index) => pasted[index] ?? '')

  if (pasted.length > 0) {
    focusInput(Math.min(pasted.length, 5))
  }
}
</script>

<template>
  <div class="flex w-full justify-between gap-2.5 sm:gap-3">
    <input
      v-for="(_, index) in 6"
      :key="index"
      :ref="(el) => (inputs[index] = el as HTMLInputElement | null)"
      :value="digits[index]"
      type="text"
      inputmode="numeric"
      maxlength="1"
      autocomplete="one-time-code"
      :disabled="disabled"
      class="size-[68px] rounded-2xl border-[0.5px] border-glow-gold bg-white text-center font-inter text-[36px] font-semibold text-glow-text outline-none transition focus:border-glow-gold focus:ring-2 focus:ring-glow-gold/30 disabled:opacity-60 sm:size-[68px]"
      @input="onInput(index, $event)"
      @keydown="onKeydown(index, $event)"
      @paste="onPaste"
    />
  </div>
</template>
