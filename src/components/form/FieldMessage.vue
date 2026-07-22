<script setup lang="ts">
type FieldMessageVariant = 'hint' | 'error' | 'warning'

withDefaults(
  defineProps<{
    variant?: FieldMessageVariant
    id?: string
  }>(),
  { variant: 'hint' },
)

const variantClasses: Record<FieldMessageVariant, string> = {
  hint: 'text-glow-text-subtle',
  error: 'text-red-600 dark:text-red-400',
  warning: 'text-amber-700 dark:text-amber-300',
}
</script>

<template>
  <p
    :id="id"
    class="font-urbanist text-xs leading-snug"
    :class="variantClasses[variant]"
    :role="variant === 'error' ? 'alert' : undefined"
  >
    <slot />
  </p>
</template>
