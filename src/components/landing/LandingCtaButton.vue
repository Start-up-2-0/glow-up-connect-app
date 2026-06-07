<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: 'gold' | 'purple' | 'outline'
    type?: 'button' | 'submit'
    to?: RouteLocationRaw
  }>(),
  {
    label: 'Começar agora!',
    variant: 'gold',
    type: 'button',
  },
)

const classes = computed(() => [
  'inline-flex items-center gap-2 rounded-full px-6 py-3 font-montserrat text-sm font-semibold transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2',
  props.variant === 'gold' && 'bg-glow-gold-cta text-white focus:ring-glow-gold-cta/50',
  props.variant === 'purple' && 'bg-glow-purple text-white focus:ring-glow-purple/50',
  props.variant === 'outline' &&
    'border-2 border-glow-purple bg-transparent text-glow-purple focus:ring-glow-purple/30',
])
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes">
    <span>{{ label }}</span>
    <svg
      class="size-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </RouterLink>
  <button v-else :type="type" :class="classes">
    <span>{{ label }}</span>
    <svg
      class="size-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path d="M5 12h14M13 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</template>
