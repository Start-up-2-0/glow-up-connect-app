<script setup lang="ts">
import type { Component } from 'vue'
import { ArrowUpRight } from 'lucide-vue-next'

export interface ClienteQuickAction {
  id: string
  label: string
  description: string
  icon: Component
}

defineProps<{
  actions: ClienteQuickAction[]
}>()

const emit = defineEmits<{ action: [id: string] }>()
</script>

<template>
  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <button
      v-for="acao in actions"
      :key="acao.id"
      type="button"
      class="cliente-quick group"
      @click="emit('action', acao.id)"
    >
      <span class="cliente-quick__icon">
        <component :is="acao.icon" :size="22" :stroke-width="1.75" />
      </span>
      <span class="mt-3 block font-urbanist text-[15px] font-semibold text-glow-text">
        {{ acao.label }}
      </span>
      <span class="mt-0.5 block font-urbanist text-[12px] text-glow-text-subtle">
        {{ acao.description }}
      </span>
      <ArrowUpRight
        :size="16"
        class="cliente-quick__arrow"
        :stroke-width="2"
      />
    </button>
  </div>
</template>

<style scoped>
.cliente-quick {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  width: 100%;
  min-height: 150px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid var(--glow-border-soft);
  background: var(--glow-surface);
  box-shadow: var(--glow-shadow-sm);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}
.cliente-quick:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--glow-gold-cta) 40%, transparent);
}
.cliente-quick__icon {
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: color-mix(in srgb, var(--glow-gold-cta) 12%, transparent);
  color: var(--glow-gold-cta);
}
.cliente-quick__arrow {
  position: absolute;
  top: 16px;
  right: 16px;
  color: var(--glow-text-muted);
  transition: color 0.15s ease;
}
.cliente-quick:hover .cliente-quick__arrow {
  color: var(--glow-gold-cta);
}
</style>
