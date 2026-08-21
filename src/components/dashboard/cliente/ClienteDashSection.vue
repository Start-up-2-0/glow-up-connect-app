<script setup lang="ts">
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <section class="cliente-dash-section">
    <div class="mb-3 flex flex-wrap items-end justify-between gap-2">
      <div class="min-w-0">
        <h2 class="font-urbanist text-[15px] font-semibold tracking-tight text-glow-text">
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="mt-0.5 font-urbanist text-[13px] text-glow-text-subtle"
        >
          {{ description }}
        </p>
      </div>
      <div v-if="$slots.action" class="shrink-0">
        <slot name="action" />
      </div>
    </div>
    <slot />
  </section>
</template>
