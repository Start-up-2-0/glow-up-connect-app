<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'

const props = withDefaults(
  defineProps<{
    label?: string
    variant?: 'gold' | 'purple' | 'outline'
    type?: 'button' | 'submit'
    to?: RouteLocationRaw
    size?: 'md' | 'sm'
  }>(),
  {
    label: 'Começar agora',
    variant: 'gold',
    type: 'button',
    size: 'md',
  },
)

const classes = computed(() => [
  'inline-flex items-center justify-center gap-2.5 rounded-[80px] font-montserrat transition hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2',
  props.size === 'md' ? 'h-[60px] px-6 text-lg font-medium' : 'h-11 px-5 text-base font-medium',
  props.variant === 'gold' && 'bg-glow-gold-cta text-white focus:ring-glow-gold-cta/50',
  props.variant === 'purple' && 'bg-glow-purple text-white focus:ring-glow-purple/50',
  props.variant === 'outline' &&
    'border border-[#282828]/50 bg-transparent text-[#282828] focus:ring-[#282828]/20',
])
</script>

<template>
  <RouterLink v-if="to" :to="to" :class="classes">
    <span>{{ label }}</span>
    <svg
      class="size-5 shrink-0 rotate-90"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </RouterLink>
  <button v-else :type="type" :class="classes">
    <span>{{ label }}</span>
    <svg
      class="size-5 shrink-0 rotate-90"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      aria-hidden="true"
    >
      <path d="M12 19V5M5 12l7-7 7 7" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
  </button>
</template>
