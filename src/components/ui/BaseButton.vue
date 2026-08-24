<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

withDefaults(
  defineProps<{
    variant?: Variant
    size?: Size
    loading?: boolean
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
    type: 'button',
    block: false,
  },
)

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
}

const variantClasses: Record<Variant, string> = {
  primary:
    'border-transparent bg-glow-gold-cta font-semibold text-white shadow-[0_6px_16px_rgba(82,46,95,0.18)] hover:brightness-90 focus:ring-2 focus:ring-glow-gold-cta/40',
  secondary:
    'border border-glow-border-soft bg-glow-surface font-medium text-glow-text hover:bg-glow-hover-surface focus:ring-2 focus:ring-glow-border-soft',
  danger:
    'border-transparent bg-red-600 font-medium text-white shadow-sm hover:bg-red-700 focus:ring-2 focus:ring-red-300',
  ghost:
    'border-transparent bg-transparent font-medium text-glow-text-subtle hover:bg-glow-hover-surface hover:text-glow-text focus:ring-2 focus:ring-glow-border-soft',
}
</script>

<template>
  <button
    :type="type"
    class="inline-flex items-center justify-center rounded-lg border transition-colors focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
    :class="[sizeClasses[size], variantClasses[variant], block ? 'w-full' : '']"
    :disabled="disabled || loading"
  >
    <svg
      v-if="loading"
      class="mr-2 h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <slot />
  </button>
</template>
