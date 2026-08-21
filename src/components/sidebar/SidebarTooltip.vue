<script setup lang="ts">
/** Tooltip elegante para itens quando a sidebar está recolhida. */
withDefaults(
  defineProps<{
    label: string
    side?: 'right' | 'left'
  }>(),
  { side: 'right' },
)
</script>

<template>
  <span
    class="pointer-events-none absolute top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-lg px-2.5 py-1.5 font-urbanist text-xs font-medium text-white opacity-0 shadow-glow-sm transition-all duration-150 group-hover:opacity-100"
    :class="side === 'right' ? 'left-full ml-3 group-hover:translate-x-0.5' : 'right-full mr-3 group-hover:-translate-x-0.5'"
    :style="{ background: 'linear-gradient(135deg, var(--glow-gold-cta, #5b7fd4), var(--glow-gold-dark, #3e2f63))' }"
    role="tooltip"
  >
    {{ label }}
  </span>
</template>