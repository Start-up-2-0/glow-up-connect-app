<script setup lang="ts">
import { computed } from 'vue'

type AlertVariant = 'success' | 'error' | 'warning' | 'info'

const props = withDefaults(
  defineProps<{
    variant?: AlertVariant
    title?: string
    dismissible?: boolean
  }>(),
  {
    variant: 'info',
    dismissible: false,
  },
)

const emit = defineEmits<{ dismiss: [] }>()

const variantClasses: Record<AlertVariant, string> = {
  info:
    'border-blue-200/80 bg-blue-50 text-blue-900 dark:border-blue-800/50 dark:bg-blue-950/35 dark:text-blue-200',
  success:
    'border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/35 dark:text-emerald-300',
  warning:
    'border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/35 dark:text-amber-200',
  error:
    'border-red-200/80 bg-red-50 text-red-800 dark:border-red-800/50 dark:bg-red-950/35 dark:text-red-300',
}

const rootClass = computed(
  () =>
    `rounded-lg border px-4 py-3 font-urbanist text-sm leading-relaxed ${variantClasses[props.variant]}`,
)
</script>

<template>
  <div role="alert" :class="rootClass">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0 flex-1">
        <p v-if="title" class="mb-1 font-semibold">{{ title }}</p>
        <slot />
      </div>
      <button
        v-if="dismissible"
        type="button"
        class="shrink-0 rounded p-0.5 opacity-70 transition hover:opacity-100"
        aria-label="Fechar"
        @click="emit('dismiss')"
      >
        &times;
      </button>
    </div>
  </div>
</template>
