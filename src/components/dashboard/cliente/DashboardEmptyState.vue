<script setup lang="ts">
import type { Component } from 'vue'
import { Sparkles } from 'lucide-vue-next'

defineProps<{
  title: string
  description?: string
  icon?: Component
}>()
</script>

<template>
  <div class="cliente-empty">
    <div class="cliente-empty__ring" aria-hidden="true">
      <component :is="icon ?? Sparkles" :size="26" :stroke-width="1.5" class="cliente-empty__icon" />
    </div>
    <h3 class="mt-3 font-urbanist text-[15px] font-semibold text-glow-text">{{ title }}</h3>
    <p v-if="description" class="mt-1 max-w-[340px] text-center font-urbanist text-[13px] leading-relaxed text-glow-text-subtle">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.cliente-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 100%;
  padding: 28px 20px;
}
.cliente-empty__ring {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 9999px;
  background: radial-gradient(circle at 30% 25%, var(--glow-gold-selected, #efe9f8), transparent 70%);
  border: 1px solid var(--glow-border-soft);
}
.cliente-empty__icon {
  color: var(--glow-gold-cta);
}
</style>